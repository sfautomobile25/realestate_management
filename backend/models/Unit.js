const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Unit = sequelize.define('Unit', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  unit_number: {
    type: DataTypes.STRING(50),
    allowNull: false
  },
  type: {
    type: DataTypes.ENUM('flat', 'shop', 'office', 'commercial'),
    allowNull: false,
    defaultValue: 'flat'
  },
  size_sqft: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: true
  },
  bedrooms: {
    type: DataTypes.INTEGER,
    allowNull: true
  },
  bathrooms: {
    type: DataTypes.INTEGER,
    allowNull: true
  },
  status: {
    type: DataTypes.ENUM('available', 'sold', 'rented', 'maintenance'),
    defaultValue: 'available'
  },
  price: {
    type: DataTypes.DECIMAL(15, 2),
    allowNull: true
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true
  }
}, {
  tableName: 'units',
  timestamps: true
});

module.exports = Unit;