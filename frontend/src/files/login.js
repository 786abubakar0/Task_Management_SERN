import {useState, useEffect} from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useUser } from './UserContext';
import apiClient from './api'; 
import {
  Box,
  Card,
  CardContent,
  Typography,
  TextField,
  Button,
  CircularProgress,
  Alert,
} from '@mui/material';

// --- Color and Style Constants based on your App Design ---
const darkBlue = '#223048';
const orange = '#FF7F4F';

// Mimics the project card look: rounded, shadowed, and centered
const FormCard = (props) => (
  <Card
    sx={{
      width: '100%',
      maxWidth: 400, // Fixed width for the form container
      p: 4, // Padding inside the card
      borderRadius: '12px',
      boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)', // Subtle shadow
      borderTop: `5px solid ${orange}`, // Orange accent line at the top
    }}
    {...props}
  />
);


function LoginForm(){
    const [formData, setFormData] = useState({
        username: '',
        password: ''
    });

    const [isLoading, setIsLoading] = useState(false);

    const SERVER_URL = process.env.REACT_APP_SERVER_URL || 'http://localhost:5000';
    const { user, login } = useUser();
    const navigate = useNavigate();


   useEffect(() => {
          if (user) {
              navigate('/projects');
          }
      }, [user, navigate]); 
  
      if (user) {
          return null; 
      }


    const handleChange = (e)=>{
        setFormData({...formData, [e.target.name]:e.target.value});
    };

    const handleSubmit = async(e)=>{
        e.preventDefault();
        try{
            setIsLoading(true);
            const response = await apiClient.post(SERVER_URL + "/login", formData);
            alert('Login Successful!');
            setIsLoading(false);
            const { user, accessToken } = response.data;
            localStorage.setItem("accessToken", accessToken);
            login(user);
            navigate('/projects');
            setFormData({username: '', password: ''});
        }
        catch(error){
            setIsLoading(false);
            console.error("There was an error while login! ", error);
            if(typeof error.response == 'undefined'){
                alert('login failed!!');
            }
            else{
                alert('login failed!!' + error.response.data);

            }
        }
    };
    return(
      <Box
        sx={{
          minHeight: '100vh',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          p: 2, // General padding for mobile
          bgcolor: '#f5f7fa', // Light background color
        }}
      >
        {/* TASKFLOW Logo/Title (Mimicking the Sidebar Header) */}
        <Typography
          variant="h4"
          fontWeight="bold"
          sx={{
            color: darkBlue,
            mb: 4,
            letterSpacing: '2px',
            textShadow: '1px 1px 2px rgba(0,0,0,0.1)',
          }}
        >
          TASKFLOW
        </Typography>

        {/* Login Card Container */}
        <FormCard component="form" onSubmit={handleSubmit}>
          <CardContent sx={{ p: 0 }}>
            <Typography variant="h5" fontWeight="bold" sx={{ color: darkBlue, mb: 3 }}>
              Log In
            </Typography>
            
            {/* Username Input */}
            <TextField
              fullWidth
              margin="normal"
              label="Username"
              name="username"
              type="text"
              value={formData.username}
              onChange={handleChange}
              required
              variant="outlined"
              // Style focus outline to match the orange
              sx={{
                '& .MuiOutlinedInput-root.Mui-focused .MuiOutlinedInput-notchedOutline': {
                  borderColor: orange,
                },
                '& .MuiInputLabel-root.Mui-focused': {
                  color: orange,
                },
              }}
            />

            {/* Password Input */}
            <TextField
              fullWidth
              margin="normal"
              label="Password"
              name="password"
              type="password"
              value={formData.password}
              onChange={handleChange}
              required
              variant="outlined"
              // Style focus outline to match the orange
              sx={{
                '& .MuiOutlinedInput-root.Mui-focused .MuiOutlinedInput-notchedOutline': {
                  borderColor: orange,
                },
                '& .MuiInputLabel-root.Mui-focused': {
                  color: orange,
                },
                mb: 3, // Add extra margin below the last input
              }}
            />

            {/* Response / Error Messages
            {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
            {submitResponse && <Alert severity="success" sx={{ mb: 2 }}>{submitResponse}</Alert>} */}

            {/* Button Container */}
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 3 }}>
              
              {/* Signup Button (Styling similar to a secondary action) */}
              <Button
                component={Link}
                to="/signup"
                variant="outlined"
                color="primary" // Default primary color from theme
                sx={{ 
                  borderColor: darkBlue,
                  color: darkBlue,
                  '&:hover': {
                    borderColor: darkBlue,
                    bgcolor: 'rgba(34, 48, 72, 0.04)',
                  }
                }}
              >
                Sign Up
              </Button>

              {/* Login Button (Styling similar to the orange 'Create Task' button) */}
              <Button
                type="submit"
                variant="contained"
                disabled={isLoading ? true : false}
                sx={{
                  bgcolor: orange,
                  '&:hover': {
                    bgcolor: '#e66a3d', // Slightly darker orange on hover
                  },
                }}
                endIcon={isLoading ? <CircularProgress size={20} color="inherit" /> : null}
              >
                {isLoading ? 'Wait...' : 'Login'}
              </Button>
            </Box>
          </CardContent>
        </FormCard>
      </Box>
    );
}

export default LoginForm;
