import React from 'react';
import {
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Typography,
  Box,
  Divider,
  useTheme,
  useMediaQuery,
  Chip
} from '@mui/material';

import DashboardIcon from '@mui/icons-material/Dashboard';
import GroupIcon from '@mui/icons-material/Group';
import LogoutIcon from '@mui/icons-material/Logout';
import {useState} from 'react';
import apiClient from './api';
import { useUser } from './UserContext.js';
import { useNavigate } from 'react-router-dom';
import { NavLink as RouterNavLink } from 'react-router-dom'; // 👈 Import and rename it



// The width of the permanent sidebar
const drawerWidth = 240;

const Sidebar = ({ mobileOpen, handleDrawerToggle, isactive=1, isadmin=false }) => {
  const theme = useTheme();
  // const isLargeScreen = useMediaQuery(theme.breakpoints.up('sm'));
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const {logout} = useUser();
  const navigate = useNavigate();

  // Your color variables from the design
  const darkBlue = '#223048';
  const orange = '#FF7F4F';
  // --- Dedicated Logout Button Component ---
  const LogoutButton = () => (
    <ListItem disablePadding>
      <ListItemButton 
        onClick={handlelogout}
        disabled={isLoggingOut ? true : false} 
        sx={{
          p: 2, 
          justifyContent: 'flex-start',
          color: 'white',
          bgcolor: darkBlue,
          '&:hover': {
            bgcolor: `${darkBlue}b3`,
          },
        }}
      >
        <ListItemIcon sx={{ color: 'white', minWidth: '40px' }}>
          <LogoutIcon />
        </ListItemIcon>
        <ListItemText 
          primary={isLoggingOut ? 'Wait...' : 'Logout'} 
          sx={{ '& .MuiListItemText-primary': { fontWeight: 'medium' } }} 
        />
      </ListItemButton>
    </ListItem>
  );

  const handlelogout = async()=>{
          try{
              setIsLoggingOut(true);
              await apiClient.post('/logout');
              logout();
              setIsLoggingOut(false);
              alert('Logged out!');
              navigate('/login');
          }
          catch(error){
              setIsLoggingOut(false);
              console.error("There was an error while logout!", error);
              alert('Log out failed!!');
  
          }
      };

  // --- Reusable Navigation Link Component ---
  const NavLink = ({ to, icon, text, active, adminBadge}) => (
    <ListItem
      disablePadding
      component={RouterNavLink}
      to={to}

      sx={{
        bgcolor: active ? orange : 'transparent', // Highlight active link with orange
        color: 'white',
        borderLeft: active ? `4px solid ${orange}` : 'none',
        pl: active ? 0 : '4px', // Adjust padding to keep alignment
        '&:hover': {
          bgcolor: active ? orange : `${darkBlue}`, // Lighter dark blue on hover
        },
      }}
    >
      <ListItemButton sx={{ p: 2, justifyContent: 'flex-start' }}>
        <ListItemIcon sx={{ color: 'white', minWidth: '40px' }}>
          {icon}
        </ListItemIcon>
        <ListItemText primary={text} sx={{ '& .MuiListItemText-primary': { fontWeight: 'medium' } }} />
        {adminBadge && <Chip label="Admin" size="small" sx={{ color: 'white', borderColor: 'rgba(255, 255, 255, 0.5)', border: '1px solid' }} />}
      </ListItemButton>
    </ListItem>
  );
  // ------------------------------------------

  // The main content of the drawer
  const drawerContent = (
    <Box sx={{
      height: '100%',
      display: 'flex',
      flexDirection: 'column',
      bgcolor: darkBlue,
      color: 'white',
      overflowX: 'hidden'
    }}>
      {/* TaskFlow Logo */}
      <Box sx={{ my: 3, mx: 'auto' }}>
        <Typography variant="h5" fontWeight="bold">TASKFLOW</Typography>
      </Box>

      {/* Main Navigation Links */}
      <List sx={{ flexGrow: 1 }}>
        <NavLink to="/projects" icon={<DashboardIcon />} text="Dashboard" active={isactive==1 ? true : false}/>
        {/* <NavLink to="/projects" icon={<FolderIcon />} text="Projects" active /> Highlight "Projects" as the active page */}
        {isadmin && (<NavLink to="/users" icon={<GroupIcon />} text="Users" active={isactive == 2 ? true : false}/>)}
      </List>

      {/* Logout Link at the bottom */}
      {/* <List>
        <Divider sx={{ my: 1, bgcolor: 'rgba(255, 255, 255, 0.2)' }} />
        <NavLink disabled={isLoggingOut} onClick={handlelogout} icon={<LogoutIcon />} text={isLoggingOut ? 'Wait..' :'Logout' } />
      </List> */}
      <LogoutButton />
    </Box>
  );

  return (
    <Box
      component="nav"
      sx={{ width: { sm: drawerWidth }, flexShrink: { sm: 0 } }}
    >
      {/* 1. Temporary Drawer (for mobile screens) */}
      <Drawer
        variant="temporary"
        open={mobileOpen}
        onClose={handleDrawerToggle}
        ModalProps={{ keepMounted: true }} // Better performance on mobile
        sx={{
          display: { xs: 'block', sm: 'none' },
          '& .MuiDrawer-paper': { boxSizing: 'border-box', width: drawerWidth },
        }}
      >
        {drawerContent}
      </Drawer>

      {/* 2. Permanent Drawer (for large screens) */}
      <Drawer
        variant="permanent"
        sx={{
          display: { xs: 'none', sm: 'block' },
          '& .MuiDrawer-paper': { boxSizing: 'border-box', width: drawerWidth },
        }}
        open
      >
        {drawerContent}
      </Drawer>
    </Box>
  );
};

export default Sidebar;