import React from 'react';
import { TextField } from '@mui/material';

function SearchBar({ searchQuery, setSearchQuery }) {
  return (
    <TextField
      label="Search items"
      value={searchQuery}
      onChange={(e) => setSearchQuery(e.target.value)}
      fullWidth
      margin="normal"
      className="mb-4"
    />
  );
}

export default SearchBar;
