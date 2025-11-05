
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Card } from '../../components/base/Card';
import { Button } from '../../components/base/Button';
import { mockWishes } from '../../mocks/delegates';
import { mockCongressInfo } from '../../mocks/congress';

const HomePage: React.FC = () => {
  const [currentWishIndex, setCurrentWishIndex] = useState(0);
  const [displayedWishes, setDisplayedWishes] = useState(mockWishes.slice(0, 3));

  // Rotate wishes every 5 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentWishIndex((prev) => (prev + 1) % mockWishes.length);
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  // Update displayed wishes based on priority
  useEffect(() => {
    const prioritizedWishes = [...mockWishes].sort((a, b) => {
      // Delegates first, then by creation time
      if (a.isDelegate && !b.isDelegate) return -1;
      if (!a.isDelegate && b.isDelegate) return 1;
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });
    setDisplayedWishes(prioritizedWishes.slice(0, 3));
  }, []);

  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return '';
      return date.toLocaleDateString('vi-VN', {
        day: '2-digit',
        month: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch {
      return '';
    }
  };

  // Get highlighted congress info
  const highlightedInfo = mockCongressInfo.filter((info) => info.isHighlight);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Header */}
      <header className="bg-blue-600 text-white">
        <div className="container mx-auto px-4 py-6">
          <div className="text-center">
            <h1
              className="text-3xl md:text-4xl font-bold mb-2"
              style={{ fontFamily: 'Pacifico, serif' }}
            >
              Đại hội Hội sinh viên
            </h1>
            <p className="text-xl">Trường Đại học Khoa học tự nhiên, ĐHQG-HCM</p>
            <p className="text-lg mt-2">Nhiệm kỳ 2024-2026</p>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section
        className="relative py-20 bg-cover bg-center"
        style={{
          backgroundImage: `linear-gradient(rgba(0,0,0,0.4), rgba(0,0,0,0.4)), url('https://readdy.ai/api/search-image?query=University%20students%20congress%20meeting%20hall%20with%20Vietnamese%20flag%2C%20modern%20conference%20room%20with%20young%20delegates%20sitting%20in%20rows%2C%20professional%20academic%20atmosphere%2C%20bright%20lighting%2C%20wide%20angle%20view%20showing%20organized%20seating%20arrangement&width=1200&height=600&seq=hero1&orientation=landscape')`,
        }}
      >
        <div className="container mx-auto px-4 text-center text-white">
          <h2 className="text-4xl md:text-5xl font-bold mb-6">
            Đoàn kết - Sáng tạo - Phát triển
          </h2>
          <p className="text-xl md:text-2xl mb-8 max-w-3xl mx-auto">
            Cùng nhau xây dựng một Hội sinh viên mạnh mẽ, năng động và đầy sáng tạo
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/login">
              <Button size="lg" className="bg-white text-blue-600 hover:bg-gray-100">
                <i className="ri-login-box-line mr-2"></i>
                Đăng nhập hệ thống
              </Button>
            </Link>
            <Link to="/wishes">
              <Button size="lg" variant="secondary" className="bg-blue-500/80 hover:bg-blue-500">
                <i className="ri-heart-line mr-2"></i>
                Gửi lời chúc
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Congress Info */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-800 mb-4">Thông tin Đại hội</h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Đại hội Hội sinh viên lần thứ X nhiệm kỳ 2024-2026 với chủ đề "Đoàn kết - Sáng tạo - Phát triển"
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            <Card>
              <div className="text-center">
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <i className="ri-calendar-event-line text-2xl text-blue-600"></i>
                </div>
                <h3 className="text-xl font-semibold mb-2">Thời gian</h3>
                <p className="text-gray-600">20-21 tháng 12, 2024</p>
                <p className="text-gray-600">Hội trường A, ĐHQG-HCM</p>
              </div>
            </Card>

            <Card>
              <div className="text-center">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <i className="ri-team-line text-2xl text-green-600"></i>
                </div>
                <h3 className="text-xl font-semibold mb-2">Đại biểu</h3>
                <p className="text-gray-600">150 đại biểu</p>
                <p className="text-gray-600">Từ 15 khoa/viện</p>
              </div>
            </Card>

            <Card>
              <div className="text-center">
                <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <i className="ri-trophy-line text-2xl text-purple-600"></i>
                </div>
                <h3 className="text-xl font-semibold mb-2">Mục tiêu</h3>
                <p className="text-gray-600">Định hướng phát triển</p>
                <p className="text-gray-600">Nhiệm kỳ 2024-2026</p>
              </div>
            </Card>
          </div>
        </div>
      </section>

      {/* Wishes and Congress Highlights Section */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="grid lg:grid-cols-2 gap-12">
            {/* Wishes Section */}
            <div>
              <div className="text-center mb-8">
                <h2 className="text-3xl font-bold text-gray-800 mb-4">Lời chúc mừng</h2>
                <p className="text-lg text-gray-600">Những lời chúc tốt đẹp gửi đến Đại hội</p>
              </div>

              <div className="space-y-6 mb-8">
                {displayedWishes.map((wish, index) => (
                  <Card
                    key={wish.id}
                    className={`hover:shadow-lg transition-all duration-300 ${
                      index === currentWishIndex % 3 ? 'ring-2 ring-blue-500 transform scale-105' : ''
                    }`}
                  >
                    <div className="text-center">
                      <div
                        className={`w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4 ${
                          wish.isDelegate ? 'bg-blue-100' : 'bg-green-100'
                        }`}
                      >
                        <i
                          className={`${
                            wish.isDelegate ? 'ri-vip-crown-line text-blue-600' : 'ri-user-line text-green-600'
                          } text-xl`}
                        ></i>
                      </div>
                      <h3 className="font-semibold text-gray-800 mb-1">{wish.senderName}</h3>
                      {wish.isDelegate && (
                        <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full mb-2 inline-block">
                          Đại biểu
                        </span>
                      )}
                      {wish.senderPosition && (
                        <p className="text-sm text-gray-600 mb-3">{wish.senderPosition}</p>
                      )}
                      <p className="text-gray-700 text-sm leading-relaxed mb-3 line-clamp-3">
                        &quot;{wish.content}&quot;
                      </p>
                      <div className="text-xs text-gray-500">
                        <i className="ri-time-line mr-1"></i>
                        {formatDate(wish.createdAt)}
                      </div>
                    </div>
                  </Card>
                ))}
              </div>

              <div className="text-center">
                <div className="flex justify-center space-x-2 mb-6">
                  {[0, 1, 2].map((idx) => (
                    <div
                      key={idx}
                      className={`w-2 h-2 rounded-full transition-colors ${
                        idx === currentWishIndex % 3 ? 'bg-blue-600' : 'bg-gray-300'
                      }`}
                    />
                  ))}
                </div>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <Link to="/wishes">
                    <Button variant="secondary">
                      <i className="ri-eye-line mr-2"></i>
                      Xem tất cả lời chúc
                    </Button>
                  </Link>
                  <Link to="/wishes">
                    <Button>
                      <i className="ri-add-line mr-2"></i>
                      Gửi lời chúc mừng
                    </Button>
                  </Link>
                </div>
              </div>
            </div>

            {/* Congress Highlights Section */}
            <div>
              {highlightedInfo.length > 0 && (
                <>
                  <div className="text-center mb-8">
                    <h2 className="text-3xl font-bold text-gray-800 mb-4">Tin nổi bật Đại hội</h2>
                    <p className="text-lg text-gray-600">
                      Những thông tin quan trọng và cập nhật mới nhất
                    </p>
                  </div>

                  <div className="space-y-6">
                    {highlightedInfo.map((info) => (
                      <Card
                        key={info.id}
                        className="hover:shadow-lg transition-shadow ring-2 ring-blue-500 bg-blue-50/30"
                      >
                        <div className="space-y-4">
                          {/* Image */}
                          {info.imageUrl && (
                            <div>
                              <img
                                src={info.imageUrl}
                                alt={info.title}
                                className="w-full h-48 object-cover rounded-lg"
                              />
                            </div>
                          )}

                          {/* Content */}
                          <div>
                            <div className="flex items-center space-x-3 mb-3">
                              <h3 className="text-xl font-bold text-gray-800">{info.title}</h3>
                              <span className="bg-blue-100 text-blue-800 text-sm px-3 py-1 rounded-full">
                                Nổi bật
                              </span>
                            </div>
                            <p className="text-gray-700 mb-4 leading-relaxed">{info.content}</p>
                            <div className="text-sm text-gray-500">
                              <i className="ri-time-line mr-1"></i>
                              {formatDate(info.createdAt)}
                            </div>
                          </div>
                        </div>
                      </Card>
                    ))}
                  </div>

                  <div className="text-center mt-8">
                    <Link to="/congress-updates">
                      <Button variant="secondary">
                        <i className="ri-calendar-event-line mr-2"></i>
                        Xem diễn biến Đại hội
                      </Button>
                    </Link>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Achievements Section */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-800 mb-4">
              Thành tích nhiệm kỳ 2022-2024
            </h2>
            <p className="text-lg text-gray-600">
              Những kết quả đáng tự hào trong nhiệm kỳ vừa qua
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="text-center">
              <div className="text-4xl font-bold text-blue-600 mb-2">50+</div>
              <p className="text-gray-600">Hoạt động tổ chức</p>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-green-600 mb-2">15,000+</div>
              <p className="text-gray-600">Sinh viên tham gia</p>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-purple-600 mb-2">25</div>
              <p className="text-gray-600">Giải thưởng đạt được</p>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-orange-600 mb-2">100%</div>
              <p className="text-gray-600">Khoa tham gia</p>
            </div>
          </div>

          <div className="mt-12 grid md:grid-cols-2 gap-8">
            <Card>
              <h3 className="text-xl font-semibold mb-4 flex items-center">
                <i className="ri-star-line text-yellow-500 mr-2"></i>
                Hoạt động nổi bật
              </h3>
              <ul className="space-y-2 text-gray-600">
                <li>• Ngày hội Khoa học kỹ thuật sinh viên toàn quốc</li>
                <li>• Chương trình tình nguyện "Mùa hè xanh"</li>
                <li>• Cuộc thi "Sinh viên với ý tưởng khởi nghiệp"</li>
                <li>• Hội thao sinh viên các trường đại học</li>
              </ul>
            </Card>

            <Card>
              <h3 className="text-xl font-semibold mb-4 flex items-center">
                <i className="ri-award-line text-blue-500 mr-2"></i>
                Thành tích đạt được
              </h3>
              <ul className="space-y-2 text-gray-600">
                <li>• Hội sinh viên xuất sắc cấp quốc gia</li>
                <li>• Top 3 hoạt động tình nguyện TP.HCM</li>
                <li>• Giải nhất cuộc thi khởi nghiệp sinh viên</li>
                <li>• 95% sinh viên hài lòng với hoạt động Hội</li>
              </ul>
            </Card>
          </div>
        </div>
      </section>

      {/* Activities Overview */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-800 mb-4">Hoạt động chính</h2>
            <p className="text-lg text-gray-600">
              Các lĩnh vực hoạt động trọng tâm của Hội sinh viên
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            <Card className="hover:shadow-lg transition-shadow">
              <div className="text-center">
                <img
                  src="https://readdy.ai/api/search-image?query=Vietnamese%20university%20students%20participating%20in%20academic%20research%20competition%2C%20laboratory%20setting%20with%20modern%20equipment%2C%20students%20wearing%20lab%20coats%20working%20on%20scientific%20experiments%2C%20bright%20professional%20lighting&width=400&height=250&seq=activity1&orientation=landscape"
                  alt="Hoạt động học thuật"
                  className="w-full h-48 object-cover rounded-lg mb-4"
                />
                <h3 className="text-xl font-semibold mb-2">Học thuật - Nghiên cứu</h3>
                <p className="text-gray-600">
                  Hỗ trợ sinh viên trong học tập, nghiên cứu khoa học và phát triển năng lực
                  chuyên môn
                </p>
              </div>
            </Card>

            <Card className="hover:shadow-lg transition-shadow">
              <div className="text-center">
                <img
                  src="https://readdy.ai/api/search-image?query=Vietnamese%20university%20students%20volunteering%20in%20community%20service%2C%20helping%20elderly%20people%20and%20children%2C%20outdoor%20community%20center%20setting%2C%20warm%20friendly%20atmosphere%20with%20smiling%20faces&width=400&height=250&seq=activity2&orientation=landscape"
                  alt="Hoạt động tình nguyện"
                  className="w-full h-48 object-cover rounded-lg mb-4"
                />
                <h3 className="text-xl font-semibold mb-2">Tình nguyện - Cộng đồng</h3>
                <p className="text-gray-600">
                  Tổ chức các hoạt động tình nguyện, đóng góp cho cộng đồng và xã hội
                </p>
              </div>
            </Card>

            <Card className="hover:shadow-lg transition-shadow">
              <div className="text-center">
                <img
                  src="https://readdy.ai/api/search-image?query=Vietnamese%20university%20students%20performing%20cultural%20activities%20on%20stage%2C%20traditional%20and%20modern%20dance%20performances%2C%20colorful%20costumes%2C%20university%20auditorium%20with%20audience%20applauding&width=400&height=250&seq=activity3&orientation=landscape"
                  alt="Hoạt động văn hóa"
                  className="w-full h-48 object-cover rounded-lg mb-4"
                />
                <h3 className="text-xl font-semibold mb-2">Văn hóa - Thể thao</h3>
                <p className="text-gray-600">
                  Phát triển tài năng văn hóa, thể thao và các hoạt động giải trí lành mạnh
                </p>
              </div>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-blue-600 text-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-4">Tham gia cùng chúng tôi</h2>
          <p className="text-xl mb-8 max-w-2xl mx-auto">
            Hãy cùng nhau xây dựng một Hội sinh viên mạnh mẽ và phát triển bền vững
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/login">
              <Button size="lg" className="bg-white text-blue-600 hover:bg-gray-100">
                Đăng nhập ngay
              </Button>
            </Link>
            <Link to="/wishes">
              <Button size="lg" variant="secondary" className="bg-blue-500/80 hover:bg-blue-500">
                Gửi lời chúc mừng
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-800 text-white py-8">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-3 gap-8">
            <div>
              <h3 className="text-lg font-semibold mb-4">Liên hệ</h3>
              <p className="text-gray-300 mb-2">
                <i className="ri-map-pin-line mr-2"></i>
                227 Nguyễn Văn Cừ, Phường 4, Quận 5, TP.HCM
              </p>
              <p className="text-gray-300 mb-2">
                <i className="ri-phone-line mr-2"></i>
                (028) 3835 1002
              </p>
              <p className="text-gray-300">
                <i className="ri-mail-line mr-2"></i>
                hoisinhvien@hcmus.edu.vn
              </p>
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-4">Liên kết</h3>
              <ul className="space-y-2 text-gray-300">
                <li>
                  <a href="#" className="hover:text-white">
                    Trang chủ trường
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white">
                    Cổng thông tin sinh viên
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white">
                    Thư viện
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white">
                    E-learning
                  </a>
                </li>
              </ul>
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-4">Theo dõi</h3>
              <div className="flex space-x-4">
                <a href="#" className="text-gray-300 hover:text-white">
                  <i className="ri-facebook-fill text-2xl"></i>
                </a>
                <a href="#" className="text-gray-300 hover:text-white">
                  <i className="ri-youtube-fill text-2xl"></i>
                </a>
                <a href="#" className="text-gray-300 hover:text-white">
                  <i className="ri-instagram-line text-2xl"></i>
                </a>
              </div>
            </div>
          </div>
          <div className="border-t border-gray-700 mt-8 pt-8 text-center text-gray-300">
            <p>
              &copy; 2024 Hội sinh viên trường Đại học Khoa học tự nhiên, ĐHQG-HCM.
              <a
                href="https://readdy.ai/?origin=logo"
                className="ml-2 hover:text-white"
              >
                Powered by Readdy
              </a>
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default HomePage;
