const express = require('express');
const { Notification, Account, Payment, Rental, Employee } = require('../models');
const { Op } = require('sequelize');
const router = express.Router();

// Get notifications for current user
router.get('/', async (req, res) => {
  try {
    const { status, type } = req.query;
    
    const whereCondition = {};
    
    if (status) {
      whereCondition.status = status;
    }
    
    if (type) {
      whereCondition.type = type;
    }
    
    // In real app, use req.user.id for receiver_id
    // For now, get all notifications
    const notifications = await Notification.findAll({
      where: whereCondition,
      order: [['createdAt', 'DESC']]
    });
    
    res.json(notifications);
  } catch (error) {
    console.error('Error fetching notifications:', error);
    res.status(500).json({ message: error.message });
  }
});

// Get unread notification count
router.get('/unread-count', async (req, res) => {
  try {
    const count = await Notification.count({
      where: {
        status: 'pending'
      }
    });
    
    res.json({ count });
  } catch (error) {
    console.error('Error counting notifications:', error);
    res.status(500).json({ message: error.message });
  }
});

// Mark notification as read
router.put('/:id/read', async (req, res) => {
  try {
    const notification = await Notification.findByPk(req.params.id);
    
    if (!notification) {
      return res.status(404).json({ message: 'Notification not found' });
    }
    
    await notification.update({
      status: 'read'
    });
    
    res.json(notification);
  } catch (error) {
    console.error('Error marking notification as read:', error);
    res.status(500).json({ message: error.message });
  }
});

// Approve payment notification
router.put('/:id/approve', async (req, res) => {
  const transaction = await sequelize.transaction();
  
  try {
    const notification = await Notification.findByPk(req.params.id);
    
    if (!notification) {
      await transaction.rollback();
      return res.status(404).json({ message: 'Notification not found' });
    }
    
    if (notification.status !== 'pending') {
      await transaction.rollback();
      return res.status(400).json({ message: 'Notification already processed' });
    }
    
    // Update notification status
    await notification.update({
      status: 'approved'
    }, { transaction });
    
    // Handle different notification types
    switch (notification.type) {
      case 'payment_approval':
        // Update payment status in Account table
        if (notification.reference_id) {
          const account = await Account.findByPk(notification.reference_id, { transaction });
          if (account) {
            await account.update({
              status: 'completed'
            }, { transaction });
            
            // Create transaction for the payment
            const { generateVoucherNumber, numberToBanglaWords } = require('./accounts');
            const voucherNumber = generateVoucherNumber('debit');
            const amountInBangla = numberToBanglaWords(account.amount);
            
            await Account.create({
              voucher_number: voucherNumber,
              voucher_type: 'debit',
              date: new Date(),
              name: account.name || 'Payment Approved',
              description: `Approved payment for: ${account.description}`,
              type: 'expense',
              category: 'Approved Payment',
              amount: account.amount,
              payment_method: account.payment_method || 'cash',
              reference_number: `APPROVED-${notification.reference_id}`,
              notes: `Approved by Accounts Officer - Notification #${notification.id}`,
              amount_in_bangla: amountInBangla
            }, { transaction });
          }
        }
        break;
        
      case 'salary_payment':
        // Handle salary payment approval
        if (notification.reference_id) {
          // Update salary status
          // Add your salary approval logic here
        }
        break;
        
      case 'rent_payment':
        // Handle rent payment approval
        if (notification.reference_id) {
          // Update rental payment status
          // Add your rent approval logic here
        }
        break;
    }
    
    await transaction.commit();
    
    res.json({
      message: 'Payment approved successfully',
      notification
    });
    
  } catch (error) {
    await transaction.rollback();
    console.error('Error approving payment:', error);
    res.status(500).json({ message: error.message });
  }
});

// Reject payment notification
router.put('/:id/reject', async (req, res) => {
  try {
    const notification = await Notification.findByPk(req.params.id);
    
    if (!notification) {
      return res.status(404).json({ message: 'Notification not found' });
    }
    
    if (notification.status !== 'pending') {
      return res.status(400).json({ message: 'Notification already processed' });
    }
    
    await notification.update({
      status: 'rejected'
    });
    
    // You can add logic to notify the sender about rejection
    
    res.json({
      message: 'Payment rejected',
      notification
    });
    
  } catch (error) {
    console.error('Error rejecting payment:', error);
    res.status(500).json({ message: error.message });
  }
});

// Create payment approval notification (for other modules to call)
router.post('/payment-approval', async (req, res) => {
  try {
    const { title, message, reference_id, reference_type, amount, sender_id, receiver_id, metadata } = req.body;
    
    const notification = await Notification.create({
      title: title || 'Payment Approval Required',
      message: message || 'A payment requires your approval',
      type: 'payment_approval',
      status: 'pending',
      reference_id,
      reference_type: reference_type || 'payment',
      amount: amount ? parseFloat(amount) : null,
      sender_id,
      receiver_id,
      action_url: `/accounts/payments/${reference_id}`,
      metadata: metadata || {}
    });
    
    res.status(201).json(notification);
  } catch (error) {
    console.error('Error creating notification:', error);
    res.status(500).json({ message: error.message });
  }
});

// Mark all as read
router.put('/mark-all-read', async (req, res) => {
  try {
    await Notification.update(
      { status: 'read' },
      {
        where: {
          status: 'pending'
        }
      }
    );
    
    res.json({ message: 'All notifications marked as read' });
  } catch (error) {
    console.error('Error marking all as read:', error);
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;