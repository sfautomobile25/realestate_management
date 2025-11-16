import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { employeeAPI } from '../../services/api';

export const fetchEmployees = createAsyncThunk(
  'employees/fetchEmployees',
  async () => {
    const response = await employeeAPI.getAll();
    return response.data;
  }
);

export const fetchEmployee = createAsyncThunk(
  'employees/fetchEmployee',
  async (id) => {
    const response = await employeeAPI.getById(id);
    return response.data;
  }
);

export const createEmployee = createAsyncThunk(
  'employees/createEmployee',
  async (employeeData) => {
    const response = await employeeAPI.create(employeeData);
    return response.data;
  }
);

export const updateEmployee = createAsyncThunk(
  'employees/updateEmployee',
  async ({ id, employeeData }) => {
    const response = await employeeAPI.update(id, employeeData);
    return response.data;
  }
);

export const processSalary = createAsyncThunk(
  'employees/processSalary',
  async ({ employeeId, salaryData }) => {
    const response = await employeeAPI.processSalary(employeeId, salaryData);
    return response.data;
  }
);

const employeeSlice = createSlice({
  name: 'employees',
  initialState: {
    items: [],
    currentEmployee: null,
    loading: false,
    error: null
  },
  reducers: {
    setCurrentEmployee: (state, action) => {
      state.currentEmployee = action.payload;
    },
    clearError: (state) => {
      state.error = null;
    }
  },
  extraReducers: (builder) => {
    builder
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
      .addCase(fetchEmployee.fulfilled, (state, action) => {
        state.currentEmployee = action.payload;
      })
      .addCase(createEmployee.fulfilled, (state, action) => {
        state.items.push(action.payload);
      })
      .addCase(updateEmployee.fulfilled, (state, action) => {
        const index = state.items.findIndex(emp => emp.id === action.payload.id);
        if (index !== -1) {
          state.items[index] = action.payload;
        }
        if (state.currentEmployee && state.currentEmployee.id === action.payload.id) {
          state.currentEmployee = action.payload;
        }
      });
  }
});

export const { setCurrentEmployee, clearError } = employeeSlice.actions;
export default employeeSlice.reducer;