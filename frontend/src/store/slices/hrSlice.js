import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { hrAPI } from '../../services/api';

// Get available users for employee creation
export const fetchAvailableUsers = createAsyncThunk(
  'hr/fetchAvailableUsers',
  async () => {
    const response = await hrAPI.getAvailableUsers();
    return response.data;
  }
);

// Employees
export const fetchEmployees = createAsyncThunk(
  'hr/fetchEmployees',
  async () => {
    const response = await hrAPI.getEmployees();
    return response.data;
  }
);

export const createEmployee = createAsyncThunk(
  'hr/createEmployee',
  async (employeeData) => {
    const response = await hrAPI.createEmployee(employeeData);
    return response.data;
  }
);

export const updateEmployeeStatus = createAsyncThunk(
  'hr/updateEmployeeStatus',
  async ({ id, status }) => {
    const response = await hrAPI.updateEmployeeStatus(id, status);
    return response.data;
  }
);

export const updateEmployeeSalary = createAsyncThunk(
  'hr/updateEmployeeSalary',
  async ({ id, salary }) => {
    const response = await hrAPI.updateEmployeeSalary(id, salary);
    return response.data;
  }
);

// Departments
export const fetchDepartments = createAsyncThunk(
  'hr/fetchDepartments',
  async () => {
    const response = await hrAPI.getDepartments();
    return response.data;
  }
);

export const createDepartment = createAsyncThunk(
  'hr/createDepartment',
  async (departmentData) => {
    const response = await hrAPI.createDepartment(departmentData);
    return response.data;
  }
);

// Salaries
export const fetchSalaries = createAsyncThunk(
  'hr/fetchSalaries',
  async (params = {}) => {
    const response = await hrAPI.getSalaries(params);
    return response.data;
  }
);

export const generateSalaries = createAsyncThunk(
  'hr/generateSalaries',
  async (month) => {
    const response = await hrAPI.generateSalaries(month);
    return response.data;
  }
);

// Salary Payments
export const processSalaryPayment = createAsyncThunk(
  'hr/processSalaryPayment',
  async (paymentData) => {
    const response = await hrAPI.processSalaryPayment(paymentData);
    return response.data;
  }
);

export const fetchSalaryPayments = createAsyncThunk(
  'hr/fetchSalaryPayments',
  async (salaryId) => {
    const response = await hrAPI.getSalaryPayments(salaryId);
    return response.data;
  }
);

export const generateAdvanceSalary = createAsyncThunk(
  'hr/generateAdvanceSalary',
  async (advanceData) => {
    const response = await hrAPI.generateAdvanceSalary(advanceData);
    return response.data;
  }
);

// Attendance
export const fetchAttendance = createAsyncThunk(
  'hr/fetchAttendance',
  async (params = {}) => {
    const response = await hrAPI.getAttendance(params);
    return response.data;
  }
);

export const checkIn = createAsyncThunk(
  'hr/checkIn',
  async (checkInData) => {
    const response = await hrAPI.checkIn(checkInData);
    return response.data;
  }
);

export const checkOut = createAsyncThunk(
  'hr/checkOut',
  async (checkOutData) => {
    const response = await hrAPI.checkOut(checkOutData);
    return response.data;
  }
);

// Today's Attendance
export const fetchTodayAttendance = createAsyncThunk(
  'hr/fetchTodayAttendance',
  async () => {
    const response = await hrAPI.getTodayAttendance();
    return response.data;
  }
);

const hrSlice = createSlice({
  name: 'hr',
  initialState: {
    users: {
      items: [],
      loading: false,
      error: null
    },
    employees: {
      items: [],
      loading: false,
      error: null
    },
    departments: {
      items: [],
      loading: false,
      error: null
    },
    salaries: {
      items: [],
      loading: false,
      error: null
    },
    attendance: {
      items: [],
      loading: false,
      error: null
    },
    todayAttendance: {
      items: [],
      loading: false,
      error: null
    },
    salaryPayments: {
      items: [],
      loading: false,
      error: null
    },
    currentReceipt: null
  },
  reducers: {
    clearHrError: (state) => {
      state.users.error = null;
      state.employees.error = null;
      state.departments.error = null;
      state.salaries.error = null;
      state.attendance.error = null;
      state.todayAttendance.error = null;
      state.salaryPayments.error = null;
    },
    clearReceipt: (state) => {
      state.currentReceipt = null;
    },
    clearSalaryPayments: (state) => {
      state.salaryPayments.items = [];
    }
  },
  extraReducers: (builder) => {
    builder
      // Available Users
      .addCase(fetchAvailableUsers.pending, (state) => {
        state.users.loading = true;
        state.users.error = null;
      })
      .addCase(fetchAvailableUsers.fulfilled, (state, action) => {
        state.users.loading = false;
        state.users.items = action.payload;
      })
      .addCase(fetchAvailableUsers.rejected, (state, action) => {
        state.users.loading = false;
        state.users.error = action.error.message;
      })
      
      // Employees
      .addCase(fetchEmployees.pending, (state) => {
        state.employees.loading = true;
        state.employees.error = null;
      })
      .addCase(fetchEmployees.fulfilled, (state, action) => {
        state.employees.loading = false;
        state.employees.items = action.payload;
      })
      .addCase(fetchEmployees.rejected, (state, action) => {
        state.employees.loading = false;
        state.employees.error = action.error.message;
      })
      .addCase(createEmployee.fulfilled, (state, action) => {
        state.employees.items.push(action.payload);
        state.users.items = state.users.items.filter(user => user.id !== action.payload.user_id);
      })
      .addCase(updateEmployeeStatus.fulfilled, (state, action) => {
        const index = state.employees.items.findIndex(emp => emp.id === action.payload.id);
        if (index !== -1) {
          state.employees.items[index] = action.payload;
        }
      })
      .addCase(updateEmployeeSalary.fulfilled, (state, action) => {
        const index = state.employees.items.findIndex(emp => emp.id === action.payload.id);
        if (index !== -1) {
          state.employees.items[index] = action.payload;
        }
      })
      
      // Departments
      .addCase(fetchDepartments.pending, (state) => {
        state.departments.loading = true;
        state.departments.error = null;
      })
      .addCase(fetchDepartments.fulfilled, (state, action) => {
        state.departments.loading = false;
        state.departments.items = action.payload;
      })
      .addCase(fetchDepartments.rejected, (state, action) => {
        state.departments.loading = false;
        state.departments.error = action.error.message;
      })
      .addCase(createDepartment.fulfilled, (state, action) => {
        state.departments.items.push(action.payload);
      })
      
      // Salaries
      .addCase(fetchSalaries.pending, (state) => {
        state.salaries.loading = true;
        state.salaries.error = null;
      })
      .addCase(fetchSalaries.fulfilled, (state, action) => {
        state.salaries.loading = false;
        state.salaries.items = action.payload;
      })
      .addCase(fetchSalaries.rejected, (state, action) => {
        state.salaries.loading = false;
        state.salaries.error = action.error.message;
      })
      .addCase(generateSalaries.fulfilled, (state, action) => {
        state.salaries.items = [...state.salaries.items, ...action.payload];
      })
      
      // Salary Payments
      .addCase(fetchSalaryPayments.pending, (state) => {
        state.salaryPayments.loading = true;
        state.salaryPayments.error = null;
      })
      .addCase(fetchSalaryPayments.fulfilled, (state, action) => {
        state.salaryPayments.loading = false;
        state.salaryPayments.items = action.payload;
      })
      .addCase(fetchSalaryPayments.rejected, (state, action) => {
        state.salaryPayments.loading = false;
        state.salaryPayments.error = action.error.message;
      })
      .addCase(processSalaryPayment.fulfilled, (state, action) => {
        state.currentReceipt = action.payload;
        const salaryIndex = state.salaries.items.findIndex(s => s.id === action.payload.payment.salary_id);
        if (salaryIndex !== -1) {
          state.salaries.items[salaryIndex].status = action.payload.new_salary_status;
          state.salaries.items[salaryIndex].paid_amount = action.payload.payment.Salary.paid_amount;
          state.salaries.items[salaryIndex].remaining_amount = action.payload.remaining_amount;
        }
      })
      .addCase(generateAdvanceSalary.fulfilled, (state, action) => {
        state.currentReceipt = action.payload;
      })
      
      // Attendance
      .addCase(fetchAttendance.pending, (state) => {
        state.attendance.loading = true;
        state.attendance.error = null;
      })
      .addCase(fetchAttendance.fulfilled, (state, action) => {
        state.attendance.loading = false;
        state.attendance.items = action.payload;
      })
      .addCase(fetchAttendance.rejected, (state, action) => {
        state.attendance.loading = false;
        state.attendance.error = action.error.message;
      })
      
      // Today's Attendance
      .addCase(fetchTodayAttendance.pending, (state) => {
        state.todayAttendance.loading = true;
        state.todayAttendance.error = null;
      })
      .addCase(fetchTodayAttendance.fulfilled, (state, action) => {
        state.todayAttendance.loading = false;
        state.todayAttendance.items = action.payload;
      })
      .addCase(fetchTodayAttendance.rejected, (state, action) => {
        state.todayAttendance.loading = false;
        state.todayAttendance.error = action.error.message;
      })
      
      // Check In/Out
      .addCase(checkIn.fulfilled, (state, action) => {
        state.attendance.items.unshift(action.payload);
        state.todayAttendance.items.unshift(action.payload);
      })
      .addCase(checkOut.fulfilled, (state, action) => {
        const index = state.attendance.items.findIndex(att => att.id === action.payload.id);
        if (index !== -1) {
          state.attendance.items[index] = action.payload;
        }
        const todayIndex = state.todayAttendance.items.findIndex(att => att.id === action.payload.id);
        if (todayIndex !== -1) {
          state.todayAttendance.items[todayIndex] = action.payload;
        }
      });
  }
});

export const { clearHrError, clearReceipt, clearSalaryPayments } = hrSlice.actions;
export default hrSlice.reducer;