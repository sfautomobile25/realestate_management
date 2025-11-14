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
  FormControl,
  InputLabel,
  Select
} from '@mui/material';
import { Add, ReceiptLong, AttachMoney } from '@mui/icons-material';
import { useDispatch, useSelector } from 'react-redux';
import { paymentAPI } from '../../services/api';
import { fetchRentals } from '../../store/slices/rentalSlice';

const Payments = () => {
  const dispatch = useDispatch();
  const { items: rentals } = useSelector(state => state.rentals);
  
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [openDialog, setOpenDialog] = useState(false);
  const [summary, setSummary] = useState(null);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

  const [formData, setFormData] = useState({
    rental_id: '',
    customer_id: '',
    amount: '',
    payment_date: new Date().toISOString().split('T')[0],
    payment_method: 'cash',
    payment_type: 'rent',
    reference_number: '',
    notes: ''
  });

  useEffect(() => {
    dispatch(fetchRentals());
    fetchPayments();
    fetchSummary();
  }, [dispatch]);

  const fetchPayments = async () => {
    setLoading(true);
    try {
      const response = await paymentAPI.getAll();
      setPayments(response.data);
    } catch (error) {
      setError('Failed to fetch payments');
    } finally {
      setLoading(false);
    }
  };

  const fetchSummary = async () => {
    try {
      const response = await paymentAPI.getSummary();
      setSummary(response.data);
    } catch (error) {
      console.error('Failed to fetch payment summary');
    }
  };

  const handleOpenDialog = () => {
    setFormData({
      rental_id: '',
      customer_id: '',
      amount: '',
      payment_date: new Date().toISOString().split('T')[0],
      payment_method: 'cash',
      payment_type: 'rent',
      reference_number: '',
      notes: ''
    });
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
  };

  const handleSubmit = async () => {
    try {
      await paymentAPI.create(formData);
      setSnackbar({ open: true, message: 'Payment recorded successfully', severity: 'success' });
      handleCloseDialog();
      fetchPayments();
      fetchSummary();
    } catch (error) {
      setSnackbar({ open: true, message: 'Failed to record payment', severity: 'error' });
    }
  };

  const getPaymentTypeColor = (type) => {
    const colors = {
      rent: 'primary',
      utility: 'secondary',
      deposit: 'success',
      late_fee: 'error',
      other: 'default'
    };
    return colors[type] || 'default';
  };

  const getPaymentMethodColor = (method) => {
    const colors = {
      cash: 'success',
      bank_transfer: 'info',
      check: 'warning',
      online: 'primary'
    };
    return colors[method] || 'default';
  };

  // Filter active rentals for dropdown
  const activeRentals = rentals.filter(rental => rental.status === 'active');

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4">Payments Management</Typography>
        <Button
          variant="contained"
          startIcon={<Add />}
          onClick={handleOpenDialog}
        >
          Record Payment
        </Button>
      </Box>

      {/* Payment Summary */}
      {summary && (
        <Grid container spacing={3} mb={4}>
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Typography color="textSecondary" gutterBottom>
                  Total Collected
                </Typography>
                <Typography variant="h4" color="primary.main">
                  ${summary.total_collected?.toLocaleString()}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Typography color="textSecondary" gutterBottom>
                  Rent Collected
                </Typography>
                <Typography variant="h6" color="success.main">
                  ${summary.rent_collected?.toLocaleString()}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Typography color="textSecondary" gutterBottom>
                  Utility Collected
                </Typography>
                <Typography variant="h6">
                  ${summary.utility_collected?.toLocaleString()}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Typography color="textSecondary" gutterBottom>
                  Total Transactions
                </Typography>
                <Typography variant="h6">
                  {summary.total_transactions}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      )}

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Date</TableCell>
              <TableCell>Tenant</TableCell>
              <TableCell>Unit</TableCell>
              <TableCell>Amount</TableCell>
              <TableCell>Type</TableCell>
              <TableCell>Method</TableCell>
              <TableCell>Reference</TableCell>
              <TableCell>Status</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {payments.map((payment) => (
              <TableRow key={payment.id}>
                <TableCell>
                  {new Date(payment.payment_date).toLocaleDateString()}
                </TableCell>
                <TableCell>
                  {payment.Customer?.first_name} {payment.Customer?.last_name}
                </TableCell>
                <TableCell>
                  {payment.Rental?.Unit?.unit_number} - {payment.Rental?.Unit?.Building?.name}
                </TableCell>
                <TableCell>
                  <Box display="flex" alignItems="center">
                    <AttachMoney fontSize="small" color="success" />
                    <Typography variant="body1" fontWeight="bold">
                      {payment.amount}
                    </Typography>
                  </Box>
                </TableCell>
                <TableCell>
                  <Chip 
                    label={payment.payment_type} 
                    color={getPaymentTypeColor(payment.payment_type)}
                    size="small"
                  />
                </TableCell>
                <TableCell>
                  <Chip 
                    label={payment.payment_method} 
                    color={getPaymentMethodColor(payment.payment_method)}
                    size="small"
                    variant="outlined"
                  />
                </TableCell>
                <TableCell>
                  {payment.reference_number || 'N/A'}
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
          </TableBody>
        </Table>
      </TableContainer>

      {/* Payment Form Dialog */}
      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="md" fullWidth>
        <DialogTitle>
          Record New Payment
        </DialogTitle>
        <DialogContent>
          <Box component="form" sx={{ mt: 2 }}>
            <TextField
              fullWidth
              select
              label="Rental Agreement"
              value={formData.rental_id}
              onChange={(e) => {
                const rental = activeRentals.find(r => r.id === e.target.value);
                setFormData({ 
                  ...formData, 
                  rental_id: e.target.value,
                  customer_id: rental?.tenant_id,
                  amount: rental?.monthly_rent || ''
                });
              }}
              margin="normal"
              required
            >
              {activeRentals.map((rental) => (
                <MenuItem key={rental.id} value={rental.id}>
                  {rental.Unit?.unit_number} - {rental.Tenant?.first_name} {rental.Tenant?.last_name} 
                  (Rent: ${rental.monthly_rent})
                </MenuItem>
              ))}
            </TextField>
            <TextField
              fullWidth
              label="Amount"
              type="number"
              value={formData.amount}
              onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
              margin="normal"
              required
            />
            <TextField
              fullWidth
              label="Payment Date"
              type="date"
              value={formData.payment_date}
              onChange={(e) => setFormData({ ...formData, payment_date: e.target.value })}
              margin="normal"
              InputLabelProps={{ shrink: true }}
              required
            />
            <TextField
              fullWidth
              select
              label="Payment Type"
              value={formData.payment_type}
              onChange={(e) => setFormData({ ...formData, payment_type: e.target.value })}
              margin="normal"
              required
            >
              <MenuItem value="rent">Rent</MenuItem>
              <MenuItem value="utility">Utility</MenuItem>
              <MenuItem value="deposit">Security Deposit</MenuItem>
              <MenuItem value="late_fee">Late Fee</MenuItem>
              <MenuItem value="other">Other</MenuItem>
            </TextField>
            <TextField
              fullWidth
              select
              label="Payment Method"
              value={formData.payment_method}
              onChange={(e) => setFormData({ ...formData, payment_method: e.target.value })}
              margin="normal"
              required
            >
              <MenuItem value="cash">Cash</MenuItem>
              <MenuItem value="bank_transfer">Bank Transfer</MenuItem>
              <MenuItem value="check">Check</MenuItem>
              <MenuItem value="online">Online</MenuItem>
            </TextField>
            <TextField
              fullWidth
              label="Reference Number"
              value={formData.reference_number}
              onChange={(e) => setFormData({ ...formData, reference_number: e.target.value })}
              margin="normal"
            />
            <TextField
              fullWidth
              label="Notes"
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              margin="normal"
              multiline
              rows={2}
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancel</Button>
          <Button onClick={handleSubmit} variant="contained" startIcon={<ReceiptLong />}>
            Record Payment
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

export default Payments;