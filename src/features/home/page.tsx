import React, { useEffect, useState } from 'react';
import { fetchImages } from '../../services/images.js';
import { fetchWishes, Wish as WishApi } from '../../services/wishes.js';

import HomeHeader from './HomeHeader.js';
import HeroSection from './HeroSection.js';
import CongressInfoSection from './CongressInfoSection.js';
import WishesSection, { DisplayWish } from './HomeWishesSection.js';
import NewsSection from './NewsSection.js';
import AchievementsSection from './AchievementsSection.js';
import ActivitiesSection from './ActivitiesSection.js';
import CallToActionSection from './CallToActionSection.tsx.js';
import HomeFooter from './HomeFooter.js';

const Home: React.FC = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [heroImages, setHeroImages] = useState<string[]>([]);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  const [apiWishes, setApiWishes] = useState<WishApi[]>([]);
  const [wishesLoading, setWishesLoading] = useState(false);

  useEffect(() => {
    setIsVisible(true);
  }, []);

  // Load hero images
  useEffect(() => {
    const loadImages = async () => {
      try {
        const hero = await fetchImages('hero');
        setHeroImages(hero.map((img) => img.imageUrl));
      } catch (err) {
        console.error('Failed to fetch images:', err);
      }
    };
    loadImages();
  }, []);

  // Hero carousel
  useEffect(() => {
    if (!heroImages.length) return;
    const interval = setInterval(
      () => setCurrentImageIndex((prev) => (prev + 1) % heroImages.length),
      4000,
    );
    return () => clearInterval(interval);
  }, [heroImages]);

  // Load wishes from API
  useEffect(() => {
    const loadWishes = async () => {
      try {
        setWishesLoading(true);
        const data = await fetchWishes({ onlyVerified: true });

        if (!Array.isArray(data)) return;

        // 1. LỌC: Chỉ lấy đã duyệt + Priority 1, 2, 3
        const validWishes = data.filter(
          (w) => w.isVerified && ['1', '2', '3'].includes(String(w.priority)),
        );

        // 2. SẮP XẾP: Priority (1 lên đầu) -> Sau đó đến ngày tạo mới nhất
        const sorted = [...validWishes].sort((a, b) => {
          const pa = Number(a.priority);
          const pb = Number(b.priority);

          if (pa !== pb) return pa - pb;
          return (
            new Date(b.createdAt).getTime() -
            new Date(a.createdAt).getTime()
          );
        });

        setApiWishes(sorted);
      } catch (err) {
        console.error('Failed to fetch wishes:', err);
      } finally {
        setWishesLoading(false);
      }
    };
    loadWishes();
  }, []);

  // Map API → DisplayWish
  const displayWishes: DisplayWish[] = apiWishes.map((w, index) => ({
    id: w.id,
    name: w.senderName,
    role: w.isDelegate ? 'Đại biểu' : 'Sinh viên / Khách mời',
    department: w.senderPosition || '',
    message: w.content,
    time: new Date(w.createdAt).toLocaleString('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    }),
    icon: w.isDelegate ? 'ri-vip-crown-line' : 'ri-user-smile-line',
    iconBg: w.isDelegate ? 'bg-blue-100' : 'bg-green-100',
    iconColor: w.isDelegate ? 'text-blue-600' : 'text-green-600',
    // Item đầu tiên trong danh sách đã sort sẽ là Featured
    featured: index === 0,
    avatar: w.senderAvatar,
  }));

  const stats = [
    {
      number: '550',
      label: 'Sinh viên 5 Tốt cấp Trường (2023–2025)',
      color: 'text-blue-600',
    },
    {
      number: '156',
      label: 'Sinh viên 5 Tốt cấp ĐHQG-HCM',
      color: 'text-green-600',
    },
    {
      number: '125',
      label: 'Sinh viên 5 Tốt cấp Thành phố',
      color: 'text-purple-600',
    },
    {
      number: '12',
      label: 'Công trình tình nguyện ứng dụng chuyên môn',
      color: 'text-orange-600',
    },
  ];

  const activities = [
    {
      title: 'Học thuật – Nghiên cứu khoa học',
      description:
        'Triển khai phong trào học tập, sáng tạo với nhiều sân chơi như S-IDEAS, A-EA, Hội nghị Khoa học trẻ, cuộc thi CIC, giải thưởng Sinh viên NCKH Euréka…',
      image: '/sideas.jpg',
    },
    {
      title: 'Tình nguyện – Vì cộng đồng',
      description:
        'Chiến dịch Xuân Tình nguyện, Mùa hè xanh, các công trình ứng dụng chuyên môn, hiến máu, chăm lo an sinh xã hội…',
      image: '/MHX.jpg',
    },
    {
      title: 'Văn hóa – Thể thao & Hội nhập',
      description:
        'Ngày hội Sinh viên Tự nhiên, đêm văn hóa – nghệ thuật, hội thao HCMUS, đường chạy S-UPRACE, các hoạt động giao lưu sinh viên quốc tế…',
      image: '/festival.jpg',
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-cyan-50 via-white to-cyan-100">
      {/* Header */}
      <HomeHeader isVisible={isVisible} />

      {/* Hero */}
      <HeroSection
        isVisible={isVisible}
        heroImages={heroImages}
        currentImageIndex={currentImageIndex}
        setCurrentImageIndex={setCurrentImageIndex}
      />

      {/* Thông tin chung về Đại hội (thời gian, chủ đề, khẩu hiệu...) */}
      <CongressInfoSection isVisible={isVisible} />

      {/* Dấu ấn nhiệm kỳ XII & Phương hướng nhiệm kỳ XIII */}
      <section className="py-20 bg-gradient-to-br from-cyan-50 to-cyan-100/30">
        <div className="container mx-auto px-4">
          <NewsSection isVisible={isVisible} />
        </div>
      </section>

      {/* Thành tích phong trào, số liệu nổi bật */}
      <AchievementsSection isVisible={isVisible} stats={stats} />

      {/* Hoạt động tiêu biểu: học thuật, tình nguyện, văn hóa – thể thao */}
      <ActivitiesSection isVisible={isVisible} activities={activities} />

      {/* Lời chúc của đại biểu, sinh viên, khách mời */}
      <section className="py-20 bg-gradient-to-t from-white via-cyan-50/50 to-white">
        <div className="container mx-auto px-4">
          <WishesSection
            isVisible={isVisible}
            wishesLoading={wishesLoading}
            wishes={displayWishes}
          />
        </div>
      </section>

      {/* Kêu gọi hành động + Footer */}
      <CallToActionSection isVisible={isVisible} />
      <HomeFooter />
    </div>
  );
};

export default Home;
