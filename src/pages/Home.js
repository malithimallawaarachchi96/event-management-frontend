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
  const navigate = useNavigate();

  // Get user info from token
  const token = getToken();
  const user = decodeToken(token);

  useEffect(() => {
    if (!token) {
      handleLogout();
      return;
    }
    api.get('/events/')
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
    // eslint-disable-next-line
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div className={styles.welcome}>
          Welcome <b>{user?.sub || user?.email || 'User'}</b>
        </div>
        <button className={styles.logout} onClick={handleLogout}>Logout</button>
      </div>
      {loading ? (
        <div className={styles.grid}>
          {[...Array(3)].map((_, i) => <SkeletonCard key={i} />)}
        </div>
      ) : error ? (
        <div className={styles.empty} style={{ color: '#e53e3e' }}>{error}</div>
      ) : events.length === 0 ? (
        <div className={styles.empty}>No upcoming events found.</div>
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
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Home; 