import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppDispatch, useEvents, useAuth, useFilteredEvents } from '../app/hooks';
import { fetchEvents, deleteEvent, markAttendance, setFilters, clearFilters, clearError } from '../features/events/eventSlice';
import { logoutUser } from '../features/auth/authSlice';
import styles from './Home.module.css';

const formatDate = (iso) => {
  if (!iso) return '';
  const d = new Date(iso);
  return d.toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' });
};

const SkeletonCard = () => (
  <div className={styles.skeleton} />
);

const Home = () => {
  const [showFilters, setShowFilters] = React.useState(true);
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  
  // Get state from Redux
  const { user, isAuthenticated } = useAuth();
  const { loading, error, filters } = useEvents();
  const events = useFilteredEvents();
  
  // Clear error when component unmounts
  useEffect(() => {
    return () => {
      if (error) {
        dispatch(clearError());
      }
    };
  }, [dispatch, error]);
  
  const userId = user?.userId;

  useEffect(() => {
    if (!isAuthenticated) {
      handleLogout();
      return;
    }
    dispatch(fetchEvents());
  }, [dispatch, isAuthenticated]);

  const handleLogout = () => {
    dispatch(logoutUser());
    navigate('/');
  };

  const handleProfile = () => {
    navigate('/profile');
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    dispatch(setFilters({ [name]: value }));
  };

  const handleClearFilters = () => {
    dispatch(clearFilters());
  };

  // AttendanceStatus options
  const attendanceOptions = [
    { value: 'GOING', label: 'Going', className: styles.going },
    { value: 'MAYBE', label: 'Maybe', className: styles.maybe },
    { value: 'DECLINED', label: 'Declined', className: styles.declined },
  ];

  const handleAttendance = async (eventId, status) => {
    dispatch(markAttendance({ eventId, status }));
  };

  const handleDeleteEvent = async (eventId) => {
    if (!window.confirm('Are you sure you want to delete this event?')) {
      return;
    }
    dispatch(deleteEvent(eventId));
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div className={styles.welcome}>
          Welcome <b>{user?.sub || user?.email || 'User'}</b>
        </div>
        <div style={{ display: 'flex', gap: '0.7rem' }}>
          <button className={styles.logout} onClick={() => navigate('/create')} style={{ background: '#22c55e' }}>Create Event</button>
          <button className={styles.logout} onClick={handleProfile} style={{ background: '#4f46e5' }}>Profile</button>
          <button className={styles.logout} onClick={handleLogout}>Logout</button>
        </div>
      </div>
      <button
        className={styles.collapseToggle}
        onClick={() => setShowFilters(f => !f)}
        aria-expanded={showFilters}
        aria-controls="filterBar"
      >
        {showFilters ? 'Hide Filters ▲' : 'Show Filters ▼'}
      </button>
      {showFilters && (
        <form
          className={styles.filterBar}
          id="filterBar"
          onSubmit={e => { e.preventDefault(); dispatch(fetchEvents()); }}
        >
          <div className={styles.filterGroup}>
            <label className={styles.filterLabel} htmlFor="location">Location</label>
            <input
              className={styles.filterInput}
              type="text"
              id="location"
              name="location"
              value={filters.location}
              onChange={handleFilterChange}
              placeholder="e.g. Colombo"
              autoComplete="off"
            />
          </div>
          <div className={styles.filterGroup}>
            <label className={styles.filterLabel} htmlFor="visibility">Visibility</label>
            <select
              className={styles.filterSelect}
              id="visibility"
              name="visibility"
              value={filters.visibility}
              onChange={handleFilterChange}
            >
              <option value="">All</option>
              <option value="PUBLIC">Public</option>
              <option value="PRIVATE">Private</option>
            </select>
          </div>
          <div className={styles.filterGroup}>
            <label className={styles.filterLabel} htmlFor="dateFrom">From</label>
            <input
              className={styles.filterInput}
              type="date"
              id="dateFrom"
              name="dateFrom"
              value={filters.startDate}
              onChange={handleFilterChange}
            />
          </div>
          <div className={styles.filterGroup}>
            <label className={styles.filterLabel} htmlFor="dateTo">To</label>
            <input
              className={styles.filterInput}
              type="date"
              id="dateTo"
              name="dateTo"
              value={filters.endDate}
              onChange={handleFilterChange}
            />
          </div>
          <div className={styles.filterActions}>
            <button
              className={styles.filterBtn}
              type="submit"
              disabled={loading}
            >
              Filter
            </button>
            <button
              className={styles.filterBtn}
              type="button"
              onClick={handleClearFilters}
              disabled={loading}
            >
              Clear Filters
            </button>
          </div>
        </form>
      )}
      {loading ? (
        <div className={styles.grid}>
          {[...Array(3)].map((_, i) => <SkeletonCard key={i} />)}
        </div>
      ) : error ? (
        <div className={styles.empty} style={{ color: '#e53e3e' }}>{error}</div>
      ) : events.length === 0 ? (
        <div className={styles.empty}>No events match your filters.</div>
      ) : (
        <div className={styles.grid}>
          {events.map(event => (
            <div className={styles.card} key={event.id} tabIndex={0}>
              <span className={
                event.visibility === 'PUBLIC'
                  ? styles.badge
                  : `${styles.badge} ${styles.private}`
              }>
                {event.visibility}
              </span>
              <div className={styles.title}>{event.title}</div>
              <div className={styles.host}>Host: {event.hostName}</div>
              <div className={styles.location}>Location: {event.location}</div>
              <div className={styles.time}>
                {formatDate(event.startTime)} — {formatDate(event.endTime)}
              </div>
              <div className={styles.description}>{event.description}</div>
              {/* Delete button for events user is hosting */}
              {event.hostId === userId && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDeleteEvent(event.id);
                  }}
                  style={{
                    background: '#ef4444',
                    color: 'white',
                    border: 'none',
                    borderRadius: '0.5rem',
                    padding: '0.4rem 0.8rem',
                    fontSize: '0.9rem',
                    cursor: 'pointer',
                    marginTop: '0.5rem',
                  }}
                >
                  Delete Event
                </button>
              )}
              {/* Attendance UI */}
              <div className={styles.attendanceBar}>
                <span style={{ fontWeight: 500, color: '#6366f1', marginRight: 6 }}>Your RSVP:</span>
                {attendanceOptions.map(opt => (
                  <button
                    key={opt.value}
                    className={[
                      styles.attendanceBtn,
                      styles[opt.value.toLowerCase()],
                      event.attendance === opt.value ? styles.selected : ''
                    ].filter(Boolean).join(' ')}
                    onClick={() => handleAttendance(event.id, opt.value)}
                    type="button"
                    aria-pressed={event.attendance === opt.value}
                  >
                    {opt.label}
                    {event.attendance === opt.value && ' ✓'}
                  </button>
                ))}
              </div>
              <style>{`@keyframes spin { 100% { transform: rotate(360deg); } }`}</style>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Home;
