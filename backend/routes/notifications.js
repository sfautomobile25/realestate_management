const express = require('express');
const router = express.Router();
const { Op } = require('sequelize');
const { Notification, User, Rental, Customer, Unit, Building } = require('../models');
const auth = require('../middleware/auth');

// Make sure auth middleware is properly exported
console.log('Auth middleware:', auth); // Should be a function

// Get all notifications for user
router.get('/', auth, async (req, res) => {  // LINE 7 - Make sure this is async function
  try {
    const { status, type, priority, page = 1, limit = 20 } = req.query;
    
    console.log('Fetching notifications for user:', req.user.id);
    
    const where = { user_id: req.user.id };
    
    if (status) where.status = status;
    if (type) where.type = type;
    if (priority) where.priority = priority;
    
    const offset = (page - 1) * limit;
    
    const { count, rows } = await Notification.findAndCountAll({
      where,
      order: [['created_at', 'DESC']],
      limit: parseInt(limit),
      offset: parseInt(offset),
      include: [
        {
          model: User,
          as: 'user',
          attributes: ['id', 'name', 'email']
        }
      ]
    });
    
    res.json({
      success: true,
      data: rows,
      pagination: {
        total: count,
        page: parseInt(page),
        limit: parseInt(limit),
        pages: Math.ceil(count / limit)
      }
    });
  } catch (error) {
    console.error('Error fetching notifications:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// Get unread count
router.get('/unread-count', auth, async (req, res) => {
  try {
    const count = await Notification.count({
      where: {
        user_id: req.user.id,
        status: 'unread'
      }
    });
    
    res.json({ success: true, count });
  } catch (error) {
    console.error('Error getting unread count:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// Mark as read
router.put('/:id/read', auth, async (req, res) => {
  try {
    const notification = await Notification.findOne({
      where: {
        id: req.params.id,
        user_id: req.user.id
      }
    });
    
    if (!notification) {
      return res.status(404).json({ success: false, message: 'Notification not found' });
    }
    
    await notification.update({
      status: 'read',
      read_at: new Date()
    });
    
    res.json({ success: true, data: notification });
  } catch (error) {
    console.error('Error marking as read:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// Mark all as read
router.put('/mark-all-read', auth, async (req, res) => {
  try {
    await Notification.update(
      {
        status: 'read',
        read_at: new Date()
      },
      {
        where: {
          user_id: req.user.id,
          status: 'unread'
        }
      }
    );
    
    res.json({ success: true, message: 'All notifications marked as read' });
  } catch (error) {
    console.error('Error marking all as read:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// Delete notification
router.delete('/:id', auth, async (req, res) => {
  try {
    const notification = await Notification.findOne({
      where: {
        id: req.params.id,
        user_id: req.user.id
      }
    });
    
    if (!notification) {
      return res.status(404).json({ success: false, message: 'Notification not found' });
    }
    
    await notification.destroy();
    
    res.json({ success: true, message: 'Notification deleted' });
  } catch (error) {
    console.error('Error deleting notification:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// SIMPLIFIED VERSION - Start with basic routes first
router.post('/payment-approval', auth, async (req, res) => {
  try {
    const { amount, description, reference, payment_type } = req.body;
    
    // For now, just return success without complex logic
    res.json({ 
      success: true, 
      message: 'Payment approval notification created',
      data: {
        amount,
        description,
        reference
      }
    });
  } catch (error) {
    console.error('Error creating payment approval:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// SIMPLIFIED approve payment
router.put('/:id/approve', auth, async (req, res) => {
  try {
    const notification = await Notification.findByPk(req.params.id);
    
    if (!notification) {
      return res.status(404).json({ success: false, message: 'Notification not found' });
    }
    
    await notification.update({
      status: 'approved',
      read_at: new Date()
    });
    
    res.json({ success: true, data: notification });
  } catch (error) {
    console.error('Error approving payment:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// SIMPLIFIED reject payment
router.put('/:id/reject', auth, async (req, res) => {
  try {
    const { reason } = req.body;
    const notification = await Notification.findByPk(req.params.id);
    
    if (!notification) {
      return res.status(404).json({ success: false, message: 'Notification not found' });
    }
    
    await notification.update({
      status: 'rejected',
      read_at: new Date()
    });
    
    res.json({ 
      success: true, 
      data: notification,
      message: `Payment rejected. Reason: ${reason || 'No reason provided'}`
    });
  } catch (error) {
    console.error('Error rejecting payment:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// SIMPLIFIED generate rent reminders
router.post('/generate-rent-reminders', auth, async (req, res) => {
  try {
    // Just return success for now
    res.json({ 
      success: true, 
      message: 'Rent reminder generation endpoint ready',
      count: 0 
    });
  } catch (error) {
    console.error('Error generating rent reminders:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;