import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { Provider } from 'react-redux';
import store from './store';
import ConnectionTest from './components/common/ConnectionTest';

// Components
import Layout from './components/common/Layout';
import Login from './pages/Auth/Login';
import Register from './pages/Auth/Register';
import Dashboard from './pages/Dashboard';
import Projects from './pages/Projects/Projects';
import Units from './pages/Units/Units';
import Customers from './pages/Customers/Customers';
import Rentals from './pages/Rentals/Rentals';
import Payments from './pages/Payments/Payments';
import Buildings from './pages/Buildings/Buildings'

const theme = createTheme({
  palette: {
    primary: {
      main: '#1976d2',
    },
    secondary: {
      main: '#dc004e',
    },
  },
});

const isAuthenticated = () => {
  return localStorage.getItem('token') !== null;
};

const ProtectedRoute = ({ children }) => {
  return isAuthenticated() ? children : <Navigate to="/login" />;
};

const PublicRoute = ({ children }) => {
  return !isAuthenticated() ? children : <Navigate to="/" />;
};

function App() {
  return (
    <Provider store={store}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
         <ConnectionTest />
        <Router>
          <Routes>
            <Route path="/buildings" element={
              <ProtectedRoute>
                <Layout>
                  <Buildings />
                </Layout>
              </ProtectedRoute>
            } />
              <Route path="/customers" element={
              <ProtectedRoute>
                <Layout>
                  <Customers />
                </Layout>
              </ProtectedRoute>
            } />
            <Route path="/rentals" element={
              <ProtectedRoute>
                <Layout>
                  <Rentals />
                </Layout>
              </ProtectedRoute>
            } />
            <Route path="/payments" element={
              <ProtectedRoute>
                <Layout>
                  <Payments />
                </Layout>
              </ProtectedRoute>
            } />
            {/* Public routes */}
            <Route path="/login" element={
              <PublicRoute>
                <Login />
              </PublicRoute>
            } />
            <Route path="/register" element={
              <PublicRoute>
                <Register />
              </PublicRoute>
            } />
            
            {/* Protected routes */}
            <Route path="/" element={
              <ProtectedRoute>
                <Layout>
                  <Dashboard />
                </Layout>
              </ProtectedRoute>
            } />
            <Route path="/projects" element={
              <ProtectedRoute>
                <Layout>
                  <Projects />
                </Layout>
              </ProtectedRoute>
            } />
            <Route path="/units" element={
              <ProtectedRoute>
                <Layout>
                  <Units />
                </Layout>
              </ProtectedRoute>
            } />
            
            {/* Default redirect */}
            <Route path="*" element={<Navigate to="/" />} />
          </Routes>
        </Router>
      </ThemeProvider>
    </Provider>
  );
}

export default App;