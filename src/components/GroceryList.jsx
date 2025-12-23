import React, { useEffect, useState } from 'react';
import { fetchGroceryItems, addGroceryItem, updateGroceryItem, deleteGroceryItem } from '../api-client/firebaseApi';
import { sendItemMessage } from '../api-client/firebaseSharingApi';
import UserPicker from './UserPicker';
import SharePanel from './SharePanel';

/**
 * Full replacement GroceryList.jsx
 * - buttons use semantic .btn-* classes defined in index.css
 * - inline edit is preserved (edit input appears inline)
 * - top-level UserPicker as recipient selector
 */

export default function GroceryList({ user }) {
  const [items, setItems] = useState([]);
  const [name, setName] = useState('');
  const [selectedRecipient, setSelectedRecipient] = useState(null);
  const [editingId, setEditingId] = useState(null);
  const [editingName, setEditingName] = useState('');
  const [selectedForSend, setSelectedForSend] = useState(new Set());
  const [loading, setLoading] = useState(false);

  const load = async () => {
    if (!user) return;
    setLoading(true);
    try {
      const it = await fetchGroceryItems(user.uid);
      setItems(it);
    } catch (e) {
      console.error('load items error', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { if (user) load(); }, [user]);

  const addOrUpdateTop = async () => {
    if (!name.trim()) return;
    setLoading(true);
    try {
      await addGroceryItem({ name, imageUrl: '', websiteUrl: '', userId: user.uid, completed: false });
      setName('');
      await load();
    } catch (e) {
      console.error('addOrUpdateTop error', e);
    } finally {
      setLoading(false);
    }
  };

  /* Inline edit handlers */
  const startEdit = (item) => {
    setEditingId(item.id);
    setEditingName(item.name);
    // optional: focus management can be added by ref if needed
  };

  const saveEdit = async (id) => {
    if (!editingName.trim()) return;
    try {
      await updateGroceryItem(id, { name: editingName });
      setEditingId(null);
      setEditingName('');
      await load();
    } catch (e) {
      console.error('saveEdit error', e);
      alert('Failed to save edit — see console.');
    }
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditingName('');
  };

  const remove = async (id) => {
    try {
      await deleteGroceryItem(id);
      setItems(prev => prev.filter(i => i.id !== id));
    } catch (e) {
      console.error('remove error', e);
      alert('Failed to remove item. See console.');
    }
  };

  /* Sharing utilities */
  const sendItemToRecipient = async (item) => {
    if (!user || !user.uid) { alert('Sign in first'); return; }
    if (!selectedRecipient || !selectedRecipient.uid) { alert('Select a recipient first'); return; }
    try {
      await sendItemMessage({ fromUid: user.uid, toUid: selectedRecipient.uid, item });
      console.debug('Sent item', item.id, 'to', selectedRecipient.uid);
      // optional: visual ack (toast) could be added here
    } catch (e) {
      console.error('sendItemToRecipient error', e);
      alert('Failed to send item. See console.');
    }
  };

  const sendWholeList = async () => {
    if (!user || !user.uid) { alert('Sign in first'); return; }
    if (!selectedRecipient || !selectedRecipient.uid) { alert('Select a recipient first.'); return; }
    if (!items || items.length === 0) { alert('No items to send'); return; }

    const confirmMsg = `Send ${items.length} items to ${selectedRecipient.displayName || selectedRecipient.email}?`;
    if (!window.confirm(confirmMsg)) return;

    try {
      for (const it of items) {
        await sendItemMessage({ fromUid: user.uid, toUid: selectedRecipient.uid, item: it });
      }
      alert('List sent.');
    } catch (e) {
      console.error('sendWholeList error', e);
      alert('Failed to send list. See console.');
    }
  };

  const toggleSelect = (id) => {
    setSelectedForSend(prev => {
      const n = new Set(prev);
      if (n.has(id)) n.delete(id); else n.add(id);
      return n;
    });
  };

  const sendSelected = async () => {
    if (!selectedRecipient || !selectedRecipient.uid) { alert('Select a recipient first.'); return; }
    if (selectedForSend.size === 0) { alert('No items selected.'); return; }
    try {
      for (const id of selectedForSend) {
        const item = items.find(i => i.id === id);
        if (item) await sendItemMessage({ fromUid: user.uid, toUid: selectedRecipient.uid, item });
      }
      alert('Selected items sent.');
      setSelectedForSend(new Set());
    } catch (e) {
      console.error('sendSelected error', e);
      alert('Failed to send selected items. See console.');
    }
  };

  return (
    <div>
      <div className="card mb-4">
        <div className="flex flex-col md:flex-row md:items-center gap-3">
          <div className="flex-1 w-full">
            <div className="flex gap-2 items-center">
              <input
                value={name}
                onChange={e => setName(e.target.value)}
                className="input-dark flex-1"
                placeholder="Add item (top)"
                aria-label="Add new item"
              />
              <button className="btn btn-primary" onClick={addOrUpdateTop} aria-label="Add item">Add</button>
            </div>

            <div className="mt-3">
              <div className="text-xs text-gray-400">Find recipient to share with:</div>
              <div className="mt-2">
                <UserPicker onSelect={(u) => setSelectedRecipient(u)} placeholder="Find family member by name or email" />
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-2 md:items-end">
            <div className="text-sm text-gray-300">Recipient:</div>
            <div className="p-2 bg-[#06121a] border border-[#132029] rounded flex items-center gap-3">
              {selectedRecipient ? (
                <>
                  <div>
                    <div className="font-semibold">{selectedRecipient.displayName || '(no name)'}</div>
                    <div className="text-xs text-gray-400">{selectedRecipient.email}</div>
                  </div>
                  <div className="ml-4 flex flex-col gap-2">
                    <button className="btn btn-primary" onClick={() => sendWholeList()}>Send whole list</button>
                    <button className="btn btn-secondary" onClick={() => { setSelectedRecipient(null); }}>Clear</button>
                    <button className="btn btn-primary" onClick={() => sendSelected()}>Send selected</button>
                  </div>
                </>
              ) : (
                <div className="text-sm text-gray-400">No recipient selected</div>
              )}
            </div>
          </div>
        </div>
      </div>

      <div id="print-area" className="space-y-3" role="list" aria-label="Grocery items">
        {loading && <div className="text-sm text-gray-400">Loading…</div>}
        {!loading && items.length === 0 && <div className="card text-sm text-gray-400">No items yet</div>}

        {items.map(item => {
          const isEditing = editingId === item.id;
          return (
            <div key={item.id} className="card flex flex-col md:flex-row md:items-center justify-between gap-3" role="listitem" tabIndex="0" aria-label={item.name}>
              <div className="flex items-center gap-3 w-full">
                <input type="checkbox" checked={selectedForSend.has(item.id)} onChange={() => toggleSelect(item.id)} aria-label={`Select ${item.name} for sending`} />
                <div className="flex-1">
                  {isEditing ? (
                    <div className="flex gap-2 items-center">
                      <input value={editingName} onChange={e => setEditingName(e.target.value)} className="input-dark flex-1" aria-label="Edit item name" />
                      <button className="btn btn-success" onClick={() => saveEdit(item.id)}>Save</button>
                      <button className="btn btn-muted" onClick={cancelEdit}>Cancel</button>
                    </div>
                  ) : (
                    <>
                      <div className="font-semibold">{item.name}</div>
                      {item.originFromUid && <div className="text-xs text-gray-500">From: {item.originFromUid}</div>}
                    </>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-2">
                <SharePanel currentUser={user} recipient={selectedRecipient} item={item} onSent={() => { /* optional ack handler */ }} />

                {/* Inline edit button (when not editing) */}
                {!isEditing && (
                  <button className="btn btn-secondary" onClick={() => startEdit(item)} aria-label={`Edit ${item.name}`}>Edit</button>
                )}

                <button className="btn btn-danger" onClick={() => remove(item.id)} aria-label={`Remove ${item.name}`}>Remove</button>

                {/* per-item send -> uses selectedRecipient */}
                <button
                  className="btn btn-primary"
                  onClick={() => sendItemToRecipient(item)}
                  aria-label={`Send ${item.name} to selected recipient`}
                >
                  Send
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}