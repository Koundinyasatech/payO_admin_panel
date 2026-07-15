import { Navigate } from 'react-router-dom';
import { useContext } from 'react';
import { AppCtx } from '../App';
import { ROLE_ACCESS } from '../config/roles';

export function ProtectedRoute({ path, children }) {
  const { adminRole } = useContext(AppCtx);
  const allowed = ROLE_ACCESS[path] || [];
  if (!adminRole || !allowed.includes(adminRole)) {
    return <Navigate to="/" replace />;
  }
  return children;
}