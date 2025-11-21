import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Navigation } from '../../components/feature/Navigation';
import { useAuth } from '../../hooks/useAuth';
import { fetchWishes, createWish, Wish } from '../../services/wishes';

import bgImage from '../../assets/image/nendaihoi.png';          // ẢNH NỀN
import congressLogo from '../../assets/image/1. Ava ĐH XIII.png'; // LOGO ĐẠI HỘI (cắt tròn)

const WishesPage: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const isLoggedIn = !!user;
  const isDelegate = user?.role === 'delegate';

  // Build form data
  const u: any = user || {};
  const displayName = u.fullName || u.name || '';
  const displayDept = u.department?.name || '';
  const displayPosition = u.delegateInfo?.position || '';

  const buildInitialFormData = () => ({
    senderName: displayName,
    senderPosition: isDelegate
      ? `Đại biểu${displayPosition ? ` - ${displayPosition}` : ''}${
          displayDept ? ` - ${displayDept}` : ''
        }`
      : displayDept,
    content: '',
  });

  const [formData, setFormData] = useState(buildInitialFormData);
  const [wishes, setWishes] = useState<Wish[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Load wishes
  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        const data = await fetchWishes({ onlyVerified: true });

        const filtered = (data || [])
          .filter(Boolean)
          .filter((w) => w.isVerified)
          .sort((a, b) => {
            if (a.isDelegate && !b.isDelegate) return -1;
            if (!a.isDelegate && b.isDelegate) return 1;
            return (
              new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
            );
          });

        setWishes(filtered);
      } catch {
        setError('Không thể tải dữ liệu lời chúc.');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  // Reset khi login/logout
  useEffect(() => {
    setFormData(buildInitialFormData());
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.senderName.trim() || !formData.content.trim()) {
      alert('Vui lòng điền đầy đủ.');
      return;
    }

    try {
      setSubmitting(true);
      const newWish = await createWish({
        ...formData,
        isDelegate,
      });

      if (newWish?.isVerified) {
        setWishes((prev) => [newWish, ...prev]);
      }

      setFormData(buildInitialFormData());
      setShowForm(false);

      alert(
        newWish?.isVerified
          ? 'Lời chúc đã được hiển thị!'
          : 'Lời chúc đã gửi và chờ xét duyệt.',
      );
    } finally {
      setSubmitting(false);
    }
  };

  const formatDate = (d: string) =>
    new Date(d).toLocaleString('vi-VN', {
      hour: '2-digit',
      minute: '2-digit',
      day: '2-digit',
      month: '2-digit',
    });

  return (
    <div className="relative min-h-screen bg-gray-50 overflow-hidden">
      {/* Background Image */}
      <img
        src={bgImage}
        alt="bg"
        className="fixed inset-0 w-full h-full object-cover opacity-40 -z-20"
      />

      {/* Overlay mờ cho dễ đọc */}
      <div className="fixed inset-0 bg-white/60 backdrop-blur-sm -z-10" />

      {user && <Navigation />}

      <div className="relative container mx-auto px-4 pt-28 md:pt-32 pb-16 mt-10">
        {/* HÀNG NÚT QUAY VỀ */}
        <div className="flex items-center justify-between mb-4">
          <button
            onClick={() => navigate(-1)}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/80 border border-gray-200 shadow-sm hover:bg-gray-100 hover:shadow-md transition-all"
          >
            <i className="ri-arrow-left-line text-gray-700" />
            <span className="text-sm font-medium text-gray-700">
              Quay về
            </span>
          </button>
        </div>

        {/* HEADER */}
        <div className="text-center mb-12">
          {/* LOGO ĐẠI HỘI CẮT TRÒN */}
          <div className="flex justify-center mb-4">
            <div className="relative">
              <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-full border-4 border-white shadow-2xl overflow-hidden bg-white">
                <img
                  src={congressLogo}
                  alt="Logo Đại hội"
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="absolute inset-x-4 -bottom-2 h-2 bg-blue-400/40 rounded-full blur-md" />
            </div>
          </div>

          <div className="inline-flex items-center gap-2 px-4 py-1 rounded-full bg-blue-50 border border-blue-100 text-xs font-semibold text-blue-700 mb-4">
            <i className="ri-chat-heart-line text-sm" />
            LỜI CHÚC GỬI ĐẾN ĐẠI HỘI
          </div>

          


          <p className="text-gray-600 max-w-xl mx-auto text-sm sm:text-base mb-6">
            Những thông điệp yêu thương – tiếp thêm lửa cho Đại hội thành công.
          </p>

          <button
            onClick={() => setShowForm(true)}
            className="mt-2 px-8 py-3 text-white bg-blue-600 rounded-full shadow-md hover:bg-blue-700 hover:shadow-lg transition-all flex items-center justify-center mx-auto"
          >
            <i className="ri-heart-add-fill mr-2" />
            Gửi lời chúc ngay
          </button>
        </div>

        {/* FORM MODAL */}
        {showForm && (
          <div className="fixed inset-0 flex items-center justify-center bg-black/40 backdrop-blur-sm z-50 px-4">
            <div className="bg-white w-full max-w-lg rounded-2xl shadow-2xl overflow-hidden">
              <div className="bg-blue-600 text-white p-4 flex justify-between items-center">
                <h2 className="text-lg font-bold">Gửi lời chúc</h2>
                <button onClick={() => setShowForm(false)}>
                  <i className="ri-close-line text-2xl" />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="p-6 space-y-4">
                <div>
                  <label className="text-sm font-medium text-gray-700">
                    Người gửi
                  </label>
                  <input
                    type="text"
                    value={formData.senderName}
                    onChange={(e) =>
                      setFormData({ ...formData, senderName: e.target.value })
                    }
                    className="w-full px-4 py-2 border rounded-lg bg-gray-50"
                    disabled={isLoggedIn}
                    required
                  />
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-700">
                    Đơn vị / Chức vụ
                  </label>
                  <input
                    type="text"
                    value={formData.senderPosition}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        senderPosition: e.target.value,
                      })
                    }
                    className="w-full px-4 py-2 border rounded-lg bg-gray-50"
                    disabled={isLoggedIn}
                  />
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-700">
                    Nội dung lời chúc
                  </label>
                  <textarea
                    value={formData.content}
                    onChange={(e) =>
                      setFormData({ ...formData, content: e.target.value })
                    }
                    className="w-full px-4 py-2 border rounded-lg min-h-[120px] resize-none"
                    maxLength={500}
                    required
                  />
                  <div className="text-right text-xs text-gray-500 mt-1">
                    {formData.content.length}/500
                  </div>
                </div>

                <div className="flex gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowForm(false)}
                    className="flex-1 py-2 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                  >
                    Hủy
                  </button>
                  <button
                    type="submit"
                    disabled={submitting}
                    className="flex-1 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-60 transition-colors"
                  >
                    {submitting ? 'Đang gửi...' : 'Gửi lời chúc'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* ERROR */}
        {error && (
          <div className="text-center text-red-600 mb-6 font-medium">
            {error}
          </div>
        )}

        {/* WISHES LIST */}
        <div>
          {loading ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3].map((i) => (
                <div
                  key={i}
                  className="h-40 bg-white/80 rounded-xl animate-pulse border border-gray-200"
                />
              ))}
            </div>
          ) : wishes.length ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {wishes.map((w) => (
                <div
                  key={w.id}
                  className="bg-white/95 border border-gray-200 rounded-2xl p-6 shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all"
                >
                  <div className="flex items-start gap-3 mb-4">
                    <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 text-2xl">
                      <i className="ri-message-2-fill" />
                    </div>

                    <div>
                      <h3 className="font-semibold text-gray-800">
                        {w.senderName}
                      </h3>
                      <p className="text-xs text-gray-500">
                        {w.senderPosition || '—'}
                      </p>
                    </div>
                  </div>

                  <p className="text-gray-700 italic mb-4">{w.content}</p>

                  <div className="text-right text-xs text-gray-500">
                    <i className="ri-time-line mr-1" />
                    {formatDate(w.createdAt)}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-20 bg-white/80 rounded-2xl border border-gray-300">
              <i className="ri-chat-heart-line text-5xl text-blue-500 mb-4" />
              <h3 className="text-xl font-semibold text-gray-800 mb-2">
                Chưa có lời chúc nào
              </h3>
              <p className="text-gray-500 mb-5">
                Hãy là người đầu tiên gửi những lời chúc ý nghĩa!
              </p>
              <button
                onClick={() => setShowForm(true)}
                className="px-6 py-2 bg-blue-600 text-white rounded-full hover:bg-blue-700 transition-colors"
              >
                Viết lời chúc
              </button>
            </div>
          )}
        </div>

        <p className="text-center text-gray-400 text-sm mt-12">
          Ban Tổ chức trân trọng cảm ơn những lời chúc quý báu.
        </p>
      </div>
    </div>
  );
};

export default WishesPage;
