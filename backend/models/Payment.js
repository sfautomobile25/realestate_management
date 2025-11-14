const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Payment = sequelize.define('Payment', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
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
  payment_method: {
    type: DataTypes.ENUM('cash', 'bank_transfer', 'check', 'online'),
    defaultValue: 'cash'
  },
  reference_number: {
    type: DataTypes.STRING(100),
    allowNull: true
  },
  payment_type: {
    type: DataTypes.ENUM('rent', 'utility', 'deposit', 'late_fee', 'other'),
    allowNull: false
  },
  notes: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  status: {
    type: DataTypes.ENUM('completed', 'pending', 'failed'),
    defaultValue: 'completed'
  }
}, {
  tableName: 'payments',
  timestamps: true
});

module.exports = Payment;