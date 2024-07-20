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
      <Box className="min-h-screen" bgcolor={isDarkTheme ? 'background.default' : 'background.default'} color={isDarkTheme ? 'text.primary' : 'text.primary'}>
        <AppBar position="static">
          <Toolbar>
            <Box flexGrow={1} textAlign="center">
              <Typography variant="h6">
                Grocery and Shopping List App
              </Typography>
            </Box>
            <Button color="inherit" onClick={toggleTheme}>
              Toggle Theme
            </Button>
          </Toolbar>
        </AppBar>
        <Container>
          <Box my={4}>
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
