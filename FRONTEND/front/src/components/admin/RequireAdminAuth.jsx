import { Navigate } from 'react-router-dom';
import { isAdminLoggedIn } from '../../services/api';

function RequireAdminAuth({ children }) {
  if (!isAdminLoggedIn()) {
    return <Navigate to="/admin/login" replace />;
  }
  return children;
}

export default RequireAdminAuth;