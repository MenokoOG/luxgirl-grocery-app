import { db } from "../firebase";
import {
  collection,
  addDoc,
  query,
  where,
  getDocs,
  doc,
  updateDoc,
  serverTimestamp,
  getDoc,
} from "firebase/firestore";

/**
 * findUserByEmail(email)
 * - exact email lookup (fast)
 */
export async function findUserByEmail(email) {
  if (!email) return null;
  const q = query(collection(db, "users"), where("email", "==", email));
  const snap = await getDocs(q);
  if (snap.empty) return null;
  const d = snap.docs[0].data();
  return { uid: d.uid, displayName: d.displayName, email: d.email };
}

/**
 * searchUsers(q)
 * - flexible search: if q looks like an email we try equality first.
 * - fallback: fetch a page of users and filter client-side by displayName/email includes q.
 * - returns: [{ uid, displayName, email }]
 */
export async function searchUsers(q) {
  const raw = (q || "").trim();
  if (!raw) return [];
  // If it looks like an email, try an exact lookup first
  if (raw.includes("@")) {
    const exact = await findUserByEmail(raw);
    return exact ? [exact] : [];
  }

  // Otherwise, try a prefix query if you have indexed fields (Firestore doesn't do contains).
  // Safe fallback: fetch first N users and filter client-side.
  try {
    const usersRef = collection(db, "users");
    const snap = await getDocs(usersRef); // small/medium apps OK; pagination could be added
    const ql = raw.toLowerCase();
    const hits = snap.docs
      .map((d) => d.data())
      .filter((u) => {
        const name = (u.displayName || "").toLowerCase();
        const email = (u.email || "").toLowerCase();
        return name.includes(ql) || email.includes(ql);
      })
      .slice(0, 30) // safety cap
      .map((u) => ({ uid: u.uid, displayName: u.displayName, email: u.email }));
    return hits;
  } catch (e) {
    console.error("searchUsers error", e);
    return [];
  }
}

/**
 * Messaging helpers
 */

export async function sendItemMessage({ fromUid, toUid, item }) {
  if (!fromUid || !toUid || !item)
    throw new Error("missing args to sendItemMessage");
  const r = await addDoc(collection(db, "messages"), {
    from: fromUid,
    to: toUid,
    type: "item-share",
    payload: {
      name: item.name,
      imageUrl: item.imageUrl || null,
      websiteUrl: item.websiteUrl || null,
      originalItemId: item.id || null,
    },
    status: "pending",
    createdAt: serverTimestamp(),
  });
  return r.id;
}

export async function fetchPendingMessagesForUser(uid) {
  if (!uid) return [];
  const q = query(
    collection(db, "messages"),
    where("to", "==", uid),
    where("status", "==", "pending")
  );
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
}

export async function acceptItemMessage({ messageId, recipientUid }) {
  const mRef = doc(db, "messages", messageId);
  const mSnap = await getDoc(mRef);
  if (!mSnap.exists()) throw new Error("Message not found");
  const m = mSnap.data();
  if (m.to !== recipientUid) throw new Error("not authorized");

  // clone into grocery-items
  await addDoc(collection(db, "grocery-items"), {
    name: m.payload.name,
    imageUrl: m.payload.imageUrl || "",
    websiteUrl: m.payload.websiteUrl || "",
    userId: recipientUid,
    createdAt: serverTimestamp(),
    completed: false,
    originMessageId: messageId,
    originFromUid: m.from,
  });

  await updateDoc(mRef, { status: "accepted", acceptedAt: serverTimestamp() });
  return true;
}

export async function rejectItemMessage({ messageId, recipientUid }) {
  const mRef = doc(db, "messages", messageId);
  const mSnap = await getDoc(mRef);
  if (!mSnap.exists()) throw new Error("Message not found");
  const m = mSnap.data();
  if (m.to !== recipientUid) throw new Error("not authorized");

  await updateDoc(mRef, { status: "rejected", rejectedAt: serverTimestamp() });
  return true;
}
