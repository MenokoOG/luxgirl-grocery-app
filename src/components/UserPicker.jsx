// src/components/UserPicker.jsx
// Full-file replacement
//
// Props:
//  - onSelect(user)    optional; called with user object when a result is chosen
//  - placeholder       optional input placeholder
//  - autoFocus         optional boolean
//
// Behavior:
//  - Performs exact email match first, then name prefix search (server-side via Firestore).
//  - Calls onSelect(user) when user presses Select.
//  - If onSelect is not provided, copies the user's email to clipboard as fallback and shows a small info message.
//  - Accessible: input accepts Enter key to search, results are keyboard focusable and Select buttons have aria-labels.

import React, { useState } from "react";
import { searchUsers } from "../api-client/firebaseSharingApi";

export default function UserPicker({ onSelect, placeholder = "Search users by email or name", autoFocus = false }) {
    const [term, setTerm] = useState("");
    const [results, setResults] = useState([]);
    const [status, setStatus] = useState("idle"); // idle | searching | error
    const [info, setInfo] = useState(null);

    async function doSearch() {
        const q = (term || "").trim();
        setInfo(null);
        if (!q) {
            setResults([]);
            setStatus("idle");
            return;
        }

        setStatus("searching");
        try {
            const hits = await searchUsers(q, 12);
            setResults(hits || []);
            setStatus("idle");
            if (!hits || hits.length === 0) setInfo("No results");
        } catch (err) {
            console.error("[UserPicker] searchUsers error", err);
            setResults([]);
            setStatus("error");
            setInfo("Search failed — check console");
        }
    }

    async function handleSelect(user) {
        if (!user) return;
        try {
            if (typeof onSelect === "function") {
                // call provided callback
                onSelect(user);
                setInfo(`Selected ${user.displayName || user.email || user.uid}`);
                // keep results visible so user can pick again if needed
                return;
            }

            // fallback: copy email (or uid) to clipboard
            const toCopy = (user.email || user.uid || "");
            if (!toCopy) {
                setInfo("No contact info to copy");
                return;
            }

            if (navigator.clipboard && navigator.clipboard.writeText) {
                await navigator.clipboard.writeText(toCopy);
                setInfo(`Copied ${toCopy} to clipboard`);
                console.warn("[UserPicker] onSelect not provided — copied to clipboard:", toCopy);
            } else {
                // legacy fallback
                const t = document.createElement("input");
                t.value = toCopy;
                document.body.appendChild(t);
                t.select();
                document.execCommand("copy");
                document.body.removeChild(t);
                setInfo(`Copied ${toCopy} to clipboard (fallback)`);
                console.warn("[UserPicker] onSelect not provided — fallback copy:", toCopy);
            }
        } catch (err) {
            console.error("[UserPicker] handleSelect error", err);
            setInfo("Action failed — see console");
        }
    }

    return (
        <div className="card" aria-live="polite">
            <div className="flex gap-2 items-center">
                <input
                    autoFocus={autoFocus}
                    value={term}
                    onChange={(e) => setTerm(e.target.value)}
                    onKeyDown={(e) => { if (e.key === "Enter") doSearch(); }}
                    placeholder={placeholder}
                    aria-label="Search users"
                    className="input-dark flex-1"
                />
                <button
                    type="button"
                    className="px-3 py-1 bg-indigo-700 rounded"
                    onClick={doSearch}
                    disabled={status === "searching"}
                    aria-label="Find users"
                >
                    {status === "searching" ? "Searching…" : "Find"}
                </button>
            </div>

            <div className="mt-3">
                {status === "error" && <div className="text-red-400 text-sm">Search failed.</div>}
                {results.length === 0 && info && <div className="text-sm text-gray-400">{info}</div>}

                {results.length > 0 && (
                    <ul role="list" className="space-y-2" aria-label="User search results">
                        {results.map((u) => (
                            <li
                                key={u.uid || u.email || Math.random()}
                                className="p-2 bg-panel border border-[#132029] rounded flex items-center justify-between"
                                tabIndex="0"
                                aria-label={u.displayName ? `${u.displayName} ${u.email ? `(${u.email})` : ""}` : (u.email || u.uid)}
                            >
                                <div>
                                    <div className="font-semibold">{u.displayName || "(no name)"}</div>
                                    <div className="text-xs text-gray-400">{u.email || u.uid}</div>
                                </div>

                                <div>
                                    <button
                                        type="button"
                                        className="px-3 py-1 bg-crimson rounded text-white"
                                        onClick={() => handleSelect(u)}
                                        aria-label={`Select ${u.displayName || u.email || u.uid}`}
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