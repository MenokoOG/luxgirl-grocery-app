import React, { useState, useEffect } from 'react';
import { fetchGroceryItems, addGroceryItem, updateGroceryItem, deleteGroceryItem } from '../api-client/firebaseApi';
import { TextField, Button, List, ListItem, ListItemText, ListItemSecondaryAction, IconButton, Checkbox, Container, Box, Typography, Link as MuiLink } from '@mui/material';
import { Edit as EditIcon, Delete as DeleteIcon, CheckBox as CheckBoxIcon, CheckBoxOutlineBlank as CheckBoxOutlineBlankIcon } from '@mui/icons-material';

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

  const handleToggleCompleted = async (id, completed) => {
    await updateGroceryItem(id, { completed: !completed });
    const items = await fetchGroceryItems(user.uid);
    setItems(items);
  };

  const filteredItems = items.filter(item =>
    item.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <Container maxWidth="sm">
      <Box my={4}>
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
        {editItemId ? (
          <Button
            variant="contained"
            color="primary"
            onClick={handleUpdateItem}
            fullWidth
          >
            Update
          </Button>
        ) : (
          <Button
            variant="contained"
            color="primary"
            onClick={handleAddItem}
            fullWidth
          >
            Add
          </Button>
        )}
      </Box>
      <TextField
        label="Search items"
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        fullWidth
        margin="normal"
      />
      <List>
        {filteredItems.map(item => (
          <ListItem 
            key={item.id} 
            divider 
            style={{ opacity: item.completed ? 0.5 : 1, textDecoration: item.completed ? 'line-through' : 'none' }}
          >
            <Checkbox
              edge="start"
              checked={item.completed}
              onChange={() => handleToggleCompleted(item.id, item.completed)}
              icon={<CheckBoxOutlineBlankIcon />}
              checkedIcon={<CheckBoxIcon />}
            />
            <ListItemText 
              primary={
                <React.Fragment>
                  <Typography variant="body1">
                    {item.name}
                  </Typography>
                  {item.imageUrl && (
                    <MuiLink href={item.imageUrl} target="_blank" rel="noopener">
                      <img 
                        src={item.imageUrl} 
                        alt={item.name} 
                        style={{ width: '100px', height: '100px', objectFit: 'cover', marginTop: '8px' }} 
                      />
                    </MuiLink>
                  )}
                  {item.websiteUrl && (
                    <MuiLink href={item.websiteUrl} target="_blank" rel="noopener" variant="body2" style={{ display: 'block', marginTop: '8px' }}>
                      {item.websiteUrl}
                    </MuiLink>
                  )}
                </React.Fragment>
              }
            />
            <ListItemSecondaryAction>
              <IconButton edge="end" onClick={() => handleEdit(item)}>
                <EditIcon />
              </IconButton>
              <IconButton edge="end" onClick={() => handleRemoveItem(item.id)}>
                <DeleteIcon />
              </IconButton>
            </ListItemSecondaryAction>
          </ListItem>
        ))}
      </List>
    </Container>
  );
}

export default GroceryList;
