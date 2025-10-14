// src/theme.js
import { createTheme } from '@mui/material/styles';

const darkBlue = '#223048';
const orange = '#FF7F4F';

const theme = createTheme({
  palette: {
    primary: {
      main: darkBlue,
    },
    secondary: {
      main: orange,
    },
    background: {
      // This is the light gray background color seen in the design
      default: '#F5F7FA', 
      paper: '#FFFFFF', 
    },
  },
  // ... other theme settings
});

export default theme;