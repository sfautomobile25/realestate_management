import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { rentalAPI } from '../../services/api';

export const fetchRentals = createAsyncThunk(
  'rentals/fetchRentals',
  async () => {
    const response = await rentalAPI.getAll();
    return response.data;
  }
);

export const createRental = createAsyncThunk(
  'rentals/createRental',
  async (rentalData) => {
    const response = await rentalAPI.create(rentalData);
    return response.data;
  }
);

export const generateMonthlyBills = createAsyncThunk(
  'rentals/generateMonthlyBills',
  async ({ rentalId, month }) => {
    const response = await rentalAPI.generateBills(rentalId, month);
    return response.data;
  }
);

export const getFinancialSummary = createAsyncThunk(
  'rentals/getFinancialSummary',
  async (rentalId) => {
    const response = await rentalAPI.getFinancialSummary(rentalId);
    return response.data;
  }
);

const rentalSlice = createSlice({
  name: 'rentals',
  initialState: {
    items: [],
    loading: false,
    error: null,
    currentRental: null,
    financialSummary: null
  },
  reducers: {
    setCurrentRental: (state, action) => {
      state.currentRental = action.payload;
    },
    clearError: (state) => {
      state.error = null;
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchRentals.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchRentals.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload;
      })
      .addCase(fetchRentals.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message;
      })
      .addCase(createRental.fulfilled, (state, action) => {
        state.items.push(action.payload);
      })
      .addCase(getFinancialSummary.fulfilled, (state, action) => {
        state.financialSummary = action.payload;
      });
  }
});

export const { setCurrentRental, clearError } = rentalSlice.actions;
export default rentalSlice.reducer;