// src/pages/wishes/AdminWishesPage.tsx
import React, {
  useEffect,
  useMemo,
  useState,
  useCallback,
} from 'react';
import { Navigation } from '../../components/feature/Navigation';
import { Card } from '../../components/base/Card';
import { Button } from '../../components/base/Button';
import { useAuth } from '../../hooks/useAuth';
import {
  Wish,
  fetchWishes,
  updateWish,
  deleteWish,
} from '../../services/wishes';

type FilterStatus = 'all' | 'unverified' | 'verified';

// ---- Helper sanitize ----
const sanitizeWish = (item: any): Wish | null => {
  if (!item || typeof item.id !== 'number') return null;

  return {
    id: item.id,
    senderName: item.senderName ?? '',
    senderPosition: item.senderPosition ?? null,
    content: item.content ?? '',
    isDelegate: !!item.isDelegate,
    isVerified: !!item.isVerified,
    priority: (item.priority ?? '3') as '1' | '2' | '3',
    createdAt: item.createdAt ?? new Date().toISOString(),
    updatedAt: item.updatedAt ?? item.createdAt ?? new Date().toISOString(),
  };
};

const sanitizeWishesArray = (data: any): Wish[] => {
  if (!Array.isArray(data)) return [];
  return data
    .map((item) => sanitizeWish(item))
    .filter((w): w is Wish => w !== null);
};

const AdminWishesPage: React.FC = () => {
  const { user } = useAuth();

  const [wishes, setWishes] = useState<Wish[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [filterStatus, setFilterStatus] = useState<FilterStatus>('all');
  const [savingId, setSavingId] = useState<number | null>(null);

  // ---- LOAD LIST ----
  const reloadWishes = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const data = await fetchWishes();
      console.log('Wishes from API:', data);

      const normalized = sanitizeWishesArray(data);

      const sorted = [...normalized].sort((a, b) => {
        const pa = Number(a.priority);
        const pb = Number(b.priority);
        if (pa !== pb) return pa - pb;
        return (
          new Date(b.createdAt).getTime() -
          new Date(a.createdAt).getTime()
        );
      });

      setWishes(sorted);
    } catch (e) {
      console.error(e);
      setError('Không thể tải danh sách lời chúc.');
      setWishes([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    reloadWishes();
  }, [reloadWishes]);

  // ---- FILTER ----
  const filteredWishes = useMemo(() => {
    const base = wishes.filter(
      (w): w is Wish => !!w && typeof w.id === 'number',
    );

    switch (filterStatus) {
      case 'verified':
        return base.filter((w) => w.isVerified);
      case 'unverified':
        return base.filter((w) => !w.isVerified);
      default:
        return base;
    }
  }, [wishes, filterStatus]);

  // ---- SUMMARY ----
  const totalCount = wishes.length;
  const verifiedCount = wishes.filter((w) => w?.isVerified).length;
  const pendingCount = wishes.filter((w) => w && !w.isVerified).length;

  const formatDate = (dateString: string) => {
    const d = new Date(dateString);
    return d.toLocaleString('vi-VN');
  };

  // ---- ACTIONS ----
  const handleToggleVerify = async (wish: Wish) => {
    try {
      setSavingId(wish.id);
      const newValue = !wish.isVerified;

      // Optimistic update
      setWishes((prev) =>
        prev.map((w) =>
          w && w.id === wish.id ? { ...w, isVerified: newValue } : w,
        ),
      );

      const updatedRaw = await updateWish(wish.id, {
        isVerified: newValue,
      });
      const updated = sanitizeWish(updatedRaw);

      if (!updated) {
        // Nếu API trả về kỳ lạ thì reload lại cả list
        await reloadWishes();
        return;
      }

      setWishes((prev) =>
        prev.map((w) => (w.id === wish.id ? updated : w)),
      );
    } catch (e) {
      console.error(e);
      setError('Cập nhật trạng thái duyệt thất bại.');
      // optional: reload lại để rollback
      reloadWishes();
    } finally {
      setSavingId(null);
    }
  };

  const handleChangePriority = async (
    wish: Wish,
    priority: '1' | '2' | '3',
  ) => {
    try {
      setSavingId(wish.id);

      // Optimistic
      setWishes((prev) =>
        prev.map((w) =>
          w.id === wish.id ? { ...w, priority } : w,
        ),
      );

      const updatedRaw = await updateWish(wish.id, { priority });
      const updated = sanitizeWish(updatedRaw);

      if (!updated) {
        await reloadWishes();
        return;
      }

      setWishes((prev) =>
        prev.map((w) => (w.id === wish.id ? updated : w)),
      );
    } catch (e) {
      console.error(e);
      setError('Cập nhật độ ưu tiên thất bại.');
      reloadWishes();
    } finally {
      setSavingId(null);
    }
  };

  const handleDeleteWish = async (wish: Wish) => {
    const ok = window.confirm(
      `Bạn có chắc chắn muốn xoá lời chúc của "${wish.senderName}"?`,
    );
    if (!ok) return;

    try {
      setSavingId(wish.id);
      await deleteWish(wish.id);
      setWishes((prev) => prev.filter((w) => w.id !== wish.id));
    } catch (e) {
      console.error(e);
      setError('Xoá lời chúc thất bại.');
    } finally {
      setSavingId(null);
    }
  };

  // ---- AUTH GUARD ----
  if (!user) {
    return <div>Đang tải...</div>;
  }

  if (user.role !== 'admin') {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navigation />
        <div className="container mx-auto px-4 py-8">
          <Card className="text-center py-12">
            <h1 className="text-2xl font-bold text-gray-800 mb-4">
              Không có quyền truy cập
            </h1>
            <p className="text-gray-600">
              Trang này chỉ dành cho tài khoản quản trị viên.
            </p>
          </Card>
        </div>
      </div>
    );
  }

  // ---- UI ----
  return (
    <div className="min-h-screen bg-gradient-to-br from-cyan-50 via-white to-cyan-100">
      <Navigation />

      <div className="container mx-auto px-4 py-8">
        {/* Header + Summary */}
        <div className="flex flex-col gap-4 mb-6 md:flex-row md:items-center md:justify-between">
          <div>
            <div className="inline-flex items-center rounded-full bg-cyan-100 px-3 py-1 text-xs font-semibold text-cyan-700 mb-2">
              <i className="ri-heart-3-line mr-1" />
              Quản trị lời chúc Đại hội
            </div>
            <h1 className="text-3xl font-bold text-gray-800 mb-1">
              Quản lý lời chúc
            </h1>
            <p className="text-gray-600">
              Duyệt hiển thị, sắp xếp độ ưu tiên và xoá các lời chúc gửi đến Đại hội.
            </p>
          </div>

          {/* Filter buttons */}
          <div className="flex flex-col items-stretch gap-2 sm:flex-row sm:items-center">
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-600">Lọc:</span>
              <div className="flex gap-2">
                <Button
                  variant={filterStatus === 'all' ? 'primary' : 'secondary'}
                  size="sm"
                  onClick={() => setFilterStatus('all')}
                >
                  Tất cả ({totalCount})
                </Button>
                <Button
                  variant={
                    filterStatus === 'unverified' ? 'primary' : 'secondary'
                  }
                  size="sm"
                  onClick={() => setFilterStatus('unverified')}
                >
                  Chưa duyệt ({pendingCount})
                </Button>
                <Button
                  variant={filterStatus === 'verified' ? 'primary' : 'secondary'}
                  size="sm"
                  onClick={() => setFilterStatus('verified')}
                >
                  Đã duyệt ({verifiedCount})
                </Button>
              </div>
            </div>
            <Button
              variant="secondary"
              size="sm"
              onClick={reloadWishes}
              className="flex items-center justify-center gap-1"
            >
              <i className="ri-refresh-line" />
              Tải lại
            </Button>
          </div>
        </div>

        {/* Small summary cards */}
        <div className="grid gap-4 mb-6 sm:grid-cols-3">
          <Card className="flex items-center justify-between px-4 py-3">
            <div>
              <div className="text-xs font-semibold text-gray-500 uppercase">
                Tổng lời chúc
              </div>
              <div className="text-2xl font-bold text-cyan-700">
                {totalCount}
              </div>
            </div>
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-cyan-100">
              <i className="ri-message-3-line text-lg text-cyan-600" />
            </div>
          </Card>
          <Card className="flex items-center justify-between px-4 py-3">
            <div>
              <div className="text-xs font-semibold text-gray-500 uppercase">
                Đã duyệt
              </div>
              <div className="text-2xl font-bold text-emerald-700">
                {verifiedCount}
              </div>
            </div>
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-100">
              <i className="ri-checkbox-circle-line text-lg text-emerald-600" />
            </div>
          </Card>
          <Card className="flex items-center justify-between px-4 py-3">
            <div>
              <div className="text-xs font-semibold text-gray-500 uppercase">
                Chưa duyệt
              </div>
              <div className="text-2xl font-bold text-amber-700">
                {pendingCount}
              </div>
            </div>
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-amber-100">
              <i className="ri-time-line text-lg text-amber-600" />
            </div>
          </Card>
        </div>

        {/* Error */}
        {error && (
          <div className="mb-4">
            <Card className="border border-red-200 bg-red-50">
              <div className="flex items-start space-x-2 text-sm text-red-700">
                <i className="ri-error-warning-line mt-0.5" />
                <span>{error}</span>
              </div>
            </Card>
          </div>
        )}

        {/* Table */}
        <Card className="shadow-lg">
          {loading ? (
            <div className="py-10 text-center text-gray-500">
              <i className="ri-loader-4-line animate-spin mr-2" />
              Đang tải danh sách lời chúc...
            </div>
          ) : filteredWishes.length === 0 ? (
            <div className="py-10 text-center text-gray-500">
              Không có lời chúc nào phù hợp bộ lọc.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full text-sm">
                <thead className="sticky top-0 z-10 bg-gray-50">
                  <tr className="border-b text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    <th className="px-3 py-2">Người gửi</th>
                    <th className="px-3 py-2">Chức vụ / Đơn vị</th>
                    <th className="px-3 py-2">Loại</th>
                    <th className="px-3 py-2">Nội dung</th>
                    <th className="px-3 py-2">Ưu tiên</th>
                    <th className="px-3 py-2">Trạng thái</th>
                    <th className="px-3 py-2">Thời gian</th>
                    <th className="px-3 py-2 text-right">Thao tác</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredWishes
                    .filter(Boolean) // chặn undefined lần nữa cho chắc
                    .map((w) => (
                      <tr
                        key={w.id}
                        className={`border-t align-top transition-colors hover:bg-gray-50 ${
                          w.priority === '1'
                            ? 'bg-amber-50/60'
                            : w.priority === '2'
                            ? 'bg-cyan-50/40'
                            : ''
                        }`}
                      >
                        <td className="px-3 py-3">
                          <div className="flex items-center gap-2">
                            <div
                              className={`flex h-9 w-9 items-center justify-center rounded-full ${
                                w.isDelegate
                                  ? 'bg-blue-100'
                                  : 'bg-green-100'
                              }`}
                            >
                              <i
                                className={
                                  w.isDelegate
                                    ? 'ri-vip-crown-line text-blue-600'
                                    : 'ri-user-line text-green-600'
                                }
                              />
                            </div>
                            <div>
                              <div className="font-semibold text-gray-800">
                                {w.senderName}
                              </div>
                              <div className="text-xs text-gray-500">
                                ID #{w.id}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-3 py-3 text-gray-600">
                          {w.senderPosition || (
                            <span className="text-gray-400">—</span>
                          )}
                        </td>
                        <td className="px-3 py-3">
                          <span
                            className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                              w.isDelegate
                                ? 'bg-blue-100 text-blue-800'
                                : 'bg-green-100 text-green-800'
                            }`}
                          >
                            {w.isDelegate ? 'Đại biểu' : 'Sinh viên / khách'}
                          </span>
                        </td>
                        <td className="px-3 py-3 max-w-xs">
                          <div
                            className="text-gray-700 text-xs md:text-sm line-clamp-3"
                            title={w.content}
                          >
                            {w.content}
                          </div>
                        </td>
                        <td className="px-3 py-3">
                          <div className="flex flex-col gap-1">
                            <select
                              value={w.priority}
                              onChange={(e) =>
                                handleChangePriority(
                                  w,
                                  e.target.value as '1' | '2' | '3',
                                )
                              }
                              disabled={savingId === w.id}
                              className="border border-gray-300 rounded-md px-2 py-1 text-xs focus:outline-none focus:ring-1 focus:ring-cyan-500 bg-white"
                            >
                              <option value="1">1 - Cao</option>
                              <option value="2">2 - Trung bình</option>
                              <option value="3">3 - Thường</option>
                            </select>
                            {w.priority === '1' && (
                              <span className="inline-flex items-center gap-1 text-[11px] text-amber-700">
                                <i className="ri-star-fill" />
                                Ưu tiên hiển thị
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="px-3 py-3">
                          <button
                            type="button"
                            onClick={() => handleToggleVerify(w)}
                            disabled={savingId === w.id}
                            className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                              w.isVerified
                                ? 'bg-emerald-100 text-emerald-800'
                                : 'bg-gray-100 text-gray-700'
                            }`}
                          >
                            {savingId === w.id ? (
                              <i className="ri-loader-4-line animate-spin mr-1" />
                            ) : (
                              <i
                                className={`mr-1 ${
                                  w.isVerified
                                    ? 'ri-check-line'
                                    : 'ri-time-line'
                                }`}
                              />
                            )}
                            {w.isVerified ? 'Đã duyệt' : 'Chưa duyệt'}
                          </button>
                        </td>
                        <td className="px-3 py-3 text-xs text-gray-500 whitespace-nowrap">
                          {formatDate(w.createdAt)}
                        </td>
                        <td className="px-3 py-3 text-right">
                          <button
                            type="button"
                            onClick={() => handleDeleteWish(w)}
                            disabled={savingId === w.id}
                            className="inline-flex items-center gap-1 rounded-md bg-red-50 px-2 py-1 text-xs font-medium text-red-600 hover:bg-red-100 disabled:opacity-50"
                          >
                            <i className="ri-delete-bin-line" />
                            Xoá
                          </button>
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
};

export default AdminWishesPage;
