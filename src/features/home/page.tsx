import React, { useEffect, useState } from 'react';
import { fetchImages } from '../../services/images';
import { fetchWishes, Wish as WishApi } from '../../services/wishes';

import HomeHeader from './HomeHeader';
import HeroSection from './HeroSection';
import CongressInfoSection from './CongressInfoSection';
import WishesSection, { DisplayWish } from './HomeWishesSection';
import NewsSection from './NewsSection';
import AchievementsSection from './AchievementsSection';
import ActivitiesSection from './ActivitiesSection';
import CallToActionSection from './CallToActionSection.tsx';
import HomeFooter from './HomeFooter';

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
        // Gọi API lấy lời chúc (Giả sử API đã hỗ trợ lọc verify, nhưng ta lọc lại ở client cho chắc)
        const data = await fetchWishes({ onlyVerified: true });
        
        if (!Array.isArray(data)) return;

        // 1. LỌC: Chỉ lấy đã duyệt + Priority 1, 2, 3
        const validWishes = data.filter(w => 
          w.isVerified && ['1', '2', '3'].includes(String(w.priority))
        );

        // 2. SẮP XẾP: Priority (1 lên đầu) -> Sau đó đến ngày tạo mới nhất
        const sorted = [...validWishes].sort((a, b) => {
          const pa = Number(a.priority); // 1, 2, 3
          const pb = Number(b.priority);
          
          // Ưu tiên số priority nhỏ hơn (1 quan trọng hơn 3)
          if (pa !== pb) return pa - pb; 

          // Nếu cùng priority, ưu tiên người mới nhất
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
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
    time: new Date(w.createdAt).toLocaleString('vi-VN', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit'}),
    icon: w.isDelegate ? 'ri-vip-crown-line' : 'ri-user-smile-line',
    iconBg: w.isDelegate ? 'bg-blue-100' : 'bg-green-100',
    iconColor: w.isDelegate ? 'text-blue-600' : 'text-green-600',
    // Item đầu tiên trong danh sách đã sort sẽ là Featured
    featured: index === 0, 
    avatar: w.senderAvatar,
  }));

  const stats = [
    { number: '550', label: 'Sinh viên 5 Tốt cấp Trường (2023–2025)', color: 'text-blue-600' },
    { number: '156', label: 'Sinh viên 5 Tốt cấp ĐHQG-HCM', color: 'text-green-600' },
    { number: '125', label: 'Sinh viên 5 Tốt cấp Thành phố', color: 'text-purple-600' },
    { number: '12', label: 'Công trình tình nguyện ứng dụng chuyên môn', color: 'text-orange-600' },
  ];

  const activities = [
    {
      title: 'Học thuật – Nghiên cứu khoa học',
      description:
        'Triển khai phong trào học tập, sáng tạo với nhiều sân chơi như S-IDEAS, A-EA, Hội nghị Khoa học trẻ, cuộc thi CIC, giải thưởng Sinh viên NCKH Euréka…',
      image: 'src/assets/image/sideas.jpg',
    },
    {
      title: 'Tình nguyện – Vì cộng đồng',
      description:
        'Chiến dịch Xuân Tình nguyện, Mùa hè xanh, các công trình ứng dụng chuyên môn, hiến máu, chăm lo an sinh xã hội…',
      image: 'src/assets/image/sideas.jpg',
    },
    {
      title: 'Văn hóa – Thể thao & Hội nhập',
      description:
        'Ngày hội Sinh viên Tự nhiên, đêm văn hóa – nghệ thuật, hội thao HCMUS, đường chạy S-UPRACE, các hoạt động giao lưu sinh viên quốc tế…',
      image: 'src/assets/image/festival.jpg',
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-cyan-50 via-white to-cyan-100">
      <HomeHeader isVisible={isVisible} />

      <HeroSection
        isVisible={isVisible}
        heroImages={heroImages}
        currentImageIndex={currentImageIndex}
        setCurrentImageIndex={setCurrentImageIndex}
      />

      <CongressInfoSection isVisible={isVisible} />

      <section className="py-20 bg-gradient-to-br from-cyan-50 to-cyan-100/30">
        <div className="container mx-auto px-4">
          <div className="grid lg:grid-cols-2 gap-16">
            <WishesSection
              isVisible={isVisible}
              wishesLoading={wishesLoading}
              wishes={displayWishes}
            />
            <NewsSection isVisible={isVisible} />
          </div>
        </div>
      </section>

      <AchievementsSection isVisible={isVisible} stats={stats} />
      <ActivitiesSection isVisible={isVisible} activities={activities} />
      <CallToActionSection isVisible={isVisible} />
      <HomeFooter />
    </div>
  );
};

export default Home;