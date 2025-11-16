const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const SalaryPayment = sequelize.define('SalaryPayment', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  salary_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'salaries',
      key: 'id'
    }
  },
  amount: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false
  },
  payment_date: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW
  },
  payment_type: {
    type: DataTypes.ENUM('full', 'installment', 'advance'),
    defaultValue: 'full'
  },
  payment_method: {
    type: DataTypes.ENUM('cash', 'bank_transfer', 'check', 'online'),
    defaultValue: 'cash'
  },
  reference_number: {
    type: DataTypes.STRING(100),
    allowNull: true
  },
  receipt_number: {
    type: DataTypes.STRING(100),
    allowNull: false,
    unique: true
  },
  notes: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  is_advance: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  advance_month: {
    type: DataTypes.DATE,
    allowNull: true
  }
}, {
  tableName: 'salary_payments',
  timestamps: true
});

module.exports = SalaryPayment;