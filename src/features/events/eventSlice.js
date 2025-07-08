import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from '../../api/axios';

// Async thunk for fetching events
export const fetchEvents = createAsyncThunk(
  'events/fetchEvents',
  async (_, { rejectWithValue }) => {
    try {
      const response = await axios.get('/events/');
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch events');
    }
  }
);

// Async thunk for creating an event
export const createEvent = createAsyncThunk(
  'events/createEvent',
  async (eventData, { rejectWithValue }) => {
    try {
      const response = await axios.post('/events/', eventData);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to create event');
    }
  }
);

// Async thunk for deleting an event
export const deleteEvent = createAsyncThunk(
  'events/deleteEvent',
  async (eventId, { rejectWithValue }) => {
    try {
      await axios.delete(`/events/${eventId}`);
      return eventId;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to delete event');
    }
  }
);

// Async thunk for marking attendance
export const markAttendance = createAsyncThunk(
  'events/markAttendance',
  async ({ eventId, status }, { rejectWithValue }) => {
    try {
      const response = await axios.post(`/events/${eventId}/attendance`, { status });
      return { eventId, attendance: response.data };
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to mark attendance');
    }
  }
);

const initialState = {
  events: [],
  loading: false,
  error: null,
  filters: {
    location: '',
    visibility: '',
    startDate: '',
    endDate: '',
  },
};

const eventSlice = createSlice({
  name: 'events',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    setFilters: (state, action) => {
      state.filters = { ...state.filters, ...action.payload };
    },
    clearFilters: (state) => {
      state.filters = {
        location: '',
        visibility: '',
        startDate: '',
        endDate: '',
      };
    },
    addEvent: (state, action) => {
      state.events.unshift(action.payload);
    },
    updateEvent: (state, action) => {
      const index = state.events.findIndex(event => event.id === action.payload.id);
      if (index !== -1) {
        state.events[index] = action.payload;
      }
    },
    removeEvent: (state, action) => {
      state.events = state.events.filter(event => event.id !== action.payload);
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch events
      .addCase(fetchEvents.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchEvents.fulfilled, (state, action) => {
        state.loading = false;
        state.events = action.payload._embedded?.events || action.payload || [];
        state.error = null;
      })
      .addCase(fetchEvents.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Create event
      .addCase(createEvent.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createEvent.fulfilled, (state, action) => {
        state.loading = false;
        state.events.unshift(action.payload);
        state.error = null;
      })
      .addCase(createEvent.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Delete event
      .addCase(deleteEvent.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteEvent.fulfilled, (state, action) => {
        state.loading = false;
        state.events = state.events.filter(event => event.id !== action.payload);
        state.error = null;
      })
      .addCase(deleteEvent.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Mark attendance
      .addCase(markAttendance.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(markAttendance.fulfilled, (state, action) => {
        state.loading = false;
        const { eventId, attendance } = action.payload;
        const eventIndex = state.events.findIndex(event => event.id === eventId);
        if (eventIndex !== -1) {
          state.events[eventIndex].attendance = attendance;
        }
        state.error = null;
      })
      .addCase(markAttendance.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { 
  clearError, 
  setFilters, 
  clearFilters, 
  addEvent, 
  updateEvent, 
  removeEvent 
} = eventSlice.actions;

export default eventSlice.reducer; 