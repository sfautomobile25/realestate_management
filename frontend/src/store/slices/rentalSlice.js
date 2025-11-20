import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { rentalAPI } from '../../services/api';

export const fetchRentals = createAsyncThunk(
  'rentals/fetchRentals',
  async (_, { rejectWithValue }) => {
    try {
      const response = await rentalAPI.getAll();
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message);
    }
  }
);



export const updateRental = createAsyncThunk(
  'rentals/updateRental',
  async ({ id, rentalData }) => {
    const response = await rentalAPI.update(id, rentalData);
    return response.data;
  }
);

export const deleteRental = createAsyncThunk(
  'rentals/deleteRental',
  async (id) => {
    await rentalAPI.delete(id);
    return id;
  }
);


export const createRental = createAsyncThunk(
  'rentals/createRental',
  async (rentalData, { rejectWithValue }) => {
    try {
      const response = await rentalAPI.create(rentalData);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message);
    }
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
      .addCase(createRental.rejected, (state, action) => {
      state.error = action.payload;
    })
      .addCase(getFinancialSummary.fulfilled, (state, action) => {
        state.financialSummary = action.payload;
      })
      .addCase(updateRental.fulfilled, (state, action) => {
      const index = state.items.findIndex(item => item.id === action.payload.id);
      if (index !== -1) {
        state.items[index] = action.payload;
      }
    })
    .addCase(deleteRental.fulfilled, (state, action) => {
      state.items = state.items.filter(item => item.id !== action.payload);
    })
    .addCase(updateRental.rejected, (state, action) => {
      state.error = action.error.message;
    })
    .addCase(deleteRental.rejected, (state, action) => {
      state.error = action.error.message;
    });
  }
});

export const { setCurrentRental, clearError } = rentalSlice.actions;
export default rentalSlice.reducer;