import React from 'react';
import { sendItemMessage } from '../api-client/firebaseSharingApi';

/**
 * SharePanel (lightweight helper)
 *
 * Props:
 * - currentUser: firebase user (must have uid)
 * - recipient: { uid, displayName, email } or null
 * - item: the item to send
 * - onSent(optional): callback after successful send
 *
 * Behavior:
 * - If no recipient, renders a hint asking to pick a recipient in the header.
 * - If recipient exists, shows a Send button that triggers sendItemMessage.
 */

export default function SharePanel({ currentUser, recipient, item, onSent }) {
    const sending = React.useRef(false);

    const doSend = async () => {
        if (!currentUser || !currentUser.uid) {
            console.warn('SharePanel: missing currentUser');
            return;
        }
        if (!recipient || !recipient.uid) {
            console.warn('SharePanel: missing recipient');
            return;
        }
        if (!item) {
            console.warn('SharePanel: missing item');
            return;
        }
        if (sending.current) return;
        sending.current = true;
        try {
            await sendItemMessage({ fromUid: currentUser.uid, toUid: recipient.uid, item });
            if (typeof onSent === 'function') onSent(item);
        } catch (e) {
            console.error('SharePanel send failed', e);
        } finally {
            sending.current = false;
        }
    };

    if (!recipient) {
        return <div className="text-sm text-gray-400">Pick a recipient above to enable sending.</div>;
    }

    return (
        <div className="flex items-center gap-2">
            <div className="text-xs text-gray-300">To: <span className="font-semibold">{recipient.displayName || recipient.email}</span></div>
            <button className="px-2 py-1 bg-indigo-700 rounded" onClick={doSend} aria-label={`Send ${item.name} to ${recipient.displayName || recipient.email}`}>Send</button>
        </div>
    );
}