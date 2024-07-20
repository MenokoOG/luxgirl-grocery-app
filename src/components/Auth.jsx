import React, { useState, useEffect } from 'react';
import { Button, Typography, Container, Box } from '@mui/material';
import { Google as GoogleIcon } from '@mui/icons-material';
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
    <Container maxWidth="sm">
      {!user ? (
        <Box textAlign="center" mt={4}>
          <Typography variant="h4" gutterBottom>
            Sign In
          </Typography>
          <Button
            variant="contained"
            color="primary"
            startIcon={<GoogleIcon />}
            onClick={handleGoogleSignIn}
            fullWidth
          >
            Sign In with Google
          </Button>
        </Box>
      ) : (
        <Box textAlign="center" mt={4}>
          <Typography variant="h5" gutterBottom>
            Welcome, {user.displayName}
          </Typography>
          <Button
            variant="contained"
            color="secondary"
            onClick={handleSignOut}
            fullWidth
          >
            Sign Out
          </Button>
        </Box>
      )}
    </Container>
  );
}

export default Auth;
