const { sequelize } = require('../models');

const addHRColumns = async () => {
  try {
    console.log('Adding missing HR columns to database...');
    
    // Add columns to salaries table
    await sequelize.query(`
      ALTER TABLE salaries 
      ADD COLUMN paid_amount DECIMAL(10,2) DEFAULT 0,
      ADD COLUMN remaining_amount DECIMAL(10,2) DEFAULT 0
    `);
    console.log('✅ Added paid_amount and remaining_amount to salaries table');

    // Create salary_payments table
    await sequelize.query(`
      CREATE TABLE IF NOT EXISTS salary_payments (
        id INT PRIMARY KEY AUTO_INCREMENT,
        salary_id INT NOT NULL,
        amount DECIMAL(10,2) NOT NULL,
        payment_date DATETIME DEFAULT CURRENT_TIMESTAMP,
        payment_type ENUM('full', 'installment', 'advance') DEFAULT 'full',
        payment_method ENUM('cash', 'bank_transfer', 'check', 'online') DEFAULT 'cash',
        reference_number VARCHAR(100),
        receipt_number VARCHAR(100) NOT NULL UNIQUE,
        notes TEXT,
        is_advance BOOLEAN DEFAULT FALSE,
        advance_month DATE,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (salary_id) REFERENCES salaries(id) ON DELETE CASCADE
      )
    `);
    console.log('✅ Created salary_payments table');

    // Create attendances table
    await sequelize.query(`
      CREATE TABLE IF NOT EXISTS attendances (
        id INT PRIMARY KEY AUTO_INCREMENT,
        employee_id INT NOT NULL,
        check_in DATETIME NOT NULL,
        check_out DATETIME,
        date DATE NOT NULL,
        total_hours DECIMAL(5,2) DEFAULT 0,
        status ENUM('present', 'absent', 'half_day', 'late') DEFAULT 'present',
        notes TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (employee_id) REFERENCES employees(id) ON DELETE CASCADE
      )
    `);
    console.log('✅ Created attendances table');

    console.log('🎉 All HR tables and columns added successfully!');
  } catch (error) {
    console.error('❌ Error adding HR columns:', error.message);
  }
};

// Run the migration
addHRColumns();