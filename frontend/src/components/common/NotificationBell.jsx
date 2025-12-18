import React, { useState, useEffect } from 'react';
import {
  Badge,
  IconButton,
  Popover,
  Typography,
  Box,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Button,
  Divider,
  Chip,
  CircularProgress
} from '@mui/material';
import {
  Notifications as NotificationsIcon,
  CheckCircle,
  Cancel,
  Payment,
  Home,
  Build,
  Warning,
  Schedule,
  AccountBalanceWallet,
  AccessTime
} from '@mui/icons-material';
import { useDispatch, useSelector } from 'react-redux';
import { 
  fetchNotifications, 
  markAsRead, 
  markAllAsRead,
  approvePayment,
  rejectPayment
} from '../../store/slices/notificationSlice';
import { useNavigate } from 'react-router-dom';

const NotificationBell = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [anchorEl, setAnchorEl] = useState(null);
  const { items, unreadCount, loading } = useSelector(state => state.notifications);
  
  const open = Boolean(anchorEl);
  const id = open ? 'notification-popover' : undefined;

  useEffect(() => {
    dispatch(fetchNotifications({ status: 'unread', limit: 10 }));
  }, [dispatch]);

  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleMarkAsRead = async (notificationId) => {
    await dispatch(markAsRead(notificationId));
    if (notification.action_url) {
      navigate(notification.action_url);
    }
    handleClose();
  };

  const handleMarkAllAsRead = async () => {
    await dispatch(markAllAsRead());
  };

  const handleApprovePayment = async (notificationId) => {
    await dispatch(approvePayment(notificationId));
  };

  const handleRejectPayment = async (notificationId) => {
    await dispatch(rejectPayment(notificationId));
  };

  const getNotificationIcon = (type) => {
    switch (type) {
      case 'payment_approval':
        return <Payment color="warning" />;
      case 'rent_reminder':
        return <Home color="error" />;
      case 'utility_bill':
        return <AccountBalanceWallet color="info" />;
      case 'maintenance_request':
        return <Build color="action" />;
      case 'attendance_alert':
        return <AccessTime color="warning" />;
      case 'salary_payment':
        return <Payment color="success" />;
      default:
        return <Warning color="primary" />;
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

  return (
    <>
      <IconButton
        color="inherit"
        onClick={handleClick}
        aria-describedby={id}
      >
        <Badge badgeContent={unreadCount} color="error">
          <NotificationsIcon />
        </Badge>
      </IconButton>
      
      <Popover
        id={id}
        open={open}
        anchorEl={anchorEl}
        onClose={handleClose}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'right',
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'right',
        }}
        sx={{ mt: 1 }}
      >
        <Box sx={{ width: 400, maxHeight: 500, overflow: 'auto' }}>
          <Box sx={{ p: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography variant="h6" fontWeight="bold">
              Notifications
              {unreadCount > 0 && (
                <Chip 
                  label={`${unreadCount} unread`} 
                  size="small" 
                  color="error" 
                  sx={{ ml: 1 }}
                />
              )}
            </Typography>
            {unreadCount > 0 && (
              <Button size="small" onClick={handleMarkAllAsRead}>
                Mark all as read
              </Button>
            )}
          </Box>
          <Divider />
          
          {loading ? (
            <Box sx={{ p: 4, textAlign: 'center' }}>
              <CircularProgress size={24} />
              <Typography sx={{ mt: 1 }}>Loading notifications...</Typography>
            </Box>
          ) : items.length === 0 ? (
            <Box sx={{ p: 4, textAlign: 'center' }}>
              <NotificationsIcon sx={{ fontSize: 48, color: 'text.disabled', mb: 2 }} />
              <Typography color="textSecondary">No notifications</Typography>
            </Box>
          ) : (
            <List sx={{ p: 0 }}>
              {items.map((notification) => (
                <React.Fragment key={notification.id}>
                  <ListItem 
                    alignItems="flex-start"
                    sx={{
                      bgcolor: notification.status === 'unread' ? 'action.hover' : 'transparent',
                      '&:hover': { bgcolor: 'action.selected' },
                      cursor: 'pointer'
                    }}
                    onClick={() => handleMarkAsRead(notification.id)}
                  >
                    <ListItemIcon>
                      {getNotificationIcon(notification.type)}
                    </ListItemIcon>
                    <ListItemText
                      primary={
                        <Box display="flex" justifyContent="space-between" alignItems="center">
                          <Typography variant="subtitle1" component="span">
                            {notification.title}
                          </Typography>
                          <Chip 
                            label={notification.priority} 
                            size="small"
                            color={getPriorityColor(notification.priority)}
                          />
                        </Box>
                      }
                      secondary={
                        <>
                          <Typography variant="body2" color="text.primary">
                            {notification.message}
                          </Typography>
                          {notification.amount && (
                            <Typography variant="body2" color="primary" fontWeight="bold">
                              ৳{notification.amount.toLocaleString()}
                            </Typography>
                          )}
                          <Typography variant="caption" color="textSecondary">
                            {new Date(notification.createdAt).toLocaleString()}
                          </Typography>
                          
                          {notification.type === 'payment_approval' && notification.status === 'pending' && (
                            <Box sx={{ mt: 1, display: 'flex', gap: 1 }}>
                              <Button
                                variant="contained"
                                size="small"
                                color="success"
                                startIcon={<CheckCircle />}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleApprovePayment(notification.id);
                                }}
                              >
                                Approve
                              </Button>
                              <Button
                                variant="outlined"
                                size="small"
                                color="error"
                                startIcon={<Cancel />}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleRejectPayment(notification.id);
                                }}
                              >
                                Reject
                              </Button>
                            </Box>
                          )}
                        </>
                      }
                    />
                  </ListItem>
                  <Divider component="li" />
                </React.Fragment>
              ))}
            </List>
          )}
          
          <Box sx={{ p: 2, textAlign: 'center' }}>
            <Button 
              variant="text" 
              onClick={() => navigate('/notifications')}
              fullWidth
            >
              View All Notifications
            </Button>
          </Box>
        </Box>
      </Popover>
    </>
  );
};

export default NotificationBell;