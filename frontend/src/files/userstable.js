import React from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Typography,
  Chip
} from '@mui/material';

// --- The UsersTable Component ---
const UsersTable = (usersdata) => {
  // Define table headers
  usersdata=usersdata.usersdata;
  const columns = [
    { id: 'name', label: 'Name' },
    { id: 'username', label: 'Username' },
    { id: 'email', label: 'Email' },
    { id: 'role', label: 'Role' },
    { id: 'created_at', label: 'Joined Date' },
    // { id: 'actions', label: 'Actions' } // For the button
  ];
  
  // Custom colors matching your design
  const orange = '#FF7F4F';
  const green = '#28A745';

  return (
    <TableContainer component={Paper} sx={{ boxShadow: 3 }}>
      <Table sx={{ minWidth: 650 }} aria-label="users table">
        
        {/* Table Header */}
        <TableHead sx={{ bgcolor: '#f5f5f5' }}>
          <TableRow>
            {columns.map((column) => (
              <TableCell key={column.id} sx={{ fontWeight: 'bold', color: '#223048' }}>
                {column.label}
              </TableCell>
            ))}
          </TableRow>
        </TableHead>
        
        {/* Table Body */}
        <TableBody>
          {usersdata.map((user) => {
            const isUserAdmin = user.role.toLowerCase() === 'admin';
            const roleColor = isUserAdmin ? orange : green;
            
            return (
              <TableRow
                key={user.id}
                sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
              >
                <TableCell component="th" scope="row">
                  <Typography variant="body1" fontWeight="medium">{user.name}</Typography>
                </TableCell>
                <TableCell>{user.username}</TableCell>
                <TableCell>{user.email}</TableCell>
                
                {/* Role Cell with Chip (Mimics your status chips) */}
                <TableCell>
                  <Chip
                    label={user.role}
                    size="small"
                    sx={{
                      backgroundColor: roleColor,
                      color: 'white',
                      fontWeight: 'bold',
                    }}
                  />
                </TableCell>
                
                {/* Formatted Date Cell */}
                <TableCell>
                  {new Date(user.created_at).toLocaleDateString()}
                </TableCell>
                
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </TableContainer>
  );
};

export default UsersTable;