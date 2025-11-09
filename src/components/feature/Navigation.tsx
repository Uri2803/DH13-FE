import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';

const Navigation: React.FC = () => {
  const { user, logout } = useAuth();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const navigate = useNavigate();

  const handleLogout = () => {
    // bảo vệ khi logout có thể không tồn tại (nếu dùng hook khác)
    if (typeof logout === 'function') logout();
    navigate('/');
  };

  const isAdmin = user?.role === 'admin';
  const displayName = user?.name || user?.code|| 'Khách';

  return (
    <nav className="bg-white shadow-lg border-b border-gray-200">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link to="/dashboard" className="flex items-center space-x-2">
          <div className="w-12 h-12 bg-blue-500 rounded-full overflow-hidden flex items-center justify-center shadow-md">
              <img src="/logo-square.png" alt="Logo HSV" className="rounded-full w-10 h-10 object-cover" />
            </div>
            <span className="text-xl font-bold text-gray-800">Đại hội Hội sinh viên</span>
          </Link>

          {/* Desktop Menu */}
          <div className="hidden md:flex items-center space-x-6">
        
            <Link
              to="/wishes"
              className="text-gray-600 hover:text-blue-600 transition-colors"
            >
              <i className="ri-heart-line mr-1"></i>
              Lời chúc
            </Link>
            <Link
              to="/congress-updates"
              className="text-gray-600 hover:text-blue-600 transition-colors"
            >
              <i className="ri-calendar-event-line mr-1"></i>
              Diễn biến
            </Link>
            {isAdmin && (
              <>
                <Link
                  to="/congress-info"
                  className="text-gray-600 hover:text-blue-600 transition-colors"
                >
                  <i className="ri-information-line mr-1"></i>
                  Thông tin ĐH
                </Link>
                <Link
                  to="/manage"
                  className="text-gray-600 hover:text-blue-600 transition-colors"
                >
                  <i className="ri-settings-line mr-1"></i>
                  Quản lý
                </Link>
              </>
            )}
            <Link
              to="/documents"
              className="text-gray-600 hover:text-blue-600 transition-colors"
            >
              <i className="ri-file-text-line mr-1"></i>
              Tài liệu
            </Link>
            <Link
              to="/checkin"
              className="text-gray-600 hover:text-blue-600 transition-colors"
            >
              <i className="ri-qr-code-line mr-1"></i>
              Check-in
            </Link>
            {isAdmin && (
              <Link
                to="/statistics"
                className="text-gray-600 hover:text-blue-600 transition-colors"
              >
                <i className="ri-bar-chart-line mr-1"></i>
                Thống kê
              </Link>
            )}
          </div>

          {/* User Menu */}
          <div className="flex items-center space-x-4">
            <div className="relative">
              <button
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="flex items-center space-x-2 text-gray-600 hover:text-blue-600 transition-colors"
                aria-expanded={isMenuOpen}
                aria-haspopup="true"
              >
                <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                  <i className="ri-user-line text-blue-600"></i>
                </div>
                <span className="hidden md:block truncate max-w-[10rem]">{displayName}</span>
                <i className="ri-arrow-down-s-line"></i>
              </button>

              {isMenuOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-50">
                  <Link
                    to="/profile"
                    className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    <i className="ri-user-line mr-2"></i>
                    Thông tin cá nhân
                  </Link>
                  <button
                    onClick={() => {
                      setIsMenuOpen(false);
                      handleLogout();
                    }}
                    className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                  >
                    <i className="ri-logout-box-line mr-2"></i>
                    Đăng xuất
                  </button>
                </div>
              )}
            </div>

            {/* Mobile menu button */}
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="md:hidden text-gray-600 hover:text-blue-600"
              aria-label="Mở menu"
            >
              <i className="ri-menu-line text-xl"></i>
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="md:hidden py-4 border-t border-gray-200">
            <div className="flex flex-col space-y-2">
              <Link
                to="/dashboard"
                className="text-gray-600 hover:text-blue-600 py-2"
                onClick={() => setIsMenuOpen(false)}
              >
                <i className="ri-dashboard-line mr-2"></i>
                Trang chủ
              </Link>
              <Link
                to="/wishes"
                className="text-gray-600 hover:text-blue-600 py-2"
                onClick={() => setIsMenuOpen(false)}
              >
                <i className="ri-heart-line mr-2"></i>
                Lời chúc
              </Link>
              <Link
                to="/congress-updates"
                className="text-gray-600 hover:text-blue-600 py-2"
                onClick={() => setIsMenuOpen(false)}
              >
                <i className="ri-calendar-event-line mr-2"></i>
                Diễn biến
              </Link>
              {isAdmin && (
                <>
                  <Link
                    to="/congress-info"
                    className="text-gray-600 hover:text-blue-600 py-2"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    <i className="ri-information-line mr-2"></i>
                    Thông tin ĐH
                  </Link>
                  <Link
                    to="/manage"
                    className="text-gray-600 hover:text-blue-600 py-2"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    <i className="ri-settings-line mr-2"></i>
                    Quản lý
                  </Link>
                </>
              )}
              <Link
                to="/documents"
                className="text-gray-600 hover:text-blue-600 py-2"
                onClick={() => setIsMenuOpen(false)}
              >
                <i className="ri-file-text-line mr-2"></i>
                Tài liệu
              </Link>
              <Link
                to="/checkin"
                className="text-gray-600 hover:text-blue-600 py-2"
                onClick={() => setIsMenuOpen(false)}
              >
                <i className="ri-qr-code-line mr-2"></i>
                Check-in
              </Link>
              {isAdmin && (
                <Link
                  to="/statistics"
                  className="text-gray-600 hover:text-blue-600 py-2"
                  onClick={() => setIsMenuOpen(false)}
                >
                  <i className="ri-bar-chart-line mr-2"></i>
                  Thống kê
                </Link>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export { Navigation };
