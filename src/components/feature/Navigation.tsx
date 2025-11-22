import React, { useEffect, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';

const Navigation: React.FC = () => {
  const { user, logout } = useAuth();
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const navigate = useNavigate();
  const userMenuRef = useRef<HTMLDivElement>(null);

  const isAdmin = user?.role === 'admin';
  const displayName = user?.name || user?.code || 'Khách';

  const handleLogout = () => { // Bỏ async ở đây cũng được
    // 1. Đóng UI
    setIsUserMenuOpen(false);
    setIsMobileOpen(false);

    // 2. Chuyển trang về Home TRƯỚC
    // Thêm replace: true để xóa lịch sử lùi lại trang dashboard
    navigate('/', { replace: true });

    // 3. Đợi 1 chút (0ms) cho việc chuyển trang hoàn tất rồi mới gọi hàm logout
    setTimeout(async () => {
        await logout(); // Hàm này chứa setUser(null)
    }, 0);
};

  // Close user dropdown when clicking outside or pressing ESC
  useEffect(() => {
    const onDocClick = (e: MouseEvent) => {
      if (!userMenuRef.current) return;
      if (!userMenuRef.current.contains(e.target as Node)) {
        setIsUserMenuOpen(false);
      }
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsUserMenuOpen(false);
        setIsMobileOpen(false);
      }
    };
    document.addEventListener('mousedown', onDocClick);
    window.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onDocClick);
      window.removeEventListener('keydown', onKey);
    };
  }, []);

  return (
    <nav className="bg-white shadow-lg border-b border-gray-200">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link to="/dashboard" className="flex items-center space-x-2" onClick={() => setIsMobileOpen(false)}>
            <div className="w-12 h-12 bg-blue-500 rounded-full overflow-hidden flex items-center justify-center shadow-md">
              <img src="/logo-square.png" alt="Logo HSV" className="rounded-full w-10 h-10 object-cover" />
            </div>
            <span className="text-lg font-bold text-gray-800">Đại hội Hội sinh viên</span>
          </Link>

          {/* Desktop Menu */}
          <div className="hidden md:flex items-center space-x-6">
            <Link to="/wishes" className="text-gray-600 hover:text-blue-600 transition-colors">
              <i className="ri-heart-line mr-1"></i> Lời chúc
            </Link>
            {isAdmin && (
              <>
                <Link to="/manage" className="text-gray-600 hover:text-blue-600 transition-colors">
                  <i className="ri-settings-line mr-1"></i> Quản lý
                </Link>
              </>
            )}
            <Link to="/documents" className="text-gray-600 hover:text-blue-600 transition-colors">
              <i className="ri-file-text-line mr-1"></i> Tài liệu
            </Link>
            <Link to="/checkin" className="text-gray-600 hover:text-blue-600 transition-colors">
              <i className="ri-qr-code-line mr-1"></i> Check-in
            </Link>
            {isAdmin && (
              <Link to="/statistics" className="text-gray-600 hover:text-blue-600 transition-colors">
                <i className="ri-bar-chart-line mr-1"></i> Thống kê
              </Link>
            )}
          </div>

          {/* User Menu + Mobile toggler */}
          <div className="flex items-center space-x-4">
            {/* User dropdown */}
            <div className="relative" ref={userMenuRef}>
              <button
                onClick={() => setIsUserMenuOpen((v) => !v)}
                className="flex items-center space-x-2 text-gray-600 hover:text-blue-600 transition-colors"
                aria-haspopup="menu"
                aria-expanded={isUserMenuOpen}
                aria-controls="user-menu"
              >
                <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                  <i className="ri-user-line text-blue-600"></i>
                </div>
                <span className="hidden md:block truncate max-w-[10rem]">{displayName}</span>
                <i className="ri-arrow-down-s-line"></i>
              </button>

              {isUserMenuOpen && (
                <div
                  id="user-menu"
                  role="menu"
                  className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-50"
                >
                  <Link
                    to="/profile"
                    className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    onClick={() => setIsUserMenuOpen(false)}
                    role="menuitem"
                  >
                    <i className="ri-user-line mr-2"></i> Thông tin cá nhân
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    role="menuitem"
                  >
                    <i className="ri-logout-box-line mr-2"></i> Đăng xuất
                  </button>
                </div>
              )}
            </div>

            {/* Mobile menu button */}
            <button
              onClick={() => setIsMobileOpen((v) => !v)}
              className="md:hidden text-gray-600 hover:text-blue-600"
              aria-label="Mở menu"
              aria-expanded={isMobileOpen}
              aria-controls="mobile-menu"
            >
              <i className="ri-menu-line text-xl"></i>
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMobileOpen && (
          <div id="mobile-menu" className="md:hidden py-4 border-t border-gray-200">
            <div className="flex flex-col space-y-2">
              <Link to="/dashboard" className="text-gray-600 hover:text-blue-600 py-2" onClick={() => setIsMobileOpen(false)}>
                <i className="ri-dashboard-line mr-2"></i> Trang chủ
              </Link>
              <Link to="/wishes" className="text-gray-600 hover:text-blue-600 py-2" onClick={() => setIsMobileOpen(false)}>
                <i className="ri-heart-line mr-2"></i> Lời chúc
              </Link>
              {isAdmin && (
                <>
                  <Link to="/manage" className="text-gray-600 hover:text-blue-600 py-2" onClick={() => setIsMobileOpen(false)}>
                    <i className="ri-settings-line mr-2"></i> Quản lý
                  </Link>
                </>
              )}
              <Link to="/documents" className="text-gray-600 hover:text-blue-600 py-2" onClick={() => setIsMobileOpen(false)}>
                <i className="ri-file-text-line mr-2"></i> Tài liệu
              </Link>
              <Link to="/checkin" className="text-gray-600 hover:text-blue-600 py-2" onClick={() => setIsMobileOpen(false)}>
                <i className="ri-qr-code-line mr-2"></i> Check-in
              </Link>
              {isAdmin && (
                <Link to="/statistics" className="text-gray-600 hover:text-blue-600 py-2" onClick={() => setIsMobileOpen(false)}>
                  <i className="ri-bar-chart-line mr-2"></i> Thống kê
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
