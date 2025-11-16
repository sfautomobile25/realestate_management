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

export const processSalary = createAsyncThunk(
  'hr/processSalary',
  async (salaryData) => {
    const response = await hrAPI.processSalary(salaryData);
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
    }
  },
  reducers: {
    clearHrError: (state) => {
      state.users.error = null;
      state.employees.error = null;
      state.departments.error = null;
      state.salaries.error = null;
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
        // Remove the user from available users list
        state.users.items = state.users.items.filter(user => user.id !== action.payload.user_id);
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
      });
  }
});

export const { clearHrError } = hrSlice.actions;
export default hrSlice.reducer;