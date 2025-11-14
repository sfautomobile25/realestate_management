import React, { useEffect, useState } from 'react';
import {
  Box,
  Paper,
  Typography,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  MenuItem,
  Alert,
  Snackbar,
  Grid,
  Card,
  CardContent
} from '@mui/material';
import { Add, Edit, Delete, Home, Business } from '@mui/icons-material';
import { useDispatch, useSelector } from 'react-redux';
import { unitAPI } from '../../services/api';
import { fetchProjects } from '../../store/slices/projectSlice';
import { fetchBuildings } from '../../store/slices/buildingSlice';

const Units = () => {
  const dispatch = useDispatch();
  const { items: projects } = useSelector(state => state.projects);
  const { items: buildings } = useSelector(state => state.buildings);
  
  const [units, setUnits] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedUnit, setSelectedUnit] = useState(null);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

  const [formData, setFormData] = useState({
    unit_number: '',
    building_id: '',
    type: 'flat',
    size_sqft: '',
    bedrooms: '',
    bathrooms: '',
    status: 'available',
    price: '',
    description: ''
  });

  useEffect(() => {
    dispatch(fetchProjects());
    dispatch(fetchBuildings());
    fetchUnits();
  }, [dispatch]);

  const fetchUnits = async () => {
    setLoading(true);
    try {
      const response = await unitAPI.getAll();
      setUnits(response.data);
    } catch (error) {
      setError('Failed to fetch units');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenDialog = (unit = null) => {
    if (unit) {
      setSelectedUnit(unit);
      setFormData({
        unit_number: unit.unit_number,
        building_id: unit.building_id,
        type: unit.type,
        size_sqft: unit.size_sqft || '',
        bedrooms: unit.bedrooms || '',
        bathrooms: unit.bathrooms || '',
        status: unit.status,
        price: unit.price || '',
        description: unit.description || ''
      });
    } else {
      setSelectedUnit(null);
      setFormData({
        unit_number: '',
        building_id: '',
        type: 'flat',
        size_sqft: '',
        bedrooms: '',
        bathrooms: '',
        status: 'available',
        price: '',
        description: ''
      });
    }
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setSelectedUnit(null);
  };

  const handleSubmit = async () => {
    try {
      const submitData = {
        ...formData,
        size_sqft: formData.size_sqft ? parseFloat(formData.size_sqft) : null,
        bedrooms: formData.bedrooms ? parseInt(formData.bedrooms) : null,
        bathrooms: formData.bathrooms ? parseInt(formData.bathrooms) : null,
        price: formData.price ? parseFloat(formData.price) : null
      };

      if (selectedUnit) {
        await unitAPI.update(selectedUnit.id, submitData);
        setSnackbar({ open: true, message: 'Unit updated successfully', severity: 'success' });
      } else {
        await unitAPI.create(submitData);
        setSnackbar({ open: true, message: 'Unit created successfully', severity: 'success' });
      }
      handleCloseDialog();
      fetchUnits();
    } catch (error) {
      setSnackbar({ open: true, message: 'Operation failed', severity: 'error' });
    }
  };

  const handleDelete = async (unitId) => {
    if (window.confirm('Are you sure you want to delete this unit?')) {
      try {
        await unitAPI.delete(unitId);
        setSnackbar({ open: true, message: 'Unit deleted successfully', severity: 'success' });
        fetchUnits();
      } catch (error) {
        setSnackbar({ open: true, message: 'Delete failed', severity: 'error' });
      }
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      available: 'success',
      sold: 'error',
      rented: 'warning',
      maintenance: 'default'
    };
    return colors[status] || 'default';
  };

  const getTypeColor = (type) => {
    const colors = {
      flat: 'primary',
      shop: 'secondary',
      office: 'info',
      commercial: 'warning'
    };
    return colors[type] || 'default';
  };

  // Calculate statistics
  const stats = {
    total: units.length,
    available: units.filter(u => u.status === 'available').length,
    sold: units.filter(u => u.status === 'sold').length,
    rented: units.filter(u => u.status === 'rented').length
  };

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4">Units Management</Typography>
        <Button
          variant="contained"
          startIcon={<Add />}
          onClick={() => handleOpenDialog()}
        >
          Add Unit
        </Button>
      </Box>

      {/* Statistics Cards */}
      <Grid container spacing={3} mb={4}>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                Total Units
              </Typography>
              <Typography variant="h4">{stats.total}</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                Available
              </Typography>
              <Typography variant="h4" color="success.main">
                {stats.available}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                Sold
              </Typography>
              <Typography variant="h4" color="error.main">
                {stats.sold}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                Rented
              </Typography>
              <Typography variant="h4" color="warning.main">
                {stats.rented}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Unit Number</TableCell>
              <TableCell>Type</TableCell>
              <TableCell>Building</TableCell>
              <TableCell>Project</TableCell>
              <TableCell>Size (sqft)</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Price</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {units.map((unit) => (
              <TableRow key={unit.id}>
                <TableCell>
                  <Box display="flex" alignItems="center">
                    <Home sx={{ mr: 1, color: 'primary.main' }} />
                    {unit.unit_number}
                  </Box>
                </TableCell>
                <TableCell>
                  <Chip 
                    label={unit.type} 
                    color={getTypeColor(unit.type)}
                    size="small"
                  />
                </TableCell>
                <TableCell>{unit.Building?.name || 'N/A'}</TableCell>
                <TableCell>
                  <Box display="flex" alignItems="center">
                    <Business sx={{ mr: 1, color: 'secondary.main' }} />
                    {unit.Building?.Project?.name || 'N/A'}
                  </Box>
                </TableCell>
                <TableCell>{unit.size_sqft || 'N/A'}</TableCell>
                <TableCell>
                  <Chip 
                    label={unit.status} 
                    color={getStatusColor(unit.status)}
                    size="small"
                  />
                </TableCell>
                <TableCell>
                  {unit.price ? `$${unit.price.toLocaleString()}` : 'N/A'}
                </TableCell>
                <TableCell>
                  <IconButton
                    size="small"
                    onClick={() => handleOpenDialog(unit)}
                  >
                    <Edit />
                  </IconButton>
                  <IconButton
                    size="small"
                    color="error"
                    onClick={() => handleDelete(unit.id)}
                  >
                    <Delete />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Unit Form Dialog */}
      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="md" fullWidth>
        <DialogTitle>
          {selectedUnit ? 'Edit Unit' : 'Add New Unit'}
        </DialogTitle>
        <DialogContent>
          <Box component="form" sx={{ mt: 2 }}>
            <TextField
              fullWidth
              label="Unit Number"
              value={formData.unit_number}
              onChange={(e) => setFormData({ ...formData, unit_number: e.target.value })}
              margin="normal"
              required
            />
            <TextField
              fullWidth
              select
              label="Building"
              value={formData.building_id}
              onChange={(e) => setFormData({ ...formData, building_id: e.target.value })}
              margin="normal"
              required
            >
              {buildings.map((building) => (
                <MenuItem key={building.id} value={building.id}>
                  {building.name} - {building.Project?.name}
                </MenuItem>
              ))}
            </TextField>
            <TextField
              fullWidth
              select
              label="Type"
              value={formData.type}
              onChange={(e) => setFormData({ ...formData, type: e.target.value })}
              margin="normal"
            >
              <MenuItem value="flat">Flat</MenuItem>
              <MenuItem value="shop">Shop</MenuItem>
              <MenuItem value="office">Office</MenuItem>
              <MenuItem value="commercial">Commercial</MenuItem>
            </TextField>
            <TextField
              fullWidth
              label="Size (sqft)"
              type="number"
              value={formData.size_sqft}
              onChange={(e) => setFormData({ ...formData, size_sqft: e.target.value })}
              margin="normal"
            />
            <TextField
              fullWidth
              label="Bedrooms"
              type="number"
              value={formData.bedrooms}
              onChange={(e) => setFormData({ ...formData, bedrooms: e.target.value })}
              margin="normal"
            />
            <TextField
              fullWidth
              label="Bathrooms"
              type="number"
              value={formData.bathrooms}
              onChange={(e) => setFormData({ ...formData, bathrooms: e.target.value })}
              margin="normal"
            />
            <TextField
              fullWidth
              select
              label="Status"
              value={formData.status}
              onChange={(e) => setFormData({ ...formData, status: e.target.value })}
              margin="normal"
            >
              <MenuItem value="available">Available</MenuItem>
              <MenuItem value="sold">Sold</MenuItem>
              <MenuItem value="rented">Rented</MenuItem>
              <MenuItem value="maintenance">Maintenance</MenuItem>
            </TextField>
            <TextField
              fullWidth
              label="Price"
              type="number"
              value={formData.price}
              onChange={(e) => setFormData({ ...formData, price: e.target.value })}
              margin="normal"
            />
            <TextField
              fullWidth
              label="Description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              margin="normal"
              multiline
              rows={3}
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancel</Button>
          <Button onClick={handleSubmit} variant="contained">
            {selectedUnit ? 'Update' : 'Create'}
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
      >
        <Alert 
          onClose={() => setSnackbar({ ...snackbar, open: false })} 
          severity={snackbar.severity}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default Units;