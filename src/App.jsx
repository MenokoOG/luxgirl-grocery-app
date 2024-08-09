import React, { useState, useEffect } from 'react';
import { ThemeProvider, CssBaseline, Container, AppBar, Toolbar, Typography, Button, Box } from '@mui/material';
import GroceryList from './components/GroceryList';
import Auth from './components/Auth';
import { getUserState } from './api-client/firebaseApi';
import { useTheme } from './context/ThemeContext';
import { lightTheme, darkTheme } from './theme';

function App() {
  const [user, setUser] = useState(null);
  const { isDarkTheme, toggleTheme } = useTheme();

  useEffect(() => {
    const unsubscribe = getUserState(setUser);
    return () => unsubscribe();
  }, []);

  return (
    <ThemeProvider theme={isDarkTheme ? darkTheme : lightTheme}>
      <CssBaseline />
      <Box className="min-h-screen flex flex-col items-center justify-center">
        <AppBar position="static" className="w-full">
          <Toolbar className="flex justify-center">
            <Box className="flex justify-between items-center w-full max-w-xs">
              <Typography variant="h6" className="text-center">
                Grocery and Shopping List App
              </Typography>
              <Button color="inherit" onClick={toggleTheme} className="ml-4">
                Toggle Theme
              </Button>
            </Box>
          </Toolbar>
        </AppBar>
        <Container className="flex-grow flex flex-col items-center justify-center">
          <Box my={4} className="w-full">
            <Auth />
          </Box>
          {user ? (
            <GroceryList user={user} />
          ) : (
            <Typography variant="body1" align="center">
              Please sign in to manage your grocery list.
            </Typography>
          )}
        </Container>
      </Box>
    </ThemeProvider>
  );
}

export default App;
