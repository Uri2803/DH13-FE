import React from 'react';
import bg from '../../assets/image/nendaihoi.png'
interface NewsSectionProps {
  isVisible: boolean;
}

const NewsSection: React.FC<NewsSectionProps> = ({ isVisible }) => {
  return (
    <div
      className={`
        bg-white/95 backdrop-blur-sm rounded-3xl shadow-2xl border border-cyan-100 
        p-8 md:p-10 relative overflow-hidden h-full
        transform transition-all duration-700
        ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-6 opacity-0'}
      `}
    >
      {/* Background decor */}
      <div className="absolute -top-20 -right-10 w-40 h-40 bg-gradient-to-bl from-cyan-500/15 via-cyan-400/10 to-transparent rounded-full" />
      <div className="absolute -bottom-16 -left-16 w-40 h-40 bg-gradient-to-tr from-cyan-400/15 via-cyan-500/10 to-transparent rounded-full" />

      <div className="relative z-10 flex flex-col gap-6">
        {/* Title */}
        <div>
          <p className="text-xs font-semibold tracking-[0.25em] text-cyan-600 uppercase mb-2">
            Đại hội Hội Sinh viên Trường ĐH Khoa học Tự nhiên
          </p>
          <h2 className="text-2xl md:text-3xl font-extrabold text-gray-900 leading-snug">
            Dấu ấn nhiệm kỳ XII &amp; tầm nhìn nhiệm kỳ XIII
          </h2>
          <p className="mt-3 text-sm md:text-base text-gray-600 leading-relaxed">
            Từ những bước đi bền bỉ của nhiệm kỳ 2023–2025 đến khát vọng bứt phá giai đoạn 2025–2028,
            sinh viên Tự nhiên tiếp tục viết tiếp câu chuyện tri thức, sáng tạo và cống hiến.
          </p>
        </div>

        {/* Quick stats */}
        <div className="grid grid-cols-2 gap-3 text-xs md:text-sm">
          <div className="bg-cyan-50/80 rounded-2xl px-4 py-3 border border-cyan-100">
            <p className="text-[11px] font-semibold text-cyan-700 uppercase tracking-wide">
              Phong trào Sinh viên 5 Tốt
            </p>
            <p className="mt-1 font-bold text-cyan-900 text-sm md:text-base">
              550&nbsp;SV5T cấp Trường
            </p>
            <p className="text-[11px] text-gray-600 mt-1">
              156 cấp ĐHQG-HCM, 125 cấp Thành phố, 3 cấp Trung ương trong 2 năm học.
            </p>
          </div>
          <div className="bg-cyan-50/50 rounded-2xl px-4 py-3 border border-cyan-100">
            <p className="text-[11px] font-semibold text-cyan-700 uppercase tracking-wide">
              Cộng đồng &amp; chuyển đổi số
            </p>
            <p className="mt-1 font-bold text-cyan-900 text-sm md:text-base">
              12 công trình chuyên môn
            </p>
            <p className="text-[11px] text-gray-600 mt-1">
              Nhiều hoạt động tình nguyện ứng dụng CNTT, trí tuệ nhân tạo và số hóa phục vụ cộng đồng.
            </p>
          </div>
        </div>

        {/* Two columns: Kết quả & Phương hướng */}
        <div className="grid gap-6 md:grid-cols-2">
          {/* Kết quả nhiệm kỳ XII */}
          <div className="bg-gradient-to-br from-cyan-50/80 via-white to-white rounded-2xl border border-cyan-100/80 p-4 md:p-5">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-100/70 text-cyan-800 text-xs font-semibold mb-3">
              <i className="ri-flag-2-line text-sm" />
              Nhiệm kỳ XII (2023–2025)
            </div>
            <h3 className="text-base md:text-lg font-semibold text-gray-900 mb-2">
              Dấu ấn một nhiệm kỳ bứt phá
            </h3>
            <ul className="space-y-2.5 text-xs md:text-sm text-gray-700 leading-relaxed">
              <li className="flex gap-2">
                <span className="mt-1 text-cyan-500">
                  <i className="ri-check-line" />
                </span>
                <span>
                  Phong trào <span className="font-semibold">“Sinh viên 5 Tốt”</span> được triển khai
                  đồng bộ từ Chi hội đến cấp Trường, vừa chú trọng số lượng, vừa nâng rõ chất lượng
                  và môi trường rèn luyện thường xuyên cho sinh viên.
                </span>
              </li>
              <li className="flex gap-2">
                <span className="mt-1 text-cyan-500">
                  <i className="ri-check-line" />
                </span>
                <span>
                  Hệ sinh thái học thuật – nghiên cứu khoa học được mở rộng với các cuộc thi ý tưởng,
                  ngày hội học thuật, hội nghị khoa học trẻ và chương trình ươm mầm sinh viên nghiên cứu,
                  tạo không gian để sinh viên Tự nhiên chinh phục tri thức mới.
                </span>
              </li>
              <li className="flex gap-2">
                <span className="mt-1 text-cyan-500">
                  <i className="ri-check-line" />
                </span>
                <span>
                  Các chiến dịch tình nguyện Xuân Tình nguyện, Mùa hè xanh, hiến máu, hiến tóc, 
                  chương trình ứng dụng chuyên môn (AI hỗ trợ người khiếm thị, phục dựng di ảnh, số hóa di tích…)
                  lan tỏa hình ảnh sinh viên Tự nhiên trách nhiệm, nhân ái.
                </span>
              </li>
              <li className="flex gap-2">
                <span className="mt-1 text-cyan-500">
                  <i className="ri-check-line" />
                </span>
                <span>
                  Công tác tư vấn, hỗ trợ được đẩy mạnh: chăm sóc sức khỏe tinh thần, học bổng 
                  <span className="font-semibold"> “Bạn giúp bạn”</span>, học bổng cán bộ Đoàn – Hội,
                  kết nối doanh nghiệp, đồng hành cùng sinh viên vượt khó và phát triển. 
                </span>
              </li>
            </ul>
          </div>

          {/* Phương hướng nhiệm kỳ XIII */}
          <div className="bg-gradient-to-tr from-cyan-400 via-cyan-600 to-cyan-700 rounded-2xl text-white p-4 md:p-5 relative overflow-hidden"
          >
          
            <div className="absolute inset-0 opacity-15 bg-[radial-gradient(circle_at_top,_#ffffff_0,_transparent_55%)]" />
            <div className="relative z-10">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-cyan-50 text-xs font-semibold mb-3">
                <i className="ri-compass-3-line text-sm" />
                Nhiệm kỳ XIII (2025–2028)
              </div>
              <h3 className="text-base md:text-lg font-semibold mb-2">
                Vững bước tri thức – Khơi nguồn sáng tạo – Kiến tạo tương lai
              </h3>
              <p className="text-xs md:text-sm text-cyan-50/90 mb-3">
                Hội Sinh viên định hướng xây dựng thế hệ sinh viên bản lĩnh, giàu lý tưởng, làm chủ tri thức
                khoa học – công nghệ và sẵn sàng hội nhập quốc tế.
              </p>
              <ul className="space-y-2.5 text-xs md:text-sm text-cyan-50/95 leading-relaxed">
                <li className="flex gap-2">
                  <span className="mt-1">
                    <i className="ri-sparkling-2-line" />
                  </span>
                  <span>
                    Tiếp tục đưa phong trào <span className="font-semibold">Sinh viên 5 Tốt</span> 
                    trở thành thương hiệu rèn luyện toàn diện, gắn chặt với cơ hội học bổng, thực tập
                    và việc làm cho sinh viên.
                  </span>
                </li>
                <li className="flex gap-2">
                  <span className="mt-1">
                    <i className="ri-cpu-line" />
                  </span>
                  <span>
                    Đẩy mạnh đổi mới sáng tạo và chuyển đổi số: phát huy các công trình tình nguyện
                    ứng dụng chuyên môn, khuyến khích sinh viên tham gia đề tài nghiên cứu, khởi nghiệp
                    trong lĩnh vực khoa học, công nghệ, dữ liệu và AI.
                  </span>
                </li>
                <li className="flex gap-2">
                  <span className="mt-1">
                    <i className="ri-emotion-happy-line" />
                  </span>
                  <span>
                    Chú trọng chăm lo sức khỏe thể chất và tinh thần, mở rộng các không gian chữa lành,
                    sân chơi thể thao – văn hóa và chương trình kỹ năng thực hành xã hội.
                  </span>
                </li>
                <li className="flex gap-2">
                  <span className="mt-1">
                    <i className="ri-global-line" />
                  </span>
                  <span>
                    Tăng cường hội nhập quốc tế: giao lưu sinh viên quốc tế, câu lạc bộ ngoại ngữ,
                    hoạt động kết nối học bổng và cơ hội trao đổi, giúp sinh viên tự tin bước ra môi trường toàn cầu.
                  </span>
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* Tiny footer line */}
        <p className="mt-2 text-[11px] text-gray-500 leading-relaxed">
          Nhiệm kỳ mới kế thừa thành quả của nhiệm kỳ XII, tiếp tục lấy sinh viên làm trung tâm,
          khoa học công nghệ làm động lực và cộng đồng làm điểm tựa để cùng nhau kiến tạo tương lai.
        </p>
      </div>
    </div>
  );
};

export default NewsSection;
