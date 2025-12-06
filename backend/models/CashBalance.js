const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const CashBalance = sequelize.define('CashBalance', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  date: {
    type: DataTypes.DATEONLY,
    allowNull: false,
    unique: true
  },
  opening_balance: {
    type: DataTypes.DECIMAL(12, 2),
    defaultValue: 0
  },
  cash_in: {
    type: DataTypes.DECIMAL(12, 2),
    defaultValue: 0
  },
  cash_out: {
    type: DataTypes.DECIMAL(12, 2),
    defaultValue: 0
  },
  closing_balance: {
    type: DataTypes.DECIMAL(12, 2),
    defaultValue: 0
  },
  bank_balance: {
    type: DataTypes.DECIMAL(12, 2),
    defaultValue: 0
  },
  mobile_banking_balance: {
    type: DataTypes.DECIMAL(12, 2),
    defaultValue: 0
  }
}, {
  tableName: 'cash_balances',
  timestamps: true
});

module.exports = CashBalance;