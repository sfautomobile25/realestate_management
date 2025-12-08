const sequelize = require('../config/database');
const User = require('./User');
const Project = require('./Project');
const Building = require('./Building');
const Unit = require('./Unit');
const Customer = require('./Customer');
const Rental = require('./Rental');
const UtilityType = require('./UtilityType');
const UtilityBill = require('./UtilityBill');
const Payment = require('./Payment');
const Employee = require('./Employee');
const Department = require('./Department');
const Salary = require('./Salary');
const Attendance = require('./Attendance');
const SalaryPayment = require('./SalaryPayment');
const Account = require('./Account');
const CashBalance = require('./CashBalance');

// Define associations

// Project-Building-Unit associations
Project.hasMany(Building, { 
  foreignKey: 'project_id', 
  as: 'Buildings',
  onDelete: 'CASCADE'
});
Building.belongsTo(Project, { 
  foreignKey: 'project_id', 
  as: 'Project'
});

Building.hasMany(Unit, { 
  foreignKey: 'building_id', 
  as: 'Units',
  onDelete: 'CASCADE'
});
Unit.belongsTo(Building, { 
  foreignKey: 'building_id', 
  as: 'Building'
});

// Rental associations
Unit.hasMany(Rental, { 
  foreignKey: 'unit_id', 
  as: 'Rentals',
  onDelete: 'CASCADE'
});
Rental.belongsTo(Unit, { 
  foreignKey: 'unit_id', 
  as: 'Unit'
});

Customer.hasMany(Rental, { 
  foreignKey: 'tenant_id', 
  as: 'Rentals',
  onDelete: 'CASCADE'
});
Rental.belongsTo(Customer, { 
  foreignKey: 'tenant_id', 
  as: 'Tenant'
});

// Utility associations
UtilityType.hasMany(UtilityBill, { 
  foreignKey: 'utility_type_id', 
  as: 'Bills',
  onDelete: 'CASCADE'
});
UtilityBill.belongsTo(UtilityType, { 
  foreignKey: 'utility_type_id', 
  as: 'UtilityType'
});

Rental.hasMany(UtilityBill, { 
  foreignKey: 'rental_id', 
  as: 'UtilityBills',
  onDelete: 'CASCADE'
});
UtilityBill.belongsTo(Rental, { 
  foreignKey: 'rental_id', 
  as: 'Rental'
});

// Payment associations
Rental.hasMany(Payment, { 
  foreignKey: 'rental_id', 
  as: 'Payments',
  onDelete: 'CASCADE'
});
Payment.belongsTo(Rental, { 
  foreignKey: 'rental_id', 
  as: 'Rental'
});

Customer.hasMany(Payment, { 
  foreignKey: 'customer_id', 
  as: 'Payments',
  onDelete: 'CASCADE'
});
Payment.belongsTo(Customer, { 
  foreignKey: 'customer_id', 
  as: 'Customer'
});

// HR Associations
Department.hasMany(Employee, {
  foreignKey: 'department_id',
  as: 'Employees',
  onDelete: 'SET NULL'
});
Employee.belongsTo(Department, {
  foreignKey: 'department_id',
  as: 'Department'
});

User.hasOne(Employee, {
  foreignKey: 'user_id',
  as: 'Employee',
  onDelete: 'CASCADE'
});
Employee.belongsTo(User, {
  foreignKey: 'user_id',
  as: 'User'
});

Employee.hasMany(Salary, {
  foreignKey: 'employee_id',
  as: 'Salaries',
  onDelete: 'CASCADE'
});
Salary.belongsTo(Employee, {
  foreignKey: 'employee_id',
  as: 'Employee'
});

// Self-referencing for department manager
Employee.belongsTo(Employee, {
  foreignKey: 'id',
  as: 'Manager',
  constraints: false
});

Employee.hasMany(Attendance, {
  foreignKey: 'employee_id',
  as: 'Attendances',
  onDelete: 'CASCADE'
});
Attendance.belongsTo(Employee, {
  foreignKey: 'employee_id',
  as: 'Employee'
});

Salary.hasMany(SalaryPayment, {
  foreignKey: 'salary_id',
  as: 'Payments',
  onDelete: 'CASCADE'
});
SalaryPayment.belongsTo(Salary, {
  foreignKey: 'salary_id',
  as: 'Salary'
});

// Update the syncDatabase function in models/index.js
const syncDatabase = async () => {
  try {
    // Use alter: true to update tables without dropping
    await sequelize.sync({ alter: true });
    console.log('✅ Database synced successfully');
    
    // Check and create utility types
    const utilityTypes = [
      { 
        name: 'Monthly Rent', 
        description: 'Monthly rental payment', 
        default_amount: 50000, 
        calculation_type: 'fixed',
        is_rent: true
      },
      // ... other utility types
    ];

    for (const utilType of utilityTypes) {
      await UtilityType.findOrCreate({
        where: { name: utilType.name },
        defaults: utilType
      });
    }
    console.log('✅ Default utility types checked/created');

    // Check and create default departments
    const defaultDepartments = [
      { name: 'Management', description: 'Company management and administration' },
      { name: 'Sales', description: 'Property sales and marketing' },
      { name: 'Operations', description: 'Property operations and maintenance' },
      { name: 'Finance', description: 'Financial management and accounting' },
      { name: 'HR', description: 'Human resources and staff management' }
    ];

    for (const dept of defaultDepartments) {
      await Department.findOrCreate({
        where: { name: dept.name },
        defaults: dept
      });
    }
    console.log('✅ Default departments checked/created');

  } catch (error) {
    console.error('❌ Database sync failed:', error.message);
    
    // If it's a key limit error, try a different approach
    if (error.parent && error.parent.code === 'ER_TOO_MANY_KEYS') {
      console.log('⚠️  Too many indexes. Trying manual table creation...');
      await manualTableCreation();
    }
  }
};

// Add this function for manual table creation
const manualTableCreation = async () => {
  try {
    // Create tables without auto-sync
    const tables = [
      'CREATE TABLE IF NOT EXISTS users (id INT AUTO_INCREMENT PRIMARY KEY, first_name VARCHAR(100), last_name VARCHAR(100), email VARCHAR(255), phone VARCHAR(20), password VARCHAR(255), role VARCHAR(50) DEFAULT "user", created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP, updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP)',
      
      'CREATE TABLE IF NOT EXISTS accounts (id INT AUTO_INCREMENT PRIMARY KEY, voucher_number VARCHAR(50) UNIQUE, voucher_type ENUM("credit", "debit", "journal"), date DATE, name VARCHAR(255), description TEXT, type ENUM("income", "expense", "transfer"), category VARCHAR(100), amount DECIMAL(12,2), payment_method ENUM("cash", "bank", "mobile_banking", "check"), reference_number VARCHAR(100), notes TEXT, amount_in_bangla VARCHAR(255), status ENUM("pending", "completed", "cancelled") DEFAULT "completed", created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP, updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP)',
      
      'CREATE TABLE IF NOT EXISTS cash_balances (id INT AUTO_INCREMENT PRIMARY KEY, date DATE UNIQUE, opening_balance DECIMAL(12,2) DEFAULT 0, cash_in DECIMAL(12,2) DEFAULT 0, cash_out DECIMAL(12,2) DEFAULT 0, closing_balance DECIMAL(12,2) DEFAULT 0, bank_balance DECIMAL(12,2) DEFAULT 0, mobile_banking_balance DECIMAL(12,2) DEFAULT 0, created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP, updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP)'
    ];

    for (const sql of tables) {
      await sequelize.query(sql);
    }
    console.log('✅ Tables created manually');
  } catch (error) {
    console.error('❌ Manual table creation failed:', error.message);
  }
};

syncDatabase();

module.exports = {
  sequelize,
  User,
  Project,
  Building,
  Unit,
  Customer,
  Rental,
  UtilityType,
  UtilityBill,
  Payment,
  Employee,
  Department,
  Salary,
  Attendance,  // Add this line
  SalaryPayment,
  Account,
  CashBalance,
};
