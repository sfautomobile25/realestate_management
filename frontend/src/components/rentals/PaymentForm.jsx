import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  MenuItem,
  Button,
  Box,
  Typography,
  FormControlLabel,
  Checkbox,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Alert
} from '@mui/material';
import { useDispatch } from 'react-redux';
import { processPayment } from '../../store/slices/paymentSlice';

const PaymentForm = ({ open, onClose, rental, customer, pendingBills }) => {
  const dispatch = useDispatch();
  const [formData, setFormData] = useState({
    amount: '',
    payment_method: 'cash',
    reference_number: '',
    notes: '',
    payment_type: 'rent'
  });
  const [selectedBills, setSelectedBills] = useState([]);
  const [totalAmount, setTotalAmount] = useState(0);

  useEffect(() => {
    if (rental) {
      setFormData(prev => ({
        ...prev,
        rental_id: rental.id,
        customer_id: rental.tenant_id,
        amount: rental.monthly_rent || ''
      }));
    }
  }, [rental]);

  useEffect(() => {
    const selectedAmount = selectedBills.reduce((sum, billId) => {
      const bill = pendingBills.find(b => b.id === billId);
      return sum + (bill ? parseFloat(bill.amount) : 0);
    }, 0);
    setTotalAmount(selectedAmount);
  }, [selectedBills, pendingBills]);

  const handleBillSelection = (billId, checked) => {
    if (checked) {
      setSelectedBills(prev => [...prev, billId]);
    } else {
      setSelectedBills(prev => prev.filter(id => id !== billId));
    }
  };

  const handleSubmit = async () => {
    try {
      const paymentData = {
        ...formData,
        amount: parseFloat(formData.amount),
        utility_bill_ids: selectedBills
      };

      await dispatch(processPayment(paymentData)).unwrap();
      onClose();
    } catch (error) {
      console.error('Payment failed:', error);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>Process Payment</DialogTitle>
      <DialogContent>
        <Box sx={{ mt: 2 }}>
          <Typography variant="h6" gutterBottom>
            Customer: {customer?.first_name} {customer?.last_name}
          </Typography>
          {rental && (
            <Typography variant="body1" gutterBottom>
              Unit: {rental.Unit?.unit_number} - {rental.Unit?.Building?.name}
            </Typography>
          )}

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
            select
            label="Payment Method"
            value={formData.payment_method}
            onChange={(e) => setFormData({ ...formData, payment_method: e.target.value })}
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

          {pendingBills && pendingBills.length > 0 && (
            <Box sx={{ mt: 3 }}>
              <Typography variant="h6" gutterBottom>
                Select Bills to Pay
              </Typography>
              <TableContainer component={Paper}>
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell>Select</TableCell>
                      <TableCell>Bill Type</TableCell>
                      <TableCell>Amount</TableCell>
                      <TableCell>Due Date</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {pendingBills.map((bill) => (
                      <TableRow key={bill.id}>
                        <TableCell>
                          <Checkbox
                            checked={selectedBills.includes(bill.id)}
                            onChange={(e) => handleBillSelection(bill.id, e.target.checked)}
                          />
                        </TableCell>
                        <TableCell>
                          {bill.UtilityType?.name || 'Rent'}
                        </TableCell>
                        <TableCell>${bill.amount}</TableCell>
                        <TableCell>
                          {new Date(bill.due_date).toLocaleDateString()}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
              {selectedBills.length > 0 && (
                <Alert severity="info" sx={{ mt: 2 }}>
                  Total Selected Bills: ${totalAmount}
                </Alert>
              )}
            </Box>
          )}
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button onClick={handleSubmit} variant="contained" color="primary">
          Process Payment
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default PaymentForm;