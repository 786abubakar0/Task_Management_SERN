import {useState, useEffect} from 'react';
import axios from 'axios';
import { Link, useNavigate} from 'react-router-dom';
import { useUser } from './UserContext';
import {
  Box,
  Card,
  CardContent,
  Typography,
  TextField,
  Button,
  CircularProgress,
  RadioGroup,
  FormControlLabel,
  Radio,
  FormControl,
  FormLabel,
} from '@mui/material';

// --- Color and Style Constants (Copied from LoginPage for consistency) ---
const darkBlue = '#223048';
const orange = '#FF7F4F';

// Mimics the project card look: rounded, shadowed, and centered
const FormCard = (props) => (
  <Card
    sx={{
      width: '100%',
      maxWidth: 450, // Slightly wider card to accommodate more inputs
      p: 4, 
      borderRadius: '12px',
      boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
      borderTop: `5px solid ${orange}`,
    }}
    {...props}
  />
);


function SignupForm(){
    const [formData, setFormData] = useState({
        name: '',
        username: '',
        email: '',
        password: '',
        role:'admin'
    });

    const [isLoading, setIsLoading] = useState(false);
    const SERVER_URL = process.env.REACT_APP_SERVER_URL || 'http://localhost:5000';
    const {user} = useUser();
    const navigate = useNavigate();

    useEffect(() => {
        if (user) {
            navigate('/projects');
        }
        }, [user, navigate]); 
    
    if (user) {
        return null; 
    }

    
    const handleOptionChange = (e) => {
        setFormData({...formData, [e.target.name]:e.target.value});
    };
    const handleChange = (e)=>{
        setFormData({...formData, [e.target.name]:e.target.value});
    };

    const handleSubmit = async(e)=>{
        e.preventDefault();
        try{
            setIsLoading(true);
            await axios.post(SERVER_URL+"/signup", formData);
            alert('SignUp Successful!');
            setIsLoading(false);
            setFormData({name: '', username: '',email: '', password: '', role:'admin'});
        }
        catch(error){
            setIsLoading(false);
            console.error("There was an error while signup!", error);
             if(typeof error.response == 'undefined'){
                alert('Sign up failed!! ');
            }
            else{
                alert('Sign up failed!!' + error.response.data);
            }
            

        }
    };

      const textFieldStyles = {
    '& .MuiOutlinedInput-root.Mui-focused .MuiOutlinedInput-notchedOutline': {
      borderColor: orange,
    },
    '& .MuiInputLabel-root.Mui-focused': {
      color: orange,
    },
  };
    return(
    // <div className='signup__main-container'>
    //     <div className='signup__signup-container'>
    //         <div className='signup__heading'>Sign Up</div>
    //         <div className='signup__signup-form'>
    //             <form className="signup__form" onSubmit={handleSubmit}>
    //                 <div className='signup__form-item'>
    //                     <label htmlFor="name">Name</label>
    //                     <input type='text' id="name" name='name' value={formData.name} onChange={handleChange} required></input>
    //                 </div>

    //                 <div className='signup__form-item'>
    //                     <label htmlFor='email'>Email</label>
    //                     <input type='email' id='email' name='email' value={formData.email} onChange={handleChange} required></input>
    //                 </div>

    //                 <div className='signup__form-item'>
    //                     <label htmlFor='username'>Username</label>
    //                     <input type='text' id='username' name='username' value={formData.username} onChange={handleChange} required></input>
    //                 </div>

    //                 <div className='signup__form-item'>
    //                     <label htmlFor='password'>Password</label>
    //                     <input type='password' id='password' name='password' value={formData.password} onChange={handleChange} required></input>
    //                 </div>

    //                 <div className='signup__form-item'>
    //                     <div className="signup__radio">
    //                         <div>
    //                             <label>Admin</label>
    //                             <input type="radio" name="role" onChange={handleOptionChange} value="admin" checked={formData.role === 'admin'}/>
    //                         </div>

    //                         <div>
    //                             <label>User</label>
    //                             <input type="radio" name="role" onChange={handleOptionChange} value="user" checked={formData.role === 'user'}/>                             
    //                         </div>
    //                     </div>
    //                 </div>
    //                 <div className='signup__button-container'>
    //                     <Link to='/login'><button className='signup__login-button' type='button' id='login'>Login</button></Link>
    //                     <button className='signup__signup-button' type='submit' id='submit' value='Submit' disabled={isLoading}>{isLoading ? 'Wait...' : 'Sign up'}</button>

    //                 </div>
    //                 <div className='signup__submit-response'>Submit response</div>                   
    //             </form>
    //         </div>
    //     </div>
    // </div>
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        p: 2, 
        bgcolor: '#f5f7fa',
      }}
    >
      {/* TASKFLOW Logo/Title */}
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

      {/* Signup Card Container */}
      <FormCard component="form" onSubmit={handleSubmit}>
        <CardContent sx={{ p: 0 }}>
          <Typography variant="h5" fontWeight="bold" sx={{ color: darkBlue, mb: 3 }}>
            Sign Up
          </Typography>
          
          {/* Name Input */}
          <TextField
            fullWidth
            margin="normal"
            label="Name"
            name="name"
            type="text"
            value={formData.name}
            onChange={handleChange}
            required
            variant="outlined"
            sx={textFieldStyles}
          />

          {/* Email Input */}
          <TextField
            fullWidth
            margin="normal"
            label="Email"
            name="email"
            type="email"
            value={formData.email}
            onChange={handleChange}
            required
            variant="outlined"
            sx={textFieldStyles}
          />

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
            sx={textFieldStyles}
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
            sx={textFieldStyles}
          />

          {/* Role Selection (Radio Buttons) */}
          <FormControl component="fieldset" margin="normal" sx={{ mt: 2 }}>
            <FormLabel component="legend" sx={{ color: darkBlue, fontWeight: 'medium' }}>
              Account Role
            </FormLabel>
            <RadioGroup
              row
              name="role"
              value={formData.role}
              onChange={handleOptionChange}
            >
              <FormControlLabel 
                value="admin" 
                control={<Radio size="small" sx={{ color: darkBlue, '&.Mui-checked': { color: orange } }} />} 
                label="Admin" 
              />
              <FormControlLabel 
                value="user" 
                control={<Radio size="small" sx={{ color: darkBlue, '&.Mui-checked': { color: orange } }} />} 
                label="User" 
              />
            </RadioGroup>
          </FormControl>


          {/* Response / Error Messages
          {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
          {submitResponse && <Alert severity="success" sx={{ mb: 2 }}>{submitResponse}</Alert>} */}

          {/* Button Container */}
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 3 }}>
            
            {/* Login Button (Secondary action) */}
            <Button
              component={Link}
              to="/login"
              variant="outlined"
              sx={{ 
                borderColor: darkBlue,
                color: darkBlue,
                '&:hover': {
                  borderColor: darkBlue,
                  bgcolor: 'rgba(34, 48, 72, 0.04)',
                }
              }}
            >
              Login
            </Button>

            {/* Sign Up Button (Primary action) */}
            <Button
              type="submit"
              variant="contained"
              disabled={isLoading ? true : false}
              sx={{
                bgcolor: orange,
                '&:hover': {
                  bgcolor: '#e66a3d', 
                },
              }}
              endIcon={isLoading ? <CircularProgress size={20} color="inherit" /> : null}
            >
              {isLoading ? 'Wait...' : 'Sign Up'}
            </Button>
          </Box>
        </CardContent>
      </FormCard>
    </Box>
    );
}

export default SignupForm;
