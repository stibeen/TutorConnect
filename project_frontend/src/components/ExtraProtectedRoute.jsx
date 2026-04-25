import { useAuth } from '@/context/AuthContext';
import { Navigate, useLocation } from 'react-router-dom';

export default function ExtraProtectedRoute({ children }) {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return <div className="flex justify-center items-center h-screen">Loading...</div>;
  }
  
  // Redirect to admin login if not authenticated
  if (!user || user.role !== 'admin') {
    return <Navigate to="/loginAdmin" state={{ from: location }} replace />;
  }

  return children;
}