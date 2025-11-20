import React, { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Card } from "../../components/base/Card";
import { Button } from "../../components/base/Button";
import { useAuth } from "../../hooks/useAuth";
import { loginApi, getInfor } from "../../services/auth";

const LoginPage: React.FC = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const safePath = (p?: string | null) =>
    p && p.startsWith("/") && !p.startsWith("//") ? p : "/dashboard";

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (loading) return;

    setLoading(true);
    setError("");

    try {
      await loginApi(username, password);
      const meRes = await getInfor();
      const user = (meRes as any)?.user ?? meRes;

      if (!user) throw new Error("Không lấy được thông tin người dùng.");
      login(user);

      const params = new URLSearchParams(location.search);
      const qsRedirect = params.get("redirect");

      const fromState = (location.state as any)?.from;
      const fromPath = fromState?.pathname
        ? `${fromState.pathname}${fromState.search ?? ""}${fromState.hash ?? ""}`
        : null;

      const target = safePath(qsRedirect || fromPath);
      navigate(target, { replace: true });
    } catch (err) {
      setError("Tên đăng nhập hoặc mật khẩu không đúng");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen flex items-center justify-center p-4 overflow-hidden">

      {/* ẢNH NỀN */}
      <img
        src="src/assets/image/nendaihoi.png"
        alt="background"
        className="absolute inset-0 w-full h-full object-cover -z-20 select-none pointer-events-none"
      />

      {/* OVERLAY MỜ (nếu muốn nhẹ nhàng) */}
      <div className="absolute inset-0 bg-white/50 backdrop-blur-sm -z-10"></div>

      {/* FORM */}
      <div className="w-full max-w-md relative z-10">
        <div className="text-center mb-8">
          <div className="w-17 h-17 rounded-full flex items-center justify-center mx-auto mb-4">
            <img
              src="/logo-square.png"
              alt="Logo"
              className="w-16 h-16 object-cover rounded-full"
            />
          </div>

          <h1 className="text-2xl font-bold text-gray-800 mb-2">
            Đăng nhập hệ thống
          </h1>

          <p className="text-gray-600">
            Đại hội Hội Sinh viên<br />
             <span className="flex items-center justify-center gap-2 whitespace-nowrap mt-2 first:mt-0">
               <strong>Trường Đại học Khoa học Tự nhiên, ĐHQG-HCM</strong>
            </span>
          </p>
        </div>

        <Card>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Tên đăng nhập
              </label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md
                  focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Nhập tên đăng nhập"
                required
                autoFocus
                disabled={loading}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Mật khẩu
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md
                  focus:outline-none focus:ring-2 focus:ring-blue-500"
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
        </Card>

        <div className="text-center mt-6">
          <a
            href="/"
            className="text-blue-600 hover:text-blue-800 text-sm"
          >
            <i className="ri-arrow-left-line mr-1"></i> Quay về trang chủ
          </a>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
