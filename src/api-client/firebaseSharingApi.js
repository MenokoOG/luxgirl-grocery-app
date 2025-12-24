// src/api-client/firebaseSharingApi.js
// Full-file replacement
//
// Exports:
//  - searchUsers(q, limitCount)   // re-exported from firebaseApi.js
//  - sendItemMessage({ fromUid, toUid, item, note })
//
// Implementation notes:
//  - Uses Firestore to write a 'sharedMessages' record for sending items between users.
//  - This is client-side only; ensure your Firestore rules allow authenticated users to write to this collection,
//    or adapt to a per-user subcollection if you prefer (e.g. users/{toUid}/inbox).
//
// Usage example:
//  import { searchUsers, sendItemMessage } from '../api-client/firebaseSharingApi';
//  const results = await searchUsers('nicalenorth');
//  await sendItemMessage({ fromUid: currentUid, toUid: recipientUid, item });

import { addDoc, collection, serverTimestamp } from "firebase/firestore";
import { db, searchUsers as searchUsersFromApi } from "./firebaseApi";

/**
 * Re-export the searchUsers helper from firebaseApi for convenience.
 * This ensures other components can import from *this* module and avoid circular import confusion.
 */
export async function searchUsers(q, limitCount = 10) {
  return searchUsersFromApi(q, limitCount);
}

/**
 * sendItemMessage
 * - fromUid: string (sender uid)
 * - toUid: string (recipient uid)
 * - item: object (an item object, minimally should include id and name)
 * - note: optional string message
 *
 * Writes a document into 'sharedMessages' with sender, recipient, item payload and timestamp.
 * Returns the created document id on success.
 */
export async function sendItemMessage({ fromUid, toUid, item, note = null }) {
  if (!fromUid || !toUid || !item) {
    throw new Error("sendItemMessage requires fromUid, toUid, and item");
  }

  try {
    const payload = {
      fromUid,
      toUid,
      // normalize item snapshot (avoid keeping large objects)
      item: {
        id: item.id || item.itemId || null,
        name: item.name || item.title || "",
        originFromUid: item.originFromUid || null,
        // keep the raw item only if small; prefer to store references otherwise
        raw: item && Object.keys(item).length <= 12 ? item : undefined,
      },
      note: note || null,
      createdAt: serverTimestamp(),
      // optional client-side hint for delivery status
      status: "sent",
    };

    const colRef = collection(db, "sharedMessages");
    const docRef = await addDoc(colRef, payload);

    console.debug("sendItemMessage: created", docRef.id, "payload:", payload);

    return docRef.id;
  } catch (err) {
    console.error("sendItemMessage error", err);
    throw err;
  }
}

/**
 * Convenience: sendMultipleItems
 * - sends multiple items sequentially (keeps behavior deterministic)
 */
export async function sendMultipleItems({ fromUid, toUid, items = [] }) {
  if (!Array.isArray(items) || items.length === 0) return [];
  const created = [];
  for (const it of items) {
    const id = await sendItemMessage({ fromUid, toUid, item: it });
    created.push(id);
  }
  return created;
}

export default {
  searchUsers,
  sendItemMessage,
  sendMultipleItems,
};
