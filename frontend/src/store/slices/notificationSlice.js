import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { notificationAPI } from '../../services/api';

export const fetchNotifications = createAsyncThunk(
  'notifications/fetchNotifications',
  async (params = {}, { rejectWithValue }) => {
    try {
      const response = await notificationAPI.getAll(params);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message);
    }
  }
);

export const fetchUnreadCount = createAsyncThunk(
  'notifications/fetchUnreadCount',
  async (_, { rejectWithValue }) => {
    try {
      const response = await notificationAPI.getUnreadCount();
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message);
    }
  }
);

export const markAsRead = createAsyncThunk(
  'notifications/markAsRead',
  async (id, { rejectWithValue }) => {
    try {
      const response = await notificationAPI.markAsRead(id);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message);
    }
  }
);

export const approvePayment = createAsyncThunk(
  'notifications/approvePayment',
  async (id, { rejectWithValue }) => {
    try {
      const response = await notificationAPI.approvePayment(id);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message);
    }
  }
);

export const rejectPayment = createAsyncThunk(
  'notifications/rejectPayment',
  async (id, { rejectWithValue }) => {
    try {
      const response = await notificationAPI.rejectPayment(id);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message);
    }
  }
);

export const markAllAsRead = createAsyncThunk(
  'notifications/markAllAsRead',
  async (_, { rejectWithValue }) => {
    try {
      const response = await notificationAPI.markAllAsRead();
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message);
    }
  }
);

const notificationSlice = createSlice({
  name: 'notifications',
  initialState: {
    items: [],
    unreadCount: 0,
    loading: false,
    error: null
  },
  reducers: {
    clearNotificationError: (state) => {
      state.error = null;
    },
    addNotification: (state, action) => {
      state.items.unshift(action.payload);
      state.unreadCount += 1;
    },
    removeNotification: (state, action) => {
      state.items = state.items.filter(item => item.id !== action.payload);
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchNotifications.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchNotifications.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload;
      })
      .addCase(fetchNotifications.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(fetchUnreadCount.fulfilled, (state, action) => {
        state.unreadCount = action.payload.count;
      })
      .addCase(markAsRead.fulfilled, (state, action) => {
        const index = state.items.findIndex(item => item.id === action.payload.id);
        if (index !== -1) {
          state.items[index] = action.payload;
        }
        if (state.unreadCount > 0) {
          state.unreadCount -= 1;
        }
      })
      .addCase(approvePayment.fulfilled, (state, action) => {
        const index = state.items.findIndex(item => item.id === action.payload.notification.id);
        if (index !== -1) {
          state.items[index] = action.payload.notification;
        }
        if (state.unreadCount > 0) {
          state.unreadCount -= 1;
        }
      })
      .addCase(rejectPayment.fulfilled, (state, action) => {
        const index = state.items.findIndex(item => item.id === action.payload.notification.id);
        if (index !== -1) {
          state.items[index] = action.payload.notification;
        }
        if (state.unreadCount > 0) {
          state.unreadCount -= 1;
        }
      })
      .addCase(markAllAsRead.fulfilled, (state) => {
        state.items.forEach(item => {
          if (item.status === 'pending') {
            item.status = 'read';
          }
        });
        state.unreadCount = 0;
      });
  }
});

export const { clearNotificationError, addNotification, removeNotification } = notificationSlice.actions;
export default notificationSlice.reducer;