// src/pages/home/components/HomeFooter.tsx
import React from 'react';

const HomeFooter: React.FC = () => {
  return (
    <footer className="bg-gradient-to-r from-cyan-700 to-cyan-800 text-white py-12">
      <div className="container mx-auto px-4">
        <div className="grid md:grid-cols-3 gap-12">
          <div>
            <h3 className="text-2xl font-bold mb-6 text-cyan-200">Liên hệ</h3>
            <div className="space-y-4 text-gray-300">
              <p className="flex items-start">
                <i className="ri-map-pin-line mr-3 mt-1 text-cyan-300" />
                227 Nguyễn Văn Cừ, Phường Chợ Quán, TP. Hồ Chí Minh
              </p>
              <p className="flex items-center">
                <i className="ri-phone-line mr-3 text-cyan-300" />
                (028) 3835 1002
              </p>
              <p className="flex items-center">
                <i className="ri-mail-line mr-3 text-cyan-300" />
                hoisinhvien@hcmus.edu.vn
              </p>
            </div>
          </div>
          <div>
            <h3 className="text-2xl font-bold mb-6 text-cyan-200">Liên kết</h3>
            <ul className="space-y-3 text-gray-300">
              <li>
                <a
                  href="https://hcmus.edu.vn/"
                  className="hover:text-cyan-200 cursor-pointer transition-colors duration-200"
                >
                  Trang chủ Trường
                </a>
              </li>
              <li>
                <a
                  href="https://doantn.hcmus.edu.vn/?fbclid=IwY2xjawOK8K9leHRuA2FlbQIxMABicmlkETFuOW5BeDJ0Z2FxcUtDQVprc3J0YwZhcHBfaWQQMjIyMDM5MTc4ODIwMDg5MghjYWxsc2l0ZQEyAAEeU8Qx4oFpq0r9JuIqkpQdL1ClSqQuxEHeF8qmldQBTRl_XveKxyFvf08YX5U_aem_zRKQy-DFNMTMhgUX3KOiuw"
                  className="hover:text-cyan-200 cursor-pointer transition-colors duration-200"
                >
                  Đoàn Thanh niên
                </a>
              </li>
              <li>
                <a
                  href="https://new-portal3.hcmus.edu.vn/Login.aspx?ReturnUrl=%2f"
                  className="hover:text-cyan-200 cursor-pointer transition-colors duration-200"
                >
                  Portal Sinh viên
                </a>
              </li>
            </ul>
          </div>
          <div>
            <h3 className="text-2xl font-bold mb-6 text-cyan-200">Theo dõi</h3>
            <div className="flex space-x-6">
              <a
                href="https://www.facebook.com/DoanHoiHCMUS"
                className="text-gray-300 hover:text-cyan-200 cursor-pointer transition-all duration-200 transform hover:scale-110"
              >
                <i className="ri-facebook-fill text-3xl" />
              </a>
              <a
                href="https://www.youtube.com/@vnuhcmus"
                className="text-gray-300 hover:text-cyan-200 cursor-pointer transition-all duration-200 transform hover:scale-110"
              >
                <i className="ri-youtube-fill text-3xl" />
              </a>
            </div>
          </div>
        </div>
        <div className="border-t border-cyan-600 mt-12 pt-8 text-center text-gray-300">
          <p className="text-lg">
            © 2025 Hội Sinh viên Trường Đại học Khoa học Tự nhiên, ĐHQG-HCM.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default HomeFooter;
