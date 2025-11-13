const sequelize = require('../config/database');
const User = require('./User');
const Project = require('./Project');
const Building = require('./Building');
const Unit = require('./Unit');

// Define associations
Project.hasMany(Building, { 
  foreignKey: 'project_id',
  as: 'Buildings'
});
Building.belongsTo(Project, { 
  foreignKey: 'project_id',
  as: 'Project'
});

Building.hasMany(Unit, { 
  foreignKey: 'building_id',
  as: 'Units'
});
Unit.belongsTo(Building, { 
  foreignKey: 'building_id',
  as: 'Building'
});

// Sync database and create default admin
const syncDatabase = async () => {
  try {
    await sequelize.sync({ force: false });
    console.log('✅ Database synced successfully');
    
    // Create default admin user if no users exist
    const userCount = await User.count();
    if (userCount === 0) {
      await User.create({
        email: 'admin@realestate.com',
        password: 'admin123',
        first_name: 'Admin',
        last_name: 'User',
        role: 'admin',
        phone: '+1234567890'
      });
      console.log('✅ Default admin user created');
      console.log('📧 Email: admin@realestate.com');
      console.log('🔑 Password: admin123');
    }
  } catch (error) {
    console.error('❌ Database sync failed:', error.message);
  }
};

syncDatabase();

module.exports = {
  sequelize,
  User,
  Project,
  Building,
  Unit
};