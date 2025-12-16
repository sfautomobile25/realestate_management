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
  Assessment,
  Analytics,
  PictureAsPdf,
  CalendarToday,
  GridOn,
  Notifications,
  CheckCircle,
  Cancel,
  ThumbUp,
  ThumbDown
} from '@mui/icons-material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { useDispatch, useSelector } from 'react-redux';
import { 
  fetchAccountBalance, 
  createAccountTransaction, 
  fetchMonthlySummary
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
  const [openVoucherDialog, setOpenVoucherDialog] = useState(false);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [selectedVoucher, setSelectedVoucher] = useState(null);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const [openDownloadDialog, setOpenDownloadDialog] = useState(false);
  const [downloadType, setDownloadType] = useState('credit');
  const [downloadStartDate, setDownloadStartDate] = useState(new Date());
  const [downloadEndDate, setDownloadEndDate] = useState(new Date());
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth());
  const [selectedMonthYear, setSelectedMonthYear] = useState(new Date().getFullYear());

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

  const months = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  useEffect(() => {
    dispatch(fetchAccountBalance());
    // Load current month's summary
    dispatch(fetchMonthlySummary({
      year: new Date().getFullYear(),
      month: new Date().getMonth() + 1
    }));
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

// First, update the useEffect to fetch monthly transactions
useEffect(() => {
  if (activeTab === 2) {
    // Load selected month's summary when tab changes
    dispatch(fetchMonthlySummary({
      year: selectedMonthYear,
      month: selectedMonth + 1
    }));
  }
}, [activeTab, selectedMonth, selectedMonthYear, dispatch]);

  const handleViewVoucher = (transaction) => {
    setSelectedVoucher(transaction);
    setOpenVoucherDialog(true);
  };

  const handleCloseTransactionDialog = () => {
    setOpenTransactionDialog(false);
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

  const handleDateChange = (date) => {
    setSelectedDate(date);
    dispatch(fetchAccountBalance(date));
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

  const handleMonthChange = (newMonth) => {
    setSelectedMonth(newMonth);
  };

  const handleYearChange = (newYear) => {
    setSelectedMonthYear(newYear);
  };

  const handleRefreshMonthlySummary = () => {
    dispatch(fetchMonthlySummary({
      year: selectedMonthYear,
      month: selectedMonth + 1
    }));
  };

// Replace the totalCashInHand calculation with this:
const totalCashInHand = parseFloat(balance?.closing_balance || 0);

// Also fix the auto opening balance calculation:
const autoOpeningBalance = parseFloat(balance?.previous_day_balance || balance?.opening_balance || 0);
const yesterdayBalance = parseFloat(balance?.yesterday_balance || 0);
const todayIncome = parseFloat(balance?.cash_in || 0);
const todayExpense = parseFloat(balance?.cash_out || 0);

// Add a validation function
const validateAmount = (amount) => {
  if (typeof amount === 'string') {
    const parsed = parseFloat(amount.replace(/[^0-9.-]+/g, ""));
    return isNaN(parsed) ? 0 : parsed;
  }
  if (typeof amount === 'number') {
    return amount;
  }
  return 0;
};

const validatedCashInHand = validateAmount(balance?.closing_balance);

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

// Monthly Summary Component - COMPLETELY REORGANIZED
const MonthlySummaryTab = () => {
  
  const [carryForward, setCarryForward] = useState(false);
  const isLoading = loading && activeTab === 2;
  const [isDownloadingExcel, setIsDownloadingExcel] = useState(false);
  // Helper functions to prepare data
const prepareIncomeData = () => {
  const items = [];
  let index = 1;
  
  if (!monthlySummary) return { items, total: 0, openingBalance: 0 };
  
  // IMPORTANT: Opening balance should come from previous month's closing balance
  const openingBalance = monthlySummary.openingBalance || 0;
  
  // Add opening balance as first item
  if (openingBalance > 0) {
    items.push({
      no: index++,
      description: 'আগের মাসের উদ্বৃত্ত',
      amount: openingBalance
    });
  }
  
  // Add income by category
  if (monthlySummary.incomeByCategory) {
    Object.entries(monthlySummary.incomeByCategory).forEach(([category, amount]) => {
      items.push({
        no: index++,
        description: category,
        amount: amount
      });
    });
  }
  
  const total = items.reduce((sum, item) => sum + item.amount, 0);
  return { items, total, openingBalance };
};

  const prepareExpenseData = () => {
    const items = [];
    let index = 1;
    
    if (!monthlySummary) return { items, total: 0 };
    
    // Add expense by category
    if (monthlySummary.expenseByCategory) {
      Object.entries(monthlySummary.expenseByCategory).forEach(([category, amount]) => {
        items.push({
          no: index++,
          description: category,
          amount: amount
        });
      });
    }
    
    const total = items.reduce((sum, item) => sum + item.amount, 0);
    return { items, total };
  };

// Then calculate closing balance properly:
const { items: incomeItems, total: incomeTotal, openingBalance } = prepareIncomeData();
const { items: expenseItems, total: expenseTotal } = prepareExpenseData();

  // Calculate derived values
  const totalIncome = monthlySummary?.totalIncome || incomeTotal || 0;
  const totalExpense = monthlySummary?.totalExpense || expenseTotal || 0;
  const netBalance = totalIncome - totalExpense;
  const maxRows = Math.max(incomeItems.length, expenseItems.length);
  const closingBalance = openingBalance + totalIncome - totalExpense;
  const netChange = totalIncome - totalExpense;

    // Function to handle carry forward
const handleCarryForward = () => {
  // This would typically save to backend
  localStorage.setItem(
    `openingBalance_${selectedMonthYear}_${selectedMonth + 1}`,
    closingBalance.toString()
  );
  setCarryForward(true);
  setSnackbar({
    open: true,
    message: `৳${closingBalance.toLocaleString()} পরবর্তী মাসের উদ্বৃত্ত হিসাবে সংরক্ষিত হয়েছে`,
    severity: 'success'
  });
};

// In your Excel generation, add a note:
const carryForwardNote = `পরবর্তী মাসের উদ্বৃত্ত হিসাবে সংরক্ষণযোগ্য: ৳${closingBalance.toLocaleString()}`;



const handleDownloadMonthlyExcel = async () => {
  try {
    setIsDownloadingExcel(true);
    
    // Dynamically import exceljs (better for performance)
    const ExcelJS = (await import('exceljs')).default;
    
    // Create a new workbook
    const workbook = new ExcelJS.Workbook();
    workbook.creator = 'শাহ ফরিদ রিয়েল এস্টেট কোঃ';
    workbook.created = new Date();
    
    // Add a worksheet with Bengali name
    const worksheet = workbook.addWorksheet(`${months[selectedMonth]} ${selectedMonthYear}`);
    
    // Set Bengali font (if available, otherwise fallback)
    const bengaliFont = 'Nirmala UI'; // Common Bengali font in Windows
    
    // =========== HEADER SECTION ===========
    // Company Name - Bengali
    worksheet.mergeCells('A1:F1');
    const companyNameCell = worksheet.getCell('A1');
    companyNameCell.value = 'শাহ ফরিদ রিয়েল এস্টেট কোঃ';
    companyNameCell.font = {
      name: bengaliFont,
      bold: true,
      size: 16,
      color: { argb: 'FFFFFFFF' }
    };
    companyNameCell.fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FF1A237E' } // Dark blue like your website
    };
    companyNameCell.alignment = { 
      horizontal: 'center',
      vertical: 'middle'
    };
    companyNameCell.border = {
      top: { style: 'medium' },
      left: { style: 'medium' },
      bottom: { style: 'medium' },
      right: { style: 'medium' }
    };
    
    // Company Address - Bengali
    worksheet.mergeCells('A2:F2');
    const addressCell = worksheet.getCell('A2');
    addressCell.value = 'অম্বিকা রোড ঝিলটুলি, ফরিদপুর সদর।';
    addressCell.font = {
      name: bengaliFont,
      size: 12,
      color: { argb: 'FFFFFFFF' }
    };
    addressCell.fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FF1A237E' }
    };
    addressCell.alignment = { 
      horizontal: 'center',
      vertical: 'middle'
    };
    addressCell.border = {
      left: { style: 'medium' },
      right: { style: 'medium' },
      bottom: { style: 'medium' }
    };
    
    // Report Title - English (for clarity)
    worksheet.mergeCells('A3:F3');
    const titleCell = worksheet.getCell('A3');
    titleCell.value = `Monthly Financial Statement - ${months[selectedMonth]} ${selectedMonthYear}`;
    titleCell.font = {
      bold: true,
      size: 14,
      color: { argb: 'FFFFFFFF' }
    };
    titleCell.fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FF1A237E' }
    };
    titleCell.alignment = { 
      horizontal: 'center',
      vertical: 'middle'
    };
    titleCell.border = {
      left: { style: 'medium' },
      right: { style: 'medium' },
      bottom: { style: 'medium' }
    };
    
    // Add empty row
    worksheet.addRow([]);
    
    // =========== TABLE HEADERS ===========
    // Income Header
    worksheet.mergeCells('A5:C5');
    const incomeHeader = worksheet.getCell('A5');
    incomeHeader.value = 'মাসিক আয়'; // Bengali for "Monthly Income"
    incomeHeader.font = {
      name: bengaliFont,
      bold: true,
      size: 12,
      color: { argb: 'FFFFFFFF' }
    };
    incomeHeader.fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FF4CAF50' } // Green like your website
    };
    incomeHeader.alignment = { 
      horizontal: 'center',
      vertical: 'middle'
    };
    incomeHeader.border = {
      top: { style: 'thin' },
      left: { style: 'thin' },
      bottom: { style: 'thin' },
      right: { style: 'thin' }
    };
    
    // Expense Header
    worksheet.mergeCells('D5:F5');
    const expenseHeader = worksheet.getCell('D5');
    expenseHeader.value = 'মাসিক ব্যয়'; // Bengali for "Monthly Expense"
    expenseHeader.font = {
      name: bengaliFont,
      bold: true,
      size: 12,
      color: { argb: 'FFFFFFFF' }
    };
    expenseHeader.fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FFF44336' } // Red like your website
    };
    expenseHeader.alignment = { 
      horizontal: 'center',
      vertical: 'middle'
    };
    expenseHeader.border = {
      top: { style: 'thin' },
      left: { style: 'thin' },
      bottom: { style: 'thin' },
      right: { style: 'thin' }
    };
    
    // =========== COLUMN HEADERS ===========
    const columnHeaders = worksheet.addRow([
      'ক্রমিক নং', 'বিবরণ', 'টাকার পরিমাণ (৳)', // Bengali for "No.", "Description", "Amount (BDT)"
      'ক্রমিক নং', 'বিবরণ', 'টাকার পরিমাণ (৳)'
    ]);
    
    columnHeaders.height = 25;
    columnHeaders.eachCell((cell, colNumber) => {
      cell.font = {
        name: bengaliFont,
        bold: true,
        size: 11
      };
      cell.border = {
        top: { style: 'thin' },
        left: { style: 'thin' },
        bottom: { style: 'thin' },
        right: { style: 'thin' }
      };
      cell.fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: colNumber <= 3 ? 'FFF1F8E9' : 'FFFFEBEE' }
      };
      cell.alignment = { 
        horizontal: 'center',
        vertical: 'middle',
        wrapText: true
      };
    });
    
    // =========== DATA ROWS ===========
    const maxRows = Math.max(incomeItems.length, expenseItems.length);
    
    for (let i = 0; i < maxRows; i++) {
      const incomeItem = incomeItems[i];
      const expenseItem = expenseItems[i];
      
      const row = worksheet.addRow([
        incomeItem ? `${incomeItem.no}.` : '',
        incomeItem ? incomeItem.description : '',
        incomeItem ? incomeItem.amount : '',
        expenseItem ? `${expenseItem.no}.` : '',
        expenseItem ? expenseItem.description : '',
        expenseItem ? expenseItem.amount : ''
      ]);
      
      row.height = 20;
      row.eachCell((cell, colNumber) => {
        // Set Bengali font for description cells
        if (colNumber === 2 || colNumber === 5) {
          cell.font = { name: bengaliFont, size: 11 };
        } else {
          cell.font = { size: 11 };
        }
        
        cell.border = {
          left: { style: 'thin' },
          right: { style: 'thin' },
          bottom: { style: 'thin' }
        };
        
        // Color coding like website
        if (colNumber <= 3) {
          cell.fill = {
            type: 'pattern',
            pattern: 'solid',
            fgColor: { argb: 'FFF9FBE7' } // Light green background
          };
          if (colNumber === 3 && incomeItem) {
            cell.numFmt = '#,##0;[Red]-#,##0';
            cell.font = { 
              color: { argb: 'FF4CAF50' }, 
              bold: true 
            };
            cell.alignment = { horizontal: 'right' };
          }
        } else {
          cell.fill = {
            type: 'pattern',
            pattern: 'solid',
            fgColor: { argb: 'FFFFEBEE' } // Light red background
          };
          if (colNumber === 6 && expenseItem) {
            cell.numFmt = '#,##0;[Red]-#,##0';
            cell.font = { 
              color: { argb: 'FFF44336' }, 
              bold: true 
            };
            cell.alignment = { horizontal: 'right' };
          }
        }
        
        // Center align serial numbers
        if (colNumber === 1 || colNumber === 4) {
          cell.alignment = { horizontal: 'center' };
        }
      });
    }
    
    // =========== TOTALS SECTION ===========
    // Add separator line
    const separatorRow = worksheet.addRow(Array(6).fill(''));
    separatorRow.height = 2;
    separatorRow.eachCell((cell) => {
      cell.fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'FF1A237E' }
      };
      cell.border = {
        top: { style: 'thin' },
        bottom: { style: 'thin' }
      };
    });
    
    // Totals row
    const totalsRow = worksheet.addRow([
      'মোট আয়:', '', totalIncome, // Bengali for "Total Income"
      'মোট ব্যয়:', '', totalExpense // Bengali for "Total Expense"
    ]);
    
    totalsRow.height = 25;
    totalsRow.eachCell((cell, colNumber) => {
      if (colNumber === 1 || colNumber === 2 || colNumber === 4 || colNumber === 5) {
        cell.font = {
          name: bengaliFont,
          bold: true,
          size: 12
        };
      } else {
        cell.font = { bold: true, size: 12 };
      }
      
      cell.border = {
        top: { style: 'thin' },
        left: { style: 'thin' },
        bottom: { style: 'thin' },
        right: { style: 'thin' }
      };
      
      if (colNumber <= 3) {
        cell.fill = {
          type: 'pattern',
          pattern: 'solid',
          fgColor: { argb: 'FFE8F5E9' } // Green background
        };
        if (colNumber === 3) {
          cell.numFmt = '#,##0;[Red]-#,##0';
          cell.font = { 
            color: { argb: 'FF4CAF50' }, 
            bold: true,
            size: 12
          };
          cell.alignment = { horizontal: 'right' };
        }
      } else {
        cell.fill = {
          type: 'pattern',
          pattern: 'solid',
          fgColor: { argb: 'FFFFEBEE' } // Red background
        };
        if (colNumber === 6) {
          cell.numFmt = '#,##0;[Red]-#,##0';
          cell.font = { 
            color: { argb: 'FFF44336' }, 
            bold: true,
            size: 12
          };
          cell.alignment = { horizontal: 'right' };
        }
      }
    });
    
    // =========== NET BALANCE SECTION ===========
    const netBalanceRowNumber = totalsRow.number + 2;
    worksheet.mergeCells(`A${netBalanceRowNumber}:F${netBalanceRowNumber}`);
    
// In the Excel generation code, update the net balance section:
const netBalanceCell = worksheet.getCell(`A${netBalanceRowNumber}`);
netBalanceCell.value = `মাসিক নিট পরিবর্তন: ৳${netChange.toLocaleString()}\n` +
                      `মাস শেষ উদ্বৃত্ত: ৳${closingBalance.toLocaleString()}\n` +
                      `(আগের মাসের উদ্বৃত্ত: ৳${openingBalance.toLocaleString()} + মাসিক আয়: ৳${totalIncome.toLocaleString()} - মাসিক ব্যয়: ৳${totalExpense.toLocaleString()} = ৳${closingBalance.toLocaleString()})`;
    netBalanceCell.font = {
      name: bengaliFont,
      bold: true,
      size: 14,
      color: { argb: netBalance >= 0 ? 'FF4CAF50' : 'FFF44336' }
    };
    netBalanceCell.fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FFE3F2FD' } // Blue background like website
    };
    netBalanceCell.alignment = { 
      horizontal: 'center',
      vertical: 'middle'
    };
    netBalanceCell.border = {
      top: { style: 'medium' },
      left: { style: 'medium' },
      bottom: { style: 'medium' },
      right: { style: 'medium' }
    };
    
    // =========== FOOTER SECTION ===========
    const footerRowNumber = netBalanceRowNumber + 2;
    worksheet.mergeCells(`A${footerRowNumber}:F${footerRowNumber}`);
    
    const footerCell = worksheet.getCell(`A${footerRowNumber}`);
    footerCell.value = `বিবরণী সময়কাল: ${months[selectedMonth]} মাসের ১ তারিখ থেকে ${months[selectedMonth]} মাসের ৩১ তারিখ ${selectedMonthYear}`;
    footerCell.font = {
      name: bengaliFont,
      italic: true,
      size: 10,
      color: { argb: 'FF666666' }
    };
    footerCell.alignment = { horizontal: 'center' };
    
    // Add generation date
    const dateRowNumber = footerRowNumber + 1;
    worksheet.mergeCells(`A${dateRowNumber}:F${dateRowNumber}`);
    
    const dateCell = worksheet.getCell(`A${dateRowNumber}`);
    dateCell.value = `প্রস্তুতকৃত তারিখ: ${new Date().toLocaleDateString('bn-BD')}`;
    dateCell.font = {
      name: bengaliFont,
      size: 10,
      color: { argb: 'FF666666' }
    };
    dateCell.alignment = { horizontal: 'center' };
    
    // =========== FORMAT COLUMNS ===========
    // Set column widths
    worksheet.columns = [
      { width: 10 },  // A: ক্রমিক নং (Serial No.)
      { width: 35 },  // B: বিবরণ (Description)
      { width: 18 },  // C: টাকার পরিমাণ (Amount)
      { width: 10 },  // D: ক্রমিক নং (Serial No.)
      { width: 35 },  // E: বিবরণ (Description)
      { width: 18 }   // F: টাকার পরিমাণ (Amount)
    ];
    
    // Format amount columns as currency
    worksheet.getColumn(3).numFmt = '#,##0;[Red]-#,##0';
    worksheet.getColumn(6).numFmt = '#,##0;[Red]-#,##0';
    
    // =========== GENERATE FILE ===========
    const buffer = await workbook.xlsx.writeBuffer();
    
    // Create and download file
    const blob = new Blob([buffer], { 
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' 
    });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `মাসিক_আয়_ব্যয়_বিবরণী_${months[selectedMonth]}_${selectedMonthYear}.xlsx`);
    document.body.appendChild(link);
    link.click();
    link.remove();
    
    // Clean up
    window.URL.revokeObjectURL(url);
    
    setSnackbar({ 
      open: true, 
      message: `মাসিক বিবরণী এক্সেল ফাইল ডাউনলোড সম্পন্ন হয়েছে`, 
      severity: 'success' 
    });
    
  } catch (error) {
    console.error('Excel export error:', error);
    
    if (error.message.includes('exceljs')) {
      // Fallback to CSV with Bengali
      await generateBengaliCSV();
    } else {
      setSnackbar({ 
        open: true, 
        message: `ফাইল ডাউনলোড ব্যর্থ: ${error.message}`, 
        severity: 'error' 
      });
    }
  } finally {
    setIsDownloadingExcel(false);
  }
};

// Fallback CSV generator with Bengali text
const generateBengaliCSV = async () => {
  try {
    let csv = 'শাহ ফরিদ রিয়েল এস্টেট কোঃ\n';
    csv += 'অম্বিকা রোড ঝিলটুলি, ফরিদপুর সদর।\n';
    csv += `মাসিক আয়-ব্যয় বিবরণী - ${months[selectedMonth]} ${selectedMonthYear}\n\n`;
    
    // Table headers
    csv += 'আয় পক্ষ,,,ব্যয় পক্ষ,,\n';
    csv += 'ক্রমিক নং,বিবরণ,টাকার পরিমাণ (৳),ক্রমিক নং,বিবরণ,টাকার পরিমাণ (৳)\n';
    csv += '----------------------------------,,,----------------------------------\n';
    
    // Data rows
    const maxRows = Math.max(incomeItems.length, expenseItems.length);
    for (let i = 0; i < maxRows; i++) {
      const incomeItem = incomeItems[i];
      const expenseItem = expenseItems[i];
      
      csv += `${incomeItem ? incomeItem.no + '.' : ''},"${incomeItem ? incomeItem.description : ''}",${incomeItem ? incomeItem.amount : ''},`;
      csv += `${expenseItem ? expenseItem.no + '.' : ''},"${expenseItem ? expenseItem.description : ''}",${expenseItem ? expenseItem.amount : ''}\n`;
    }
    
    // Totals
    csv += '==================================,,,==================================\n';
    csv += `মোট আয়:,${totalIncome},মোট ব্যয়:,${totalExpense}\n`;
    csv += '==================================,,,==================================\n\n';
    csv += `মোট ব্যালেন্স: ${totalIncome} - ${totalExpense} = ${netBalance} টাকা\n\n`;
    csv += `বিবরণী সময়কাল: ${months[selectedMonth]} মাসের ১ তারিখ থেকে ${months[selectedMonth]} মাসের ৩১ তারিখ ${selectedMonthYear}\n`;
    csv += `প্রস্তুতকৃত তারিখ: ${new Date().toLocaleDateString('bn-BD')}\n`;
    
    // Download CSV
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `মাসিক_বিবরণী_${months[selectedMonth]}_${selectedMonthYear}.csv`);
    document.body.appendChild(link);
    link.click();
    link.remove();
    
    setSnackbar({ 
      open: true, 
      message: 'মাসিক বিবরণী CSV ফাইল ডাউনলোড সম্পন্ন হয়েছে', 
      severity: 'info' 
    });
    
  } catch (csvError) {
    console.error('CSV generation failed:', csvError);
    setSnackbar({ 
      open: true, 
      message: 'ফাইল ডাউনলোড ব্যর্থ হয়েছে', 
      severity: 'error' 
    });
  }
};

// CSV fallback function
const generateCSVFallback = () => {
  try {
    let csvContent = "No.,Monthly Income,BDT,No.,Monthly Expense,BDT\n";
    
    // Add data rows
    const maxRows = Math.max(incomeItems.length, expenseItems.length);
    for (let i = 0; i < maxRows; i++) {
      const incomeItem = incomeItems[i];
      const expenseItem = expenseItems[i];
      
      const row = [
        incomeItem ? incomeItem.no : '',
        incomeItem ? `"${incomeItem.description}"` : '',
        incomeItem ? incomeItem.amount : '',
        expenseItem ? expenseItem.no : '',
        expenseItem ? `"${expenseItem.description}"` : '',
        expenseItem ? expenseItem.amount : ''
      ].join(',');
      
      csvContent += row + '\n';
    }
    
    // Add totals
    csvContent += `,TOTAL INCOME:,${totalIncome},,TOTAL EXPENSE:,${totalExpense}\n`;
    csvContent += `,,,,"NET BALANCE:",${netBalance}\n`;
    csvContent += `,,,,"Formula:","=${totalIncome} - ${totalExpense} = ${netBalance} BDT"\n`;
    
    // Create and download CSV
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `monthly-summary-${months[selectedMonth]}-${selectedMonthYear}.csv`);
    document.body.appendChild(link);
    link.click();
    link.remove();
    
    setSnackbar({ 
      open: true, 
      message: 'Monthly summary exported as CSV (Excel export not available)', 
      severity: 'info' 
    });
    
  } catch (csvError) {
    console.error('CSV generation failed:', csvError);
    setSnackbar({ 
      open: true, 
      message: 'Export failed. Please try again or contact support.', 
      severity: 'error' 
    });
  }
};

  // Now render the component
  return (
    <Box>
      {/* Month Selector with Download Button */}
      <Card sx={{ mb: 3, borderRadius: 2, boxShadow: 2 }}>
        <CardContent>
          <Box display="flex" alignItems="center" justifyContent="space-between">
            <Box display="flex" alignItems="center" gap={2}>
              <CalendarMonth color="primary" />
              <Typography variant="h6">
                Monthly Summary - {months[selectedMonth]} {selectedMonthYear}
              </Typography>
            </Box>
            <Box display="flex" alignItems="center" gap={2}>
              <FormControl size="small" sx={{ minWidth: 150 }}>
                <InputLabel>Month</InputLabel>
                <Select
                  value={selectedMonth}
                  label="Month"
                  onChange={(e) => handleMonthChange(e.target.value)}
                >
                  {months.map((month, index) => (
                    <MenuItem key={month} value={index}>{month}</MenuItem>
                  ))}
                </Select>
              </FormControl>
              <FormControl size="small" sx={{ minWidth: 120 }}>
                <InputLabel>Year</InputLabel>
                <Select
                  value={selectedMonthYear}
                  label="Year"
                  onChange={(e) => handleYearChange(e.target.value)}
                >
                  {[2022, 2023, 2024, 2025, 2026].map((year) => (
                    <MenuItem key={year} value={year}>{year}</MenuItem>
                  ))}
                </Select>
              </FormControl>
              <Button
                startIcon={<Refresh />}
                onClick={handleRefreshMonthlySummary}
                variant="outlined"
              >
                Refresh
              </Button>
              <Button
                variant="contained"
                color="success"
                startIcon={isDownloadingExcel ? <CircularProgress size={20} /> : <GridOn />}
                onClick={handleDownloadMonthlyExcel}
                disabled={isDownloadingExcel || !monthlySummary}
              >
                {isDownloadingExcel ? 'Exporting...' : 'Export Excel'}
              </Button>
            </Box>
          </Box>
        </CardContent>
      </Card>

      {isLoading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 200 }}>
          <CircularProgress />
          <Typography sx={{ ml: 2 }}>Loading monthly summary...</Typography>
        </Box>
      ) : monthlySummary ? (
        <Grid container spacing={3}>
          {/* NEW FORMAT TABLE */}
          <Grid item xs={12}>
            <Paper sx={{ borderRadius: 2, overflow: 'hidden', boxShadow: 3 }}>
              <Box sx={{ 
                p: 2, 
                bgcolor: '#1a237e', 
                color: 'white',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center'
              }}>
                <Typography variant="h6">
                  Financial Statement - {months[selectedMonth]} {selectedMonthYear}
                </Typography>
                <Chip 
                  label={`Net: ৳${netBalance.toLocaleString()}`}
                  color={netBalance >= 0 ? 'success' : 'error'}
                  sx={{ color: 'white', fontWeight: 'bold' }}
                />
              </Box>
              
              <Box sx={{ overflowX: 'auto' }}>
                <TableContainer>
                  <Table sx={{ minWidth: 800 }}>
                    <TableHead>
                      <TableRow sx={{ bgcolor: '#f5f5f5' }}>
                        <TableCell align="center" colSpan={3} sx={{ 
                          bgcolor: '#e8f5e9', 
                          borderRight: '2px solid #ddd',
                          fontWeight: 'bold',
                          fontSize: '1.1rem'
                        }}>
                          <Box display="flex" alignItems="center" justifyContent="center">
                            <TrendingUp sx={{ mr: 1, color: '#4caf50' }} />
                            MONTHLY INCOME
                          </Box>
                        </TableCell>
                        <TableCell align="center" colSpan={3} sx={{ 
                          bgcolor: '#ffebee',
                          fontWeight: 'bold',
                          fontSize: '1.1rem'
                        }}>
                          <Box display="flex" alignItems="center" justifyContent="center">
                            <TrendingDown sx={{ mr: 1, color: '#f44336' }} />
                            MONTHLY EXPENSE
                          </Box>
                        </TableCell>
                      </TableRow>
                      <TableRow sx={{ bgcolor: '#fafafa' }}>
                        {/* Income Headers */}
                        <TableCell sx={{ fontWeight: 'bold', width: '10%', bgcolor: '#f1f8e9' }}>No.</TableCell>
                        <TableCell sx={{ fontWeight: 'bold', width: '35%', bgcolor: '#f1f8e9' }}>Description</TableCell>
                        <TableCell sx={{ fontWeight: 'bold', width: '15%', bgcolor: '#f1f8e9', borderRight: '2px solid #ddd' }}>Amount (BDT)</TableCell>
                        
                        {/* Expense Headers */}
                        <TableCell sx={{ fontWeight: 'bold', width: '10%', bgcolor: '#ffebee' }}>No.</TableCell>
                        <TableCell sx={{ fontWeight: 'bold', width: '35%', bgcolor: '#ffebee' }}>Description</TableCell>
                        <TableCell sx={{ fontWeight: 'bold', width: '15%', bgcolor: '#ffebee' }}>Amount (BDT)</TableCell>
                      </TableRow>
                    </TableHead>
                    
                    <TableBody>
                      {/* Table Rows */}
                      {Array.from({ length: maxRows }).map((_, index) => (
                        <TableRow key={index} sx={{ 
                          '&:hover': { bgcolor: '#fafafa' },
                          borderBottom: index === maxRows - 1 ? '2px solid #1a237e' : '1px solid #e0e0e0'
                        }}>
                          {/* Income Column */}
                          <TableCell sx={{ 
                            bgcolor: index < incomeItems.length ? '#f9fbe7' : '#ffffff',
                            borderRight: '2px solid #ddd'
                          }}>
                            {index < incomeItems.length ? (
                              <Typography>{incomeItems[index].no}.</Typography>
                            ) : null}
                          </TableCell>
                          <TableCell sx={{ bgcolor: index < incomeItems.length ? '#f9fbe7' : '#ffffff', borderRight: '2px solid #ddd' }}>
                            {index < incomeItems.length ? incomeItems[index].description : null}
                          </TableCell>
                          <TableCell sx={{ 
                            bgcolor: index < incomeItems.length ? '#f9fbe7' : '#ffffff',
                            borderRight: '2px solid #ddd'
                          }}>
                            {index < incomeItems.length ? (
                              <Typography fontWeight="bold" color="success.main">
                                ৳{incomeItems[index].amount.toLocaleString()}
                              </Typography>
                            ) : null}
                          </TableCell>
                          
                          {/* Expense Column */}
                          <TableCell sx={{ bgcolor: index < expenseItems.length ? '#ffebee' : '#ffffff' }}>
                            {index < expenseItems.length ? (
                              <Typography>{expenseItems[index].no}.</Typography>
                            ) : null}
                          </TableCell>
                          <TableCell sx={{ bgcolor: index < expenseItems.length ? '#ffebee' : '#ffffff' }}>
                            {index < expenseItems.length ? expenseItems[index].description : null}
                          </TableCell>
                          <TableCell sx={{ bgcolor: index < expenseItems.length ? '#ffebee' : '#ffffff' }}>
                            {index < expenseItems.length ? (
                              <Typography fontWeight="bold" color="error.main">
                                ৳{expenseItems[index].amount.toLocaleString()}
                              </Typography>
                            ) : null}
                          </TableCell>
                        </TableRow>
                      ))}
                      
                      {/* Total Row */}
                      <TableRow sx={{ bgcolor: '#f0f0f0' }}>
                        <TableCell colSpan={2} sx={{ 
                          fontWeight: 'bold', 
                          fontSize: '1.1rem',
                          bgcolor: '#e8f5e9',
                          borderRight: '2px solid #ddd'
                        }}>
                          <Box display="flex" alignItems="center">
                            <TrendingUp sx={{ mr: 1, color: '#4caf50' }} />
                            TOTAL INCOME:
                          </Box>
                        </TableCell>
                        <TableCell sx={{ 
                          fontWeight: 'bold', 
                          fontSize: '1.2rem',
                          bgcolor: '#e8f5e9',
                          borderRight: '2px solid #ddd'
                        }}>
                          <Typography color="success.main" fontWeight="bold">
                            ৳{totalIncome.toLocaleString()}
                          </Typography>
                        </TableCell>
                        
                        <TableCell colSpan={2} sx={{ 
                          fontWeight: 'bold', 
                          fontSize: '1.1rem',
                          bgcolor: '#ffebee'
                        }}>
                          <Box display="flex" alignItems="center">
                            <TrendingDown sx={{ mr: 1, color: '#f44336' }} />
                            TOTAL EXPENSE:
                          </Box>
                        </TableCell>
                        <TableCell sx={{ 
                          fontWeight: 'bold', 
                          fontSize: '1.2rem',
                          bgcolor: '#ffebee'
                        }}>
                          <Typography color="error.main" fontWeight="bold">
                            ৳{totalExpense.toLocaleString()}
                          </Typography>
                        </TableCell>
                      </TableRow>
                      
                      {/* Net Balance Row */}
                      <TableRow sx={{ bgcolor: '#e3f2fd' }}>
                        <TableCell colSpan={6} sx={{ 
                          p: 3, 
                          textAlign: 'center',
                          fontWeight: 'bold',
                          fontSize: '1.3rem'
                        }}>
                          <Box display="flex" alignItems="center" justifyContent="center">
                            <AccountBalanceWallet sx={{ mr: 2, fontSize: '2rem', color: '#2196f3' }} />
                            <Typography variant="h5" component="span">
                              TOTAL BALANCE: 
                              <Typography 
                                component="span" 
                                variant="h4" 
                                sx={{ 
                                  ml: 2, 
                                  color: netBalance >= 0 ? 'success.main' : 'error.main',
                                  fontWeight: 'bold'
                                }}
                              >
                                ৳{totalIncome.toLocaleString()} - ৳{totalExpense.toLocaleString()} = ৳{netBalance.toLocaleString()} BDT
                              </Typography>
                            </Typography>
                          </Box>
                        </TableCell>
                      </TableRow>
                    </TableBody>
                  </Table>
                </TableContainer>
              </Box>
              
              <Box sx={{ 
                p: 2, 
                bgcolor: '#f5f5f5', 
                borderTop: '1px solid #ddd',
                textAlign: 'center'
              }}>
                <Typography variant="body2" color="textSecondary">
                  Statement Period: 1st {months[selectedMonth]} to 31st {months[selectedMonth]} {selectedMonthYear}
                </Typography>
              </Box>
            </Paper>
          </Grid>

          {/* Category Breakdown */}
          <Grid item xs={12} md={6}>
            <Card sx={{ borderRadius: 2, height: '100%' }}>
              <CardContent>
                <Box display="flex" alignItems="center" mb={2}>
                  <Box sx={{ bgcolor: '#4caf50', p: 1, borderRadius: '50%', mr: 2 }}>
                    <TrendingUp sx={{ color: 'white' }} />
                  </Box>
                  <Typography variant="h6" color="success.main">
                    Income Breakdown
                  </Typography>
                </Box>
                <Divider sx={{ mb: 2 }} />
                {incomeItems.length === 0 ? (
                  <Box sx={{ py: 4, textAlign: 'center' }}>
                    <Typography color="textSecondary">
                      No income recorded for this month
                    </Typography>
                  </Box>
                ) : (
                  incomeItems.map((item, index) => (
                    <Box key={index} sx={{ mb: 2 }}>
                      <Box display="flex" justifyContent="space-between" alignItems="center">
                        <Box display="flex" alignItems="center">
                          <Box sx={{ width: 8, height: 8, bgcolor: '#4caf50', borderRadius: '50%', mr: 1.5 }} />
                          <Typography>{item.description}</Typography>
                        </Box>
                        <Typography fontWeight="bold" color="success.main" sx={{ fontSize: '1.1rem' }}>
                          ৳{item.amount.toLocaleString()}
                        </Typography>
                      </Box>
                      <LinearProgress 
                        variant="determinate" 
                        value={Math.min(100, (item.amount / (totalIncome || 1)) * 100)} 
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
                    Expense Breakdown
                  </Typography>
                </Box>
                <Divider sx={{ mb: 2 }} />
                {expenseItems.length === 0 ? (
                  <Box sx={{ py: 4, textAlign: 'center' }}>
                    <Typography color="textSecondary">
                      No expenses recorded for this month
                    </Typography>
                  </Box>
                ) : (
                  expenseItems.map((item, index) => (
                    <Box key={index} sx={{ mb: 2 }}>
                      <Box display="flex" justifyContent="space-between" alignItems="center">
                        <Box display="flex" alignItems="center">
                          <Box sx={{ width: 8, height: 8, bgcolor: '#f44336', borderRadius: '50%', mr: 1.5 }} />
                          <Typography>{item.description}</Typography>
                        </Box>
                        <Typography fontWeight="bold" color="error.main" sx={{ fontSize: '1.1rem' }}>
                          ৳{item.amount.toLocaleString()}
                        </Typography>
                      </Box>
                      <LinearProgress 
                        variant="determinate" 
                        value={Math.min(100, (item.amount / (totalExpense || 1)) * 100)} 
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
      ) : (
        <Paper sx={{ p: 6, textAlign: 'center', borderRadius: 2 }}>
          <Typography variant="h6" gutterBottom color="textSecondary">
            No monthly data available for {months[selectedMonth]} {selectedMonthYear}
          </Typography>
          <Typography variant="body2" sx={{ mb: 3 }}>
            Start recording transactions to see the monthly summary
          </Typography>
          <Button
            variant="contained"
            color="primary"
            startIcon={<Add />}
            onClick={() => handleOpenTransactionDialog('income')}
          >
            Add Your First Transaction
          </Button>
        </Paper>
      )}
    </Box>
  );
};

  return (
    <Layout>
      <LocalizationProvider dateAdapter={AdapterDateFns}>
        <Box sx={{ bgcolor: 'background.default', minHeight: '100vh' }}>
          {/* Header */}
          <Paper elevation={3} sx={{ mb: 3, p: 3, borderRadius: 2, bgcolor: '#1a237e', color: 'white' }}>
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
          {/* Quick Stats - FIXED CALCULATION */}
          <Grid container spacing={3} mb={4}>
            <Grid item xs={12} sm={6} md={3}>
              <Card sx={{ borderRadius: 2, boxShadow: 3, borderLeft: '4px solid #4caf50' }}>
                <CardContent>
                  <Box display="flex" alignItems="center" mb={2}>
                    <TrendingUp color="success" sx={{ mr: 2 }} />
                    <Typography variant="h6">Today's Income</Typography>
                  </Box>
                  <Typography variant="h4" color="success.main" fontWeight="bold">
                    ৳{todayIncome.toLocaleString('en-US', { 
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2 
                    })}
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
                    ৳{todayExpense.toLocaleString('en-US', { 
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2 
                    })}
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
                    ৳{(validatedCashInHand.toLocaleString('en-US')*1000000).toFixed(2)}

                    {
                      console.log("COMING FROM DT: " + validatedCashInHand)
                    }
                  </Typography>
                  <Typography variant="caption" color="textSecondary" sx={{ mt: 1, display: 'block' }}>
                    End of day balance
                  </Typography>
                  {/* DEBUG: Show calculation */}
                  <Typography variant="caption" sx={{ display: 'block', fontStyle: 'italic', color: '#666' }}>
                    Calculation: {autoOpeningBalance.toFixed(2)} + {todayIncome.toFixed(2)} - {todayExpense.toFixed(2)}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            
            {/* AUTO OPENING BALANCE CARD */}
            <Grid item xs={12} sm={6} md={3}>
              <Card sx={{ borderRadius: 2, boxShadow: 3, borderLeft: '4px solid #9c27b0' }}>
                <CardContent>
                  <Box display="flex" alignItems="center" mb={2}>
                    <History color="secondary" sx={{ mr: 2 }} />
                    <Typography variant="h6">Auto Opening Balance</Typography>
                  </Box>
                  <Typography variant="h4" color="secondary.main" fontWeight="bold">
                    ৳{autoOpeningBalance.toLocaleString('en-US', { 
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2 
                    })}
                  </Typography>
                  <Typography variant="caption" color="textSecondary" sx={{ mt: 1, display: 'block' }}>
                    From yesterday: ৳{yesterdayBalance.toLocaleString('en-US', { 
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2 
                    })}
                  </Typography>
                  <Typography variant="caption" sx={{ display: 'block', fontStyle: 'italic' }}>
                    (Automatically carried forward)
                  </Typography>
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

          {/* Tabs Section */}
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

          {/* Tab 3: Monthly Summary */}
          {activeTab === 2 && <MonthlySummaryTab />}

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

          {/* Opening Balance Dialog
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
          </Dialog> */}

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