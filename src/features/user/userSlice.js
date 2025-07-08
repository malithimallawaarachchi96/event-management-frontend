import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from '../../api/axios';

// Async thunk for fetching user profile
export const fetchUserProfile = createAsyncThunk(
  'user/fetchProfile',
  async (_, { rejectWithValue }) => {
    try {
      const response = await axios.get('/users/me');
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch user profile');
    }
  }
);

// Async thunk for fetching user events
export const fetchUserEvents = createAsyncThunk(
  'user/fetchEvents',
  async (_, { rejectWithValue }) => {
    try {
      const response = await axios.get('/users/me/events');
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch user events');
    }
  }
);

const initialState = {
  profile: null,
  hostedEvents: [],
  attendingEvents: [],
  loading: false,
  error: null,
};

const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    clearUserData: (state) => {
      state.profile = null;
      state.hostedEvents = [];
      state.attendingEvents = [];
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch user profile
      .addCase(fetchUserProfile.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchUserProfile.fulfilled, (state, action) => {
        state.loading = false;
        state.profile = action.payload;
        state.error = null;
      })
      .addCase(fetchUserProfile.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Fetch user events
      .addCase(fetchUserEvents.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchUserEvents.fulfilled, (state, action) => {
        state.loading = false;
        // Use hosted and attending arrays directly from API response
        state.hostedEvents = Array.isArray(action.payload.hosted) ? action.payload.hosted : [];
        state.attendingEvents = Array.isArray(action.payload.attending) ? action.payload.attending : [];
        state.error = null;
      })
      .addCase(fetchUserEvents.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { clearError, clearUserData } = userSlice.actions;
export default userSlice.reducer; 