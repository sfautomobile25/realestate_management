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
  Snackbar
} from '@mui/material';
import { Add, Edit, Delete } from '@mui/icons-material';
import { useDispatch, useSelector } from 'react-redux';
import {
  fetchProjects,
  createProject,
  updateProject,
  deleteProject
} from '../../store/slices/projectSlice';

const Projects = () => {
  const dispatch = useDispatch();
  const { items: projects, loading, error } = useSelector(state => state.projects);
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedProject, setSelectedProject] = useState(null);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

  const [formData, setFormData] = useState({
    name: '',
    address: '',
    type: 'residential',
    status: 'planning',
    total_units: '',
    launch_date: '',
    completion_date: '',
    description: ''
  });

  useEffect(() => {
    dispatch(fetchProjects());
  }, [dispatch]);

  const handleOpenDialog = (project = null) => {
    if (project) {
      setSelectedProject(project);
      setFormData({
        name: project.name,
        address: project.address || '',
        type: project.type,
        status: project.status,
        total_units: project.total_units || '',
        launch_date: project.launch_date || '',
        completion_date: project.completion_date || '',
        description: project.description || ''
      });
    } else {
      setSelectedProject(null);
      setFormData({
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

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setSelectedProject(null);
  };

  const handleSubmit = async () => {
    try {
      const submitData = {
        ...formData,
        total_units: formData.total_units ? parseInt(formData.total_units) : null,
        launch_date: formData.launch_date || null,
        completion_date: formData.completion_date || null
      };

      if (selectedProject) {
        await dispatch(updateProject({ id: selectedProject.id, projectData: submitData })).unwrap();
        setSnackbar({ open: true, message: 'Project updated successfully', severity: 'success' });
      } else {
        await dispatch(createProject(submitData)).unwrap();
        setSnackbar({ open: true, message: 'Project created successfully', severity: 'success' });
      }
      handleCloseDialog();
    } catch (error) {
      setSnackbar({ open: true, message: 'Operation failed', severity: 'error' });
    }
  };

  const handleDelete = async (projectId) => {
    if (window.confirm('Are you sure you want to delete this project?')) {
      try {
        await dispatch(deleteProject(projectId)).unwrap();
        setSnackbar({ open: true, message: 'Project deleted successfully', severity: 'success' });
      } catch (error) {
        setSnackbar({ open: true, message: 'Delete failed', severity: 'error' });
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

  if (loading) return <Typography>Loading...</Typography>;

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4">Projects</Typography>
        <Button
          variant="contained"
          startIcon={<Add />}
          onClick={() => handleOpenDialog()}
        >
          Add Project
        </Button>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Name</TableCell>
              <TableCell>Type</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Total Units</TableCell>
              <TableCell>Launch Date</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {projects.map((project) => (
              <TableRow key={project.id}>
                <TableCell>{project.name}</TableCell>
                <TableCell>{project.type}</TableCell>
                <TableCell>
                  <Chip 
                    label={project.status} 
                    color={getStatusColor(project.status)}
                    size="small"
                  />
                </TableCell>
                <TableCell>{project.total_units || 0}</TableCell>
                <TableCell>
                  {project.launch_date 
                    ? new Date(project.launch_date).toLocaleDateString()
                    : 'N/A'
                  }
                </TableCell>
                <TableCell>
                  <IconButton
                    size="small"
                    onClick={() => handleOpenDialog(project)}
                  >
                    <Edit />
                  </IconButton>
                  <IconButton
                    size="small"
                    color="error"
                    onClick={() => handleDelete(project.id)}
                  >
                    <Delete />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

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
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              margin="normal"
              required
            />
            <TextField
              fullWidth
              label="Address"
              value={formData.address}
              onChange={(e) => setFormData({ ...formData, address: e.target.value })}
              margin="normal"
              multiline
              rows={2}
            />
            <TextField
              fullWidth
              select
              label="Type"
              value={formData.type}
              onChange={(e) => setFormData({ ...formData, type: e.target.value })}
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
              value={formData.status}
              onChange={(e) => setFormData({ ...formData, status: e.target.value })}
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
              value={formData.total_units}
              onChange={(e) => setFormData({ ...formData, total_units: e.target.value })}
              margin="normal"
            />
            <TextField
              fullWidth
              label="Launch Date"
              type="date"
              value={formData.launch_date}
              onChange={(e) => setFormData({ ...formData, launch_date: e.target.value })}
              margin="normal"
              InputLabelProps={{ shrink: true }}
            />
            <TextField
              fullWidth
              label="Completion Date"
              type="date"
              value={formData.completion_date}
              onChange={(e) => setFormData({ ...formData, completion_date: e.target.value })}
              margin="normal"
              InputLabelProps={{ shrink: true }}
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
            {selectedProject ? 'Update' : 'Create'}
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