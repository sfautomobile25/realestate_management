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
  CardActions,
  Divider
} from '@mui/material';
import { 
  Add, 
  Edit, 
  Receipt, 
  Payment, 
  CalendarToday,
  Print,
  Visibility,
  Delete
} from '@mui/icons-material';
import { useDispatch, useSelector } from 'react-redux';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import {
  fetchRentals,
  createRental,
  generateMonthlyBills,
  getFinancialSummary,
  updateRental,
  deleteRental
} from '../../store/slices/rentalSlice';
import { fetchCustomers } from '../../store/slices/customerSlice';
import { fetchUnits } from '../../store/slices/unitSlice';
import { processPayment } from '../../store/slices/paymentSlice';
import Receipts from '../../components/rentals/Receipts';

const Rentals = () => {
  const dispatch = useDispatch();
  const { items: rentals, loading, financialSummary } = useSelector(state => state.rentals);
  const { items: customers } = useSelector(state => state.customers);
  const { items: units } = useSelector(state => state.units);
  
  const [activeTab, setActiveTab] = useState(0);
  const [openDialog, setOpenDialog] = useState(false);
  const [openBillingDialog, setOpenBillingDialog] = useState(false);
  const [openPaymentDialog, setOpenPaymentDialog] = useState(false);
  const [openReceiptDialog, setOpenReceiptDialog] = useState(false);
  const [selectedRental, setSelectedRental] = useState(null);
  const [billingMonth, setBillingMonth] = useState(new Date());
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const [currentPayment, setCurrentPayment] = useState(null);



  const [formData, setFormData] = useState({
    unit_id: '',
    tenant_id: '',
    monthly_rent: '',
    security_deposit: '',
    lease_start: '',
    lease_end: '',
    late_fee_percentage: 5,
    grace_period_days: 5
  });

  const [paymentForm, setPaymentForm] = useState({
    amount: '',
    payment_method: 'cash',
    reference_number: '',
    notes: ''
  });

  useEffect(() => {
    dispatch(fetchRentals());
    dispatch(fetchCustomers());
    dispatch(fetchUnits());
  }, [dispatch]);

  useEffect(() => {
    if (selectedRental) {
      dispatch(getFinancialSummary(selectedRental.id));
    }
  }, [selectedRental, dispatch]);

  // Enhanced dialog handlers
  const handleOpenDialog = (rental = null) => {
    if (rental) {
      setSelectedRental(rental);
      setFormData({
        unit_id: rental.unit_id,
        tenant_id: rental.tenant_id,
        monthly_rent: rental.monthly_rent,
        security_deposit: rental.security_deposit,
        lease_start: rental.lease_start ? rental.lease_start.split('T')[0] : '',
        lease_end: rental.lease_end ? rental.lease_end.split('T')[0] : '',
        late_fee_percentage: rental.late_fee_percentage || 5,
        grace_period_days: rental.grace_period_days || 5
      });
    } else {
      setSelectedRental(null);
      setFormData({
        unit_id: '',
        tenant_id: '',
        monthly_rent: '',
        security_deposit: '',
        lease_start: '',
        lease_end: '',
        late_fee_percentage: 5,
        grace_period_days: 5
      });
    }
    setOpenDialog(true);
  };

  const handleOpenBillingDialog = (rental) => {
    setSelectedRental(rental);
    setBillingMonth(new Date());
    setOpenBillingDialog(true);
  };

  const handleOpenPaymentDialog = (rental) => {
    setSelectedRental(rental);
    setPaymentForm({
      amount: rental.monthly_rent || '',
      payment_method: 'cash',
      reference_number: '',
      notes: ''
    });
    setOpenPaymentDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setSelectedRental(null);
  };

  const handleCloseBillingDialog = () => {
    setOpenBillingDialog(false);
  };

  const handleClosePaymentDialog = () => {
    setOpenPaymentDialog(false);
  };

  // Enhanced submit handlers
  const handleSubmit = async () => {
    try {
      if (selectedRental) {
        await dispatch(updateRental({ 
          id: selectedRental.id, 
          rentalData: formData 
        })).unwrap();
        setSnackbar({ open: true, message: 'Rental updated successfully', severity: 'success' });
      } else {
        await dispatch(createRental(formData)).unwrap();
        setSnackbar({ open: true, message: 'Rental agreement created successfully', severity: 'success' });
      }
      handleCloseDialog();
      dispatch(fetchRentals());
    } catch (error) {
      setSnackbar({ open: true, message: error.message || 'Operation failed', severity: 'error' });
    }
  };

  const handleGenerateBills = async () => {
    try {
      const monthStr = billingMonth.toISOString().split('T')[0];
      await dispatch(generateMonthlyBills({ 
        rentalId: selectedRental.id, 
        month: monthStr 
      })).unwrap();
      
      setSnackbar({ open: true, message: 'Monthly bills generated successfully', severity: 'success' });
      handleCloseBillingDialog();
      dispatch(fetchRentals());
    } catch (error) {
      setSnackbar({ open: true, message: error.message || 'Failed to generate bills', severity: 'error' });
    }
  };

const handleProcessPayment = async () => {
  try {
    const paymentData = {
      rental_id: selectedRental.id,
      customer_id: selectedRental.tenant_id,
      amount: parseFloat(paymentForm.amount),
      payment_method: paymentForm.payment_method,
      reference_number: paymentForm.reference_number,
      notes: paymentForm.notes,
      payment_type: 'rent'
    };

    const result = await dispatch(processPayment(paymentData)).unwrap();
    setCurrentPayment(result.payment); // Store the payment for receipt
    setSnackbar({ open: true, message: 'Payment processed successfully', severity: 'success' });
    handleClosePaymentDialog();
    setOpenReceiptDialog(true); // Open receipt dialog
    dispatch(fetchRentals());
  } catch (error) {
    setSnackbar({ open: true, message: error.message || 'Payment failed', severity: 'error' });
  }
};

  const handleDeleteRental = async (rentalId) => {
    if (window.confirm('Are you sure you want to delete this rental agreement?')) {
      try {
        await dispatch(deleteRental(rentalId)).unwrap();
        setSnackbar({ open: true, message: 'Rental deleted successfully', severity: 'success' });
        dispatch(fetchRentals());
      } catch (error) {
        setSnackbar({ open: true, message: error.message || 'Delete failed', severity: 'error' });
      }
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      active: 'success',
      expired: 'error',
      terminated: 'default'
    };
    return colors[status] || 'default';
  };

  const availableUnits = units.filter(unit => unit.status === 'available');

  // Calculate statistics
  const stats = {
    totalRentals: rentals.length,
    activeRentals: rentals.filter(r => r.status === 'active').length,
    totalMonthlyRent: rentals.reduce((sum, rental) => sum + parseFloat(rental.monthly_rent || 0), 0),
    pendingPayments: rentals.filter(r => r.status === 'active').length
  };

  return (
    <LocalizationProvider dateAdapter={AdapterDateFns}>
      <Box>
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
          <Typography variant="h4">Rental Management</Typography>
          <Button
            variant="contained"
            startIcon={<Add />}
            onClick={() => handleOpenDialog()}
          >
            New Rental Agreement
          </Button>
        </Box>

        {/* Statistics Cards */}
        <Grid container spacing={3} mb={4}>
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Typography color="textSecondary" gutterBottom>
                  Total Rentals
                </Typography>
                <Typography variant="h4" color="primary.main">
                  {stats.totalRentals}
                </Typography>
                <Typography variant="body2">
                  {stats.activeRentals} active
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Typography color="textSecondary" gutterBottom>
                  Monthly Revenue
                </Typography>
                <Typography variant="h4" color="success.main">
                  ${stats.totalMonthlyRent.toLocaleString()}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Typography color="textSecondary" gutterBottom>
                  Pending Payments
                </Typography>
                <Typography variant="h4" color="warning.main">
                  {stats.pendingPayments}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        <Tabs value={activeTab} onChange={(e, newValue) => setActiveTab(newValue)} sx={{ mb: 3 }}>
          <Tab label="All Rentals" />
          <Tab label="Rental Details" disabled={!selectedRental} />
        </Tabs>

        {activeTab === 0 && (
          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Tenant</TableCell>
                  <TableCell>Unit</TableCell>
                  <TableCell>Monthly Rent</TableCell>
                  <TableCell>Security Deposit</TableCell>
                  <TableCell>Lease Period</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {rentals.map((rental) => (
                  <TableRow 
                    key={rental.id}
                    hover
                    sx={{ cursor: 'pointer' }}
                  >
                    <TableCell>
                      {rental.Tenant?.first_name} {rental.Tenant?.last_name}
                    </TableCell>
                    <TableCell>
                      {rental.Unit?.unit_number} - {rental.Unit?.Building?.name}
                    </TableCell>
                    <TableCell>${rental.monthly_rent}</TableCell>
                    <TableCell>${rental.security_deposit}</TableCell>
                    <TableCell>
                      {new Date(rental.lease_start).toLocaleDateString()} - {' '}
                      {new Date(rental.lease_end).toLocaleDateString()}
                    </TableCell>
                    <TableCell>
                      <Chip 
                        label={rental.status} 
                        color={getStatusColor(rental.status)}
                        size="small"
                      />
                    </TableCell>
                    <TableCell>
                      <IconButton
                        size="small"
                        onClick={() => {
                          setSelectedRental(rental);
                          setActiveTab(1);
                        }}
                        title="View Details"
                      >
                        <Visibility />
                      </IconButton>
                      <IconButton
                        size="small"
                        onClick={() => handleOpenBillingDialog(rental)}
                        title="Generate Bills"
                      >
                        <Receipt />
                      </IconButton>
                      <IconButton
                        size="small"
                        onClick={() => handleOpenPaymentDialog(rental)}
                        title="Process Payment"
                      >
                        <Payment />
                      </IconButton>
                      <IconButton
                        size="small"
                        onClick={() => handleOpenDialog(rental)}
                        title="Edit Rental"
                      >
                        <Edit />
                      </IconButton>
                      <IconButton
                        size="small"
                        onClick={() => handleDeleteRental(rental.id)}
                        title="Delete Rental"
                        color="error"
                      >
                        <Delete />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        )}

        {activeTab === 1 && selectedRental && (
          <Box>
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
              <Box>
                <Typography variant="h5">
                  {selectedRental.Unit?.unit_number} - {selectedRental.Unit?.Building?.name}
                </Typography>
                <Typography color="textSecondary">
                  Tenant: {selectedRental.Tenant?.first_name} {selectedRental.Tenant?.last_name}
                </Typography>
                <Typography color="textSecondary">
                  Phone: {selectedRental.Tenant?.phone} | Email: {selectedRental.Tenant?.email}
                </Typography>
              </Box>
              <Box>
                <Button
                  variant="outlined"
                  startIcon={<Receipt />}
                  onClick={() => handleOpenBillingDialog(selectedRental)}
                  sx={{ mr: 1 }}
                >
                  Generate Bills
                </Button>
                <Button
                  variant="contained"
                  startIcon={<Payment />}
                  onClick={() => handleOpenPaymentDialog(selectedRental)}
                >
                  Process Payment
                </Button>
              </Box>
            </Box>

            {/* Financial Summary */}
            {financialSummary && (
              <Grid container spacing={3} mb={4}>
                <Grid item xs={12} sm={6} md={3}>
                  <Card>
                    <CardContent>
                      <Typography color="textSecondary" gutterBottom>
                        Monthly Rent
                      </Typography>
                      <Typography variant="h4" color="primary.main">
                        ${financialSummary.monthly_rent}
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                  <Card>
                    <CardContent>
                      <Typography color="textSecondary" gutterBottom>
                        Security Deposit
                      </Typography>
                      <Typography variant="h4">
                        ${financialSummary.security_deposit}
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                  <Card>
                    <CardContent>
                      <Typography color="textSecondary" gutterBottom>
                        Pending Balance
                      </Typography>
                      <Typography variant="h4" color="error.main">
                        ${financialSummary.balance}
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                  <Card>
                    <CardContent>
                      <Typography color="textSecondary" gutterBottom>
                        Pending Bills
                      </Typography>
                      <Typography variant="h4">
                        {financialSummary.pending_bills}
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>
              </Grid>
            )}

            {/* Utility Bills Section */}
            <Typography variant="h6" gutterBottom>
              Utility Bills
            </Typography>
            <TableContainer component={Paper} sx={{ mb: 3 }}>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Bill Type</TableCell>
                    <TableCell>Amount</TableCell>
                    <TableCell>Billing Month</TableCell>
                    <TableCell>Due Date</TableCell>
                    <TableCell>Status</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {selectedRental.UtilityBills?.map((bill) => (
                    <TableRow key={bill.id}>
                      <TableCell>
                        {bill.UtilityType?.name || 'Rent'}
                      </TableCell>
                      <TableCell>${bill.amount}</TableCell>
                      <TableCell>
                        {new Date(bill.billing_month).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                      </TableCell>
                      <TableCell>
                        {new Date(bill.due_date).toLocaleDateString()}
                      </TableCell>
                      <TableCell>
                        <Chip 
                          label={bill.status} 
                          color={bill.status === 'paid' ? 'success' : bill.status === 'overdue' ? 'error' : 'warning'}
                          size="small"
                        />
                      </TableCell>
                    </TableRow>
                  ))}
                  {(!selectedRental.UtilityBills || selectedRental.UtilityBills.length === 0) && (
                    <TableRow>
                      <TableCell colSpan={5} align="center">
                        <Typography color="textSecondary" sx={{ py: 2 }}>
                          No bills generated yet. Click "Generate Bills" to create monthly bills.
                        </Typography>
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </TableContainer>

            {/* Payment History Section */}
            <Typography variant="h6" gutterBottom>
              Payment History
            </Typography>
            <TableContainer component={Paper}>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Receipt No</TableCell>
                    <TableCell>Date</TableCell>
                    <TableCell>Amount</TableCell>
                    <TableCell>Method</TableCell>
                    <TableCell>Status</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {selectedRental.Payments?.map((payment) => (
                    <TableRow key={payment.id}>
                      <TableCell>{payment.receipt_number}</TableCell>
                      <TableCell>
                        {new Date(payment.payment_date).toLocaleDateString()}
                      </TableCell>
                      <TableCell>${payment.amount}</TableCell>
                      <TableCell>
                        <Chip label={payment.payment_method} size="small" />
                      </TableCell>
                      <TableCell>
                        <Chip 
                          label={payment.status} 
                          color={payment.status === 'completed' ? 'success' : 'warning'}
                          size="small"
                        />
                      </TableCell>
                    </TableRow>
                  ))}
                  {(!selectedRental.Payments || selectedRental.Payments.length === 0) && (
                    <TableRow>
                      <TableCell colSpan={5} align="center">
                        <Typography color="textSecondary" sx={{ py: 2 }}>
                          No payments recorded yet.
                        </Typography>
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          </Box>
        )}

        {/* Dialogs remain the same as before but enhanced */}
        {/* Rental Agreement Dialog */}
        <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="md" fullWidth>
          <DialogTitle>
            {selectedRental ? 'Edit Rental Agreement' : 'New Rental Agreement'}
          </DialogTitle>
          <DialogContent>
            <Box component="form" sx={{ mt: 2 }}>
              <TextField
                fullWidth
                select
                label="Unit"
                value={formData.unit_id}
                onChange={(e) => setFormData({ ...formData, unit_id: e.target.value })}
                margin="normal"
                required
              >
                {availableUnits.map((unit) => (
                  <MenuItem key={unit.id} value={unit.id}>
                    {unit.unit_number} - {unit.Building?.name} (${unit.price})
                  </MenuItem>
                ))}
              </TextField>
              <TextField
                fullWidth
                select
                label="Tenant"
                value={formData.tenant_id}
                onChange={(e) => setFormData({ ...formData, tenant_id: e.target.value })}
                margin="normal"
                required
              >
                {customers.map((customer) => (
                  <MenuItem key={customer.id} value={customer.id}>
                    {customer.first_name} {customer.last_name} - {customer.phone}
                  </MenuItem>
                ))}
              </TextField>
              <TextField
                fullWidth
                label="Monthly Rent"
                type="number"
                value={formData.monthly_rent}
                onChange={(e) => setFormData({ ...formData, monthly_rent: e.target.value })}
                margin="normal"
                required
              />
              <TextField
                fullWidth
                label="Security Deposit"
                type="number"
                value={formData.security_deposit}
                onChange={(e) => setFormData({ ...formData, security_deposit: e.target.value })}
                margin="normal"
                required
              />
              <TextField
                fullWidth
                label="Lease Start Date"
                type="date"
                value={formData.lease_start}
                onChange={(e) => setFormData({ ...formData, lease_start: e.target.value })}
                margin="normal"
                InputLabelProps={{ shrink: true }}
                required
              />
              <TextField
                fullWidth
                label="Lease End Date"
                type="date"
                value={formData.lease_end}
                onChange={(e) => setFormData({ ...formData, lease_end: e.target.value })}
                margin="normal"
                InputLabelProps={{ shrink: true }}
                required
              />
            </Box>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCloseDialog}>Cancel</Button>
            <Button onClick={handleSubmit} variant="contained">
              {selectedRental ? 'Update' : 'Create'}
            </Button>
          </DialogActions>
        </Dialog>

        {/* Generate Bills Dialog */}
        <Dialog open={openBillingDialog} onClose={handleCloseBillingDialog} maxWidth="sm" fullWidth>
          <DialogTitle>
            Generate Monthly Bills
          </DialogTitle>
          <DialogContent>
            <Box sx={{ mt: 2 }}>
              <Typography gutterBottom>
                Generate utility bills for {selectedRental?.Unit?.unit_number} - {selectedRental?.Tenant?.first_name} {selectedRental?.Tenant?.last_name}
              </Typography>
              <DatePicker
                label="Billing Month"
                views={['year', 'month']}
                value={billingMonth}
                onChange={(newValue) => setBillingMonth(newValue)}
                renderInput={(params) => <TextField {...params} fullWidth margin="normal" />}
              />
            </Box>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCloseBillingDialog}>Cancel</Button>
            <Button onClick={handleGenerateBills} variant="contained" startIcon={<Receipt />}>
              Generate Bills
            </Button>
          </DialogActions>
        </Dialog>

        {/* Payment Dialog */}
        <Dialog open={openPaymentDialog} onClose={handleClosePaymentDialog} maxWidth="sm" fullWidth>
          <DialogTitle>
            Process Payment
          </DialogTitle>
          <DialogContent>
            <Box sx={{ mt: 2 }}>
              <Typography gutterBottom>
                Payment for {selectedRental?.Tenant?.first_name} {selectedRental?.Tenant?.last_name}
              </Typography>
              <TextField
                fullWidth
                label="Amount"
                type="number"
                value={paymentForm.amount}
                onChange={(e) => setPaymentForm({ ...paymentForm, amount: e.target.value })}
                margin="normal"
                required
              />
              <TextField
                fullWidth
                select
                label="Payment Method"
                value={paymentForm.payment_method}
                onChange={(e) => setPaymentForm({ ...paymentForm, payment_method: e.target.value })}
                margin="normal"
              >
                <MenuItem value="cash">Cash</MenuItem>
                <MenuItem value="bank_transfer">Bank Transfer</MenuItem>
                <MenuItem value="check">Check</MenuItem>
                <MenuItem value="online">Online</MenuItem>
              </TextField>
              <TextField
                fullWidth
                label="Reference Number"
                value={paymentForm.reference_number}
                onChange={(e) => setPaymentForm({ ...paymentForm, reference_number: e.target.value })}
                margin="normal"
              />
              <TextField
                fullWidth
                label="Notes"
                value={paymentForm.notes}
                onChange={(e) => setPaymentForm({ ...paymentForm, notes: e.target.value })}
                margin="normal"
                multiline
                rows={2}
              />
            </Box>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleClosePaymentDialog}>Cancel</Button>
            <Button onClick={handleProcessPayment} variant="contained" startIcon={<Payment />}>
              Process Payment
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
      <Receipt 
        payment={currentPayment}
        open={openReceiptDialog}
        onClose={() => {
          setOpenReceiptDialog(false);
          setCurrentPayment(null);
        }}
      />
    </LocalizationProvider>
  );
};

export default Rentals;