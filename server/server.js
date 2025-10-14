const express = require('express');
const bodyParser = require('body-parser');
const jwt = require('jsonwebtoken');
const cookieParser = require('cookie-parser');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const rateLimit = require('express-rate-limit');
const {ipKeyGenerator} = require('express-rate-limit');
const {body, validationResult} = require('express-validator');
const mysql = require('mysql2/promise');

const port = process.env.PORT || 5000;
const SqlUrl = process.env.SQLURI || 'localhost';
const FrontEndOrigin = process.env.CORS_ORIGIN || 'http://localhost:3000';
const SQL_USERNAME = process.env.SQL_USERNAME || 'root';
const SQL_PASSWORD = process.env.SQL_PASSWORD || 'redsun4you';
const DBNAME = process.env.SQL_DBNAME || 'task_management';

const pool = mysql.createPool({
    host: SqlUrl,
    user: SQL_USERNAME,
    password: SQL_PASSWORD,
    database: DBNAME,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});


const setupQueries = [
    // 1. Users Table
    `
    CREATE TABLE IF NOT EXISTS users (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(100) NOT NULL,
        username VARCHAR(100) NOT NULL UNIQUE,
        email VARCHAR(100) NOT NULL,
        hash_password VARCHAR(200) NOT NULL,
        role VARCHAR(20) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
    `,
    // 2. Projects Table (Includes Foreign Key)
    `
    CREATE TABLE IF NOT EXISTS projects (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(100) NOT NULL,
        description VARCHAR(1000) NOT NULL,
        who_created INT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (who_created) REFERENCES users(id) ON DELETE RESTRICT
    );
    `,
    // 3. Tasks Table (Includes Foreign Keys)
    `
    CREATE TABLE IF NOT EXISTS tasks (
        id INT AUTO_INCREMENT PRIMARY KEY,
        project_id INT NOT NULL,
        name VARCHAR(100) NOT NULL,
        description VARCHAR(1000) NOT NULL,
        who_created INT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        status ENUM('Completed', 'To Do', 'In Progress') NOT NULL,
        priority ENUM('Low', 'Medium', 'High') NOT NULL,
        deadline TIMESTAMP NULL,
        task_member INT NOT NULL,
        
        FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE,
        FOREIGN KEY (who_created) REFERENCES users(id) ON DELETE RESTRICT,
        FOREIGN KEY (task_member) REFERENCES users(id) ON DELETE RESTRICT

    );
    `,
    // 4. project_members Table (Includes Foreign Keys)
    `
    CREATE TABLE IF NOT EXISTS project_members (
        id INT AUTO_INCREMENT PRIMARY KEY,
        project_id INT NOT NULL,
        user_id INT NOT NULL,
        
        FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE RESTRICT,
        CONSTRAINT unique_task_member UNIQUE (project_id, user_id) 

    );
    `
];

async function setupDatabase() {
    let pool;
    try {
        // Create the connection pool (assuming you use a pool)
        pool = mysql.createPool({
          host: SqlUrl,         // Your MySQL host
          user: SQL_USERNAME,              // Your MySQL username
          password: SQL_PASSWORD, // Your MySQL password
          database: DBNAME,    // The database you want to use
          waitForConnections: true,
          connectionLimit: 10,
          queueLimit: 0
        });
        console.log('Successfully connected to MySQL database pool.');

        // Execute each query sequentially
        for (const query of setupQueries) {
            await pool.execute(query);
        }
        
        console.log('All tables created or verified successfully.');

    } catch (error) {
        // The error will now likely point to a real issue if one exists
        console.error('Error during database setup:', error.message);
    } finally {
        // Close the pool if it was created successfully
        if (pool) {
            await pool.end();
            console.log('Pool closed.');
        }
    }
}
// Execute the function to set up the database
setupDatabase();

const app = express();
const ACCESS_TOKEN_SECRET = 'daf38f232adsf3243fgfa34sruewrunchr';
const REFRESH_TOKEN_SECRET = 'zcio45344cndf748b3434ncue4y8373dd';

const corsOptions = {
    origin: FrontEndOrigin, // frontend origin
    credentials: true, // allows to send cookies
    optionsSuccessStatus: 200 // allows to send cookie
};

app.use(cors(corsOptions));

const requestLimiter = rateLimit({
  windowMs: 2 * 60 * 1000, // 2 minutes
  max: 6, // Max 6 requests per IP per window
  message: 'Too many login attempts from this IP, please try again after 2 minutes',
  keyGenerator: (req, res) => {
    return ipKeyGenerator(req.ip); // Tracks attempts by IP address
  },
});



// Middleware
app.use(bodyParser.json());
app.use(cookieParser());

// This middleware will be used to protect certain routes.
const authenticateJWT = (req, res, next) => {
  // Get the access token from the Authorization header
  const authHeader = req.headers.authorization;
  if (!authHeader) {
    return res.status(401).json({ msg: 'Authorization header is missing.' });
  }

  const token = authHeader.split(' ')[1]; // Format: Bearer <token>
  if (!token) {
    return res.status(401).json({ msg: 'Access token is missing.' });
  }

  // Verify the access token
  jwt.verify(token, ACCESS_TOKEN_SECRET, (err, user) => {
    if (err) {
      // If the token is invalid or expired, respond with 401
      console.error('JWT verification failed:', err.message);
      return res.status(401).json({ msg: 'Access token expired or invalid.' });
    }
    // If verification is successful, attach the user payload to the request
    req.user = user;
    next();
  });
};

//This middleware is used to verify whether user is admin or not
const isAdmin = async (req, res, next) => {
  
  try{
    const refreshToken = req.cookies.refreshToken;
    const decoded = jwt.verify(refreshToken, REFRESH_TOKEN_SECRET);
    const userid = decoded.id;
    const query = 'Select * from users where id=?';
    const result = await pool.execute(query,[userid]);
    const [rows] = result;
    if (rows[0].role == 'admin'){
      req.id = userid;
      next()
    }
    else{
      return res.status(400).send("Invalid access!");
    }
}
catch (error) {
    return res.status(400).send('Error for admin access!');
  }
  
};

/* Login Routes */
app.post('/login', [
    body('username').trim().escape(),
  ],requestLimiter, async(req, res)=>{
  try{
    // const user = await User.findOne({username : req.body.username});
    const query = `Select * from users where username=?`;
    const [rows] = await pool.execute(query, [req.body.username]);
    const user = rows[0];
   if (rows.length < 1) {
    
      return res.status(400).send("Invalid credentials! ");
    }
    
    const isMatch = await bcrypt.compare(req.body.password, user.hash_password);
    if (!isMatch) {
      return res.status(400).send('Invalid credentials');
    }

    const accessToken = jwt.sign({
    id: user.id,
    username: user.username,
  }, ACCESS_TOKEN_SECRET, { expiresIn: '15m' });

  // Generate a long-lived refresh token (e.g., 7 days)
  const refreshToken = jwt.sign({
    id: user.id,
    username: user.username,
  }, REFRESH_TOKEN_SECRET, { expiresIn: '7d' });


  // Store the refresh token in an HttpOnly cookie for security
  res.cookie('refreshToken', refreshToken, {
    httpOnly: true, // Prevents client-side JavaScript from accessing the cookie
    secure: process.env.NODE_ENV === 'production', // Use secure in production
    sameSite: 'None', 
    maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days in milliseconds
  });

  // Send the access token back to the client
   return res.status(200).json({
    msg: 'Login Successfully',
    user:{id: user.id, name: user.name, username: user.username, email: user.email, role: user.role},
    accessToken: accessToken
  });

  }
  catch(err){
    console.error(err.message);
    res.status(500).send('Server error');
  }
});


app.post('/refresh_token', (req, res) => {
  const refreshToken = req.cookies.refreshToken;

  if (!refreshToken) {
    return res.status(401).json({ msg: 'No refresh token provided.' });
  }

  jwt.verify(refreshToken, REFRESH_TOKEN_SECRET, (err, user) => {
    if (err) {
      // If the refresh token is invalid or expired, clear the cookie and force re-login
      console.error('Refresh token verification failed:', err.message);
      res.clearCookie('refreshToken');
      return res.status(401).json({ msg: 'Refresh token expired or invalid.' });
    }

    // Generate a new access token
    const newAccessToken = jwt.sign({
      id: user.id,
      username: user.username,
    }, ACCESS_TOKEN_SECRET, { expiresIn: '15m' });

    res.status(200).json({ accessToken: newAccessToken });
  });
});


/* Registration routes */
// data validation for signup
app.post('/signup', [
    body('name').trim().escape().isLength({ min: 1}).withMessage('Provide name'),
    body('username').trim().escape().isLength({ min: 5 }).withMessage('Username must be at least 5 characters long.'),
    body('email').isEmail().normalizeEmail().withMessage('Please enter a valid email address.'),
    body('password').isLength({ min: 8 }).withMessage('Password must be at least 8 characters long.'),
    body('role').trim().escape(),

  ],requestLimiter, async (req, res, next)=>{

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).send('\nInvalid entries: \nUsername: min 5 characters, password: min 8 characters');
    }
  try{
    
    const query1 = 'SELECT COUNT(*) as count FROM users WHERE username = ?';
    const query2 = 'SELECT COUNT(*) as count FROM users WHERE role = "admin"';

    // const user = await User.findOne({username :req.body.username});
    const [rows] = await pool.execute(query1, [req.body.username]);

    if(rows[0].count > 0){
      return res.status(500).send('UserName already exists!');
    }
    
    if(req.body.role == 'admin'){
    const [rows] = await pool.execute(query2);
        if(rows[0].count > 0){
          return res.status(500).send('Admin role already exists!');
        }
        else{
          next();
        }
    }
    else{
      next();
    }
  }
  catch(err){
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// generating hash password for signup
app.post('/signup', async (req, res, next)=>{
  try{
    const password = req.body.password;
    const salt = await bcrypt.genSalt(5);
    const hashedPassword = await bcrypt.hash(password, salt);
    req.hashData = {hashedPassword: hashedPassword};
    next();
  }
  catch(error){
    console.error(err.message);
    return res.status(500).send('Server error');
  }

});

//adding signup data to database 
app.post('/signup', async (req, res) => {
  try {
    const query = `INSERT INTO users (name, username, email, hash_password, role) VALUES (?, ?, ?, ?, ?)`;
    const result = await pool.execute(query, [req.body.name, req.body.username, req.body.email, req.hashData.hashedPassword, req.body.role]);
    res.status(201).send('Form data saved successfully!');
  } catch (error) {
    res.status(500).send('Error saving data.');
  }
});

// route for creating project (only admin)
app.post('/createproject', 
   [body('name').trim().escape(),
    body('description').trim().escape().isLength({ min: 5 }).withMessage('Give description')
  ],authenticateJWT, isAdmin, async (req, res) => {

  try{
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      throw new Error("");
    }
    console.log(req.body);
    if(!req.body.members || req.body.members.length==0){
      throw new Error("");
    }
    let query = 'Insert into projects (name, description, who_created) VALUES(?, ?, ?)';
    const [ResultSetHeader] = await pool.execute(query, [req.body.name, req.body.description, req.id]);
    const project_id = ResultSetHeader.insertId;
    for (const user_id of req.body.members) {
      await pool.execute('Insert into project_members (project_id, user_id) VALUES(?,?)',[project_id, user_id]);
    }
    res.status(201).send('Project created successfully!');
  } catch (error) {
    console.log(error);
    return res.status(500).send('Error project creation.');
  }

});

// route for updating project (only admin)
app.put('/editproject/:projectid',
  [body('name').trim().escape(),
    body('description').trim().escape().isLength({ min: 5 }).withMessage('Give description')
  ],authenticateJWT, isAdmin, async (req, res) => {

  try{
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      throw new Error("");
    }
    // console.log(req.body);
    if(!req.body.members || req.body.members.length==0){
      throw new Error("");
    }
    const projectid = req.params.projectid;
    
    if (isNaN(projectid)) {
        return res.status(400).json({ msg: "Invalid project ID format." });
    }
    
    // You might want the ID as a number for database queries
    const idAsNumber = parseInt(projectid, 10); 
    let query = 'Update projects set name=?, description=?, who_created=? where id=?';
    let [rows] = await pool.execute(query, [req.body.name, req.body.description, req.id, idAsNumber]);
    if (rows.affectedRows === 0) {
          throw new Error("");
        }
    
    query = 'DELETE from project_members where project_id=?';
    [rows] = await pool.execute(query, [idAsNumber]);
    if (rows.affectedRows === 0) {
          throw new Error("");
        }
    for (const user_id of req.body.members) {
      await pool.execute('Insert into project_members (project_id, user_id) VALUES(?,?)',[idAsNumber, user_id]);
    }
    return res.status(201).send('Project updated successfully!');
  } catch (error) {
    console.log(error);
    res.status(500).send('Error project updation.');
  }

});

// route for viewing project (only admin/user)
app.get('/viewproject/:projectid', authenticateJWT, async (req, res) => {

  try{
    const projectid = req.params.projectid;
    if (isNaN(projectid)) {
        return res.status(400).json({ msg: "Invalid project ID format." });
    }
    
    // You might want the ID as a number for database queries
    const idAsNumber = parseInt(projectid, 10); 
    const query = `SELECT
    p.name AS title,
    p.description AS description,
    -- Count the total tasks for the specific project using a subquery
    (
        SELECT COUNT(t.id) 
        FROM tasks t 
        WHERE t.project_id = p.id
    ) AS taskscount,
    -- Group all member names into a single comma-separated string (array representation)
    GROUP_CONCAT(u.name SEPARATOR ', ') AS members
FROM
    projects p
LEFT JOIN
    project_members pm ON p.id = pm.project_id
LEFT JOIN
    users u ON pm.user_id = u.id
WHERE
    p.id = ?
GROUP BY
    p.id, p.name, p.description;`;
    const [rows] = await pool.execute(query, [idAsNumber]);
    // console.log(result);
    if(rows.length == 0){
      throw new Error("");
    }
    return res.status(201).json({
      msg:'Sucessfully data fetched!',
      data: rows[0]
    });
  } catch (error) {
    console.log(error);
    res.status(500).send('Error while fetching project details');
  }

});


// route for viewing all projects (only admin/user)
app.get('/viewallprojects', authenticateJWT, async (req, res) => {

  try{
    
    
    const query = 'Select * from projects';
    const [rows] = await pool.execute(query);
    // console.log(result);
    if(rows.length == 0){
      throw new Error("");
    }
    return res.status(201).json({
      msg:'Sucessfully data fetched!',
      data: rows
    });
  } catch (error) {
    console.log(error);
    res.status(500).send('Error while fetching project details');
  }

});

// route for deleting project (only admin)
app.delete('/deleteproject/:projectid', authenticateJWT,isAdmin, async (req, res) => {

  try{
    const projectid = req.params.projectid;
    if (isNaN(projectid)) {
        return res.status(400).json({ msg: "Invalid project ID format." });
    }
    
    // You might want the ID as a number for database queries
    const idAsNumber = parseInt(projectid, 10); 
    const query = 'DELETE FROM projects WHERE id=?;';
    const [ResultSetHeader] = await pool.execute(query, [idAsNumber]);
        if (ResultSetHeader.affectedRows === 0) {
          console.log("zero row affected");
          throw new Error("");
        }
    return res.status(201).json({
      msg:'Sucessfully project deleted!',
    });
  } catch (error) {
    console.log(error);
    return res.status(500).send('Error while deleting project');
  }

});

// route for creating task (only admin)
app.post('/createtask', authenticateJWT, isAdmin, async (req, res) => {

  try{
    let query = 'Select * from project_members where project_id=? and user_id=?';
    const [rows] = await pool.execute(query, [req.body.projectid, req.body.task_member]);
    if(rows.length == 0){
      return res.status(500).send('User not found in this project!');
    }


// 1. Create a Date object
const dateObj = new Date(req.body.deadline);

// 2. Get the date/time components in a format MySQL prefers (often requires padding)
const year = dateObj.getUTCFullYear();
const month = String(dateObj.getUTCMonth() + 1).padStart(2, '0');
const day = String(dateObj.getUTCDate()).padStart(2, '0');
const hours = String(dateObj.getUTCHours()).padStart(2, '0');
const minutes = String(dateObj.getUTCMinutes()).padStart(2, '0');
const seconds = String(dateObj.getUTCSeconds()).padStart(2, '0');

// 3. Assemble the MySQL-friendly UTC string
const deadline = `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`; 

    query = 'Insert into tasks (project_id, name, description, who_created, status, priority, deadline, task_member) VALUES(?, ?, ?, ?, ?, ?, ?,?)';
    const result = await pool.execute(query, [req.body.projectid, req.body.name, req.body.description, req.id, req.body.status, req.body.priority, deadline, req.body.task_member]);
    res.status(201).send('Task created successfully!');
  } catch (error) {
    console.log(error);
    return res.status(500).send('Error task creation.');
  }

});

// route for updating task (only admin)
app.put('/edittask/:taskid', authenticateJWT, isAdmin, async (req, res) => {

  try{
    const taskid = req.params.taskid;
    if (isNaN(taskid)) {
        return res.status(400).json({ msg: "Invalid task ID format." });
    }

    // 1. Create a Date object
const dateObj = new Date(req.body.deadline);

// 2. Get the date/time components in a format MySQL prefers (often requires padding)
const year = dateObj.getUTCFullYear();
const month = String(dateObj.getUTCMonth() + 1).padStart(2, '0');
const day = String(dateObj.getUTCDate()).padStart(2, '0');
const hours = String(dateObj.getUTCHours()).padStart(2, '0');
const minutes = String(dateObj.getUTCMinutes()).padStart(2, '0');
const seconds = String(dateObj.getUTCSeconds()).padStart(2, '0');

// 3. Assemble the MySQL-friendly UTC string
const deadline = `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`; 

    let query = 'Select * from project_members where project_id=? and user_id=?';
    const [rows] = await pool.execute(query, [req.body.projectid, req.body.task_member]);
    if(rows.affectedRows == 0){
      return res.status(500).send('No record found for this task in the project!');
    }
    
    // You might want the ID as a number for database queries
    const idAsNumber = parseInt(taskid, 10); 
    query = 'Update tasks set project_id=?, name=?, description=?, who_created=?, status=?, priority=?, deadline=?, task_member=? where id=?';
    const result = await pool.execute(query, [req.body.projectid, req.body.name, req.body.description, req.id, req.body.status, req.body.priority, deadline, req.body.task_member, idAsNumber]);
    // console.log(result);
    return res.status(201).send('Task updated successfully!');
  } catch (error) {
    console.log(error);
    return res.status(500).send('Error task updation.');
  }

});

// route for viewing task (only admin/user)
app.get('/viewtask/:taskid', authenticateJWT, async (req, res) => {

  try{
    const taskid = req.params.taskid;
    if (isNaN(taskid)) {
        return res.status(400).json({ msg: "Invalid task ID format." });
    }
    
    // You might want the ID as a number for database queries
    const idAsNumber = parseInt(taskid, 10); 
    const query = 'Select * from tasks where id=?';
    const [rows] = await pool.execute(query, [idAsNumber]);
    if (rows.length == 0){
      throw new Error("");
    }
    return res.status(201).json({
      msg:'Sucessfully data fetched!',
      data: rows[0]
    });
  } catch (error) {
    console.log(error);
    res.status(500).send('Error while fetching project details');
  }

});


// route for viewing all tasks of a project (only admin/user)
app.get('/viewalltasks/:projectid', authenticateJWT, async (req, res) => {

  try{
    const projectid = req.params.projectid;
    if (isNaN(projectid)) {
        return res.status(400).json({ msg: "Invalid project ID format." });
    }
    
    // You might want the ID as a number for database queries
    const idAsNumber = parseInt(projectid, 10); 
    const query = `SELECT  t.*, t.task_member AS task_member_id, u.name AS task_member FROM tasks t
JOIN
    users u ON t.task_member = u.id
WHERE
    t.project_id = ?;
`;
    const [rows] = await pool.execute(query,[idAsNumber]);
    if (rows.length == 0){
      throw new Error("");
    }
    return res.status(201).json({
      msg:'Sucessfully data fetched!',
      data: rows
    });
  } catch (error) {
    console.log(error);
    res.status(500).send('Error while fetching project details');
  }

});

// route for deleting task (only admin)
app.delete('/deletetask/:taskid', authenticateJWT,isAdmin, async (req, res) => {

  try{
    const taskid = req.params.taskid;
    if (isNaN(taskid)) {
        return res.status(400).json({ msg: "Invalid task ID format." });
    }
    
    // You might want the ID as a number for database queries
    const idAsNumber = parseInt(taskid, 10); 
    const query = 'DELETE FROM tasks WHERE id=?;';
    const [ResultSetHeader] = await pool.execute(query, [idAsNumber]);
        if (ResultSetHeader.affectedRows === 0) {
          console.log("zero row affected");
          throw new Error("");
        }
    res.status(201).json({
      msg:'Sucessfully task deleted!',
    });
  } catch (error) {
    console.log(error);
    res.status(500).send('Error while deleting task');
  }

});

// route for adding project member (only admin)
app.post('/addprojectmember/:projectid/:userid', authenticateJWT, isAdmin, async (req, res) => {

  try{
    const projectid = req.params.projectid;
    if (isNaN(projectid)) {
        return res.status(400).json({ msg: "Invalid project ID format." });
    }
    const userid = req.params.userid;
    if (isNaN(userid)) {
        return res.status(400).json({ msg: "Invalid task ID format." });
    }
    
    // You might want the ID as a number for database queries
    const idAsNumber1 = parseInt(projectid, 10); 
    const idAsNumber2 = parseInt(userid, 10); 
    const query = 'Insert into project_members (project_id, user_id) VALUES(?, ?)';
    const result = await pool.execute(query, [idAsNumber1, idAsNumber2]);
    res.status(201).send('Member added successfully!');
  } catch (error) {
    console.log(error);
    res.status(500).send('Error member addition.');
  }

});

// route for viewing task members for a project (admin/user)
app.get('/viewprojectmembers/:projectid', authenticateJWT, async (req, res) => {

  try{
    const projectid = req.params.projectid;
    if (isNaN(projectid)) {
        return res.status(400).json({ msg: "Invalid project ID format." });
    }
    
    // You might want the ID as a number for database queries
    const idAsNumber = parseInt(projectid, 10); 
        // const query = 'SELECT * from project_members where project_id=?';

    const query = `SELECT
    pm.user_id as id,          -- Included the user_id from the project_members table
    u.name AS name  -- Included the name from the users table
FROM
    project_members pm
INNER JOIN
    users u ON pm.user_id = u.id
WHERE
    pm.project_id = ?;`;
    const [rows] = await pool.execute(query, [idAsNumber]);
    if (rows.length == 0){
      throw new Error("");
    }
    res.status(201).json({
      msg:'Sucessfully data fetched!',
      data: rows
    });
  } catch (error) {
    console.log(error);
    res.status(500).send('Error while fetching project members');
  }

});


// route for viewing all task members for all project (admin/user)
app.get('/viewallprojectmembers', authenticateJWT, async (req, res) => {

  try{
    const query = 'Select * from project_members';
    const [rows] = await pool.execute(query);
    if (rows.length == 0){
      throw new Error("");
    }
    res.status(201).json({
      msg:'Sucessfully data fetched!',
      data: rows
    });
  } catch (error) {
    console.log(error);
    res.status(500).send('Error while fetching project members');
  }

});

// route for deleting project member (only admin)
app.delete('/deleteprojectmember/:projectid/:userid', authenticateJWT,isAdmin, async (req, res) => {

  try{
    const projectid = req.params.projectid;
    if (isNaN(projectid)) {
        return res.status(400).json({ msg: "Invalid project ID format." });
    }
    const userid = req.params.userid;
    if (isNaN(userid)) {
        return res.status(400).json({ msg: "Invalid task ID format." });
    }
    
    // You might want the ID as a number for database queries
    const idAsNumber1 = parseInt(projectid, 10); 
    const idAsNumber2 = parseInt(userid, 10); 
    const query = 'DELETE FROM project_members WHERE project_id=? AND user_id=?;';
    const [rows] = await pool.execute(query, [idAsNumber1, idAsNumber2]);
    if(rows.affectedRows == 0){
        throw new Error("");
    }
    res.status(201).json({
      msg:'Sucessfully project member deleted!',
    });
  } catch (error) {
    console.log(error);
    return res.status(500).send('Error while deleting project member');
  }

});

// route for viewing project (only admin/user)
app.get('/viewallusers', authenticateJWT, isAdmin, async (req, res) => {

  try{
    const query = 'Select * from users';
    const [rows] = await pool.execute(query);
    // console.log(result);
    if(rows.length == 0){
      throw new Error("");
    }
    return res.status(201).json({
      msg:'Sucessfully data fetched!',
      data: rows
    });
  } catch (error) {
    console.log(error);
    res.status(500).send('Error while fetching users details');
  }

});

// route for getting the project/tasks summary
app.get('/getsummary', authenticateJWT, async (req, res) => {

  try{
    
const query = `SELECT
    p.id,
    p.name,
    COALESCE(pm_count.teamMembers, 0) AS teamMembers,
    COALESCE(pm_count.teamMembersid, 0) AS teamMembersid,
    COALESCE(t_status.total_tasks, 0) AS tasks, 
    
    -- 1. CALCULATE PROJECT PROGRESS PERCENTAGE
    COALESCE(
        -- Use DECIMAL division to ensure accurate percentage calculation
        (t_status.completed_count * 100 DIV t_status.total_tasks), 
        0
    ) AS progress,
    
    -- 2. CALCULATE PROJECT STATUS
    CASE
        -- Rule 1: If there are NO tasks, status is 'To Do'.
        WHEN COALESCE(t_status.total_tasks, 0) = 0 THEN 'To Do'
        
        -- Rule 2: If ALL tasks are 'Completed', status is 'Completed'.
        WHEN t_status.completed_count = t_status.total_tasks THEN 'Completed'
        
        -- Rule 3: If there is AT LEAST 1 task 'In Progress', status is 'In Progress'.
        WHEN t_status.in_progress_count > 0 THEN 'In Progress'
        
        -- Rule 4: Otherwise, all tasks are 'To Do'.
        ELSE 'To Do'
    END AS status

FROM
    projects p
LEFT JOIN
    -- 1. Subquery for Team Members Count (pm_count)
    (SELECT project_id, COUNT(user_id) AS teamMembers, GROUP_CONCAT(user_id SEPARATOR ',') AS teamMembersid FROM project_members GROUP BY project_id) AS pm_count
    ON p.id = pm_count.project_id
    
LEFT JOIN
    -- 2. Comprehensive Subquery for Task Aggregation (t_status)
    (
        SELECT 
            project_id,
            COUNT(id) AS total_tasks,
            -- Conditional Aggregation for Completed tasks
            SUM(CASE WHEN status = 'Completed' THEN 1 ELSE 0 END) AS completed_count,
            -- Conditional Aggregation for In Progress tasks
            SUM(CASE WHEN status = 'In Progress' THEN 1 ELSE 0 END) AS in_progress_count
        FROM 
            tasks 
        GROUP BY 
            project_id
    ) AS t_status
    ON p.id = t_status.project_id
    
ORDER BY
    p.id;`;

    const [rows] = await pool.execute(query);
    // console.log(result);
   
    // console.log(rows);
    if(rows.length == 0){
      throw new Error("");
    }
    return res.status(201).json({
      msg:'Sucessfully data fetched!',
      data: rows
    });
  } catch (error) {
    console.log(error);
    res.status(500).send('Error while fetching project details');
  }

});


// Logout route
app.post('/logout', (req, res) => {
  // Clear the HttpOnly cookie containing the refresh token
  res.clearCookie('refreshToken', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'None',
  });

  res.status(200).json({ message: 'Logged out successfully.' });
});

app.get('/', (req, res) => {
  res.send('Your server is running!!');
});
app.listen(port, () => {
  console.log(`Server is running on port: ${port}`);
});





