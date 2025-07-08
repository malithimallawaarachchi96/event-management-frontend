import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppDispatch } from '../app/hooks';
import { useAuth, useUser } from '../app/hooks';
import { deleteEvent } from '../features/events/eventSlice';
import { fetchUserProfile, fetchUserEvents } from '../features/user/userSlice';
import styles from './UserProfile.module.css';

const formatDate = (iso) => {
  if (!iso) return '';
  const d = new Date(iso);
  return d.toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' });
};

const SkeletonCard = () => <div className={styles.skeleton} />;

const EventCard = ({ event, onDelete, userId }) => (
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
    {/* Delete button for events user is hosting */}
    {event.hostId === userId && (
      <button
        onClick={(e) => {
          e.stopPropagation();
          onDelete(event.id);
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
  </div>
);

const UserProfile = () => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  
  // Get state from Redux
  const { isAuthenticated } = useAuth();
  const { profile: user, hostedEvents: hosted, attendingEvents: attending, loading, error } = useUser();
  
  const userId = user?.userId;

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/');
      return;
    }
    dispatch(fetchUserProfile());
    dispatch(fetchUserEvents());
  }, [dispatch, isAuthenticated, navigate]);

  const handleDeleteEvent = async (eventId) => {
    if (!window.confirm('Are you sure you want to delete this event?')) {
      return;
    }
    dispatch(deleteEvent(eventId));
  };

  return (
    <div className={styles.container}>
      <div className={styles.profileCard}>
        <div className={styles.profileTitle}>User Profile</div>
        {loading ? (
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
        {loading ? (
          <div className={styles.eventGrid}>
            {[...Array(2)].map((_, i) => <SkeletonCard key={i} />)}
          </div>
        ) : hosted.length === 0 ? (
          <div className={styles.empty}>You are not hosting any events.</div>
        ) : (
          <div className={styles.eventGrid}>
            {hosted.map(event => (
              <EventCard 
                event={event} 
                key={event.id} 
                onDelete={handleDeleteEvent}
                userId={userId}
              />
            ))}
          </div>
        )}
      </div>
      <div className={styles.section}>
        <div className={styles.sectionTitle}>Events You're Attending</div>
        {loading ? (
          <div className={styles.eventGrid}>
            {[...Array(2)].map((_, i) => <SkeletonCard key={i} />)}
          </div>
        ) : attending.length === 0 ? (
          <div className={styles.empty}>You are not attending any events.</div>
        ) : (
          <div className={styles.eventGrid}>
            {attending.map(event => (
              <EventCard 
                event={event} 
                key={event.id} 
                onDelete={handleDeleteEvent}
                userId={userId}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default UserProfile; 