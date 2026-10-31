import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import type { Role } from '@nihao-deutsch/shared';
import { useAuthStore } from '../store/authStore';

export const RequireAuth: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const location = useLocation();

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }
  return <>{children}</>;
};

export const RequireBound: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const isFirstBind = useAuthStore((s) => s.isFirstBind);

  if (isFirstBind) {
    return <Navigate to="/bind" replace />;
  }
  return <>{children}</>;
};

export const RequireRole: React.FC<{ roles: Role[]; children: React.ReactNode }> = ({ roles, children }) => {
  const role = useAuthStore((s) => s.role);
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  if (role && !roles.includes(role)) {
    const home = role === 'teacher' ? '/teacher' : role === 'admin' ? '/admin' : '/student';
    return <Navigate to={home} replace />;
  }
  return <>{children}</>;
};