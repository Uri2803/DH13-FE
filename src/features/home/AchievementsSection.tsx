// src/pages/home/components/AchievementsSection.tsx
import React from 'react';

interface StatItem {
  number: string;
  label: string;
  color: string;
}

interface AchievementsSectionProps {
  isVisible: boolean;
  stats: StatItem[];
}

const AchievementsSection: React.FC<AchievementsSectionProps> = ({
  isVisible,
  stats,
}) => {
  const sections = [
    {
      icon: 'ri-star-line',
      title: 'Hoạt động nổi bật',
      color: 'yellow',
      items: [
        'Phong trào Sinh viên 5 Tốt được triển khai đồng bộ từ cấp trường đến cơ sở, nhiều gương SV5T trở thành hạt nhân dẫn dắt phong trào.',
        'Chuỗi chương trình học thuật – nghiên cứu khoa học như S-IDEAS, A-EA, Hội nghị Khoa học trẻ, cuộc thi CIC, giải thưởng Sinh viên NCKH Euréka…',
        'Tổ chức ngày hội, chương trình chủ đề chuyển đổi số, tạo môi trường cho sinh viên tiếp cận khoa học – công nghệ hiện đại.',
        'Mở rộng các hoạt động giao lưu quốc tế, hội nhập, sân chơi ngoại ngữ và kỹ năng mềm cho sinh viên.',
      ],
    },
    {
      icon: 'ri-award-line',
      title: 'Thành tích đạt được',
      color: 'cyan',
      items: [
        '550 Sinh viên 5 Tốt cấp Trường, 156 cấp ĐHQG-HCM, 125 cấp Thành phố trong nhiệm kỳ 2023–2025.',
        '52 hoạt động cấp Trường hỗ trợ rèn luyện kỹ năng thực hành xã hội, 12 chương trình tham quan doanh nghiệp cho sinh viên.',
        '12 công trình tình nguyện ứng dụng chuyên môn, trong đó có 4 công trình gắn với chuyển đổi số phục vụ cộng đồng.',
        'Phát triển quỹ “Bạn giúp bạn” với 22 suất học bổng 2.000.000 đồng, nhiều hoạt động hỗ trợ sức khỏe thể chất, tinh thần cho sinh viên.',
      ],
    },
  ];

  return (
    <section className="py-20 bg-white relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-r from-cyan-50/30 to-cyan-100/20" />
      <div className="container mx-auto px-4 relative">
        <div
          className={`text-center mb-16 transform transition-all duration-1000 ${
            isVisible ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'
          }`}
        >
          <h2 className="text-4xl font-bold bg-gradient-to-r from-cyan-600 to-cyan-700 bg-clip-text text-transparent mb-6">
            Thành tích nhiệm kỳ 2023–2025
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Những kết quả nổi bật trong phong trào Sinh viên 5 Tốt, hoạt động tình
            nguyện, học thuật – nghiên cứu khoa học và chăm lo đời sống sinh viên.
          </p>
        </div>
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 mb-16">
          {stats.map((stat, index) => (
            <div
              key={index}
              className={`text-center group transform transition-all duration-1000 ${
                isVisible ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'
              }`}
              style={{ transitionDelay: `${800 + index * 200}ms` }}
            >
              <div
                className={`text-5xl md:text-6xl font-bold ${stat.color} mb-4 group-hover:scale-110 transition-transform duration-300`}
              >
                {stat.number}
              </div>
              <p className="text-gray-600 text-lg font-medium">{stat.label}</p>
            </div>
          ))}
        </div>
        <div className="grid md:grid-cols-2 gap-12">
          {sections.map((section, index) => (
            <div
              key={index}
              className={`group bg-white rounded-2xl shadow-lg border border-gray-100 p-8 hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2 ${
                isVisible ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'
              }`}
              style={{ transitionDelay: `${1200 + index * 200}ms` }}
            >
              <h3 className="text-2xl font-bold mb-6 flex items-center">
                <i
                  className={`${section.icon} text-${section.color}-500 mr-3 text-3xl group-hover:scale-110 transition-transform duration-300`}
                />
                {section.title}
              </h3>
              <ul className="space-y-3 text-gray-600">
                {section.items.map((item, i) => (
                  <li key={i} className="flex items-start text-lg">
                    <i className="ri-check-line text-green-500 mr-3 mt-1 flex-shrink-0" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default AchievementsSection;
