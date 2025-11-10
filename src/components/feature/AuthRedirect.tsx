// src/components/auth/AuthRedirect.tsx
import React, { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';

interface AuthRedirectProps {
  children: React.ReactNode;
}

// Các route cần đăng nhập mới xem
const PROTECTED_PREFIXES = ['/dashboard', '/checkin', '/manage', '/statistics'];
// Các route public (ví dụ màn hình hiển thị checkin đặt trước cửa)
const PUBLIC_ROUTES = ['/', '/checkin-display']; // thêm đường dẫn public khác nếu có

const isProtectedPath = (path: string) =>
  PROTECTED_PREFIXES.some(p => path === p || path.startsWith(p + '/'));

const AuthRedirect: React.FC<AuthRedirectProps> = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (loading) return;

    const path = location.pathname;
    const search = location.search;
    const hash = location.hash;

    // Nếu đã đăng nhập và đang ở trang chủ → đẩy sang dashboard
    if (isAuthenticated && path === '/') {
      // Hỗ trợ ?redirect=/path
      const params = new URLSearchParams(search);
      const redirect = params.get('redirect');
      if (redirect) {
        navigate(redirect, { replace: true });
      } else {
        navigate('/dashboard', { replace: true });
      }
      return;
    }

    // Nếu chưa đăng nhập và đang vào trang được bảo vệ → đưa về trang chủ + nhớ redirect
    if (!isAuthenticated && isProtectedPath(path)) {
      const redirectTo = encodeURIComponent(path + search + hash);
      navigate(`/?redirect=${redirectTo}`, {
        replace: true,
        state: { from: location }, // để LoginPage đọc và quay lại
      });
    }
  }, [isAuthenticated, loading, location.pathname, location.search, location.hash, navigate]);

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
