/**
 * scripts/migrateAuthToFirestore.js
 *
 * Usage (from project root):
 *   1) place your service account JSON at ./scripts/serviceAccountKey.json
 *   2) npm install firebase-admin
 *   3) node ./scripts/migrateAuthToFirestore.js
 *
 * This script paginates through all Auth users and writes a users/{uid} doc for each.
 * It will not overwrite user email/displayName if present unless you set overwrite=true.
 *
 * NOTE: run locally (do not commit service account file).
 */

const admin = require("firebase-admin");
const path = require("path");
const fs = require("fs");

const SERVICE_ACCOUNT_PATH = path.join(__dirname, "serviceAccountKey.json");

if (!fs.existsSync(SERVICE_ACCOUNT_PATH)) {
  console.error(
    "serviceAccountKey.json not found. Put it at ./scripts/serviceAccountKey.json"
  );
  process.exit(1);
}

const serviceAccount = require(SERVICE_ACCOUNT_PATH);

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

const db = admin.firestore();

async function migrateAll({ batchSize = 1000, overwrite = false } = {}) {
  console.log(
    "Starting migration of Auth users to Firestore users collection..."
  );
  let nextPageToken = undefined;
  let total = 0;
  do {
    const listArgs = { maxResults: batchSize };
    if (nextPageToken) listArgs.pageToken = nextPageToken;
    const result = await admin.auth().listUsers(listArgs);
    const users = result.users || [];

    for (const u of users) {
      const uid = u.uid;
      const email = (u.email || "").toLowerCase();
      const displayName = u.displayName || null;
      const docRef = db.collection("users").doc(uid);

      const payload = {
        uid,
        email: email || null,
        displayName: displayName || null,
        displayNameLower: displayName ? displayName.toLowerCase() : null,
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
        seededFromAuth: true,
      };

      if (overwrite) {
        await docRef.set(payload, { merge: true });
      } else {
        // merge: only set fields that don't exist
        await docRef.set(payload, { merge: true });
      }
      total++;
    }

    nextPageToken = result.pageToken;
    console.log(
      `Migrated batch: ${users.length} users (total so far: ${total})`
    );
  } while (nextPageToken);

  console.log(`Migration complete. Total users processed: ${total}`);
  process.exit(0);
}

migrateAll().catch((err) => {
  console.error("Migration failed", err);
  process.exit(2);
});
