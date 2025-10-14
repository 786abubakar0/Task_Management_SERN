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
  FormControl,
  CircularProgress 
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


const EditProjectModal = ({ isOpen, onClose, projectupdatecallback, projectid }) => {
  const [formData, setFormData] = useState({
    name: '',
    members: [],
    description: '',
  });
  const [loading, setloading] = useState(true);
  const [members, setmembers] = useState([]);
  const getprojectdata = async()=> {
          try {
            setloading(true);
          
          let membersdata = await apiClient.get('/viewprojectmembers/'+projectid);
          membersdata = membersdata.data.data.map(d => d.id);
          console.log(membersdata);
          const response = await apiClient.get('/viewproject/'+projectid);
          console.log('in getprojectdata');
          const data = response.data.data;
          setFormData({
            name: data.title,
            description: data.description,
            members: membersdata
          });
         
        } catch (error) {
          console.error('Failed to fetch project data:', error);
          
        }
      };
    const getusers = async()=> {
          try {
            setloading(true);
          const response = await apiClient.get('/viewallusers');
          
          setmembers(response.data.data);
          setloading(false);
         
        } catch (error) {
          setloading(false);
          console.error('Failed to fetch users data:', error);
          
        }
      };
  useEffect(()=>{
    if(isOpen){
    getprojectdata();
    getusers();
    }
  },[isOpen]);
  const [issubmitting, setissubmitting] = useState(false);

  const onUpdateProject = async (projectData) => {
        try{
          setissubmitting(true);
          const response = await apiClient.put('/editproject/'+projectid, projectData);
          console.log(response);
          if(response.status===201){
              setissubmitting(false);
              alert('Project updated successfully!');
              projectupdatecallback();
              setFormData({ name: '', members: [], description: '' });
              onClose();
          }
          else{
              setissubmitting(false);
              alert('Error in project updating!');
          }
    }
    catch(error){
        setissubmitting(false);
        alert('Error in project updating!');

    }
    };

    const handleDelete = async ()=>{
      try {
          setissubmitting(true);
          const response = await apiClient.delete('/deleteproject/'+projectid);
          setissubmitting(false);
          alert('Project deleted!');
          setFormData({ name: '', members: [], description: '' });
          onClose();
          
         
        } catch (error) {
          setissubmitting(false);
          console.error('Failed to delete project data:', error);
          
        }
    }
        
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log(formData);
    
    if (!formData.name || formData.members.length === 0) {
      alert("Project name and members are required.");
      return;
    }
    onUpdateProject(formData);    
  };

  return (
    <Modal
      open={isOpen}
      onClose={onClose}
      aria-labelledby="create-project-modal-title"
      aria-describedby="create-project-modal-description"
    >
      {loading==true ? ( 
                <Box 
                  sx={{
                    ...style,
                    display:'flex',
                    justifyContent: 'center', 
                    alignItems: 'center',
                  }}
                >
                  <CircularProgress color="primary" size={50} />
                </Box>):(<Box sx={style} component="form" onSubmit={handleSubmit}>
        <Typography id="create-project-modal-title" variant="h6" component="h2" gutterBottom>
          Update Project
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
        <Box sx={{ display: 'flex', mt: 2, gap:1}}>
          <Button 
            variant="contained" 
            disabled ={issubmitting ? true : false}
            onClick={handleDelete}
            // Use the orange color from your design for emphasis
            sx={{ mr:'auto', backgroundColor: '#d70c0cff', '&:hover': { backgroundColor: '#272323ff' } }} 
          >
            {issubmitting ? 'Wait..' : 'Delete'}
          </Button>
          <Button 
            variant="outlined"
            sx={{ ml:'auto'}} 
            onClick={onClose}
          >
            Cancel
          </Button>
          <Button 
            disabled ={issubmitting ? true : false}
            variant="contained" 
            // onClick={onClose}
            type="submit"
            // Use the orange color from your design for emphasis
            sx={{ backgroundColor: '#e8491d', '&:hover': { backgroundColor: '#d1411c' } }} 
          >
            {issubmitting ? 'Wait..' : 'Update'}
          </Button>

          
        </Box>
      </Box>)}
    </Modal>
  );
};

export default EditProjectModal;