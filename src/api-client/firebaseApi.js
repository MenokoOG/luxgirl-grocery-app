import { getAuth, signInWithPopup, signOut, onAuthStateChanged } from 'firebase/auth';
import { collection, addDoc, getDocs, updateDoc, deleteDoc, doc, query, where } from 'firebase/firestore';
import { googleProvider, db } from '../firebase';

export const signInWithGoogle = async () => {
  const auth = getAuth();
  const result = await signInWithPopup(auth, googleProvider);
  return result.user;
};

export const signOutUser = async () => {
  const auth = getAuth();
  await signOut(auth);
};

export const getUserState = (callback) => {
  const auth = getAuth();
  return onAuthStateChanged(auth, callback);
};

export const fetchGroceryItems = async (userId) => {
  const q = query(collection(db, "grocery-items"), where("userId", "==", userId));
  const querySnapshot = await getDocs(q);
  return querySnapshot.docs.map(doc => ({ ...doc.data(), id: doc.id }));
};

export const addGroceryItem = async (item) => {
  await addDoc(collection(db, "grocery-items"), item);
};

export const updateGroceryItem = async (id, updatedFields) => {
  const itemDoc = doc(db, "grocery-items", id);
  await updateDoc(itemDoc, updatedFields);
};

export const deleteGroceryItem = async (id) => {
  await deleteDoc(doc(db, "grocery-items", id));
};
