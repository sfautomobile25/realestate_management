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
  Tabs,
  Tab,
  Card,
  CardContent,
  Grid
} from '@mui/material';
import { Add, Edit, Delete, Business, Home, Apartment } from '@mui/icons-material';
import { useDispatch, useSelector } from 'react-redux';
import {
  fetchProjects,
  createProject,
  updateProject,
  deleteProject
} from '../../store/slices/projectSlice';
import {
  fetchBuildingsByProject,
  createBuilding,
  deleteBuilding
} from '../../store/slices/buildingSlice';

const Projects = () => {
  const dispatch = useDispatch();
  const { items: projects, loading: projectsLoading, error: projectsError } = useSelector(state => state.projects);
  const { items: buildings, loading: buildingsLoading, error: buildingsError } = useSelector(state => state.buildings);
  
  const [activeTab, setActiveTab] = useState(0);
  const [openDialog, setOpenDialog] = useState(false);
  const [openBuildingDialog, setOpenBuildingDialog] = useState(false);
  const [selectedProject, setSelectedProject] = useState(null);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

  const [projectForm, setProjectForm] = useState({
    name: '',
    address: '',
    type: 'residential',
    status: 'planning',
    total_units: '',
    launch_date: '',
    completion_date: '',
    description: ''
  });

  const [buildingForm, setBuildingForm] = useState({
    name: '',
    floors: '',
    total_units: '',
    description: ''
  });

  useEffect(() => {
    dispatch(fetchProjects());
  }, [dispatch]);

  useEffect(() => {
    if (selectedProject && activeTab === 1) {
      dispatch(fetchBuildingsByProject(selectedProject.id));
    }
  }, [selectedProject, activeTab, dispatch]);

  const handleOpenDialog = (project = null) => {
    if (project) {
      setSelectedProject(project);
      setProjectForm({
        name: project.name,
        address: project.address || '',
        type: project.type,
        status: project.status,
        total_units: project.total_units || '',
        launch_date: project.launch_date ? project.launch_date.split('T')[0] : '',
        completion_date: project.completion_date ? project.completion_date.split('T')[0] : '',
        description: project.description || ''
      });
    } else {
      setSelectedProject(null);
      setProjectForm({
        name: '',
        address: '',
        type: 'residential',
        status: 'planning',
        total_units: '',
        launch_date: '',
        completion_date: '',
        description: ''
      });
    }
    setOpenDialog(true);
  };

  const handleOpenBuildingDialog = () => {
    setBuildingForm({
      name: '',
      floors: '',
      total_units: '',
      description: ''
    });
    setOpenBuildingDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setSelectedProject(null);
  };

  const handleCloseBuildingDialog = () => {
    setOpenBuildingDialog(false);
  };

  const handleProjectSubmit = async () => {
    try {
      const submitData = {
        ...projectForm,
        total_units: projectForm.total_units ? parseInt(projectForm.total_units) : null,
        launch_date: projectForm.launch_date || null,
        completion_date: projectForm.completion_date || null
      };

      if (selectedProject) {
        await dispatch(updateProject({ id: selectedProject.id, projectData: submitData })).unwrap();
        setSnackbar({ open: true, message: 'Project updated successfully', severity: 'success' });
      } else {
        await dispatch(createProject(submitData)).unwrap();
        setSnackbar({ open: true, message: 'Project created successfully', severity: 'success' });
      }
      handleCloseDialog();
      dispatch(fetchProjects());
    } catch (error) {
      setSnackbar({ open: true, message: 'Operation failed: ' + error.message, severity: 'error' });
    }
  };

  const handleBuildingSubmit = async () => {
    try {
      const submitData = {
        ...buildingForm,
        project_id: selectedProject.id,
        floors: buildingForm.floors ? parseInt(buildingForm.floors) : null,
        total_units: buildingForm.total_units ? parseInt(buildingForm.total_units) : null
      };

      await dispatch(createBuilding(submitData)).unwrap();
      setSnackbar({ open: true, message: 'Building added successfully', severity: 'success' });
      handleCloseBuildingDialog();
      // Refresh buildings list
      dispatch(fetchBuildingsByProject(selectedProject.id));
    } catch (error) {
      setSnackbar({ open: true, message: 'Failed to add building: ' + error.message, severity: 'error' });
    }
  };

  const handleDeleteProject = async (projectId) => {
    if (window.confirm('Are you sure you want to delete this project? This will also delete all buildings and units in this project.')) {
      try {
        await dispatch(deleteProject(projectId)).unwrap();
        setSnackbar({ open: true, message: 'Project deleted successfully', severity: 'success' });
        dispatch(fetchProjects());
      } catch (error) {
        setSnackbar({ open: true, message: 'Delete failed: ' + error.message, severity: 'error' });
      }
    }
  };

  const handleDeleteBuilding = async (buildingId) => {
    if (window.confirm('Are you sure you want to delete this building? This will also delete all units in this building.')) {
      try {
        await dispatch(deleteBuilding(buildingId)).unwrap();
        setSnackbar({ open: true, message: 'Building deleted successfully', severity: 'success' });
        dispatch(fetchBuildingsByProject(selectedProject.id));
      } catch (error) {
        setSnackbar({ open: true, message: 'Delete failed: ' + error.message, severity: 'error' });
      }
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      planning: 'default',
      construction: 'warning',
      completed: 'success',
      launched: 'info'
    };
    return colors[status] || 'default';
  };

  if (projectsLoading) return <Typography>Loading projects...</Typography>;

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4">Projects Management</Typography>
        <Button
          variant="contained"
          startIcon={<Add />}
          onClick={() => handleOpenDialog()}
        >
          Add Project
        </Button>
      </Box>

      {projectsError && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {projectsError}
        </Alert>
      )}

      {buildingsError && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {buildingsError}
        </Alert>
      )}

      <Tabs value={activeTab} onChange={(e, newValue) => setActiveTab(newValue)} sx={{ mb: 3 }}>
        <Tab label="All Projects" />
        <Tab label="Project Details" disabled={!selectedProject} />
      </Tabs>

      {activeTab === 0 && (
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Name</TableCell>
                <TableCell>Type</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Total Units</TableCell>
                <TableCell>Buildings</TableCell>
                <TableCell>Launch Date</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {projects.map((project) => (
                <TableRow 
                  key={project.id}
                  hover
                  onClick={() => {
                    setSelectedProject(project);
                    setActiveTab(1);
                  }}
                  sx={{ cursor: 'pointer' }}
                >
                  <TableCell>
                    <Box display="flex" alignItems="center">
                      <Business sx={{ mr: 1, color: 'primary.main' }} />
                      {project.name}
                    </Box>
                  </TableCell>
                  <TableCell>{project.type}</TableCell>
                  <TableCell>
                    <Chip 
                      label={project.status} 
                      color={getStatusColor(project.status)}
                      size="small"
                    />
                  </TableCell>
                  <TableCell>{project.total_units || 0}</TableCell>
                  <TableCell>{project.Buildings?.length || 0}</TableCell>
                  <TableCell>
                    {project.launch_date 
                      ? new Date(project.launch_date).toLocaleDateString()
                      : 'N/A'
                    }
                  </TableCell>
                  <TableCell onClick={(e) => e.stopPropagation()}>
                    <IconButton
                      size="small"
                      onClick={() => handleOpenDialog(project)}
                    >
                      <Edit />
                    </IconButton>
                    <IconButton
                      size="small"
                      color="error"
                      onClick={() => handleDeleteProject(project.id)}
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

      {activeTab === 1 && selectedProject && (
        <Box>
          <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
            <Box>
              <Typography variant="h5">{selectedProject.name}</Typography>
              <Typography color="textSecondary">
                {selectedProject.type} • {selectedProject.status}
              </Typography>
            </Box>
            <Button
              variant="contained"
              startIcon={<Add />}
              onClick={handleOpenBuildingDialog}
            >
              Add Building
            </Button>
          </Box>

          <Grid container spacing={3}>
            <Grid item xs={12} md={4}>
              <Card>
                <CardContent>
                  <Typography color="textSecondary" gutterBottom>
                    Project Overview
                  </Typography>
                  <Typography variant="h6">
                    {selectedProject.name}
                  </Typography>
                  <Typography variant="body2" sx={{ mt: 1 }}>
                    <strong>Type:</strong> {selectedProject.type}
                  </Typography>
                  <Typography variant="body2">
                    <strong>Status:</strong> {selectedProject.status}
                  </Typography>
                  <Typography variant="body2">
                    <strong>Total Units:</strong> {selectedProject.total_units || 0}
                  </Typography>
                  <Typography variant="body2">
                    <strong>Address:</strong> {selectedProject.address || 'N/A'}
                  </Typography>
                  {selectedProject.description && (
                    <Typography variant="body2" sx={{ mt: 1 }}>
                      <strong>Description:</strong> {selectedProject.description}
                    </Typography>
                  )}
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12} md={8}>
              <Typography variant="h6" gutterBottom>
                Buildings ({buildings.length})
                {buildingsLoading && <Typography variant="body2" color="textSecondary">Loading...</Typography>}
              </Typography>
              
              {buildings.length === 0 ? (
                <Paper sx={{ p: 3, textAlign: 'center' }}>
                  <Apartment sx={{ fontSize: 48, color: 'text.secondary', mb: 2 }} />
                  <Typography variant="h6" color="textSecondary">
                    No Buildings Yet
                  </Typography>
                  <Typography variant="body2" color="textSecondary" sx={{ mb: 2 }}>
                    Add your first building to this project
                  </Typography>
                  <Button 
                    variant="contained" 
                    startIcon={<Add />}
                    onClick={handleOpenBuildingDialog}
                  >
                    Add First Building
                  </Button>
                </Paper>
              ) : (
                <Grid container spacing={2}>
                  {buildings.map((building) => (
                    <Grid item xs={12} sm={6} key={building.id}>
                      <Card variant="outlined">
                        <CardContent>
                          <Box display="flex" alignItems="center" justifyContent="space-between" mb={1}>
                            <Box display="flex" alignItems="center">
                              <Home sx={{ mr: 1, color: 'primary.main' }} />
                              <Typography variant="h6">
                                {building.name}
                              </Typography>
                            </Box>
                            <IconButton
                              size="small"
                              color="error"
                              onClick={() => handleDeleteBuilding(building.id)}
                            >
                              <Delete />
                            </IconButton>
                          </Box>
                          <Typography variant="body2" color="textSecondary">
                            Floors: {building.floors || 'N/A'}
                          </Typography>
                          <Typography variant="body2" color="textSecondary">
                            Planned Units: {building.total_units || 0}
                          </Typography>
                          <Typography variant="body2" color="textSecondary">
                            Actual Units: {building.Units?.length || 0}
                          </Typography>
                          {building.description && (
                            <Typography variant="body2" color="textSecondary" sx={{ mt: 1 }}>
                              {building.description}
                            </Typography>
                          )}
                        </CardContent>
                      </Card>
                    </Grid>
                  ))}
                </Grid>
              )}
            </Grid>
          </Grid>
        </Box>
      )}

      {/* Project Form Dialog */}
      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="md" fullWidth>
        <DialogTitle>
          {selectedProject ? 'Edit Project' : 'Add New Project'}
        </DialogTitle>
        <DialogContent>
          <Box component="form" sx={{ mt: 2 }}>
            <TextField
              fullWidth
              label="Project Name"
              value={projectForm.name}
              onChange={(e) => setProjectForm({ ...projectForm, name: e.target.value })}
              margin="normal"
              required
            />
            <TextField
              fullWidth
              label="Address"
              value={projectForm.address}
              onChange={(e) => setProjectForm({ ...projectForm, address: e.target.value })}
              margin="normal"
              multiline
              rows={2}
            />
            <TextField
              fullWidth
              select
              label="Type"
              value={projectForm.type}
              onChange={(e) => setProjectForm({ ...projectForm, type: e.target.value })}
              margin="normal"
            >
              <MenuItem value="residential">Residential</MenuItem>
              <MenuItem value="commercial">Commercial</MenuItem>
              <MenuItem value="mixed">Mixed</MenuItem>
            </TextField>
            <TextField
              fullWidth
              select
              label="Status"
              value={projectForm.status}
              onChange={(e) => setProjectForm({ ...projectForm, status: e.target.value })}
              margin="normal"
            >
              <MenuItem value="planning">Planning</MenuItem>
              <MenuItem value="construction">Construction</MenuItem>
              <MenuItem value="completed">Completed</MenuItem>
              <MenuItem value="launched">Launched</MenuItem>
            </TextField>
            <TextField
              fullWidth
              label="Total Units"
              type="number"
              value={projectForm.total_units}
              onChange={(e) => setProjectForm({ ...projectForm, total_units: e.target.value })}
              margin="normal"
            />
            <TextField
              fullWidth
              label="Launch Date"
              type="date"
              value={projectForm.launch_date}
              onChange={(e) => setProjectForm({ ...projectForm, launch_date: e.target.value })}
              margin="normal"
              InputLabelProps={{ shrink: true }}
            />
            <TextField
              fullWidth
              label="Completion Date"
              type="date"
              value={projectForm.completion_date}
              onChange={(e) => setProjectForm({ ...projectForm, completion_date: e.target.value })}
              margin="normal"
              InputLabelProps={{ shrink: true }}
            />
            <TextField
              fullWidth
              label="Description"
              value={projectForm.description}
              onChange={(e) => setProjectForm({ ...projectForm, description: e.target.value })}
              margin="normal"
              multiline
              rows={3}
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancel</Button>
          <Button onClick={handleProjectSubmit} variant="contained">
            {selectedProject ? 'Update' : 'Create'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Building Form Dialog */}
      <Dialog open={openBuildingDialog} onClose={handleCloseBuildingDialog} maxWidth="sm" fullWidth>
        <DialogTitle>
          Add New Building to {selectedProject?.name}
        </DialogTitle>
        <DialogContent>
          <Box component="form" sx={{ mt: 2 }}>
            <TextField
              fullWidth
              label="Building Name"
              value={buildingForm.name}
              onChange={(e) => setBuildingForm({ ...buildingForm, name: e.target.value })}
              margin="normal"
              required
            />
            <TextField
              fullWidth
              label="Number of Floors"
              type="number"
              value={buildingForm.floors}
              onChange={(e) => setBuildingForm({ ...buildingForm, floors: e.target.value })}
              margin="normal"
            />
            <TextField
              fullWidth
              label="Total Units"
              type="number"
              value={buildingForm.total_units}
              onChange={(e) => setBuildingForm({ ...buildingForm, total_units: e.target.value })}
              margin="normal"
            />
            <TextField
              fullWidth
              label="Description"
              value={buildingForm.description}
              onChange={(e) => setBuildingForm({ ...buildingForm, description: e.target.value })}
              margin="normal"
              multiline
              rows={3}
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseBuildingDialog}>Cancel</Button>
          <Button onClick={handleBuildingSubmit} variant="contained">
            Add Building
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

export default Projects;