import React, { useState } from 'react';
import { searchUsers } from '../api-client/firebaseSharingApi';

/**
 * UserPicker (full file, tolerant)
 * Props:
 *  - onSelect(user)  -> called when user selects a result (user = { uid, displayName, email })
 *  - placeholder
 *
 * This component performs a search and renders selectable results.
 * It is defensive if onSelect is not provided (it copies to clipboard).
 */

export default function UserPicker({ onSelect, placeholder = 'Search users by email or name' }) {
    const [searchTerm, setSearchTerm] = useState('');
    const [results, setResults] = useState([]);
    const [status, setStatus] = useState('idle');
    const [info, setInfo] = useState(null);

    const doSearch = async () => {
        const q = (searchTerm || '').trim();
        if (!q) {
            setResults([]);
            setInfo(null);
            return;
        }
        setStatus('searching');
        setInfo(null);
        try {
            const hits = await searchUsers(q);
            setResults(hits || []);
            setStatus('idle');
            if (!hits || hits.length === 0) setInfo('No results');
        } catch (err) {
            console.error('[UserPicker] search error', err);
            setResults([]);
            setStatus('error');
            setInfo('Search failed — check console.');
        }
    };

    const handleSelect = async (u) => {
        if (!u) return;
        try {
            if (typeof onSelect === 'function') {
                onSelect(u);
                setInfo(`Selected ${u.displayName || u.email}`);
                return;
            }

            // fallback: copy email to clipboard
            console.warn('[UserPicker] onSelect not provided — copying email to clipboard');
            if (navigator.clipboard && u.email) {
                await navigator.clipboard.writeText(u.email);
                setInfo(`Copied ${u.email} to clipboard`);
            } else {
                // basic fallback
                const t = document.createElement('input');
                t.value = u.email || u.uid || '';
                document.body.appendChild(t);
                t.select();
                document.execCommand('copy');
                document.body.removeChild(t);
                setInfo(`Copied ${u.email || u.uid} to clipboard (fallback)`);
            }
        } catch (e) {
            console.error('[UserPicker] select fallback error', e);
            setInfo('Action failed — see console');
        }
    };

    return (
        <div className="card" aria-live="polite">
            <div className="flex gap-2 items-center">
                <input
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder={placeholder}
                    className="input-dark flex-1"
                    aria-label="Search users"
                    onKeyDown={(e) => { if (e.key === 'Enter') doSearch(); }}
                />
                <button className="px-3 py-1 bg-indigo-700 rounded" onClick={doSearch} type="button">
                    {status === 'searching' ? 'Searching…' : 'Find'}
                </button>
            </div>

            <div className="mt-3">
                {status === 'error' && <div className="text-red-400 text-sm">Search failed.</div>}
                {results.length === 0 && info && <div className="text-sm text-gray-400">{info}</div>}

                {results.length > 0 && (
                    <ul role="list" className="space-y-2" aria-label="User search results">
                        {results.map(u => (
                            <li key={u.uid} className="p-2 bg-panel border border-[#132029] rounded flex items-center justify-between" tabIndex="0">
                                <div>
                                    <div className="font-semibold">{u.displayName || '(no name)'}</div>
                                    <div className="text-xs text-gray-400">{u.email}</div>
                                </div>
                                <div>
                                    <button
                                        className="px-3 py-1 bg-crimson rounded text-white"
                                        onClick={() => handleSelect(u)}
                                        type="button"
                                        aria-label={`Select ${u.displayName || u.email}`}
                                    >
                                        Select
                                    </button>
                                </div>
                            </li>
                        ))}
                    </ul>
                )}
            </div>

            {info && <div className="mt-2 text-xs text-gray-300" role="status">{info}</div>}
        </div>
    );
}