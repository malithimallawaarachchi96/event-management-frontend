import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';
import { getToken, logout, decodeToken } from '../auth/authUtils';
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
  const [events, setEvents] = useState([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    location: '',
    visibility: '',
    dateFrom: '',
    dateTo: '',
  });
  const [showFilters, setShowFilters] = useState(true);
  const navigate = useNavigate();

  const token = getToken();
  const user = decodeToken(token);
  const userId = user?.userId;

  // Build query params from filters
  const buildParams = () => {
    const params = {};
    if (filters.location) params.location = filters.location;
    if (filters.visibility) params.visibility = filters.visibility;
    if (filters.dateFrom) params.dateFrom = filters.dateFrom;
    if (filters.dateTo) params.dateTo = filters.dateTo;
    return params;
  };

  const fetchEvents = () => {
    setLoading(true);
    setError('');
    api.get('/events/', { params: buildParams() })
      .then(res => {
        setEvents(res.data);
        setLoading(false);
      })
      .catch(err => {
        if (err.response && (err.response.status === 401 || err.response.status === 403)) {
          handleLogout();
        } else {
          setError('Failed to fetch events.');
          setLoading(false);
        }
      });
  };

  useEffect(() => {
    if (!token) {
      handleLogout();
      return;
    }
    fetchEvents();
    // eslint-disable-next-line
  }, [filters]);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const handleProfile = () => {
    navigate('/profile');
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(f => ({ ...f, [name]: value }));
  };

  const handleClearFilters = () => {
    setFilters({ location: '', visibility: '', dateFrom: '', dateTo: '' });
  };

  // AttendanceStatus options
  const attendanceOptions = [
    { value: 'GOING', label: 'Going', className: styles.going },
    { value: 'MAYBE', label: 'Maybe', className: styles.maybe },
    { value: 'DECLINED', label: 'Declined', className: styles.declined },
  ];

  // Track RSVP status per event
  const [attendance, setAttendance] = useState({}); // { [eventId]: 'GOING' | 'MAYBE' | 'DECLINED' }
  const [attLoading, setAttLoading] = useState({}); // { [eventId]: boolean }
  const [attMsg, setAttMsg] = useState({}); // { [eventId]: string }
  const [attError, setAttError] = useState({}); // { [eventId]: string }

  const handleAttendance = async (eventId, status) => {
    setAttLoading(a => ({ ...a, [eventId]: true }));
    setAttError(e => ({ ...e, [eventId]: '' }));
    setAttMsg(m => ({ ...m, [eventId]: '' }));
    try {
      await api.post(`/events/${eventId}/attendance`, {
        userId,
        status,
      });
      setAttendance(a => ({ ...a, [eventId]: status }));
      setAttMsg(m => ({ ...m, [eventId]: 'Attendance updated!' }));
    } catch (err) {
      setAttError(e => ({ ...e, [eventId]: 'Failed to update attendance.' }));
    } finally {
      setAttLoading(a => ({ ...a, [eventId]: false }));
    }
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
          onSubmit={e => { e.preventDefault(); fetchEvents(); }}
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
              value={filters.dateFrom}
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
              value={filters.dateTo}
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
              {/* Attendance UI */}
              <div className={styles.attendanceBar}>
                <span style={{ fontWeight: 500, color: '#6366f1', marginRight: 6 }}>Your RSVP:</span>
                {attendanceOptions.map(opt => (
                  <button
                    key={opt.value}
                    className={
                      [styles.attendanceBtn, styles[opt.value.toLowerCase()], attendance[event.id] === opt.value ? styles.selected : '']
                        .filter(Boolean).join(' ')
                    }
                    disabled={attLoading[event.id]}
                    onClick={() => handleAttendance(event.id, opt.value)}
                    type="button"
                    aria-pressed={attendance[event.id] === opt.value}
                  >
                    {opt.label}
                    {attendance[event.id] === opt.value && ' ✓'}
                  </button>
                ))}
                {attLoading[event.id] && <span className="spinner" style={{ width: 18, height: 18, border: '2.5px solid #6366f1', borderTop: '2.5px solid #fff', borderRadius: '50%', display: 'inline-block', animation: 'spin 0.7s linear infinite', marginLeft: 6 }} />}
                {attMsg[event.id] && <span className={styles.attendanceMsg}>{attMsg[event.id]}</span>}
                {attError[event.id] && <span className={styles.attendanceError}>{attError[event.id]}</span>}
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
