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
