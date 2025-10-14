import SignupForm from "./files/signup.js";
import LoginForm from "./files/login.js";
import Users from "./files/users.js";
// import UserData from "./files/userdata.js";
import Projects from "./files/projects.js";
import Tasks from "./files/tasks.js"
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { UserProvider } from './files/UserContext';
import { ThemeProvider } from '@mui/material/styles'; 
import { CssBaseline } from '@mui/material';
import theme from './files/theme.js'


function App() {
  return (
    <ThemeProvider theme={theme}>      
      <CssBaseline />
      <UserProvider>
        <BrowserRouter>
          <Routes>
            {/* <Route path="/userdata" element={<UserData />} /> */}
            <Route path="/signup" element={<SignupForm />} />
            <Route path="/login" element={<LoginForm />} />
            <Route path="/projects" element={<Projects />}/>
            <Route path="/users" element={<Users />}/>
            <Route path="/tasks/:projectid" element={<Tasks />}/>
            <Route path="/" element={<SignupForm />} />
          </Routes>
        </BrowserRouter>
      </UserProvider>
    </ThemeProvider>
  );
}

export default App;
