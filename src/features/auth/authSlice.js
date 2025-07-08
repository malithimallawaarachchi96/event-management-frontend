import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from '../../api/axios';

// Helper function to decode JWT token
const decodeToken = (token) => {
  try {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(atob(base64).split('').map(function(c) {
      return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
    }).join(''));
    return JSON.parse(jsonPayload);
  } catch (error) {
    return null;
  }
};

// Async thunk for login
export const loginUser = createAsyncThunk(
  'auth/login',
  async (credentials, { rejectWithValue }) => {
    try {
      const response = await axios.post('/auth/login', credentials);
      const { token } = response.data;
      
      // Store token in localStorage
      localStorage.setItem('token', token);
      
      // Decode token to get user info
      const userInfo = decodeToken(token);
      
      return { token, user: userInfo };
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Login failed');
    }
  }
);

// Async thunk for logout
export const logoutUser = createAsyncThunk(
  'auth/logout',
  async (_, { rejectWithValue }) => {
    try {
      // Clear token from localStorage
      localStorage.removeItem('token');
      return null;
    } catch (error) {
      return rejectWithValue('Logout failed');
    }
  }
);

// Async thunk to check if user is already logged in
export const checkAuthStatus = createAsyncThunk(
  'auth/checkStatus',
  async (_, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('No token found');
      }
      
      // Decode token to get user info
      const userInfo = decodeToken(token);
      if (!userInfo) {
        throw new Error('Invalid token');
      }
      
      return { token, user: userInfo };
    } catch (error) {
      localStorage.removeItem('token');
      return rejectWithValue('Not authenticated');
    }
  }
);

const initialState = {
  token: localStorage.getItem('token') || null,
  user: null,
  loading: false,
  error: null,
  isAuthenticated: false,
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    setLoading: (state, action) => {
      state.loading = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      // Login
      .addCase(loginUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.loading = false;
        state.token = action.payload.token;
        state.user = action.payload.user;
        state.isAuthenticated = true;
        state.error = null;
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        state.isAuthenticated = false;
      })
      // Logout
      .addCase(logoutUser.fulfilled, (state) => {
        state.token = null;
        state.user = null;
        state.isAuthenticated = false;
        state.error = null;
      })
      // Check auth status
      .addCase(checkAuthStatus.pending, (state) => {
        state.loading = true;
      })
      .addCase(checkAuthStatus.fulfilled, (state, action) => {
        state.loading = false;
        state.token = action.payload.token;
        state.user = action.payload.user;
        state.isAuthenticated = true;
        state.error = null;
      })
      .addCase(checkAuthStatus.rejected, (state) => {
        state.loading = false;
        state.token = null;
        state.user = null;
        state.isAuthenticated = false;
      });
  },
});

export const { clearError, setLoading } = authSlice.actions;
export default authSlice.reducer; 