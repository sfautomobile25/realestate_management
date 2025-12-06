const express = require('express');
const { Account, CashBalance } = require('../models');
const { Op } = require('sequelize');
const router = express.Router();
const sequelize = require('../config/database');

// Get cash balance summary
router.get('/balance', async (req, res) => {
  try {
    const { date } = req.query;
    const targetDate = date || new Date().toISOString().split('T')[0];
    
    let cashBalance = await CashBalance.findOne({
      where: { date: targetDate }
    });
    
    if (!cashBalance) {
      // Get latest balance
      const latestBalance = await CashBalance.findOne({
        order: [['date', 'DESC']]
      });
      
      cashBalance = {
        date: targetDate,
        opening_balance: latestBalance ? latestBalance.closing_balance : 0,
        cash_in: 0,
        cash_out: 0,
        closing_balance: latestBalance ? latestBalance.closing_balance : 0,
        bank_balance: 0,
        mobile_banking_balance: 0
      };
    }
    
    // Get today's transactions
    const todayTransactions = await Account.findAll({
      where: {
        date: {
          [Op.between]: [
            new Date(targetDate),
            new Date(new Date(targetDate).setHours(23, 59, 59))
          ]
        }
      },
      order: [['createdAt', 'DESC']]
    });
    
    // Calculate category totals
    const incomeCategories = {};
    const expenseCategories = {};
    
    todayTransactions.forEach(transaction => {
      if (transaction.type === 'income') {
        incomeCategories[transaction.category] = 
          (incomeCategories[transaction.category] || 0) + parseFloat(transaction.amount);
      } else if (transaction.type === 'expense') {
        expenseCategories[transaction.category] = 
          (expenseCategories[transaction.category] || 0) + parseFloat(transaction.amount);
      }
    });
    
    res.json({
      balance: cashBalance,
      todayTransactions,
      incomeCategories,
      expenseCategories,
      totalIncome: cashBalance.cash_in,
      totalExpense: cashBalance.cash_out
    });
  } catch (error) {
    console.error('Error fetching balance:', error);
    res.status(500).json({ message: error.message });
  }
});

// Create account transaction
router.post('/', async (req, res) => {
  const transaction = await sequelize.transaction();
  
  try {
    const { date, description, type, category, amount, payment_method, reference_number, notes } = req.body;
    
    // Validate required fields
    if (!description || !type || !category || !amount) {
      return res.status(400).json({ message: 'Missing required fields' });
    }
    
    // Create account transaction
    const account = await Account.create({
      date: date || new Date(),
      description,
      type,
      category,
      amount: parseFloat(amount),
      payment_method: payment_method || 'cash',
      reference_number,
      notes
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
      
      cashBalance = await CashBalance.create({
        date: transactionDate,
        opening_balance: previousBalance ? previousBalance.closing_balance : 0,
        cash_in: type === 'income' ? parseFloat(amount) : 0,
        cash_out: type === 'expense' ? parseFloat(amount) : 0,
        closing_balance: previousBalance ? 
          previousBalance.closing_balance + 
          (type === 'income' ? parseFloat(amount) : -parseFloat(amount)) : 
          (type === 'income' ? parseFloat(amount) : -parseFloat(amount)),
        bank_balance: 0,
        mobile_banking_balance: 0
      }, { transaction });
    } else {
      // Update existing balance
      if (type === 'income') {
        cashBalance.cash_in += parseFloat(amount);
        cashBalance.closing_balance += parseFloat(amount);
      } else if (type === 'expense') {
        cashBalance.cash_out += parseFloat(amount);
        cashBalance.closing_balance -= parseFloat(amount);
      }
      
      await cashBalance.save({ transaction });
    }
    
    await transaction.commit();
    
    res.status(201).json(account);
  } catch (error) {
    await transaction.rollback();
    console.error('Error creating transaction:', error);
    res.status(400).json({ message: error.message });
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