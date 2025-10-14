import React from 'react';
import { Box, Typography, Paper } from '@mui/material';

function ProjectDetailsCard({project}) {
 
  return (
   
    <Paper 
      elevation={5} 
      sx={{ 
        p: 3, // Increased padding for better spacing
        borderRadius: 2, 
        width: '100%',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between', // Push buttons to the bottom
        // minHeight: 280, // Ensure minimum height for uniform cards
        transition: 'transform 0.2s',
        '&:hover': { transform: 'translateY(-4px)', boxShadow: 6 }
      }}
    >
      
      {/* Project Title and Status */}
      <Box>
        <Typography variant="h6" fontWeight="bold" sx={{ textAlign:'center', mb: 1 }}>
          {project.title}
        </Typography>


        {/* Project Description (Truncated) */}
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2, minHeight: 40, overflow: 'hidden', textOverflow: 'ellipsis', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }}>
          {project.description || 'No description provided.'}
        </Typography>


        {/* Details: Tasks and Members */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
          <Typography variant="body2" color="text.primary">
            **Tasks**: {project.taskscount}
          </Typography>
          <Typography variant="body2" color="text.primary">
            **Team**: {project.members.length} member{project.members.length !== 1 ? 's' : ''}
          </Typography>
        </Box>
        
        {/* Member Names (Optional detail) */}
        <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 1 }}>
            Members: {project.members.slice(0, 3).join(', ') || 'None'} 
            {project.members.length > 3 ? '...' : ''}
        </Typography>
      </Box>
    </Paper>
  );
}

export default ProjectDetailsCard;