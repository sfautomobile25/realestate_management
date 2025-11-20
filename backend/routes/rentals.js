const express = require('express');
const { Rental, Customer, Unit, Building, Project, UtilityBill, Payment } = require('../models');
const { Op } = require('sequelize');
const router = express.Router();

// Get all rentals
router.get('/', async (req, res) => {
  try {
    const rentals = await Rental.findAll({
      include: [
        {
          model: Customer,
          as: 'Tenant'
        },
        {
          model: Unit,
          as: 'Unit',
          include: [{
            model: Building,
            as: 'Building',
            include: ['Project']
          }]
        },
        {
          model: UtilityBill,
          as: 'UtilityBills'
        },
        {
          model: Payment,
          as: 'Payments'
        }
      ],
      order: [['createdAt', 'DESC']]
    });
    res.json(rentals);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Create rental agreement
router.post('/', async (req, res) => {
  try {
    const rental = await Rental.create(req.body);
    const newRental = await Rental.findByPk(rental.id, {
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
    });
    
    // Update unit status to rented
    await Unit.update({ status: 'rented' }, { where: { id: req.body.unit_id } });
    
    res.status(201).json(newRental);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Generate monthly bills for a rental
router.post('/:id/generate-bills', async (req, res) => {
  try {
    const rental = await Rental.findByPk(req.params.id, {
      include: [
        {
          model: Unit,
          as: 'Unit'
        },
        {
          model: UtilityBill,
          as: 'UtilityBills'
        }
      ]
    });

    if (!rental) {
      return res.status(404).json({ message: 'Rental not found' });
    }

    const { month } = req.body; // Format: YYYY-MM-DD
    const billingDate = new Date(month);
    const dueDate = new Date(billingDate);
    dueDate.setDate(dueDate.getDate() + 10); // Due in 10 days

    // Check if bills already generated for this month
    const existingBills = await UtilityBill.findAll({
      where: {
        rental_id: rental.id,
        billing_month: {
          [Op.between]: [
            new Date(billingDate.getFullYear(), billingDate.getMonth(), 1),
            new Date(billingDate.getFullYear(), billingDate.getMonth() + 1, 0)
          ]
        }
      }
    });

    if (existingBills.length > 0) {
      return res.status(400).json({ message: 'Bills already generated for this month' });
    }

    const { UtilityType } = require('../models');
    const utilityTypes = await UtilityType.findAll({ where: { is_active: true 
      
    } });

    const bills = [];

  for (const utilType of utilityTypes) {
  let amount = utilType.default_amount;

  // Calculate amount based on type
  if (utilType.calculation_type === 'per_sqft' && rental.Unit.size_sqft) {
    amount = utilType.default_amount * rental.Unit.size_sqft;
  } else if (utilType.calculation_type === 'percentage_of_rent') {
    // Find rent amount for percentage calculation
    const rentType = utilityTypes.find(ut => ut.is_rent);
    const rentAmount = rentType ? rentType.default_amount : rental.monthly_rent;
    amount = (utilType.default_amount / 100) * rentAmount;
  }

  bills.push({
    rental_id: rental.id,
    utility_type_id: utilType.id,
    amount: amount,
    billing_month: billingDate,
    due_date: dueDate,
    status: 'pending',
    notes: `${utilType.name} - ${utilType.description}`
  });
}

    // Create utility bills
    for (const utilType of utilityTypes) {
      let amount = utilType.default_amount;

      // Calculate amount based on type
      if (utilType.calculation_type === 'per_sqft' && rental.Unit.size_sqft) {
        amount = utilType.default_amount * rental.Unit.size_sqft;
      } else if (utilType.calculation_type === 'percentage_of_rent') {
        amount = (utilType.default_amount / 100) * rental.monthly_rent;
      }

      bills.push({
        rental_id: rental.id,
        utility_type_id: utilType.id,
        amount: amount,
        billing_month: billingDate,
        due_date: dueDate,
        status: 'pending',
        notes: `${utilType.name} - ${utilType.description}`
      });
    }

    const createdBills = await UtilityBill.bulkCreate(bills);
    res.status(201).json(createdBills);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Get rental financial summary
router.get('/:id/financial-summary', async (req, res) => {
  try {
    const rental = await Rental.findByPk(req.params.id, {
      include: [
        {
          model: UtilityBill,
          as: 'UtilityBills',
          where: {
            status: 'pending'
          },
          required: false
        },
        {
          model: Payment,
          as: 'Payments',
          where: {
            payment_date: {
              [Op.gte]: new Date(new Date().getFullYear(), new Date().getMonth(), 1)
            }
          },
          required: false
        }
      ]
    });

    if (!rental) {
      return res.status(404).json({ message: 'Rental not found' });
    }

    const totalPendingBills = rental.UtilityBills.reduce((sum, bill) => sum + parseFloat(bill.amount), 0);
    const totalPaidThisMonth = rental.Payments.reduce((sum, payment) => sum + parseFloat(payment.amount), 0);

    const summary = {
      monthly_rent: rental.monthly_rent,
      security_deposit: rental.security_deposit,
      total_pending: totalPendingBills,
      total_paid_this_month: totalPaidThisMonth,
      balance: totalPendingBills - totalPaidThisMonth,
      pending_bills: rental.UtilityBills.length
    };

    res.json(summary);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get pending bills for rental
router.get('/:id/pending-bills', async (req, res) => {
  try {
    const bills = await UtilityBill.findAll({
      where: { 
        rental_id: req.params.id,
        status: 'pending'
      },
      include: [{
        model: UtilityType,
        as: 'UtilityType'
      }],
      order: [['due_date', 'ASC']]
    });
    res.json(bills);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Update utility bill amount
router.put('/bills/:billId', async (req, res) => {
  try {
    const { amount, notes } = req.body;
    const bill = await UtilityBill.findByPk(req.params.billId);

    if (!bill) {
      return res.status(404).json({ message: 'Bill not found' });
    }

    await bill.update({
      amount: amount !== undefined ? parseFloat(amount) : bill.amount,
      notes: notes !== undefined ? notes : bill.notes
    });

    res.json(bill);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});


module.exports = router;