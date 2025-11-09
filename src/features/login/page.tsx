import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card } from '../../components/base/Card';
import { Button } from '../../components/base/Button';
import { useAuth } from '../../hooks/useAuth';
import { loginApi, getInfor } from '../../services/auth';

const LoginPage: React.FC = () => {
  const [username, setUsername]   = useState('');
  const [password, setPassword]   = useState('');
  const [loading, setLoading]     = useState(false);
  const [error, setError]         = useState('');
  const { login }                 = useAuth();
  const navigate                  = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      await loginApi(username, password);
      const meRes = await getInfor();
      const user  = (meRes as any)?.user ?? meRes; 

      if (!user) throw new Error('Không lấy được thông tin người dùng.');
      login(user);
      navigate('/dashboard');
    } catch (err: any) {
      const msg =
        err?.response?.data?.message ||
        err?.message ||
        'Tên đăng nhập hoặc mật khẩu không đúng';
      setError(Array.isArray(msg) ? msg[0] : msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4 bg-cover bg-center"
      style={{ backgroundImage: "url('/bg.png')" }}
    >
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="w-17 h-17 rounded-full flex items-center justify-center mx-auto mb-4">
            <img
              src="/logo-square.png"
              alt="Logo"
              className="w-16 h-16 object-cover rounded-full"
            />
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
                autoFocus
                disabled={loading}
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
                disabled={loading}
              />
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md">
                <i className="ri-error-warning-line mr-2"></i>
                {error}
              </div>
            )}

            <Button type="submit" disabled={loading} className="w-full" size="lg">
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
