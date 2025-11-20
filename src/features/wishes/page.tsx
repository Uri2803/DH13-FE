// src/pages/wishes/WishesPage.tsx
import React, { useEffect, useState } from 'react';
import { Navigation } from '../../components/feature/Navigation';
import { Card } from '../../components/base/Card';
import { Button } from '../../components/base/Button';
import { useAuth } from '../../hooks/useAuth';
import {
  fetchWishes,
  createWish,
  Wish,
} from '../../services/wishes';

const WishesPage: React.FC = () => {
  const { user } = useAuth();

  const isLoggedIn = !!user;
  const isDelegate = user?.role === 'delegate';

  // [XỬ LÝ DỮ LIỆU USER AN TOÀN]
  const u: any = user || {};
  const displayName: string = u.fullName || u.name || '';
  const displayCode: string = u.delegateCode || u.code || '';
  const displayDept: string = u.department?.name || '';
  const displayPosition: string = u.delegateInfo?.position || '';
  
  // Lấy avatar
  const userAvatar: string | undefined = u.ava || u.avatar || u.profilePicture || undefined;

  const buildInitialFormData = () => {
    if (!user) {
      return {
        senderName: '',
        senderPosition: '',
        content: '',
      };
    }
    
    const position = isDelegate
      ? `Đại biểu ${displayDept ? ` - ${displayPosition} - ${displayDept} ` : ''}`
      : displayDept || '';

    return {
      senderName: displayName,
      senderPosition: position,
      content: '',
    };
  };

  const [wishes, setWishes] = useState<Wish[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const [showForm, setShowForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const [formData, setFormData] = useState(buildInitialFormData);

  // Load wishes từ API
  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        setError(null);
        // Gọi API lấy bài đã duyệt
        const data = await fetchWishes({ onlyVerified: true });
        
        if (Array.isArray(data)) {
            // Lọc kỹ 2 lớp: 
            // 1. Bỏ null/undefined
            // 2. Chỉ lấy isVerified === true (Client-side filter để chắc chắn)
            const safeData = data.filter(Boolean).filter((w) => w.isVerified);
            
            // Sắp xếp: Đại biểu lên đầu, sau đó đến mới nhất
            const sortedData = safeData.sort((a, b) => {
                if (a.isDelegate && !b.isDelegate) return -1;
                if (!a.isDelegate && b.isDelegate) return 1;
                return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
            });

            setWishes(sortedData);
        } else {
            setWishes([]);
        }
      } catch (e) {
        console.error(e);
        setWishes([]);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  useEffect(() => {
    setFormData(buildInitialFormData());
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.senderName.trim() || !formData.content.trim()) {
      alert('Vui lòng nhập đầy đủ họ tên và nội dung lời chúc.');
      return;
    }

    try {
      setSubmitting(true);
      setError(null);

      const newWish = await createWish({
        senderName: formData.senderName.trim(),
        senderPosition: formData.senderPosition.trim() || undefined,
        content: formData.content.trim(),
        isDelegate,
        senderAvatar: userAvatar, 
      });

      // Nếu bài viết được duyệt ngay (isVerified=true) thì mới hiện lên list
      if (newWish && newWish.isVerified) {
         setWishes((prev) => [newWish, ...prev]);
      }

      setFormData(buildInitialFormData());
      setShowForm(false);

      alert(
        newWish?.isVerified
          ? 'Lời chúc của bạn đã được hiển thị!'
          : 'Lời chúc của bạn đã được gửi và sẽ hiển thị sau khi được duyệt.',
      );
    } catch (e) {
      console.error("Lỗi gửi lời chúc:", e);
      setError('Gửi lời chúc thất bại. Vui lòng thử lại.');
    } finally {
      setSubmitting(false);
    }
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return '';
    try {
        // Format ngắn gọn hơn: 14:30 20/12
        return new Date(dateString).toLocaleString('vi-VN', {
            hour: '2-digit', minute: '2-digit', day: '2-digit', month: '2-digit'
        });
    } catch { return ''; }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-cyan-50">
      {user && <Navigation />}

      {/* Decorative Background Elements */}
      <div className="fixed top-0 left-0 w-full h-full overflow-hidden pointer-events-none z-0">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-blue-200 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob"></div>
        <div className="absolute top-0 right-1/4 w-96 h-96 bg-cyan-200 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000"></div>
      </div>

      <div className="container mx-auto px-4 py-12 relative z-10">
        {/* Header */}
        <div className="text-center mb-16 max-w-3xl mx-auto">
          <span className="inline-block py-1 px-3 rounded-full bg-blue-100 text-blue-600 text-sm font-semibold mb-4">
            Đại hội Hội Sinh viên
          </span>
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6 leading-tight">
            Gửi trọn niềm tin <br/> <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-cyan-500">Trao ngàn lời chúc</span>
          </h1>
          <p className="text-lg text-gray-600 mb-8">
            Hãy cùng nhau chia sẻ những thông điệp ý nghĩa, tiếp thêm sức mạnh cho Đại hội thành công rực rỡ.
          </p>
          
          <button
            onClick={() => setShowForm(true)}
            className="group relative inline-flex items-center justify-center px-8 py-3 text-lg font-medium text-white transition-all duration-200 bg-blue-600 rounded-full hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-600 shadow-lg hover:shadow-xl hover:-translate-y-0.5"
          >
            <i className="ri-heart-add-fill mr-2 group-hover:scale-110 transition-transform"></i>
            Gửi lời chúc ngay
          </button>

          {user && (
            <p className="mt-4 text-sm text-gray-500">
              Đăng nhập: <span className="font-semibold text-gray-700">{displayName}</span>
            </p>
          )}
        </div>

        {/* Modal Form */}
        {showForm && (
          <div className="fixed inset-0 bg-gray-900/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fade-in">
            <div className="bg-white w-full max-w-lg rounded-2xl shadow-2xl overflow-hidden transform transition-all scale-100">
              <div className="bg-gradient-to-r from-blue-600 to-cyan-600 p-4 flex justify-between items-center">
                <h2 className="text-xl font-bold text-white flex items-center">
                   <i className="ri-mail-send-line mr-2"></i> Gửi lời chúc mừng
                </h2>
                <button
                  onClick={() => setShowForm(false)}
                  className="text-white/80 hover:text-white hover:rotate-90 transition-transform"
                >
                  <i className="ri-close-circle-line text-2xl" />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="p-6 space-y-5">
                <div className="grid grid-cols-1 gap-5">
                    <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1">
                        Người gửi
                    </label>
                    <input
                        type="text"
                        value={formData.senderName}
                        onChange={(e) => setFormData({ ...formData, senderName: e.target.value })}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-gray-50"
                        required
                        disabled={isLoggedIn}
                    />
                    </div>

                    <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1">
                        Đơn vị / Chức vụ
                    </label>
                    <input
                        type="text"
                        value={formData.senderPosition}
                        onChange={(e) => setFormData({ ...formData, senderPosition: e.target.value })}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-gray-50"
                        disabled={isLoggedIn}
                    />
                    </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">
                    Lời chúc của bạn
                  </label>
                  <textarea
                    value={formData.content}
                    onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent min-h-[120px] resize-none"
                    maxLength={500}
                    required
                    placeholder="Nhập những lời chúc tốt đẹp nhất gửi đến Đại hội..."
                  />
                  <div className="flex justify-between mt-1">
                     <span className="text-xs text-gray-400">Tối đa 500 ký tự</span>
                     <span className="text-xs text-gray-500">{formData.content.length}/500</span>
                  </div>
                </div>

                <div className="flex space-x-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowForm(false)}
                    className="flex-1 px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors font-medium"
                  >
                    Hủy bỏ
                  </button>
                  <button 
                    type="submit" 
                    disabled={submitting} 
                    className="flex-1 px-4 py-2 text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors font-medium disabled:opacity-70 flex justify-center items-center"
                  >
                    {submitting ? <><i className="ri-loader-4-line animate-spin mr-2"/> Đang gửi...</> : 'Gửi lời chúc'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div className="mb-8 max-w-lg mx-auto">
            <div className="flex items-center p-4 mb-4 text-red-800 rounded-lg bg-red-50 border border-red-200" role="alert">
              <i className="ri-error-warning-fill text-xl mr-3"></i>
              <div className="text-sm font-medium">{error}</div>
            </div>
          </div>
        )}

        {/* Wishes Grid - BEAUTIFUL CARDS */}
        <div className="mb-12">
          {loading ? (
            <div className="grid md:grid-cols-3 gap-8">
               {[1,2,3].map(i => (
                   <div key={i} className="h-64 bg-white rounded-2xl shadow-sm animate-pulse"></div>
               ))}
            </div>
          ) : wishes.length > 0 ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {wishes.map((wish) => {
                if (!wish) return null;
                return (
                  <div 
                    key={wish.id} 
                    className="group relative bg-white rounded-2xl p-8 shadow-[0_2px_15px_-3px_rgba(0,0,0,0.07),0_10px_20px_-2px_rgba(0,0,0,0.04)] hover:shadow-2xl hover:-translate-y-1 transition-all duration-300 border border-gray-100 flex flex-col"
                  >
                    {/* Decorative Quote Icon */}
                    <div className="absolute top-6 right-8 text-8xl font-serif text-gray-50 opacity-50 group-hover:text-blue-50 transition-colors pointer-events-none select-none">
                      &rdquo;
                    </div>

                    {/* Header: Avatar & Info */}
                    <div className="flex items-center gap-4 mb-6 relative z-10">
                       {/* Avatar Logic */}
                       <div className="relative flex-shrink-0">
                            {wish.senderAvatar ? (
                                <img 
                                    src={wish.senderAvatar} 
                                    alt={wish.senderName}
                                    className={`w-14 h-14 rounded-full object-cover border-2 ${wish.isDelegate ? 'border-blue-500' : 'border-green-500'} p-0.5`}
                                    onError={(e) => {
                                        e.currentTarget.style.display = 'none';
                                        e.currentTarget.nextElementSibling?.classList.remove('hidden');
                                    }}
                                />
                            ) : null}
                            
                            {/* Fallback Icon (Hidden if image loads) */}
                            <div className={`${wish.senderAvatar ? 'hidden' : 'flex'} w-14 h-14 rounded-full items-center justify-center border-2 ${wish.isDelegate ? 'border-blue-500 bg-blue-50' : 'border-green-500 bg-green-50'}`}>
                                <i className={`${wish.isDelegate ? 'ri-vip-crown-fill text-blue-500' : 'ri-user-smile-fill text-green-500'} text-2xl`}></i>
                            </div>

                            {/* Check Icon for Delegate */}
                            {wish.isDelegate && (
                                <div className="absolute -bottom-1 -right-1 bg-blue-600 text-white w-5 h-5 rounded-full flex items-center justify-center text-xs border-2 border-white shadow-sm" title="Đại biểu chính thức">
                                    <i className="ri-check-line"></i>
                                </div>
                            )}
                       </div>

                       <div>
                           <h3 className="font-bold text-gray-800 line-clamp-1 text-lg">
                               {wish.senderName}
                           </h3>
                           <p className={`text-xs font-medium uppercase tracking-wider ${wish.isDelegate ? 'text-blue-600' : 'text-green-600'}`}>
                               {wish.isDelegate ? 'Đại biểu' : 'Cán bộ / Sinh viên'}
                           </p>
                       </div>
                    </div>

                    {/* Content */}
                    <div className="flex-1 relative z-10">
                        <p className="text-gray-600 italic leading-relaxed text-[15px]">
                           {wish.content}
                        </p>
                    </div>

                    {/* Footer: Position & Date */}
                    <div className="mt-6 pt-4 border-t border-gray-100 flex justify-between items-end relative z-10">
                        <div className="text-sm font-medium text-gray-500 max-w-[70%] line-clamp-1">
                           {wish.senderPosition || (wish.isDelegate ? 'Đại biểu' : 'Hội viên')}
                        </div>
                        <div className="text-xs text-gray-400 flex items-center bg-gray-50 px-2 py-1 rounded-md">
                           <i className="ri-time-line mr-1"></i>
                           {formatDate(wish.createdAt)}
                        </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-20 bg-white rounded-3xl border border-dashed border-gray-300">
              <div className="w-24 h-24 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-6 animate-bounce-slow">
                <i className="ri-chat-heart-line text-4xl text-blue-400" />
              </div>
              <h3 className="text-2xl font-bold text-gray-800 mb-2">
                Chưa có lời chúc nào được hiển thị
              </h3>
              <p className="text-gray-500 mb-8 max-w-md mx-auto">
                Hãy là người đầu tiên gửi những lời chúc tốt đẹp nhất đến Đại hội của chúng ta!
              </p>
              <button
                onClick={() => setShowForm(true)}
                className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-full text-blue-700 bg-blue-100 hover:bg-blue-200 transition-colors"
              >
                <i className="ri-pencil-fill mr-2"></i>
                Viết lời chúc ngay
              </button>
            </div>
          )}
        </div>

        {/* Bottom Decoration */}
        <div className="text-center pb-8">
            <p className="text-gray-400 text-sm">Ban Tổ chức trân trọng cảm ơn những tình cảm quý báu của các đồng chí.</p>
        </div>
      </div>
    </div>
  );
};

export default WishesPage;