import React from 'react';
import { Box, useTheme, useMediaQuery, Toolbar, Typography, Button, CircularProgress, Grid } from '@mui/material'; 
import { useNavigate, useParams } from 'react-router-dom'; 
import {useEffect, useState} from 'react';

// Import the components we built
import Header from './Header'; 
import MainContentContainer from './MainContentContainer'; 
import Sidebar from './Sidebar'; 
import ProjectDetailsCard from './ProjectDetailsCard'; 
import TaskCard from './TaskCard';
import { useUser } from './UserContext';
import apiClient from './api';
import CreateTaskModal from './CreateTaskModal';

// Define the drawer width (must be consistent across components)
const drawerWidth = 240;

function Tasks() {
  const { projectid } = useParams();

  const navigate = useNavigate();
      const [projectdata, setprojectdata] = useState({title:'', description:'', taskscount:'', members:[]});
      const [individualTaskCards, setindividualTaskCards] = useState([]);
      const {user} = useUser();
      const [isadmin, setisadmin] = useState(false);
      const [taskcreating, settaskcreating] = useState(false);
      const [loading, setloading] = useState(true);


      
      const theme = useTheme();
        // Check if the screen is smaller than the 'sm' breakpoint (600px)
        const isMobile = useMediaQuery(theme.breakpoints.down('sm')); 
        const [mobileOpen, setMobileOpen] = React.useState(false);
            useEffect(() => {
              // console.log('in tasks');
          if (!user) {
              navigate('/login');
          }
          else{
            if(user.role=='admin'){
              setisadmin(true);
            }

            getprojectdata();
            gettaskdata();

          }
      }, []); 
  
      if (!user) {
          return 'Loading Data';
  
      }
       
  
    const getprojectdata = async()=> {
      try {
        setloading(true);
        const response = await apiClient.get('/viewproject/'+projectid);
        let data = response.data.data;

        data.members = data.members.split(',');
       
        setprojectdata(data);

      } catch (error) {
        console.error('Failed to fetch project data:', error);
        
      }
    };
      const getsummary = async()=> {
           getprojectdata();
           gettaskdata();
        };
    

    const gettaskdata = async()=> {
        try {
        const response = await apiClient.get('/viewalltasks/'+projectid);
        setindividualTaskCards(response.data.data);
        setloading(false);

      } catch (error) {
        setloading(false);
        console.error('Failed to fetch task data:', error);
        
      }
    };
    
  const handletaskcreation = ()=>{
    settaskcreating(true);
  }
  
  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };
    
  
  return (
    <Box>
      
      {/* 1. Header (Top Bar) */}
      <Header 
        handleDrawerToggle={handleDrawerToggle} 
        isMobile={isMobile} 
        buttonclickfunction={handletaskcreation}
        buttontext='Create Task'
        showbutton={isadmin}
      />
      
      {/* 2. Sidebar */}
      <Sidebar 
        mobileOpen={mobileOpen} 
        handleDrawerToggle={handleDrawerToggle} 
        isadmin={isadmin}
        isactive={0}
      />
      
      {/* 3. Main Content Container (Projects Page Content) */}
      {loading==true ? ( 
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
          </Box>) : 
          (<MainContentContainer>
        <Toolbar /> 

        {/* --- Projects Page Content Start --- */}
        
        {/* Title and Create Button Section */}
        
        
        {/* Project Grid Container: Using Grid to layout the cards */}
        <Grid container >
            <Grid size={{xs:12}}> 
                <ProjectDetailsCard 
                    project={projectdata}
                />
            </Grid>

            {/* 2. Placeholder for Individual Project Cards */}

            <Grid container spacing={3} size={{xs:12}}>
              <Grid size={{xs:12}}>
                <Typography variant="h5" sx={{ textAlign:'center' ,mt: 4, mb: 2 }}>
                    Tasks
                </Typography>
              </Grid>
                
                {individualTaskCards.map(task => (
                        <Grid size={{xs:12, sm:6,  md:4, lg:3}} key={task.id}>
                            <TaskCard task={task} 
                            taskid={task.id}
                            projectid={projectid}
                            taskupdatecallback={getsummary}    
                            showbutton = {isadmin}  
                            userid={user.id}  
                           />
                        </Grid>
                    ))}  
                    </Grid>          
            
            
        </Grid>
        
        {/* --- Projects Page Content End --- */}
      </MainContentContainer>)}
      <CreateTaskModal
        isOpen={taskcreating}
        onClose={() => settaskcreating(false)}
        taskcreatecallback = {getsummary}
        projectid = {projectid}
      />

    
    </Box>
  );
}

export default Tasks;