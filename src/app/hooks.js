import { useDispatch, useSelector } from 'react-redux';
import { store } from './store';

// Use throughout your app instead of plain `useDispatch` and `useSelector`
export const useAppDispatch = useDispatch;
export const useAppSelector = useSelector;

// Custom hook to get auth state
export const useAuth = () => {
  return useSelector((state) => state.auth);
};

// Custom hook to get events state
export const useEvents = () => {
  return useSelector((state) => state.events);
};

// Custom hook to get user state
export const useUser = () => {
  return useSelector((state) => state.user);
};

// Custom hook to get filtered events
export const useFilteredEvents = () => {
  const { events, filters } = useSelector((state) => state.events);
  
  return events.filter(event => {
    // Filter by location
    if (filters.location && !event.location.toLowerCase().includes(filters.location.toLowerCase())) {
      return false;
    }
    
    // Filter by visibility
    if (filters.visibility && event.visibility !== filters.visibility) {
      return false;
    }
    
    // Filter by start date
    if (filters.startDate && new Date(event.startTime) < new Date(filters.startDate)) {
      return false;
    }
    
    // Filter by end date
    if (filters.endDate && new Date(event.endTime) > new Date(filters.endDate)) {
      return false;
    }
    
    return true;
  });
}; 