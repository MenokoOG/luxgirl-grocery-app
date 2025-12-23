/**
 * scripts/seedUser.js
 *
 * Usage (recommended - set GOOGLE_APPLICATION_CREDENTIALS):
 *   export GOOGLE_APPLICATION_CREDENTIALS="/path/to/serviceAccountKey.json"
 *   node scripts/seedUser.js
 *
 * Or specify key file and overrides:
 *   node scripts/seedUser.js --key ./serviceAccountKey.json --uid QECZP... --email nicalenorth@gmail.com --displayName "Nic" --force
 *
 * Options:
 *   --key <path>           path to service account JSON (if GOOGLE_APPLICATION_CREDENTIALS not set)
 *   --uid <uid>            user UID (defaults to the UID you provided)
 *   --email <email>        email address (defaults to daughter's email)
 *   --displayName <name>   display name (defaults to "Nic")
 *   --force                overwrite existing document if present
 *
 * This script will:
 *  - initialize Firebase Admin using service account
 *  - check if users/{uid} exists
 *  - create the document if missing, or update (merge) unless --force is omitted
 *
 * Note: This script modifies Firestore. Run with correct credentials and project.
 */

const fs = require("fs");
const path = require("path");
const admin = require("firebase-admin");

function parseArgs() {
  const args = process.argv.slice(2);
  const out = {};
  for (let i = 0; i < args.length; i++) {
    const a = args[i];
    if (a === "--key" && args[i + 1]) {
      out.key = args[++i];
      continue;
    }
    if (a === "--uid" && args[i + 1]) {
      out.uid = args[++i];
      continue;
    }
    if (a === "--email" && args[i + 1]) {
      out.email = args[++i];
      continue;
    }
    if (a === "--displayName" && args[i + 1]) {
      out.displayName = args[++i];
      continue;
    }
    if (a === "--force") {
      out.force = true;
      continue;
    }
    if (a === "--help" || a === "-h") {
      out.help = true;
    }
  }
  return out;
}

function showHelpAndExit() {
  console.log(`
Usage:
  Set GOOGLE_APPLICATION_CREDENTIALS or pass --key path/to/serviceAccountKey.json

Examples:
  # recommended: use env var
  export GOOGLE_APPLICATION_CREDENTIALS="/home/me/keys/serviceAccountKey.json"
  node scripts/seedUser.js

  # or provide key and override
  node scripts/seedUser.js --key ./serviceAccountKey.json \\
    --uid QECZPxyPFAMMRFYbdtQNLiCYlBM2 \\
    --email nicalenorth@gmail.com \\
    --displayName "Nic" \\
    --force

Flags:
  --key <path>           Path to the service account JSON when GOOGLE_APPLICATION_CREDENTIALS is not set.
  --uid <uid>            UID for the user document (defaults to girl's UID).
  --email <email>        Email to store (defaults to girl's email).
  --displayName <name>   Display name (defaults to "Nic").
  --force                If set, overwrite existing doc (use with caution).
`);
  process.exit(0);
}

async function main() {
  const args = parseArgs();
  if (args.help) return showHelpAndExit();

  // defaults (from your message)
  const DEFAULT_UID = "QECZPxyPFAMMRFYbdtQNLiCYlBM2";
  const DEFAULT_EMAIL = "nicalenorth@gmail.com";
  const DEFAULT_DISPLAYNAME = "Nic";

  const uid = args.uid || DEFAULT_UID;
  const email = args.email || DEFAULT_EMAIL;
  const displayName = args.displayName || DEFAULT_DISPLAYNAME;
  const force = !!args.force;

  // Initialize admin SDK
  // Priority:
  // 1) GOOGLE_APPLICATION_CREDENTIALS env var (recommended)
  // 2) --key <path> argument
  // 3) If running in GCP environment with default service account, admin.initializeApp() will work without creds.
  try {
    if (process.env.GOOGLE_APPLICATION_CREDENTIALS) {
      console.log(
        "Using GOOGLE_APPLICATION_CREDENTIALS:",
        process.env.GOOGLE_APPLICATION_CREDENTIALS
      );
      admin.initializeApp(); // picks up GOOGLE_APPLICATION_CREDENTIALS
    } else if (args.key) {
      const keyPath = path.resolve(args.key);
      if (!fs.existsSync(keyPath)) {
        console.error("Service account key file not found at:", keyPath);
        process.exit(2);
      }
      const serviceAccount = require(keyPath);
      admin.initializeApp({
        credential: admin.credential.cert(serviceAccount),
      });
      console.log("Initialized Firebase Admin with key:", keyPath);
    } else {
      // try default initialization (may work on GCP / Cloud Functions)
      admin.initializeApp();
      console.log(
        "Initialized Firebase Admin with default credentials (environment)."
      );
    }
  } catch (err) {
    console.error(
      "Failed to initialize Firebase Admin SDK:",
      err.message || err
    );
    console.error(
      "Make sure GOOGLE_APPLICATION_CREDENTIALS is set or use --key /path/to/serviceAccountKey.json"
    );
    process.exit(3);
  }

  const db = admin.firestore();

  const docRef = db.collection("users").doc(uid);

  try {
    const snap = await docRef.get();
    if (snap.exists && !force) {
      console.log(
        `Document users/${uid} already exists. Use --force to overwrite (merge update runs by default).`
      );
      console.log(
        "Existing document data:",
        JSON.stringify(snap.data(), null, 2)
      );
      // We'll merge by default (update) to ensure minimal disruption:
      const mergeData = {
        uid,
        email,
        displayName,
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
        seededBy: "seedUser.js",
      };
      await docRef.set(mergeData, { merge: true });
      console.log(
        "Merged provided fields into existing document (no destructive overwrite)."
      );
      process.exit(0);
    }

    // Create or overwrite
    const payload = {
      uid,
      email,
      displayName,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      seededBy: "seedUser.js",
      // add any other default fields your app expects here:
      profileComplete: true,
      preferences: {
        darkMode: true,
      },
    };

    await docRef.set(payload, { merge: false });
    console.log(`Created users/${uid} document successfully.`);
    console.log("Document payload (serverTimestamp stored for createdAt):", {
      uid,
      email,
      displayName,
    });

    // Optional: Check whether a corresponding Auth user exists (informational only)
    try {
      const authUser = await admin.auth().getUser(uid);
      console.log("Auth user found for UID (no changes made):", {
        uid: authUser.uid,
        email: authUser.email,
        displayName: authUser.displayName,
      });
    } catch (authErr) {
      if (authErr.code === "auth/user-not-found") {
        console.warn(
          "Auth user not found for UID. The user exists in Auth according to your earlier message, but admin SDK could not find it."
        );
        console.warn(
          "If you expect the auth user to exist, verify the project credentials used by this script match the project where user is registered."
        );
      } else {
        console.warn(
          "Could not query Auth for UID (non-fatal):",
          authErr.message || authErr
        );
      }
    }

    console.log("Done.");
    process.exit(0);
  } catch (err) {
    console.error("Error while writing users document:", err);
    process.exit(4);
  }
}

main();
