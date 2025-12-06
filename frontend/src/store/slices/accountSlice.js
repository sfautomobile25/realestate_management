import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { accountAPI } from '../../services/api';

export const fetchAccountBalance = createAsyncThunk(
  'accounts/fetchBalance',
  async (date = null, { rejectWithValue }) => {
    try {
      const params = date ? { date } : {};
      const response = await accountAPI.getBalance(params);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message);
    }
  }
);

export const createAccountTransaction = createAsyncThunk(
  'accounts/createTransaction',
  async (transactionData, { rejectWithValue }) => {
    try {
      const response = await accountAPI.createTransaction(transactionData);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message);
    }
  }
);

export const fetchMonthlySummary = createAsyncThunk(
  'accounts/fetchMonthlySummary',
  async (params = {}, { rejectWithValue }) => {
    try {
      const response = await accountAPI.getMonthlySummary(params);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message);
    }
  }
);

const accountSlice = createSlice({
  name: 'accounts',
  initialState: {
    balance: null,
    todayTransactions: [],
    incomeCategories: {},
    expenseCategories: {},
    monthlySummary: null,
    loading: false,
    error: null
  },
  reducers: {
    clearAccountError: (state) => {
      state.error = null;
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchAccountBalance.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchAccountBalance.fulfilled, (state, action) => {
        state.loading = false;
        state.balance = action.payload.balance;
        state.todayTransactions = action.payload.todayTransactions;
        state.incomeCategories = action.payload.incomeCategories;
        state.expenseCategories = action.payload.expenseCategories;
      })
      .addCase(fetchAccountBalance.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(createAccountTransaction.fulfilled, (state, action) => {
        state.todayTransactions.unshift(action.payload);
      })
      .addCase(fetchMonthlySummary.fulfilled, (state, action) => {
        state.monthlySummary = action.payload;
      });
  }
});

export const { clearAccountError } = accountSlice.actions;
export default accountSlice.reducer;