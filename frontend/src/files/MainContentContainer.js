import React from 'react';
import { Box, CssBaseline } from '@mui/material';


const drawerWidth = 240; 

function MainContentContainer({ children }) {
  return (
    // CssBaseline fixes browser inconsistencies and applies theme background color
    <React.Fragment>
      <CssBaseline />
  
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: 3, // Padding around the content, adjust as needed
          minHeight: '100vh', // Ensure it covers the whole viewport height
          
          // Apply the light gray background color from the theme
          bgcolor: 'background.default', 
          
          // These width settings ensure it shifts properly when a fixed sidebar is present
          width: { sm: `calc(100% - ${drawerWidth}px)` },
          ml: { sm: `${drawerWidth}px` },
        }}
      >
        {/*
          An empty Toolbar is often used here to act as a spacer, pushing 
          the main content down below the fixed AppBar (header) height.
        */}
        {/* <Toolbar /> */} 
        
        {children}
      </Box>
    </React.Fragment>
  );
}

export default MainContentContainer;