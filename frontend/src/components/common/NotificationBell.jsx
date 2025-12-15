import React, { useState, useEffect } from 'react';
import {
  Badge,
  IconButton,
  Popover,
  Box,
  Typography,
  Button,
  Divider,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Chip,
  MenuItem,
  Menu
} from '@mui/material';
import {
  Notifications as NotificationsIcon,
  CheckCircle,
  Cancel,
  AccountBalance,
  Payment,
  AttachMoney,
  Schedule,
  MoreVert,
  DoneAll
} from '@mui/icons-material';
import { useDispatch, useSelector } from 'react-redux';
import {
  fetchNotifications,
  fetchUnreadCount,
  markAsRead,
  approvePayment,
  rejectPayment,
  markAllAsRead
} from '../../store/slices/notificationSlice';
import { useNavigate } from 'react-router-dom';

const NotificationBell = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { items: notifications, unreadCount } = useSelector(state => state.notifications);
  
  const [anchorEl, setAnchorEl] = useState(null);
  const [menuAnchorEl, setMenuAnchorEl] = useState(null);
  const [selectedNotification, setSelectedNotification] = useState(null);

  useEffect(() => {
    dispatch(fetchNotifications());
    dispatch(fetchUnreadCount());
    
    // Poll for new notifications every 30 seconds
    const interval = setInterval(() => {
      dispatch(fetchUnreadCount());
    }, 30000);
    
    return () => clearInterval(interval);
  }, [dispatch]);

  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleMenuClick = (event, notification) => {
    event.stopPropagation();
    setSelectedNotification(notification);
    setMenuAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setMenuAnchorEl(null);
    setSelectedNotification(null);
  };

  const handleMarkAsRead = (id) => {
    dispatch(markAsRead(id));
    handleMenuClose();
  };

  const handleApprovePayment = (id) => {
    dispatch(approvePayment(id));
    handleMenuClose();
  };

  const handleRejectPayment = (id) => {
    dispatch(rejectPayment(id));
    handleMenuClose();
  };

  const handleMarkAllAsRead = () => {
    dispatch(markAllAsRead());
  };

  const handleNotificationClick = (notification) => {
    if (notification.status === 'pending') {
      dispatch(markAsRead(notification.id));
    }
    
    if (notification.action_url) {
      navigate(notification.action_url);
    }
    
    handleClose();
  };

  const getNotificationIcon = (type) => {
    switch (type) {
      case 'payment_approval':
        return <Payment color="primary" />;
      case 'salary_payment':
        return <AccountBalance color="secondary" />;
      case 'rent_payment':
        return <AttachMoney color="success" />;
      default:
        return <NotificationsIcon />;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending':
        return 'warning';
      case 'approved':
        return 'success';
      case 'rejected':
        return 'error';
      case 'read':
        return 'default';
      default:
        return 'default';
    }
  };

  const open = Boolean(anchorEl);
  const id = open ? 'notification-popover' : undefined;

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
        PaperProps={{
          sx: { width: 400, maxHeight: 500 }
        }}
      >
        <Box sx={{ p: 2 }}>
          <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
            <Typography variant="h6">Notifications</Typography>
            {unreadCount > 0 && (
              <Button
                size="small"
                startIcon={<DoneAll />}
                onClick={handleMarkAllAsRead}
              >
                Mark all as read
              </Button>
            )}
          </Box>
          
          <Divider />
          
          {notifications.length === 0 ? (
            <Box sx={{ p: 3, textAlign: 'center' }}>
              <NotificationsIcon sx={{ fontSize: 40, color: 'text.secondary', mb: 1 }} />
              <Typography color="textSecondary">No notifications</Typography>
            </Box>
          ) : (
            <List sx={{ maxHeight: 400, overflow: 'auto' }}>
              {notifications.map((notification) => (
                <React.Fragment key={notification.id}>
                  <ListItem
                    button
                    onClick={() => handleNotificationClick(notification)}
                    sx={{
                      bgcolor: notification.status === 'pending' ? '#f5f5f5' : 'transparent',
                      borderRadius: 1,
                      mb: 1
                    }}
                  >
                    <ListItemIcon>
                      {getNotificationIcon(notification.type)}
                    </ListItemIcon>
                    <ListItemText
                      primary={
                        <Box display="flex" justifyContent="space-between" alignItems="flex-start">
                          <Typography variant="subtitle2" sx={{ fontWeight: notification.status === 'pending' ? 'bold' : 'normal' }}>
                            {notification.title}
                          </Typography>
                          <Box display="flex" alignItems="center" gap={1}>
                            {notification.amount && (
                              <Typography variant="body2" color="primary" fontWeight="bold">
                                ৳{notification.amount}
                              </Typography>
                            )}
                            <Chip
                              label={notification.status}
                              size="small"
                              color={getStatusColor(notification.status)}
                            />
                            <IconButton
                              size="small"
                              onClick={(e) => handleMenuClick(e, notification)}
                            >
                              <MoreVert fontSize="small" />
                            </IconButton>
                          </Box>
                        </Box>
                      }
                      secondary={
                        <Box>
                          <Typography variant="body2" color="textSecondary">
                            {notification.message}
                          </Typography>
                          <Typography variant="caption" color="textSecondary">
                            {new Date(notification.createdAt).toLocaleString()}
                          </Typography>
                        </Box>
                      }
                    />
                  </ListItem>
                  <Divider />
                </React.Fragment>
              ))}
            </List>
          )}
        </Box>
      </Popover>

      {/* Notification Actions Menu */}
      <Menu
        anchorEl={menuAnchorEl}
        open={Boolean(menuAnchorEl)}
        onClose={handleMenuClose}
      >
        {selectedNotification && (
          <>
            {selectedNotification.status === 'pending' && (
              <>
                <MenuItem onClick={() => handleMarkAsRead(selectedNotification.id)}>
                  <ListItemIcon>
                    <CheckCircle fontSize="small" />
                  </ListItemIcon>
                  <ListItemText>Mark as Read</ListItemText>
                </MenuItem>
                {selectedNotification.type === 'payment_approval' && (
                  <>
                    <MenuItem onClick={() => handleApprovePayment(selectedNotification.id)}>
                      <ListItemIcon>
                        <CheckCircle fontSize="small" color="success" />
                      </ListItemIcon>
                      <ListItemText>Approve Payment</ListItemText>
                    </MenuItem>
                    <MenuItem onClick={() => handleRejectPayment(selectedNotification.id)}>
                      <ListItemIcon>
                        <Cancel fontSize="small" color="error" />
                      </ListItemIcon>
                      <ListItemText>Reject Payment</ListItemText>
                    </MenuItem>
                  </>
                )}
              </>
            )}
            <MenuItem onClick={() => {
              if (selectedNotification.action_url) {
                navigate(selectedNotification.action_url);
              }
              handleMenuClose();
            }}>
              <ListItemIcon>
                <Schedule fontSize="small" />
              </ListItemIcon>
              <ListItemText>View Details</ListItemText>
            </MenuItem>
          </>
        )}
      </Menu>
    </>
  );
};

export default NotificationBell;