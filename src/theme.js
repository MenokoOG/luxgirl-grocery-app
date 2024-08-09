import { createTheme } from '@mui/material/styles';
import { grey, deepPurple, pink } from '@mui/material/colors';

const lightTheme = createTheme({
  palette: {
    mode: 'light',
    primary: deepPurple,
    secondary: pink,
    background: {
      default: grey[50],
      paper: grey[100],
    },
    text: {
      primary: grey[900],
      secondary: grey[800],
    },
  },
  typography: {
    fontFamily: 'Roboto, Arial, sans-serif',
    h6: {
      fontSize: '1.25rem',
      '@media (min-width:600px)': {
        fontSize: '1.5rem',
      },
    },
    body1: {
      fontSize: '1rem',
      '@media (min-width:600px)': {
        fontSize: '1.125rem',
      },
    },
  },
});

const darkTheme = createTheme({
  palette: {
    mode: 'dark',
    primary: deepPurple,
    secondary: pink,
    background: {
      default: grey[900],
      paper: grey[800],
    },
    text: {
      primary: grey[100],
      secondary: grey[300],
    },
  },
  typography: {
    fontFamily: 'Roboto, Arial, sans-serif',
    h6: {
      fontSize: '1.25rem',
      '@media (min-width:600px)': {
        fontSize: '1.5rem',
      },
    },
    body1: {
      fontSize: '1rem',
      '@media (min-width:600px)': {
        fontSize: '1.125rem',
      },
    },
  },
});

export { lightTheme, darkTheme };
