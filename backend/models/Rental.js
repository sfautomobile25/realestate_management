const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Rental = sequelize.define('Rental', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  monthly_rent: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false
  },
  security_deposit: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
    defaultValue: 0
  },
  lease_start: {
    type: DataTypes.DATE,
    allowNull: false
  },
  lease_end: {
    type: DataTypes.DATE,
    allowNull: false
  },
  status: {
    type: DataTypes.ENUM('active', 'expired', 'terminated'),
    defaultValue: 'active'
  },
  late_fee_percentage: {
    type: DataTypes.DECIMAL(5, 2),
    defaultValue: 5.00
  },
  grace_period_days: {
    type: DataTypes.INTEGER,
    defaultValue: 5
  }
}, {
  tableName: 'rentals',
  timestamps: true
});

module.exports = Rental;