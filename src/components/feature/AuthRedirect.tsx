import React, { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';

interface AuthRedirectProps {
  children: React.ReactNode;
}

const AuthRedirect: React.FC<AuthRedirectProps> = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
  console.log('Auth status:', { isAuthenticated, loading, path: location.pathname });

  if (loading) return;

  if (isAuthenticated && location.pathname === '/') {
    console.log('➡ Redirect: / → /dashboard');
    navigate('/dashboard', { replace: true });
    return;
  }

  if (!isAuthenticated) {
    const protectedRoutes = ['/dashboard', '/checkin', '/manage', '/statistics'];
    if (protectedRoutes.includes(location.pathname)) {
      console.log('➡ Redirect: not auth → /');
      navigate('/', { replace: true });
    }
  }
}, [isAuthenticated, loading, location.pathname, navigate]);


  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Đang tải...</p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
};

export default AuthRedirect;
