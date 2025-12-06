import React, { useState, useEffect } from 'react';
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
  Divider,
  Tooltip,
  InputAdornment,
  LinearProgress,
  Stack
} from '@mui/material';
import {
  Add,
  Edit,
  Delete,
  Receipt,
  AttachMoney,
  TrendingUp,
  TrendingDown,
  AccountBalance,
  DateRange,
  Print,
  Download,
  Payment,
  Savings,
  AccountBalanceWallet,
  MonetizationOn,
  LocalAtm,
  CreditCard,
  MoneyOff,
  ArrowUpward,
  ArrowDownward,
  CalendarMonth,
  FilterList,
  Refresh
} from '@mui/icons-material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { useDispatch, useSelector } from 'react-redux';
import { fetchAccountBalance, createAccountTransaction, fetchMonthlySummary } from '../../store/slices/accountSlice';
import Layout from '../../components/common/Layout';

const Accounts = () => {
  const dispatch = useDispatch();
  const { 
    balance, 
    todayTransactions = [], 
    incomeCategories = {}, 
    expenseCategories = {},
    monthlySummary,
    loading,
    error 
  } = useSelector(state => state.accounts || {});
  
  const [activeTab, setActiveTab] = useState(0);
  const [openTransactionDialog, setOpenTransactionDialog] = useState(false);
  const [openDateRangeDialog, setOpenDateRangeDialog] = useState(false);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [startDate, setStartDate] = useState(new Date());
  const [endDate, setEndDate] = useState(new Date());
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

  const [transactionForm, setTransactionForm] = useState({
    date: new Date().toISOString().split('T')[0],
    description: '',
    type: 'income',
    category: '',
    amount: '',
    payment_method: 'cash',
    reference_number: '',
    notes: ''
  });

  const incomeCategoriesList = [
    'Rental Income',
    'Service Charge',
    'Late Fees',
    'Security Deposit',
    'Utility Income',
    'Other Income'
  ];

  const expenseCategoriesList = [
    'Salary Payment',
    'Utility Bills',
    'Maintenance',
    'Office Supplies',
    'Marketing',
    'Tax Payment',
    'Bank Charges',
    'Other Expenses'
  ];

  useEffect(() => {
    dispatch(fetchAccountBalance());
  }, [dispatch]);

  useEffect(() => {
    if (activeTab === 2) {
      dispatch(fetchMonthlySummary());
    }
  }, [activeTab, dispatch]);

  const handleOpenTransactionDialog = (type = 'income') => {
    setTransactionForm({
      date: new Date().toISOString().split('T')[0],
      description: '',
      type: type,
      category: type === 'income' ? 'Rental Income' : 'Salary Payment',
      amount: '',
      payment_method: 'cash',
      reference_number: '',
      notes: ''
    });
    setOpenTransactionDialog(true);
  };

  const handleCloseTransactionDialog = () => {
    setOpenTransactionDialog(false);
  };

  const handleSubmitTransaction = async () => {
    try {
      await dispatch(createAccountTransaction(transactionForm)).unwrap();
      setSnackbar({ open: true, message: 'Transaction recorded successfully', severity: 'success' });
      handleCloseTransactionDialog();
      dispatch(fetchAccountBalance());
    } catch (error) {
      setSnackbar({ open: true, message: 'Failed to record transaction: ' + error.message, severity: 'error' });
    }
  };

  const handleDateChange = (date) => {
    setSelectedDate(date);
    dispatch(fetchAccountBalance(date.toISOString().split('T')[0]));
  };

  const handleRefresh = () => {
    dispatch(fetchAccountBalance());
  };

  const getCategoryColor = (category) => {
    const colors = {
      'Rental Income': 'success',
      'Salary Payment': 'error',
      'Utility Bills': 'warning',
      'Maintenance': 'info',
      'Service Charge': 'secondary',
      'Security Deposit': 'primary'
    };
    return colors[category] || 'default';
  };

  const getPaymentMethodIcon = (method) => {
    const icons = {
      'cash': <LocalAtm fontSize="small" />,
      'bank': <AccountBalance fontSize="small" />,
      'mobile_banking': <CreditCard fontSize="small" />,
      'check': <Receipt fontSize="small" />
    };
    return icons[method] || <AttachMoney fontSize="small" />;
  };

  // Calculate total cash in hand
  const totalCashInHand = balance ? balance.closing_balance : 0;

  if (loading && !balance) {
    return (
      <Layout>
        <Box sx={{ width: '100%', mt: 3 }}>
          <LinearProgress />
          <Typography align="center" sx={{ mt: 2 }}>Loading accounts data...</Typography>
        </Box>
      </Layout>
    );
  }

  return (
    <Layout>
      <LocalizationProvider dateAdapter={AdapterDateFns}>
        <Box sx={{ bgcolor: 'background.default', minHeight: '100vh' }}>
          {/* Header with Gradient */}
          <Paper 
            elevation={3} 
            sx={{ 
              mb: 3, 
              p: 3, 
              borderRadius: 2,
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              color: 'white'
            }}
          >
            <Box display="flex" justifyContent="space-between" alignItems="center">
              <Box>
                <Typography variant="h4" fontWeight="bold">
                  <AccountBalanceWallet sx={{ verticalAlign: 'middle', mr: 1 }} />
                  Accounts Management
                </Typography>
                <Typography variant="body1" sx={{ opacity: 0.9, mt: 1 }}>
                  Track your cash flow, income, and expenses in real-time
                </Typography>
              </Box>
              <Stack direction="row" spacing={2}>
                <Button
                  variant="outlined"
                  startIcon={<DateRange />}
                  onClick={() => setOpenDateRangeDialog(true)}
                  sx={{ color: 'white', borderColor: 'white', '&:hover': { borderColor: '#ccc' } }}
                >
                  Date Range
                </Button>
                <Button
                  variant="contained"
                  startIcon={<Refresh />}
                  onClick={handleRefresh}
                  sx={{ bgcolor: 'white', color: '#667eea', '&:hover': { bgcolor: '#f5f5f5' } }}
                >
                  Refresh
                </Button>
                <Button
                  variant="contained"
                  startIcon={<Add />}
                  onClick={() => handleOpenTransactionDialog('income')}
                  sx={{ bgcolor: '#4caf50', '&:hover': { bgcolor: '#388e3c' } }}
                >
                  Add Transaction
                </Button>
              </Stack>
            </Box>
          </Paper>

          {/* Date Selector Card */}
          <Card sx={{ mb: 3, borderRadius: 2, boxShadow: 2 }}>
            <CardContent>
              <Box display="flex" alignItems="center" justifyContent="space-between">
                <Box display="flex" alignItems="center">
                  <CalendarMonth color="primary" sx={{ mr: 2 }} />
                  <Typography variant="h6">Select Date</Typography>
                </Box>
                <DatePicker
                  value={selectedDate}
                  onChange={handleDateChange}
                  renderInput={(params) => <TextField {...params} size="small" sx={{ width: 200 }} />}
                />
              </Box>
            </CardContent>
          </Card>

          {/* Summary Cards with Better Styling */}
          <Grid container spacing={3} mb={4}>
            <Grid item xs={12} sm={6} md={3}>
              <Card sx={{ 
                borderRadius: 2, 
                boxShadow: 3,
                borderLeft: '4px solid #4caf50',
                transition: 'transform 0.2s',
                '&:hover': { transform: 'translateY(-4px)' }
              }}>
                <CardContent>
                  <Box display="flex" alignItems="center" mb={2}>
                    <Box sx={{ 
                      bgcolor: '#4caf50', 
                      p: 1, 
                      borderRadius: '50%',
                      mr: 2 
                    }}>
                      <TrendingUp sx={{ color: 'white' }} />
                    </Box>
                    <Typography variant="h6" color="textSecondary">
                      Today's Income
                    </Typography>
                  </Box>
                  <Typography variant="h4" color="#4caf50" fontWeight="bold">
                    ৳{balance?.cash_in?.toLocaleString() || '0'}
                  </Typography>
                  <Typography variant="body2" color="textSecondary" sx={{ mt: 1 }}>
                    <ArrowUpward fontSize="small" sx={{ verticalAlign: 'middle', mr: 0.5 }} />
                    Total income received today
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            
            <Grid item xs={12} sm={6} md={3}>
              <Card sx={{ 
                borderRadius: 2, 
                boxShadow: 3,
                borderLeft: '4px solid #f44336',
                transition: 'transform 0.2s',
                '&:hover': { transform: 'translateY(-4px)' }
              }}>
                <CardContent>
                  <Box display="flex" alignItems="center" mb={2}>
                    <Box sx={{ 
                      bgcolor: '#f44336', 
                      p: 1, 
                      borderRadius: '50%',
                      mr: 2 
                    }}>
                      <TrendingDown sx={{ color: 'white' }} />
                    </Box>
                    <Typography variant="h6" color="textSecondary">
                      Today's Expense
                    </Typography>
                  </Box>
                  <Typography variant="h4" color="#f44336" fontWeight="bold">
                    ৳{balance?.cash_out?.toLocaleString() || '0'}
                  </Typography>
                  <Typography variant="body2" color="textSecondary" sx={{ mt: 1 }}>
                    <ArrowDownward fontSize="small" sx={{ verticalAlign: 'middle', mr: 0.5 }} />
                    Total expenses paid today
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            
            <Grid item xs={12} sm={6} md={3}>
              <Card sx={{ 
                borderRadius: 2, 
                boxShadow: 3,
                borderLeft: '4px solid #2196f3',
                transition: 'transform 0.2s',
                '&:hover': { transform: 'translateY(-4px)' }
              }}>
                <CardContent>
                  <Box display="flex" alignItems="center" mb={2}>
                    <Box sx={{ 
                      bgcolor: '#2196f3', 
                      p: 1, 
                      borderRadius: '50%',
                      mr: 2 
                    }}>
                      <AccountBalanceWallet sx={{ color: 'white' }} />
                    </Box>
                    <Typography variant="h6" color="textSecondary">
                      Cash in Hand
                    </Typography>
                  </Box>
                  <Typography variant="h4" color="#2196f3" fontWeight="bold">
                    ৳{totalCashInHand.toLocaleString()}
                  </Typography>
                  <Typography variant="body2" color="textSecondary" sx={{ mt: 1 }}>
                    Available cash balance
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            
            <Grid item xs={12} sm={6} md={3}>
              <Card sx={{ 
                borderRadius: 2, 
                boxShadow: 3,
                borderLeft: '4px solid #ff9800',
                transition: 'transform 0.2s',
                '&:hover': { transform: 'translateY(-4px)' }
              }}>
                <CardContent>
                  <Box display="flex" alignItems="center" mb={2}>
                    <Box sx={{ 
                      bgcolor: '#ff9800', 
                      p: 1, 
                      borderRadius: '50%',
                      mr: 2 
                    }}>
                      <Savings sx={{ color: 'white' }} />
                    </Box>
                    <Typography variant="h6" color="textSecondary">
                      Opening Balance
                    </Typography>
                  </Box>
                  <Typography variant="h4" color="#ff9800" fontWeight="bold">
                    ৳{balance?.opening_balance?.toLocaleString() || '0'}
                  </Typography>
                  <Typography variant="body2" color="textSecondary" sx={{ mt: 1 }}>
                    Balance from previous day
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          </Grid>

          {/* Tabs with Better Styling */}
          <Paper sx={{ mb: 3, borderRadius: 2, overflow: 'hidden' }}>
            <Tabs 
              value={activeTab} 
              onChange={(e, newValue) => setActiveTab(newValue)} 
              variant="fullWidth"
              sx={{ 
                bgcolor: '#f5f5f5',
                '& .MuiTab-root': { 
                  fontWeight: 600,
                  textTransform: 'none',
                  fontSize: '1rem'
                }
              }}
            >
              <Tab label="Today's Transactions" icon={<Receipt />} iconPosition="start" />
              <Tab label="Income/Expense Analysis" icon={<FilterList />} iconPosition="start" />
              <Tab label="Monthly Summary" icon={<CalendarMonth />} iconPosition="start" />
              <Tab label="All Transactions" icon={<AccountBalance />} iconPosition="start" />
            </Tabs>
          </Paper>

          {error && (
            <Alert 
              severity="error" 
              sx={{ mb: 3, borderRadius: 2 }}
              action={
                <Button color="inherit" size="small" onClick={handleRefresh}>
                  Retry
                </Button>
              }
            >
              {error}
            </Alert>
          )}

          {/* Tab 1: Today's Transactions */}
          {activeTab === 0 && (
            <Paper sx={{ borderRadius: 2, overflow: 'hidden' }}>
              <Box sx={{ p: 2, bgcolor: '#f5f5f5', borderBottom: 1, borderColor: 'divider' }}>
                <Typography variant="h6">
                  Transactions for {selectedDate.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                </Typography>
              </Box>
              {todayTransactions?.length === 0 ? (
                <Box sx={{ p: 8, textAlign: 'center' }}>
                  <MonetizationOn sx={{ fontSize: 80, color: '#e0e0e0', mb: 2 }} />
                  <Typography variant="h6" gutterBottom color="textSecondary">
                    No Transactions Today
                  </Typography>
                  <Typography variant="body1" color="textSecondary" sx={{ mb: 4 }}>
                    Start recording your financial transactions
                  </Typography>
                  <Stack direction="row" spacing={2} justifyContent="center">
                    <Button 
                      variant="contained" 
                      color="success"
                      startIcon={<Add />}
                      onClick={() => handleOpenTransactionDialog('income')}
                      sx={{ borderRadius: 2 }}
                    >
                      Add Income
                    </Button>
                    <Button 
                      variant="contained" 
                      color="error"
                      startIcon={<MoneyOff />}
                      onClick={() => handleOpenTransactionDialog('expense')}
                      sx={{ borderRadius: 2 }}
                    >
                      Add Expense
                    </Button>
                  </Stack>
                </Box>
              ) : (
                <TableContainer>
                  <Table>
                    <TableHead>
                      <TableRow sx={{ bgcolor: '#fafafa' }}>
                        <TableCell><strong>Time</strong></TableCell>
                        <TableCell><strong>Description</strong></TableCell>
                        <TableCell><strong>Category</strong></TableCell>
                        <TableCell><strong>Type</strong></TableCell>
                        <TableCell><strong>Amount</strong></TableCell>
                        <TableCell><strong>Payment Method</strong></TableCell>
                        <TableCell><strong>Reference</strong></TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {todayTransactions?.map((transaction) => (
                        <TableRow 
                          key={transaction.id}
                          sx={{ 
                            '&:hover': { bgcolor: '#f9f9f9' },
                            transition: 'background-color 0.2s'
                          }}
                        >
                          <TableCell>
                            <Typography variant="body2" color="textSecondary">
                              {new Date(transaction.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </Typography>
                          </TableCell>
                          <TableCell>
                            <Typography fontWeight="bold">{transaction.description}</Typography>
                            {transaction.notes && (
                              <Typography variant="body2" color="textSecondary" sx={{ mt: 0.5 }}>
                                {transaction.notes}
                              </Typography>
                            )}
                          </TableCell>
                          <TableCell>
                            <Chip 
                              label={transaction.category} 
                              color={getCategoryColor(transaction.category)}
                              size="small"
                              sx={{ fontWeight: 500 }}
                            />
                          </TableCell>
                          <TableCell>
                            <Chip 
                              label={transaction.type} 
                              color={transaction.type === 'income' ? 'success' : 'error'}
                              size="small"
                              icon={transaction.type === 'income' ? <ArrowUpward /> : <ArrowDownward />}
                              sx={{ fontWeight: 500 }}
                            />
                          </TableCell>
                          <TableCell>
                            <Typography 
                              fontWeight="bold"
                              color={transaction.type === 'income' ? 'success.main' : 'error.main'}
                              sx={{ fontSize: '1.1rem' }}
                            >
                              ৳{parseFloat(transaction.amount).toLocaleString()}
                            </Typography>
                          </TableCell>
                          <TableCell>
                            <Box display="flex" alignItems="center">
                              <Tooltip title={transaction.payment_method}>
                                <Box sx={{ mr: 1 }}>
                                  {getPaymentMethodIcon(transaction.payment_method)}
                                </Box>
                              </Tooltip>
                              <Typography variant="body2">
                                {transaction.payment_method}
                              </Typography>
                            </Box>
                          </TableCell>
                          <TableCell>
                            <Typography variant="body2" color="textSecondary">
                              {transaction.reference_number || 'N/A'}
                            </Typography>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              )}
            </Paper>
          )}

          {/* Tab 2: Income/Expense Categories */}
          {activeTab === 1 && (
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <Card sx={{ borderRadius: 2, height: '100%' }}>
                  <CardContent>
                    <Box display="flex" alignItems="center" mb={2}>
                      <Box sx={{ bgcolor: '#4caf50', p: 1, borderRadius: '50%', mr: 2 }}>
                        <TrendingUp sx={{ color: 'white' }} />
                      </Box>
                      <Typography variant="h6" color="success.main">
                        Income Categories
                      </Typography>
                    </Box>
                    <Divider sx={{ mb: 2 }} />
                    {Object.entries(incomeCategories || {}).length === 0 ? (
                      <Box sx={{ py: 4, textAlign: 'center' }}>
                        <Typography color="textSecondary">
                          No income recorded today
                        </Typography>
                      </Box>
                    ) : (
                      Object.entries(incomeCategories || {}).map(([category, amount]) => (
                        <Box key={category} sx={{ mb: 2 }}>
                          <Box display="flex" justifyContent="space-between" alignItems="center">
                            <Box display="flex" alignItems="center">
                              <Box sx={{ width: 8, height: 8, bgcolor: '#4caf50', borderRadius: '50%', mr: 1.5 }} />
                              <Typography>{category}</Typography>
                            </Box>
                            <Typography fontWeight="bold" color="success.main" sx={{ fontSize: '1.1rem' }}>
                              ৳{amount.toLocaleString()}
                            </Typography>
                          </Box>
                          <LinearProgress 
                            variant="determinate" 
                            value={Math.min(100, (amount / (balance?.cash_in || 1)) * 100)} 
                            color="success"
                            sx={{ mt: 1, height: 6, borderRadius: 3 }}
                          />
                        </Box>
                      ))
                    )}
                  </CardContent>
                </Card>
              </Grid>
              <Grid item xs={12} md={6}>
                <Card sx={{ borderRadius: 2, height: '100%' }}>
                  <CardContent>
                    <Box display="flex" alignItems="center" mb={2}>
                      <Box sx={{ bgcolor: '#f44336', p: 1, borderRadius: '50%', mr: 2 }}>
                        <TrendingDown sx={{ color: 'white' }} />
                      </Box>
                      <Typography variant="h6" color="error.main">
                        Expense Categories
                      </Typography>
                    </Box>
                    <Divider sx={{ mb: 2 }} />
                    {Object.entries(expenseCategories || {}).length === 0 ? (
                      <Box sx={{ py: 4, textAlign: 'center' }}>
                        <Typography color="textSecondary">
                          No expenses recorded today
                        </Typography>
                      </Box>
                    ) : (
                      Object.entries(expenseCategories || {}).map(([category, amount]) => (
                        <Box key={category} sx={{ mb: 2 }}>
                          <Box display="flex" justifyContent="space-between" alignItems="center">
                            <Box display="flex" alignItems="center">
                              <Box sx={{ width: 8, height: 8, bgcolor: '#f44336', borderRadius: '50%', mr: 1.5 }} />
                              <Typography>{category}</Typography>
                            </Box>
                            <Typography fontWeight="bold" color="error.main" sx={{ fontSize: '1.1rem' }}>
                              ৳{amount.toLocaleString()}
                            </Typography>
                          </Box>
                          <LinearProgress 
                            variant="determinate" 
                            value={Math.min(100, (amount / (balance?.cash_out || 1)) * 100)} 
                            color="error"
                            sx={{ mt: 1, height: 6, borderRadius: 3 }}
                          />
                        </Box>
                      ))
                    )}
                  </CardContent>
                </Card>
              </Grid>
            </Grid>
          )}

          {/* Remaining tabs content... */}
          {/* (Keep your existing Tab 3 and Tab 4 content from before) */}

          {/* Dialogs */}
          <Dialog 
            open={openTransactionDialog} 
            onClose={handleCloseTransactionDialog} 
            maxWidth="sm" 
            fullWidth
            PaperProps={{ sx: { borderRadius: 2 } }}
          >
            <DialogTitle sx={{ bgcolor: transactionForm.type === 'income' ? '#4caf50' : '#f44336', color: 'white' }}>
              <Box display="flex" alignItems="center">
                {transactionForm.type === 'income' ? <TrendingUp sx={{ mr: 1 }} /> : <TrendingDown sx={{ mr: 1 }} />}
                {transactionForm.type === 'income' ? 'Record Income' : 'Record Expense'}
              </Box>
            </DialogTitle>
            <DialogContent>
              {/* Keep your existing form content */}
            </DialogContent>
          </Dialog>

          <Snackbar
            open={snackbar.open}
            autoHideDuration={6000}
            onClose={() => setSnackbar({ ...snackbar, open: false })}
            anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
          >
            <Alert 
              onClose={() => setSnackbar({ ...snackbar, open: false })} 
              severity={snackbar.severity}
              sx={{ width: '100%', borderRadius: 2 }}
              elevation={6}
            >
              {snackbar.message}
            </Alert>
          </Snackbar>
        </Box>
      </LocalizationProvider>
    </Layout>
  );
};

export default Accounts;