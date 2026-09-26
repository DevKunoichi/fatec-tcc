import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const ProtectedRoute = ({ children, adminOnly = false }) => {
  const { authenticated, user } = useAuth();
  const location = useLocation();

  if (!authenticated) {
    return <Navigate to="/login" state={{ from: location.pathname }} replace />;
  }
  if (adminOnly && user?.perfil !== 'ADMIN') {
    return <Navigate to="/" replace />;
  }
  return children;
};

export default ProtectedRoute;