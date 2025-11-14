const express = require('express');
const { Payment, Rental, Customer, UtilityBill } = require('../models');
const router = express.Router();

// Get all payments
router.get('/', async (req, res) => {
  try {
    const payments = await Payment.findAll({
      include: [
        {
          model: Rental,
          as: 'Rental',
          include: [
            {
              model: Customer,
              as: 'Tenant'
            },
            {
              model: Unit,
              as: 'Unit',
              include: ['Building']
            }
          ]
        },
        {
          model: Customer,
          as: 'Customer'
        }
      ],
      order: [['payment_date', 'DESC']]
    });
    res.json(payments);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Create payment
router.post('/', async (req, res) => {
  try {
    const payment = await Payment.create(req.body);
    
    // If payment is for utility bills, update their status
    if (req.body.utility_bill_ids && req.body.utility_bill_ids.length > 0) {
      await UtilityBill.update(
        { status: 'paid', paid_date: new Date() },
        { where: { id: req.body.utility_bill_ids } }
      );
    }

    const newPayment = await Payment.findByPk(payment.id, {
      include: [
        {
          model: Rental,
          as: 'Rental',
          include: ['Tenant', 'Unit']
        },
        {
          model: Customer,
          as: 'Customer'
        }
      ]
    });

    res.status(201).json(newPayment);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Get payments summary
router.get('/summary', async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    
    const whereCondition = {};
    if (startDate && endDate) {
      whereCondition.payment_date = {
        [Op.between]: [new Date(startDate), new Date(endDate)]
      };
    }

    const payments = await Payment.findAll({
      where: whereCondition,
      include: [{
        model: Rental,
        as: 'Rental',
        include: ['Unit']
      }]
    });

    const summary = {
      total_collected: payments.reduce((sum, payment) => sum + parseFloat(payment.amount), 0),
      rent_collected: payments.filter(p => p.payment_type === 'rent')
        .reduce((sum, payment) => sum + parseFloat(payment.amount), 0),
      utility_collected: payments.filter(p => p.payment_type === 'utility')
        .reduce((sum, payment) => sum + parseFloat(payment.amount), 0),
      deposit_collected: payments.filter(p => p.payment_type === 'deposit')
        .reduce((sum, payment) => sum + parseFloat(payment.amount), 0),
      total_transactions: payments.length
    };

    res.json(summary);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;