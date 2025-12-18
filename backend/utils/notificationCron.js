const cron = require('node-cron');
const { Rental, Customer, Unit, Building } = require('../models');
const { Op } = require('sequelize');

// Run every day at 9 AM
cron.schedule('0 9 * * *', async () => {
  console.log('Running notification cron job...');
  
  try {
    const today = new Date();
    const threeDaysLater = new Date(today);
    threeDaysLater.setDate(today.getDate() + 3);
    
    // Find rentals due in next 3 days
    const dueRentals = await Rental.findAll({
      where: {
        next_payment_date: {
          [Op.between]: [today, threeDaysLater]
        },
        status: 'active'
      },
      include: [
        {
          model: Customer,
          as: 'customer',
          include: [{ model: User, as: 'user' }]
        },
        {
          model: Unit,
          as: 'unit',
          include: [{ model: Building, as: 'building' }]
        }
      ]
    });
    
    for (const rental of dueRentals) {
      if (rental.customer?.user) {
        await Notification.create({
          user_id: rental.customer.user.id,
          type: 'rent_reminder',
          title: 'Rent Due Reminder',
          message: `Your rent of ৳${rental.monthly_rent} for ${rental.unit.unit_number} in ${rental.unit.building.name} is due on ${rental.next_payment_date.toDateString()}`,
          status: 'unread',
          priority: 'high',
          amount: rental.monthly_rent,
          due_date: rental.next_payment_date,
          metadata: {
            rental_id: rental.id,
            unit_id: rental.unit.id,
            building_id: rental.unit.building.id
          },
          action_url: `/rentals/${rental.id}/pay`
        });
      }
    }
    
    console.log(`Created ${dueRentals.length} rent reminder notifications`);
  } catch (error) {
    console.error('Error in notification cron job:', error);
  }
});

module.exports = cron;