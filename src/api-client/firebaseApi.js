// src/api-client/firebaseApi.js
import { auth, db, googleProvider } from "../firebase";
import { signInWithPopup, signOut } from "firebase/auth";
import {
  collection,
  query,
  where,
  getDocs,
  addDoc,
  updateDoc,
  doc,
  deleteDoc,
  serverTimestamp,
  setDoc,
} from "firebase/firestore";

/**
 * Utility: normalize email for consistent storage and queries
 */
function normalizeEmail(e) {
  if (!e) return "";
  return String(e).trim().toLowerCase();
}

/* Auth helpers */
export async function signInWithGoogle() {
  const res = await signInWithPopup(auth, googleProvider);
  const user = res.user;
  const normalized = normalizeEmail(user.email);

  // create/merge users/{uid} doc so others can find by email
  try {
    await setDoc(
      doc(db, "users", user.uid),
      {
        uid: user.uid,
        displayName: user.displayName || null,
        email: user.email || null,
        emailNormalized: normalized || null,
        photoURL: user.photoURL || null,
        updatedAt: serverTimestamp(),
      },
      { merge: true }
    );
  } catch (e) {
    console.error("ensure profile failed", e);
  }
  return user;
}

export async function signOutUser() {
  return signOut(auth);
}

export function onUserStateChanged(cb) {
  return auth.onAuthStateChanged ? auth.onAuthStateChanged(cb) : () => {};
}

/* Grocery operations */
export async function fetchGroceryItems(userId) {
  const q = query(
    collection(db, "grocery-items"),
    where("userId", "==", userId)
  );
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
}

export async function addGroceryItem(item) {
  await addDoc(collection(db, "grocery-items"), {
    ...item,
    createdAt: serverTimestamp(),
  });
}

export async function updateGroceryItem(id, fields) {
  await updateDoc(doc(db, "grocery-items", id), fields);
}

export async function deleteGroceryItem(id) {
  await deleteDoc(doc(db, "grocery-items", id));
}
