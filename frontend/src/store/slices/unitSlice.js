import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { unitAPI } from '../../services/api';

export const fetchUnits = createAsyncThunk(
  'units/fetchUnits',
  async () => {
    const response = await unitAPI.getAll();
    return response.data;
  }
);

export const createUnit = createAsyncThunk(
  'units/createUnit',
  async (unitData) => {
    const response = await unitAPI.create(unitData);
    return response.data;
  }
);

export const updateUnit = createAsyncThunk(
  'units/updateUnit',
  async ({ id, unitData }) => {
    const response = await unitAPI.update(id, unitData);
    return response.data;
  }
);

export const deleteUnit = createAsyncThunk(
  'units/deleteUnit',
  async (id) => {
    await unitAPI.delete(id);
    return id;
  }
);

const unitSlice = createSlice({
  name: 'units',
  initialState: {
    items: [],
    loading: false,
    error: null,
    currentUnit: null
  },
  reducers: {
    setCurrentUnit: (state, action) => {
      state.currentUnit = action.payload;
    },
    clearError: (state) => {
      state.error = null;
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchUnits.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchUnits.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload;
      })
      .addCase(fetchUnits.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message;
      })
      .addCase(createUnit.fulfilled, (state, action) => {
        state.items.push(action.payload);
      })
      .addCase(updateUnit.fulfilled, (state, action) => {
        const index = state.items.findIndex(unit => unit.id === action.payload.id);
        if (index !== -1) {
          state.items[index] = action.payload;
        }
      })
      .addCase(deleteUnit.fulfilled, (state, action) => {
        state.items = state.items.filter(unit => unit.id !== action.payload);
      });
  }
});

export const { setCurrentUnit, clearError } = unitSlice.actions;
export default unitSlice.reducer;