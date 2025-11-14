const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const UtilityBill = sequelize.define('UtilityBill', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  amount: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false
  },
  billing_month: {
    type: DataTypes.DATE,
    allowNull: false
  },
  due_date: {
    type: DataTypes.DATE,
    allowNull: false
  },
  status: {
    type: DataTypes.ENUM('pending', 'paid', 'overdue'),
    defaultValue: 'pending'
  },
  paid_date: {
    type: DataTypes.DATE,
    allowNull: true
  },
  late_fee: {
    type: DataTypes.DECIMAL(10, 2),
    defaultValue: 0
  },
  notes: {
    type: DataTypes.TEXT,
    allowNull: true
  }
}, {
  tableName: 'utility_bills',
  timestamps: true
});

module.exports = UtilityBill;