import React, { useState } from 'react';
import Header from './components/Header';
import Auth from './components/Auth';
import GroceryList from './components/GroceryList';
import Inbox from './components/Inbox';
import MigrationTool from './components/MigrationTool';
import { onUserStateChanged } from './api-client/firebaseApi';
import { useTheme } from './context/ThemeContext';

export default function App() {
  const [user, setUser] = useState(null);
  const { isDark, toggle } = useTheme();

  React.useEffect(() => {
    const unsub = onUserStateChanged(u => setUser(u));
    return () => unsub();
  }, []);

  return (
    <div className="min-h-screen p-4 sm:p-6 max-w-4xl mx-auto">
      <Header />

      <div className="flex justify-end mb-4">
        <button
          className="px-3 py-1 bg-gray-700 rounded"
          onClick={toggle}
          aria-pressed={isDark}
          aria-label="Toggle color theme"
          title="Toggle theme"
        >
          {isDark ? 'Switch to Light' : 'Switch to Dark'}
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <main className="md:col-span-2 space-y-4">
          <Auth />
          {user ? (
            <>
              <GroceryList user={user} />
              <MigrationTool user={user} />
            </>
          ) : (
            <div className="card">Sign in to manage your grocery list, share items, and check Inbox.</div>
          )}
        </main>

        <aside>
          {user ? <Inbox user={user} /> : <div className="card">Inbox requires sign-in</div>}
        </aside>
      </div>
    </div>
  );
}