# Grocery and Shopping List App

This application is a grocery and shopping list manager that uses Firebase for authentication and Firestore for data storage. Users can sign in with Google, manage their grocery items, and toggle between light and dark themes.

## Features

- **Google Authentication**: Sign in and out using Google.
- **Grocery Item Management**: Add, update, delete, and search for grocery items.
- **Dark Mode Support**: Toggle between light and dark themes.

## Tech Stack

- **Frontend**: React, Tailwind CSS
- **Backend**: Firebase Authentication, Firestore
- **State Management**: React Context API
- **Hosting**: (Specify your hosting service)

## Getting Started

Follow these steps to set up and run the application locally.

### Prerequisites

- Node.js and npm installed
- Firebase project set up with Firestore and Authentication enabled

### Installation

1. Clone the repository:

   ```bash
   git clone <repository-url>
   cd <repository-directory>
   ```

2. Install dependencies:

   ```bash
   npm install
   ```

3. Set up Firebase:

   - Create a `.env` file in the root directory with your Firebase configuration:

     ```env
     VITE_FIREBASE_API_KEY=your-api-key
     VITE_FIREBASE_AUTH_DOMAIN=your-auth-domain
     VITE_FIREBASE_PROJECT_ID=your-project-id
     VITE_FIREBASE_STORAGE_BUCKET=your-storage-bucket
     VITE_FIREBASE_MESSAGING_SENDER_ID=your-messaging-sender-id
     VITE_FIREBASE_APP_ID=your-app-id
     ```

### Running the Application

1. Start the development server:

   ```bash
   npm run dev
   ```

2. Open your browser and navigate to `http://localhost:3000`.

## Firebase Configuration

Create a `src/firebase.js` file to initialize Firebase:

```javascript
import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const googleProvider = new GoogleAuthProvider();

export { auth, db, googleProvider };
```

## Authentication

### Sign In with Google

```javascript
import { getAuth, signInWithPopup } from 'firebase/auth';
import { googleProvider } from '../firebase';

export const signInWithGoogle = async () => {
  const auth = getAuth();
  const result = await signInWithPopup(auth, googleProvider);
  return result.user;
};
```

### Sign Out

```javascript
import { getAuth, signOut } from 'firebase/auth';

export const signOutUser = async () => {
  const auth = getAuth();
  await signOut(auth);
};
```

### User State

```javascript
import { getAuth, onAuthStateChanged } from 'firebase/auth';

export const getUserState = (callback) => {
  const auth = getAuth();
  return onAuthStateChanged(auth, callback);
};
```

## Firestore Operations

### Fetch Grocery Items

```javascript
import { collection, getDocs, query, where } from 'firebase/firestore';
import { db } from '../firebase';

export const fetchGroceryItems = async (userId) => {
  const q = query(collection(db, "grocery-items"), where("userId", "==", userId));
  const querySnapshot = await getDocs(q);
  return querySnapshot.docs.map(doc => ({ ...doc.data(), id: doc.id }));
};
```

### Add Grocery Item

```javascript
import { collection, addDoc } from 'firebase/firestore';
import { db } from '../firebase';

export const addGroceryItem = async (item) => {
  await addDoc(collection(db, "grocery-items"), item);
};
```

### Update Grocery Item

```javascript
import { updateDoc, doc } from 'firebase/firestore';
import { db } from '../firebase';

export const updateGroceryItem = async (id, updatedFields) => {
  const itemDoc = doc(db, "grocery-items", id);
  await updateDoc(itemDoc, updatedFields);
};
```

### Delete Grocery Item

```javascript
import { deleteDoc, doc } from 'firebase/firestore';
import { db } from '../firebase';

export const deleteGroceryItem = async (id) => {
  await deleteDoc(doc(db, "grocery-items", id));
};
```

## Tailwind CSS Configuration

Add the following to your `tailwind.config.js`:

```javascript
module.exports = {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  darkMode: 'class', // Enable dark mode support
  theme: {
    extend: {
      colors: {
        teal: {
          light: '#81e6d9',
          DEFAULT: '#319795',
          dark: '#2c7a7b',
        },
        amber: {
          light: '#f6e05e',
          DEFAULT: '#d69e2e',
          dark: '#b7791f',
        },
        gray: {
          light: '#f7fafc',
          DEFAULT: '#a0aec0',
          dark: '#4a5568',
        },
        indigo: {
          light: '#c3dafe',
          DEFAULT: '#5a67d8',
          dark: '#434190',
        },
      },
    },
  },
  plugins: [],
};
```

## Additional Styling for Dark Mode

Add the following to your CSS:

```css
@tailwind base;
@tailwind components;
@tailwind utilities;

body.dark {
  background-color: #1a202c;
  color: #cbd5e0;
}

body.light {
  background-color: #f7fafc;
  color: #2d3748;
}

input, .card, .form-container {
  background-color: #ffffff;
  color: #000000;
}

body.dark input, body.dark .card, body.dark .form-container {
  background-color: #2d3748;
  color: #cbd5e0;
}

input::placeholder {
  color: #a0aec0;
}

body.dark input::placeholder {
  color: #718096;
}
```

## Components

### Auth Component

```javascript
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
              <path fill="#34A853" d="M6.9,14.1L13.6,19c1.5-4.1,5.4-7,10.4-7c3.1,0,5.9,1.2,8,3.1l6.4-6.4C34.2,6.7,29.3,4.5,24,4.5C

15.4,4.5,8,10.4,6.9,14.1z" />
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
```

### GroceryList Component

```javascript
import React, { useState, useEffect } from 'react';
import { fetchGroceryItems, addGroceryItem, updateGroceryItem, deleteGroceryItem } from '../api-client/firebaseApi';

function GroceryList({ user }) {
  const [items, setItems] = useState([]);
  const [newItem, setNewItem] = useState('');
  const [newImageUrl, setNewImageUrl] = useState('');
  const [newWebsiteUrl, setNewWebsiteUrl] = useState('');
  const [editItemId, setEditItemId] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    const fetchItems = async () => {
      const items = await fetchGroceryItems(user.uid);
      setItems(items);
    };
    fetchItems();
  }, [user.uid]);

  const handleAddItem = async () => {
    if (newItem.trim()) {
      await addGroceryItem({
        name: newItem,
        imageUrl: newImageUrl,
        websiteUrl: newWebsiteUrl,
        userId: user.uid,
        createdAt: new Date(),
        completed: false,
      });
      setNewItem('');
      setNewImageUrl('');
      setNewWebsiteUrl('');
      const items = await fetchGroceryItems(user.uid);
      setItems(items);
    }
  };

  const handleUpdateItem = async () => {
    if (editItemId) {
      await updateGroceryItem(editItemId, { name: newItem, imageUrl: newImageUrl, websiteUrl: newWebsiteUrl });
      setEditItemId(null);
      setNewItem('');
      setNewImageUrl('');
      setNewWebsiteUrl('');
      const items = await fetchGroceryItems(user.uid);
      setItems(items);
    }
  };

  const handleRemoveItem = async (id) => {
    await deleteGroceryItem(id);
    setItems(items.filter(item => item.id !== id));
  };

  const handleEdit = (item) => {
    setEditItemId(item.id);
    setNewItem(item.name);
    setNewImageUrl(item.imageUrl);
    setNewWebsiteUrl(item.websiteUrl);
  };

  const filteredItems = items.filter(item =>
    item.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="bg-gray-light dark:bg-gray-800 p-6 rounded-lg shadow-lg form-container">
      <div className="flex flex-col mb-4">
        <input
          type="text"
          value={newItem}
          onChange={(e) => setNewItem(e.target.value)}
          className="mb-2 p-2 border border-gray-dark dark:border-gray-600 rounded focus:outline-none dark:bg-gray-700 dark:text-white"
          placeholder="Add new item"
        />
        <input
          type="text"
          value={newImageUrl}
          onChange={(e) => setNewImageUrl(e.target.value)}
          className="mb-2 p-2 border border-gray-dark dark:border-gray-600 rounded focus:outline-none dark:bg-gray-700 dark:text-white"
          placeholder="Image URL (optional)"
        />
        <input
          type="text"
          value={newWebsiteUrl}
          onChange={(e) => setNewWebsiteUrl(e.target.value)}
          className="mb-2 p-2 border border-gray-dark dark:border-gray-600 rounded focus:outline-none dark:bg-gray-700 dark:text-white"
          placeholder="Website URL (optional)"
        />
        {editItemId ? (
          <button
            onClick={handleUpdateItem}
            className="bg-amber text-black p-2 rounded hover:bg-amber-dark transition"
          >
            Update
          </button>
        ) : (
          <button
            onClick={handleAddItem}
            className="bg-teal hover:bg-teal-dark text-white p-2 rounded transition"
          >
            Add
          </button>
        )}
      </div>
      <input
        type="text"
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        className="mb-4 p-2 border border-gray-dark dark:border-gray-600 rounded focus:outline-none dark:bg-gray-700 dark:text-white"
        placeholder="Search items"
      />
      <ul>
        {filteredItems.map(item => (
          <li key={item.id} className={`flex flex-col justify-between items-start bg-gray-light dark:bg-gray-700 p-4 mb-2 rounded-lg shadow-md ${item.completed ? 'opacity-50' : ''} card`}>
            <div className="flex items-center">
              <input
                type="checkbox"
                checked={item.completed}
                onChange={() => updateGroceryItem(item.id, { completed: !item.completed })}
                className="mr-2"
              />
              <span className={`font-bold text-lg text-indigo dark:text-indigo-400 ${item.completed ? 'line-through' : ''}`}>{item.name}</span>
            </div>
            {item.imageUrl && <img src={item.imageUrl} alt={item.name} className="w-24 h-24 object-cover mt-2 rounded-md" />}
            {item.websiteUrl && (
              <a href={item.websiteUrl} target="_blank" rel="noopener noreferrer" className="text-teal mt-2 hover:text-teal-dark transition">
                Visit Website
              </a>
            )}
            <div className="flex mt-2 space-x-2">
              <button
                onClick={() => handleEdit(item)}
                className="bg-amber text-black p-2 rounded hover:bg-amber-dark transition"
              >
                Edit
              </button>
              <button
                onClick={() => handleRemoveItem(item.id)}
                className="bg-red-500 hover:bg-red-700 text-white p-2 rounded transition"
              >
                Remove
              </button>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default GroceryList;
```

### App Component

```javascript
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
```

## Theme Context

### ThemeContext

```javascript
import React, { createContext, useState, useContext } from 'react';

const ThemeContext = createContext();

export const ThemeProvider = ({ children }) => {
  const [isDarkTheme, setIsDarkTheme] = useState(false);

  const toggleTheme = () => {
    setIsDarkTheme(prevTheme => !prevTheme);
  };

  return (
    <ThemeContext.Provider value={{ isDarkTheme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => useContext(ThemeContext);
```

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgments

- [Firebase Documentation](https://firebase.google.com/docs)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)

---

