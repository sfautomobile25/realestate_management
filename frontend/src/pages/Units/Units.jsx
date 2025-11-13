import React from 'react';
import {
  Box,
  Paper,
  Typography,
  Button,
  Alert
} from '@mui/material';
import { Add } from '@mui/icons-material';

const Units = () => {
  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4">Units Management</Typography>
        <Button
          variant="contained"
          startIcon={<Add />}
        >
          Add Unit
        </Button>
      </Box>

      <Paper sx={{ p: 3 }}>
        <Alert severity="info">
          Units management page is under development. This will include:
          <ul>
            <li>View all units across projects</li>
            <li>Add new units to buildings</li>
            <li>Update unit status (available, sold, rented)</li>
            <li>Set prices and specifications</li>
            <li>Track unit sales and rentals</li>
          </ul>
        </Alert>
      </Paper>
    </Box>
  );
};

export default Units;