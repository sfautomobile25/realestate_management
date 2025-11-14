import { configureStore } from '@reduxjs/toolkit';
import authReducer from './slices/authSlice';
import projectReducer from './slices/projectSlice';
import buildingReducer from './slices/buildingSlice';
import unitReducer from './slices/unitSlice';
import customerReducer from './slices/customerSlice';
import rentalReducer from './slices/rentalSlice';

const store = configureStore({
  reducer: {
    auth: authReducer,
    projects: projectReducer,
    buildings: buildingReducer,
    units: unitReducer,
    customers: customerReducer,
    rentals: rentalReducer,
  },
});

export default store;