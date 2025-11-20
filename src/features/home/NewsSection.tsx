// src/pages/home/components/NewsSection.tsx
import React from 'react';

interface NewsSectionProps {
  isVisible: boolean;
}

const NewsSection: React.FC<NewsSectionProps> = ({ isVisible }) => {
  return (
    <div
      className={`transform transition-all duration-1000 delay-300 ${
        isVisible ? 'translate-x-0 opacity-100' : 'translate-x-10 opacity-0'
      }`}
    >
      <div className="text-center mb-12">
        <h2 className="text-4xl font-bold bg-gradient-to-r from-cyan-600 to-cyan-700 bg-clip-text text-transparent mb-6">
          Tin nổi bật Đại hội
        </h2>
        <p className="text-xl text-gray-600">
          Những thông tin quan trọng và điểm nhấn của nhiệm kỳ mới
        </p>
      </div>
      <div className="space-y-8">
        <div className="group bg-white rounded-2xl shadow-lg border border-gray-100 p-8 hover:shadow-2xl transition-all duration-500 ring-2 ring-cyan-500 bg-gradient-to-br from-cyan-50/50 to-white transform hover:-translate-y-1">
          <div className="space-y-6">
            <div className="relative overflow-hidden rounded-xl">
              <img
                alt="Đại hội Hội Sinh viên Trường lần thứ XIII"
                className="w-full h-64 object-cover object-top group-hover:scale-105 transition-transform duration-500"
                src="https://readdy.ai/api/search-image?query=Vietnamese%20university%20student%20congress%20in%20a%20large%20auditorium%20with%20banners%20and%20blue%20decoration%2C%20formal%20meeting%20of%20students%27%20union%2C%20bright%20lighting&width=800&height=500&seq=info1&orientation=landscape"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-cyan-600/20 to-transparent" />
            </div>
            <div>
              <div className="flex items-center space-x-4 mb-4">
                <h3 className="text-2xl font-bold text-gray-800 flex-1">
                  Đại hội XIII – Kiến tạo tương lai sinh viên Tự nhiên
                </h3>
                <span className="bg-gradient-to-r from-cyan-500 to-cyan-600 text-white text-sm px-4 py-2 rounded-full whitespace-nowrap">
                  Nổi bật
                </span>
              </div>
              <p className="text-gray-700 mb-6 leading-relaxed text-lg">
                Đại hội đại biểu Hội Sinh viên Trường Đại học Khoa học Tự nhiên,
                ĐHQG-HCM lần thứ XIII đánh dấu bước chuyển quan trọng trong việc đẩy
                mạnh phong trào Sinh viên 5 Tốt, tăng cường ứng dụng chuyển đổi số
                trong công tác Hội, chăm lo tốt hơn cho nhu cầu học tập, nghiên cứu,
                việc làm, sức khỏe thể chất và tinh thần của sinh viên.
              </p>
              <div className="text-gray-500 flex items-center">
                <i className="ri-time-line mr-2" />
                11:00 21-12
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Có thể sau này gắn link timeline Đại hội */}
      <div className="text-center mt-12">
        <button className="group bg-gray-100 hover:bg-gray-200 text-gray-800 px-6 py-3 text-lg font-medium rounded-xl transition-all duration-300 whitespace-nowrap cursor-pointer shadow-lg hover:shadow-xl transform hover:-translate-y-1">
          <i className="ri-calendar-event-line mr-2 group-hover:scale-110 transition-transform" />
          Xem diễn biến Đại hội
        </button>
      </div>
    </div>
  );
};

export default NewsSection;
