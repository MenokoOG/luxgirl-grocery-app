import React, { useState } from 'react';
import { fetchPendingMessagesForUser, acceptItemMessage, rejectItemMessage } from '../api-client/firebaseSharingApi';

export default function Inbox({ user }) {
    const [messages, setMessages] = useState([]);
    const [loading, setLoading] = useState(false);

    const load = async () => {
        setLoading(true);
        try {
            const ms = await fetchPendingMessagesForUser(user.uid);
            setMessages(ms);
        } catch (e) {
            console.error('Inbox load', e);
        } finally {
            setLoading(false);
        }
    };

    const accept = async (id) => {
        try {
            await acceptItemMessage({ messageId: id, recipientUid: user.uid });
            setMessages(prev => prev.filter(m => m.id !== id));
        } catch (e) {
            console.error('accept failed', e);
        }
    };

    const reject = async (id) => {
        try {
            await rejectItemMessage({ messageId: id, recipientUid: user.uid });
            setMessages(prev => prev.filter(m => m.id !== id));
        } catch (e) {
            console.error('reject failed', e);
        }
    };

    return (
        <div className="card">
            <div className="flex justify-between items-center">
                <h4 className="font-semibold">Inbox</h4>
                <button className="px-2 py-1 bg-indigo-700 rounded" onClick={load}>{loading ? 'Checking...' : 'Check messages'}</button>
            </div>

            <div className="mt-3">
                {messages.length === 0 ? <div className="text-sm text-gray-400">No pending messages</div> : (
                    <ul className="space-y-3">
                        {messages.map(m => (
                            <li key={m.id} className="p-3 bg-panel border border-[#132029] rounded">
                                <div className="flex justify-between">
                                    <div>
                                        <div className="font-semibold">{m.payload.name}</div>
                                        <div className="text-xs text-gray-500 mt-1">From: {m.from}</div>
                                        {m.payload.websiteUrl && <div className="text-xs"><a className="text-indigo-400" href={m.payload.websiteUrl} target="_blank" rel="noreferrer">{m.payload.websiteUrl}</a></div>}
                                    </div>
                                    <div className="flex flex-col gap-2">
                                        <button className="px-3 py-1 bg-green-600 rounded" onClick={() => accept(m.id)}>Accept</button>
                                        <button className="px-3 py-1 bg-red-600 rounded" onClick={() => reject(m.id)}>Reject</button>
                                    </div>
                                </div>
                            </li>
                        ))}
                    </ul>
                )}
            </div>
        </div>
    );
}
