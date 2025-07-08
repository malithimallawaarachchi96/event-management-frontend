import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../app/hooks';

const PrivateRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();

  if (loading) return null; // Optionally show a spinner

  return isAuthenticated ? children : <Navigate to="/login" replace />;
};

export default PrivateRoute; 