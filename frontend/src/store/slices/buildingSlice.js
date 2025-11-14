import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { buildingAPI } from '../../services/api';

export const fetchBuildings = createAsyncThunk(
  'buildings/fetchBuildings',
  async () => {
    const response = await buildingAPI.getAll();
    return response.data;
  }
);

export const fetchBuildingsByProject = createAsyncThunk(
  'buildings/fetchBuildingsByProject',
  async (projectId) => {
    const response = await buildingAPI.getByProject(projectId);
    return response.data;
  }
);

export const createBuilding = createAsyncThunk(
  'buildings/createBuilding',
  async (buildingData) => {
    const response = await buildingAPI.create(buildingData);
    return response.data;
  }
);

export const updateBuilding = createAsyncThunk(
  'buildings/updateBuilding',
  async ({ id, buildingData }) => {
    const response = await buildingAPI.update(id, buildingData);
    return response.data;
  }
);

export const deleteBuilding = createAsyncThunk(
  'buildings/deleteBuilding',
  async (id) => {
    await buildingAPI.delete(id);
    return id;
  }
);

const buildingSlice = createSlice({
  name: 'buildings',
  initialState: {
    items: [],
    loading: false,
    error: null,
    currentBuilding: null
  },
  reducers: {
    setCurrentBuilding: (state, action) => {
      state.currentBuilding = action.payload;
    },
    clearError: (state) => {
      state.error = null;
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchBuildings.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchBuildings.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload;
      })
      .addCase(fetchBuildings.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message;
      })
      .addCase(createBuilding.fulfilled, (state, action) => {
        state.items.push(action.payload);
      })
      .addCase(updateBuilding.fulfilled, (state, action) => {
        const index = state.items.findIndex(building => building.id === action.payload.id);
        if (index !== -1) {
          state.items[index] = action.payload;
        }
      })
      .addCase(deleteBuilding.fulfilled, (state, action) => {
        state.items = state.items.filter(building => building.id !== action.payload);
      });
  }
});

export const { setCurrentBuilding, clearError } = buildingSlice.actions;
export default buildingSlice.reducer;