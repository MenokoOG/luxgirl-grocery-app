import React from 'react';
import { ListItem, ListItemText, ListItemSecondaryAction, IconButton, Checkbox, Typography, Link as MuiLink } from '@mui/material';
import { Edit as EditIcon, Delete as DeleteIcon, CheckBox as CheckBoxIcon, CheckBoxOutlineBlank as CheckBoxOutlineBlankIcon } from '@mui/icons-material';

function GroceryItem({ item, onEdit, onRemove, onToggleCompleted }) {
  return (
    <ListItem 
      divider 
      className={`opacity-${item.completed ? '50' : '100'} line-through-${item.completed ? 'true' : 'false'}`}
    >
      <Checkbox
        edge="start"
        checked={item.completed}
        onChange={onToggleCompleted}
        icon={<CheckBoxOutlineBlankIcon />}
        checkedIcon={<CheckBoxIcon />}
      />
      <ListItemText 
        primary={
          <Typography variant="body1" className={`text-${item.completed ? 'gray-500' : 'black'}`}>
            {item.name}
          </Typography>
        }
        secondary={
          <>
            {item.imageUrl && (
              <MuiLink href={item.imageUrl} target="_blank" rel="noopener">
                <img 
                  src={item.imageUrl} 
                  alt={item.name} 
                  className="w-24 h-24 object-cover mt-2" 
                />
              </MuiLink>
            )}
            {item.websiteUrl && (
              <MuiLink href={item.websiteUrl} target="_blank" rel="noopener" variant="body2" className="block mt-2">
                {item.websiteUrl}
              </MuiLink>
            )}
          </>
        }
      />
      <ListItemSecondaryAction>
        <IconButton edge="end" onClick={onEdit}>
          <EditIcon />
        </IconButton>
        <IconButton edge="end" onClick={onRemove}>
          <DeleteIcon />
        </IconButton>
      </ListItemSecondaryAction>
    </ListItem>
  );
}

export default GroceryItem;
