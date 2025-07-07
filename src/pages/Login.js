import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';
import { setToken } from '../auth/authUtils';
import styles from './Login.module.css';
import logo from '../logo.svg';

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [emailError, setEmailError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const navigate = useNavigate();

  const validate = () => {
    let valid = true;
    setEmailError('');
    setPasswordError('');
    if (!email) {
      setEmailError('Email is required');
      valid = false;
    } else if (!emailRegex.test(email)) {
      setEmailError('Enter a valid email');
      valid = false;
    }
    if (!password) {
      setPasswordError('Password is required');
      valid = false;
    }
    return valid;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (!validate()) return;
    setLoading(true);
    try {
      const response = await api.post('/auth/login', { email, password });
      setToken(response.data.token);
      navigate('/home');
    } catch (err) {
      setError('Invalid email or password');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.card}>
        <div className={styles.header}>
          <img src={logo} alt="Event Manager" className={styles.logo} />
          <div className={styles.title}>Event Manager Login</div>
        </div>
        <form className={styles.form} onSubmit={handleSubmit} autoComplete="on">
          <div className={styles.inputGroup}>
            <input
              className={styles.input}
              type="email"
              id="email"
              name="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              autoComplete="email"
              placeholder=" "
              disabled={loading}
              aria-invalid={!!emailError}
              required
            />
            <label htmlFor="email" className={styles.label}>Email</label>
            <div className={styles.error}>{emailError}</div>
          </div>
          <div className={styles.inputGroup} style={{ position: 'relative' }}>
            <input
              className={styles.input}
              type={showPassword ? 'text' : 'password'}
              id="password"
              name="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              autoComplete="current-password"
              placeholder=" "
              disabled={loading}
              aria-invalid={!!passwordError}
              required
              onKeyDown={e => { if (e.key === 'Enter') handleSubmit(e); }}
            />
            <label htmlFor="password" className={styles.label}>Password</label>
            <button
              type="button"
              className={styles.toggle}
              tabIndex={-1}
              aria-label={showPassword ? 'Hide password' : 'Show password'}
              onClick={() => setShowPassword(v => !v)}
              disabled={loading}
            >
              {showPassword ? '🙈' : '👁️'}
            </button>
            <div className={styles.error}>{passwordError}</div>
          </div>
          <div className={styles.forgot}>
            <a href="#" tabIndex={loading ? -1 : 0} aria-disabled={loading}>Forgot password?</a>
          </div>
          <button
            className={styles.button}
            type="submit"
            disabled={loading || !email || !password}
          >
            {loading ? (
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}>
                <span className="spinner" style={{ width: 18, height: 18, border: '2.5px solid #fff', borderTop: '2.5px solid #6366f1', borderRadius: '50%', display: 'inline-block', animation: 'spin 0.7s linear infinite' }} />
                Logging in...
              </span>
            ) : 'Login'}
          </button>
          {error && <div className={styles.error} style={{ textAlign: 'center', marginTop: 2 }}>{error}</div>}
        </form>
      </div>
      <style>{`
        @keyframes spin { 100% { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
};

export default Login; 