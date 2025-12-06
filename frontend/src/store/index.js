import { configureStore } from '@reduxjs/toolkit';
import authReducer from './slices/authSlice';
import projectReducer from './slices/projectSlice';
import buildingReducer from './slices/buildingSlice';
import unitReducer from './slices/unitSlice';
import customerReducer from './slices/customerSlice';
import rentalReducer from './slices/rentalSlice';
import departmentReducer from './slices/departmentSlice';
import employeeReducer from './slices/employeeSlice';
import hrReducer from './slices/hrSlice'; // Add this line
import accountReducer from './slices/accountSlice'; // ADD THIS LINE

const store = configureStore({
  reducer: {
    auth: authReducer,
    projects: projectReducer,
    buildings: buildingReducer,
    units: unitReducer,
    customers: customerReducer,
    rentals: rentalReducer,
    departments: departmentReducer,
    employees: employeeReducer,
    hr: hrReducer,
    accounts: accountReducer, // ADD THIS LINE
  },
});

export default store;