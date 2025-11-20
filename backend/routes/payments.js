const express = require('express');
const { Payment, Rental, Customer, Unit, Building, UtilityBill, UtilityType } = require('../models');
const { Op } = require('sequelize');
const router = express.Router();

// Process payment
router.post('/', async (req, res) => {
  try {
    const { 
      rental_id, 
      customer_id, 
      amount, 
      payment_method, 
      reference_number, 
      notes, 
      payment_type,
      utility_bill_ids 
    } = req.body;

    // Generate receipt number
    const receiptNumber = `RCP${Date.now().toString().slice(-6)}`;

    const payment = await Payment.create({
      rental_id: rental_id || null,
      customer_id,
      amount: parseFloat(amount),
      payment_method,
      reference_number: reference_number || null,
      receipt_number: receiptNumber,
      notes: notes || null,
      payment_type: payment_type || 'rent',
      payment_date: new Date(),
      status: 'completed'
    });

    // Update utility bills status if paid
    if (utility_bill_ids && utility_bill_ids.length > 0) {
      await UtilityBill.update(
        { 
          status: 'paid',
          paid_date: new Date()
        },
        { 
          where: { 
            id: { [Op.in]: utility_bill_ids } 
          } 
        }
      );
    }

    const paymentWithDetails = await Payment.findByPk(payment.id, {
      include: [
        {
          model: Rental,
          as: 'Rental',
          include: [{
            model: Unit,
            as: 'Unit',
            include: ['Building']
          }]
        },
        {
          model: Customer,
          as: 'Customer'
        }
      ]
    });

    res.status(201).json({
      payment: paymentWithDetails,
      receipt_number: receiptNumber
    });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Get payment receipt
router.get('/receipt/:receiptNumber', async (req, res) => {
  try {
    const payment = await Payment.findOne({
      where: { receipt_number: req.params.receiptNumber },
      include: [
        {
          model: Rental,
          as: 'Rental',
          include: [{
            model: Unit,
            as: 'Unit',
            include: ['Building']
          }]
        },
        {
          model: Customer,
          as: 'Customer'
        }
      ]
    });

    if (!payment) {
      return res.status(404).json({ message: 'Receipt not found' });
    }

    res.json(payment);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get payments by rental
router.get('/rental/:rentalId', async (req, res) => {
  try {
    const payments = await Payment.findAll({
      where: { rental_id: req.params.rentalId },
      include: [
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

module.exports = router;