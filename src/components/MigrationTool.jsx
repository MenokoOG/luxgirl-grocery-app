import React, { useState } from 'react';
import { collection, getDocs, query, where, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../firebase';

export default function MigrationTool({ user }) {
    const [status, setStatus] = useState(null);

    const run = async () => {
        if (!user) { setStatus('Sign in first'); return; }
        setStatus('collecting');
        try {
            const q = query(collection(db, 'grocery-items'), where('userId', '==', user.uid));
            const snap = await getDocs(q);
            setStatus(`Found ${snap.size} items — copying...`);
            let count = 0;
            for (const d of snap.docs) {
                await addDoc(collection(db, 'migration-snapshots'), {
                    originalId: d.id,
                    owner: user.uid,
                    payload: d.data(),
                    migratedAt: serverTimestamp()
                });
                count++;
            }
            setStatus(`Copied ${count} items to migration-snapshots (originals unchanged).`);
        } catch (e) {
            console.error(e); setStatus('error');
        }
    };

    return (
        <div className="card mt-4" role="region" aria-label="Migration tool">
            <h4 className="font-semibold">Migration tool (manual)</h4>
            <div className="text-sm text-gray-400 mt-2">Copies your grocery items into a safe snapshot collection. Originals are not deleted.</div>
            <div className="mt-3">
                <button className="button-crimson" onClick={run}>Start migration</button>
            </div>
            <div className="mt-2 text-sm text-gray-400">{status}</div>
        </div>
    );
}