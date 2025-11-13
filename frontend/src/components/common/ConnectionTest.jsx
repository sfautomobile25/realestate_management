import React, { useEffect, useState } from 'react';
import { Alert, Button, Box } from '@mui/material';
import { testConnection } from '../../services/api';

const ConnectionTest = () => {
  const [connectionStatus, setConnectionStatus] = useState('testing');
  const [error, setError] = useState('');

  const testBackendConnection = async () => {
    try {
      setConnectionStatus('testing');
      const result = await testConnection();
      setConnectionStatus('connected');
      console.log('Backend connection successful:', result);
    } catch (error) {
      setConnectionStatus('failed');
      setError(error.message);
      console.error('Backend connection failed:', error);
    }
  };

  useEffect(() => {
    testBackendConnection();
  }, []);

  if (connectionStatus === 'connected') {
    return null; // Don't show anything if connected
  }

  return (
    <Box sx={{ p: 2 }}>
      <Alert 
        severity={connectionStatus === 'failed' ? 'error' : 'info'}
        action={
          <Button color="inherit" size="small" onClick={testBackendConnection}>
            RETRY
          </Button>
        }
      >
        {connectionStatus === 'testing' && 'Testing connection to backend...'}
        {connectionStatus === 'failed' && `Backend connection failed: ${error}`}
      </Alert>
    </Box>
  );
};

export default ConnectionTest;