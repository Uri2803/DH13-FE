// src/pages/home/components/CongressInfoSection.tsx
import React from 'react';

interface CongressInfoSectionProps {
  isVisible: boolean;
}

const CongressInfoSection: React.FC<CongressInfoSectionProps> = ({ isVisible }) => {
  const items = [
    {
      icon: 'ri-calendar-event-line',
      title: 'Thời gian – Địa điểm',
      content: ['30 tháng 11 năm 2025', 'Hội trường Trường ĐH Khoa học Tự nhiên'],
      color: 'cyan',
    },
    {
      icon: 'ri-team-line',
      title: 'Quy mô đại biểu',
      content: ['Khoảng 150 đại biểu chính thức', 'Đại diện 9 khoa, các đơn vị trực thuộc'],
      color: 'blue',
    },
    {
      icon: 'ri-trophy-line',
      title: 'Mục tiêu nhiệm kỳ XIII',
      content: [
        'Phát huy phong trào Sinh viên 5 Tốt',
        'Xây dựng Hội Sinh viên vững mạnh, số hóa hoạt động',
      ],
      color: 'teal',
    },
  ];

  return (
    <section className="py-20 bg-white relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-r from-cyan-50/50 to-cyan-100/30" />
      <div className="container mx-auto px-4 relative">
        <div
          className={`text-center mb-16 transform transition-all duration-1000 ${
            isVisible ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'
          }`}
        >
          <h2 className="text-4xl font-bold bg-gradient-to-r from-cyan-600 to-cyan-700 bg-clip-text text-transparent mb-6">
            Thông tin Đại hội
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
            Đại hội đại biểu Hội Sinh viên Việt Nam Trường Đại học Khoa học Tự nhiên,
            ĐHQG-HCM lần thứ XIII, nhiệm kỳ 2025–2028 với khẩu hiệu hành động “Vững
            bước tri thức – Khơi nguồn sáng tạo – Kiến tạo tương lai”, tổng kết kết quả
            nhiệm kỳ XII (2023–2025) và xác định mục tiêu, chỉ tiêu, chương trình hành
            động cho giai đoạn mới.
          </p>
        </div>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {items.map((item, index) => (
            <div
              key={index}
              className={`group bg-white rounded-2xl shadow-lg border border-gray-100 p-8 hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2 ${
                isVisible ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'
              }`}
              style={{ transitionDelay: `${600 + index * 200}ms` }}
            >
              <div className="text-center">
                <div
                  className={`w-20 h-20 bg-${item.color}-100 rounded-full flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300`}
                >
                  <i className={`${item.icon} text-3xl text-${item.color}-600`} />
                </div>
                <h3 className="text-2xl font-bold mb-4 text-gray-800">{item.title}</h3>
                {item.content.map((text, i) => (
                  <p key={i} className="text-gray-600 text-lg">
                    {text}
                  </p>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default CongressInfoSection;
