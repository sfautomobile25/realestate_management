import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

console.log('API Base URL:', API_BASE_URL);

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000,
});

// Request interceptor
api.interceptors.request.use(
  (config) => {
    console.log(`Making ${config.method?.toUpperCase()} request to: ${config.url}`);
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    console.error('Request error:', error);
    return Promise.reject(error);
  }
);

// Response interceptor
api.interceptors.response.use(
  (response) => {
    console.log(`Response received from: ${response.config.url}`, response.status);
    return response;
  },
  (error) => {
    console.error('API Error:', error.response?.data || error.message);
    
    if (error.code === 'ECONNREFUSED') {
      console.error('Backend server is not running!');
      alert('Cannot connect to server. Please make sure the backend is running on port 5000.');
    }
    
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    
    return Promise.reject(error);
  }
);

// Test connection function
export const testConnection = async () => {
  try {
    const response = await api.get('/health');
    return response.data;
  } catch (error) {
    throw new Error('Cannot connect to backend server');
  }
};

export const authAPI = {
  login: (credentials) => api.post('/auth/login', credentials),
  register: (userData) => api.post('/auth/register', userData),
};

export const hrAPI = {
  // Users for employee creation
  getAvailableUsers: () => api.get('/hr/users'),
  
  // Employees
  getEmployees: () => api.get('/hr/employees'),
  createEmployee: (employeeData) => api.post('/hr/employees', employeeData),
  updateEmployeeStatus: (id, status) => api.put(`/hr/employees/${id}/status`, { status }),
  updateEmployeeSalary: (id, salary) => api.put(`/hr/employees/${id}/salary`, { salary }),
  
  // Departments
  getDepartments: () => api.get('/hr/departments'),
  createDepartment: (departmentData) => api.post('/hr/departments', departmentData),
  
  // Salaries
  getSalaries: (params = {}) => api.get('/hr/salaries', { params }),
  generateSalaries: (month) => api.post('/hr/salaries/generate', { month }),
  
  // Salary Payments - FIXED ENDPOINTS
  processSalaryPayment: (paymentData) => api.post('/hr/salaries/pay', paymentData),
  getSalaryPayments: (salaryId) => api.get(`/hr/salaries/${salaryId}/payments`),
  generateAdvanceSalary: (advanceData) => api.post('/hr/salaries/advance', advanceData),
  
  // Attendance
  getAttendance: (params = {}) => api.get('/hr/attendance', { params }),
  getTodayAttendance: () => api.get('/hr/attendance/today'),
  checkIn: (data) => api.post('/hr/attendance/checkin', data),
  checkOut: (data) => api.post('/hr/attendance/checkout', data),
};

// ADD THESE MISSING EXPORTS
export const employeeAPI = {
  getAll: () => api.get('/hr/employees'),
  getById: (id) => api.get(`/hr/employees/${id}`),
  create: (employeeData) => api.post('/hr/employees', employeeData),
  update: (id, employeeData) => api.put(`/hr/employees/${id}`, employeeData),
  getSalaries: (id) => api.get(`/hr/employees/${id}/salaries`),
  processSalary: (employeeId, salaryData) => api.post(`/hr/employees/${employeeId}/process-salary`, salaryData),
};

export const salaryAPI = {
  getAll: (params = {}) => api.get('/hr/salaries', { params }),
  markAsPaid: (id, paymentData) => api.put(`/hr/salaries/${id}/pay`, paymentData),
  getSummary: (month) => api.get('/hr/salaries/summary', { params: { month } }),
};

export const departmentAPI = {
  getAll: () => api.get('/hr/departments'),
  create: (departmentData) => api.post('/hr/departments', departmentData),
  update: (id, departmentData) => api.put(`/hr/departments/${id}`, departmentData),
};

export const projectAPI = {
  getAll: () => api.get('/projects'),
  getById: (id) => api.get(`/projects/${id}`),
  create: (projectData) => api.post('/projects', projectData),
  update: (id, projectData) => api.put(`/projects/${id}`, projectData),
  delete: (id) => api.delete(`/projects/${id}`),
};

export const unitAPI = {
  getAll: () => api.get('/units'),
  getById: (id) => api.get(`/units/${id}`),
  create: (unitData) => api.post('/units', unitData),
  update: (id, unitData) => api.put(`/units/${id}`, unitData),
  delete: (id) => api.delete(`/units/${id}`),
};

export const buildingAPI = {
  getAll: () => api.get('/buildings'),
  getByProject: (projectId) => api.get(`/buildings/project/${projectId}`),
  getById: (id) => api.get(`/buildings/${id}`),
  create: (buildingData) => api.post('/buildings', buildingData),
  update: (id, buildingData) => api.put(`/buildings/${id}`, buildingData),
  delete: (id) => api.delete(`/buildings/${id}`),
};

export const customerAPI = {
  getAll: () => api.get('/customers'),
  getById: (id) => api.get(`/customers/${id}`),
  create: (customerData) => api.post('/customers', customerData),
  update: (id, customerData) => api.put(`/customers/${id}`, customerData),
};

export const rentalAPI = {
  getAll: () => api.get('/rentals'),
  create: (rentalData) => api.post('/rentals', rentalData),
  generateBills: (rentalId, month) => api.post(`/rentals/${rentalId}/generate-bills`, { month }),
  getFinancialSummary: (rentalId) => api.get(`/rentals/${rentalId}/financial-summary`),
  update: (id, rentalData) => api.put(`/rentals/${id}`, rentalData),
  delete: (id) => api.delete(`/rentals/${id}`)
};

export const paymentAPI = {
  create: (paymentData) => api.post('/payments', paymentData)
};

export const utilityAPI = {
  // Utility Types
  getUtilityTypes: () => api.get('/utilities/types'),
  createUtilityType: (typeData) => api.post('/utilities/types', typeData),
  updateUtilityType: (id, typeData) => api.put(`/utilities/types/${id}`, typeData),
  deleteUtilityType: (id) => api.delete(`/utilities/types/${id}`),
  
  // Utility Bills
  getRentalBills: (rentalId) => api.get(`/utilities/bills/${rentalId}`)
};

export const notificationAPI = {
  getAll: (params = {}) => api.get('/notifications', { params }),
  getUnreadCount: () => api.get('/notifications/unread-count'),
  markAsRead: (id) => api.put(`/notifications/${id}/read`),
  approvePayment: (id) => api.put(`/notifications/${id}/approve`),
  rejectPayment: (id) => api.put(`/notifications/${id}/reject`),
  markAllAsRead: () => api.put('/notifications/mark-all-read'),
  createPaymentApproval: (data) => api.post('/notifications/payment-approval', data)
};

export const accountAPI = {
  getBalance: (params = {}) => api.get('/accounts/balance', { params }),
  createTransaction: (transactionData) => api.post('/accounts', transactionData),
  getVoucher: (voucherNumber) => api.get(`/accounts/voucher/${voucherNumber}`),
  
  // MONTHLY SUMMARY
  getMonthlySummary: (params = {}) => api.get('/accounts/monthly-summary', { params }),
  
  getAllTransactions: (params = {}) => api.get('/accounts', { params }),
  
  downloadCreditPDF: (params = {}) => api.get('/accounts/download/credit', { 
    params,
    responseType: 'blob'
  }),
  
  downloadDebitPDF: (params = {}) => api.get('/accounts/download/debit', { 
    params,
    responseType: 'blob'
  }),
  
  getYearlySummary: (year) => api.get(`/accounts/yearly-summary/${year}`),
  
  downloadYearlyExcel: (year) => api.get(`/accounts/download/yearly/${year}/excel`, {
    responseType: 'blob'
  }),
  
  downloadYearlyPDF: (year) => api.get(`/accounts/download/yearly/${year}/pdf`, {
    responseType: 'blob'
  }),
  
  // FIXED: Use the correct endpoint or create a client-side Excel generation
  downloadMonthlyExcel: (params) => {
    // Option 1: Try your existing endpoint pattern
    return api.get('/accounts/download/yearly-excel', { 
      params: { ...params, reportType: 'monthly' },
      responseType: 'blob'
    });
  },
  
  // Alternative: Client-side Excel generation function
  generateMonthlyExcel: (monthlyData) => {
    // This would generate Excel on the client side
    return generateExcelClientSide(monthlyData);
  }
};

// Client-side Excel generation function (as fallback)
const generateExcelClientSide = (monthlyData) => {
  return new Promise((resolve) => {
    // Import ExcelJS dynamically
    import('exceljs').then((ExcelJS) => {
      const workbook = new ExcelJS.Workbook();
      const worksheet = workbook.addWorksheet('Monthly Summary');
      
      // Add headers
      worksheet.addRow(['No.', 'Monthly Income', 'BDT', 'No.', 'Monthly Expense', 'BDT']);
      
      // Add data rows
      const maxRows = Math.max(
        monthlyData.incomeItems.length,
        monthlyData.expenseItems.length
      );
      
      for (let i = 0; i < maxRows; i++) {
        const incomeItem = monthlyData.incomeItems[i];
        const expenseItem = monthlyData.expenseItems[i];
        
        worksheet.addRow([
          incomeItem ? incomeItem.no : '',
          incomeItem ? incomeItem.description : '',
          incomeItem ? incomeItem.amount : '',
          expenseItem ? expenseItem.no : '',
          expenseItem ? expenseItem.description : '',
          expenseItem ? expenseItem.amount : ''
        ]);
      }
      
      // Add totals
      worksheet.addRow(['', 'TOTAL INCOME:', monthlyData.totalIncome, '', 'TOTAL EXPENSE:', monthlyData.totalExpense]);
      
      // Add net balance
      worksheet.addRow(['', '', '', '', 'NET BALANCE:', monthlyData.netBalance]);
      worksheet.addRow(['', '', '', '', 'Formula:', `=${monthlyData.totalIncome} - ${monthlyData.totalExpense} = ${monthlyData.netBalance} BDT`]);
      
      // Generate blob
      workbook.xlsx.writeBuffer().then((buffer) => {
        resolve({
          data: buffer,
          config: { responseType: 'blob' }
        });
      });
    });
  });
};

export default api;