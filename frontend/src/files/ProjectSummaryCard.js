import React from 'react';
import { Box, Typography, List, ListItem, ListItemIcon, ListItemText, Button, Paper } from '@mui/material';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';


function ProjectSummaryCard({ showbutton, title, projects, onViewAllClick }) {
  // Define colors from your theme for status indicators
  const statusColors = {
    Active: '#4CAF50', // Green
    'To Do': '#FF9800', // Orange/Amber
    'In Progress': '#2196F3', // Blue
  };
  
  return (
    <Paper 
      elevation={4} 
      sx={{ 
        // display: 'flex',
        p: 2, 
        borderRadius: 2, 
        width: '100%',
      }}
    >
      
      {/* Card Title */}
      <Typography variant="h6" fontWeight="bold" sx={{ mb: 1, textAlign:'center' }}>
        {title}
      </Typography>
      
      {/* Projects List */}
      <List dense disablePadding>
        {projects.map((project, index) => (
          <ListItem 
            key={index} 
            disablePadding
            secondaryAction={
                <ChevronRightIcon sx={{ color: 'text.secondary', fontSize: '1.2rem' }} />
            }
            sx={{ pr: 1 }} // Add padding to avoid icon overlap
          >
            <ListItemIcon sx={{ minWidth: 30 }}>
              {/* Status Indicator Circle */}
              <Box 
                sx={{
                  width: 8,
                  height: 8,
                  borderRadius: '50%',
                  bgcolor: statusColors[project.status] || 'grey.500', // Use status color or default
                }}
              />
            </ListItemIcon>
            <ListItemText
              primary={
                <Typography variant="body2">
                  {project.name} <span style={{ color: 'grey', fontSize: '0.85rem' }}>({project.tasks} tasks)</span>
                </Typography>
              }
            />
          </ListItem>
        ))}
      </List>
      
      {/* View All Button */}
      {showbutton && (<Box sx={{ mt: 2, textAlign: 'center' }}>
        <Button 
          variant="contained" 
          onClick={onViewAllClick}
          sx={{ 
            bgcolor: '#2196F3', // Using a standard blue
            textTransform: 'none',
            '&:hover': { bgcolor: '#1976D2' }
          }}
        >
          View All Projects
        </Button>
      </Box>)}
    </Paper>
  );
}

export default ProjectSummaryCard;