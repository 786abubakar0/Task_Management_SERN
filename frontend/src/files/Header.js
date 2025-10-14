import React from 'react';
import { AppBar, Toolbar, Box, Typography, IconButton, Button, Avatar } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import MenuIcon from '@mui/icons-material/Menu'; // Used for mobile hamburger icon
import { useUser } from './UserContext';

// Define the drawer width (must be consistent with the Sidebar component)
const drawerWidth = 240;

function Header({ handleDrawerToggle, isMobile, buttonclickfunction, buttontext, showbutton=false }) {
  // Use the color palette from your design (White background, Dark blue text)
  const logoColor = '#223048'; // Dark blue from your sidebar
  const {user} = useUser();
  const username= user.name;    

;
  return (
    <AppBar
      position="fixed"
      elevation={1} // Add a subtle shadow to separate it from the content
      sx={{
        // Set white background for the top bar
        bgcolor: 'background.paper', 
        
        // Responsive width and margin to make space for the permanent sidebar on large screens (sm and up)
        width: { sm: `calc(100% - ${drawerWidth}px)` },
        ml: { sm: `${drawerWidth}px` },
        
        // Ensure the text and icons are the right color
        color: 'text.primary', 
      }}
    >
      <Toolbar>
        {/* 1. Hamburger Icon (Visible only on smaller screens) */}
        {isMobile && (
          <IconButton
            color="inherit"
            aria-label="open drawer"
            edge="start"
            onClick={handleDrawerToggle}
            sx={{ mr: 0 }}
          >
            <MenuIcon />
          </IconButton>
        )}
        
        {/* 2. App Name/Logo (Visible on small screens, or if the main content is here) */}
        {isMobile && (
          <Box sx={{ display: 'flex', alignItems: 'center', mr: 2 }}>
            <Typography variant="h6" component="div" fontWeight="bold" sx={{ color: logoColor }}>
              TASKFLOW
            </Typography>
          </Box>
        )}

        {/* This Box is an automatic spacer/pusher to align items to the right */}
        <Box sx={{ flexGrow: 1 }} /> 

        {/* 3. Right-Side Icons and Buttons */}
        
        {/* Notification Bell */}
        {/* <IconButton sx={{ color: 'text.secondary', mr: 1 }}>
          <NotificationsNoneIcon />
        </IconButton> */}

        {/* User Profile */}
        <Box sx={{ display: 'flex', alignItems: 'center', mx: 2 }}>
          <Avatar alt={username ? username: '--'} src="/static/images/avatar/1.jpg" sx={{ width: 32, height: 32, mr: 1 }} />
          <Typography variant="body1" sx={{ display: { xs: 'none', md: 'block' }, fontWeight: 'medium' }}>
            {username ? username : '--'}
          </Typography>
        </Box>

        {/* Create Project Button (using secondary/orange theme color) */}
        { showbutton &&
        (<Button 
          variant="contained" 
          color="secondary" 
          onClick={buttonclickfunction}
          // startIcon={<AddIcon />}
          startIcon={<AddIcon sx={{ display: { xs: 'none', sm: 'inline-flex' } }} />}

          sx={{ 
            textTransform: 'none',
            whiteSpace: 'nowrap', // Prevent text wrap on small screens
            // Use your specific orange color for the button
            bgcolor: '#FF7F4F', 
            '&:hover': { bgcolor: '#E06F45' }
          }}
        >
          {buttontext}
        </Button>)
}
      </Toolbar>
    </AppBar>
  );
}

export default Header;