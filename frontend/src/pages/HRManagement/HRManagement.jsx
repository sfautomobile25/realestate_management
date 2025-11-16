import React, { useEffect, useState } from 'react';
import {
  Box,
  Paper,
  Typography,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  MenuItem,
  Alert,
  Snackbar,
  Grid,
  Card,
  CardContent,
  Tabs,
  Tab
} from '@mui/material';
import { Add, Edit, Delete, People, Business, AttachMoney, Payment, Refresh } from '@mui/icons-material';
import { useDispatch, useSelector } from 'react-redux';
import {
  fetchEmployees,
  fetchDepartments,
  fetchAvailableUsers,
  createEmployee,
  createDepartment,
  fetchSalaries,
  generateSalaries,
  processSalary
} from '../../store/slices/hrSlice';

const HRManagement = () => {
  const dispatch = useDispatch();
  const { 
    users: { items: availableUsers, loading: usersLoading, error: usersError },
    employees: { items: employees, loading: employeesLoading, error: employeesError },
    departments: { items: departments, loading: departmentsLoading, error: departmentsError },
    salaries: { items: salaries, loading: salariesLoading, error: salariesError }
  } = useSelector(state => state.hr);
  
  // Debug: Check what users exist in the system
  const allUsers = useSelector(state => state.auth.users); // If you have this in auth slice
  
  const [activeTab, setActiveTab] = useState(0);
  const [openEmployeeDialog, setOpenEmployeeDialog] = useState(false);
  const [openDepartmentDialog, setOpenDepartmentDialog] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

  const [employeeForm, setEmployeeForm] = useState({
    user_id: '',
    department_id: '',
    employee_id: '',
    position: '',
    salary: '',
    joining_date: new Date().toISOString().split('T')[0],
    emergency_contact: '',
    bank_account_number: '',
    bank_name: ''
  });

  const [departmentForm, setDepartmentForm] = useState({
    name: '',
    description: ''
  });

  useEffect(() => {
    console.log('HR Management - Loading data...');
    loadHRData();
  }, [dispatch]);

  const loadHRData = () => {
    dispatch(fetchEmployees());
    dispatch(fetchDepartments());
    dispatch(fetchAvailableUsers());
    dispatch(fetchSalaries());
  };

  const handleOpenEmployeeDialog = () => {
    setEmployeeForm({
      user_id: '',
      department_id: '',
      employee_id: `EMP${Date.now().toString().slice(-6)}`,
      position: '',
      salary: '',
      joining_date: new Date().toISOString().split('T')[0],
      emergency_contact: '',
      bank_account_number: '',
      bank_name: ''
    });
    setOpenEmployeeDialog(true);
  };

  const handleOpenDepartmentDialog = () => {
    setDepartmentForm({
      name: '',
      description: ''
    });
    setOpenDepartmentDialog(true);
  };

  const handleCloseEmployeeDialog = () => {
    setOpenEmployeeDialog(false);
  };

  const handleCloseDepartmentDialog = () => {
    setOpenDepartmentDialog(false);
  };

  const handleEmployeeSubmit = async () => {
    try {
      const submitData = {
        ...employeeForm,
        salary: parseFloat(employeeForm.salary),
        joining_date: employeeForm.joining_date
      };

      console.log('Creating employee with data:', submitData);
      await dispatch(createEmployee(submitData)).unwrap();
      setSnackbar({ open: true, message: 'Employee created successfully', severity: 'success' });
      handleCloseEmployeeDialog();
      // Refresh available users
      dispatch(fetchAvailableUsers());
    } catch (error) {
      console.error('Error creating employee:', error);
      setSnackbar({ open: true, message: 'Failed to create employee: ' + error.message, severity: 'error' });
    }
  };

  const handleDepartmentSubmit = async () => {
    try {
      await dispatch(createDepartment(departmentForm)).unwrap();
      setSnackbar({ open: true, message: 'Department created successfully', severity: 'success' });
      handleCloseDepartmentDialog();
    } catch (error) {
      setSnackbar({ open: true, message: 'Failed to create department: ' + error.message, severity: 'error' });
    }
  };

  const handleGenerateSalaries = async () => {
    try {
      const currentMonth = new Date().toISOString().split('T')[0].substring(0, 7) + '-01';
      await dispatch(generateSalaries(currentMonth)).unwrap();
      setSnackbar({ open: true, message: 'Salaries generated successfully', severity: 'success' });
    } catch (error) {
      setSnackbar({ open: true, message: 'Failed to generate salaries: ' + error.message, severity: 'error' });
    }
  };

  const handleProcessSalary = async (salary) => {
    try {
      await dispatch(processSalary({
        salary_id: salary.id,
        paid_date: new Date().toISOString().split('T')[0]
      })).unwrap();
      setSnackbar({ open: true, message: 'Salary processed successfully', severity: 'success' });
      dispatch(fetchSalaries());
    } catch (error) {
      setSnackbar({ open: true, message: 'Failed to process salary: ' + error.message, severity: 'error' });
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      active: 'success',
      inactive: 'default',
      suspended: 'error'
    };
    return colors[status] || 'default';
  };

  // Debug information
  console.log('Available Users:', availableUsers);
  console.log('Employees:', employees);
  console.log('Departments:', departments);
  console.log('Salaries:', salaries);

  // Calculate HR statistics
  const stats = {
    totalEmployees: employees.length,
    totalDepartments: departments.length,
    activeEmployees: employees.filter(emp => emp.status === 'active').length,
    totalSalary: employees.reduce((sum, emp) => sum + parseFloat(emp.salary || 0), 0),
    pendingSalaries: salaries.filter(s => s.status === 'pending').length,
    paidSalaries: salaries.filter(s => s.status === 'paid').length,
    availableUsersCount: availableUsers.length
  };

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4">HR Management</Typography>
        <Button
          variant="outlined"
          startIcon={<Refresh />}
          onClick={loadHRData}
        >
          Refresh Data
        </Button>
      </Box>

      {/* Debug Information */}
      <Box mb={3} p={2} bgcolor="background.default" borderRadius={1}>
        <Typography variant="h6" gutterBottom>Debug Information:</Typography>
        <Grid container spacing={2}>
          <Grid item xs={6} sm={3}>
            <Typography variant="body2">Available Users: {stats.availableUsersCount}</Typography>
          </Grid>
          <Grid item xs={6} sm={3}>
            <Typography variant="body2">Total Employees: {stats.totalEmployees}</Typography>
          </Grid>
          <Grid item xs={6} sm={3}>
            <Typography variant="body2">Departments: {stats.totalDepartments}</Typography>
          </Grid>
          <Grid item xs={6} sm={3}>
            <Typography variant="body2">Salaries: {salaries.length}</Typography>
          </Grid>
        </Grid>
      </Box>

      {/* HR Statistics */}
      <Grid container spacing={3} mb={4}>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center" mb={2}>
                <People color="primary" sx={{ mr: 2 }} />
                <Typography color="textSecondary">Total Employees</Typography>
              </Box>
              <Typography variant="h4">{stats.totalEmployees}</Typography>
              <Typography variant="body2" color="textSecondary">
                {stats.activeEmployees} active
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center" mb={2}>
                <Business color="secondary" sx={{ mr: 2 }} />
                <Typography color="textSecondary">Departments</Typography>
              </Box>
              <Typography variant="h4">{stats.totalDepartments}</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center" mb={2}>
                <AttachMoney color="warning" sx={{ mr: 2 }} />
                <Typography color="textSecondary">Monthly Salary</Typography>
              </Box>
              <Typography variant="h6" color="warning.main">
                ${stats.totalSalary.toLocaleString()}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center" mb={2}>
                <Payment color={stats.pendingSalaries > 0 ? "error" : "success"} sx={{ mr: 2 }} />
                <Typography color="textSecondary">Pending Salaries</Typography>
              </Box>
              <Typography variant="h4" color={stats.pendingSalaries > 0 ? "error" : "success"}>
                {stats.pendingSalaries}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <Tabs value={activeTab} onChange={(e, newValue) => setActiveTab(newValue)} sx={{ mb: 3 }}>
        <Tab label="Employees" />
        <Tab label="Departments" />
        <Tab label="Salary Management" />
        <Tab label="Available Users" />
      </Tabs>

      {employeesError && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {employeesError}
        </Alert>
      )}

      {departmentsError && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {departmentsError}
        </Alert>
      )}

      {salariesError && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {salariesError}
        </Alert>
      )}

      {usersError && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {usersError}
        </Alert>
      )}

      {activeTab === 0 && (
        <Box>
          <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
            <Typography variant="h5">Employees</Typography>
            <Button
              variant="contained"
              startIcon={<Add />}
              onClick={handleOpenEmployeeDialog}
              disabled={availableUsers.length === 0}
            >
              Add Employee ({availableUsers.length} users available)
            </Button>
          </Box>

          {availableUsers.length === 0 && !usersLoading && (
            <Alert severity="info" sx={{ mb: 2 }}>
              No available users found. Please create users first in the system before adding them as employees.
            </Alert>
          )}

          {employeesLoading ? (
            <Typography>Loading employees...</Typography>
          ) : employees.length === 0 ? (
            <Paper sx={{ p: 4, textAlign: 'center' }}>
              <People sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
              <Typography variant="h6" gutterBottom>
                No Employees Found
              </Typography>
              <Typography variant="body1" color="textSecondary" sx={{ mb: 3 }}>
                Get started by adding your first employee from the available users.
              </Typography>
              <Button 
                variant="contained" 
                startIcon={<Add />}
                onClick={handleOpenEmployeeDialog}
                disabled={availableUsers.length === 0}
              >
                Add First Employee
              </Button>
            </Paper>
          ) : (
            <TableContainer component={Paper}>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Employee ID</TableCell>
                    <TableCell>Name</TableCell>
                    <TableCell>Email</TableCell>
                    <TableCell>Position</TableCell>
                    <TableCell>Department</TableCell>
                    <TableCell>Salary</TableCell>
                    <TableCell>Status</TableCell>
                    <TableCell>Join Date</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {employees.map((employee) => (
                    <TableRow key={employee.id}>
                      <TableCell>
                        <Typography variant="subtitle2">
                          {employee.employee_id}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        {employee.User?.first_name} {employee.User?.last_name}
                      </TableCell>
                      <TableCell>
                        {employee.User?.email}
                      </TableCell>
                      <TableCell>{employee.position}</TableCell>
                      <TableCell>
                        {employee.Department?.name || 'N/A'}
                      </TableCell>
                      <TableCell>
                        <Typography fontWeight="bold">
                          ${parseFloat(employee.salary || 0).toLocaleString()}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Chip 
                          label={employee.status} 
                          color={getStatusColor(employee.status)}
                          size="small"
                        />
                      </TableCell>
                      <TableCell>
                        {new Date(employee.joining_date).toLocaleDateString()}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </Box>
      )}

      {activeTab === 1 && (
        <Box>
          <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
            <Typography variant="h5">Departments</Typography>
            <Button
              variant="contained"
              startIcon={<Add />}
              onClick={handleOpenDepartmentDialog}
            >
              Add Department
            </Button>
          </Box>

          {departmentsLoading ? (
            <Typography>Loading departments...</Typography>
          ) : departments.length === 0 ? (
            <Paper sx={{ p: 4, textAlign: 'center' }}>
              <Business sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
              <Typography variant="h6" gutterBottom>
                No Departments Found
              </Typography>
              <Typography variant="body1" color="textSecondary" sx={{ mb: 3 }}>
                Create your first department to organize employees.
              </Typography>
              <Button 
                variant="contained" 
                startIcon={<Add />}
                onClick={handleOpenDepartmentDialog}
              >
                Add First Department
              </Button>
            </Paper>
          ) : (
            <Grid container spacing={3}>
              {departments.map((department) => (
                <Grid item xs={12} sm={6} md={4} key={department.id}>
                  <Card variant="outlined">
                    <CardContent>
                      <Typography variant="h6" gutterBottom>
                        {department.name}
                      </Typography>
                      <Typography variant="body2" color="textSecondary" gutterBottom>
                        {department.description || 'No description'}
                      </Typography>
                      <Box mt={2}>
                        <Typography variant="body2">
                          <strong>Employees:</strong> {department.Employees?.length || 0}
                        </Typography>
                        <Typography variant="body2">
                          <strong>Status:</strong> 
                          <Chip 
                            label={department.is_active ? 'Active' : 'Inactive'} 
                            color={department.is_active ? 'success' : 'default'}
                            size="small"
                            sx={{ ml: 1 }}
                          />
                        </Typography>
                      </Box>
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>
          )}
        </Box>
      )}

      {activeTab === 2 && (
        <Box>
          <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
            <Typography variant="h5">Salary Management</Typography>
            <Box>
              <Button
                variant="outlined"
                startIcon={<Payment />}
                onClick={handleGenerateSalaries}
                sx={{ mr: 2 }}
                disabled={employees.length === 0}
              >
                Generate Salaries
              </Button>
              <Typography variant="body2" color="textSecondary" display="inline">
                Current Month: {new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
              </Typography>
            </Box>
          </Box>

          {employees.length === 0 && (
            <Alert severity="warning" sx={{ mb: 2 }}>
              No employees found. Please add employees first to generate salaries.
            </Alert>
          )}

          {salariesLoading ? (
            <Typography>Loading salary records...</Typography>
          ) : salaries.length === 0 ? (
            <Paper sx={{ p: 4, textAlign: 'center' }}>
              <AttachMoney sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
              <Typography variant="h6" gutterBottom>
                No Salary Records
              </Typography>
              <Typography variant="body1" color="textSecondary" sx={{ mb: 3 }}>
                Generate salaries for the current month to get started.
              </Typography>
              <Button 
                variant="contained" 
                startIcon={<Payment />}
                onClick={handleGenerateSalaries}
                disabled={employees.length === 0}
              >
                Generate Salaries
              </Button>
            </Paper>
          ) : (
            <TableContainer component={Paper}>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Employee</TableCell>
                    <TableCell>Month</TableCell>
                    <TableCell>Basic Salary</TableCell>
                    <TableCell>Allowances</TableCell>
                    <TableCell>Deductions</TableCell>
                    <TableCell>Net Salary</TableCell>
                    <TableCell>Status</TableCell>
                    <TableCell>Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {salaries.map((salary) => (
                    <TableRow key={salary.id}>
                      <TableCell>
                        {salary.Employee?.User?.first_name} {salary.Employee?.User?.last_name}
                      </TableCell>
                      <TableCell>
                        {new Date(salary.month).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                      </TableCell>
                      <TableCell>${parseFloat(salary.basic_salary || 0).toLocaleString()}</TableCell>
                      <TableCell>${parseFloat(salary.allowances || 0).toLocaleString()}</TableCell>
                      <TableCell>${parseFloat(salary.deductions || 0).toLocaleString()}</TableCell>
                      <TableCell>
                        <Typography fontWeight="bold">
                          ${parseFloat(salary.net_salary || 0).toLocaleString()}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Chip 
                          label={salary.status} 
                          color={salary.status === 'paid' ? 'success' : salary.status === 'pending' ? 'warning' : 'error'}
                          size="small"
                        />
                      </TableCell>
                      <TableCell>
                        {salary.status === 'pending' && (
                          <Button
                            size="small"
                            variant="outlined"
                            color="success"
                            onClick={() => handleProcessSalary(salary)}
                          >
                            Pay
                          </Button>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </Box>
      )}

      {activeTab === 3 && (
        <Box>
          <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
            <Typography variant="h5">Available Users for Employee Creation</Typography>
            <Typography variant="body2" color="textSecondary">
              {availableUsers.length} users available
            </Typography>
          </Box>

          {usersLoading ? (
            <Typography>Loading available users...</Typography>
          ) : availableUsers.length === 0 ? (
            <Paper sx={{ p: 4, textAlign: 'center' }}>
              <People sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
              <Typography variant="h6" gutterBottom>
                No Available Users
              </Typography>
              <Typography variant="body1" color="textSecondary" sx={{ mb: 3 }}>
                All registered users are already employees or no users exist in the system.
                Create new users through the registration system first.
              </Typography>
            </Paper>
          ) : (
            <TableContainer component={Paper}>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>User ID</TableCell>
                    <TableCell>Name</TableCell>
                    <TableCell>Email</TableCell>
                    <TableCell>Phone</TableCell>
                    <TableCell>Role</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {availableUsers.map((user) => (
                    <TableRow key={user.id}>
                      <TableCell>{user.id}</TableCell>
                      <TableCell>
                        {user.first_name} {user.last_name}
                      </TableCell>
                      <TableCell>{user.email}</TableCell>
                      <TableCell>{user.phone || 'N/A'}</TableCell>
                      <TableCell>
                        <Chip label={user.role} size="small" color="primary" />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </Box>
      )}

      {/* Employee Form Dialog */}
      <Dialog open={openEmployeeDialog} onClose={handleCloseEmployeeDialog} maxWidth="md" fullWidth>
        <DialogTitle>Add New Employee</DialogTitle>
        <DialogContent>
          <Box component="form" sx={{ mt: 2 }}>
            <TextField
              fullWidth
              label="Employee ID"
              value={employeeForm.employee_id}
              onChange={(e) => setEmployeeForm({ ...employeeForm, employee_id: e.target.value })}
              margin="normal"
              required
              helperText="Auto-generated employee ID"
            />
            <TextField
              fullWidth
              select
              label="Select User"
              value={employeeForm.user_id}
              onChange={(e) => setEmployeeForm({ ...employeeForm, user_id: e.target.value })}
              margin="normal"
              required
              helperText="Select a user to register as employee"
            >
              {availableUsers.map((user) => (
                <MenuItem key={user.id} value={user.id}>
                  {user.first_name} {user.last_name} - {user.email} (ID: {user.id})
                </MenuItem>
              ))}
            </TextField>
            <TextField
              fullWidth
              select
              label="Department"
              value={employeeForm.department_id}
              onChange={(e) => setEmployeeForm({ ...employeeForm, department_id: e.target.value })}
              margin="normal"
            >
              <MenuItem value="">No Department</MenuItem>
              {departments.map((dept) => (
                <MenuItem key={dept.id} value={dept.id}>
                  {dept.name}
                </MenuItem>
              ))}
            </TextField>
            <TextField
              fullWidth
              label="Position"
              value={employeeForm.position}
              onChange={(e) => setEmployeeForm({ ...employeeForm, position: e.target.value })}
              margin="normal"
              required
              placeholder="e.g., Sales Manager, Accountant"
            />
            <TextField
              fullWidth
              label="Monthly Salary"
              type="number"
              value={employeeForm.salary}
              onChange={(e) => setEmployeeForm({ ...employeeForm, salary: e.target.value })}
              margin="normal"
              required
              placeholder="e.g., 50000"
            />
            <TextField
              fullWidth
              label="Joining Date"
              type="date"
              value={employeeForm.joining_date}
              onChange={(e) => setEmployeeForm({ ...employeeForm, joining_date: e.target.value })}
              margin="normal"
              InputLabelProps={{ shrink: true }}
              required
            />
            <TextField
              fullWidth
              label="Emergency Contact"
              value={employeeForm.emergency_contact}
              onChange={(e) => setEmployeeForm({ ...employeeForm, emergency_contact: e.target.value })}
              margin="normal"
              placeholder="Name and phone number"
            />
            <TextField
              fullWidth
              label="Bank Account Number"
              value={employeeForm.bank_account_number}
              onChange={(e) => setEmployeeForm({ ...employeeForm, bank_account_number: e.target.value })}
              margin="normal"
            />
            <TextField
              fullWidth
              label="Bank Name"
              value={employeeForm.bank_name}
              onChange={(e) => setEmployeeForm({ ...employeeForm, bank_name: e.target.value })}
              margin="normal"
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseEmployeeDialog}>Cancel</Button>
          <Button onClick={handleEmployeeSubmit} variant="contained">
            Add Employee
          </Button>
        </DialogActions>
      </Dialog>

      {/* Department Form Dialog */}
      <Dialog open={openDepartmentDialog} onClose={handleCloseDepartmentDialog} maxWidth="sm" fullWidth>
        <DialogTitle>Add New Department</DialogTitle>
        <DialogContent>
          <Box component="form" sx={{ mt: 2 }}>
            <TextField
              fullWidth
              label="Department Name"
              value={departmentForm.name}
              onChange={(e) => setDepartmentForm({ ...departmentForm, name: e.target.value })}
              margin="normal"
              required
              placeholder="e.g., Sales, Finance, HR"
            />
            <TextField
              fullWidth
              label="Description"
              value={departmentForm.description}
              onChange={(e) => setDepartmentForm({ ...departmentForm, description: e.target.value })}
              margin="normal"
              multiline
              rows={3}
              placeholder="Brief description of the department's responsibilities"
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDepartmentDialog}>Cancel</Button>
          <Button onClick={handleDepartmentSubmit} variant="contained">
            Add Department
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
      >
        <Alert 
          onClose={() => setSnackbar({ ...snackbar, open: false })} 
          severity={snackbar.severity}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default HRManagement;