import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { hrAPI } from '../../services/api';

// Use hrAPI instead of employeeAPI since all employee operations are in hr routes
export const fetchEmployees = createAsyncThunk(
  'employees/fetchEmployees',
  async () => {
    const response = await hrAPI.getEmployees();
    return response.data;
  }
);

export const fetchEmployeeById = createAsyncThunk(
  'employees/fetchEmployeeById',
  async (employeeId) => {
    const response = await hrAPI.getEmployees(); // Note: You might need to add a specific endpoint for single employee
    const employee = response.data.find(emp => emp.id === parseInt(employeeId));
    if (!employee) throw new Error('Employee not found');
    return employee;
  }
);

export const createEmployee = createAsyncThunk(
  'employees/createEmployee',
  async (employeeData) => {
    const response = await hrAPI.createEmployee(employeeData);
    return response.data;
  }
);

export const updateEmployee = createAsyncThunk(
  'employees/updateEmployee',
  async ({ id, employeeData }) => {
    // For now using status update, you might need to add a proper update endpoint
    const response = await hrAPI.updateEmployeeStatus(id, employeeData.status);
    return response.data;
  }
);

export const fetchEmployeeSalaries = createAsyncThunk(
  'employees/fetchEmployeeSalaries',
  async (employeeId) => {
    const response = await hrAPI.getSalaries({ employee_id: employeeId });
    return response.data;
  }
);

const employeeSlice = createSlice({
  name: 'employees',
  initialState: {
    items: [],
    currentEmployee: null,
    employeeSalaries: [],
    loading: false,
    error: null
  },
  reducers: {
    clearEmployeeError: (state) => {
      state.error = null;
    },
    clearCurrentEmployee: (state) => {
      state.currentEmployee = null;
    }
  },
  extraReducers: (builder) => {
    builder
      // Fetch Employees
      .addCase(fetchEmployees.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchEmployees.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload;
      })
      .addCase(fetchEmployees.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message;
      })
      
      // Fetch Employee By ID
      .addCase(fetchEmployeeById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchEmployeeById.fulfilled, (state, action) => {
        state.loading = false;
        state.currentEmployee = action.payload;
      })
      .addCase(fetchEmployeeById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message;
      })
      
      // Create Employee
      .addCase(createEmployee.fulfilled, (state, action) => {
        state.items.push(action.payload);
      })
      
      // Update Employee
      .addCase(updateEmployee.fulfilled, (state, action) => {
        const index = state.items.findIndex(emp => emp.id === action.payload.id);
        if (index !== -1) {
          state.items[index] = action.payload;
        }
        if (state.currentEmployee && state.currentEmployee.id === action.payload.id) {
          state.currentEmployee = action.payload;
        }
      })
      
      // Fetch Employee Salaries
      .addCase(fetchEmployeeSalaries.fulfilled, (state, action) => {
        state.employeeSalaries = action.payload;
      });
  }
});

export const { clearEmployeeError, clearCurrentEmployee } = employeeSlice.actions;
export default employeeSlice.reducer;