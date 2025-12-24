/**
 * functions/index.js
 *
 * - onUserCreate: create users/{uid} doc when a Firebase Auth user is created
 * - lookupUser: callable function (https.onCall) to search users collection or Auth
 *
 * Security:
 * - lookupUser requires context.auth (must be signed in)
 * - lookupUser returns sanitized user objects only: { uid, email, displayName }
 *
 * NOTE:
 * - Deploy with `firebase deploy --only functions --project YOUR_PROJECT_ID`
 * - Do NOT embed service account JSON here; Firebase CLI deploy uses project permissions.
 */

const functions = require("firebase-functions");
const admin = require("firebase-admin");

admin.initializeApp(); // uses runtime credentials from the project when deployed

const db = admin.firestore();

/**
 * Create Firestore doc for Auth users (on create).
 */
exports.onUserCreate = functions.auth.user().onCreate(async (user) => {
  const { uid, email, displayName, photoURL } = user;
  const docRef = db.collection("users").doc(uid);

  const payload = {
    uid,
    email: email || null,
    displayName: displayName || null,
    photoURL: photoURL || null,
    createdAt: admin.firestore.FieldValue.serverTimestamp(),
    // add any defaults your UI expects (roles, preferences etc.)
    roles: ["family"],
  };

  try {
    await docRef.set(payload, { merge: true });
    console.log(`Created users/${uid} for new auth user ${email || uid}`);
  } catch (err) {
    console.error("onUserCreate failed for", uid, err);
  }
});

/**
 * lookupUser callable function.
 * Client calls: functions.httpsCallable(functions, 'lookupUser')({ q: 'email or name' })
 * Returns: { results: [ { uid, email, displayName } ] }
 *
 * Security: only callable by authenticated users (context.auth required).
 */
exports.lookupUser = functions.https.onCall(async (data, context) => {
  // ensure caller is authenticated
  if (!context.auth || !context.auth.uid) {
    throw new functions.https.HttpsError(
      "unauthenticated",
      "Request must be authenticated."
    );
  }

  const qRaw = data && data.q ? String(data.q).trim() : "";
  if (!qRaw) return { results: [] };

  const qLower = qRaw.toLowerCase();

  const results = [];

  try {
    // 1) Search Firestore users collection by email exact match or displayName partial
    // Exact email match (fast)
    const byEmail = await db
      .collection("users")
      .where("email", "==", qLower)
      .limit(10)
      .get();
    if (!byEmail.empty) {
      byEmail.forEach((doc) => {
        const d = doc.data();
        results.push({
          uid: d.uid,
          email: d.email,
          displayName: d.displayName || null,
        });
      });
    }

    // 2) Partial displayName match: simple prefix match using >= and < trick
    // (Firestore doesn't have contains; this is a reasonable approach for small dataset)
    if (results.length < 10) {
      const start = qLower;
      const end = qLower + "\uf8ff";
      const nameQuery = await db
        .collection("users")
        .where("displayNameLower", ">=", start)
        .where("displayNameLower", "<=", end)
        .limit(10 - results.length)
        .get();

      nameQuery.forEach((doc) => {
        const d = doc.data();
        // dedupe by uid
        if (!results.find((r) => r.uid === d.uid)) {
          results.push({
            uid: d.uid,
            email: d.email,
            displayName: d.displayName || null,
          });
        }
      });
    }

    // 3) If no results and query looks like an email, try Admin Auth lookup (getUserByEmail)
    const looksLikeEmail = /\S+@\S+\.\S+/.test(qLower);
    if (results.length === 0 && looksLikeEmail) {
      try {
        const authUser = await admin.auth().getUserByEmail(qLower);
        // return minimal sanitized object (do not return sensitive fields)
        results.push({
          uid: authUser.uid,
          email: authUser.email || null,
          displayName: authUser.displayName || null,
        });
      } catch (err) {
        // not found in Auth either -> ignore
      }
    }

    // Return results (limit for safety)
    return { results: results.slice(0, 20) };
  } catch (err) {
    console.error("lookupUser error", err);
    throw new functions.https.HttpsError(
      "internal",
      "Lookup failed - check logs."
    );
  }
});
