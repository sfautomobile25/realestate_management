import { accountAPI, notificationAPI } from '../services/api';

export const createPaymentApprovalNotification = async (paymentData) => {
  try {
    const response = await notificationAPI.createPaymentApproval(paymentData);
    return response.data;
  } catch (error) {
    console.error('Error creating payment approval:', error);
    throw error;
  }
};

export const createRentReminder = async (rentalId, customerId) => {
  try {
    // This would be called from backend cron job
    console.log(`Creating rent reminder for rental ${rentalId}`);
  } catch (error) {
    console.error('Error creating rent reminder:', error);
  }
};

export const createUtilityBillNotification = async (billData) => {
  try {
    // Create notification for customer about new utility bill
    console.log('Creating utility bill notification:', billData);
  } catch (error) {
    console.error('Error creating utility bill notification:', error);
  }
};

export const createMaintenanceRequestNotification = async (requestData) => {
  try {
    // Create notification for maintenance team
    console.log('Creating maintenance request notification:', requestData);
  } catch (error) {
    console.error('Error creating maintenance notification:', error);
  }
};

export const createLowBalanceAlert = async (balance) => {
  try {
    if (balance < 50000) { // Threshold
      // Create notification for managers
      console.log('Creating low balance alert:', balance);
    }
  } catch (error) {
    console.error('Error creating balance alert:', error);
  }
};