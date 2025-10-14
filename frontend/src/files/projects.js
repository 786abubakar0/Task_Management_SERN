import React from 'react';
import { Box, useTheme, useMediaQuery, Toolbar, Typography, Button, Grid, CircularProgress } from '@mui/material'; 
import { useNavigate } from 'react-router-dom'; 
import {useEffect, useState} from 'react';

// Import the components we built
import Header from './Header'; 
import MainContentContainer from './MainContentContainer'; 
import Sidebar from './Sidebar'; 
import ProjectSummaryCard from './ProjectSummaryCard'; 
import ProjectCard from './ProjectCard';
import { useUser } from './UserContext';
import apiClient from './api';
import CreateProjectModal from './CreateProjectModal';

const drawerWidth = 240;

function Projects() {

  const navigate = useNavigate();
      const [projectdata, setprojectdata] = useState([]);
      const [individualProjectCards, setindividualProjectCards] = useState([]);
      const {user} = useUser();
      const [projectcreating, setprojectcreating] = useState(false);
      let [isadmin, setisadmin] = useState(false);
      const [loading, setloading] = useState(true);
      
      const theme = useTheme();
      let showbutton = false;
        // Check if the screen is smaller than the 'sm' breakpoint (600px)
        const isMobile = useMediaQuery(theme.breakpoints.down('sm')); 
        const [mobileOpen, setMobileOpen] = React.useState(false);
            useEffect(() => {
              // console.log('in projects');
          if (!user) {
              navigate('/login');
          }
          else{
            const role = user.role;
            if(role == 'admin'){
              setisadmin(true);
            }
            getsummary();

          }
      },[]); 
  
      if (!user) {
          return <div>Loading Profile ...</div>
  
      }
       
      const isuserproject = (p) => {
        let userid = user.id;
        const idStringArray = p.teamMembersid.split(',');
        const idNumberArray = idStringArray.map(id => {
                    // Trim whitespace just in case, and use 10 for radix
                    return parseInt(id.trim(), 10);
                });
        if(idNumberArray.includes(userid)){
          return true;
        }
        else{
          return false;
        }

      }
       const getsummary = async()=> {
        try {
          setloading(true);
        const response = await apiClient.get('/getsummary');
        let data = response.data.data;
        let ipc;
        // console.log(data);
        if(user.role=='admin'){
          setprojectdata(data);
          ipc = data.filter(p => p.id);
        }
        else {

          ipc = data.filter(p => isuserproject(p));
          setprojectdata(ipc);
        }

        setindividualProjectCards(ipc); 
        setloading(false);

      } catch (error) {
        setloading(false);
        console.error('Failed to fetch summary data:', error);
        
      }
    };
    
  const handleprojectcreation = ()=>{
    setprojectcreating(true);
  }
  
  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };
    
    // Handler for the "View All Projects" button on the summary card
    const handleViewAll = () => {
        console.log("Projects Summary Card button clicked.");
    };


  return (
    <Box>
      
      {/* 1. Header (Top Bar) */}
      <Header 
        handleDrawerToggle={handleDrawerToggle} 
        isMobile={isMobile} 
        buttonclickfunction={handleprojectcreation}
        buttontext='Create Project'
        showbutton={isadmin}

      />
      
      {/* 2. Sidebar */}
      <Sidebar 
        mobileOpen={mobileOpen} 
        handleDrawerToggle={handleDrawerToggle} 
        isactive={1}
        isadmin={isadmin}
      />

      {/* 3. Main Content Container (Projects Page Content) */}
      {loading==true? ( 
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
                </Box>):(<MainContentContainer>
        <Toolbar /> 

        {/* --- Projects Page Content Start --- */}
        
        {/* Title and Create Button Section */}
        
        
        {/* Project Grid Container: Using Grid to layout the cards */}
        <Grid container >
            <Grid size={{xs:12}}> 
                <ProjectSummaryCard 
                    showbutton={showbutton}
                    title={isadmin==true ? "Active Projects Overview" : "Your Project Overview"}
                    projects={projectdata}
                    onViewAllClick={handleViewAll}
                />
            </Grid>

            {/* 2. Placeholder for Individual Project Cards */}

            <Grid container spacing={3} size={{xs:12}}>
              <Grid size={{xs:12}}>
                <Typography variant="h5" sx={{ textAlign:'center' ,mt: 4, mb: 2 }}>
                    Individual Projects
                </Typography>
              </Grid>
                
                {individualProjectCards.map(project => (
                        <Grid size={{xs:12, sm:6,  md:4, lg:3}} key={project.id}>
                            <ProjectCard project={project} 
                            projectid={project.id}
                            projectupdatecallback={getsummary} 
                            showbutton={isadmin}       
                           />
                        </Grid>
                    ))}  
                    </Grid>          
            
            
        </Grid>
        
        {/* --- Projects Page Content End --- */}
      </MainContentContainer>)}
      <CreateProjectModal
        isOpen={projectcreating}
        onClose={() => setprojectcreating(false)}
        projectcreatecallback = {getsummary}
      />

    
    </Box>
  );
}

export default Projects;