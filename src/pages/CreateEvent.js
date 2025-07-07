import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';
import styles from './CreateEvent.module.css';
import { decodeToken, getToken } from '../auth/authUtils';

const initialState = {
  title: '',
  description: '',
  location: '',
  visibility: '',
  startTime: '',
  endTime: '',
};

const CreateEvent = () => {
  const [form, setForm] = useState(initialState);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState('');
  const [apiError, setApiError] = useState('');
  const navigate = useNavigate();

  // Get user id from JWT
  const token = getToken();
  const user = decodeToken(token);
  const userId = user?.userId;

  const validate = () => {
    const errs = {};
    if (!form.title.trim()) errs.title = 'Title is required';
    if (!form.description.trim()) errs.description = 'Description is required';
    if (!form.location.trim()) errs.location = 'Location is required';
    if (!form.visibility) errs.visibility = 'Visibility is required';
    if (!form.startTime) errs.startTime = 'Start time is required';
    if (!form.endTime) errs.endTime = 'End time is required';
    if (form.startTime && form.endTime && form.startTime >= form.endTime) {
      errs.endTime = 'End time must be after start time';
    }
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleChange = e => {
    const { name, value } = e.target;
    setForm(f => ({ ...f, [name]: value }));
    setErrors(errs => ({ ...errs, [name]: undefined }));
    setApiError('');
    setSuccess('');
  };

  const handleSubmit = async e => {
    e.preventDefault();
    setApiError('');
    setSuccess('');
    if (!validate()) return;
    setLoading(true);
    try {
      await api.post('/events/', {
        ...form,
        visibility: form.visibility,
        hostId: userId,
      });
      setSuccess('Event created successfully!');
      setForm(initialState);
      setTimeout(() => navigate('/home'), 1200);
    } catch (err) {
      setApiError(
        err.response?.data?.message || 'Failed to create event. Please try again.'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.card}>
        <div className={styles.header}>
          <div className={styles.title}>Create New Event</div>
        </div>
        <form className={styles.form} onSubmit={handleSubmit} autoComplete="off">
          <div className={styles.inputGroup}>
            <input
              className={styles.input}
              type="text"
              name="title"
              id="title"
              value={form.title}
              onChange={handleChange}
              placeholder=" "
              disabled={loading}
              required
            />
            <label htmlFor="title" className={styles.label}>Title</label>
            <div className={styles.error}>{errors.title}</div>
          </div>
          <div className={styles.inputGroup}>
            <textarea
              className={styles.textarea}
              name="description"
              id="description"
              value={form.description}
              onChange={handleChange}
              placeholder=" "
              disabled={loading}
              required
            />
            <label htmlFor="description" className={styles.label}>Description</label>
            <div className={styles.error}>{errors.description}</div>
          </div>
          <div className={styles.inputGroup}>
            <input
              className={styles.input}
              type="text"
              name="location"
              id="location"
              value={form.location}
              onChange={handleChange}
              placeholder=" "
              disabled={loading}
              required
            />
            <label htmlFor="location" className={styles.label}>Location</label>
            <div className={styles.error}>{errors.location}</div>
          </div>
          <div className={styles.inputGroup}>
            <select
              className={styles.select}
              name="visibility"
              id="visibility"
              value={form.visibility}
              onChange={handleChange}
              disabled={loading}
              required
            >
              <option value="" disabled hidden></option>
              <option value="PUBLIC">Public</option>
              <option value="PRIVATE">Private</option>
            </select>
            <label htmlFor="visibility" className={styles.label}>Visibility</label>
            <div className={styles.error}>{errors.visibility}</div>
          </div>
          <div className={styles.inputGroup}>
            <input
              className={styles.input}
              type="datetime-local"
              name="startTime"
              id="startTime"
              value={form.startTime}
              onChange={handleChange}
              disabled={loading}
              required
            />
            <label htmlFor="startTime" className={styles.label}>Start Time</label>
            <div className={styles.error}>{errors.startTime}</div>
          </div>
          <div className={styles.inputGroup}>
            <input
              className={styles.input}
              type="datetime-local"
              name="endTime"
              id="endTime"
              value={form.endTime}
              onChange={handleChange}
              disabled={loading}
              required
            />
            <label htmlFor="endTime" className={styles.label}>End Time</label>
            <div className={styles.error}>{errors.endTime}</div>
          </div>
          <button
            className={styles.button}
            type="submit"
            disabled={loading}
          >
            {loading ? (
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}>
                <span className="spinner" style={{ width: 18, height: 18, border: '2.5px solid #fff', borderTop: '2.5px solid #6366f1', borderRadius: '50%', display: 'inline-block', animation: 'spin 0.7s linear infinite' }} />
                Creating...
              </span>
            ) : 'Create Event'}
          </button>
          {apiError && <div className={styles.error} style={{ textAlign: 'center', marginTop: 2 }}>{apiError}</div>}
          {success && <div className={styles.success}>{success}</div>}
        </form>
        <style>{`
          @keyframes spin { 100% { transform: rotate(360deg); } }
        `}</style>
      </div>
    </div>
  );
};

export default CreateEvent; 