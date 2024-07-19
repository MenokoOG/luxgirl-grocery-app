// src/App.jsx
import React, { useState, useEffect } from 'react';
import GroceryList from './components/GroceryList';
import Auth from './components/Auth';
import { getAuth, onAuthStateChanged } from 'firebase/auth';

function App() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const auth = getAuth();
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
    });
    return () => unsubscribe();
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-r from-teal-light to-teal-dark p-4">
      <header className="text-center text-white text-4xl font-bold mb-8">
        Grocery and Shopping List App
      </header>
      <div className="flex justify-center mb-8">
        <Auth />
      </div>
      {user ? (
        <GroceryList user={user} />
      ) : (
        <p className="text-center text-white">
          Please sign in to manage your grocery list.
        </p>
      )}
    </div>
  );
}

export default App;
