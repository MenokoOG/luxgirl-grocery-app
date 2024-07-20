import { createTheme } from '@mui/material/styles';
import { grey, teal, amber, indigo, pink, deepPurple } from '@mui/material/colors';

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
  },
});

export { lightTheme, darkTheme };
