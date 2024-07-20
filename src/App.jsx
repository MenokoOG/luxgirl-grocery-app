import React, { useState, useEffect } from 'react';
import GroceryList from './components/GroceryList';
import Auth from './components/Auth';
import { getUserState } from './api-client/firebaseApi';
import { useTheme } from './context/ThemeContext';

function App() {
  const [user, setUser] = useState(null);
  const { isDarkTheme, toggleTheme } = useTheme();

  useEffect(() => {
    const unsubscribe = getUserState(setUser);
    return () => unsubscribe();
  }, []);

  return (
    <div className={`min-h-screen p-4 ${isDarkTheme ? 'bg-gray-dark text-white' : 'bg-gray-light text-black'}`}>
      <header className="flex justify-between items-center mb-8">
        <h1 className="text-4xl font-bold text-center flex-grow">Grocery and Shopping List App</h1>
        <button 
          onClick={toggleTheme} 
          className="bg-indigo p-2 rounded ml-4"
        >
          Toggle Theme
        </button>
      </header>
      <div className="flex justify-center mb-8">
        <Auth />
      </div>
      {user ? (
        <GroceryList user={user} />
      ) : (
        <p className="text-center">
          Please sign in to manage your grocery list.
        </p>
      )}
    </div>
  );
}

export default App;
