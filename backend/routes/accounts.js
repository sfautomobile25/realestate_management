const express = require('express');
const { Account, CashBalance } = require('../models');
const { Op } = require('sequelize');
const router = express.Router();
const sequelize = require('../config/database');
const { generateTransactionPDF, generateYearlyPDF  } = require('../utils/pdfGenerator');
const { generateYearlyExcel } = require('../utils/excelGenerator');

// Helper function to generate voucher number
const generateVoucherNumber = (type) => {
  const prefix = type === 'credit' ? 'CV' : type === 'debit' ? 'DV' : 'JV';
  const date = new Date();
  const year = date.getFullYear().toString().slice(-2);
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  const day = date.getDate().toString().padStart(2, '0');
  const random = Math.floor(1000 + Math.random() * 9000);
  return `${prefix}${year}${month}${day}${random}`;
};

// Helper function to convert number to Bangla words - FIXED
const numberToBanglaWords = (num) => {
  if (!num || isNaN(num)) return 'শূন্য টাকা';
  
  const n = parseFloat(num);
  const units = ['', 'এক', 'দুই', 'তিন', 'চার', 'পাঁচ', 'ছয়', 'সাত', 'আট', 'নয়'];
  const teens = ['দশ', 'এগারো', 'বারো', 'তেরো', 'চৌদ্দ', 'পনেরো', 'ষোল', 'সতেরো', 'আঠারো', 'উনিশ'];
  const tens = ['', 'দশ', 'বিশ', 'ত্রিশ', 'চল্লিশ', 'পঞ্চাশ', 'ষাট', 'সত্তর', 'আশি', 'নব্বই'];
  const hundreds = ['', 'একশ', 'দুইশ', 'তিনশ', 'চারশ', 'পাঁচশ', 'ছয়শ', 'সাতশ', 'আটশ', 'নয়শ'];
  
  let words = '';
  let amount = Math.floor(n);
  
  // Handle crore
  if (amount >= 10000000) {
    words += units[Math.floor(amount / 10000000)] + ' কোটি ';
    amount %= 10000000;
  }
  
  // Handle lakh
  if (amount >= 100000) {
    words += units[Math.floor(amount / 100000)] + ' লক্ষ ';
    amount %= 100000;
  }
  
  // Handle thousand
  if (amount >= 1000) {
    words += units[Math.floor(amount / 1000)] + ' হাজার ';
    amount %= 1000;
  }
  
  // Handle hundred
  if (amount >= 100) {
    words += hundreds[Math.floor(amount / 100)] + ' ';
    amount %= 100;
  }
  
  // Handle tens and units
  if (amount >= 20) {
    words += tens[Math.floor(amount / 10)] + ' ';
    amount %= 10;
  } else if (amount >= 10) {
    words += teens[amount - 10] + ' ';
    amount = 0;
  }
  
  // Handle units
  if (amount > 0) {
    words += units[amount] + ' ';
  }
  
  // Add টাকা
  if (words.trim() === '') {
    words = 'শূন্য';
  }
  words = words.trim() + ' টাকা';
  
  // Handle paisa
  const paisa = Math.round((n - Math.floor(n)) * 100);
  if (paisa > 0) {
    words += ' ' + paisa + ' পয়সা';
  }
  
  return words;
};

// Set opening balance - CAN ONLY INCREASE
router.post('/opening-balance', async (req, res) => {
  try {
    const { date, amount } = req.body;
    
    if (!date || !amount) {
      return res.status(400).json({ message: 'Date and amount are required' });
    }
    
    const targetDate = new Date(date).toISOString().split('T')[0];
    const amountNum = parseFloat(amount);
    
    if (amountNum < 0) {
      return res.status(400).json({ message: 'Opening balance cannot be negative' });
    }
    
    // Get existing balance for this date
    let cashBalance = await CashBalance.findOne({
      where: { date: targetDate }
    });
    
    if (!cashBalance) {
      // Get previous day's closing balance
      const previousBalance = await CashBalance.findOne({
        where: {
          date: {
            [Op.lt]: targetDate
          }
        },
        order: [['date', 'DESC']]
      });
      
      // Opening balance can't be less than previous closing balance
      const previousClosing = previousBalance ? previousBalance.closing_balance : 0;
      if (amountNum < previousClosing) {
        return res.status(400).json({ 
          message: `Opening balance (${amountNum}) cannot be less than previous closing balance (${previousClosing})`
        });
      }
      
      cashBalance = await CashBalance.create({
        date: targetDate,
        opening_balance: amountNum,
        cash_in: 0,
        cash_out: 0,
        closing_balance: amountNum, // Start with opening balance
        bank_balance: 0,
        mobile_banking_balance: 0
      });
    } else {
      // Check if new amount is greater than current opening balance
      if (amountNum < cashBalance.opening_balance) {
        return res.status(400).json({ 
          message: 'Opening balance can only be increased, not decreased'
        });
      }
      
      // Update opening balance and adjust closing balance
      const difference = amountNum - cashBalance.opening_balance;
      cashBalance.opening_balance = amountNum;
      cashBalance.closing_balance += difference; // Increase closing balance by the difference
      
      await cashBalance.save();
    }
    
    res.json(cashBalance);
  } catch (error) {
    console.error('Error setting opening balance:', error);
    res.status(500).json({ message: error.message });
  }
});

// Get daily balance summary - FIXED CALCULATION
router.get('/balance', async (req, res) => {
  try {
    const { date } = req.query;
    const targetDate = date || new Date().toISOString().split('T')[0];
    
    // Get today's date range
    const todayStart = new Date(targetDate);
    todayStart.setHours(0, 0, 0, 0);
    const todayEnd = new Date(targetDate);
    todayEnd.setHours(23, 59, 59, 999);
    
    // Get cash balance record
    let cashBalance = await CashBalance.findOne({
      where: { date: targetDate }
    });
    
    // Get ALL transactions for today
    const todayTransactions = await Account.findAll({
      where: {
        date: {
          [Op.between]: [todayStart, todayEnd]
        }
      },
      order: [['createdAt', 'DESC']]
    });
    
    // Calculate TODAY'S totals (fresh calculation)
    const todayIncome = todayTransactions
      .filter(t => t.type === 'income')
      .reduce((sum, t) => sum + parseFloat(t.amount || 0), 0);
    
    const todayExpense = todayTransactions
      .filter(t => t.type === 'expense')
      .reduce((sum, t) => sum + parseFloat(t.amount || 0), 0);
    
    const cashInHand = todayIncome - todayExpense;
    
    if (!cashBalance) {
      // Get previous day's closing balance for opening
      const previousBalance = await CashBalance.findOne({
        where: {
          date: {
            [Op.lt]: targetDate
          }
        },
        order: [['date', 'DESC']]
      });
      
      const openingBalance = previousBalance ? previousBalance.closing_balance : 0;
      const closingBalance = openingBalance + cashInHand; // Opening + (Income - Expense)
      
      cashBalance = {
        date: targetDate,
        opening_balance: openingBalance,
        cash_in: todayIncome,
        cash_out: todayExpense,
        closing_balance: Math.max(0, closingBalance), // Never negative
        bank_balance: 0,
        mobile_banking_balance: 0
      };
    } else {
      // Update with fresh calculation
      cashBalance.cash_in = todayIncome;
      cashBalance.cash_out = todayExpense;
      cashBalance.closing_balance = Math.max(0, cashBalance.opening_balance + cashInHand);
      await cashBalance.save();
    }
    
    // Calculate category totals
    const incomeCategories = {};
    const expenseCategories = {};
    
    todayTransactions.forEach(transaction => {
      if (transaction.type === 'income') {
        incomeCategories[transaction.category] = 
          (incomeCategories[transaction.category] || 0) + parseFloat(transaction.amount || 0);
      } else if (transaction.type === 'expense') {
        expenseCategories[transaction.category] = 
          (expenseCategories[transaction.category] || 0) + parseFloat(transaction.amount || 0);
      }
    });
    
    res.json({
      balance: cashBalance,
      todayTransactions,
      incomeCategories,
      expenseCategories,
      totalIncome: todayIncome,
      totalExpense: todayExpense,
      cashInHand: cashInHand // Today's income minus today's expense
    });
  } catch (error) {
    console.error('Error fetching balance:', error);
    res.status(500).json({ message: error.message });
  }
});

// Create account transaction - FIXED
router.post('/', async (req, res) => {
  const transaction = await sequelize.transaction();
  
  try {
    const { date, name, description, type, category, amount, payment_method, reference_number, notes } = req.body;
    
    // Validate required fields
    if (!name || !description || !type || !category || !amount) {
      await transaction.rollback();
      return res.status(400).json({ message: 'Missing required fields' });
    }
    
    const amountNum = parseFloat(amount);
    if (amountNum <= 0) {
      await transaction.rollback();
      return res.status(400).json({ message: 'Amount must be greater than 0' });
    }
    
    // Generate voucher details
    const voucherType = type === 'income' ? 'credit' : 'debit';
    const voucherNumber = generateVoucherNumber(voucherType);
    const amountInBangla = numberToBanglaWords(amountNum); // FIXED
    
    // Create account transaction
    const account = await Account.create({
      voucher_number: voucherNumber,
      voucher_type: voucherType,
      date: date || new Date(),
      name,
      description,
      type,
      category,
      amount: amountNum,
      payment_method: payment_method || 'cash',
      reference_number,
      notes,
      amount_in_bangla: amountInBangla
    }, { transaction });
    
    // Update cash balance for the day
    const transactionDate = date ? new Date(date).toISOString().split('T')[0] : new Date().toISOString().split('T')[0];
    
    let cashBalance = await CashBalance.findOne({
      where: { date: transactionDate },
      transaction
    });
    
    if (!cashBalance) {
      // Get previous day's closing balance
      const previousBalance = await CashBalance.findOne({
        where: {
          date: {
            [Op.lt]: transactionDate
          }
        },
        order: [['date', 'DESC']],
        transaction
      });
      
      const openingBalance = previousBalance ? previousBalance.closing_balance : 0;
      
      // Calculate fresh totals for today
      const todayStart = new Date(transactionDate);
      todayStart.setHours(0, 0, 0, 0);
      const todayEnd = new Date(transactionDate);
      todayEnd.setHours(23, 59, 59, 999);
      
      const todayTransactions = await Account.findAll({
        where: {
          date: {
            [Op.between]: [todayStart, todayEnd]
          }
        },
        transaction
      });
      
      let todayIncome = 0;
      let todayExpense = 0;
      
      todayTransactions.forEach(t => {
        if (t.type === 'income') todayIncome += parseFloat(t.amount || 0);
        else if (t.type === 'expense') todayExpense += parseFloat(t.amount || 0);
      });
      
      const cashInHand = todayIncome - todayExpense;
      
      cashBalance = await CashBalance.create({
        date: transactionDate,
        opening_balance: openingBalance,
        cash_in: todayIncome,
        cash_out: todayExpense,
        closing_balance: Math.max(0, openingBalance + cashInHand),
        bank_balance: 0,
        mobile_banking_balance: 0
      }, { transaction });
    } else {
      // Recalculate fresh totals
      const todayStart = new Date(transactionDate);
      todayStart.setHours(0, 0, 0, 0);
      const todayEnd = new Date(transactionDate);
      todayEnd.setHours(23, 59, 59, 999);
      
      const todayTransactions = await Account.findAll({
        where: {
          date: {
            [Op.between]: [todayStart, todayEnd]
          }
        },
        transaction
      });
      
      let todayIncome = 0;
      let todayExpense = 0;
      
      todayTransactions.forEach(t => {
        if (t.type === 'income') todayIncome += parseFloat(t.amount || 0);
        else if (t.type === 'expense') todayExpense += parseFloat(t.amount || 0);
      });
      
      const cashInHand = todayIncome - todayExpense;
      
      cashBalance.cash_in = todayIncome;
      cashBalance.cash_out = todayExpense;
      cashBalance.closing_balance = Math.max(0, cashBalance.opening_balance + cashInHand);
      
      await cashBalance.save({ transaction });
    }
    
    await transaction.commit();
    
    // Get fresh balance
    const freshBalance = await CashBalance.findOne({
      where: { date: transactionDate }
    });
    
    res.status(201).json({
      transaction: account,
      voucher_number: voucherNumber,
      balance: freshBalance
    });
  } catch (error) {
    await transaction.rollback();
    console.error('Error creating transaction:', error);
    res.status(400).json({ message: error.message });
  }
});

// Get voucher receipt
router.get('/voucher/:voucherNumber', async (req, res) => {
  try {
    const transaction = await Account.findOne({
      where: { voucher_number: req.params.voucherNumber }
    });
    
    if (!transaction) {
      return res.status(404).json({ message: 'Voucher not found' });
    }
    
    res.json(transaction);
  } catch (error) {
    console.error('Error fetching voucher:', error);
    res.status(500).json({ message: error.message });
  }
});

// Get monthly summary
router.get('/monthly-summary', async (req, res) => {
  try {
    const { year, month } = req.query;
    const targetYear = parseInt(year) || new Date().getFullYear();
    const targetMonth = parseInt(month) || new Date().getMonth() + 1;
    
    const startDate = new Date(targetYear, targetMonth - 1, 1);
    const endDate = new Date(targetYear, targetMonth, 0);
    
    const transactions = await Account.findAll({
      where: {
        date: {
          [Op.between]: [startDate, endDate]
        }
      },
      order: [['date', 'ASC']]
    });
    
    // Calculate daily balances
    const dailyBalances = {};
    let runningBalance = 0;
    
    for (let d = new Date(startDate); d <= endDate; d.setDate(d.getDate() + 1)) {
      const dateStr = d.toISOString().split('T')[0];
      const dayTransactions = transactions.filter(t => 
        t.date.toISOString().split('T')[0] === dateStr
      );
      
      const dayIncome = dayTransactions
        .filter(t => t.type === 'income')
        .reduce((sum, t) => sum + parseFloat(t.amount || 0), 0);
      
      const dayExpense = dayTransactions
        .filter(t => t.type === 'expense')
        .reduce((sum, t) => sum + parseFloat(t.amount || 0), 0);
      
      const dayCashInHand = dayIncome - dayExpense;
      
      dailyBalances[dateStr] = {
        date: dateStr,
        income: dayIncome,
        expense: dayExpense,
        cashInHand: dayCashInHand
      };
    }
    
    // Calculate category totals
    const incomeByCategory = {};
    const expenseByCategory = {};
    
    transactions.forEach(transaction => {
      if (transaction.type === 'income') {
        incomeByCategory[transaction.category] = 
          (incomeByCategory[transaction.category] || 0) + parseFloat(transaction.amount || 0);
      } else if (transaction.type === 'expense') {
        expenseByCategory[transaction.category] = 
          (expenseByCategory[transaction.category] || 0) + parseFloat(transaction.amount || 0);
      }
    });
    
    const totalIncome = transactions
      .filter(t => t.type === 'income')
      .reduce((sum, t) => sum + parseFloat(t.amount || 0), 0);
    
    const totalExpense = transactions
      .filter(t => t.type === 'expense')
      .reduce((sum, t) => sum + parseFloat(t.amount || 0), 0);
    
    res.json({
      monthlySummary: {
        totalIncome,
        totalExpense,
        netCashInHand: totalIncome - totalExpense
      },
      dailyBalances: Object.values(dailyBalances),
      incomeByCategory,
      expenseByCategory
    });
  } catch (error) {
    console.error('Error fetching monthly summary:', error);
    res.status(500).json({ message: error.message });
  }
});

// Update the download credit route:
router.get('/download/credit', async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    
    const start = startDate ? new Date(startDate) : new Date();
    start.setHours(0, 0, 0, 0);
    
    const end = endDate ? new Date(endDate) : new Date();
    end.setHours(23, 59, 59, 999);
    
    console.log('Downloading Credit PDF:', { start, end });
    
    const transactions = await Account.findAll({
      where: {
        type: 'income',
        date: {
          [Op.between]: [start, end]
        }
      },
      order: [['date', 'ASC'], ['voucher_number', 'ASC']],
      raw: true // Get plain objects for PDF generation
    });
    
    console.log(`Found ${transactions.length} credit transactions`);
    
    // Log first few transactions for debugging
    transactions.slice(0, 3).forEach((t, i) => {
      console.log(`Transaction ${i + 1}:`, {
        voucher: t.voucher_number,
        amount: t.amount,
        date: t.date
      });
    });
    
    const pdfBuffer = await generateTransactionPDF(transactions, 'credit', start, end);
    
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="credit-vouchers-${Date.now()}.pdf"`);
    res.send(pdfBuffer);
  } catch (error) {
    console.error('Error generating Credit PDF:', error);
    res.status(500).json({ 
      message: error.message,
      stack: error.stack 
    });
  }
});

// Update the download debit route similarly:
router.get('/download/debit', async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    
    const start = startDate ? new Date(startDate) : new Date();
    start.setHours(0, 0, 0, 0);
    
    const end = endDate ? new Date(endDate) : new Date();
    end.setHours(23, 59, 59, 999);
    
    const transactions = await Account.findAll({
      where: {
        type: 'expense',
        date: {
          [Op.between]: [start, end]
        }
      },
      order: [['date', 'ASC'], ['voucher_number', 'ASC']],
      raw: true
    });
    
    console.log(`Found ${transactions.length} debit transactions`);
    
    const pdfBuffer = await generateTransactionPDF(transactions, 'debit', start, end);
    
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="debit-vouchers-${Date.now()}.pdf"`);
    res.send(pdfBuffer);
  } catch (error) {
    console.error('Error generating Debit PDF:', error);
    res.status(500).json({ 
      message: error.message,
      stack: error.stack 
    });
  }
});

// Get yearly summary
router.get('/yearly-summary/:year', async (req, res) => {
  try {
    const year = parseInt(req.params.year) || new Date().getFullYear();
    
    const startDate = new Date(year, 0, 1);
    const endDate = new Date(year, 11, 31, 23, 59, 59, 999);
    
    const transactions = await Account.findAll({
      where: {
        date: {
          [Op.between]: [startDate, endDate]
        }
      },
      order: [['date', 'ASC']]
    });
    
    // Monthly breakdown
    const monthlySummary = {};
    for (let month = 0; month < 12; month++) {
      monthlySummary[month] = {
        income: 0,
        expense: 0,
        net: 0
      };
    }
    
    // Category breakdown
    const incomeByCategory = {};
    const expenseByCategory = {};
    
    transactions.forEach(transaction => {
      const month = new Date(transaction.date).getMonth();
      
      if (transaction.type === 'income') {
        monthlySummary[month].income += parseFloat(transaction.amount);
        incomeByCategory[transaction.category] = 
          (incomeByCategory[transaction.category] || 0) + parseFloat(transaction.amount);
      } else {
        monthlySummary[month].expense += parseFloat(transaction.amount);
        expenseByCategory[transaction.category] = 
          (expenseByCategory[transaction.category] || 0) + parseFloat(transaction.amount);
      }
      
      monthlySummary[month].net = monthlySummary[month].income - monthlySummary[month].expense;
    });
    
    // Total yearly
    const yearlyTotal = transactions.reduce((acc, t) => {
      return acc + (t.type === 'income' ? parseFloat(t.amount) : -parseFloat(t.amount));
    }, 0);
    
    res.json({
      year,
      monthlySummary,
      incomeByCategory,
      expenseByCategory,
      totalTransactions: transactions.length,
      totalIncome: transactions.filter(t => t.type === 'income').reduce((sum, t) => sum + parseFloat(t.amount), 0),
      totalExpense: transactions.filter(t => t.type === 'expense').reduce((sum, t) => sum + parseFloat(t.amount), 0),
      yearlyBalance: yearlyTotal
    });
  } catch (error) {
    console.error('Error fetching yearly summary:', error);
    res.status(500).json({ message: error.message });
  }
});

// Download Yearly Report Excel
router.get('/download/yearly/:year/excel', async (req, res) => {
  try {
    const year = parseInt(req.params.year) || new Date().getFullYear();
    
    const startDate = new Date(year, 0, 1);
    const endDate = new Date(year, 11, 31, 23, 59, 59, 999);
    
    // Get ALL transactions for the year
    const transactions = await Account.findAll({
      where: {
        date: {
          [Op.between]: [startDate, endDate]
        }
      },
      order: [['date', 'ASC']]
    });
    
    // Calculate monthly breakdown
    const monthlySummary = {};
    for (let month = 0; month < 12; month++) {
      monthlySummary[month] = {
        income: 0,
        expense: 0,
        net: 0
      };
    }
    
    // Calculate category breakdown
    const incomeByCategory = {};
    const expenseByCategory = {};
    
    transactions.forEach(transaction => {
      const month = new Date(transaction.date).getMonth();
      
      if (transaction.type === 'income') {
        monthlySummary[month].income += parseFloat(transaction.amount);
        incomeByCategory[transaction.category] = 
          (incomeByCategory[transaction.category] || 0) + parseFloat(transaction.amount);
      } else {
        monthlySummary[month].expense += parseFloat(transaction.amount);
        expenseByCategory[transaction.category] = 
          (expenseByCategory[transaction.category] || 0) + parseFloat(transaction.amount);
      }
      
      monthlySummary[month].net = monthlySummary[month].income - monthlySummary[month].expense;
    });
    
    // Prepare yearly summary data
    const yearlySummary = {
      year,
      monthlySummary,
      incomeByCategory,
      expenseByCategory,
      totalTransactions: transactions.length,
      totalIncome: transactions.filter(t => t.type === 'income').reduce((sum, t) => sum + parseFloat(t.amount), 0),
      totalExpense: transactions.filter(t => t.type === 'expense').reduce((sum, t) => sum + parseFloat(t.amount), 0),
      yearlyBalance: transactions.reduce((acc, t) => {
        return acc + (t.type === 'income' ? parseFloat(t.amount) : -parseFloat(t.amount));
      }, 0)
    };
    
    // Generate Excel file WITH TRANSACTION DATA
    const excelBuffer = await generateYearlyExcel(yearlySummary, transactions, year);
    
    // Set response headers
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', `attachment; filename="yearly-report-${year}.xlsx"`);
    
    // Send the Excel file
    res.send(excelBuffer);
    
  } catch (error) {
    console.error('Error generating Excel:', error);
    res.status(500).json({ message: error.message });
  }
});

router.get('/download/yearly/:year/pdf', async (req, res) => {
  try {
    const year = parseInt(req.params.year) || new Date().getFullYear();
    
    const startDate = new Date(year, 0, 1);
    const endDate = new Date(year, 11, 31, 23, 59, 59, 999);
    
    const transactions = await Account.findAll({
      where: {
        date: {
          [Op.between]: [startDate, endDate]
        }
      },
      order: [['date', 'ASC']]
    });
    
    // Monthly breakdown
    const monthlySummary = {};
    for (let month = 0; month < 12; month++) {
      monthlySummary[month] = {
        income: 0,
        expense: 0,
        net: 0
      };
    }
    
    // Category breakdown
    const incomeByCategory = {};
    const expenseByCategory = {};
    
    transactions.forEach(transaction => {
      const month = new Date(transaction.date).getMonth();
      
      if (transaction.type === 'income') {
        monthlySummary[month].income += parseFloat(transaction.amount);
        incomeByCategory[transaction.category] = 
          (incomeByCategory[transaction.category] || 0) + parseFloat(transaction.amount);
      } else {
        monthlySummary[month].expense += parseFloat(transaction.amount);
        expenseByCategory[transaction.category] = 
          (expenseByCategory[transaction.category] || 0) + parseFloat(transaction.amount);
      }
      
      monthlySummary[month].net = monthlySummary[month].income - monthlySummary[month].expense;
    });
    
    // Prepare yearly summary data
    const yearlySummary = {
      year,
      monthlySummary,
      incomeByCategory,
      expenseByCategory,
      totalTransactions: transactions.length,
      totalIncome: transactions.filter(t => t.type === 'income').reduce((sum, t) => sum + parseFloat(t.amount), 0),
      totalExpense: transactions.filter(t => t.type === 'expense').reduce((sum, t) => sum + parseFloat(t.amount), 0),
      yearlyBalance: transactions.reduce((acc, t) => {
        return acc + (t.type === 'income' ? parseFloat(t.amount) : -parseFloat(t.amount));
      }, 0)
    };
    
    // Generate PDF file
    const pdfBuffer = await generateYearlyPDF(yearlySummary, year);
    
    // Set response headers
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="yearly-report-${year}.pdf"`);
    
    // Send the PDF file
    res.send(pdfBuffer);
    
  } catch (error) {
    console.error('Error generating PDF:', error);
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;