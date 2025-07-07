import React, { useEffect, useState } from 'react';
import api from '../api/axios';
import styles from './UserProfile.module.css';
import { getToken, decodeToken } from '../auth/authUtils';
import { useNavigate } from 'react-router-dom';

const formatDate = (iso) => {
  if (!iso) return '';
  const d = new Date(iso);
  return d.toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' });
};

const SkeletonCard = () => <div className={styles.skeleton} />;

const EventCard = ({ event }) => (
  <div className={styles.eventCard} tabIndex={0}>
    <span className={
      event.visibility === 'PUBLIC'
        ? styles.badge
        : `${styles.badge} ${styles.private}`
    }>
      {event.visibility}
    </span>
    <div className={styles.eventTitle}>{event.title}</div>
    <div className={styles.eventLocation}>{event.location}</div>
    <div className={styles.eventTime}>{formatDate(event.startTime)}</div>
  </div>
);

const UserProfile = () => {
  const [user, setUser] = useState(null);
  const [hosted, setHosted] = useState([]);
  const [attending, setAttending] = useState([]);
  const [loadingUser, setLoadingUser] = useState(true);
  const [loadingEvents, setLoadingEvents] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const token = getToken();
  const jwtUser = decodeToken(token);

  useEffect(() => {
    if (!token) {
      navigate('/');
      return;
    }
    setLoadingUser(true);
    setError('');
    api.get('/users/me')
      .then(res => {
        setUser(res.data);
        setLoadingUser(false);
      })
      .catch(() => {
        setError('Failed to load user info.');
        setLoadingUser(false);
      });
    setLoadingEvents(true);
    api.get('/users/me/events')
      .then(res => {
        // Handle { hosted: [], attending: [] } structure
        const data = res.data || {};
        setHosted(Array.isArray(data.hosted) ? data.hosted : []);
        setAttending(Array.isArray(data.attending) ? data.attending : []);
        setLoadingEvents(false);
      })
      .catch(() => {
        setError('Failed to load your events.');
        setLoadingEvents(false);
      });
    // eslint-disable-next-line
  }, []);

  return (
    <div className={styles.container}>
      <div className={styles.profileCard}>
        <div className={styles.profileTitle}>User Profile</div>
        {loadingUser ? (
          <SkeletonCard />
        ) : user ? (
          <>
            <div className={styles.profileInfo}><b>Name:</b> {user.name}</div>
            <div className={styles.profileInfo}><b>Email:</b> {user.email}</div>
            <div className={styles.profileInfo}><b>Role:</b> {user.role}</div>
            {user.createdAt && (
              <div className={styles.profileInfo}><b>Joined:</b> {formatDate(user.createdAt)}</div>
            )}
          </>
        ) : (
          <div className={styles.empty}>{error || 'User not found.'}</div>
        )}
      </div>
      <div className={styles.section}>
        <div className={styles.sectionTitle}>Events You're Hosting</div>
        {loadingEvents ? (
          <div className={styles.eventGrid}>
            {[...Array(2)].map((_, i) => <SkeletonCard key={i} />)}
          </div>
        ) : hosted.length === 0 ? (
          <div className={styles.empty}>You are not hosting any events.</div>
        ) : (
          <div className={styles.eventGrid}>
            {hosted.map(event => <EventCard event={event} key={event.id} />)}
          </div>
        )}
      </div>
      <div className={styles.section}>
        <div className={styles.sectionTitle}>Events You're Attending</div>
        {loadingEvents ? (
          <div className={styles.eventGrid}>
            {[...Array(2)].map((_, i) => <SkeletonCard key={i} />)}
          </div>
        ) : attending.length === 0 ? (
          <div className={styles.empty}>You are not attending any events.</div>
        ) : (
          <div className={styles.eventGrid}>
            {attending.map(event => <EventCard event={event} key={event.id} />)}
          </div>
        )}
      </div>
    </div>
  );
};

export default UserProfile; 