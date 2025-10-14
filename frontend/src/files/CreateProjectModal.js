import React, { useState, useEffect } from 'react';
import apiClient from './api';

import { 
  Modal, 
  Box, 
  Typography, 
  TextField, 
  Button, 
  MenuItem, 
  Select, 
  InputLabel, 
  FormControl 
} from '@mui/material';

// Styling for the modal box
const style = {
  position: 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
    // transform: 'translateX(-50%)', 

  width: '90%',
  maxWidth: 430,
  bgcolor: 'background.paper',
  borderRadius: 2,
  boxShadow: 24,
  p: 4,
  maxHeight: '85vh', 
  overflowY: 'auto', 
  // scroll:'hidden'
  '&::-webkit-scrollbar': {
    display: 'none',
  },
  // For Internet Explorer and Edge < 16 (might be redundant but good practice)
  msOverflowStyle: 'none', 
  // For Firefox
  scrollbarWidth: 'none', 


};

const CreateProjectModal = ({ isOpen, onClose, projectcreatecallback }) => {
  const [formData, setFormData] = useState({
    name: '',
    members: [],
    description: '',
  });
  const [members, setmembers] = useState([]);
  useEffect(()=>{
    if(isOpen){
      getusers();
    }

  },[isOpen]);
  const [issubmitting, setissubmitting] = useState(false);

  const onCreateProject = async (projectData) => {
       
      try{
        setissubmitting(true);
        const response = await apiClient.post('/createproject', projectData);
        // console.log(response);
        
        if(response.status==201){
            setissubmitting(false);
            alert('Project created successfully!');
            projectcreatecallback();
            setFormData({ name: '', members: [], description: '' });
            onClose();
        }
        else{
            setissubmitting(false);
            alert('Error in project creation!');
        }
    }
    catch(error){
        setissubmitting(false);
        alert('Error in project creation!');

    }
    };
    const getusers = async()=> {
          try {
          const response = await apiClient.get('/viewallusers');
          setmembers(response.data.data);
         
        } catch (error) {
          console.error('Failed to fetch users data:', error);
          
        }
      };
        
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!formData.name || formData.members.length === 0) {
      // In a real app, use MUI's Snackbar for better error handling
      alert("Project name and members are required.");
      return;
    }
    onCreateProject(formData);    
  };

  return (
    <Modal
      open={isOpen}
      onClose={onClose}
      aria-labelledby="create-project-modal-title"
      aria-describedby="create-project-modal-description"
    >
      <Box sx={style} component="form" onSubmit={handleSubmit}>
        <Typography id="create-project-modal-title" variant="h6" component="h2" gutterBottom>
          Create New Project
        </Typography>

        {/* Project Name Field */}
        <TextField
          fullWidth
          required
          label="Project Name"
          name="name"
          value={formData.name}
          onChange={handleChange}
          margin="normal"
        />

        {/* Add Project Members Field (Multi-select) */}
        <FormControl fullWidth margin="normal" required>
          <InputLabel id="members-select-label">Add Project Members</InputLabel>
          <Select
            labelId="members-select-label"
            id="members-select"
            multiple // Allows multiple selections
            name="members"
            value={formData.members}
            onChange={handleChange}
            label="Add Project Members"
            // Simple render value for multiple select
            renderValue={(selected) => selected.map(id => members.find(m => m.id === id)?.name).join(', ')}
          >
            {members.map((member) => (
              <MenuItem key={member.id} value={member.id}>
                {member.name}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        {/* Description Field */}
        <TextField
          fullWidth
          required
          label="Description"
          name="description"
          value={formData.description}
          onChange={handleChange}
          multiline
          rows={4}
          margin="normal"
        />

        {/* Action Buttons */}
        <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 3, gap: 1 }}>
          <Button 
            variant="outlined" 
            onClick={onClose}
          >
            Cancel
          </Button>
          <Button
            disabled = {issubmitting ? true : false} 
            variant="contained" 
            type="submit"
            // Use the orange color from your design for emphasis
            sx={{ backgroundColor: '#e8491d', '&:hover': { backgroundColor: '#d1411c' } }} 
          >
            {issubmitting ? 'Wait..' : 'Create Project'}
          </Button>
        </Box>
      </Box>
    </Modal>
  );
};

export default CreateProjectModal;