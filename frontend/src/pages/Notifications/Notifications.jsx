import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  ListItemSecondaryAction,
  Chip,
  Button,
  IconButton,
  Menu,
  MenuItem,
  TextField,
  Grid,
  Card,
  CardContent,
  Divider,
  CircularProgress
} from '@mui/material';
import {
  FilterList,
  Delete,
  CheckCircle,
  Cancel,
  Payment,
  Home,
  Build,
  Warning,
  Schedule,
  AccountBalanceWallet,
  AccessTime,
  NotificationsActive,
  CheckBox,
  ClearAll
} from '@mui/icons-material';
import { useDispatch, useSelector } from 'react-redux';
import { 
  fetchNotifications, 
  markAsRead, 
  markAllAsRead,
  deleteNotification,
  approvePayment,
  rejectPayment
} from '../../store/slices/notificationSlice';
import Layout from '../../components/common/Layout';

const NotificationsPage = () => {
  const dispatch = useDispatch();
  const { items, loading, pagination } = useSelector(state => state.notifications);
  
  const [filter, setFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [priorityFilter, setPriorityFilter] = useState('all');
  const [selected, setSelected] = useState([]);
  const [anchorEl, setAnchorEl] = useState(null);
  const [search, setSearch] = useState('');

  useEffect(() => {
    loadNotifications();
  }, [filter, statusFilter, priorityFilter]);

  const loadNotifications = () => {
    const params = {};
    if (filter !== 'all') params.type = filter;
    if (statusFilter !== 'all') params.status = statusFilter;
    if (priorityFilter !== 'all') params.priority = priorityFilter;
    if (search) params.search = search;
    
    dispatch(fetchNotifications(params));
  };

  const handleFilterClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleFilterClose = () => {
    setAnchorEl(null);
  };

  const handleSelectAll = () => {
    if (selected.length === items.length) {
      setSelected([]);
    } else {
      setSelected(items.map(n => n.id));
    }
  };

  const handleSelect = (id) => {
    if (selected.includes(id)) {
      setSelected(selected.filter(item => item !== id));
    } else {
      setSelected([...selected, id]);
    }
  };

  const handleMarkSelectedAsRead = async () => {
    for (const id of selected) {
      await dispatch(markAsRead(id));
    }
    setSelected([]);
  };

  const handleDeleteSelected = async () => {
    for (const id of selected) {
      await dispatch(deleteNotification(id));
    }
    setSelected([]);
    loadNotifications();
  };

  const getNotificationIcon = (type) => {
    switch (type) {
      case 'payment_approval': return <Payment />;
      case 'rent_reminder': return <Home />;
      case 'utility_bill': return <AccountBalanceWallet />;
      case 'maintenance_request': return <Build />;
      case 'attendance_alert': return <AccessTime />;
      case 'salary_payment': return <Payment />;
      default: return <Warning />;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'approved': return 'success';
      case 'rejected': return 'error';
      case 'pending': return 'warning';
      case 'read': return 'default';
      case 'unread': return 'primary';
      default: return 'default';
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'urgent': return 'error';
      case 'high': return 'warning';
      case 'medium': return 'info';
      case 'low': return 'default';
      default: return 'default';
    }
  };

  const filteredNotifications = items.filter(notification => {
    if (search) {
      return notification.title.toLowerCase().includes(search.toLowerCase()) ||
             notification.message.toLowerCase().includes(search.toLowerCase());
    }
    return true;
  });

  return (
    <Layout>
      <Box sx={{ bgcolor: 'background.default', minHeight: '100vh', p: 3 }}>
        {/* Header */}
        <Paper sx={{ mb: 3, p: 3, borderRadius: 2, bgcolor: '#1a237e', color: 'white' }}>
          <Box display="flex" justifyContent="space-between" alignItems="center">
            <Box display="flex" alignItems="center">
              <NotificationsActive sx={{ mr: 2, fontSize: 40 }} />
              <Box>
                <Typography variant="h4" fontWeight="bold">
                  Notifications
                </Typography>
                <Typography variant="body1" sx={{ opacity: 0.9 }}>
                  Manage your alerts and approvals
                </Typography>
              </Box>
            </Box>
            <Box display="flex" gap={2}>
              <Button
                variant="outlined"
                startIcon={<ClearAll />}
                onClick={() => dispatch(markAllAsRead())}
                sx={{ color: 'white', borderColor: 'white' }}
              >
                Mark All as Read
              </Button>
              <Button
                variant="contained"
                color="secondary"
                startIcon={<CheckBox />}
                onClick={handleSelectAll}
              >
                Select All
              </Button>
            </Box>
          </Box>
        </Paper>

        {/* Filters */}
        <Grid container spacing={2} sx={{ mb: 3 }}>
          <Grid item xs={12} md={3}>
            <TextField
              fullWidth
              label="Search notifications"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              size="small"
            />
          </Grid>
          <Grid item xs={12} md={2}>
            <TextField
              select
              fullWidth
              label="Type"
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              size="small"
            >
              <MenuItem value="all">All Types</MenuItem>
              <MenuItem value="payment_approval">Payment Approval</MenuItem>
              <MenuItem value="rent_reminder">Rent Reminder</MenuItem>
              <MenuItem value="utility_bill">Utility Bill</MenuItem>
              <MenuItem value="maintenance_request">Maintenance</MenuItem>
              <MenuItem value="attendance_alert">Attendance</MenuItem>
              <MenuItem value="salary_payment">Salary</MenuItem>
              <MenuItem value="system_alert">System Alert</MenuItem>
            </TextField>
          </Grid>
          <Grid item xs={12} md={2}>
            <TextField
              select
              fullWidth
              label="Status"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              size="small"
            >
              <MenuItem value="all">All Status</MenuItem>
              <MenuItem value="pending">Pending</MenuItem>
              <MenuItem value="approved">Approved</MenuItem>
              <MenuItem value="rejected">Rejected</MenuItem>
              <MenuItem value="read">Read</MenuItem>
              <MenuItem value="unread">Unread</MenuItem>
            </TextField>
          </Grid>
          <Grid item xs={12} md={2}>
            <TextField
              select
              fullWidth
              label="Priority"
              value={priorityFilter}
              onChange={(e) => setPriorityFilter(e.target.value)}
              size="small"
            >
              <MenuItem value="all">All Priorities</MenuItem>
              <MenuItem value="urgent">Urgent</MenuItem>
              <MenuItem value="high">High</MenuItem>
              <MenuItem value="medium">Medium</MenuItem>
              <MenuItem value="low">Low</MenuItem>
            </TextField>
          </Grid>
          <Grid item xs={12} md={3}>
            <Box display="flex" gap={1}>
              {selected.length > 0 && (
                <>
                  <Button
                    variant="contained"
                    color="primary"
                    onClick={handleMarkSelectedAsRead}
                    disabled={selected.length === 0}
                  >
                    Mark as Read ({selected.length})
                  </Button>
                  <Button
                    variant="outlined"
                    color="error"
                    startIcon={<Delete />}
                    onClick={handleDeleteSelected}
                    disabled={selected.length === 0}
                  >
                    Delete
                  </Button>
                </>
              )}
            </Box>
          </Grid>
        </Grid>

        {/* Notifications List */}
        <Paper sx={{ borderRadius: 2, overflow: 'hidden' }}>
          {loading ? (
            <Box sx={{ p: 8, textAlign: 'center' }}>
              <CircularProgress />
              <Typography sx={{ mt: 2 }}>Loading notifications...</Typography>
            </Box>
          ) : filteredNotifications.length === 0 ? (
            <Box sx={{ p: 8, textAlign: 'center' }}>
              <NotificationsActive sx={{ fontSize: 80, color: '#e0e0e0', mb: 2 }} />
              <Typography variant="h6" gutterBottom color="textSecondary">
                No Notifications
              </Typography>
              <Typography variant="body2" color="textSecondary">
                {search ? 'No notifications match your search' : 'You have no notifications'}
              </Typography>
            </Box>
          ) : (
            <List>
              {filteredNotifications.map((notification) => (
                <React.Fragment key={notification.id}>
                  <ListItem 
                    sx={{
                      bgcolor: selected.includes(notification.id) ? 'action.selected' : 
                              notification.status === 'unread' ? 'action.hover' : 'transparent',
                      '&:hover': { bgcolor: 'action.hover' },
                      borderLeft: notification.status === 'unread' ? '4px solid #2196f3' : 'none'
                    }}
                  >
                    <ListItemIcon>
                      <IconButton onClick={() => handleSelect(notification.id)}>
                        <CheckBox color={selected.includes(notification.id) ? 'primary' : 'default'} />
                      </IconButton>
                    </ListItemIcon>
                    <ListItemIcon>
                      {getNotificationIcon(notification.type)}
                    </ListItemIcon>
                    <ListItemText
                      primary={
                        <Box display="flex" justifyContent="space-between" alignItems="center">
                          <Typography variant="subtitle1">
                            {notification.title}
                          </Typography>
                          <Box display="flex" gap={1}>
                            <Chip 
                              label={notification.type.replace('_', ' ')} 
                              size="small"
                              color="primary"
                            />
                            <Chip 
                              label={notification.status} 
                              size="small"
                              color={getStatusColor(notification.status)}
                            />
                            <Chip 
                              label={notification.priority} 
                              size="small"
                              color={getPriorityColor(notification.priority)}
                            />
                          </Box>
                        </Box>
                      }
                      secondary={
                        <>
                          <Typography variant="body2" sx={{ mt: 1 }}>
                            {notification.message}
                          </Typography>
                          {notification.amount && (
                            <Typography variant="body1" color="primary" fontWeight="bold" sx={{ mt: 1 }}>
                              ৳{notification.amount.toLocaleString()}
                            </Typography>
                          )}
                          <Typography variant="caption" color="textSecondary" sx={{ display: 'block', mt: 1 }}>
                            {new Date(notification.createdAt).toLocaleString()}
                          </Typography>
                          
                          {notification.type === 'payment_approval' && notification.status === 'pending' && (
                            <Box sx={{ mt: 2, display: 'flex', gap: 1 }}>
                              <Button
                                variant="contained"
                                size="small"
                                color="success"
                                startIcon={<CheckCircle />}
                                onClick={() => dispatch(approvePayment(notification.id))}
                              >
                                Approve Payment
                              </Button>
                              <Button
                                variant="outlined"
                                size="small"
                                color="error"
                                startIcon={<Cancel />}
                                onClick={() => dispatch(rejectPayment(notification.id))}
                              >
                                Reject
                              </Button>
                            </Box>
                          )}
                          
                          {notification.metadata && (
                            <Paper sx={{ mt: 2, p: 1, bgcolor: '#f5f5f5' }}>
                              <Typography variant="caption" color="textSecondary">
                                Details: {JSON.stringify(notification.metadata)}
                              </Typography>
                            </Paper>
                          )}
                        </>
                      }
                    />
                    <ListItemSecondaryAction>
                      <IconButton 
                        edge="end" 
                        onClick={() => dispatch(markAsRead(notification.id))}
                        title="Mark as read"
                      >
                        <CheckCircle color={notification.status === 'read' ? 'success' : 'disabled'} />
                      </IconButton>
                      <IconButton 
                        edge="end" 
                        onClick={() => dispatch(deleteNotification(notification.id))}
                        title="Delete"
                        sx={{ ml: 1 }}
                      >
                        <Delete color="error" />
                      </IconButton>
                    </ListItemSecondaryAction>
                  </ListItem>
                  <Divider />
                </React.Fragment>
              ))}
            </List>
          )}
        </Paper>

        {/* Statistics Card */}
        {!loading && items.length > 0 && (
          <Grid container spacing={3} sx={{ mt: 3 }}>
            <Grid item xs={12} sm={6} md={3}>
              <Card sx={{ bgcolor: '#e3f2fd' }}>
                <CardContent>
                  <Typography color="textSecondary" gutterBottom>
                    Total Notifications
                  </Typography>
                  <Typography variant="h4" color="primary">
                    {pagination?.total || items.length}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Card sx={{ bgcolor: '#fff8e1' }}>
                <CardContent>
                  <Typography color="textSecondary" gutterBottom>
                    Unread
                  </Typography>
                  <Typography variant="h4" color="warning.main">
                    {items.filter(n => n.status === 'unread').length}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Card sx={{ bgcolor: '#f3e5f5' }}>
                <CardContent>
                  <Typography color="textSecondary" gutterBottom>
                    Pending Approvals
                  </Typography>
                  <Typography variant="h4" color="secondary">
                    {items.filter(n => n.status === 'pending').length}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Card sx={{ bgcolor: '#e8f5e9' }}>
                <CardContent>
                  <Typography color="textSecondary" gutterBottom>
                    Urgent
                  </Typography>
                  <Typography variant="h4" color="success.main">
                    {items.filter(n => n.priority === 'urgent').length}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        )}
      </Box>
    </Layout>
  );
};

export default NotificationsPage;