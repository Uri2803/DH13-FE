
import React from 'react';
import { Link } from 'react-router-dom';
import { Navigation } from '../../components/feature/Navigation';
import { Card } from '../../components/base/Card';
import { Button } from '../../components/base/Button';
import { useAuth } from '../../hooks/useAuth';

const DashboardPage: React.FC = () => {
  const { user } = useAuth();

  if (!user) {
    return <div>Đang tải...</div>;
  }

  const getQuickActions = () => {
    switch (user.role) {
      case 'admin':
        return [
          { title: 'Điểm danh QR', description: 'Quét mã QR điểm danh đại biểu', icon: 'ri-qr-scan-line', link: '/checkin', color: 'bg-blue-500' },
          { title: 'Thống kê', description: 'Xem báo cáo tham gia đại hội', icon: 'ri-bar-chart-line', link: '/statistics', color: 'bg-green-500' },
          { title: 'Quản lý tài liệu', description: 'Bật/tắt tài liệu hệ thống', icon: 'ri-file-settings-line', link: '/manage', color: 'bg-purple-500' },
          { title: 'Quản lý đại biểu', description: 'Xem và quản lý thông tin đại biểu', icon: 'ri-team-line', link: '/manage', color: 'bg-orange-500' }
        ];
      case 'manager':
        return [
          { title: 'Quản lý đại biểu', description: 'Quản lý đại biểu khoa của bạn', icon: 'ri-team-line', link: '/manage', color: 'bg-blue-500' },
          { title: 'Tài liệu', description: 'Xem tài liệu đại hội', icon: 'ri-file-text-line', link: '/documents', color: 'bg-green-500' },
          { title: 'Lời chúc', description: 'Xem lời chúc mừng', icon: 'ri-heart-line', link: '/wishes', color: 'bg-pink-500' }
        ];
      case 'delegate':
        return [
          { title: 'Hồ sơ cá nhân', description: 'Cập nhật thông tin của bạn', icon: 'ri-user-line', link: '/profile', color: 'bg-blue-500' },
          { title: 'Tài liệu', description: 'Xem tài liệu đại hội', icon: 'ri-file-text-line', link: '/documents', color: 'bg-green-500' },
          { title: 'Lời chúc', description: 'Gửi lời chúc mừng', icon: 'ri-heart-line', link: '/wishes', color: 'bg-pink-500' }
        ];
      default:
        return [
          { title: 'Lời chúc', description: 'Gửi lời chúc mừng đại hội', icon: 'ri-heart-line', link: '/wishes', color: 'bg-pink-500' }
        ];
    }
  };

  const quickActions = getQuickActions();

  return (
    <div className="min-h-screen bg-gradient-to-br from-cyan-50 via-white to-cyan-100">
      <Navigation />
      


      <div className="container mx-auto px-4 py-8" >
        {/* Welcome Section */}
        <div className="mb-8">
          
          <h1 className="text-3xl font-bold text-gray-800 mb-2">
            Chào mừng, {user.fullName}!
          </h1>
          <p className="text-gray-600">
            {user.role === 'admin' && 'Quản trị viên hệ thống'}
            {user.role === 'manager' && `Quản lý khoa ${user.unit}`}
            {user.role === 'delegate' && `Đại biểu ${user.delegateCode} - ${user.unit}`}
            {user.role === 'student' && 'Sinh viên'}
          </p>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <Card className="text-center">
            <div className="text-2xl font-bold text-blue-600 mb-1">150</div>
            <div className="text-sm text-gray-600">Tổng đại biểu</div>
          </Card>
          <Card className="text-center">
            <div className="text-2xl font-bold text-green-600 mb-1">128</div>
            <div className="text-sm text-gray-600">Đã điểm danh</div>
          </Card>
          <Card className="text-center">
            <div className="text-2xl font-bold text-purple-600 mb-1">85%</div>
            <div className="text-sm text-gray-600">Tỷ lệ tham gia</div>
          </Card>
          <Card className="text-center">
            <div className="text-2xl font-bold text-orange-600 mb-1">45</div>
            <div className="text-sm text-gray-600">Lời chúc</div>
          </Card>
        </div>

        {/* Quick Actions */}
        <div className="mb-8">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">Thao tác nhanh</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {quickActions.map((action, index) => (
              <Link key={index} to={action.link}>
                <Card className="hover:shadow-lg transition-shadow cursor-pointer">
                  <div className="flex items-start space-x-4">
                    <div className={`w-12 h-12 ${action.color} rounded-lg flex items-center justify-center`}>
                      <i className={`${action.icon} text-white text-xl`}></i>
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-800 mb-1">{action.title}</h3>
                      <p className="text-sm text-gray-600">{action.description}</p>
                    </div>
                    <i className="ri-arrow-right-line text-gray-400"></i>
                  </div>
                </Card>
              </Link>
            ))}
          </div>
        </div>

        {/* Recent Activity */}
        <div className="grid md:grid-cols-2 gap-8">
          <Card>
            <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
              <i className="ri-time-line text-blue-500 mr-2"></i>
              Hoạt động gần đây
            </h3>
            <div className="space-y-3">
              <div className="flex items-center space-x-3 text-sm">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span className="text-gray-600">Nguyễn Văn An đã điểm danh</span>
                <span className="text-gray-400">5 phút trước</span>
              </div>
              <div className="flex items-center space-x-3 text-sm">
                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                <span className="text-gray-600">Trần Thị Bình gửi lời chúc</span>
                <span className="text-gray-400">10 phút trước</span>
              </div>
              <div className="flex items-center space-x-3 text-sm">
                <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                <span className="text-gray-600">Tài liệu mới được thêm</span>
                <span className="text-gray-400">1 giờ trước</span>
              </div>
            </div>
          </Card>

          <Card>
            <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
              <i className="ri-notification-line text-orange-500 mr-2"></i>
              Thông báo
            </h3>
            <div className="space-y-3">
              <div className="p-3 bg-blue-50 rounded-lg">
                <div className="font-medium text-blue-800 text-sm">Đại hội bắt đầu</div>
                <div className="text-blue-600 text-xs">Đại hội chính thức khai mạc lúc 8:00 sáng nay</div>
              </div>
              <div className="p-3 bg-green-50 rounded-lg">
                <div className="font-medium text-green-800 text-sm">Điểm danh mở</div>
                <div className="text-green-600 text-xs">Hệ thống điểm danh đã được kích hoạt</div>
              </div>
              <div className="p-3 bg-yellow-50 rounded-lg">
                <div className="font-medium text-yellow-800 text-sm">Cập nhật tài liệu</div>
                <div className="text-yellow-600 text-xs">Tài liệu mới đã được cập nhật</div>
              </div>
            </div>
          </Card>
        </div>

        {/* Congress Schedule */}
        <div className="mt-8">
          <Card>
            <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
              <i className="ri-calendar-line text-green-500 mr-2"></i>
              Chương trình Đại hội
            </h3>
            <div className="space-y-4">
              <div className="flex items-center space-x-4 p-3 bg-green-50 rounded-lg">
                <div className="text-center">
                  <div className="text-sm font-medium text-green-800">08:00</div>
                  <div className="text-xs text-green-600">20/12</div>
                </div>
                <div className="flex-1">
                  <div className="font-medium text-green-800">Khai mạc Đại hội</div>
                  <div className="text-sm text-green-600">Hội trường A - ĐHQG-HCM</div>
                </div>
                <div className="w-3 h-3 bg-green-500 rounded-full"></div>
              </div>
              
              <div className="flex items-center space-x-4 p-3 bg-blue-50 rounded-lg">
                <div className="text-center">
                  <div className="text-sm font-medium text-blue-800">09:30</div>
                  <div className="text-xs text-blue-600">20/12</div>
                </div>
                <div className="flex-1">
                  <div className="font-medium text-blue-800">Báo cáo hoạt động nhiệm kỳ</div>
                  <div className="text-sm text-blue-600">Báo cáo tổng kết 2022-2024</div>
                </div>
                <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
              </div>

              <div className="flex items-center space-x-4 p-3 bg-gray-50 rounded-lg">
                <div className="text-center">
                  <div className="text-sm font-medium text-gray-600">14:00</div>
                  <div className="text-xs text-gray-500">20/12</div>
                </div>
                <div className="flex-1">
                  <div className="font-medium text-gray-700">Thảo luận tổ</div>
                  <div className="text-sm text-gray-600">Các phòng họp A1, A2, A3</div>
                </div>
                <div className="w-3 h-3 bg-gray-400 rounded-full"></div>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;
