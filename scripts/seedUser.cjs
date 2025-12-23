// scripts/seedUser.cjs
// Full file — CommonJS. Usage:
//   GOOGLE_APPLICATION_CREDENTIALS=./scripts/serviceAccountKey.json node scripts/seedUser.cjs
// On Windows PowerShell:
//   $env:GOOGLE_APPLICATION_CREDENTIALS="./scripts/serviceAccountKey.json"; node scripts/seedUser.cjs

const path = require("path");
const fs = require("fs");

let admin;
try {
  admin = require("firebase-admin");
} catch (err) {
  console.error(
    "firebase-admin is not installed. Run: npm install firebase-admin --save"
  );
  process.exit(1);
}

const SERVICE_KEY_PATH =
  process.env.GOOGLE_APPLICATION_CREDENTIALS ||
  path.join(__dirname, "serviceAccountKey.json");

if (!fs.existsSync(SERVICE_KEY_PATH)) {
  console.error(`Service account key not found at: ${SERVICE_KEY_PATH}`);
  console.error(
    "Download a service account JSON from Firebase Console -> Project Settings -> Service accounts -> Generate new private key"
  );
  process.exit(1);
}

const serviceAccount = require(SERVICE_KEY_PATH);

try {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
  });
} catch (e) {
  // avoid "initializeApp called multiple times" causing crash if re-running without restarting
  console.warn("Warning initializing firebase-admin:", e.message || e);
}

const db = admin.firestore();

const userToSeed = {
  uid: "QECZPxyPFAMMRFYbdtQNLiCYlBM2",
  displayName: "Nicole North",
  email: "nicalenorth@gmail.com",
  photoURL: "",
  // any other fields you want persisted on users/{uid}
  // note: serverTimestamp() will be evaluated on server
  updatedAt: admin.firestore.FieldValue.serverTimestamp(),
  seededAt: admin.firestore.FieldValue.serverTimestamp(),
};

(async () => {
  try {
    const docRef = db.doc(`users/${userToSeed.uid}`);
    await docRef.set(
      {
        uid: userToSeed.uid,
        displayName: userToSeed.displayName,
        email: userToSeed.email,
        photoURL: userToSeed.photoURL,
        updatedAt: userToSeed.updatedAt,
        seededAt: userToSeed.seededAt,
      },
      { merge: true }
    );

    console.log("✅ User document created/merged at users/%s", userToSeed.uid);
    // optionally print the document path
    console.log("Document path: users/" + userToSeed.uid);
    process.exit(0);
  } catch (err) {
    console.error("❌ Seed failed:", err);
    process.exit(1);
  }
})();
