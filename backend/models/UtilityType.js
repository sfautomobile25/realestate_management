const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const UtilityType = sequelize.define('UtilityType', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  name: {
    type: DataTypes.STRING(100),
    allowNull: false,
    unique: true
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  default_amount: {
    type: DataTypes.DECIMAL(10, 2),
    defaultValue: 0
  },
  calculation_type: {
    type: DataTypes.ENUM('fixed', 'per_sqft', 'percentage_of_rent'),
    defaultValue: 'fixed'
  },
  is_active: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  }
}, {
  tableName: 'utility_types',
  timestamps: true
});

module.exports = UtilityType;