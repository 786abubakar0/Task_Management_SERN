import React,{useState} from 'react';
import { Card, CardContent, Typography, Box, LinearProgress, Button } from '@mui/material';
import EditProjectModal from './EditProjectModal';
import { useNavigate  } from 'react-router-dom';

// Function to determine the color of the status label
const getStatusStyles = (status) => {
  switch (status) {
    case 'Completed':
      return { bgcolor: '#E8F5E9', color: '#4CAF50' }; // Light Green BG, Dark Green Text
    case 'In Progress':
      return { bgcolor: '#E3F2FD', color: '#2196F3' }; // Light Blue BG, Dark Blue Text
    case 'To Do':
      return { bgcolor: '#FFF3E0', color: '#FF9800' }; // Light Orange BG, Dark Orange Text
    default:
      return { bgcolor: 'grey.100', color: 'grey.700' };
  }
};

function ProjectCard({ project, projectid, projectupdatecallback, showbutton }) {
  const navigate = useNavigate();
  const { name, status, progress, tasks, teamMembers } = project;
  const statusStyles = getStatusStyles(status);
  const [projectupdating, setprojectupdating] = useState(false);
  
  const handleprojectupdate = ()=>{
    setprojectupdating(true);
  }

  return (
    <Card elevation={1} sx={{ 
      borderRadius: 2, 
      height: '100%', 
      display: 'flex', 
      flexDirection: 'column' 
    }}>
      <CardContent sx={{ flexGrow: 1 }}>
        
        {/* Project Title */}
        <Typography variant="h6" component="div" fontWeight="bold" sx={{ mb: 1 }}>
          {name}
        </Typography>

        {/* Status Tag */}
        <Box 
          sx={{
            display: 'inline-block',
            py: 0.5,
            px: 1.5,
            mb: 2,
            borderRadius: 1,
            fontWeight: 'medium',
            fontSize: '0.8rem',
            ...statusStyles, // Applies dynamic background and text color
          }}
        >
          {status}
        </Box>
        
        {/* Progress Bar and Percentage */}
        <Box sx={{ my: 1 }}>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
            Progress ({progress}%)
          </Typography>
          <LinearProgress 
            variant="determinate" 
            value={progress} 
            sx={{ 
              height: 8, 
              borderRadius: 4,
              // Set progress bar color based on status/theme (e.g., secondary/orange for active)
              '& .MuiLinearProgress-bar': {
                bgcolor: '#FF7F4F', // Your primary orange color
              }
            }} 
          />
        </Box>

        {/* Tasks and Team Members (You can add these if your data supports it) */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 2, mb: 3 }}>
          <Typography variant="body2" color="text.secondary">
            Tasks: **{tasks}**
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Team: **{teamMembers}**
          </Typography>
        </Box>

      </CardContent>

      {/* Action Buttons */}
      <Box sx={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        p: 2, 
        borderTop: '1px solid #eee' // Separator line for actions
      }}>
        <Button 
          variant="outlined" 
          size="small"
          onClick={()=>{navigate('/tasks/'+projectid)}}
          sx={{ textTransform: 'none', color: 'text.primary', borderColor: 'grey.300' , margin: showbutton ? 'inherit':'auto' }}
        >
          View Details
        </Button>
        {showbutton && ( <Button 
          variant="contained" 
          size="small" 
          color="secondary"
          sx={{ textTransform: 'none' }}
          onClick={handleprojectupdate}
        >
          Edit
        </Button>)}
      </Box>
      <EditProjectModal 
            isOpen={projectupdating}
            onClose={() => setprojectupdating(false)}
            projectupdatecallback = {projectupdatecallback}
            projectid={projectid}
            />
    </Card>
  );
}

export default ProjectCard;