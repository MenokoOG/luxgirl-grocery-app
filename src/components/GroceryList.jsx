import React, { useState, useEffect, useMemo } from 'react';
import { fetchGroceryItems, addGroceryItem, updateGroceryItem, deleteGroceryItem } from '../api-client/firebaseApi';
import { TextField, Button, List, Container, Box } from '@mui/material';
import GroceryItem from './GroceryItem';
import SearchBar from './SearchBar';

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

  const filteredItems = useMemo(() => 
    items.filter(item => item.name.toLowerCase().includes(searchQuery.toLowerCase())),
    [items, searchQuery]
  );

  const handleAddOrUpdateItem = async () => {
    if (newItem.trim()) {
      if (editItemId) {
        await updateGroceryItem(editItemId, { name: newItem, imageUrl: newImageUrl, websiteUrl: newWebsiteUrl });
        setEditItemId(null);
      } else {
        await addGroceryItem({
          name: newItem,
          imageUrl: newImageUrl,
          websiteUrl: newWebsiteUrl,
          userId: user.uid,
          createdAt: new Date(),
          completed: false,
        });
      }
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

  const handleToggleCompleted = async (id, completed) => {
    await updateGroceryItem(id, { completed: !completed });
    const items = await fetchGroceryItems(user.uid);
    setItems(items);
  };

  return (
    <Container maxWidth="sm" className="space-y-4">
      <Box>
        <TextField
          label="Add new item"
          value={newItem}
          onChange={(e) => setNewItem(e.target.value)}
          fullWidth
          margin="normal"
        />
        <TextField
          label="Image URL (optional)"
          value={newImageUrl}
          onChange={(e) => setNewImageUrl(e.target.value)}
          fullWidth
          margin="normal"
        />
        <TextField
          label="Website URL (optional)"
          value={newWebsiteUrl}
          onChange={(e) => setNewWebsiteUrl(e.target.value)}
          fullWidth
          margin="normal"
        />
        <Button
          variant="contained"
          color="primary"
          onClick={handleAddOrUpdateItem}
          fullWidth
          className="mt-2"
        >
          {editItemId ? 'Update' : 'Add'}
        </Button>
      </Box>
      <SearchBar searchQuery={searchQuery} setSearchQuery={setSearchQuery} />
      <List className="space-y-2">
        {filteredItems.map(item => (
          <GroceryItem 
            key={item.id} 
            item={item}
            onEdit={() => handleEdit(item)}
            onRemove={() => handleRemoveItem(item.id)}
            onToggleCompleted={() => handleToggleCompleted(item.id, item.completed)}
          />
        ))}
      </List>
    </Container>
  );
}

export default GroceryList;
