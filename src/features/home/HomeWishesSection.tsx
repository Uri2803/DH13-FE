import React, { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';

// 1️⃣ IMPORT LOGO ĐẠI HỘI (Hãy thay đổi đường dẫn này đúng với file ảnh của bạn)
import DefaultCongressLogo from '../../assets/image/1. Ava ĐH XIII.png';

export type DisplayWish = {
  id?: number;
  name: string;
  role: string;
  department?: string;
  message: string;
  time: string;
  icon: string;
  iconBg: string;
  iconColor: string;
  featured?: boolean;
  avatar?: string | null;
};

type WishesSectionProps = {
  isVisible: boolean;
  wishesLoading: boolean;
  wishes: DisplayWish[];
};

const WishesSection: React.FC<WishesSectionProps> = ({
  isVisible,
  wishesLoading,
  wishes,
}) => {
  const featuredWish = useMemo(() => {
    if (!wishes.length) return null;
    return wishes.find((w) => w.featured) || wishes[0];
  }, [wishes]);

  const otherWishes = useMemo(() => {
    if (!wishes.length) return [];
    if (!featuredWish) return wishes;
    return wishes.filter((w) => w !== featuredWish);
  }, [wishes, featuredWish]);

  const [currentOtherIndex, setCurrentOtherIndex] = useState(0);

  useEffect(() => {
    setCurrentOtherIndex(0);
  }, [otherWishes.length]);

  useEffect(() => {
    if (otherWishes.length <= 1) return;
    const interval = setInterval(
      () => setCurrentOtherIndex((prev) => (prev + 1) % otherWishes.length),
      5000,
    );
    return () => clearInterval(interval);
  }, [otherWishes]);

  const currentOtherWish =
    otherWishes.length > 0 ? otherWishes[currentOtherIndex] : null;

  // 3️⃣ HÀM RENDER AVATAR (Dùng chung cho cả 2 loại card)
  const renderAvatar = (
    wish: DisplayWish,
    sizeClass: string = 'w-16 h-16',
  ) => {
    // Logic: Lấy Avatar User -> Nếu không có thì lấy Logo Đại hội
    const imageSrc = wish.avatar || DefaultCongressLogo;

    return (
      <div
        className={`
          flex-shrink-0 ${sizeClass} rounded-full relative overflow-hidden
          border-2 border-white shadow-md bg-white
          transition-transform duration-500
        `}
      >
        {/* Layer 1: Icon nền (Fallback khi ảnh lỗi) */}
        <div
          className={`
            absolute inset-0 flex items-center justify-center
            ${wish.iconBg}
          `}
        >
          <i className={`${wish.icon} ${wish.iconColor} text-2xl`} />
        </div>

        {/* Layer 2: Ảnh (Avatar hoặc Logo Đại hội) */}
        <img
          src={imageSrc}
          alt={wish.name}
          className="absolute inset-0 w-full h-full object-cover transition-opacity duration-300"
          onError={(e) => {
            // Nếu ảnh load lỗi (404), ẩn ảnh đi để lộ ra Layer 1 (Icon)
            e.currentTarget.style.opacity = '0';
          }}
        />
      </div>
    );
  };

  return (
    <div
      className={`
        relative
        transform transition-all duration-1000
        ${isVisible ? 'translate-x-0 opacity-100' : '-translate-x-10 opacity-0'}
      `}
    >
      {/* Background glow */}
      <div className="pointer-events-none absolute -top-10 -left-10 w-40 h-40 bg-cyan-400/15 rounded-full blur-3xl" />
      <div className="pointer-events-none absolute -bottom-10 -right-10 w-52 h-52 bg-cyan-500/10 rounded-full blur-3xl" />

      <div className="relative">
        {/* Header */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-2 px-4 py-1 rounded-full bg-cyan-50 border border-cyan-100 text-xs font-semibold text-cyan-700 mb-4 animate-pulse">
            <i className="ri-heart-2-line text-sm" />
            LỜI CHÚC GỬI ĐẾN ĐẠI HỘI
          </div>

          <h2 className="text-3xl sm:text-4xl font-extrabold bg-gradient-to-r from-cyan-600 via-cyan-700 to-cyan-800 bg-clip-text text-transparent mb-4 tracking-wide">
            Lời chúc mừng
          </h2>

          <p className="text-sm sm:text-base md:text-lg text-gray-600 max-w-2xl mx-auto leading-relaxed">
            Những thông điệp yêu thương, niềm tin và kỳ vọng của đại biểu, sinh
            viên và khách mời gửi đến Đại hội và phong trào sinh viên Trường
            Đại học Khoa học Tự nhiên.
          </p>

          <div className="mt-4 flex justify-center">
            <div className="h-1 w-24 rounded-full bg-gradient-to-r from-cyan-500 via-cyan-400 to-cyan-600 animate-pulse" />
          </div>
        </div>

        {/* Loading */}
        {wishesLoading && (
          <div className="space-y-4 mb-12">
            <div className="animate-pulse bg-white/80 rounded-2xl shadow-lg border border-gray-100 p-8 h-48" />
            <div className="animate-pulse bg-white/80 rounded-2xl shadow-lg border border-gray-100 p-8 h-48" />
          </div>
        )}

        {/* Empty State */}
        {!wishesLoading && wishes.length === 0 && (
          <div className="bg-white/95 rounded-2xl shadow-lg border border-gray-100 p-8 text-center mb-12 backdrop-blur-sm">
            <div className="w-20 h-20 bg-cyan-50 rounded-full flex items-center justify-center mx-auto mb-6">
              <i className="ri-heart-line text-3xl text-cyan-400" />
            </div>
            <h3 className="text-xl font-semibold text-gray-800 mb-3">
              Chưa có lời chúc nào được hiển thị
            </h3>
            <p className="text-gray-500 mb-6 max-w-md mx-auto">
              Hãy là người đầu tiên gửi lời chúc mừng đến Đại hội và chia sẻ
              cảm xúc của bạn với cộng đồng sinh viên Tự nhiên.
            </p>
            <Link to="/wishes">
              <button className="group bg-gradient-to-r from-cyan-500 to-cyan-600 hover:from-cyan-600 hover:to-cyan-700 text-white px-6 py-3 text-base sm:text-lg font-medium rounded-xl transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-1">
                <i className="ri-heart-add-line mr-2 group-hover:scale-110 transition-transform" />
                Gửi lời chúc mừng
              </button>
            </Link>
          </div>
        )}

        {/* Content */}
        {!wishesLoading && wishes.length > 0 && (
          <>
            <div className="space-y-6 mb-12">
              {/* 1. FEATURED CARD */}
              {featuredWish && (
                <div
                  className="
                    relative group
                    bg-white/95 rounded-2xl shadow-xl border border-cyan-100
                    p-8
                    hover:shadow-2xl hover:-translate-y-1
                    transition-all duration-500
                    ring-2 ring-cyan-500/70
                    bg-gradient-to-br from-cyan-50/60 via-white to-cyan-50/30
                    overflow-hidden
                  "
                >
                  {/* glow border */}
                  <div className="pointer-events-none absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                    <div className="absolute -inset-20 bg-gradient-to-br from-cyan-400/10 via-cyan-300/5 to-transparent blur-3xl" />
                  </div>

                  <div className="absolute top-0 right-0 bg-cyan-600 text-white text-xs font-bold px-3 py-1 rounded-bl-xl rounded-tr-xl shadow-md z-10 flex items-center gap-1 animate-pulse">
                    <i className="ri-sparkling-2-line text-sm" />
                    Nổi bật
                  </div>

                  <div className="flex flex-col md:flex-row items-center md:items-start gap-6 relative z-10">
                    {/* Avatar */}
                    <div className="group-hover:scale-110 transition-transform duration-500">
                      {renderAvatar(featuredWish, 'w-20 h-20')}
                    </div>

                    <div className="flex-1 text-center md:text-left">
                      <h3 className="font-bold text-xl md:text-2xl text-gray-800">
                        {featuredWish.name}
                      </h3>
                      <div className="text-sm text-cyan-600 font-medium mb-2">
                        {featuredWish.department
                          ? featuredWish.department
                          : featuredWish.role}
                      </div>

                      <div className="relative mt-2">
                        <i className="ri-double-quotes-l text-cyan-100 text-5xl absolute -top-5 -left-2 md:-left-4 opacity-80" />
                        <p className="text-gray-700 leading-relaxed text-base md:text-lg italic relative z-10 px-2">
                          {featuredWish.message}
                        </p>
                        <i className="ri-double-quotes-r text-cyan-100 text-5xl absolute -bottom-5 -right-2 md:-right-4 opacity-80" />
                      </div>

                      <div className="mt-4 text-xs text-gray-400 flex items-center justify-center md:justify-start">
                        <i className="ri-time-line mr-1" /> {featuredWish.time}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* 2. ROTATING CARD */}
              {currentOtherWish ? (
                <div
                  key={currentOtherWish.id}
                  className="
                    animate-fade-in
                    group bg-white/95 rounded-2xl shadow-md border border-gray-100
                    p-6
                    hover:shadow-xl hover:-translate-y-1
                    transition-all duration-500
                  "
                >
                  <div className="flex flex-col md:flex-row items-center md:items-start gap-5">
                    {/* Avatar */}
                    <div className="group-hover:scale-110 transition-transform duration-500">
                      {renderAvatar(currentOtherWish, 'w-14 h-14')}
                    </div>

                    <div className="flex-1 text-center md:text-left">
                      <h3 className="font-bold text-lg text-gray-800">
                        {currentOtherWish.name}
                      </h3>
                      <p className="text-xs text-gray-500 mb-2">
                        {currentOtherWish.department ||
                          currentOtherWish.role}
                      </p>
                      <p className="text-gray-600 mb-3 italic">
                        "{currentOtherWish.message}"
                      </p>
                      <div className="text-xs text-gray-400 flex items-center justify-center md:justify-start">
                        <i className="ri-time-line mr-1" />{' '}
                        {currentOtherWish.time}
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                wishes.length > 0 && (
                  <div className="text-center text-gray-400 text-sm py-4 italic">
                    Gửi thêm lời chúc để thấy điều kỳ diệu!
                  </div>
                )
              )}
            </div>

            {/* Indicators + Buttons */}
            <div className="text-center">
              {/* dynamic dots cho các lời chúc xoay */}
              {otherWishes.length > 1 && (
                <div className="flex justify-center space-x-2 mb-6">
                  {otherWishes.map((w, idx) => (
                    <span
                      key={w.id ?? idx}
                      className={`
                        w-2 h-2 rounded-full
                        transition-all duration-300
                        ${
                          idx === currentOtherIndex
                            ? 'bg-cyan-500 scale-125 shadow-md'
                            : 'bg-gray-300/80'
                        }
                      `}
                    />
                  ))}
                </div>
              )}

              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link to="/wishes">
                  <button className="bg-gray-100 hover:bg-gray-200 text-gray-800 px-6 py-3 text-base sm:text-lg font-medium rounded-xl transition-all duration-300 shadow hover:shadow-md flex items-center justify-center">
                    <i className="ri-eye-line mr-2" />
                    Xem tất cả lời chúc
                  </button>
                </Link>
                <Link to="/wishes">
                  <button className="bg-gradient-to-r from-cyan-500 to-cyan-600 hover:from-cyan-600 hover:to-cyan-700 text-white px-6 py-3 text-base sm:text-lg font-medium rounded-xl transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-1 flex items-center justify-center">
                    <i className="ri-add-line mr-2" />
                    Gửi lời chúc mới
                  </button>
                </Link>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default WishesSection;
