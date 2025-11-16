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

// Sync database and create default data
const syncDatabase = async () => {
  try {
    await sequelize.sync({ force: false });
    console.log('✅ Database synced successfully');
    
    // Create default utility types if they don't exist
    const utilityTypes = [
      { name: 'Lift Maintenance', description: 'Monthly lift maintenance fee', default_amount: 500, calculation_type: 'fixed' },
      { name: 'Generator Maintenance', description: 'Monthly generator maintenance fee', default_amount: 300, calculation_type: 'fixed' },
      { name: 'Common Area Maintenance', description: 'Common area cleaning and maintenance', default_amount: 200, calculation_type: 'fixed' },
      { name: 'Security Service', description: 'Security guard services', default_amount: 400, calculation_type: 'fixed' },
      { name: 'Water Charge', description: 'Water consumption charge', default_amount: 2, calculation_type: 'per_sqft' },
      { name: 'Service Charge', description: 'General service charge', default_amount: 5, calculation_type: 'percentage_of_rent' }
    ];

    for (const utilType of utilityTypes) {
      await UtilityType.findOrCreate({
        where: { name: utilType.name },
        defaults: utilType
      });
    }
    console.log('✅ Default utility types created');

    // Create default departments if they don't exist
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
    console.log('✅ Default departments created');

  } catch (error) {
    console.error('❌ Database sync failed:', error);
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
  Salary
};