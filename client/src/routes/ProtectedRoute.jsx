import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function ProtectedRoute() {
  const { user, loading, firebaseConfigured } = useAuth();
  if (loading) return <main className="grid min-h-screen place-items-center">Loading…</main>;
  if (!firebaseConfigured) return <Navigate to="/login" replace state={{ configurationRequired: true }} />;
  return user ? <Outlet /> : <Navigate to="/login" replace />;
}
