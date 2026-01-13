import { Navigate } from 'react-router-dom';
import { useAuth } from '@context/AuthContext.jsx';
import { hasPermission } from '@utils/roles.js';
import Loading from './Loading.jsx';

const ProtectedRoute = ({ children, allowedRoles = [] }) => {
  const { isAuthenticated, user, loading } = useAuth();

  if (loading) {
    return <Loading />;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles.length > 0 && !hasPermission(user?.role, allowedRoles)) {
    return <Navigate to="/homepage" replace />;
  }

  return children;
};

export default ProtectedRoute;

