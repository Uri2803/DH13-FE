export const getQuickActions = (role: string) => {
    switch (role) {
      case 'admin':
        return [
          {
            title: 'Điểm danh QR',
            description: 'Quét mã QR điểm danh đại biểu',
            icon: 'ri-qr-scan-line',
            link: '/checkin',
            color: 'bg-blue-500',
          },
          {
            title: 'Thống kê',
            description: 'Xem báo cáo tham gia đại hội',
            icon: 'ri-bar-chart-line',
            link: '/statistics',
            color: 'bg-green-500',
          },
          {
            title: 'Quản lý tài liệu',
            description: 'Bật/tắt tài liệu hệ thống',
            icon: 'ri-file-settings-line',
            link: '/documents',
            color: 'bg-purple-500',
          },
          {
            title: 'Quản lý đại biểu',
            description: 'Xem và quản lý thông tin đại biểu',
            icon: 'ri-team-line',
            link: '/manage',
            color: 'bg-orange-500',
          },
          {
            title: 'Quản lý ảnh hero',
            description: 'CRUD hình ảnh banner trang chủ',
            icon: 'ri-image-add-line',
            link: '/hero-images',
            color: 'bg-purple-500',
          },
          {
            title: 'Checkin Display',
            description: 'Display checkin',
            icon: 'ri-tv-2-line', // Icon màn hình TV
            link: '/checkin-display',
            color: 'bg-red-500', // Màu đỏ
          },
          {
            title: 'Quản lý lời chúc',
            description: 'Duyệt và sắp xếp lời chúc mừng',
            icon: 'ri-heart-3-line',
            link: '/admin/wishes',
            color: 'bg-pink-500',
          },
        ];
      case 'department':
        return [
          {
            title: 'Quản lý đại biểu',
            description: 'Quản lý đại biểu khoa của bạn',
            icon: 'ri-team-line',
            link: '/manage',
            color: 'bg-blue-500',
          },
          {
            title: 'Tài liệu',
            description: 'Xem tài liệu đại hội',
            icon: 'ri-file-text-line',
            link: '/documents',
            color: 'bg-green-500',
          },
          {
            title: 'Lời chúc',
            description: 'Xem lời chúc mừng',
            icon: 'ri-heart-line',
            link: '/wishes',
            color: 'bg-pink-500',
          },
        ];
      case 'delegate':
        return [
          {
            title: 'Hồ sơ cá nhân',
            description: 'Cập nhật thông tin của bạn',
            icon: 'ri-user-line',
            link: '/profile',
            color: 'bg-blue-500',
          },
          {
            title: 'Tài liệu',
            description: 'Xem tài liệu đại hội',
            icon: 'ri-file-text-line',
            link: '/documents',
            color: 'bg-green-500',
          },
          {
            title: 'Lời chúc',
            description: 'Gửi lời chúc mừng',
            icon: 'ri-heart-line',
            link: '/wishes',
            color: 'bg-pink-500',
          },
        ];
      default:
        return [
          {
            title: 'Lời chúc',
            description: 'Gửi lời chúc mừng đại hội',
            icon: 'ri-heart-line',
            link: '/wishes',
            color: 'bg-pink-500',
          },
        ];
    }
  };

  export interface ActivityItem {
    id: string | number;
    type: 'checkin' | 'wish' | 'document';
    content: string;
    time: string; // ISO string
    timestamp: number; // Dùng để sort
  }

    // Hàm format thời gian "x phút trước"
    export const formatTimeAgo = (dateString: string) => {
      if (!dateString) return '';
      const now = new Date();
      const date = new Date(dateString);
      const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);
  
      if (diffInSeconds < 60) return 'Vừa xong';
      if (diffInSeconds < 3600)
        return `${Math.floor(diffInSeconds / 60)} phút trước`;
      if (diffInSeconds < 86400)
        return `${Math.floor(diffInSeconds / 3600)} giờ trước`;
      return date.toLocaleDateString('vi-VN');
    };
  
    // Format giờ HH:mm
    export const formatTime = (dateString: string) => {
      if (!dateString) return '';
      const d = new Date(dateString);
      return d.toLocaleTimeString('vi-VN', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: false,
      });
    };
  
    // Format ngày dd/MM
    export const formatDateShort = (dateString: string) => {
      if (!dateString) return '';
      const d = new Date(dateString);
      return d.toLocaleDateString('vi-VN', {
        day: '2-digit',
        month: '2-digit',
      });
    };
  
    export const toInputDateTime = (value?: string | null) => {
        if (!value) return '';
        const d = new Date(value);
        // YYYY-MM-DDTHH:mm
        return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(
          2,
          '0',
        )}-${String(d.getDate()).padStart(2, '0')}T${String(
          d.getHours(),
        ).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
      };

      