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
  async ({ year, month }, { rejectWithValue }) => {
    try {
      console.log('Fetching monthly summary for:', { year, month });
      
      // Use the correct API method
      const response = await accountAPI.getMonthlySummary({ 
        year, 
        month: month + 1  // Add 1 because month is 0-indexed in JS but 1-indexed in backend
      });
      
      console.log('Monthly summary response:', response.data);
      return response.data;
      
    } catch (error) {
      console.error('Error fetching monthly summary:', error);
      return rejectWithValue(error.response?.data?.message || error.message);
    }
  }
);

export const downloadMonthlyExcel = createAsyncThunk(
  'accounts/downloadMonthlyExcel',
  async ({ year, month }, { rejectWithValue }) => {
    try {
      console.log('Downloading monthly excel for:', { year, month });
      
      const response = await accountAPI.downloadMonthlyExcel({ 
        year, 
        month: month + 1  // Add 1 because month is 0-indexed
      });
      
      return response.data;
      
    } catch (error) {
      console.error('Error downloading monthly excel:', error);
      return rejectWithValue(error.response?.data?.message || error.message);
    }
  }
);

export const setOpeningBalance = createAsyncThunk(
  'accounts/setOpeningBalance',
  async (balanceData, { rejectWithValue }) => {
    try {
      const response = await accountAPI.setOpeningBalance(balanceData);
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
    
    .addCase(fetchMonthlySummary.pending, (state) => {
      state.loading = true;
      state.error = null;
    })
    .addCase(fetchMonthlySummary.fulfilled, (state, action) => {
      state.loading = false;
      state.monthlySummary = action.payload;
      state.error = null;
    })
    .addCase(fetchMonthlySummary.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload;
      state.monthlySummary = null;
    })
    
    .addCase(createAccountTransaction.fulfilled, (state, action) => {
      state.todayTransactions.unshift(action.payload.transaction || action.payload);
    })
    
    .addCase(setOpeningBalance.fulfilled, (state, action) => {
      state.balance = action.payload;
      state.error = null;
    })
    .addCase(setOpeningBalance.rejected, (state, action) => {
      state.error = action.payload || 'Failed to set opening balance';
    });
}
});

export const downloadCreditPDF = createAsyncThunk(
  'accounts/downloadCreditPDF',
  async (params = {}, { rejectWithValue }) => {
    try {
      const response = await accountAPI.downloadCreditPDF(params);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message);
    }
  }
);

export const downloadDebitPDF = createAsyncThunk(
  'accounts/downloadDebitPDF',
  async (params = {}, { rejectWithValue }) => {
    try {
      const response = await accountAPI.downloadDebitPDF(params);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message);
    }
  }
);

export const fetchYearlySummary = createAsyncThunk(
  'accounts/fetchYearlySummary',
  async (year, { rejectWithValue }) => {
    try {
      const response = await accountAPI.getYearlySummary(year);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message);
    }
  }
);

export const downloadYearlyExcel = createAsyncThunk(
  'accounts/downloadYearlyExcel',
  async (year, { rejectWithValue }) => {
    try {
      const response = await accountAPI.downloadYearlyExcel(year);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message);
    }
  }
);

export const { clearAccountError } = accountSlice.actions;
export default accountSlice.reducer;