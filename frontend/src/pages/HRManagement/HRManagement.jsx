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
  Tab,
  FormControl,
  InputLabel,
  Select,
  Switch,
  FormControlLabel,
  Divider,
  Tooltip
} from '@mui/material';
import {
  Add,
  Edit,
  Delete,
  People,
  Business,
  AttachMoney,
  Payment,
  Refresh,
  Schedule,
  History,
  Receipt,
  PlayArrow,
  Stop,
  Print
} from '@mui/icons-material';
import { useDispatch, useSelector } from 'react-redux';
import {
  fetchEmployees,
  fetchDepartments,
  fetchAvailableUsers,
  createEmployee,
  createDepartment,
  fetchSalaries,
  generateSalaries,
  processSalaryPayment,
  fetchSalaryPayments,
  generateAdvanceSalary,
  fetchAttendance,
  checkIn,
  checkOut,
  updateEmployeeStatus,
  updateEmployeeSalary,
  clearReceipt
} from '../../store/slices/hrSlice';
import { format } from 'date-fns';

const HRManagement = () => {
  const dispatch = useDispatch();
  const { 
    users: { items: availableUsers, loading: usersLoading, error: usersError },
    employees: { items: employees, loading: employeesLoading, error: employeesError },
    departments: { items: departments, loading: departmentsLoading, error: departmentsError },
    salaries: { items: salaries, loading: salariesLoading, error: salariesError },
    attendance: { items: attendance, loading: attendanceLoading, error: attendanceError },
    salaryPayments: { items: salaryPayments, loading: paymentsLoading, error: paymentsError },
    currentReceipt
  } = useSelector(state => state.hr);
  
  const { user: currentUser } = useSelector(state => state.auth);
  
  const [activeTab, setActiveTab] = useState(0);
  const [openEmployeeDialog, setOpenEmployeeDialog] = useState(false);
  const [openDepartmentDialog, setOpenDepartmentDialog] = useState(false);
  const [openSalaryPaymentDialog, setOpenSalaryPaymentDialog] = useState(false);
  const [openAdvanceSalaryDialog, setOpenAdvanceSalaryDialog] = useState(false);
  const [openEmployeeEditDialog, setOpenEmployeeEditDialog] = useState(false);
  const [openPaymentHistoryDialog, setOpenPaymentHistoryDialog] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [selectedSalary, setSelectedSalary] = useState(null);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

  // Form states
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

  const [salaryPaymentForm, setSalaryPaymentForm] = useState({
    salary_id: '',
    amount: '',
    payment_type: 'full',
    payment_method: 'cash',
    reference_number: '',
    notes: ''
  });

  const [advanceSalaryForm, setAdvanceSalaryForm] = useState({
    employee_id: '',
    amount: '',
    advance_month: new Date().toISOString().split('T')[0].substring(0, 7) + '-01',
    payment_method: 'cash',
    reference_number: '',
    notes: ''
  });

  const [employeeEditForm, setEmployeeEditForm] = useState({
    salary: '',
    status: 'active'
  });

  // Load data
  useEffect(() => {
    loadHRData();
  }, [dispatch]);

  const loadHRData = () => {
    dispatch(fetchEmployees());
    dispatch(fetchDepartments());
    dispatch(fetchAvailableUsers());
    dispatch(fetchSalaries());
    dispatch(fetchAttendance());
  };

  // Employee Management
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

  const handleOpenEmployeeEditDialog = (employee) => {
    setSelectedEmployee(employee);
    setEmployeeEditForm({
      salary: employee.salary,
      status: employee.status
    });
    setOpenEmployeeEditDialog(true);
  };

  const handleCloseEmployeeEditDialog = () => {
    setOpenEmployeeEditDialog(false);
    setSelectedEmployee(null);
  };

  const handleEmployeeEditSubmit = async () => {
    try {
      if (employeeEditForm.salary !== selectedEmployee.salary) {
        await dispatch(updateEmployeeSalary({
          id: selectedEmployee.id,
          salary: employeeEditForm.salary
        })).unwrap();
      }
      
      if (employeeEditForm.status !== selectedEmployee.status) {
        await dispatch(updateEmployeeStatus({
          id: selectedEmployee.id,
          status: employeeEditForm.status
        })).unwrap();
      }
      
      setSnackbar({ open: true, message: 'Employee updated successfully', severity: 'success' });
      handleCloseEmployeeEditDialog();
      dispatch(fetchEmployees());
    } catch (error) {
      setSnackbar({ open: true, message: 'Failed to update employee: ' + error.message, severity: 'error' });
    }
  };

  // Department Management
  const handleOpenDepartmentDialog = () => {
    setDepartmentForm({
      name: '',
      description: ''
    });
    setOpenDepartmentDialog(true);
  };

  // Salary Payment Management
  const handleOpenSalaryPaymentDialog = (salary) => {
    setSelectedSalary(salary);
    setSalaryPaymentForm({
      salary_id: salary.id,
      amount: salary.remaining_amount > 0 ? salary.remaining_amount : salary.net_salary,
      payment_type: salary.remaining_amount > 0 ? 'installment' : 'full',
      payment_method: 'cash',
      reference_number: '',
      notes: ''
    });
    setOpenSalaryPaymentDialog(true);
  };

  const handleOpenAdvanceSalaryDialog = () => {
    setAdvanceSalaryForm({
      employee_id: '',
      amount: '',
      advance_month: new Date().toISOString().split('T')[0].substring(0, 7) + '-01',
      payment_method: 'cash',
      reference_number: '',
      notes: ''
    });
    setOpenAdvanceSalaryDialog(true);
  };

  const handleOpenPaymentHistoryDialog = (salary) => {
    setSelectedSalary(salary);
    dispatch(fetchSalaryPayments(salary.id));
    setOpenPaymentHistoryDialog(true);
  };

  // Close dialogs
  const handleCloseEmployeeDialog = () => setOpenEmployeeDialog(false);
  const handleCloseDepartmentDialog = () => setOpenDepartmentDialog(false);
  const handleCloseSalaryPaymentDialog = () => setOpenSalaryPaymentDialog(false);
  const handleCloseAdvanceSalaryDialog = () => setOpenAdvanceSalaryDialog(false);
  const handleClosePaymentHistoryDialog = () => setOpenPaymentHistoryDialog(false);

  // Form submissions
  const handleEmployeeSubmit = async () => {
    try {
      const submitData = {
        ...employeeForm,
        salary: parseFloat(employeeForm.salary),
        joining_date: employeeForm.joining_date
      };

      await dispatch(createEmployee(submitData)).unwrap();
      setSnackbar({ open: true, message: 'Employee created successfully', severity: 'success' });
      handleCloseEmployeeDialog();
    } catch (error) {
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

  const handleSalaryPaymentSubmit = async () => {
    try {
      const submitData = {
        ...salaryPaymentForm,
        amount: parseFloat(salaryPaymentForm.amount)
      };

      await dispatch(processSalaryPayment(submitData)).unwrap();
      setSnackbar({ open: true, message: 'Salary payment processed successfully', severity: 'success' });
      handleCloseSalaryPaymentDialog();
      dispatch(fetchSalaries());
    } catch (error) {
      setSnackbar({ open: true, message: 'Failed to process payment: ' + error.message, severity: 'error' });
    }
  };

  const handleAdvanceSalarySubmit = async () => {
    try {
      const submitData = {
        ...advanceSalaryForm,
        amount: parseFloat(advanceSalaryForm.amount)
      };

      await dispatch(generateAdvanceSalary(submitData)).unwrap();
      setSnackbar({ open: true, message: 'Advance salary generated successfully', severity: 'success' });
      handleCloseAdvanceSalaryDialog();
      dispatch(fetchSalaries());
    } catch (error) {
      setSnackbar({ open: true, message: 'Failed to generate advance salary: ' + error.message, severity: 'error' });
    }
  };

  // Attendance Management
  const handleCheckIn = async (employeeId) => {
    try {
      await dispatch(checkIn({
        employee_id: employeeId,
        notes: 'Regular check-in'
      })).unwrap();
      setSnackbar({ open: true, message: 'Checked in successfully', severity: 'success' });
      dispatch(fetchAttendance());
    } catch (error) {
      setSnackbar({ open: true, message: 'Failed to check in: ' + error.message, severity: 'error' });
    }
  };

  const handleCheckOut = async (employeeId) => {
    try {
      await dispatch(checkOut({
        employee_id: employeeId,
        notes: 'Regular check-out'
      })).unwrap();
      setSnackbar({ open: true, message: 'Checked out successfully', severity: 'success' });
      dispatch(fetchAttendance());
    } catch (error) {
      setSnackbar({ open: true, message: 'Failed to check out: ' + error.message, severity: 'error' });
    }
  };

  // Check if employee is checked in today
  const isCheckedInToday = (employeeId) => {
    const today = new Date().toISOString().split('T')[0];
    return attendance.find(att => 
      att.employee_id === employeeId && 
      att.date === today && 
      !att.check_out
    );
  };

  // Receipt Printing
  const handlePrintReceipt = () => {
    if (currentReceipt) {
      const receiptWindow = window.open('', '_blank');
      receiptWindow.document.write(`
        <html>
          <head>
            <title>Salary Receipt - ${currentReceipt.receipt_number}</title>
            <style>
              body { font-family: Arial, sans-serif; margin: 20px; }
              .receipt { border: 2px solid #000; padding: 20px; max-width: 500px; }
              .header { text-align: center; margin-bottom: 20px; }
              .details { margin: 10px 0; }
              .footer { margin-top: 20px; text-align: center; }
              .signature { margin-top: 50px; border-top: 1px solid #000; padding-top: 10px; }
            </style>
          </head>
          <body>
            <div class="receipt">
              <div class="header">
                <h2>Salary Payment Receipt</h2>
                <p>Receipt No: ${currentReceipt.receipt_number}</p>
                <p>Date: ${new Date().toLocaleDateString()}</p>
              </div>
              <div class="details">
                <p><strong>Employee:</strong> ${currentReceipt.payment.Salary.Employee.User.first_name} ${currentReceipt.payment.Salary.Employee.User.last_name}</p>
                <p><strong>Amount:</strong> $${currentReceipt.payment.amount}</p>
                <p><strong>Payment Type:</strong> ${currentReceipt.payment.payment_type}</p>
                <p><strong>Payment Method:</strong> ${currentReceipt.payment.payment_method}</p>
                <p><strong>Reference:</strong> ${currentReceipt.payment.reference_number || 'N/A'}</p>
                <p><strong>Notes:</strong> ${currentReceipt.payment.notes || 'N/A'}</p>
              </div>
              <div class="footer">
                <div class="signature">
                  <p>Authorized Signature</p>
                </div>
                <p>Thank you for your service!</p>
              </div>
            </div>
          </body>
        </html>
      `);
      receiptWindow.document.close();
      receiptWindow.print();
    }
  };

  // Clear receipt after printing
  useEffect(() => {
    if (currentReceipt) {
      setTimeout(() => {
        dispatch(clearReceipt());
      }, 5000);
    }
  }, [currentReceipt, dispatch]);

  // Helper functions
  const getStatusColor = (status) => {
    const colors = {
      active: 'success',
      inactive: 'default',
      suspended: 'error',
      pending: 'warning',
      partial: 'info',
      paid: 'success',
      overdue: 'error'
    };
    return colors[status] || 'default';
  };

  // Calculate statistics
  const stats = {
    totalEmployees: employees.length,
    totalDepartments: departments.length,
    activeEmployees: employees.filter(emp => emp.status === 'active').length,
    totalSalary: employees.reduce((sum, emp) => sum + parseFloat(emp.salary || 0), 0),
    pendingSalaries: salaries.filter(s => s.status === 'pending').length,
    paidSalaries: salaries.filter(s => s.status === 'paid').length,
    todayAttendance: attendance.filter(att => att.date === new Date().toISOString().split('T')[0]).length
  };

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4">HR Management System</Typography>
        <Button
          variant="outlined"
          startIcon={<Refresh />}
          onClick={loadHRData}
        >
          Refresh Data
        </Button>
      </Box>

      {/* Statistics Cards */}
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
                <Schedule color="info" sx={{ mr: 2 }} />
                <Typography color="textSecondary">Today's Attendance</Typography>
              </Box>
              <Typography variant="h4" color="info.main">
                {stats.todayAttendance}
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
        <Tab label="Employee Management" />
        <Tab label="Attendance Tracking" />
        <Tab label="Salary Management" />
        <Tab label="Departments" />
      </Tabs>

      {/* Error Alerts */}
      {employeesError && <Alert severity="error" sx={{ mb: 2 }}>{employeesError}</Alert>}
      {departmentsError && <Alert severity="error" sx={{ mb: 2 }}>{departmentsError}</Alert>}
      {salariesError && <Alert severity="error" sx={{ mb: 2 }}>{salariesError}</Alert>}
      {attendanceError && <Alert severity="error" sx={{ mb: 2 }}>{attendanceError}</Alert>}
      {paymentsError && <Alert severity="error" sx={{ mb: 2 }}>{paymentsError}</Alert>}

      {/* Employee Management Tab */}
      {activeTab === 0 && (
        <Box>
          <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
            <Typography variant="h5">Employee Management</Typography>
            <Box>
              <Button
                variant="outlined"
                startIcon={<AttachMoney />}
                onClick={handleOpenAdvanceSalaryDialog}
                sx={{ mr: 2 }}
              >
                Advance Salary
              </Button>
              <Button
                variant="contained"
                startIcon={<Add />}
                onClick={handleOpenEmployeeDialog}
                disabled={availableUsers.length === 0}
              >
                Add Employee
              </Button>
            </Box>
          </Box>

          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Employee ID</TableCell>
                  <TableCell>Name</TableCell>
                  <TableCell>Position</TableCell>
                  <TableCell>Department</TableCell>
                  <TableCell>Salary</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {employees.map((employee) => (
                  <TableRow key={employee.id}>
                    <TableCell>{employee.employee_id}</TableCell>
                    <TableCell>
                      {employee.User?.first_name} {employee.User?.last_name}
                    </TableCell>
                    <TableCell>{employee.position}</TableCell>
                    <TableCell>{employee.Department?.name || 'N/A'}</TableCell>
                    <TableCell>${parseFloat(employee.salary || 0).toLocaleString()}</TableCell>
                    <TableCell>
                      <Chip 
                        label={employee.status} 
                        color={getStatusColor(employee.status)}
                        size="small"
                      />
                    </TableCell>
                    <TableCell>
                      <Tooltip title="Edit Employee">
                        <IconButton
                          size="small"
                          onClick={() => handleOpenEmployeeEditDialog(employee)}
                        >
                          <Edit />
                        </IconButton>
                      </Tooltip>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Box>
      )}

      {/* Attendance Tracking Tab */}
      {activeTab === 1 && (
        <Box>
          <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
            <Typography variant="h5">Attendance Tracking</Typography>
            <Typography variant="body2" color="textSecondary">
              Today: {new Date().toLocaleDateString()}
            </Typography>
          </Box>

          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Employee</TableCell>
                  <TableCell>Department</TableCell>
                  <TableCell>Check-in Time</TableCell>
                  <TableCell>Check-out Time</TableCell>
                  <TableCell>Total Hours</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {employees.map((employee) => {
                  const todayAttendance = isCheckedInToday(employee.id);
                  return (
                    <TableRow key={employee.id}>
                      <TableCell>
                        {employee.User?.first_name} {employee.User?.last_name}
                      </TableCell>
                      <TableCell>{employee.Department?.name || 'N/A'}</TableCell>
                      <TableCell>
                        {todayAttendance ? format(new Date(todayAttendance.check_in), 'hh:mm a') : 'Not checked in'}
                      </TableCell>
                      <TableCell>
                        {todayAttendance?.check_out ? format(new Date(todayAttendance.check_out), 'hh:mm a') : 'Not checked out'}
                      </TableCell>
                      <TableCell>
                        {todayAttendance?.total_hours || '0'} hours
                      </TableCell>
                      <TableCell>
                        <Chip 
                          label={todayAttendance ? (todayAttendance.check_out ? 'Completed' : 'Checked In') : 'Absent'} 
                          color={todayAttendance ? (todayAttendance.check_out ? 'success' : 'warning') : 'error'}
                          size="small"
                        />
                      </TableCell>
                      <TableCell>
                        {!todayAttendance ? (
                          <Tooltip title="Check In">
                            <IconButton
                              size="small"
                              color="success"
                              onClick={() => handleCheckIn(employee.id)}
                            >
                              <PlayArrow />
                            </IconButton>
                          </Tooltip>
                        ) : !todayAttendance.check_out ? (
                          <Tooltip title="Check Out">
                            <IconButton
                              size="small"
                              color="error"
                              onClick={() => handleCheckOut(employee.id)}
                            >
                              <Stop />
                            </IconButton>
                          </Tooltip>
                        ) : null}
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </TableContainer>
        </Box>
      )}

      {/* Salary Management Tab */}
      {activeTab === 2 && (
        <Box>
          <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
            <Typography variant="h5">Salary Management</Typography>
            <Box>
              <Button
                variant="outlined"
                startIcon={<AttachMoney />}
                onClick={handleOpenAdvanceSalaryDialog}
                sx={{ mr: 2 }}
              >
                Advance Salary
              </Button>
              <Button
                variant="contained"
                startIcon={<Payment />}
                onClick={() => {
                  const currentMonth = new Date().toISOString().split('T')[0].substring(0, 7) + '-01';
                  dispatch(generateSalaries(currentMonth));
                }}
                disabled={employees.length === 0}
              >
                Generate Salaries
              </Button>
            </Box>
          </Box>

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
                  <TableCell>Paid Amount</TableCell>
                  <TableCell>Remaining</TableCell>
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
                    <TableCell>${parseFloat(salary.paid_amount || 0).toLocaleString()}</TableCell>
                    <TableCell>
                      <Typography color={salary.remaining_amount > 0 ? "error" : "success"}>
                        ${parseFloat(salary.remaining_amount || 0).toLocaleString()}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Chip 
                        label={salary.status} 
                        color={getStatusColor(salary.status)}
                        size="small"
                      />
                    </TableCell>
                    <TableCell>
                      <Box display="flex" gap={1}>
                        {salary.remaining_amount > 0 && (
                          <Tooltip title="Make Payment">
                            <IconButton
                              size="small"
                              color="primary"
                              onClick={() => handleOpenSalaryPaymentDialog(salary)}
                            >
                              <Payment />
                            </IconButton>
                          </Tooltip>
                        )}
                        <Tooltip title="Payment History">
                          <IconButton
                            size="small"
                            color="info"
                            onClick={() => handleOpenPaymentHistoryDialog(salary)}
                          >
                            <History />
                          </IconButton>
                        </Tooltip>
                      </Box>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Box>
      )}

      {/* Departments Tab */}
      {activeTab === 3 && (
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
        </Box>
      )}

      {/* Dialogs */}
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
            />
            <TextField
              fullWidth
              select
              label="Select User"
              value={employeeForm.user_id}
              onChange={(e) => setEmployeeForm({ ...employeeForm, user_id: e.target.value })}
              margin="normal"
              required
            >
              {availableUsers.map((user) => (
                <MenuItem key={user.id} value={user.id}>
                  {user.first_name} {user.last_name} - {user.email}
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
            />
            <TextField
              fullWidth
              label="Monthly Salary"
              type="number"
              value={employeeForm.salary}
              onChange={(e) => setEmployeeForm({ ...employeeForm, salary: e.target.value })}
              margin="normal"
              required
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
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseEmployeeDialog}>Cancel</Button>
          <Button onClick={handleEmployeeSubmit} variant="contained">
            Add Employee
          </Button>
        </DialogActions>
      </Dialog>

      {/* Employee Edit Dialog */}
      <Dialog open={openEmployeeEditDialog} onClose={handleCloseEmployeeEditDialog} maxWidth="sm" fullWidth>
        <DialogTitle>Edit Employee</DialogTitle>
        <DialogContent>
          <Box component="form" sx={{ mt: 2 }}>
            <TextField
              fullWidth
              label="Monthly Salary"
              type="number"
              value={employeeEditForm.salary}
              onChange={(e) => setEmployeeEditForm({ ...employeeEditForm, salary: e.target.value })}
              margin="normal"
              required
            />
            <FormControl fullWidth margin="normal">
              <InputLabel>Status</InputLabel>
              <Select
                value={employeeEditForm.status}
                label="Status"
                onChange={(e) => setEmployeeEditForm({ ...employeeEditForm, status: e.target.value })}
              >
                <MenuItem value="active">Active</MenuItem>
                <MenuItem value="inactive">Inactive</MenuItem>
                <MenuItem value="suspended">Suspended</MenuItem>
              </Select>
            </FormControl>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseEmployeeEditDialog}>Cancel</Button>
          <Button onClick={handleEmployeeEditSubmit} variant="contained">
            Update Employee
          </Button>
        </DialogActions>
      </Dialog>

      {/* Department Dialog */}
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
            />
            <TextField
              fullWidth
              label="Description"
              value={departmentForm.description}
              onChange={(e) => setDepartmentForm({ ...departmentForm, description: e.target.value })}
              margin="normal"
              multiline
              rows={3}
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

      {/* Salary Payment Dialog */}
      <Dialog open={openSalaryPaymentDialog} onClose={handleCloseSalaryPaymentDialog} maxWidth="sm" fullWidth>
        <DialogTitle>Process Salary Payment</DialogTitle>
        <DialogContent>
          <Box component="form" sx={{ mt: 2 }}>
            <TextField
              fullWidth
              label="Amount"
              type="number"
              value={salaryPaymentForm.amount}
              onChange={(e) => setSalaryPaymentForm({ ...salaryPaymentForm, amount: e.target.value })}
              margin="normal"
              required
            />
            <FormControl fullWidth margin="normal">
              <InputLabel>Payment Type</InputLabel>
              <Select
                value={salaryPaymentForm.payment_type}
                label="Payment Type"
                onChange={(e) => setSalaryPaymentForm({ ...salaryPaymentForm, payment_type: e.target.value })}
              >
                <MenuItem value="full">Full Payment</MenuItem>
                <MenuItem value="installment">Installment</MenuItem>
              </Select>
            </FormControl>
            <FormControl fullWidth margin="normal">
              <InputLabel>Payment Method</InputLabel>
              <Select
                value={salaryPaymentForm.payment_method}
                label="Payment Method"
                onChange={(e) => setSalaryPaymentForm({ ...salaryPaymentForm, payment_method: e.target.value })}
              >
                <MenuItem value="cash">Cash</MenuItem>
                <MenuItem value="bank_transfer">Bank Transfer</MenuItem>
                <MenuItem value="check">Check</MenuItem>
                <MenuItem value="online">Online</MenuItem>
              </Select>
            </FormControl>
            <TextField
              fullWidth
              label="Reference Number"
              value={salaryPaymentForm.reference_number}
              onChange={(e) => setSalaryPaymentForm({ ...salaryPaymentForm, reference_number: e.target.value })}
              margin="normal"
            />
            <TextField
              fullWidth
              label="Notes"
              value={salaryPaymentForm.notes}
              onChange={(e) => setSalaryPaymentForm({ ...salaryPaymentForm, notes: e.target.value })}
              margin="normal"
              multiline
              rows={2}
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseSalaryPaymentDialog}>Cancel</Button>
          <Button onClick={handleSalaryPaymentSubmit} variant="contained">
            Process Payment
          </Button>
        </DialogActions>
      </Dialog>

      {/* Advance Salary Dialog */}
      <Dialog open={openAdvanceSalaryDialog} onClose={handleCloseAdvanceSalaryDialog} maxWidth="sm" fullWidth>
        <DialogTitle>Generate Advance Salary</DialogTitle>
        <DialogContent>
          <Box component="form" sx={{ mt: 2 }}>
            <FormControl fullWidth margin="normal">
              <InputLabel>Employee</InputLabel>
              <Select
                value={advanceSalaryForm.employee_id}
                label="Employee"
                onChange={(e) => setAdvanceSalaryForm({ ...advanceSalaryForm, employee_id: e.target.value })}
                required
              >
                {employees.map((emp) => (
                  <MenuItem key={emp.id} value={emp.id}>
                    {emp.User?.first_name} {emp.User?.last_name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <TextField
              fullWidth
              label="Advance Amount"
              type="number"
              value={advanceSalaryForm.amount}
              onChange={(e) => setAdvanceSalaryForm({ ...advanceSalaryForm, amount: e.target.value })}
              margin="normal"
              required
            />
            <TextField
              fullWidth
              label="Advance For Month"
              type="month"
              value={advanceSalaryForm.advance_month.substring(0, 7)}
              onChange={(e) => setAdvanceSalaryForm({ ...advanceSalaryForm, advance_month: e.target.value + '-01' })}
              margin="normal"
              InputLabelProps={{ shrink: true }}
              required
            />
            <FormControl fullWidth margin="normal">
              <InputLabel>Payment Method</InputLabel>
              <Select
                value={advanceSalaryForm.payment_method}
                label="Payment Method"
                onChange={(e) => setAdvanceSalaryForm({ ...advanceSalaryForm, payment_method: e.target.value })}
              >
                <MenuItem value="cash">Cash</MenuItem>
                <MenuItem value="bank_transfer">Bank Transfer</MenuItem>
                <MenuItem value="check">Check</MenuItem>
                <MenuItem value="online">Online</MenuItem>
              </Select>
            </FormControl>
            <TextField
              fullWidth
              label="Reference Number"
              value={advanceSalaryForm.reference_number}
              onChange={(e) => setAdvanceSalaryForm({ ...advanceSalaryForm, reference_number: e.target.value })}
              margin="normal"
            />
            <TextField
              fullWidth
              label="Notes"
              value={advanceSalaryForm.notes}
              onChange={(e) => setAdvanceSalaryForm({ ...advanceSalaryForm, notes: e.target.value })}
              margin="normal"
              multiline
              rows={2}
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseAdvanceSalaryDialog}>Cancel</Button>
          <Button onClick={handleAdvanceSalarySubmit} variant="contained">
            Generate Advance
          </Button>
        </DialogActions>
      </Dialog>

      {/* Payment History Dialog */}
      <Dialog open={openPaymentHistoryDialog} onClose={handleClosePaymentHistoryDialog} maxWidth="md" fullWidth>
        <DialogTitle>
          Payment History - {selectedSalary?.Employee?.User?.first_name} {selectedSalary?.Employee?.User?.last_name}
        </DialogTitle>
        <DialogContent>
          <TableContainer component={Paper} sx={{ mt: 2 }}>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>Receipt No</TableCell>
                  <TableCell>Date</TableCell>
                  <TableCell>Amount</TableCell>
                  <TableCell>Type</TableCell>
                  <TableCell>Method</TableCell>
                  <TableCell>Reference</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {salaryPayments.map((payment) => (
                  <TableRow key={payment.id}>
                    <TableCell>{payment.receipt_number}</TableCell>
                    <TableCell>
                      {new Date(payment.payment_date).toLocaleDateString()}
                    </TableCell>
                    <TableCell>${parseFloat(payment.amount).toLocaleString()}</TableCell>
                    <TableCell>
                      <Chip 
                        label={payment.payment_type} 
                        size="small"
                        color={payment.payment_type === 'advance' ? 'warning' : 'primary'}
                      />
                    </TableCell>
                    <TableCell>{payment.payment_method}</TableCell>
                    <TableCell>{payment.reference_number || 'N/A'}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClosePaymentHistoryDialog}>Close</Button>
        </DialogActions>
      </Dialog>

      {/* Receipt Dialog */}
      <Dialog open={!!currentReceipt} onClose={() => dispatch(clearReceipt())} maxWidth="sm" fullWidth>
        <DialogTitle>Payment Receipt</DialogTitle>
        <DialogContent>
          {currentReceipt && (
            <Box sx={{ p: 2, border: '2px solid #000', borderRadius: 1 }}>
              <Typography variant="h6" align="center" gutterBottom>
                Salary Payment Receipt
              </Typography>
              <Divider sx={{ my: 1 }} />
              <Box sx={{ mb: 2 }}>
                <Typography><strong>Receipt No:</strong> {currentReceipt.receipt_number}</Typography>
                <Typography><strong>Date:</strong> {new Date().toLocaleDateString()}</Typography>
                <Typography><strong>Employee:</strong> {currentReceipt.payment.Salary.Employee.User.first_name} {currentReceipt.payment.Salary.Employee.User.last_name}</Typography>
                <Typography><strong>Amount:</strong> ${currentReceipt.payment.amount}</Typography>
                <Typography><strong>Payment Type:</strong> {currentReceipt.payment.payment_type}</Typography>
                <Typography><strong>Payment Method:</strong> {currentReceipt.payment.payment_method}</Typography>
                <Typography><strong>Reference:</strong> {currentReceipt.payment.reference_number || 'N/A'}</Typography>
              </Box>
              <Divider sx={{ my: 1 }} />
              <Typography variant="body2" align="center" color="textSecondary">
                Thank you for your service!
              </Typography>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => dispatch(clearReceipt())}>Close</Button>
          <Button 
            variant="contained" 
            startIcon={<Print />}
            onClick={handlePrintReceipt}
          >
            Print Receipt
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar */}
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