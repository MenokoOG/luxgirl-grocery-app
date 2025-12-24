// src/api-client/firebaseApi.js
// Full-file replacement for client-only Firebase logic.
// - Initializes Firebase app (reads config from environment or window.__FIREBASE_CONFIG__ fallback)
// - Exports: auth, db, onUserStateChanged(callback), ensureUserDocument(user)
// - onUserStateChanged will upsert users/{uid} in Firestore on sign-in (client-side upsert).
//
// How to use:
// import { onUserStateChanged } from './api-client/firebaseApi';
// const unsub = onUserStateChanged(user => { /* set user state in app */ });
// unsub() to unsubscribe.
//
// NOTE: Replace the firebaseConfig object below with your project's config or
// ensure it's available via process.env or window.__FIREBASE_CONFIG__.

import { initializeApp, getApps } from "firebase/app";
import {
  getAuth,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  updateProfile,
} from "firebase/auth";
import {
  getFirestore,
  doc,
  setDoc,
  serverTimestamp,
  getDoc,
  query,
  collection,
  where,
  getDocs,
  limit,
} from "firebase/firestore";

/**
 * Provide your Firebase config here if you don't have it injected in env.
 * If you prefer environment variables, replace these values with process.env.*.
 */
const firebaseConfig = (typeof window !== "undefined" &&
  window.__FIREBASE_CONFIG__) || {
  apiKey: "REPLACE_WITH_YOURS",
  authDomain: "REPLACE_WITH_YOURS",
  projectId: "REPLACE_WITH_YOURS",
  // other fields optional (storageBucket, messagingSenderId, appId)
};

if (!firebaseConfig || !firebaseConfig.projectId) {
  console.warn(
    "Firebase config missing -- ensure firebaseConfig is set or window.__FIREBASE_CONFIG__ is provided."
  );
}

// initialize app singleton
if (!getApps().length) {
  initializeApp(firebaseConfig);
}

const auth = getAuth();
const db = getFirestore();

/**
 * ensureUserDocument
 * - Writes a minimal users/{uid} profile document on sign-in
 * - Writes displayNameLower to enable case-insensitive prefix searches
 * - Uses merge to avoid clobbering any existing fields set by other clients
 */
export async function ensureUserDocument(user) {
  if (!user || !user.uid) return;
  try {
    const uid = user.uid;
    const email = (user.email || "").toLowerCase() || null;
    const displayName = user.displayName || null;
    const docRef = doc(db, "users", uid);

    // Prepare payload
    const payload = {
      uid,
      email,
      displayName,
      displayNameLower: displayName ? displayName.toLowerCase() : null,
      photoURL: user.photoURL || null,
      // note: client can't set real serverTimestamp, but Firestore SDK provides serverTimestamp
      createdAt: serverTimestamp(),
    };

    await setDoc(docRef, payload, { merge: true });
    // intentionally no return; callers can read the doc if needed
  } catch (err) {
    console.error("ensureUserDocument error", err);
  }
}

/**
 * onUserStateChanged(callback)
 * - callback receives either user object (Firebase user) or null
 * - this function also upserts users/{uid} on sign-in (client-side)
 */
export function onUserStateChanged(cb) {
  if (typeof cb !== "function") {
    throw new Error("onUserStateChanged requires a callback function");
  }

  const unsub = onAuthStateChanged(auth, async (user) => {
    try {
      if (user) {
        // Ensure Firestore profile is present for search and UserPicker
        // We do this on the client (safe) so your users collection is populated.
        await ensureUserDocument(user);
      }
    } catch (e) {
      console.error("onUserStateChanged ensureUserDocument failed", e);
    } finally {
      // call the app callback with the auth user (or null)
      cb(user);
    }
  });

  return unsub;
}

/**
 * Small convenience helpers you probably already use:
 */
export async function signIn(email, password) {
  return signInWithEmailAndPassword(auth, email, password);
}
export async function signUp(email, password, displayName) {
  const res = await createUserWithEmailAndPassword(auth, email, password);
  if (displayName) {
    try {
      await updateProfile(res.user, { displayName });
    } catch (e) {
      /* ignore */
    }
    // ensure doc updated with displayName
    await ensureUserDocument(res.user);
  }
  return res;
}
export async function signOutUser() {
  return signOut(auth);
}

/**
 * A simple helper to search users collection by email or displayName prefix.
 * This is a short client-only search function (no Cloud Functions).
 * Important: Firestore queries are case-sensitive; we use displayNameLower field written above.
 *
 * usage: await searchUsers('nicalenorth@gmail.com') -> returns [{ uid, email, displayName }]
 */
export async function searchUsers(q, limitCount = 10) {
  const qStr = (q || "").trim().toLowerCase();
  if (!qStr) return [];

  const results = [];

  // 1) exact email match
  try {
    const col = collection(db, "users");
    const emailQ = query(col, where("email", "==", qStr), limit(limitCount));
    const snapEmail = await getDocs(emailQ);
    if (!snapEmail.empty) {
      snapEmail.forEach((d) => {
        const data = d.data();
        results.push({
          uid: data.uid,
          email: data.email,
          displayName: data.displayName,
        });
      });
      return results;
    }
  } catch (err) {
    // ignore and try name search
  }

  // 2) prefix search on displayNameLower
  try {
    const col = collection(db, "users");
    const start = qStr;
    const end = qStr + "\uf8ff";
    const nameQ = query(
      col,
      where("displayNameLower", ">=", start),
      where("displayNameLower", "<=", end),
      limit(limitCount)
    );
    const snapName = await getDocs(nameQ);
    snapName.forEach((d) => {
      const data = d.data();
      results.push({
        uid: data.uid,
        email: data.email,
        displayName: data.displayName,
      });
    });
  } catch (err) {
    console.error("searchUsers error", err);
  }

  return results;
}

export { auth, db };
