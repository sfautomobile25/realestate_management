const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Attendance = sequelize.define('Attendance', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  date: {
    type: DataTypes.DATE,
    allowNull: false
  },
  check_in: {
    type: DataTypes.TIME,
    allowNull: true
  },
  check_out: {
    type: DataTypes.TIME,
    allowNull: true
  },
  status: {
    type: DataTypes.ENUM('present', 'absent', 'late', 'half_day', 'holiday'),
    defaultValue: 'present'
  },
  hours_worked: {
    type: DataTypes.DECIMAL(4, 2),
    defaultValue: 0
  },
  overtime_hours: {
    type: DataTypes.DECIMAL(4, 2),
    defaultValue: 0
  },
  notes: {
    type: DataTypes.TEXT,
    allowNull: true
  }
}, {
  tableName: 'attendance',
  timestamps: true
});

module.exports = Attendance;