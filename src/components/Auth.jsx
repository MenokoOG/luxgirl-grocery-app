import React, { useState, useEffect } from 'react';
import { signInWithGoogle, signOutUser, getUserState } from '../api-client/firebaseApi';

function Auth() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const unsubscribe = getUserState(setUser);
    return () => unsubscribe();
  }, []);

  const handleGoogleSignIn = async () => {
    try {
      const user = await signInWithGoogle();
      setUser(user);
    } catch (error) {
      console.error("Error signing in with Google:", error.message);
    }
  };

  const handleSignOut = async () => {
    await signOutUser();
    setUser(null);
  };

  return (
    <div className="flex flex-col items-center bg-gray-light dark:bg-gray-800 p-6 rounded-lg shadow-lg form-container">
      {!user ? (
        <div className="w-full">
          <h2 className="text-2xl font-bold mb-4 text-indigo dark:text-indigo-400">Sign In</h2>
          <button
            onClick={handleGoogleSignIn}
            className="w-full bg-teal text-white p-2 rounded hover:bg-teal-dark transition flex items-center justify-center"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 48 48"
              width="24px"
              height="24px"
              className="mr-2"
            >
              <path fill="#4285F4" d="M44.5,20H24v8.5h11.8C34.8,34.6,30,39,24,39c-6.6,0-12-5.4-12-12s5.4-12,12-12c3.1,0,5.9,1.2,8,3.1l6.4-6.4C34.2,6.7,29.3,4.5,24,4.5c-10.7,0-19.5,8.8-19.5,19.5S13.3,43.5,24,43.5c10.2,0,18.8-7.8,19.5-18H44.5z" />
              <path fill="#34A853" d="M6.9,14.1L13.6,19c1.5-4.1,5.4-7,10.4-7c3.1,0,5.9,1.2,8,3.1l6.4-6.4C34.2,6.7,29.3,4.5,24,4.5C15.4,4.5,8,10.4,6.9,14.1z" />
              <path fill="#FBBC05" d="M24,43.5c5.5,0,10.2-2.1,13.8-5.6l-6.4-6.4c-2.2,1.9-5,3.1-8,3.1c-5.3,0-9.8-3.6-11.4-8.5l-6.7,5.3C8,37.3,15.4,43.5,24,43.5z" />
              <path fill="#EA4335" d="M43.5,24c0-0.8-0.1-1.6-0.2-2.4H24v8.5h11.8C34.8,34.6,30,39,24,39c-6.6,0-12-5.4-12-12s5.4-12,12-12c3.1,0,5.9,1.2,8,3.1l6.4-6.4C34.2,6.7,29.3,4.5,24,4.5c-10.7,0-19.5,8.8-19.5,19.5S13.3,43.5,24,43.5c10.2,0,18.8-7.8,19.5-18H44.5z" />
            </svg>
            Sign In with Google
          </button>
        </div>
      ) : (
        <div className="w-full">
          <h2 className="text-2xl font-bold mb-4 text-indigo dark:text-indigo-400">Welcome, {user.displayName}</h2>
          <button
            onClick={handleSignOut}
            className="w-full bg-red-500 text-white p-2 rounded hover:bg-red-700 transition"
          >
            Sign Out
          </button>
        </div>
      )}
    </div>
  );
}

export default Auth;
