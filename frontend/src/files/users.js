import React from 'react';
import { Box, useTheme, useMediaQuery, Toolbar, CircularProgress } from '@mui/material'; 
import { useNavigate } from 'react-router-dom'; 
import {useEffect, useState} from 'react';

// Import the components we built
import Header from './Header'; 
import MainContentContainer from './MainContentContainer'; 
import Sidebar from './Sidebar'; 
import { useUser } from './UserContext';
import apiClient from './api';
import UsersTable from './userstable';



// Define the drawer width (must be consistent across components)
const drawerWidth = 240;

function Users() {

  const navigate = useNavigate();
      const {user} = useUser();

      const [usersdata, setusersdata] = useState([]);
      const [isadmin, setisadmin] = useState(false);
      const [loading, setloading] = useState(true);

      
      const theme = useTheme();
        // Check if the screen is smaller than the 'sm' breakpoint (600px)
        const isMobile = useMediaQuery(theme.breakpoints.down('sm')); 
        const [mobileOpen, setMobileOpen] = React.useState(false);
            useEffect(() => {
              console.log('in projects');
          if (!user || user.role!='admin') {
              navigate('/login');
          }
          else{
            if(user.role=='admin'){
                setisadmin(true);
            }
            
            
            getusersdata();

          }
      }, []); 
  
      if (!user || user.role!='admin') {
          return <div>Loading Data ...</div>
      }

       

       const getusersdata = async()=> {
        try {
          setloading(true);
          const response = await apiClient.get('/viewallusers');
          setusersdata(response.data.data);
          setloading(false);
      } catch (error) {
          setloading(false);
          console.error('Failed to fetch users data:', error);
        
      }
    };


  
  

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };
    

  return (
    <Box>
      
      {/* 1. Header (Top Bar) */}
      <Header 
        handleDrawerToggle={handleDrawerToggle} 
        isMobile={isMobile}
        showbutton={false} 
        buttontext='Create Project'

      />
      
      {/* 2. Sidebar */}
      <Sidebar 
        mobileOpen={mobileOpen} 
        handleDrawerToggle={handleDrawerToggle} 
        isadmin={isadmin}
        isactive={2}
      />

      {/* 3. Main Content Container (Projects Page Content) */}
     { loading==true ? ( 
               <Box 
                 sx={{ 
                   display: 'flex', 
                   justifyContent: 'center', 
                   alignItems: 'center', 
                   minHeight: '100vh',
                   bgcolor: 'background.default',           
                   width: { sm: `calc(100% - 240px)` },
                   ml: { sm: `240px` }
                 }}
               >
                 <CircularProgress color="primary" size={50} />
               </Box>) : (<MainContentContainer>
        <Toolbar /> 

       <UsersTable usersdata={usersdata} />
  
        {/* --- Projects Page Content End --- */}
      </MainContentContainer>)}
      
    </Box>
  );
}

export default Users;