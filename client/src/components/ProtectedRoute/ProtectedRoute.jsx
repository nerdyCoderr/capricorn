import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';

const ProtectedRoute = ({ children, isAuth }) => {
  const location = useLocation();

  if (!isAuth) {
    return (
      <Navigate
        to='/'
        state={{ from: location }}
      />
    );
  }

  return children;
};

export default ProtectedRoute;
