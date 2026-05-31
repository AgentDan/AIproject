import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuthStore } from '../auth/store/authStore.js';

export function AdminGuard() {
  const user = useAuthStore((s) => s.user);
  const token = useAuthStore((s) => s.token);
  const location = useLocation();

  if (!user || !token) {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  }

  if (user.role !== 'administrator') {
    return <Navigate to="/" replace />;
  }

  return <Outlet />;
}
