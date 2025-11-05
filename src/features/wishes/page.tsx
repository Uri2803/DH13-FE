
import React, { useState } from 'react';
import { Navigation } from '../../components/feature/Navigation';
import { Card } from '../../components/base/Card';
import { Button } from '../../components/base/Button';
import { useAuth } from '../../hooks/useAuth';
import { mockWishes } from '../../mocks/delegates';

const WishesPage: React.FC = () => {
  const { user } = useAuth();
  const [wishes] = useState(mockWishes);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    senderName: user?.fullName || '',
    senderPosition: user?.role === 'delegate' ? `Đại biểu ${user.delegateCode}` : '',
    content: ''
  });
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    // Simulate API call
    setTimeout(() => {
      setFormData({
        senderName: user?.fullName || '',
        senderPosition: user?.role === 'delegate' ? `Đại biểu ${user.delegateCode}` : '',
        content: ''
      });
      setShowForm(false);
      setSubmitting(false);
      
      // Show success message
      alert('Lời chúc của bạn đã được gửi thành công!');
    }, 1000);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString('vi-VN');
  };

  // Get featured wishes (delegates first, then recent ones)
  const featuredWishes = [...wishes]
    .sort((a, b) => {
      if (a.isDelegate && !b.isDelegate) return -1;
      if (!a.isDelegate && b.isDelegate) return 1;
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    })
    .slice(0, 6); // Show only 6 featured wishes

  return (
    <div className="min-h-screen bg-gray-50">
      {user && <Navigation />}
      
      <div className="container mx-auto px-4 py-8">
        {/* Header Section */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-800 mb-4">Gửi lời chúc mừng</h1>
          <p className="text-xl text-gray-600 mb-8">
            Hãy gửi những lời chúc tốt đẹp nhất đến Đại hội Hội sinh viên
          </p>
          <Button 
            onClick={() => setShowForm(true)} 
            size="lg"
            className="bg-blue-600 hover:bg-blue-700"
          >
            <i className="ri-heart-add-line mr-2"></i>
            Gửi lời chúc mừng
          </Button>
        </div>

        {/* Wish Form Modal */}
        {showForm && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
            <Card className="w-full max-w-md">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold">Gửi lời chúc mừng</h2>
                <button
                  onClick={() => setShowForm(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <i className="ri-close-line text-xl"></i>
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Họ và tên *
                  </label>
                  <input
                    type="text"
                    value={formData.senderName}
                    onChange={(e) => setFormData({...formData, senderName: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Nhập họ và tên"
                    required
                    disabled={user?.role === 'delegate'}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Chức vụ / Đơn vị
                  </label>
                  <input
                    type="text"
                    value={formData.senderPosition}
                    onChange={(e) => setFormData({...formData, senderPosition: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Nhập chức vụ hoặc đơn vị"
                    disabled={user?.role === 'delegate'}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Nội dung lời chúc *
                  </label>
                  <textarea
                    value={formData.content}
                    onChange={(e) => setFormData({...formData, content: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    rows={4}
                    placeholder="Nhập lời chúc của bạn..."
                    maxLength={500}
                    required
                  />
                  <div className="text-xs text-gray-500 mt-1">
                    {formData.content.length}/500 ký tự
                  </div>
                </div>

                <div className="flex space-x-3">
                  <Button
                    type="button"
                    variant="secondary"
                    onClick={() => setShowForm(false)}
                    className="flex-1"
                  >
                    Hủy
                  </Button>
                  <Button
                    type="submit"
                    disabled={submitting}
                    className="flex-1"
                  >
                    {submitting ? (
                      <>
                        <i className="ri-loader-4-line animate-spin mr-2"></i>
                        Đang gửi...
                      </>
                    ) : (
                      'Gửi lời chúc'
                    )}
                  </Button>
                </div>
              </form>
            </Card>
          </div>
        )}

        {/* Featured Wishes Section */}
        <div className="mb-12">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-gray-800 mb-4">Lời chúc nổi bật</h2>
            <p className="text-lg text-gray-600">
              Những lời chúc ý nghĩa từ đại biểu và sinh viên
            </p>
          </div>

          {featuredWishes.length > 0 ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {featuredWishes.map((wish) => (
                <Card key={wish.id} className="hover:shadow-lg transition-all duration-300 h-full">
                  <div className="text-center h-full flex flex-col">
                    <div className={`w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4 ${
                      wish.isDelegate ? 'bg-blue-100' : 'bg-green-100'
                    }`}>
                      <i className={`${
                        wish.isDelegate ? 'ri-vip-crown-line text-blue-600' : 'ri-user-line text-green-600'
                      } text-xl`}></i>
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
                    
                    <div className="flex-1 flex items-center">
                      <p className="text-gray-700 text-sm leading-relaxed italic">
                        &quot;{wish.content}&quot;
                      </p>
                    </div>
                    
                    <div className="text-xs text-gray-500 mt-4 pt-4 border-t border-gray-100">
                      <i className="ri-time-line mr-1"></i>
                      {formatDate(wish.createdAt)}
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          ) : (
            <Card className="text-center py-16">
              <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <i className="ri-heart-line text-3xl text-gray-400"></i>
              </div>
              <h3 className="text-xl font-medium text-gray-600 mb-3">Chưa có lời chúc nào</h3>
              <p className="text-gray-500 mb-6 max-w-md mx-auto">
                Hãy là người đầu tiên gửi lời chúc mừng đến Đại hội Hội sinh viên!
              </p>
              <Button onClick={() => setShowForm(true)} size="lg">
                <i className="ri-heart-add-line mr-2"></i>
                Gửi lời chúc đầu tiên
              </Button>
            </Card>
          )}
        </div>

        {/* Call to Action */}
        <div className="text-center bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl p-8">
          <h3 className="text-2xl font-bold text-gray-800 mb-4">
            Cùng nhau gửi lời chúc tốt đẹp
          </h3>
          <p className="text-gray-600 mb-6 max-w-2xl mx-auto">
            Mỗi lời chúc của bạn đều là nguồn động viên quý báu cho Đại hội. 
            Hãy chia sẻ những mong ước tốt đẹp nhất!
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button onClick={() => setShowForm(true)} size="lg">
              <i className="ri-heart-add-line mr-2"></i>
              Gửi lời chúc ngay
            </Button>
            <Button variant="secondary" size="lg">
              <i className="ri-share-line mr-2"></i>
              Chia sẻ trang này
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WishesPage;
