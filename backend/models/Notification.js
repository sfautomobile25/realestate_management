const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Notification = sequelize.define('Notification', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  title: {
    type: DataTypes.STRING(255),
    allowNull: false
  },
  message: {
    type: DataTypes.TEXT,
    allowNull: false
  },
  type: {
    type: DataTypes.ENUM('payment_approval', 'salary_payment', 'rent_payment', 'expense_approval', 'system'),
    defaultValue: 'payment_approval'
  },
  status: {
    type: DataTypes.ENUM('pending', 'approved', 'rejected', 'read'),
    defaultValue: 'pending'
  },
  reference_id: {
    type: DataTypes.INTEGER,
    allowNull: true // Payment ID, Salary ID, etc.
  },
  reference_type: {
    type: DataTypes.STRING(50),
    allowNull: true // 'payment', 'salary', 'rent', etc.
  },
  amount: {
    type: DataTypes.DECIMAL(12, 2),
    allowNull: true
  },
  sender_id: {
    type: DataTypes.INTEGER,
    allowNull: true
  },
  receiver_id: {
    type: DataTypes.INTEGER,
    allowNull: true
  },
  action_url: {
    type: DataTypes.STRING(500),
    allowNull: true
  },
  metadata: {
    type: DataTypes.JSON,
    allowNull: true
  }
}, {
  tableName: 'notifications',
  timestamps: true
});

module.exports = Notification;