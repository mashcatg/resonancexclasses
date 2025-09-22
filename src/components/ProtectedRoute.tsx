import { ReactNode, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';

interface ProtectedRouteProps {
  children: ReactNode;
  requireAdmin?: boolean;
  requireSuperAdmin?: boolean;
}

const ProtectedRoute = ({ children, requireAdmin = false, requireSuperAdmin = false }: ProtectedRouteProps) => {
  const { user, profile, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading) {
      if (!user) {
        navigate('/login');
        return;
      }

      if (requireSuperAdmin && profile?.role !== 'superadmin') {
        navigate('/dashboard');
        return;
      }

      if (requireAdmin && !(['admin', 'superadmin'].includes(profile?.role || ''))) {
        navigate('/dashboard');
        return;
      }
    }
  }, [user, profile, loading, navigate, requireAdmin, requireSuperAdmin]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-hero flex items-center justify-center">
        <div className="text-white">Loading...</div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  if (requireSuperAdmin && profile?.role !== 'superadmin') {
    return null;
  }

  if (requireAdmin && !(['admin', 'superadmin'].includes(profile?.role || ''))) {
    return null;
  }

  return <>{children}</>;
};

export default ProtectedRoute;