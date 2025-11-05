
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card } from '../../components/base/Card';
import { Button } from '../../components/base/Button';
import { useAuth } from '../../hooks/useAuth';

const LoginPage: React.FC = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  const { login } = useAuth();
  const navigate = useNavigate();

  // Mock users for demo
  const mockUsers = [
    { username: 'admin', password: 'admin123', role: 'admin' as const, fullName: 'Quản trị viên', id: 'admin1' },
    { username: 'manager1', password: 'manager123', role: 'manager' as const, fullName: 'Nguyễn Văn Quản', id: 'mgr1', unit: 'Khoa Toán - Tin học' },
    { username: 'delegate1', password: 'delegate123', role: 'delegate' as const, fullName: 'Nguyễn Văn An', id: 'del1', unit: 'Khoa Toán - Tin học', delegateCode: 'DT001' },
    { username: 'student1', password: 'student123', role: 'student' as const, fullName: 'Trần Thị Bình', id: 'std1' }
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    // Simulate API call
    setTimeout(() => {
      const user = mockUsers.find(u => u.username === username && u.password === password);
      
      if (user) {
        login(user);
        navigate('/dashboard');
      } else {
        setError('Tên đăng nhập hoặc mật khẩu không đúng');
      }
      setLoading(false);
    }, 1000);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
            <i className="ri-graduation-cap-line text-2xl text-white"></i>
          </div>
          <h1 className="text-2xl font-bold text-gray-800 mb-2">Đăng nhập hệ thống</h1>
          <p className="text-gray-600">Đại hội Hội sinh viên ĐHQG-HCM</p>
        </div>

        <Card>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="username" className="block text-sm font-medium text-gray-700 mb-2">
                Tên đăng nhập
              </label>
              <input
                type="text"
                id="username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Nhập tên đăng nhập"
                required
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                Mật khẩu
              </label>
              <input
                type="password"
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Nhập mật khẩu"
                required
              />
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md">
                <i className="ri-error-warning-line mr-2"></i>
                {error}
              </div>
            )}

            <Button
              type="submit"
              disabled={loading}
              className="w-full"
              size="lg"
            >
              {loading ? (
                <>
                  <i className="ri-loader-4-line animate-spin mr-2"></i>
                  Đang đăng nhập...
                </>
              ) : (
                <>
                  <i className="ri-login-box-line mr-2"></i>
                  Đăng nhập
                </>
              )}
            </Button>
          </form>

          <div className="mt-6 pt-6 border-t border-gray-200">
            <h3 className="text-sm font-medium text-gray-700 mb-3">Tài khoản demo:</h3>
            <div className="space-y-2 text-xs text-gray-600">
              <div>Admin: admin / admin123</div>
              <div>Quản lý: manager1 / manager123</div>
              <div>Đại biểu: delegate1 / delegate123</div>
              <div>Sinh viên: student1 / student123</div>
            </div>
          </div>
        </Card>

        <div className="text-center mt-6">
          <a href="/" className="text-blue-600 hover:text-blue-800 text-sm">
            <i className="ri-arrow-left-line mr-1"></i>
            Quay về trang chủ
          </a>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
