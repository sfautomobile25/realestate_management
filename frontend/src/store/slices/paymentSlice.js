import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { paymentAPI } from '../../services/api';

export const processPayment = createAsyncThunk(
  'payments/processPayment',
  async (paymentData, { rejectWithValue }) => {
    try {
      const response = await paymentAPI.create(paymentData);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message);
    }
  }
);

export const getPaymentReceipt = createAsyncThunk(
  'payments/getReceipt',
  async (receiptNumber, { rejectWithValue }) => {
    try {
      const response = await paymentAPI.getReceipt(receiptNumber);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message);
    }
  }
);

const paymentSlice = createSlice({
  name: 'payments',
  initialState: {
    items: [],
    currentPayment: null,
    loading: false,
    error: null,
    receipt: null
  },
  reducers: {
    clearPayment: (state) => {
      state.currentPayment = null;
      state.receipt = null;
    },
    clearError: (state) => {
      state.error = null;
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(processPayment.fulfilled, (state, action) => {
        state.currentPayment = action.payload.payment;
        state.receipt = action.payload;
      })
      .addCase(getPaymentReceipt.fulfilled, (state, action) => {
        state.receipt = action.payload;
      });
  }
});

export const { clearPayment, clearError } = paymentSlice.actions;
export default paymentSlice.reducer;