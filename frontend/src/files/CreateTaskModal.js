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
  Grid
} from '@mui/material';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';

import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { isFuture } from 'date-fns';
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


const CreateTaskModal = ({ isOpen, onClose, projectid, taskcreatecallback }) => {
  const [formData, setFormData] = useState({
    projectid: projectid,
    name: '',
    description: '',
    status:'To Do',
    priority:'Medium',
    deadline:'',
    task_member:''
  });
  const [members, setmembers] = useState([]);
  useEffect(()=>{
    if(isOpen){
      getusers();
    }

  },[isOpen]);
  const [issubmitting, setissubmitting] = useState(false);
// Custom date change handler since DatePicker returns a Date object, not an event
    const handleDateChange = (newDate) => {
        handleChange({ 
            target: { 
                name: 'deadline', 
                value: newDate ? newDate.toISOString() : null 
            } 
        });
    };
    const deadlineDate = formData.deadline ? new Date(formData.deadline) : null;
        const statusOptions = ["To Do", "In Progress", "Completed"];
    const priorityOptions = ["High", "Medium", "Low"];


  const onCreateTask = async (taskData) => {
        try{
            setissubmitting(true);
            const response = await apiClient.post('/createtask', taskData);
            console.log(response);
            if(response.status==201){
                setissubmitting(false);
                alert('Task created successfully!');
                setFormData({
                    projectid: projectid,
                    name: '',
                    description: '',
                    status:'To Do',
                    priority:'Medium',
                    deadline:'',
                    task_member:''
                });
                onClose();
                taskcreatecallback();

        }
        else{
            setissubmitting(false);
            alert('Error in task creation!');
        }
    }
    catch(error){
        setissubmitting(false);
        alert('Error in task creation!');

    }
    };

    const getusers = async()=> {
          try {
          const response = await apiClient.get('/viewprojectmembers/'+projectid);
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
    
    if (!formData.name) {
      alert("all fields are required.");
      return;
    }
    onCreateTask(formData);    
  };

  return (
     <LocalizationProvider dateAdapter={AdapterDateFns}>
            <Modal
                open={isOpen}
                onClose={onClose}
                aria-labelledby="create-task-modal-title"
            >
                <Box sx={style} component="form" onSubmit={handleSubmit}>
                    <Typography id="create-task-modal-title" variant="h6" component="h2" gutterBottom>
                        Create New Task
                    </Typography>

                    {/* Task Name Field */}
                    <TextField
                        fullWidth
                        required
                        label="Task Name"
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        margin="normal"
                        sx={{ mb: 2 }}
                    />
                    
                    {/* Grid for Status, Priority, and Deadline */}
                    <Grid container spacing={2}>
                        
                        {/* Status Field */}
                        <Grid item xs={12} sm={4}>
                            <FormControl fullWidth margin="none" required>
                                <InputLabel id="status-select-label">Status</InputLabel>
                                <Select
                                    labelId="status-select-label"
                                    name="status"
                                    value={formData.status || "To Do"} // Default to 'To Do'
                                    onChange={handleChange}
                                    label="Status"
                                >
                                    {statusOptions.map((status) => (
                                        <MenuItem key={status} value={status}>
                                            {status}
                                        </MenuItem>
                                    ))}
                                </Select>
                            </FormControl>
                        </Grid>

                        {/* Priority Field */}
                        <Grid item xs={12} sm={4}>
                            <FormControl fullWidth margin="none" required>
                                <InputLabel id="priority-select-label">Priority</InputLabel>
                                <Select
                                    labelId="priority-select-label"
                                    name="priority"
                                    value={formData.priority || "Medium"} // Default to 'Medium'
                                    onChange={handleChange}
                                    label="Priority"
                                >
                                    {priorityOptions.map((priority) => (
                                        <MenuItem key={priority} value={priority}>
                                            {priority}
                                        </MenuItem>
                                    ))}
                                </Select>
                            </FormControl>
                        </Grid>
                        
                        {/* Deadline Date Picker */}
                        <Grid item xs={12} sm={4}>
                            <DatePicker
                                label="Deadline"
                                value={deadlineDate}
                                onChange={handleDateChange}
                                disablePast
                                slotProps={{ 
                                    textField: { 
                                        fullWidth: true, 
                                        required: true,
                                        error: deadlineDate && !isFuture(deadlineDate),
                                        helperText: deadlineDate && !isFuture(deadlineDate) && "Date must be in the future"
                                    } 
                                }}
                            />
                        </Grid>
                    </Grid>

                    {/* Task Member Field (Single-select) */}
                    <FormControl fullWidth margin="normal" required>
                        <InputLabel id="member-select-label">Assign Task Member</InputLabel>
                        <Select
                            labelId="member-select-label"
                            id="member-select"
                            // REMOVED 'multiple' to enforce single selection
                            name="task_member" // Changed name to task_member for clarity
                            value={formData.task_member || ''}
                            onChange={handleChange}
                            label="Assign Task Member"
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
                        rows={3} // Reduced rows slightly for space
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
                            variant="contained" 
                            type="submit"
                            disabled ={issubmitting ? true : false}
                            sx={{ backgroundColor: '#e8491d', '&:hover': { backgroundColor: '#d1411c' } }} 
                        >
                            {issubmitting ? 'Wait..' : 'Create Task'}
                        </Button>
                    </Box>
                </Box>
            </Modal>
        </LocalizationProvider>
  );
};

export default CreateTaskModal;