// src/pages/home/components/CallToActionSection.tsx
import React from 'react';
import { Link } from 'react-router-dom';

interface CallToActionSectionProps {
  isVisible: boolean;
}

const CallToActionSection: React.FC<CallToActionSectionProps> = ({ isVisible }) => {
  return (
    <section className="py-20 bg-gradient-to-r from-cyan-600 via-cyan-500 to-cyan-600 text-white relative overflow-hidden">
      <img
        src="Trongdong.png"
        alt=""
        aria-hidden
        className="absolute inset-0 w-full h-full object-cover opacity-15
          pointer-events-none select-none mix-blend-soft-light"
      />
      <div className="absolute inset-0 bg-gradient-to-r from-white/10 to-cyan-800/10" />
      <div className="container mx-auto px-4 text-center relative">
        <div
          className={`transform transition-all duration-1000 ${
            isVisible ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'
          }`}
        >
          <h2 className="text-3xl md:text-5xl font-semibold  mb-6  bg-gradient-to-r from-white to-cyan-100 bg-clip-text text-transparent whitespace-nowrap mx-auto  ">
            Tham gia cùng chúng tôi
          </h2>
          <p className="text-xl md:text-2xl mb-12 max-w-3xl mx-auto leading-relaxed text-cyan-100">
            Hãy cùng nhau xây dựng một cộng đồng sinh viên Tự nhiên bản lĩnh, sáng tạo,
            sẵn sàng hội nhập và cống hiến cho đất nước.
          </p>
          <div className="flex flex-col sm:flex-row gap-6 justify-center">
            <Link to="/login">
              <button className="group bg-white text-cyan-700 hover:bg-cyan-50 px-8 py-4 text-xl font-medium rounded-xl transition-all duration-300 whitespace-nowrap cursor-pointer shadow-lg hover:shadow-xl transform hover:-translate-y-1">
                <i className="ri-login-box-line mr-2 group-hover:scale-110 transition-transform" />
                Đăng nhập ngay
              </button>
            </Link>
            <Link to="/wishes">
              <button className="group bg-cyan-400/80 hover:bg-cyan-400 text-white border-2 border-cyan-300/50 hover:border-cyan-300 px-8 py-4 text-xl font-medium rounded-xl transition-all duration-300 whitespace-nowrap cursor-pointer shadow-lg hover:shadow-xl transform hover:-translate-y-1">
                <i className="ri-heart-line mr-2 group-hover:scale-110 transition-transform" />
                Gửi lời chúc mừng
              </button>
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
};

export default CallToActionSection;
