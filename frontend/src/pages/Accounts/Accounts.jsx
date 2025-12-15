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
  InputAdornment,
  LinearProgress,
  Stack,
  IconButton,
  Tooltip,
  CircularProgress  
} from '@mui/material';
import axios from 'axios';
import {
  Add,
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
  Refresh,
  Edit,
  Visibility,
  AccountCircle,
  Business,
  AddCircle,
  RemoveCircle,
  History,
  Download as DownloadIcon,
  Assessment,
  Analytics,
  PictureAsPdf,
  CalendarToday,
  TableChart,
  GridOn,
  Notifications,
  CheckCircle,
  Cancel,
  ThumbUp,
  ThumbDown
} from '@mui/icons-material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import PictureAsPdfIcon from '@mui/icons-material/PictureAsPdf';
import InsertChartIcon from '@mui/icons-material/InsertChart';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { useDispatch, useSelector } from 'react-redux';
import { 
  fetchAccountBalance, 
  createAccountTransaction, 
  fetchMonthlySummary,
  setOpeningBalance 
} from '../../store/slices/accountSlice';
import Layout from '../../components/common/Layout';
import { accountAPI } from '../../services/api';

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
  
  const [openYearlyReport, setOpenYearlyReport] = useState(false);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [yearlySummary, setYearlySummary] = useState(null);
  const [activeTab, setActiveTab] = useState(0);
  const [openTransactionDialog, setOpenTransactionDialog] = useState(false);
  const [openOpeningBalanceDialog, setOpenOpeningBalanceDialog] = useState(false);
  const [openVoucherDialog, setOpenVoucherDialog] = useState(false);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [selectedVoucher, setSelectedVoucher] = useState(null);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const [openDownloadDialog, setOpenDownloadDialog] = useState(false);
  const [downloadType, setDownloadType] = useState('credit');
  const [downloadStartDate, setDownloadStartDate] = useState(new Date());
  const [downloadEndDate, setDownloadEndDate] = useState(new Date());  
  

  const [transactionForm, setTransactionForm] = useState({
    date: new Date().toISOString().split('T')[0],
    name: '',
    description: '',
    type: 'income',
    category: '',
    amount: '',
    payment_method: 'cash',
    reference_number: '',
    notes: ''
  });

  const [openingBalanceForm, setOpeningBalanceForm] = useState({
    date: new Date().toISOString().split('T')[0],
    amount: ''
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

  const handleOpenTransactionDialog = (type = 'income') => {
    setTransactionForm({
      date: new Date().toISOString().split('T')[0],
      name: '',
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

  const handleOpenOpeningBalanceDialog = () => {
    setOpeningBalanceForm({
      date: new Date().toISOString().split('T')[0],
      amount: ''
    });
    setOpenOpeningBalanceDialog(true);
  };

  const handleViewVoucher = (transaction) => {
    setSelectedVoucher(transaction);
    setOpenVoucherDialog(true);
  };

  const handleCloseTransactionDialog = () => {
    setOpenTransactionDialog(false);
  };

  const handleCloseOpeningBalanceDialog = () => {
    setOpenOpeningBalanceDialog(false);
  };

  const handleCloseVoucherDialog = () => {
    setOpenVoucherDialog(false);
    setSelectedVoucher(null);
  };

  const handleSubmitTransaction = async () => {
    try {
      const result = await dispatch(createAccountTransaction(transactionForm)).unwrap();
      setSnackbar({ 
        open: true, 
        message: `Transaction recorded successfully. Voucher #: ${result.voucher_number}`, 
        severity: 'success' 
      });
      handleCloseTransactionDialog();
      dispatch(fetchAccountBalance());
      
      // Show voucher automatically
      setTimeout(() => {
        setSelectedVoucher(result.transaction);
        setOpenVoucherDialog(true);
      }, 500);
    } catch (error) {
      setSnackbar({ open: true, message: 'Failed to record transaction: ' + error.message, severity: 'error' });
    }
  };

  const handleSetOpeningBalance = async () => {
    try {
      await dispatch(setOpeningBalance(openingBalanceForm)).unwrap();
      setSnackbar({ open: true, message: 'Opening balance set successfully', severity: 'success' });
      handleCloseOpeningBalanceDialog();
      dispatch(fetchAccountBalance());
    } catch (error) {
      setSnackbar({ open: true, message: 'Failed to set opening balance: ' + error.message, severity: 'error' });
    }
  };

  const handleDateChange = (date) => {
    setSelectedDate(date);
    dispatch(fetchAccountBalance(date.toISOString().split('T')[0]));
  };

  const handlePrintVoucher = () => {
    const printWindow = window.open('', '_blank');
    
    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>Voucher - ${selectedVoucher?.voucher_number}</title>
        <style>
          @import url('https://fonts.googleapis.com/css2?family=Hind+Siliguri:wght@300;400;500;600;700&display=swap');
          body { 
            font-family: 'Hind Siliguri', Arial, sans-serif; 
            margin: 0; 
            padding: 20px; 
            background: white;
          }
          .voucher-container { 
            max-width: 800px; 
            margin: 0 auto; 
            border: 2px solid #000; 
            padding: 20px;
            position: relative;
          }
          .company-header { 
            text-align: center; 
            background: #FF991D;  /* CHANGED COLOR */
            color: white; 
            padding: 15px; 
            margin: -20px -20px 20px -20px;
          }
          .company-name { 
            font-size: 24px; 
            font-weight: bold; 
            margin-bottom: 5px;
          }
          .company-address {
            font-size: 14px;
            margin-bottom: 5px;
          }
          .company-contact {
            font-size: 13px;
            margin-bottom: 5px;
          }
          .voucher-title { 
            font-size: 20px; 
            font-weight: bold;
            margin: 20px 0;
            text-align: center;
            text-decoration: underline;
          }
          .details-table {
            width: 100%;
            border-collapse: collapse;
            margin: 20px 0;
          }
          .details-table td {
            padding: 8px;
            border: 1px solid #000;
          }
          .details-table .label {
            width: 30%;
            background: #f5f5f5;
            font-weight: bold;
          }
          .amount-in-words {
            padding: 10px;
            border: 1px solid #000;
            margin: 20px 0;
            background: #f9f9f9;
            font-weight: bold;
          }
          .signature-section {
            margin-top: 60px;
            display: flex;
            justify-content: space-between;
            text-align: center;
          }
          .signature-box {
            width: 23%;
          }
          .signature-line {
            border-top: 1px solid #000;
            margin-top: 40px;
            padding-top: 5px;
          }
          .bangla-amount {
            font-family: 'Hind Siliguri', sans-serif;
            font-size: 16px;
            font-weight: bold;
            color: #d32f2f;
          }
          @media print {
            body { margin: 0; }
            .no-print { display: none; }
            .voucher-container { border: none; }
          }
        </style>
      </head>
      <body>
        <div class="voucher-container">
          <div class="company-header">
            <div class="company-name">SHAHFARID REAL ESTATE COMPANY</div>
            <div class="company-address">Ambika Sarak, Jhiltuli, Faridpur</div>
            <div class="company-contact">
              Phone: 01711121673 | Email: info@sfrec-bd.com  <!-- UPDATED CONTACT -->
            </div>
          </div>
          
          <div class="voucher-title">
            ${selectedVoucher?.voucher_type === 'credit' ? 'CREDIT VOUCHER' : 'DEBIT VOUCHER'}
          </div>
          
          <table class="details-table">
            <tr>
              <td class="label">Voucher No:</td>
              <td><strong>${selectedVoucher?.voucher_number}</strong></td>
            </tr>
            <tr>
              <td class="label">Date:</td>
              <td>${new Date(selectedVoucher?.date).toLocaleDateString('bn-BD')}</td>
            </tr>
            <tr>
              <td class="label">Name:</td>
              <td>${selectedVoucher?.name}</td>
            </tr>
            <tr>
              <td class="label">Description:</td>
              <td>${selectedVoucher?.description}</td>
            </tr>
            <tr>
              <td class="label">Category:</td>
              <td>${selectedVoucher?.category}</td>
            </tr>
            <tr>
              <td class="label">Payment Method:</td>
              <td>${selectedVoucher?.payment_method}</td>
            </tr>
            ${selectedVoucher?.reference_number ? `
            <tr>
              <td class="label">Reference:</td>
              <td>${selectedVoucher?.reference_number}</td>
            </tr>
            ` : ''}
            <tr>
              <td class="label">Amount:</td>
              <td><strong>৳${selectedVoucher?.amount?.toLocaleString()}</strong></td>
            </tr>
          </table>
          
          <div class="amount-in-words">
            <strong>মোট টাকার পরিমাণ:</strong>
            <div class="bangla-amount">${selectedVoucher?.amount_in_bangla || ''}</div>
          </div>
          
          ${selectedVoucher?.notes ? `
          <div style="margin: 20px 0; padding: 10px; border: 1px solid #000;">
            <strong>Notes:</strong> ${selectedVoucher?.notes}
          </div>
          ` : ''}
          
          <div class="signature-section">
            <div class="signature-box">
              <div>অর্থ সংক্রান্ত কর্মকর্তা</div>
              <div>(Accounts Officer)</div>
              <div class="signature-line"></div>
              <div>তারিখ: ${new Date().toLocaleDateString('bn-BD')}</div>
            </div>
            <div class="signature-box">
              <div>হিসাব পরীক্ষক</div>
              <div>(Accountant)</div>
              <div class="signature-line"></div>
              <div>তারিখ: ${new Date().toLocaleDateString('bn-BD')}</div>
            </div>
            <div class="signature-box">
              <div>সিইও/এমডি</div>
              <div>(CEO/MD)</div>
              <div class="signature-line"></div>
              <div>তারিখ: ${new Date().toLocaleDateString('bn-BD')}</div>
            </div>
            <div class="signature-box">
              <div>প্রাপক স্বাক্ষর</div>
              <div>(Receiver Signature)</div>
              <div class="signature-line"></div>
              <div>তারিখ: ${new Date().toLocaleDateString('bn-BD')}</div>
            </div>
          </div>
        </div>
      </body>
      </html>
    `);
    
    printWindow.document.close();
    printWindow.print();
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

  const getVoucherTypeColor = (type) => {
    return type === 'credit' ? 'success' : 'error';
  };

  const handleDownloadPDF = async () => {
    try {
      const formatDate = (date) => {
        return date.toISOString().split('T')[0];
      };
      
      // FIX: Add responseType to get proper PDF blob
      const response = await accountAPI[downloadType === 'credit' ? 'downloadCreditPDF' : 'downloadDebitPDF']({
        startDate: formatDate(downloadStartDate),
        endDate: formatDate(downloadEndDate)
      }, {
        responseType: 'blob' // IMPORTANT: This tells axios to handle the response as a blob
      });
      
      // Create download link
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `${downloadType}-transactions-${formatDate(downloadStartDate)}-to-${formatDate(downloadEndDate)}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      
      setSnackbar({ 
        open: true, 
        message: `${downloadType === 'credit' ? 'Credit' : 'Debit'} PDF downloaded successfully`, 
        severity: 'success' 
      });
      
      setOpenDownloadDialog(false);
    } catch (error) {
      console.error('Download error:', error);
      setSnackbar({ 
        open: true, 
        message: `Failed to download PDF: ${error.response?.data?.message || error.message}`, 
        severity: 'error' 
      });
    }
  };

  const handleOpenYearlyReport = async () => {
    try {
      const response = await accountAPI.getYearlySummary(selectedYear);
      setYearlySummary(response.data);
      setOpenYearlyReport(true);
    } catch (error) {
      setSnackbar({ 
        open: true, 
        message: 'Failed to load yearly report: ' + error.message, 
        severity: 'error' 
      });
    }
  };

  const handleExportExcel = async () => {
    try {
      // FIX: Add responseType for Excel download
      const response = await accountAPI.downloadYearlyExcel(selectedYear, {
        responseType: 'blob'
      });
      
      // Create download link
      const url = window.URL.createObjectURL(new Blob([response.data], { 
        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' 
      }));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `yearly-report-${selectedYear}.xlsx`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      
      setSnackbar({ 
        open: true, 
        message: `Yearly report for ${selectedYear} exported to Excel successfully`, 
        severity: 'success' 
      });
      
    } catch (error) {
      console.error('Excel export error:', error);
      setSnackbar({ 
        open: true, 
        message: `Failed to export Excel: ${error.response?.data?.message || error.message}`, 
        severity: 'error' 
      });
    }
  };

  const handleExportPDF = async () => {
    try {
      // FIX: Add responseType for PDF download
      const response = await accountAPI.downloadYearlyPDF(selectedYear, {
        responseType: 'blob'
      });
      
      // Create download link
      const url = window.URL.createObjectURL(new Blob([response.data], { 
        type: 'application/pdf' 
      }));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `yearly-report-${selectedYear}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      
      setSnackbar({ 
        open: true, 
        message: `Yearly report for ${selectedYear} exported to PDF successfully`, 
        severity: 'success' 
      });
      
    } catch (error) {
      console.error('PDF export error:', error);
      setSnackbar({ 
        open: true, 
        message: `Failed to export PDF: ${error.response?.data?.message || error.message}`, 
        severity: 'error' 
      });
    }
  };

  // Calculate cash in hand
  const totalCashInHand = balance?.closing_balance || 0;

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
          {/* Header */}
          <Paper elevation={3} sx={{mb: 3, p: 3, borderRadius: 2, bgcolor: '#1a237e', color: 'white' }}>
            <Box display="flex" justifyContent="space-between" alignItems="center">
              <Box>
                <Typography variant="h4" fontWeight="bold">
                  <AccountBalanceWallet sx={{ verticalAlign: 'middle', mr: 1 }} />
                  Accounts Management
                </Typography>
                <Typography variant="body1" sx={{ opacity: 0.9, mt: 1 }}>
                  SHAHFARID REAL ESTATE COMPANY - Ambika Sarak, Jhiltuli, Faridpur
                </Typography>
              </Box>
              <Stack direction="row" spacing={2}>
                <Button
                  variant="outlined"
                  startIcon={<PictureAsPdf />}
                  onClick={() => {
                    setDownloadType('credit');
                    setOpenDownloadDialog(true);
                  }}
                  sx={{ color: '#4caf50', borderColor: '#4caf50' }}
                >
                  Credit PDF
                </Button>
                <Button
                  variant="outlined"
                  startIcon={<PictureAsPdf />}
                  onClick={() => {
                    setDownloadType('debit');
                    setOpenDownloadDialog(true);
                  }}
                  sx={{ color: '#f44336', borderColor: '#f44336' }}
                >
                  Debit PDF
                </Button>
                <Button
                  variant="outlined"
                  startIcon={<Assessment />}
                  onClick={handleOpenYearlyReport}
                  sx={{ color: '#2196f3', borderColor: '#2196f3' }}
                >
                  Yearly Report
                </Button>
                <Button
                  variant="contained"
                  color="success"
                  startIcon={<AddCircle />}
                  onClick={() => handleOpenTransactionDialog('income')}
                >
                  Add Income
                </Button>
                <Button
                  variant="contained"
                  color="error"
                  startIcon={<RemoveCircle />}
                  onClick={() => handleOpenTransactionDialog('expense')}
                >
                  Add Expense
                </Button>
              </Stack>
            </Box>
          </Paper>
          {/* Quick Stats */}
          <Grid container spacing={3} mb={4}>
            <Grid item xs={12} sm={6} md={3}>
              <Card sx={{ borderRadius: 2, boxShadow: 3, borderLeft: '4px solid #4caf50' }}>
                <CardContent>
                  <Box display="flex" alignItems="center" mb={2}>
                    <TrendingUp color="success" sx={{ mr: 2 }} />
                    <Typography variant="h6">Today's Income</Typography>
                  </Box>
                  <Typography variant="h4" color="success.main" fontWeight="bold">
                    ৳{(balance?.cash_in || 0).toFixed(2)}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            
            <Grid item xs={12} sm={6} md={3}>
              <Card sx={{ borderRadius: 2, boxShadow: 3, borderLeft: '4px solid #f44336' }}>
                <CardContent>
                  <Box display="flex" alignItems="center" mb={2}>
                    <TrendingDown color="error" sx={{ mr: 2 }} />
                    <Typography variant="h6">Today's Expense</Typography>
                  </Box>
                  <Typography variant="h4" color="error.main" fontWeight="bold">
                    ৳{(balance?.cash_out || 0).toFixed(2)}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            
            <Grid item xs={12} sm={6} md={3}>
              <Card sx={{ borderRadius: 2, boxShadow: 3, borderLeft: '4px solid #2196f3' }}>
                <CardContent>
                  <Box display="flex" alignItems="center" mb={2}>
                    <AccountBalanceWallet color="primary" sx={{ mr: 2 }} />
                    <Typography variant="h6">Cash in Hand</Typography>
                  </Box>
                  <Typography variant="h4" color="primary.main" fontWeight="bold">
                  ৳{(balance?.closing_balance || 0).toFixed(2)}
                </Typography>
                </CardContent>
              </Card>
            </Grid>
            
            <Grid item xs={12} sm={6} md={3}>
              <Card sx={{ borderRadius: 2, boxShadow: 3, borderLeft: '4px solid #ff9800' }}>
                <CardContent>
                  <Box display="flex" alignItems="center" mb={2}>
                    <Savings color="warning" sx={{ mr: 2 }} />
                    <Typography variant="h6">Opening Balance</Typography>
                  </Box>
                  <Typography variant="h4" color="warning.main" fontWeight="bold">
                    ৳{balance?.opening_balance?.toLocaleString() || '0'}
                  </Typography>
                  <Button 
                    size="small" 
                    onClick={handleOpenOpeningBalanceDialog}
                    sx={{ mt: 1 }}
                  >
                    Update
                  </Button>
                </CardContent>
              </Card>
            </Grid>
          </Grid>

          {/* Date Selector */}
          <Card sx={{ mb: 3, borderRadius: 2, boxShadow: 2 }}>
            <CardContent>
              <Box display="flex" alignItems="center" justifyContent="space-between">
                <Box display="flex" alignItems="center">
                  <CalendarMonth color="primary" sx={{ mr: 2 }} />
                  <Typography variant="h6">Select Date: {selectedDate.toLocaleDateString()}</Typography>
                </Box>
                <DatePicker
                  value={selectedDate}
                  onChange={handleDateChange}
                  renderInput={(params) => <TextField {...params} size="small" sx={{ width: 200 }} />}
                />
              </Box>
            </CardContent>
          </Card>

          {/* Tabs Section - For better organization */}
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
            </Tabs>
          </Paper>

          {error && (
            <Alert 
              severity="error" 
              sx={{ mb: 3, borderRadius: 2 }}
              action={
                <Button color="inherit" size="small" onClick={() => dispatch(fetchAccountBalance())}>
                  Retry
                </Button>
              }
            >
              {error}
            </Alert>
          )}

          {/* Tab 1: Today's Transactions */}
          {activeTab === 0 && (
            <Paper sx={{ borderRadius: 2, overflow: 'hidden', mb: 3 }}>
              <Box sx={{ p: 2, bgcolor: '#f5f5f5', borderBottom: 1, borderColor: 'divider', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Typography variant="h6">Today's Transactions</Typography>
                <Button startIcon={<Refresh />} onClick={() => dispatch(fetchAccountBalance())}>
                  Refresh
                </Button>
              </Box>
              
              {todayTransactions?.length === 0 ? (
                <Box sx={{ p: 8, textAlign: 'center' }}>
                  <MonetizationOn sx={{ fontSize: 80, color: '#e0e0e0', mb: 2 }} />
                  <Typography variant="h6" gutterBottom color="textSecondary">
                    No Transactions Today
                  </Typography>
                </Box>
              ) : (
                <TableContainer>
                  <Table>
                    <TableHead>
                      <TableRow sx={{ bgcolor: '#fafafa' }}>
                        <TableCell><strong>Voucher No</strong></TableCell>
                        <TableCell><strong>Type</strong></TableCell>
                        <TableCell><strong>Name</strong></TableCell>
                        <TableCell><strong>Description</strong></TableCell>
                        <TableCell><strong>Amount</strong></TableCell>
                        <TableCell><strong>Actions</strong></TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {todayTransactions?.map((transaction) => (
                        <TableRow key={transaction.id} hover>
                          <TableCell>
                            <Typography variant="body2" color="textSecondary">
                              {transaction.voucher_number}
                            </Typography>
                          </TableCell>
                          <TableCell>
                            <Chip 
                              label={transaction.voucher_type === 'credit' ? 'Credit' : 'Debit'} 
                              color={getVoucherTypeColor(transaction.voucher_type)}
                              size="small"
                            />
                          </TableCell>
                          <TableCell>
                            <Typography fontWeight="bold">{transaction.name}</Typography>
                          </TableCell>
                          <TableCell>
                            <Typography variant="body2">{transaction.description}</Typography>
                            {transaction.category && (
                              <Chip 
                                label={transaction.category} 
                                size="small" 
                                sx={{ mt: 0.5 }}
                                color={getCategoryColor(transaction.category)}
                              />
                            )}
                          </TableCell>
                          <TableCell>
                            <Typography 
                              fontWeight="bold"
                              color={transaction.type === 'income' ? 'success.main' : 'error.main'}
                            >
                              ৳{parseFloat(transaction.amount).toLocaleString()}
                            </Typography>
                          </TableCell>
                          <TableCell>
                            <Tooltip title="View Voucher">
                              <IconButton 
                                size="small" 
                                onClick={() => handleViewVoucher(transaction)}
                                color="primary"
                              >
                                <Print />
                              </IconButton>
                            </Tooltip>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              )}
            </Paper>
          )}

          {/* Tab 2: Income/Expense Analysis */}
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

          {/* Tab 3: Monthly Summary - Placeholder for now */}
          {activeTab === 2 && (
            <Box>
              <Paper sx={{ p: 3, mb: 3, textAlign: 'center' }}>
                <Typography variant="h6" gutterBottom>
                  Monthly Summary Coming Soon
                </Typography>
                <Typography color="textSecondary">
                  This feature is under development
                </Typography>
              </Paper>
            </Box>
          )}

          {/* Transaction Dialog */}
          <Dialog open={openTransactionDialog} onClose={handleCloseTransactionDialog} maxWidth="sm" fullWidth>
            <DialogTitle sx={{ bgcolor: transactionForm.type === 'income' ? '#4caf50' : '#f44336', color: 'white' }}>
              {transactionForm.type === 'income' ? 'Create Credit Voucher (Income)' : 'Create Debit Voucher (Expense)'}
            </DialogTitle>
            <DialogContent sx={{ mt: 2 }}>
              <TextField
                fullWidth
                label="Date"
                type="date"
                value={transactionForm.date}
                onChange={(e) => setTransactionForm({ ...transactionForm, date: e.target.value })}
                margin="normal"
                InputLabelProps={{ shrink: true }}
              />
              <TextField
                fullWidth
                label="Name"
                value={transactionForm.name}
                onChange={(e) => setTransactionForm({ ...transactionForm, name: e.target.value })}
                margin="normal"
                required
                helperText="Name of person/company"
              />
              <TextField
                fullWidth
                label="Description"
                value={transactionForm.description}
                onChange={(e) => setTransactionForm({ ...transactionForm, description: e.target.value })}
                margin="normal"
                required
                multiline
                rows={2}
              />
              <FormControl fullWidth margin="normal">
                <InputLabel>Category</InputLabel>
                <Select
                  value={transactionForm.category}
                  label="Category"
                  onChange={(e) => setTransactionForm({ ...transactionForm, category: e.target.value })}
                >
                  {transactionForm.type === 'income' 
                    ? incomeCategoriesList.map(category => (
                        <MenuItem key={category} value={category}>{category}</MenuItem>
                      ))
                    : expenseCategoriesList.map(category => (
                        <MenuItem key={category} value={category}>{category}</MenuItem>
                      ))
                  }
                </Select>
              </FormControl>
              <TextField
                fullWidth
                label="Amount (৳)"
                type="number"
                value={transactionForm.amount}
                onChange={(e) => setTransactionForm({ ...transactionForm, amount: e.target.value })}
                margin="normal"
                required
                InputProps={{
                  startAdornment: <InputAdornment position="start">৳</InputAdornment>,
                }}
              />
              <FormControl fullWidth margin="normal">
                <InputLabel>Payment Method</InputLabel>
                <Select
                  value={transactionForm.payment_method}
                  label="Payment Method"
                  onChange={(e) => setTransactionForm({ ...transactionForm, payment_method: e.target.value })}
                >
                  <MenuItem value="cash">Cash</MenuItem>
                  <MenuItem value="bank">Bank Transfer</MenuItem>
                  <MenuItem value="mobile_banking">Mobile Banking</MenuItem>
                  <MenuItem value="check">Check</MenuItem>
                </Select>
              </FormControl>
              <TextField
                fullWidth
                label="Reference Number"
                value={transactionForm.reference_number}
                onChange={(e) => setTransactionForm({ ...transactionForm, reference_number: e.target.value })}
                margin="normal"
              />
              <TextField
                fullWidth
                label="Notes"
                value={transactionForm.notes}
                onChange={(e) => setTransactionForm({ ...transactionForm, notes: e.target.value })}
                margin="normal"
                multiline
                rows={2}
              />
            </DialogContent>
            <DialogActions>
              <Button onClick={handleCloseTransactionDialog}>Cancel</Button>
              <Button 
                onClick={handleSubmitTransaction} 
                variant="contained"
                color={transactionForm.type === 'income' ? 'success' : 'error'}
              >
                Create {transactionForm.type === 'income' ? 'Credit' : 'Debit'} Voucher
              </Button>
            </DialogActions>
          </Dialog>

          {/* Opening Balance Dialog */}
          <Dialog open={openOpeningBalanceDialog} onClose={handleCloseOpeningBalanceDialog} maxWidth="sm" fullWidth>
            <DialogTitle sx={{ bgcolor: '#ff9800', color: 'white' }}>
              Set Opening Balance
            </DialogTitle>
            <DialogContent sx={{ mt: 2 }}>
              <TextField
                fullWidth
                label="Date"
                type="date"
                value={openingBalanceForm.date}
                onChange={(e) => setOpeningBalanceForm({ ...openingBalanceForm, date: e.target.value })}
                margin="normal"
                InputLabelProps={{ shrink: true }}
              />
              <TextField
                fullWidth
                label="Opening Balance (৳)"
                type="number"
                value={openingBalanceForm.amount}
                onChange={(e) => setOpeningBalanceForm({ ...openingBalanceForm, amount: e.target.value })}
                margin="normal"
                required
                InputProps={{
                  startAdornment: <InputAdornment position="start">৳</InputAdornment>,
                }}
                helperText="Starting cash balance for the day"
              />
            </DialogContent>
            <DialogActions>
              <Button onClick={handleCloseOpeningBalanceDialog}>Cancel</Button>
              <Button onClick={handleSetOpeningBalance} variant="contained" color="warning">
                Set Opening Balance
              </Button>
            </DialogActions>
          </Dialog>

          {/* Voucher View Dialog */}
          {selectedVoucher && (
            <Dialog open={openVoucherDialog} onClose={handleCloseVoucherDialog} maxWidth="md" fullWidth>
              <DialogTitle>
                Voucher: {selectedVoucher.voucher_number}
              </DialogTitle>
              <DialogContent>
                <Paper sx={{ p: 3, border: '2px solid #000', position: 'relative' }}>
                  {/* Voucher Header */}
                  <Box sx={{ 
                    textAlign: 'center', 
                    bgcolor: '#ff5722', 
                    color: 'white', 
                    py: 2, 
                    mx: -3, 
                    mt: -3,
                    mb: 3
                  }}>
                    <Typography variant="h5" fontWeight="bold">
                      SHAHFARID REAL ESTATE COMPANY
                    </Typography>
                    <Typography variant="body2">
                      Ambika Sarak, Jhiltuli, Faridpur
                    </Typography>
                  </Box>

                  {/* Voucher Title */}
                  <Typography variant="h6" align="center" gutterBottom sx={{ textDecoration: 'underline', mb: 3 }}>
                    {selectedVoucher.voucher_type === 'credit' ? 'CREDIT VOUCHER' : 'DEBIT VOUCHER'}
                  </Typography>

                  {/* Voucher Details */}
                  <TableContainer>
                    <Table size="small">
                      <TableBody>
                        <TableRow>
                          <TableCell sx={{ bgcolor: '#f5f5f5', fontWeight: 'bold', width: '30%' }}>Voucher No:</TableCell>
                          <TableCell><strong>{selectedVoucher.voucher_number}</strong></TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell sx={{ bgcolor: '#f5f5f5', fontWeight: 'bold' }}>Date:</TableCell>
                          <TableCell>{new Date(selectedVoucher.date).toLocaleDateString()}</TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell sx={{ bgcolor: '#f5f5f5', fontWeight: 'bold' }}>Name:</TableCell>
                          <TableCell>{selectedVoucher.name}</TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell sx={{ bgcolor: '#f5f5f5', fontWeight: 'bold' }}>Description:</TableCell>
                          <TableCell>{selectedVoucher.description}</TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell sx={{ bgcolor: '#f5f5f5', fontWeight: 'bold' }}>Category:</TableCell>
                          <TableCell>
                            <Chip 
                              label={selectedVoucher.category} 
                              color={getCategoryColor(selectedVoucher.category)}
                              size="small"
                            />
                          </TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell sx={{ bgcolor: '#f5f5f5', fontWeight: 'bold' }}>Payment Method:</TableCell>
                          <TableCell>{selectedVoucher.payment_method}</TableCell>
                        </TableRow>
                        {selectedVoucher.reference_number && (
                          <TableRow>
                            <TableCell sx={{ bgcolor: '#f5f5f5', fontWeight: 'bold' }}>Reference:</TableCell>
                            <TableCell>{selectedVoucher.reference_number}</TableCell>
                          </TableRow>
                        )}
                        <TableRow>
                          <TableCell sx={{ bgcolor: '#f5f5f5', fontWeight: 'bold' }}>Amount:</TableCell>
                          <TableCell>
                            <Typography variant="h6" color={selectedVoucher.type === 'income' ? 'success.main' : 'error.main'}>
                              ৳{parseFloat(selectedVoucher.amount).toLocaleString()}
                            </Typography>
                          </TableCell>
                        </TableRow>
                      </TableBody>
                    </Table>
                  </TableContainer>

                  {/* Amount in Bangla */}
                  {selectedVoucher.amount_in_bangla && (
                    <Paper sx={{ p: 2, mt: 2, bgcolor: '#f9f9f9', border: '1px solid #000' }}>
                      <Typography fontWeight="bold">মোট টাকার পরিমাণ:</Typography>
                      <Typography variant="h6" color="#d32f2f" fontFamily="'Hind Siliguri', sans-serif">
                        {selectedVoucher.amount_in_bangla}
                      </Typography>
                    </Paper>
                  )}

                  {/* Signature Section */}
                  <Grid container spacing={3} sx={{ mt: 4 }}>
                    <Grid item xs={3}>
                      <Box sx={{ textAlign: 'center' }}>
                        <Typography variant="body2">প্রস্তুতকারী</Typography>
                        <Divider sx={{ mt: 1 }} />
                        <Typography variant="caption">তারিখ: {new Date().toLocaleDateString()}</Typography>
                      </Box>
                    </Grid>
                    <Grid item xs={3}>
                      <Box sx={{ textAlign: 'center' }}>
                        <Typography variant="body2">পরীক্ষক</Typography>
                        <Divider sx={{ mt: 1 }} />
                        <Typography variant="caption">তারিখ: {new Date().toLocaleDateString()}</Typography>
                      </Box>
                    </Grid>
                    <Grid item xs={3}>
                      <Box sx={{ textAlign: 'center' }}>
                        <Typography variant="body2">অনুমোদনকারী</Typography>
                        <Divider sx={{ mt: 1 }} />
                        <Typography variant="caption">তারিখ: {new Date().toLocaleDateString()}</Typography>
                      </Box>
                    </Grid>
                    <Grid item xs={3}>
                      <Box sx={{ textAlign: 'center' }}>
                        <Typography variant="body2">প্রাপক স্বাক্ষর</Typography>
                        <Divider sx={{ mt: 1 }} />
                        <Typography variant="caption">তারিখ: {new Date().toLocaleDateString()}</Typography>
                      </Box>
                    </Grid>
                  </Grid>
                </Paper>
              </DialogContent>
              <DialogActions>
                <Button onClick={handleCloseVoucherDialog}>Close</Button>
                <Button onClick={handlePrintVoucher} variant="contained" startIcon={<Print />}>
                  Print Voucher
                </Button>
              </DialogActions>
            </Dialog>
          )}

          {/* Yearly Report Dialog */}
          <Dialog open={openYearlyReport} onClose={() => setOpenYearlyReport(false)} maxWidth="lg" fullWidth>
            <DialogTitle>
              <Box display="flex" alignItems="center" justifyContent="space-between">
                <Box display="flex" alignItems="center">
                  <Analytics sx={{ mr: 2 }} />
                  <Typography variant="h6">
                    Yearly Financial Report - {selectedYear}
                  </Typography>
                </Box>
                <Box>
                  <TextField
                    select
                    size="small"
                    value={selectedYear}
                    onChange={(e) => setSelectedYear(parseInt(e.target.value))}
                    sx={{ minWidth: 120 }}
                  >
                    {[2022, 2023, 2024, 2025, 2026].map((year) => (
                      <MenuItem key={year} value={year}>{year}</MenuItem>
                    ))}
                  </TextField>
                </Box>
              </Box>
            </DialogTitle>
            
            <DialogContent>
              {yearlySummary ? (
                <Box>
                  {/* Summary Cards */}
                  <Grid container spacing={2} sx={{ mb: 3 }}>
                    <Grid item xs={12} sm={6} md={3}>
                      <Card sx={{ bgcolor: '#e8f5e9' }}>
                        <CardContent>
                          <Typography variant="body2" color="textSecondary">Total Income</Typography>
                          <Typography variant="h5" color="success.main" fontWeight="bold">
                            ৳{(yearlySummary.totalIncome || 0).toFixed(2)}
                          </Typography>
                        </CardContent>
                      </Card>
                    </Grid>
                    <Grid item xs={12} sm={6} md={3}>
                      <Card sx={{ bgcolor: '#ffebee' }}>
                        <CardContent>
                          <Typography variant="body2" color="textSecondary">Total Expense</Typography>
                          <Typography variant="h5" color="error.main" fontWeight="bold">
                            ৳{(yearlySummary.totalExpense || 0).toFixed(2)}
                          </Typography>
                        </CardContent>
                      </Card>
                    </Grid>
                    <Grid item xs={12} sm={6} md={3}>
                      <Card sx={{ bgcolor: '#e3f2fd' }}>
                        <CardContent>
                          <Typography variant="body2" color="textSecondary">Yearly Balance</Typography>
                          <Typography variant="h5" color="primary.main" fontWeight="bold">
                            ৳{(yearlySummary.yearlyBalance || 0).toFixed(2)}
                          </Typography>
                        </CardContent>
                      </Card>
                    </Grid>
                    <Grid item xs={12} sm={6} md={3}>
                      <Card sx={{ bgcolor: '#fff3e0' }}>
                        <CardContent>
                          <Typography variant="body2" color="textSecondary">Total Transactions</Typography>
                          <Typography variant="h5" color="warning.main" fontWeight="bold">
                            {yearlySummary.totalTransactions || 0}
                          </Typography>
                        </CardContent>
                      </Card>
                    </Grid>
                  </Grid>

                  {/* Monthly Breakdown */}
                  <Typography variant="h6" gutterBottom>
                    Monthly Breakdown
                  </Typography>
                  <TableContainer component={Paper} sx={{ mb: 3 }}>
                    <Table>
                      <TableHead>
                        <TableRow sx={{ bgcolor: '#f5f5f5' }}>
                          <TableCell><strong>Month</strong></TableCell>
                          <TableCell align="right"><strong>Income</strong></TableCell>
                          <TableCell align="right"><strong>Expense</strong></TableCell>
                          <TableCell align="right"><strong>Net Balance</strong></TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {Object.entries(yearlySummary.monthlySummary || {}).map(([month, data]) => (
                          <TableRow key={month} hover>
                            <TableCell>
                              {new Date(2000, parseInt(month), 1).toLocaleDateString('en-US', { month: 'long' })}
                            </TableCell>
                            <TableCell align="right">
                              <Typography color="success.main" fontWeight="medium">
                                ৳{(data.income || 0).toFixed(2)}
                              </Typography>
                            </TableCell>
                            <TableCell align="right">
                              <Typography color="error.main" fontWeight="medium">
                                ৳{(data.expense || 0).toFixed(2)}
                              </Typography>
                            </TableCell>
                            <TableCell align="right">
                              <Typography 
                                color={data.net >= 0 ? 'success.main' : 'error.main'} 
                                fontWeight="bold"
                              >
                                ৳{(data.net || 0).toFixed(2)}
                              </Typography>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TableContainer>
                </Box>
              ) : (
                <Box sx={{ p: 4, textAlign: 'center' }}>
                  <LinearProgress sx={{ mb: 2 }} />
                  <Typography sx={{ mt: 2 }}>Loading yearly report data...</Typography>
                </Box>
              )}
            </DialogContent>
            
            <DialogActions sx={{ p: 2, borderTop: 1, borderColor: 'divider' }}>
              <Button onClick={() => setOpenYearlyReport(false)}>Close</Button>
              <Button 
                variant="contained" 
                color="success"
                startIcon={<GridOn />}
                onClick={handleExportExcel}
                disabled={!yearlySummary}
              >
                Export as Excel
              </Button>
              <Button 
                variant="contained" 
                color="error"
                startIcon={<PictureAsPdf />}
                onClick={handleExportPDF}
                disabled={!yearlySummary}
                sx={{ ml: 1 }}
              >
                Export as PDF
              </Button>
            </DialogActions>
          </Dialog>

          {/* Download Date Selection Dialog */}
          <Dialog open={openDownloadDialog} onClose={() => setOpenDownloadDialog(false)} maxWidth="sm" fullWidth>
            <DialogTitle>
              <Box display="flex" alignItems="center">
                <CalendarToday sx={{ mr: 1 }} />
                Select Date Range for {downloadType === 'credit' ? 'Credit' : 'Debit'} Report
              </Box>
            </DialogTitle>
            <DialogContent>
              <Box sx={{ mt: 2 }}>
                <Grid container spacing={2}>
                  <Grid item xs={12}>
                    <Typography gutterBottom fontWeight="bold">
                      Report Type:
                    </Typography>
                    <Box display="flex" gap={2} mb={3}>
                      <Button
                        variant={downloadType === 'credit' ? 'contained' : 'outlined'}
                        color="success"
                        onClick={() => setDownloadType('credit')}
                        fullWidth
                      >
                        Credit Report
                      </Button>
                      <Button
                        variant={downloadType === 'debit' ? 'contained' : 'outlined'}
                        color="error"
                        onClick={() => setDownloadType('debit')}
                        fullWidth
                      >
                        Debit Report
                      </Button>
                    </Box>
                  </Grid>
                  
                  <Grid item xs={12} sm={6}>
                    <DatePicker
                      label="From Date"
                      value={downloadStartDate}
                      onChange={(newValue) => setDownloadStartDate(newValue)}
                      renderInput={(params) => <TextField {...params} fullWidth />}
                    />
                  </Grid>
                  
                  <Grid item xs={12} sm={6}>
                    <DatePicker
                      label="To Date"
                      value={downloadEndDate}
                      onChange={(newValue) => setDownloadEndDate(newValue)}
                      renderInput={(params) => <TextField {...params} fullWidth />}
                    />
                  </Grid>
                  
                  <Grid item xs={12}>
                    <Alert severity="info" sx={{ mt: 2 }}>
                      Report will include transactions from {downloadStartDate.toLocaleDateString()} to {downloadEndDate.toLocaleDateString()}
                    </Alert>
                  </Grid>
                </Grid>
              </Box>
            </DialogContent>
            <DialogActions>
              <Button onClick={() => setOpenDownloadDialog(false)}>Cancel</Button>
              <Button 
                variant="contained" 
                color="primary"
                onClick={handleDownloadPDF}
                startIcon={<PictureAsPdf />}
              >
                Generate PDF
              </Button>
            </DialogActions>
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
              sx={{ borderRadius: 2 }}
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