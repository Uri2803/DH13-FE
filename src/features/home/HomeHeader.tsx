// src/pages/home/components/HomeHeader.tsx
import React from 'react';

interface HomeHeaderProps {
  isVisible: boolean;
}

const HomeHeader: React.FC<HomeHeaderProps> = ({ isVisible }) => {
  return (
    <header className="relative bg-gradient-to-r from-cyan-400 via-cyan-500 to-cyan-600 text-white shadow-2xl overflow-hidden">
      <img
        src="Trongdong.png"
        alt=""
        aria-hidden
        className="absolute inset-0 w-full h-full object-cover opacity-15
                    pointer-events-none select-none mix-blend-soft-light"
      />
      <div className="container mx-auto px-4 py-8 sm:py-10 md:py-12 relative">
        <div
          className={`text-center transform transition-all duration-1000 ${
            isVisible ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'
          }`}
        >
          {/* Logo tròn */}
          <div className="flex justify-center mb-6 sm:mb-8">
            <div
              className="relative w-28 h-28 sm:w-36 sm:h-36 md:w-40 md:h-40 2xl:w-48 2xl:h-48 
                                rounded-full bg-gradient-to-br from-white/20 to-cyan-700/20
                                backdrop-blur-sm flex items-center justify-center 
                                border-[3px] border-white/30 shadow-2xl"
            >
              <div className="absolute inset-3 border-2 border-white/40 rounded-full" />
              <img
                src="/logo-square.png"
                alt="Logo HSV"
                className="relative z-10 w-20 h-20 sm:w-24 sm:h-24 md:w-28 md:h-28 2xl:w-32 2xl:h-32 
                              object-contain rounded-full drop-shadow-lg"
              />
            </div>
          </div>

          {/* Dòng HỘI SINH VIÊN VIỆT NAM */}
          <h1
            className="px-2 text-2xl sm:text-3xl md:text-5xl lg:text-6xl font-bold mb-3 sm:mb-4 
                         bg-gradient-to-r from-white via-cyan-100 to-white bg-clip-text 
                         text-transparent leading-tight drop-shadow-lg"
          >
            HỘI SINH VIÊN VIỆT NAM
          </h1>

          {/* 2 dòng TRƯỜNG / ĐHQG-HCM */}
          <div className="relative mb-3 sm:mb-4 px-2">
            <div className="hidden sm:block absolute left-1/2 transform -translate-x-1/2 -top-2 w-32 h-1 bg-gradient-to-r from-transparent via-white/50 to-transparent rounded-full" />
            <p className="text-lg sm:text-2xl md:text-3xl font-semibold text-white mb-1 sm:mb-2 drop-shadow-md">
              TRƯỜNG ĐẠI HỌC KHOA HỌC TỰ NHIÊN
            </p>
            <p className="text-sm sm:text-lg md:text-xl text-cyan-100 font-medium drop-shadow-md">
              ĐẠI HỌC QUỐC GIA THÀNH PHỐ HỒ CHÍ MINH
            </p>
            <div className="hidden sm:block absolute left-1/2 transform -translate-x-1/2 -bottom-2 w-32 h-1 bg-gradient-to-r from-transparent via-cyan-200/50 to-transparent rounded-full" />
          </div>

          {/* Nhiệm kỳ */}
          <div
            className="inline-flex flex-row items-center justify-center gap-2 sm:gap-3 
                            bg-gradient-to-r from-white/20 to-cyan-700/20 backdrop-blur-sm 
                            rounded-2xl px-4 sm:px-6 md:px-8 py-3 
                            border border-white/30 mt-4 shadow-xl"
          >
            <span className="text-[11px] sm:text-sm md:text-base font-semibold text-white text-center whitespace-nowrap">
              Đại hội đại biểu Hội Sinh viên Trường <br /> Lần thứ XIII - Nhiệm kỳ
              2025–2028
            </span>
          </div>

          {/* Icon sao */}
          <div className="flex justify-center space-x-3 sm:space-x-4 mt-4 sm:mt-6">
            <i className="ri-star-fill text-white text-2xl sm:text-3xl animate-pulse drop-shadow-lg" />
            <i
              className="ri-star-fill text-cyan-200 text-xl sm:text-2xl animate-pulse drop-shadow-lg"
              style={{ animationDelay: '0.5s' }}
            />
            <i
              className="ri-star-fill text-white text-2xl sm:text-3xl animate-pulse drop-shadow-lg"
              style={{ animationDelay: '1s' }}
            />
          </div>
        </div>
      </div>

      <div className="absolute bottom-0 left-0 w-full overflow-hidden">
        <svg
          className="relative block w-full h-8 sm:h-10 md:h-12"
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 1200 120"
          preserveAspectRatio="none"
        >
          <path
            d="M321.39,56.44c58-10.79,114.16-30.13,172-41.86,82.39-16.72,168.19-17.73,250.45-.39C823.78,31,906.67,72,985.66,92.83c70.05,18.48,146.53,26.09,214.34,3V0H0V27.35A600.21,600.21,0,0,0,321.39,56.44Z"
            fill="rgba(255,255,255,0.1)"
          />
        </svg>
      </div>
    </header>
  );
};

export default HomeHeader;
