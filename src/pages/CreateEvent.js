import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppDispatch } from '../app/hooks';
import { useAuth } from '../app/hooks';
import { createEvent } from '../features/events/eventSlice';
import styles from './CreateEvent.module.css';

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
  const [success, setSuccess] = useState('');
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  
  // Get user from Redux
  const { user } = useAuth();
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
    setSuccess('');
  };

  const handleSubmit = async e => {
    e.preventDefault();
    setSuccess('');
    if (!validate()) return;
    
    const result = await dispatch(createEvent({
      ...form,
      visibility: form.visibility,
      hostId: userId,
    }));
    
    if (createEvent.fulfilled.match(result)) {
      setSuccess('Event created successfully!');
      setForm(initialState);
      setTimeout(() => navigate('/home'), 1200);
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
              required
            />
            <label htmlFor="endTime" className={styles.label}>End Time</label>
            <div className={styles.error}>{errors.endTime}</div>
          </div>
          <button
            className={styles.button}
            type="submit"
          >
            Create Event
          </button>
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