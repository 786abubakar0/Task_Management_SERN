import React,{useState} from 'react';
import { Card, CardContent, Typography, Box, Button } from '@mui/material';
import EditTaskModal from './EditTaskModal';

const getPriorityStyles = (priority) => {
  switch (priority) {
    case 'High':
      return { bgcolor: '#ef5350', color: 'white' }; // Red
    case 'Medium':
      return { bgcolor: '#ffb300', color: 'white' }; // Amber
    case 'Low':
      return { bgcolor: '#66bb6a', color: 'white' }; // Green
    default:
      return { bgcolor: 'grey.300', color: 'text.primary' };
  }
};
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

function TaskCard({ task, projectid, taskid, taskupdatecallback, showbutton=false, userid }) {
  const { name, description, status,priority, deadline, task_member, task_member_id } = task;
  const statusStyles = getStatusStyles(status);
  const [taskupdating, settaskupdating] = useState(false);
  
  const handletaskupdate = ()=>{
    settaskupdating(true);
  }

     const formattedDeadline = deadline 
    ? new Date(deadline).toLocaleDateString() 
    : 'N/A';
    
  // Get priority styles
  const priorityStyles = getPriorityStyles(priority);

  return (
    <Card elevation={5} sx={{ 
      borderRadius: 2,
      height: '100%', 
      width: '100%',
      display: 'flex', 
      flexDirection: 'column',
      border: task_member_id==userid ? '2px solid #FF7F4F' : '2px solid transparent', 


    }}>
      <CardContent sx={{ flexGrow: 1, justifyItems:'center' }}>
        
        {/* Task Title */}
        <Typography variant="h6" component="div" fontWeight="bold" sx={{ mb: 1 }}>
          {name}
        </Typography>

        {/* Status and Priority Tags */}
        <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
            
            {/* Status Tag */}
            <Box 
              sx={{
                py: 0.5,
                px: 1.5,
                borderRadius: 1,
                fontWeight: 'medium',
                fontSize: '0.8rem',
                ...statusStyles, // Dynamic status style
              }}
            >
              {status}
            </Box>

            {/* Priority Tag (NEW) */}
            <Box 
              sx={{
                py: 0.5,
                px: 1.5,
                borderRadius: 1,
                fontWeight: 'medium',
                fontSize: '0.8rem',
                ...priorityStyles, // Dynamic priority style
              }}
            >
              {priority || 'N/A'}
            </Box>
        </Box>
        
        {/* Description (NEW) */}
        <Typography variant="body2" color="text.secondary" sx={{ justifySelf:'start', mb: 2, minHeight: 40 }}>
            {description || 'No description provided.'}
        </Typography>

        {/* Details: Task Member and Deadline */}
        <Box sx={{ display: 'flex', flexDirection: 'column',justifySelf:'end', alignItems: 'space-between', mt: 2, mb: 3 }}>
          
            {/* Task Member */}
            <Typography variant="body2" color="text.secondary">
                Member: {task_member || 'Unassigned'}
            </Typography>

            {/* Deadline Date (NEW) */}
            <Typography variant="body2" color="text.secondary" fontWeight="medium">
                Deadline: {formattedDeadline}
            </Typography>
        </Box>

      </CardContent>

      {/* Action Buttons */}
      <Box sx={{
        alignSelf:'center', 
        display: 'flex', 
        justifyContent: 'space-between', 
        p: showbutton ? 2 : 0, 
        borderTop: '1px solid #eee' 
      }}>
        {/* <Button 
          variant="outlined" 
          size="small"
          sx={{ textTransform: 'none', color: 'text.primary', borderColor: 'grey.300' }}
        >
          View Details
        </Button> */}
        {showbutton && (<Button 
          variant="contained" 
          size="small" 
          color="secondary"

          sx={{ textTransform: 'none' }}
          onClick={handletaskupdate}
        >
          Edit
        </Button>)}
      </Box>
      
      {/* Assuming EditProjectModal is a valid component */}
      <EditTaskModal 
          isOpen={taskupdating}
          onClose={() => settaskupdating(false)}
          taskupdatecallback={taskupdatecallback}
          taskid={taskid}
          projectid={projectid}
      />
    </Card>
  );
}

export default TaskCard;