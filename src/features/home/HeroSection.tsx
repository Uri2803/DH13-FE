// src/pages/home/components/HeroSection.tsx
import React from 'react';
import { Link } from 'react-router-dom';

interface HeroSectionProps {
  isVisible: boolean;
  heroImages: string[];
  currentImageIndex: number;
  setCurrentImageIndex: (index: number | ((prev: number) => number)) => void;
}

const HeroSection: React.FC<HeroSectionProps> = ({
  isVisible,
  heroImages,
  currentImageIndex,
  setCurrentImageIndex,
}) => {
  return (
    <section className="relative py-20 overflow-hidden bg-gradient-to-br from-cyan-50 via-white to-cyan-100">
      <div className="absolute inset-0 bg-gradient-to-br from-cyan-400/5 via-transparent to-cyan-600/5" />
      <div className="container mx-auto px-4">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          {/* LEFT TEXT */}
          <div
            className={`transform transition-all duration-1000 delay-300 ${
              isVisible ? 'translate-x-0 opacity-100' : '-translate-x-10 opacity-0'
            }`}
          >
            <div className="bg-white/95 backdrop-blur-sm rounded-3xl p-10 shadow-2xl border border-cyan-200/50 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-cyan-500/10 via-cyan-400/5 to-transparent rounded-bl-3xl" />

              {/* Khẩu hiệu */}
              <h2 className="mb-8 leading-tight text-center font-bold">
                {['VỮNG BƯỚC TRI THỨC', 'KHƠI NGUỒN SÁNG TẠO', 'KIẾN TẠO TƯƠNG LAI'].map(
                  (line, i) => (
                    <span
                      key={i}
                      className="flex items-center justify-center gap-2 whitespace-nowrap mt-2 first:mt-0"
                    >
                      <i
                        className="ri-star-fill text-cyan-700 text-xl sm:text-2xl animate-pulse drop-shadow-lg"
                        style={{ animationDelay: '0.5s' }}
                      />
                      <span
                        className="
                          text-base sm:text-xl md:text-2xl
                          bg-gradient-to-r from-cyan-500 via-cyan-500 to-cyan-700
                          bg-clip-text text-transparent tracking-wide
                          animate-gradient-move
                        "
                      >
                        {line}
                      </span>
                      <i
                        className="ri-star-fill text-cyan-700 text-xl sm:text-2xl animate-pulse drop-shadow-lg"
                        style={{ animationDelay: '0.5s' }}
                      />
                    </span>
                  ),
                )}
              </h2>

              {/* Mô tả */}
              <p className="text-base sm:text-xl md:text-xl text-gray-700 mb-10 leading-relaxed font-medium text-center">
                Hội Sinh viên Trường Đại học Khoa học Tự nhiên, ĐHQG-HCM định hướng
                xây dựng thế hệ sinh viên bản lĩnh, có lý tưởng, giàu lòng yêu nước,
                chủ động học tập – nghiên cứu khoa học, nâng cao kỹ năng thực hành xã
                hội, sẵn sàng hội nhập và khát vọng cống hiến trong kỷ nguyên chuyển
                đổi số.
              </p>

              <div className="flex flex-col sm:flex-row justify-center items-center gap-6">
                <Link to="/login">
                  <button className="group bg-gradient-to-r from-cyan-500 via-cyan-600 to-cyan-700 hover:from-cyan-600 hover:via-cyan-700 hover:to-cyan-800 text-white px-8 py-4 sm:px-10 sm:py-5 text-base sm:text-lg font-semibold rounded-2xl transition-all duration-300 whitespace-nowrap cursor-pointer shadow-xl hover:shadow-2xl transform hover:-translate-y-2 relative overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 transform -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-700" />
                    <i className="ri-login-box-line mr-2 sm:mr-3 group-hover:scale-110 transition-transform" />
                    Đăng nhập hệ thống
                  </button>
                </Link>
                <Link to="/wishes">
                  <button className="group bg-white hover:bg-cyan-50 text-cyan-700 border-3 border-cyan-500 hover:border-cyan-600 px-8 py-4 sm:px-10 sm:py-5 text-base sm:text-lg font-semibold rounded-2xl transition-all duration-300 whitespace-nowrap cursor-pointer shadow-xl hover:shadow-2xl transform hover:-translate-y-2 relative overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-r from-cyan-400/0 via-cyan-400/10 to-cyan-400/0 transform -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-700" />
                    <i className="ri-heart-line mr-2 sm:mr-3 group-hover:scale-110 transition-transform" />
                    Gửi lời chúc
                  </button>
                </Link>
              </div>
            </div>
          </div>

          {/* RIGHT HERO CAROUSEL */}
          <div
            className={`transform transition-all duration-1000 delay-500 ${
              isVisible ? 'translate-x-0 opacity-100' : 'translate-x-10 opacity-0'
            }`}
          >
            <div className="relative">
              <div className="relative overflow-hidden rounded-3xl shadow-2xl">
                <div className="relative h-96 md:h-[500px]">
                  {heroImages.map((image, index) => (
                    <div
                      key={index}
                      className={`absolute inset-0 transition-all duration-1000 ${
                        index === currentImageIndex
                          ? 'opacity-100 scale-100'
                          : 'opacity-0 scale-105'
                      }`}
                    >
                      <img
                        src={image}
                        alt={`Congress Image ${index + 1}`}
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-cyan-600/30 to-transparent" />
                    </div>
                  ))}
                </div>

                {/* Indicators */}
                <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2 flex space-x-3">
                  {heroImages.map((_, index) => (
                    <button
                      key={index}
                      onClick={() => setCurrentImageIndex(index)}
                      className={`w-3 h-3 rounded-full transition-all duration-300 cursor-pointer ${
                        index === currentImageIndex
                          ? 'bg-white scale-125 shadow-lg'
                          : 'bg-white/50 hover:bg-white/75'
                      }`}
                    />
                  ))}
                </div>

                {/* Arrows */}
                {heroImages.length > 1 && (
                  <>
                    <button
                      onClick={() =>
                        setCurrentImageIndex(
                          (prev) => (prev - 1 + heroImages.length) % heroImages.length,
                        )
                      }
                      className="absolute left-4 top-1/2 transform -translate-y-1/2 w-12 h-12 bg-white/20 backdrop-blur-sm hover:bg-white/30 rounded-full flex items-center justify-center transition-all duration-300 cursor-pointer group"
                    >
                      <i className="ri-arrow-left-line text-white text-xl group-hover:scale-110 transition-transform" />
                    </button>
                    <button
                      onClick={() =>
                        setCurrentImageIndex(
                          (prev) => (prev + 1) % heroImages.length,
                        )
                      }
                      className="absolute right-4 top-1/2 transform -translate-y-1/2 w-12 h-12 bg-white/20 backdrop-blur-sm hover:bg-white/30 rounded-full flex items-center justify-center transition-all duration-300 cursor-pointer group"
                    >
                      <i className="ri-arrow-right-line text-white text-xl group-hover:scale-110 transition-transform" />
                    </button>
                  </>
                )}
              </div>

              <div className="absolute -top-6 -right-6 w-24 h-24 bg-gradient-to-br from-cyan-400 to-cyan-600 rounded-full opacity-20 blur-xl" />
              <div className="absolute -bottom-6 -left-6 w-32 h-32 bg-gradient-to-tr from-cyan-500 to-cyan-700 rounded-full opacity-15 blur-2xl" />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
