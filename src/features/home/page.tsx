import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
const Home = () => {
  const [currentWishIndex, setCurrentWishIndex] = useState(0);
  const [isVisible, setIsVisible] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  useEffect(() => {
    setIsVisible(true);
  }, []);

  // Image carousel for hero section
  const heroImages = [
    "https://readdy.ai/api/search-image?query=Vietnamese%20university%20student%20congress%20ceremony%20with%20delegates%20in%20formal%20attire%2C%20modern%20auditorium%20setting%20with%20red%20banners%20and%20flags%2C%20professional%20lighting%2C%20official%20government%20meeting%20atmosphere%2C%20clean%20background&width=600&height=400&seq=hero1&orientation=landscape",
    "https://readdy.ai/api/search-image?query=Vietnamese%20university%20students%20voting%20in%20congress%20election%2C%20ballot%20boxes%20and%20voting%20booths%2C%20democratic%20process%20in%20university%20setting%2C%20formal%20academic%20environment%2C%20bright%20professional%20lighting%2C%20clean%20background&width=600&height=400&seq=hero2&orientation=landscape",
    "https://readdy.ai/api/search-image?query=Vietnamese%20university%20student%20union%20leaders%20giving%20speeches%20at%20podium%2C%20congress%20hall%20with%20audience%20applauding%2C%20official%20banners%20and%20decorations%2C%20professional%20conference%20setting%2C%20clean%20background&width=600&height=400&seq=hero3&orientation=landscape",
    "https://readdy.ai/api/search-image?query=Vietnamese%20university%20students%20celebrating%20congress%20success%20with%20certificates%20and%20awards%2C%20group%20photo%20with%20official%20congress%20backdrop%2C%20happy%20graduation-like%20atmosphere%2C%20professional%20setting%2C%20clean%20background&width=600&height=400&seq=hero4&orientation=landscape"
  ];

  // Auto-rotate images every 4 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentImageIndex((prev) => (prev + 1) % heroImages.length);
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  const wishes = [
    {
      name: "Nguyễn Văn An",
      role: "Đại biểu",
      department: "Chủ tịch Hội sinh viên khoa Toán - Tin học",
      message: "Chúc Đại hội thành công tốt đẹp, đoàn kết và phát triển mạnh mẽ!",
      time: "10:00 19-12",
      icon: "ri-vip-crown-line",
      iconBg: "bg-blue-100",
      iconColor: "text-blue-600",
      featured: true
    },
    {
      name: "Trần Thị Mai",
      role: "Sinh viên năm 3",
      department: "",
      message: "Chúc các anh chị đại biểu sức khỏe và thành công trong nhiệm kỳ mới!",
      time: "10:30 19-12",
      icon: "ri-user-line",
      iconBg: "bg-green-100",
      iconColor: "text-green-600",
      featured: false
    }
  ];

  const stats = [
    { number: "50+", label: "Hoạt động tổ chức", color: "text-blue-600" },
    { number: "15,000+", label: "Sinh viên tham gia", color: "text-green-600" },
    { number: "25", label: "Giải thưởng đạt được", color: "text-purple-600" },
    { number: "100%", label: "Khoa tham gia", color: "text-orange-600" }
  ];

  const activities = [
    {
      title: "Học thuật - Nghiên cứu",
      description: "Hỗ trợ sinh viên trong học tập, nghiên cứu khoa học và phát triển năng lực chuyên môn",
      image: "https://readdy.ai/api/search-image?query=Vietnamese%20university%20students%20participating%20in%20academic%20research%20competition%2C%20laboratory%20setting%20with%20modern%20equipment%2C%20students%20wearing%20lab%20coats%20working%20on%20scientific%20experiments%2C%20bright%20professional%20lighting%2C%20clean%20white%20background&width=400&height=250&seq=activity1&orientation=landscape"
    },
    {
      title: "Tình nguyện - Cộng đồng",
      description: "Tổ chức các hoạt động tình nguyện, đóng góp cho cộng đồng và xã hội",
      image: "https://readdy.ai/api/search-image?query=Vietnamese%20university%20students%20volunteering%20in%20community%20service%2C%20helping%20elderly%20people%20and%20children%2C%20outdoor%20community%20center%20setting%2C%20warm%20friendly%20atmosphere%20with%20smiling%20faces%2C%20clean%20white%20background&width=400&height=250&seq=activity2&orientation=landscape"
    },
    {
      title: "Văn hóa - Thể thao",
      description: "Phát triển tài năng văn hóa, thể thao và các hoạt động giải trí lành mạnh",
      image: "https://readdy.ai/api/search-image?query=Vietnamese%20university%20students%20performing%20cultural%20activities%20on%20stage%2C%20traditional%20and%20modern%20dance%20performances%2C%20colorful%20costumes%2C%20university%20auditorium%20with%20audience%20applauding%2C%20clean%20white%20background&width=400&height=250&seq=activity3&orientation=landscape"
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-cyan-50 via-white to-cyan-100">
      
      <header className="relative bg-gradient-to-r from-cyan-400 via-cyan-500 to-cyan-600 text-white shadow-2xl overflow-hidden">
        <img
          src="Trongdong.png"
          alt=""
          aria-hidden
          className="absolute inset-0 w-full h-full object-cover opacity-15
                    pointer-events-none select-none mix-blend-soft-light"
          />
        <div className="container mx-auto px-4 py-12 relative">
          <div className={`text-center transform transition-all duration-1000 ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`}>
            {/* Vietnamese Student Union Logo/Emblem with bronze drum inspiration */}
            {/* Logo to hơn */}
              <div className="flex justify-center mb-8">
                <div className="relative w-44 h-44 md:w-40 md:h-40 2xl:w-48 2xl:h-48 
                                rounded-full bg-gradient-to-br from-white/20 to-cyan-700/20
                                backdrop-blur-sm flex items-center justify-center 
                                border-[3px] border-white/30 shadow-2xl">
                  {/* vòng trang trí */}
                  <div className="absolute inset-3 border-2 border-white/40 rounded-full" />
                  {/* ảnh logo */}
                  <img
                    src="/logo-square.png"
                    alt="Logo HSV"
                    className="relative z-10 w-36 h-36 md:w-28 md:h-28 2xl:w-32 2xl:h-32 
                              object-contain rounded-full drop-shadow-lg"
                  />
                </div>
              </div>

            
            {/* Main Title with sky blue theme */}
            <h1 className="text-7xl md:text-4xl font-bold mb-4 bg-gradient-to-r from-white via-cyan-100 to-white bg-clip-text text-transparent leading-tight drop-shadow-lg"
            >
              HỘI SINH VIÊN VIỆT NAM
            </h1>
            
            {/* Subtitle with sky blue and white colors */}
            <div className="relative mb-4">
              <div className="absolute left-1/2 transform -translate-x-1/2 -top-2 w-32 h-1 bg-gradient-to-r from-transparent via-white/50 to-transparent rounded-full"></div>
              <p className="text-2xl md:text-3xl font-semibold text-white mb-2 drop-shadow-md">
                TRƯỜNG ĐẠI HỌC KHOA HỌC TỰ NHIÊN
              </p>
              <p className="text-xl md:text-2xl text-cyan-100 font-medium drop-shadow-md ">
                ĐẠI HỌC QUỐC GIA THÀNH PHỐ HỒ CHÍ MINH
              </p>
              <div className="absolute left-1/2 transform -translate-x-1/2 -bottom-2 w-32 h-1 bg-gradient-to-r from-transparent via-cyan-200/50 to-transparent rounded-full"></div>
            </div>
            
            {/* Term with sky blue theme */}
            <div className="inline-flex items-center bg-gradient-to-r from-white/20 to-cyan-700/20 backdrop-blur-sm rounded-full px-8 py-3 border border-white/30 mt-4 shadow-xl">
              <i className="ri-calendar-event-line mr-3 text-xl text-white"></i>
              <span className="text-xl font-semibold text-white">Nhiệm kỳ 2025-2028</span>
            </div>
            
            {/* Vietnamese bronze drum star decoration */}
            <div className="flex justify-center space-x-4 mt-6">
              <i className="ri-star-fill text-white text-3xl animate-pulse drop-shadow-lg"></i>
              <i className="ri-star-fill text-cyan-200 text-2xl animate-pulse drop-shadow-lg" style={{animationDelay: '0.5s'}}></i>
              <i className="ri-star-fill text-white text-3xl animate-pulse drop-shadow-lg" style={{animationDelay: '1s'}}></i>
            </div>
          </div>
        </div>
        
        {/* Bottom wave decoration with sky blue colors */}
        <div className="absolute bottom-0 left-0 w-full overflow-hidden">
          <svg className="relative block w-full h-12" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 120" preserveAspectRatio="none">
            <path d="M321.39,56.44c58-10.79,114.16-30.13,172-41.86,82.39-16.72,168.19-17.73,250.45-.39C823.78,31,906.67,72,985.66,92.83c70.05,18.48,146.53,26.09,214.34,3V0H0V27.35A600.21,600.21,0,0,0,321.39,56.44Z" fill="rgba(255,255,255,0.1)"></path>
          </svg>
        </div>
      </header>

      {/* Hero Section with sky blue theme */}
      <section className="relative py-20 overflow-hidden bg-gradient-to-br from-cyan-50 via-white to-cyan-100">
        
        <div className="absolute inset-0 bg-gradient-to-br from-cyan-400/5 via-transparent to-cyan-600/5"></div>
        <div className="container mx-auto px-4">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            {/* Left Content */}
            <div className={`transform transition-all duration-1000 delay-300 ${isVisible ? 'translate-x-0 opacity-100' : '-translate-x-10 opacity-0'}`}>
              <div className="bg-white/95 backdrop-blur-sm rounded-3xl p-10 shadow-2xl border border-cyan-200/50 relative overflow-hidden">
                {/* Sky blue inspired gradient overlay */}
                <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-cyan-500/10 via-cyan-400/5 to-transparent rounded-bl-3xl"></div>
                
               <h2 className="mb-8 leading-tight text-center font-bold">
                {[
                  "VỮNG BƯỚC TRI THỨC",
                  "KHƠI NGUỒN SÁNG TẠO",
                  "KHƠI NGUỒN DỰNG TƯƠNG LAI",
                ].map((line, i) => (
                  <span
                    key={i}
                    className="flex items-center justify-center gap-3 mt-2 first:mt-0"
                  >
                    <i className="ri-star-fill text-cyan-700 text-2xl animate-pulse drop-shadow-lg"  style={{animationDelay: '0.5s'}}></i>
                    <span className="
                        text-4xl md:text-2xl
                        bg-gradient-to-r from-cyan-500 via-cyan-500 to-cyan-700
                        bg-clip-text text-transparent tracking-wide
                        animate-gradient-move
                      ">
                        {line}
                      </span>

                    <i className="ri-star-fill text-cyan-700 text-2xl animate-pulse drop-shadow-lg" style={{animationDelay: '0.5s'}}></i>
                  </span>
                ))}
              </h2>

                <p className="text-xl text-gray-700 mb-10 leading-relaxed font-medium">
                  Hội sinh viên Việt Nam trường Đại học Khoa học tự nhiên xây dựng một Hội sinh viên vững mạnh, năng động và đầy sáng tạo, hướng tới tương lai phát triển bền vững
                </p>
                <div className="flex flex-col sm:flex-row gap-6">
                  <Link to="/login">
                    <button className="group bg-gradient-to-r from-cyan-500 via-cyan-600 to-cyan-700 hover:from-cyan-600 hover:via-cyan-700 hover:to-cyan-800 text-white px-10 py-5 text-lg font-semibold rounded-2xl transition-all duration-300 whitespace-nowrap cursor-pointer shadow-xl hover:shadow-2xl transform hover:-translate-y-2 relative overflow-hidden">
                      <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 transform -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-700"></div>
                      
                      <i className="ri-login-box-line mr-3 group-hover:scale-110 transition-transform"></i>
                          Đăng nhập hệ thống
                    </button>
                  </Link>
                  <Link to="/wishes">
                    <button className="group bg-white hover:bg-cyan-50 text-cyan-700 border-3 border-cyan-500 hover:border-cyan-600 px-10 py-5 text-lg font-semibold rounded-2xl transition-all duration-300 whitespace-nowrap cursor-pointer shadow-xl hover:shadow-2xl transform hover:-translate-y-2 relative overflow-hidden">
                      <div className="absolute inset-0 bg-gradient-to-r from-cyan-400/0 via-cyan-400/10 to-cyan-400/0 transform -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-700"></div>
                      <i className="ri-heart-line mr-3 group-hover:scale-110 transition-transform"></i>
                      Gửi lời chúc
                    </button>
                  </Link>
                </div>
              </div>
            </div>

            {/* Right Image Carousel */}
            <div className={`transform transition-all duration-1000 delay-500 ${isVisible ? 'translate-x-0 opacity-100' : 'translate-x-10 opacity-0'}`}>
              <div className="relative">
                {/* Main image container */}
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
                        <div className="absolute inset-0 bg-gradient-to-t from-cyan-600/30 to-transparent"></div>
                      </div>
                    ))}
                  </div>
                  
                  {/* Image indicators */}
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
                  
                  {/* Navigation arrows */}
                  <button
                    onClick={() => setCurrentImageIndex((prev) => (prev - 1 + heroImages.length) % heroImages.length)}
                    className="absolute left-4 top-1/2 transform -translate-y-1/2 w-12 h-12 bg-white/20 backdrop-blur-sm hover:bg-white/30 rounded-full flex items-center justify-center transition-all duration-300 cursor-pointer group"
                  >
                    <i className="ri-arrow-left-line text-white text-xl group-hover:scale-110 transition-transform"></i>
                  </button>
                  <button
                    onClick={() => setCurrentImageIndex((prev) => (prev + 1) % heroImages.length)}
                    className="absolute right-4 top-1/2 transform -translate-y-1/2 w-12 h-12 bg-white/20 backdrop-blur-sm hover:bg-white/30 rounded-full flex items-center justify-center transition-all duration-300 cursor-pointer group"
                  >
                    <i className="ri-arrow-right-line text-white text-xl group-hover:scale-110 transition-transform"></i>
                  </button>
                </div>
                
                {/* Sky blue decorative elements */}
                <div className="absolute -top-6 -right-6 w-24 h-24 bg-gradient-to-br from-cyan-400 to-cyan-600 rounded-full opacity-20 blur-xl"></div>
                <div className="absolute -bottom-6 -left-6 w-32 h-32 bg-gradient-to-tr from-cyan-500 to-cyan-700 rounded-full opacity-15 blur-2xl"></div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Congress Info with sky blue theme */}
      <section className="py-20 bg-white relative overflow-hidden">
        
        <div className="absolute inset-0 bg-gradient-to-r from-cyan-50/50 to-cyan-100/30">
        </div>
        <div className="container mx-auto px-4 relative">
          <div className={`text-center mb-16 transform transition-all duration-1000 ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`}>
            <h2 className="text-4xl font-bold bg-gradient-to-r from-cyan-600 to-cyan-700 bg-clip-text text-transparent mb-6">
              Thông tin Đại hội
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
              Đại hội Hội sinh viên lần thứ XIII nhiệm kỳ 2025-2028 với chủ đề Vững bước tri thức - Khơi nguồn sáng tạo - Dựng xây tương lai, nhằm tổng kết hoạt động nhiệm kỳ qua và đề ra phương hướng phát triển trong nhiệm kỳ tới.
            </p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              { icon: "ri-calendar-event-line", title: "Thời gian", content: ["30 tháng 11, 2025", "Hội trường B, ĐHKHTN"], color: "cyan" },
              { icon: "ri-team-line", title: "Đại biểu", content: ["150 đại biểu", "Từ 9 khoa"], color: "blue" },
              { icon: "ri-trophy-line", title: "Mục tiêu", content: ["Định hướng phát triển", "Nhiệm kỳ 2025-2028"], color: "teal" }
            ].map((item, index) => (
              <div 
                key={index}
                className={`group bg-white rounded-2xl shadow-lg border border-gray-100 p-8 hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2 ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`}
                style={{ transitionDelay: `${600 + index * 200}ms` }}
              >
                <div className="text-center">
                  <div className={`w-20 h-20 bg-${item.color}-100 rounded-full flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300`}>
                    <i className={`${item.icon} text-3xl text-${item.color}-600`}></i>
                  </div>
                  <h3 className="text-2xl font-bold mb-4 text-gray-800">{item.title}</h3>
                  {item.content.map((text, i) => (
                    <p key={i} className="text-gray-600 text-lg">{text}</p>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Wishes and News with sky blue theme */}
      <section className="py-20 bg-gradient-to-br from-cyan-50 to-cyan-100/30">
        <div className="container mx-auto px-4">
          <div className="grid lg:grid-cols-2 gap-16">
            {/* Wishes */}
            <div className={`transform transition-all duration-1000 ${isVisible ? 'translate-x-0 opacity-100' : '-translate-x-10 opacity-0'}`}>
              <div className="text-center mb-12">
                <h2 className="text-4xl font-bold bg-gradient-to-r from-cyan-600 to-cyan-700 bg-clip-text text-transparent mb-6">
                  Lời chúc mừng
                </h2>
                <p className="text-xl text-gray-600">Những lời chúc tốt đẹp gửi đến Đại hội</p>
              </div>
              <div className="space-y-8 mb-12">
                {wishes.map((wish, index) => (
                  <div 
                    key={index}
                    className={`group bg-white rounded-2xl shadow-lg border border-gray-100 p-8 hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-1 ${
                      wish.featured ? 'ring-2 ring-cyan-500 bg-gradient-to-br from-cyan-50/50 to-white' : ''
                    }`}
                  >
                    <div className="text-center">
                      <div className={`w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6 ${wish.iconBg} group-hover:scale-110 transition-transform duration-300`}>
                        <i className={`${wish.icon} ${wish.iconColor} text-2xl`}></i>
                      </div>
                      <h3 className="font-bold text-xl text-gray-800 mb-2">{wish.name}</h3>
                      {wish.role === "Đại biểu" && (
                        <span className="bg-gradient-to-r from-cyan-500 to-cyan-600 text-white text-sm px-4 py-2 rounded-full mb-4 inline-block">
                          {wish.role}
                        </span>
                      )}
                      {wish.department && (
                        <p className="text-gray-600 mb-4 font-medium">{wish.department}</p>
                      )}
                      {!wish.department && wish.role !== "Đại biểu" && (
                        <p className="text-gray-600 mb-4">{wish.role}</p>
                      )}
                      <p className="text-gray-700 leading-relaxed mb-4 text-lg italic">"{wish.message}"</p>
                      <div className="text-sm text-gray-500 flex items-center justify-center">
                        <i className="ri-time-line mr-2"></i>
                        {wish.time}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              <div className="text-center">
                <div className="flex justify-center space-x-3 mb-8">
                  <div className="w-3 h-3 rounded-full bg-cyan-600 animate-pulse"></div>
                  <div className="w-3 h-3 rounded-full bg-gray-300"></div>
                  <div className="w-3 h-3 rounded-full bg-gray-300"></div>
                </div>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <Link to="/wishes">
                  
                  <button className="group bg-gray-100 hover:bg-gray-200 text-gray-800 px-6 py-3 text-lg font-medium rounded-xl transition-all duration-300 whitespace-nowrap cursor-pointer shadow-lg hover:shadow-xl transform hover:-translate-y-1">
                    <i className="ri-eye-line mr-2 group-hover:scale-110 transition-transform"></i>
                    Xem tất cả lời chúc
                  </button>
                </Link>
                <Link to="/wishes/new">
                  <button className="group bg-gradient-to-r from-cyan-500 to-cyan-600 hover:from-cyan-600 hover:to-cyan-700 text-white px-6 py-3 text-lg font-medium rounded-xl transition-all duration-300 whitespace-nowrap cursor-pointer shadow-lg hover:shadow-xl transform hover:-translate-y-1">
                    <i className="ri-add-line mr-2 group-hover:scale-110 transition-transform"></i>
                    Gửi lời chúc mừng
                  </button>
                </Link>
                </div>
              </div>
            </div>

            {/* News */}
            <div className={`transform transition-all duration-1000 delay-300 ${isVisible ? 'translate-x-0 opacity-100' : 'translate-x-10 opacity-0'}`}>
              <div className="text-center mb-12">
                <h2 className="text-4xl font-bold bg-gradient-to-r from-cyan-600 to-cyan-700 bg-clip-text text-transparent mb-6">
                  Tin nổi bật Đại hội
                </h2>
                <p className="text-xl text-gray-600">Những thông tin quan trọng và cập nhật mới nhất</p>
              </div>
              <div className="space-y-8">
                <div className="group bg-white rounded-2xl shadow-lg border border-gray-100 p-8 hover:shadow-2xl transition-all duration-500 ring-2 ring-cyan-500 bg-gradient-to-br from-cyan-50/50 to-white transform hover:-translate-y-1">
                  <div className="space-y-6">
                    <div className="relative overflow-hidden rounded-xl">
                      <img 
                        alt="Đã bầu ra 23 đồng chí vào Ban chấp hành"
                        className="w-full h-64 object-cover object-top group-hover:scale-105 transition-transform duration-500"
                        src="https://readdy.ai/api/search-image?query=Vietnamese%20university%20student%20election%20results%20with%2023%20newly%20elected%20executive%20committee%20members%20in%20formal%20group%20photo%2C%20professional%20academic%20setting%2C%20congratulatory%20atmosphere%20with%20flowers%20and%20official%20banners%2C%20bright%20lighting%2C%20clean%20background&width=800&height=500&seq=info1&orientation=landscape"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-cyan-600/20 to-transparent"></div>
                    </div>
                    <div>
                      <div className="flex items-center space-x-4 mb-4">
                        <h3 className="text-2xl font-bold text-gray-800 flex-1">Đã bầu ra 23 đồng chí vào Ban chấp hành</h3>
                        <span className="bg-gradient-to-r from-cyan-500 to-cyan-600 text-white text-sm px-4 py-2 rounded-full whitespace-nowrap">
                          Nổi bật
                        </span>
                      </div>
                      <p className="text-gray-700 mb-6 leading-relaxed text-lg">
                        Đại hội đã tiến hành bầu cử thành công và bầu ra 23 đồng chí vào Ban chấp hành Hội sinh viên nhiệm kỳ 2025-2028. 
                        Các đồng chí được bầu đều là những sinh viên xuất sắc, có uy tín cao và nhiệt huyết với công tác Hội.
                      </p>
                      <div className="text-gray-500 flex items-center">
                        <i className="ri-time-line mr-2"></i>
                        11:00 21-12
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div className="text-center mt-12">
                <button className="group bg-gray-100 hover:bg-gray-200 text-gray-800 px-6 py-3 text-lg font-medium rounded-xl transition-all duration-300 whitespace-nowrap cursor-pointer shadow-lg hover:shadow-xl transform hover:-translate-y-1">
                  <i className="ri-calendar-event-line mr-2 group-hover:scale-110 transition-transform"></i>
                  Xem diễn biến Đại hội
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Achievements with sky blue theme */}
      <section className="py-20 bg-white relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-cyan-50/30 to-cyan-100/20"></div>
        <div className="container mx-auto px-4 relative">
          <div className={`text-center mb-16 transform transition-all duration-1000 ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`}>
            <h2 className="text-4xl font-bold bg-gradient-to-r from-cyan-600 to-cyan-700 bg-clip-text text-transparent mb-6">
              Thành tích nhiệm kỳ 2022-2024
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">Những kết quả đáng tự hào trong nhiệm kỳ vừa qua</p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 mb-16">
            {stats.map((stat, index) => (
              <div 
                key={index} 
                className={`text-center group transform transition-all duration-1000 ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`}
                style={{ transitionDelay: `${800 + index * 200}ms` }}
              >
                <div className={`text-5xl md:text-6xl font-bold ${stat.color} mb-4 group-hover:scale-110 transition-transform duration-300`}>
                  {stat.number}
                </div>
                <p className="text-gray-600 text-lg font-medium">{stat.label}</p>
              </div>
            ))}
          </div>
          <div className="grid md:grid-cols-2 gap-12">
            {[
              {
                icon: "ri-star-line",
                title: "Hoạt động nổi bật",
                color: "yellow",
                items: [
                  "Ngày hội Khoa học kỹ thuật sinh viên toàn quốc",
                  "Chương trình tình nguyện \"Mùa hè xanh\"",
                  "Cuộc thi \"Sinh viên với ý tưởng khởi nghiệp\"",
                  "Hội thao sinh viên các trường đại học"
                ]
              },
              {
                icon: "ri-award-line",
                title: "Thành tích đạt được",
                color: "cyan",
                items: [
                  "Hội sinh viên xuất sắc cấp quốc gia",
                  "Top 3 hoạt động tình nguyện TP.HCM",
                  "Giải nhất cuộc thi khởi nghiệp sinh viên",
                  "95% sinh viên hài lòng với hoạt động Hội"
                ]
              }
            ].map((section, index) => (
              <div 
                key={index}
                className={`group bg-white rounded-2xl shadow-lg border border-gray-100 p-8 hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2 ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`}
                style={{ transitionDelay: `${1200 + index * 200}ms` }}
              >
                <h3 className="text-2xl font-bold mb-6 flex items-center">
                  <i className={`${section.icon} text-${section.color}-500 mr-3 text-3xl group-hover:scale-110 transition-transform duration-300`}></i>
                  {section.title}
                </h3>
                <ul className="space-y-3 text-gray-600">
                  {section.items.map((item, i) => (
                    <li key={i} className="flex items-start text-lg">
                      <i className="ri-check-line text-green-500 mr-3 mt-1 flex-shrink-0"></i>
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Activities with sky blue theme */}
      <section className="py-20 bg-gradient-to-br from-cyan-50 to-cyan-100/30">
        <div className="container mx-auto px-4">
          <div className={`text-center mb-16 transform transition-all duration-1000 ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`}>
            <h2 className="text-4xl font-bold bg-gradient-to-r from-cyan-600 to-cyan-700 bg-clip-text text-transparent mb-6">
              Hoạt động chính
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">Các lĩnh vực hoạt động trọng tâm của Hội sinh viên</p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-10">
            {activities.map((activity, index) => (
              <div 
                key={index} 
                className={`group bg-white rounded-2xl shadow-lg border border-gray-100 p-8 hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2 ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`}
                style={{ transitionDelay: `${1000 + index * 200}ms` }}
              >
                <div className="text-center">
                  <div className="relative overflow-hidden rounded-xl mb-6">
                    <img 
                      alt={activity.title}
                      className="w-full h-56 object-cover object-top group-hover:scale-105 transition-transform duration-500"
                      src={activity.image}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-cyan-600/20 to-transparent"></div>
                  </div>
                  <h3 className="text-2xl font-bold mb-4 text-gray-800">{activity.title}</h3>
                  <p className="text-gray-600 text-lg leading-relaxed">{activity.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA with sky blue theme */}
      <section className="py-20 bg-gradient-to-r from-cyan-350 via-cyan-500 to-cyan-350 text-white relative overflow-hidden">
        <img
          src="Trongdong.png"
          alt=""
          aria-hidden
          className="absolute inset-0 w-full h-full object-cover opacity-15
                    pointer-events-none select-none mix-blend-soft-light"
          />
        <div className="absolute inset-0 bg-gradient-to-r from-white/10 to-cyan-800/10"></div>
        <div className="container mx-auto px-4 text-center relative">
          <div className={`transform transition-all duration-1000 ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`}>
            <h2 className="text-4xl md:text-5xl font-bold mb-6 bg-gradient-to-r from-white to-cyan-100 bg-clip-text text-transparent">Tham gia cùng chúng tôi</h2>
            <p className="text-xl md:text-2xl mb-12 max-w-3xl mx-auto leading-relaxed text-cyan-100">
              Hãy cùng nhau xây dựng một Hội sinh viên mạnh mẽ và phát triển bền vững
            </p>
            <div className="flex flex-col sm:flex-row gap-6 justify-center">
              <Link to="/login">
                <button className="group bg-white text-cyan-700 hover:bg-cyan-50 px-8 py-4 text-xl font-medium rounded-xl transition-all duration-300 whitespace-nowrap cursor-pointer shadow-lg hover:shadow-xl transform hover:-translate-y-1">
                  <i className="ri-login-box-line mr-2 group-hover:scale-110 transition-transform"></i>
                  Đăng nhập ngay
                </button>
              </Link>
              <Link to="/wishes">
                <button className="group bg-cyan-400/80 hover:bg-cyan-400 text-white border-2 border-cyan-300/50 hover:border-cyan-300 px-8 py-4 text-xl font-medium rounded-xl transition-all duration-300 whitespace-nowrap cursor-pointer shadow-lg hover:shadow-xl transform hover:-translate-y-1">
                  <i className="ri-heart-line mr-2 group-hover:scale-110 transition-transform"></i>
                  Gửi lời chúc mừng
                </button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Footer with sky blue theme */}
      <footer className="bg-gradient-to-r from-cyan-700 to-cyan-800 text-white py-12">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-3 gap-12">
            <div>
              <h3 className="text-2xl font-bold mb-6 text-cyan-200">Liên hệ</h3>
              <div className="space-y-4 text-gray-300">
                <p className="flex items-start">
                  <i className="ri-map-pin-line mr-3 mt-1 text-cyan-300"></i>
                  227 Nguyễn Văn Cừ, Phường 4, Quận 5, TP.HCM
                </p>
                <p className="flex items-center">
                  <i className="ri-phone-line mr-3 text-cyan-300"></i>
                  (028) 3835 1002
                </p>
                <p className="flex items-center">
                  <i className="ri-mail-line mr-3 text-cyan-300"></i>
                  hoisinhvien@hcmus.edu.vn
                </p>
              </div>
            </div>
            <div>
              <h3 className="text-2xl font-bold mb-6 text-cyan-200">Liên kết</h3>
              <ul className="space-y-3 text-gray-300">
                <li><a href="#" className="hover:text-cyan-200 cursor-pointer transition-colors duration-200">Trang chủ trường</a></li>
                <li><a href="#" className="hover:text-cyan-200 cursor-pointer transition-colors duration-200">Cổng thông tin sinh viên</a></li>
                <li><a href="#" className="hover:text-cyan-200 cursor-pointer transition-colors duration-200">Thư viện</a></li>
                <li><a href="#" className="hover:text-cyan-200 cursor-pointer transition-colors duration-200">E-learning</a></li>
              </ul>
            </div>
            <div>
              <h3 className="text-2xl font-bold mb-6 text-cyan-200">Theo dõi</h3>
              <div className="flex space-x-6">
                <a href="#" className="text-gray-300 hover:text-cyan-200 cursor-pointer transition-all duration-200 transform hover:scale-110">
                  <i className="ri-facebook-fill text-3xl"></i>
                </a>
                <a href="#" className="text-gray-300 hover:text-cyan-200 cursor-pointer transition-all duration-200 transform hover:scale-110">
                  <i className="ri-youtube-fill text-3xl"></i>
                </a>
                <a href="#" className="text-gray-300 hover:text-cyan-200 cursor-pointer transition-all duration-200 transform hover:scale-110">
                  <i className="ri-instagram-line text-3xl"></i>
                </a>
              </div>
            </div>
          </div>
          <div className="border-t border-cyan-600 mt-12 pt-8 text-center text-gray-300">
            <p className="text-lg">
              © 2024 Hội sinh viên trường Đại học Khoa học tự nhiên, ĐHQG-HCM.
              <a href="https://readdy.ai/?origin=logo" className="ml-2 hover:text-cyan-200 cursor-pointer transition-colors duration-200">
                Powered by Readdy
              </a>
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Home;
