const express = require('express');
const { Account, CashBalance } = require('../models');
const { Op } = require('sequelize');
const router = express.Router();
const sequelize = require('../config/database');

// Helper function to generate voucher number
const generateVoucherNumber = (type) => {
  const prefix = type === 'credit' ? 'CV' : type === 'debit' ? 'DV' : 'JV';
  const date = new Date();
  const year = date.getFullYear().toString().slice(-2);
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  const random = Math.floor(1000 + Math.random() * 9000);
  return `${prefix}${year}${month}${random}`;
};
// Helper function to convert number to Bangla words
const numberToBanglaWords = (num) => {
  const units = ['', 'এক', 'দুই', 'তিন', 'চার', 'পাঁচ', 'ছয়', 'সাত', 'আট', 'নয়'];
  const tens = ['', 'দশ', 'বিশ', 'ত্রিশ', 'চল্লিশ', 'পঞ্চাশ', 'ষাট', 'সত্তর', 'আশি', 'নব্বই'];
  const hundreds = ['', 'একশ', 'দুইশ', 'তিনশ', 'চারশ', 'পাঁচশ', 'ছয়শ', 'সাতশ', 'আটশ', 'নয়শ'];
  
  let n = Math.floor(num);
  let words = '';
  
  if (n >= 100) {
    words += hundreds[Math.floor(n / 100)] + ' ';
    n %= 100;
  }
  
  if (n >= 10) {
    words += tens[Math.floor(n / 10)] + ' ';
    n %= 10;
  }
  
  if (n > 0) {
    words += units[n] + ' ';
  }
  
  words += 'টাকা';
  
  // Add paisa if any
  const paisa = Math.round((num - Math.floor(num)) * 100);
  if (paisa > 0) {
    words += ' ' + paisa + ' পয়সা';
  }
  
  return words.trim();
};

// 1. Fix opening balance route - Add this near the top with other routes
router.post('/opening-balance', async (req, res) => {
  try {
    const { date, amount } = req.body;
    
    if (!date || !amount) {
      return res.status(400).json({ message: 'Date and amount are required' });
    }
    
    // Convert date to proper format
    const targetDate = new Date(date).toISOString().split('T')[0];
    
    // Check if opening balance already exists for this date
    const existingBalance = await CashBalance.findOne({
      where: { date: targetDate }
    });
    
    if (existingBalance) {
      // Update existing balance
      existingBalance.opening_balance = parseFloat(amount);
      existingBalance.closing_balance = parseFloat(amount) + existingBalance.cash_in - existingBalance.cash_out;
      await existingBalance.save();
      return res.json(existingBalance);
    }
    
    // Create new balance
    const cashBalance = await CashBalance.create({
      date: targetDate,
      opening_balance: parseFloat(amount),
      cash_in: 0,
      cash_out: 0,
      closing_balance: parseFloat(amount),
      bank_balance: 0,
      mobile_banking_balance: 0
    });
    
    res.status(201).json(cashBalance);
  } catch (error) {
    console.error('Error setting opening balance:', error);
    res.status(500).json({ message: error.message });
  }
});

// GET /balance - Get cash balance (FIXED)
router.get('/balance', async (req, res) => {
  try {
    const { date } = req.query;
    const targetDate = date || new Date().toISOString().split('T')[0];
    
    // Get today's transactions
    const todayStart = new Date(targetDate);
    const todayEnd = new Date(targetDate);
    todayEnd.setHours(23, 59, 59, 999);
    
    const todayTransactions = await Account.findAll({
      where: {
        date: {
          [Op.between]: [todayStart, todayEnd]
        }
      },
      order: [['createdAt', 'DESC']]
    });
    
    // Calculate totals from transactions
    const todayIncome = todayTransactions
      .filter(t => t.type === 'income')
      .reduce((sum, t) => sum + parseFloat(t.amount || 0), 0);
    
    const todayExpense = todayTransactions
      .filter(t => t.type === 'expense')
      .reduce((sum, t) => sum + parseFloat(t.amount || 0), 0);
    
    // Get or create cash balance
    let cashBalance = await CashBalance.findOne({
      where: { date: targetDate }
    });
    
    if (!cashBalance) {
      // Get latest balance for opening balance
      const latestBalance = await CashBalance.findOne({
        order: [['date', 'DESC']]
      });
      
      const openingBalance = latestBalance ? latestBalance.closing_balance : 0;
      
      cashBalance = {
        date: targetDate,
        opening_balance: openingBalance,
        cash_in: todayIncome,
        cash_out: todayExpense,
        closing_balance: openingBalance + todayIncome - todayExpense,
        bank_balance: 0,
        mobile_banking_balance: 0
      };
      
      // Save if needed
      // await CashBalance.create(cashBalance);
    } else {
      // Update with fresh totals
      cashBalance.cash_in = todayIncome;
      cashBalance.cash_out = todayExpense;
      cashBalance.closing_balance = cashBalance.opening_balance + todayIncome - todayExpense;
      
      // Save updates
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
      totalExpense: todayExpense
    });
  } catch (error) {
    console.error('Error fetching balance:', error);
    res.status(500).json({ message: error.message });
  }
});

// 3. Fix transaction creation to properly update cash balance
router.post('/', async (req, res) => {
  const transaction = await sequelize.transaction();
  
  try {
    const { date, name, description, type, category, amount, payment_method, reference_number, notes } = req.body;
    
    // Validate required fields
    if (!name || !description || !type || !category || !amount) {
      await transaction.rollback();
      return res.status(400).json({ message: 'Missing required fields' });
    }
    
    // Generate voucher details
    const voucherType = type === 'income' ? 'credit' : 'debit';
    const voucherNumber = generateVoucherNumber(voucherType);
    const amountInBangla = numberToBanglaWords(parseFloat(amount));
    
    // Create account transaction
    const account = await Account.create({
      voucher_number: voucherNumber,
      voucher_type: voucherType,
      date: date || new Date(),
      name,
      description,
      type,
      category,
      amount: parseFloat(amount),
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
    
  // POST / - Create transaction (FIXED VERSION)
router.post('/', async (req, res) => {
  const transaction = await sequelize.transaction();
  
  try {
    const { date, name, description, type, category, amount, payment_method, reference_number, notes } = req.body;
    
    // Validate required fields
    if (!name || !description || !type || !category || !amount) {
      await transaction.rollback();
      return res.status(400).json({ message: 'Missing required fields' });
    }
    
    // Generate voucher details
    const voucherType = type === 'income' ? 'credit' : 'debit';
    const voucherNumber = generateVoucherNumber(voucherType);
    const amountInBangla = numberToBanglaWords(parseFloat(amount));
    
    // Create account transaction
    const account = await Account.create({
      voucher_number: voucherNumber,
      voucher_type: voucherType,
      date: date || new Date(),
      name,
      description,
      type,
      category,
      amount: parseFloat(amount),
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
    
    // Get all today's transactions including the new one
    const todayStart = new Date(transactionDate);
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
    
    // Calculate totals from all transactions
    const todayIncome = todayTransactions
      .filter(t => t.type === 'income')
      .reduce((sum, t) => sum + parseFloat(t.amount || 0), 0);
    
    const todayExpense = todayTransactions
      .filter(t => t.type === 'expense')
      .reduce((sum, t) => sum + parseFloat(t.amount || 0), 0);
    
    if (!cashBalance) {
      // Get previous day's closing balance for opening balance
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
      
      cashBalance = await CashBalance.create({
        date: transactionDate,
        opening_balance: openingBalance,
        cash_in: todayIncome,
        cash_out: todayExpense,
        closing_balance: openingBalance + todayIncome - todayExpense,
        bank_balance: 0,
        mobile_banking_balance: 0
      }, { transaction });
    } else {
      // Update existing balance with accurate totals
      cashBalance.cash_in = todayIncome;
      cashBalance.cash_out = todayExpense;
      cashBalance.closing_balance = cashBalance.opening_balance + todayIncome - todayExpense;
      
      await cashBalance.save({ transaction });
    }
    
    await transaction.commit();
    
    // Get fresh balance after commit
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
    
    await transaction.commit();
    
    // Get fresh balance after commit
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

// Set opening balance
router.post('/opening-balance', async (req, res) => {
  const transaction = await sequelize.transaction();
  
  try {
    const { date, amount, notes } = req.body;
    
    if (!amount) {
      return res.status(400).json({ message: 'Amount is required' });
    }
    
    const targetDate = date ? new Date(date).toISOString().split('T')[0] : new Date().toISOString().split('T')[0];
    
    // Create opening balance transaction
    const voucherNumber = generateVoucherNumber('credit');
    const amountInWords = numberToBanglaWords(Math.floor(amount));
    
    const openingBalance = await Account.create({
      voucher_number: voucherNumber,
      voucher_type: 'credit',
      date: targetDate,
      name: 'Opening Balance',
      description: 'Opening cash balance',
      type: 'opening_balance',
      category: 'Opening Balance',
      amount: parseFloat(amount),
      amount_in_words: amountInWords,
      payment_method: 'cash',
      notes: notes || 'Initial opening balance',
      accountant_signature: 'Accountant',
      ceo_signature: 'CEO/MD'
    }, { transaction });
    
    // Create or update cash balance
    let cashBalance = await CashBalance.findOne({
      where: { date: targetDate },
      transaction
    });
    
    if (!cashBalance) {
      cashBalance = await CashBalance.create({
        date: targetDate,
        opening_balance: parseFloat(amount),
        cash_in: parseFloat(amount),
        cash_out: 0,
        closing_balance: parseFloat(amount),
        bank_balance: 0,
        mobile_banking_balance: 0
      }, { transaction });
    } else {
      cashBalance.opening_balance = parseFloat(amount);
      cashBalance.cash_in += parseFloat(amount);
      cashBalance.closing_balance += parseFloat(amount);
      await cashBalance.save({ transaction });
    }
    
    await transaction.commit();
    
    res.status(201).json(openingBalance);
  } catch (error) {
    await transaction.rollback();
    res.status(400).json({ message: error.message });
  }
});
// Get today's opening balance
router.get('/opening-balance/today', async (req, res) => {
  try {
    const today = new Date().toISOString().split('T')[0];
    
    const cashBalance = await CashBalance.findOne({
      where: { date: today }
    });
    
    res.json({
      opening_balance: cashBalance ? cashBalance.opening_balance : 0,
      date: today
    });
  } catch (error) {
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
        .reduce((sum, t) => sum + parseFloat(t.amount), 0);
      
      const dayExpense = dayTransactions
        .filter(t => t.type === 'expense')
        .reduce((sum, t) => sum + parseFloat(t.amount), 0);
      
      runningBalance += (dayIncome - dayExpense);
      
      dailyBalances[dateStr] = {
        date: dateStr,
        income: dayIncome,
        expense: dayExpense,
        balance: runningBalance
      };
    }
    
    // Calculate category totals
    const incomeByCategory = {};
    const expenseByCategory = {};
    
    transactions.forEach(transaction => {
      if (transaction.type === 'income') {
        incomeByCategory[transaction.category] = 
          (incomeByCategory[transaction.category] || 0) + parseFloat(transaction.amount);
      } else if (transaction.type === 'expense') {
        expenseByCategory[transaction.category] = 
          (expenseByCategory[transaction.category] || 0) + parseFloat(transaction.amount);
      }
    });
    
    res.json({
      monthlySummary: {
        totalIncome: transactions
          .filter(t => t.type === 'income')
          .reduce((sum, t) => sum + parseFloat(t.amount), 0),
        totalExpense: transactions
          .filter(t => t.type === 'expense')
          .reduce((sum, t) => sum + parseFloat(t.amount), 0),
        netBalance: transactions
          .reduce((sum, t) => sum + (t.type === 'income' ? parseFloat(t.amount) : -parseFloat(t.amount)), 0)
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

module.exports = router;