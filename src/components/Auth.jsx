import React, { useEffect, useState } from 'react';
import { signInWithGoogle, signOutUser, onUserStateChanged } from '../api-client/firebaseApi';

export default function Auth() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const unsub = onUserStateChanged(u => setUser(u));
    return () => unsub();
  }, []);

  return (
    <div className="card" role="region" aria-label="Account">
      {!user ? (
        <div>
          <h3 className="text-lg font-semibold">Sign in</h3>
          <div className="mt-3">
            <button
              className="button-crimson"
              onClick={async () => { try { await signInWithGoogle(); } catch (e) { console.error(e); } }}
              aria-label="Sign in with Google"
            >
              Sign in with Google
            </button>
          </div>
        </div>
      ) : (
        <div className="flex items-center gap-3" role="region" aria-label="Signed in user">
          <img src={user.photoURL || ''} alt="" className="w-10 h-10 rounded-full" />
          <div>
            <div className="font-semibold">{user.displayName}</div>
            <div className="text-xs text-gray-400">{user.email}</div>
            <div className="mt-2">
              <button className="px-3 py-1 bg-gray-700 rounded" onClick={async () => { try { await signOutUser(); } catch (e) { console.error(e); } }} aria-label="Sign out">Sign out</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}