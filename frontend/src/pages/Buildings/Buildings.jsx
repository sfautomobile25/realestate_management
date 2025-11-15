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
  Card,
  CardContent,
  Grid
} from '@mui/material';
import { Add, Edit, Delete, Business, Home, Apartment } from '@mui/icons-material';
import { useDispatch, useSelector } from 'react-redux';
import { fetchBuildings, createBuilding, updateBuilding, deleteBuilding } from '../../store/slices/buildingSlice';
import { fetchProjects } from '../../store/slices/projectSlice';

const Buildings = () => {
  const dispatch = useDispatch();
  const { items: buildings, loading, error } = useSelector(state => state.buildings);
  const { items: projects } = useSelector(state => state.projects);
  
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedBuilding, setSelectedBuilding] = useState(null);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

  const [formData, setFormData] = useState({
    name: '',
    project_id: '',
    floors: '',
    total_units: '',
    description: ''
  });

  useEffect(() => {
    dispatch(fetchBuildings());
    dispatch(fetchProjects());
  }, [dispatch]);

  const handleOpenDialog = (building = null) => {
    if (building) {
      setSelectedBuilding(building);
      setFormData({
        name: building.name,
        project_id: building.project_id,
        floors: building.floors || '',
        total_units: building.total_units || '',
        description: building.description || ''
      });
    } else {
      setSelectedBuilding(null);
      setFormData({
        name: '',
        project_id: '',
        floors: '',
        total_units: '',
        description: ''
      });
    }
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setSelectedBuilding(null);
  };

  const handleSubmit = async () => {
    try {
      const submitData = {
        ...formData,
        floors: formData.floors ? parseInt(formData.floors) : null,
        total_units: formData.total_units ? parseInt(formData.total_units) : null
      };

      if (selectedBuilding) {
        await dispatch(updateBuilding({ id: selectedBuilding.id, buildingData: submitData })).unwrap();
        setSnackbar({ open: true, message: 'Building updated successfully', severity: 'success' });
      } else {
        await dispatch(createBuilding(submitData)).unwrap();
        setSnackbar({ open: true, message: 'Building created successfully', severity: 'success' });
      }
      handleCloseDialog();
      dispatch(fetchBuildings());
    } catch (error) {
      setSnackbar({ open: true, message: 'Operation failed: ' + error.message, severity: 'error' });
    }
  };

  const handleDelete = async (buildingId) => {
    if (window.confirm('Are you sure you want to delete this building? This will also delete all units in this building.')) {
      try {
        await dispatch(deleteBuilding(buildingId)).unwrap();
        setSnackbar({ open: true, message: 'Building deleted successfully', severity: 'success' });
        dispatch(fetchBuildings());
      } catch (error) {
        setSnackbar({ open: true, message: 'Delete failed: ' + error.message, severity: 'error' });
      }
    }
  };

  // Calculate statistics
  const stats = {
    total: buildings.length,
    totalUnits: buildings.reduce((sum, building) => sum + (building.total_units || 0), 0),
    totalActualUnits: buildings.reduce((sum, building) => sum + (building.Units?.length || 0), 0),
    projectsCount: new Set(buildings.map(b => b.project_id)).size
  };

  if (loading) return <Typography>Loading buildings...</Typography>;

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4">Buildings Management</Typography>
        <Button
          variant="contained"
          startIcon={<Add />}
          onClick={() => handleOpenDialog()}
        >
          Add Building
        </Button>
      </Box>

      {/* Statistics Cards */}
      <Grid container spacing={3} mb={4}>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                Total Buildings
              </Typography>
              <Typography variant="h4">{stats.total}</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                Planned Units
              </Typography>
              <Typography variant="h4" color="primary.main">
                {stats.totalUnits}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                Actual Units
              </Typography>
              <Typography variant="h4" color="success.main">
                {stats.totalActualUnits}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                Projects
              </Typography>
              <Typography variant="h4">
                {stats.projectsCount}
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

      {buildings.length === 0 ? (
        <Paper sx={{ p: 6, textAlign: 'center' }}>
          <Apartment sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
          <Typography variant="h5" color="textSecondary" gutterBottom>
            No Buildings Found
          </Typography>
          <Typography variant="body1" color="textSecondary" sx={{ mb: 3 }}>
            Get started by adding your first building to a project.
          </Typography>
          <Button 
            variant="contained" 
            size="large"
            startIcon={<Add />}
            onClick={() => handleOpenDialog()}
          >
            Add First Building
          </Button>
        </Paper>
      ) : (
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Building Name</TableCell>
                <TableCell>Project</TableCell>
                <TableCell>Floors</TableCell>
                <TableCell>Planned Units</TableCell>
                <TableCell>Actual Units</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {buildings.map((building) => (
                <TableRow key={building.id}>
                  <TableCell>
                    <Box display="flex" alignItems="center">
                      <Home sx={{ mr: 1, color: 'primary.main' }} />
                      <Typography variant="subtitle1">
                        {building.name}
                      </Typography>
                    </Box>
                    {building.description && (
                      <Typography variant="body2" color="textSecondary">
                        {building.description}
                      </Typography>
                    )}
                  </TableCell>
                  <TableCell>
                    <Box display="flex" alignItems="center">
                      <Business sx={{ mr: 1, color: 'secondary.main' }} />
                      {building.Project?.name || 'N/A'}
                    </Box>
                  </TableCell>
                  <TableCell>{building.floors || 'N/A'}</TableCell>
                  <TableCell>{building.total_units || 0}</TableCell>
                  <TableCell>
                    <Chip 
                      label={building.Units?.length || 0} 
                      color={(building.Units?.length || 0) > 0 ? 'success' : 'default'}
                      size="small"
                    />
                  </TableCell>
                  <TableCell>
                    <Chip 
                      label={(building.Units?.length || 0) > 0 ? 'Active' : 'Empty'} 
                      color={(building.Units?.length || 0) > 0 ? 'success' : 'default'}
                      size="small"
                    />
                  </TableCell>
                  <TableCell>
                    <IconButton
                      size="small"
                      onClick={() => handleOpenDialog(building)}
                    >
                      <Edit />
                    </IconButton>
                    <IconButton
                      size="small"
                      color="error"
                      onClick={() => handleDelete(building.id)}
                    >
                      <Delete />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      {/* Building Form Dialog */}
      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="md" fullWidth>
        <DialogTitle>
          {selectedBuilding ? 'Edit Building' : 'Add New Building'}
        </DialogTitle>
        <DialogContent>
          <Box component="form" sx={{ mt: 2 }}>
            <TextField
              fullWidth
              label="Building Name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              margin="normal"
              required
            />
            <TextField
              fullWidth
              select
              label="Project"
              value={formData.project_id}
              onChange={(e) => setFormData({ ...formData, project_id: e.target.value })}
              margin="normal"
              required
            >
              {projects.map((project) => (
                <MenuItem key={project.id} value={project.id}>
                  {project.name} - {project.type}
                </MenuItem>
              ))}
            </TextField>
            <TextField
              fullWidth
              label="Number of Floors"
              type="number"
              value={formData.floors}
              onChange={(e) => setFormData({ ...formData, floors: e.target.value })}
              margin="normal"
            />
            <TextField
              fullWidth
              label="Total Units"
              type="number"
              value={formData.total_units}
              onChange={(e) => setFormData({ ...formData, total_units: e.target.value })}
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
            {selectedBuilding ? 'Update' : 'Create'}
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

export default Buildings;