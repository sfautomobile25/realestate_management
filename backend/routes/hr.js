const express = require('express');
const { Employee, Department, Salary, User, Attendance, SalaryPayment, sequelize  } = require('../models');
const { Op } = require('sequelize');
const router = express.Router();

// Get all users for employee creation
router.get('/users', async (req, res) => {
  try {
    const users = await User.findAll({
      where: {
        id: {
          [Op.notIn]: await Employee.findAll({ attributes: ['user_id'] }).then(emps => emps.map(e => e.user_id))
        }
      },
      attributes: ['id', 'first_name', 'last_name', 'email', 'phone'],
      order: [['first_name', 'ASC']]
    });
    res.json(users);
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({ message: error.message });
  }
});

// Get all employees
router.get('/employees', async (req, res) => {
  try {
    const employees = await Employee.findAll({
      include: [
        {
          model: User,
          as: 'User',
          attributes: ['first_name', 'last_name', 'email', 'phone']
        },
        {
          model: Department,
          as: 'Department'
        }
      ],
      order: [['createdAt', 'DESC']]
    });
    res.json(employees);
  } catch (error) {
    console.error('Error fetching employees:', error);
    res.status(500).json({ message: error.message });
  }
});

// Get all departments
router.get('/departments', async (req, res) => {
  try {
    const departments = await Department.findAll({
      include: [{
        model: Employee,
        as: 'Employees',
        include: [{
          model: User,
          as: 'User',
          attributes: ['first_name', 'last_name']
        }]
      }],
      order: [['name', 'ASC']]
    });
    res.json(departments);
  } catch (error) {
    console.error('Error fetching departments:', error);
    res.status(500).json({ message: error.message });
  }
});

// Create employee
router.post('/employees', async (req, res) => {
  try {
    const { user_id, department_id, employee_id, position, salary, joining_date, emergency_contact, bank_account_number, bank_name } = req.body;

    // Validate required fields
    if (!user_id || !employee_id || !position || !salary || !joining_date) {
      return res.status(400).json({ message: 'All required fields must be provided' });
    }

    // Check if user exists
    const user = await User.findByPk(user_id);
    if (!user) {
      return res.status(400).json({ message: 'User does not exist' });
    }

    // Check if employee ID already exists
    const existingEmployee = await Employee.findOne({ where: { employee_id } });
    if (existingEmployee) {
      return res.status(400).json({ message: 'Employee ID already exists' });
    }

    // Check if user is already an employee
    const existingUserEmployee = await Employee.findOne({ where: { user_id } });
    if (existingUserEmployee) {
      return res.status(400).json({ message: 'User is already registered as an employee' });
    }

    const employee = await Employee.create({
      user_id,
      department_id: department_id || null,
      employee_id,
      position,
      salary: parseFloat(salary),
      joining_date,
      emergency_contact: emergency_contact || null,
      bank_account_number: bank_account_number || null,
      bank_name: bank_name || null
    });

    const newEmployee = await Employee.findByPk(employee.id, {
      include: [
        {
          model: User,
          as: 'User',
          attributes: ['first_name', 'last_name', 'email', 'phone']
        },
        {
          model: Department,
          as: 'Department'
        }
      ]
    });

    res.status(201).json(newEmployee);
  } catch (error) {
    console.error('Error creating employee:', error);
    res.status(400).json({ message: error.message });
  }
});

// Create department
router.post('/departments', async (req, res) => {
  try {
    const { name, description, manager_id } = req.body;

    if (!name) {
      return res.status(400).json({ message: 'Department name is required' });
    }

    // Check if department name already exists
    const existingDepartment = await Department.findOne({ where: { name } });
    if (existingDepartment) {
      return res.status(400).json({ message: 'Department name already exists' });
    }

    const department = await Department.create({
      name,
      description: description || null,
      manager_id: manager_id || null
    });

    res.status(201).json(department);
  } catch (error) {
    console.error('Error creating department:', error);
    res.status(400).json({ message: error.message });
  }
});

// Get salary records
router.get('/salaries', async (req, res) => {
  try {
    const { month, employee_id } = req.query;
    
    const whereCondition = {};
    if (month) {
      whereCondition.month = month;
    }
    if (employee_id) {
      whereCondition.employee_id = employee_id;
    }

    const salaries = await Salary.findAll({
      where: whereCondition,
      include: [{
        model: Employee,
        as: 'Employee',
        include: [{
          model: User,
          as: 'User',
          attributes: ['first_name', 'last_name']
        }]
      }],
      order: [['month', 'DESC']]
    });

    res.json(salaries);
  } catch (error) {
    console.error('Error fetching salaries:', error);
    res.status(500).json({ message: error.message });
  }
});

// Generate monthly salaries
router.post('/salaries/generate', async (req, res) => {
  try {
    const { month } = req.body;
    const targetMonth = month || new Date().toISOString().split('T')[0].substring(0, 7) + '-01';

    // Check if salaries already generated for this month
    const existingSalaries = await Salary.findAll({
      where: {
        month: {
          [Op.between]: [
            new Date(targetMonth),
            new Date(new Date(targetMonth).getFullYear(), new Date(targetMonth).getMonth() + 1, 0)
          ]
        }
      }
    });

    if (existingSalaries.length > 0) {
      return res.status(400).json({ message: 'Salaries already generated for this month' });
    }

    const activeEmployees = await Employee.findAll({
      where: { status: 'active' },
      include: [{
        model: User,
        as: 'User',
        attributes: ['first_name', 'last_name']
      }]
    });

    const salaryPromises = activeEmployees.map(employee => {
      return Salary.create({
        employee_id: employee.id,
        month: targetMonth,
        basic_salary: employee.salary,
        allowances: 0,
        deductions: 0,
        net_salary: employee.salary,
        status: 'pending'
      });
    });

    const salaries = await Promise.all(salaryPromises);
    res.status(201).json(salaries);
  } catch (error) {
    console.error('Error generating salaries:', error);
    res.status(400).json({ message: error.message });
  }
});

// Process salary payment
router.post('/salaries/process', async (req, res) => {
  try {
    const { salary_id, paid_date, notes } = req.body;

    const salary = await Salary.findByPk(salary_id);

    if (!salary) {
      return res.status(404).json({ message: 'Salary record not found' });
    }

    await salary.update({
      status: 'paid',
      paid_date: paid_date || new Date(),
      notes: notes || null
    });

    res.json(salary);
  } catch (error) {
    console.error('Error processing salary:', error);
    res.status(400).json({ message: error.message });
  }
});


// Update employee status - FIXED
router.put('/employees/:id/status', async (req, res) => {
  try {
    const { status } = req.body;
    const employee = await Employee.findByPk(req.params.id);

    if (!employee) {
      return res.status(404).json({ message: 'Employee not found' });
    }

    await employee.update({ status });
    
    // Return updated employee with relationships
    const updatedEmployee = await Employee.findByPk(employee.id, {
      include: [
        {
          model: User,
          as: 'User',
          attributes: ['first_name', 'last_name', 'email', 'phone']
        },
        {
          model: Department,
          as: 'Department'
        }
      ]
    });

    res.json(updatedEmployee);
  } catch (error) {
    console.error('Error updating employee status:', error);
    res.status(400).json({ message: error.message });
  }
});

// Update employee salary - FIXED
router.put('/employees/:id/salary', async (req, res) => {
  try {
    const { salary } = req.body;
    const employee = await Employee.findByPk(req.params.id);

    if (!employee) {
      return res.status(404).json({ message: 'Employee not found' });
    }

    await employee.update({ salary: parseFloat(salary) });
    
    // Return updated employee with relationships
    const updatedEmployee = await Employee.findByPk(employee.id, {
      include: [
        {
          model: User,
          as: 'User',
          attributes: ['first_name', 'last_name', 'email', 'phone']
        },
        {
          model: Department,
          as: 'Department'
        }
      ]
    });

    res.json(updatedEmployee);
  } catch (error) {
    console.error('Error updating employee salary:', error);
    res.status(400).json({ message: error.message });
  }
});

// Attendance - Check in - FIXED
router.post('/attendance/checkin', async (req, res) => {
  try {
    const { employee_id, notes } = req.body;
    const today = new Date().toISOString().split('T')[0];

    // Check if already checked in today
    const existingAttendance = await Attendance.findOne({
      where: {
        employee_id,
        date: today
      }
    });

    if (existingAttendance) {
      // If already checked in but not checked out, return the existing record
      if (!existingAttendance.check_out) {
        return res.status(400).json({ message: 'Employee already checked in today' });
      }
      // If checked out, create a new check-in
    }

    const attendance = await Attendance.create({
      employee_id,
      check_in: new Date(),
      date: today,
      notes: notes || null,
      status: 'present'
    });

    const newAttendance = await Attendance.findByPk(attendance.id, {
      include: [{
        model: Employee,
        as: 'Employee',
        include: [{
          model: User,
          as: 'User',
          attributes: ['first_name', 'last_name']
        }]
      }]
    });

    res.status(201).json(newAttendance);
  } catch (error) {
    console.error('Error checking in:', error);
    res.status(400).json({ message: error.message });
  }
});

// Attendance - Check out - FIXED
router.post('/attendance/checkout', async (req, res) => {
  try {
    const { employee_id, notes } = req.body;
    const today = new Date().toISOString().split('T')[0];

    const attendance = await Attendance.findOne({
      where: {
        employee_id,
        date: today,
        check_out: null
      }
    });

    if (!attendance) {
      return res.status(404).json({ message: 'No active check-in found for today' });
    }

    const checkOutTime = new Date();
    const checkInTime = new Date(attendance.check_in);
    const totalHours = (checkOutTime - checkInTime) / (1000 * 60 * 60); // Convert to hours

    await attendance.update({
      check_out: checkOutTime,
      total_hours: parseFloat(totalHours.toFixed(2)),
      notes: notes || attendance.notes
    });

    const updatedAttendance = await Attendance.findByPk(attendance.id, {
      include: [{
        model: Employee,
        as: 'Employee',
        include: [{
          model: User,
          as: 'User',
          attributes: ['first_name', 'last_name']
        }]
      }]
    });

    res.json(updatedAttendance);
  } catch (error) {
    console.error('Error checking out:', error);
    res.status(400).json({ message: error.message });
  }
});

// Generate advance salary - FIXED
router.post('/salaries/advance', async (req, res) => {
  const transaction = await sequelize.transaction();
  
  try {
    const { employee_id, amount, advance_month, payment_method, reference_number, notes } = req.body;

    const employee = await Employee.findByPk(employee_id, {
      include: [{
        model: User,
        as: 'User',
        attributes: ['first_name', 'last_name']
      }]
    });

    if (!employee) {
      await transaction.rollback();
      return res.status(404).json({ message: 'Employee not found' });
    }

    // Create a special salary record for advance
    const advanceSalary = await Salary.create({
      employee_id,
      month: advance_month,
      basic_salary: 0,
      allowances: 0,
      deductions: 0,
      net_salary: parseFloat(amount),
      paid_amount: parseFloat(amount),
      remaining_amount: 0,
      status: 'paid',
      paid_date: new Date(),
      notes: `Advance salary for ${new Date(advance_month).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}`
    }, { transaction });

    // Create payment record
    const receiptNumber = `ADV${Date.now().toString().slice(-6)}`;
    const payment = await SalaryPayment.create({
      salary_id: advanceSalary.id,
      amount: parseFloat(amount),
      payment_type: 'advance',
      payment_method,
      reference_number: reference_number || null,
      receipt_number: receiptNumber,
      notes: notes || null,
      is_advance: true,
      advance_month
    }, { transaction });

    await transaction.commit();

    const paymentDetails = await SalaryPayment.findByPk(payment.id, {
      include: [{
        model: Salary,
        as: 'Salary',
        include: [{
          model: Employee,
          as: 'Employee',
          include: [{
            model: User,
            as: 'User',
            attributes: ['first_name', 'last_name']
          }]
        }]
      }]
    });

    res.status(201).json({
      payment: paymentDetails,
      receipt_number: receiptNumber
    });
  } catch (error) {
    await transaction.rollback();
    console.error('Error generating advance salary:', error);
    res.status(400).json({ message: error.message });
  }
});

// Get today's attendance - NEW ENDPOINT
router.get('/attendance/today', async (req, res) => {
  try {
    const today = new Date().toISOString().split('T')[0];
    
    const attendance = await Attendance.findAll({
      where: {
        date: today
      },
      include: [{
        model: Employee,
        as: 'Employee',
        include: [{
          model: User,
          as: 'User',
          attributes: ['first_name', 'last_name']
        }]
      }],
      order: [['check_in', 'DESC']]
    });

    res.json(attendance);
  } catch (error) {
    console.error('Error fetching today\'s attendance:', error);
    res.status(500).json({ message: error.message });
  }
});


module.exports = router;