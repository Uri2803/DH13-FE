// src/pages/dashboard/DashboardPage.tsx
import React, { useEffect, useState, useCallback } from 'react';
import { Navigation } from '../../components/feature/Navigation';
import { Card } from '../../components/base/Card';
import { Button } from '../../components/base/Button';
import { useAuth } from '../../hooks/useAuth';
import { AdminStatsGrid } from './admin';
import { getSocket } from '../../utils/socket';
import { resetCheckin } from '../../services/checkin';

import {
  fetchDelegatesAll,
  fetchDelegatesByDepartment,
  DelegateRow,
} from '../../services/delegates';
import { fetchWishes } from '../../services/wishes';

import {
  fetchDashboardNotifications,
  NotificationItem,
  NotificationLevel,
  createNotification,
  updateNotification,
  deleteNotification,
} from '../../services/notifications';

import {
  fetchDashboardSchedule,
  CongressScheduleItem,
  createScheduleItem,
  updateScheduleItem,
  deleteScheduleItem,
} from '../../services/congressSchedule';

import {
  ActivityItem,
  formatDateShort,
  formatTime,
  formatTimeAgo,
  getQuickActions,
  toInputDateTime,
} from './funtion';

import { DashboardWelcomeSection } from './welcom';
import { RecentActivityCard } from './RecentActivityCard';
import { DashboardQuickActions } from './QuickActionsSection';

const DashboardPage: React.FC = () => {
  const { user } = useAuth();

  const [stats, setStats] = useState({
    totalDelegates: 0,
    checkedInCount: 0,
    participationRate: 0,
    totalWishes: 0,
  });
const [resetLoading, setResetLoading] = useState(false); // 👈 thêm dòng này


  const [recentActivities, setRecentActivities] = useState<ActivityItem[]>([]);

  // State cho thông báo & chương trình đại hội
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [scheduleItems, setScheduleItems] = useState<CongressScheduleItem[]>([]);

  const [loading, setLoading] = useState(true);

  // ====== STATE CRUD NOTIFICATION (ADMIN) ======
  const [notifFormOpen, setNotifFormOpen] = useState(false);
  const [notifSaving, setNotifSaving] = useState(false);
  const [notifForm, setNotifForm] = useState<{
    id?: number;
    title: string;
    message: string;
    level: NotificationLevel;
    isActive: boolean;
    showOnDashboard: boolean;
    startTime: string; // 'YYYY-MM-DDTHH:mm'
    endTime: string; // ''
  }>({
    title: '',
    message: '',
    level: 'info',
    isActive: true,
    showOnDashboard: true,
    startTime: '',
    endTime: '',
  });

  // ====== STATE CRUD SCHEDULE (ADMIN) ======
  const [scheduleFormOpen, setScheduleFormOpen] = useState(false);
  const [scheduleSaving, setScheduleSaving] = useState(false);
  const [scheduleForm, setScheduleForm] = useState<{
    id?: number;
    title: string;
    description: string;
    location: string;
    startTime: string; // 'YYYY-MM-DDTHH:mm'
    endTime: string;
    color: string;
    orderIndex: number;
  }>({
    title: '',
    description: '',
    location: '',
    startTime: '',
    endTime: '',
    color: 'green',
    orderIndex: 0,
  });

  // ====== HELPER RELOAD (dùng cho CRUD + realtime) ======
  const reloadNotifications = useCallback(async () => {
    try {
      const raw = await fetchDashboardNotifications();
      console.log('Reload notifications (realtime):', raw);
      setNotifications(Array.isArray(raw) ? raw : []);
    } catch (e) {
      console.error('Lỗi reload notifications:', e);
    }
  }, []);

  const reloadSchedule = useCallback(async () => {
    try {
      const raw = await fetchDashboardSchedule();
      console.log('Reload schedule (realtime):', raw);
      setScheduleItems(Array.isArray(raw) ? raw : []);
    } catch (e) {
      console.error('Lỗi reload schedule:', e);
    }
  }, []);

  // ====== LOAD DATA DASHBOARD LẦN ĐẦU ======
  useEffect(() => {
    if (!user) return;

    const loadDashboardData = async () => {
      setLoading(true);

      try {
        // ===== DELEGATES + WISHES (thống kê + activity) =====
        let delegatesPromise: Promise<DelegateRow[]>;

        if (user.role === 'department' && user.department?.id) {
          delegatesPromise = fetchDelegatesByDepartment(
            Number(user.department.id),
          );
        } else {
          delegatesPromise = fetchDelegatesAll();
        }

        const [delegatesRaw, wishesRaw] = await Promise.all([
          delegatesPromise,
          fetchWishes(),
        ]);

        const delegates = Array.isArray(delegatesRaw) ? delegatesRaw : [];
        const wishes = Array.isArray(wishesRaw) ? wishesRaw : [];

        const totalDelegates = delegates.length;
        const checkedInList = delegates.filter((d) => d.checkedIn);
        const checkedInCount = checkedInList.length;

        const participationRate =
          totalDelegates > 0
            ? Math.round((checkedInCount / totalDelegates) * 100)
            : 0;

        setStats({
          totalDelegates,
          checkedInCount,
          participationRate,
          totalWishes: wishes.length,
        });

        const checkinActivities: ActivityItem[] = checkedInList
          .filter((d) => d.checkinTime)
          .map((d) => ({
            id: `chk-${d.id}`,
            type: 'checkin',
            content: `${d.fullName} đã điểm danh`,
            time: d.checkinTime!,
            timestamp: new Date(d.checkinTime!).getTime(),
          }));

        const wishActivities: ActivityItem[] = wishes.map((w) => ({
          id: `wish-${w.id}`,
          type: 'wish',
          content: `${w.senderName} gửi lời chúc`,
          time: w.createdAt,
          timestamp: new Date(w.createdAt).getTime(),
        }));

        const mixedActivities = [...checkinActivities, ...wishActivities]
          .sort((a, b) => b.timestamp - a.timestamp)
          .slice(0, 5);

        setRecentActivities(mixedActivities);
      } catch (err) {
        console.error('Lỗi load delegates/wishes:', err);
      }

      // ===== NOTIFICATIONS =====
      try {
        const rawNoti = await fetchDashboardNotifications();
        console.log('Dashboard notifications (raw):', rawNoti);
        setNotifications(Array.isArray(rawNoti) ? rawNoti : []);
      } catch (err) {
        console.error('Lỗi load notifications:', err);
      }

      // ===== SCHEDULE =====
      try {
        const rawSchedule = await fetchDashboardSchedule();
        console.log('Dashboard schedule (raw):', rawSchedule);
        setScheduleItems(Array.isArray(rawSchedule) ? rawSchedule : []);
      } catch (err) {
        console.error('Lỗi load schedule:', err);
      }

      setLoading(false);
    };

    loadDashboardData();
  }, [user]);

  // ====== REALTIME QUA SOCKET ======
  useEffect(() => {
    const socket = getSocket();
    if (!socket) return;

    const handleNotifRefresh = () => {
      console.log('[Socket] dashboard:notifications:refresh');
      reloadNotifications();
    };

    const handleScheduleRefresh = () => {
      console.log('[Socket] dashboard:schedule:refresh');
      reloadSchedule();
    };

    socket.on('dashboard:notifications:refresh', handleNotifRefresh);
    socket.on('dashboard:schedule:refresh', handleScheduleRefresh);

    return () => {
      socket.off('dashboard:notifications:refresh', handleNotifRefresh);
      socket.off('dashboard:schedule:refresh', handleScheduleRefresh);
    };
  }, [reloadNotifications, reloadSchedule]);

  if (!user) {
    return <div>Đang tải...</div>;
  }

  const isAdmin = user.role === 'admin';
  const quickActions = getQuickActions(user.role);
  const handleResetCheckin = async () => {
    if (user.role !== 'admin') return; // chỉ admin được dùng

    const code = window.prompt(
      'Nhập mã xác nhận để reset điểm danh (gõ chính xác: HSV13):',
    );

    if (code === null) return; // bấm Cancel

    if (code !== 'HSV13') {
      alert('Mã xác nhận không đúng.');
      return;
    }

    const confirm = window.confirm(
      'Thao tác này sẽ xoá trạng thái điểm danh của TẤT CẢ đại biểu. Bạn chắc chắn muốn tiếp tục?',
    );
    if (!confirm) return;

    try {
      setResetLoading(true);
      await resetCheckin();
      alert('Đã reset trạng thái điểm danh toàn bộ đại biểu.');

      // Cách nhanh gọn: reload lại để thống kê & activity cập nhật
      window.location.reload();
    } catch (e) {
      console.error('Lỗi reset checkin:', e);
      alert('Reset điểm danh thất bại, vui lòng thử lại.');
    } finally {
      setResetLoading(false);
    }
  };


  // Map màu cho schedule
  const scheduleColorMap: Record<
    string,
    { container: string; time: string; dot: string }
  > = {
    green: {
      container: 'bg-green-50',
      time: 'text-green-800',
      dot: 'bg-green-500',
    },
    blue: {
      container: 'bg-blue-50',
      time: 'text-blue-800',
      dot: 'bg-blue-500',
    },
    gray: {
      container: 'bg-gray-50',
      time: 'text-gray-700',
      dot: 'bg-gray-400',
    },
    orange: {
      container: 'bg-orange-50',
      time: 'text-orange-800',
      dot: 'bg-orange-500',
    },
    red: {
      container: 'bg-red-50',
      time: 'text-red-800',
      dot: 'bg-red-500',
    },
  };

  // Map màu cho notification theo level
  const notificationLevelStyles: Record<
    NotificationLevel,
    { container: string; title: string; message: string }
  > = {
    info: {
      container: 'bg-blue-50',
      title: 'text-blue-800',
      message: 'text-blue-600',
    },
    success: {
      container: 'bg-green-50',
      title: 'text-green-800',
      message: 'text-green-600',
    },
    warning: {
      container: 'bg-yellow-50',
      title: 'text-yellow-800',
      message: 'text-yellow-600',
    },
    danger: {
      container: 'bg-red-50',
      title: 'text-red-800',
      message: 'text-red-600',
    },
  };

  // ====== HANDLER CRUD NOTIFICATION ======
  const handleNewNotification = () => {
    setNotifForm({
      id: undefined,
      title: '',
      message: '',
      level: 'info',
      isActive: true,
      showOnDashboard: true,
      startTime: '',
      endTime: '',
    });
    setNotifFormOpen(true);
  };

  const handleEditNotification = (n: NotificationItem) => {
    setNotifForm({
      id: n.id,
      title: n.title,
      message: n.message,
      level: (n.level || 'info') as NotificationLevel,
      isActive: n.isActive,
      showOnDashboard: n.showOnDashboard,
      startTime: toInputDateTime(n.startTime ?? undefined),
      endTime: toInputDateTime(n.endTime ?? undefined),
    });
    setNotifFormOpen(true);
  };

  const handleDeleteNotification = async (id: number) => {
    if (!window.confirm('Bạn chắc chắn muốn xoá thông báo này?')) return;
    try {
      await deleteNotification(id);
      await reloadNotifications();
    } catch (e) {
      console.error('Lỗi xoá notification:', e);
      alert('Xoá thông báo thất bại');
    }
  };

  const handleSaveNotification = async (e: React.FormEvent) => {
    e.preventDefault();
    setNotifSaving(true);
    try {
      const payload = {
        title: notifForm.title,
        message: notifForm.message,
        level: notifForm.level,
        isActive: notifForm.isActive,
        showOnDashboard: notifForm.showOnDashboard,
        startTime: notifForm.startTime
          ? new Date(notifForm.startTime).toISOString()
          : null,
        endTime: notifForm.endTime
          ? new Date(notifForm.endTime).toISOString()
          : null,
      };

      if (notifForm.id) {
        await updateNotification(notifForm.id, payload);
      } else {
        await createNotification(payload);
      }

      setNotifFormOpen(false);
      await reloadNotifications();
    } catch (e) {
      console.error('Lỗi lưu notification:', e);
      alert('Lưu thông báo thất bại');
    } finally {
      setNotifSaving(false);
    }
  };

  // ====== HANDLER CRUD SCHEDULE ======
  const handleNewSchedule = () => {
    setScheduleForm({
      id: undefined,
      title: '',
      description: '',
      location: '',
      startTime: '',
      endTime: '',
      color: 'green',
      orderIndex: 0,
    });
    setScheduleFormOpen(true);
  };



  const handleEditSchedule = (item: CongressScheduleItem) => {
    setScheduleForm({
      id: item.id,
      title: item.title,
      description: item.description ?? '',
      location: item.location ?? '',
      startTime: toInputDateTime(item.startTime),
      endTime: toInputDateTime(item.endTime ?? undefined),
      color: item.color || 'green',
      orderIndex: item.orderIndex ?? 0,
    });
    setScheduleFormOpen(true);
  };

  const handleDeleteSchedule = async (id: number) => {
    if (!window.confirm('Bạn chắc chắn muốn xoá mục chương trình này?')) return;
    try {
      await deleteScheduleItem(id);
      await reloadSchedule();
    } catch (e) {
      console.error('Lỗi xoá schedule item:', e);
      alert('Xoá chương trình thất bại');
    }
  };

  const handleSaveSchedule = async (e: React.FormEvent) => {
    e.preventDefault();
    setScheduleSaving(true);
    try {
      const payload = {
        title: scheduleForm.title,
        description: scheduleForm.description || null,
        location: scheduleForm.location || null,
        startTime: new Date(scheduleForm.startTime).toISOString(),
        endTime: scheduleForm.endTime
          ? new Date(scheduleForm.endTime).toISOString()
          : null,
        color: scheduleForm.color,
        orderIndex: scheduleForm.orderIndex ?? 0,
      };

      if (scheduleForm.id) {
        await updateScheduleItem(scheduleForm.id, payload);
      } else {
        await createScheduleItem(payload);
      }

      setScheduleFormOpen(false);
      await reloadSchedule();
    } catch (e) {
      console.error('Lỗi lưu schedule item:', e);
      alert('Lưu chương trình thất bại');
    } finally {
      setScheduleSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-cyan-50 via-white to-cyan-100">
      <Navigation />

      <div className="container mx-auto px-4 py-8">
        <DashboardWelcomeSection user={user} />

        {/* Quick Stats - CHỈ HIỆN VỚI ADMIN */}
        {isAdmin && <AdminStatsGrid loading={loading} stats={stats} />}
        {isAdmin && (
          <div className="mt-6 mb-4">
            <Card>
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-semibold text-red-600 flex items-center">
                    <i className="ri-alert-line mr-2" />
                    Reset trạng thái điểm danh
                  </h3>
                  <p className="text-sm text-gray-600 mt-1 max-w-xl">
                    Xoá trạng thái điểm danh của toàn bộ đại biểu. 
                    Chỉ dùng khi cần reset hệ thống, ví dụ trước phiên họp mới.
                  </p>
                </div>
                <Button
                  size="sm"
                  variant="primary"
                  type="button"
                  onClick={handleResetCheckin}
                  disabled={resetLoading}
                >
                  <i className="ri-refresh-line mr-1" />
                  {resetLoading ? 'Đang reset...' : 'Reset điểm danh'}
                </Button>
              </div>
            </Card>
          </div>
        )}


        {/* Quick Actions */}
        <DashboardQuickActions actions={quickActions} />
         
        {/* Recent Activity & Notifications */}
        <div className="grid md:grid-cols-2 gap-8">
          {/* Recent Activity Realtime */}
          <RecentActivityCard activities={recentActivities} loading={loading} />

          {/* Notifications từ BE + CRUD ADMIN */}
          <Card>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-800 flex items-center">
                <i className="ri-notification-line text-orange-500 mr-2"></i>
                Thông báo
              </h3>
              {isAdmin && (
                <Button
                  size="sm"
                  variant="primary"
                  onClick={handleNewNotification}
                >
                  <i className="ri-add-line mr-1" />
                  Thêm
                </Button>
              )}
            </div>

            {/* Form CRUD Notification (admin) */}
            {isAdmin && notifFormOpen && (
              <form
                onSubmit={handleSaveNotification}
                className="mb-4 p-3 border border-dashed border-orange-200 rounded-lg bg-orange-50/40 space-y-2"
              >
                <div className="flex space-x-2">
                  <div className="flex-1">
                    <label className="text-xs text-gray-500">Tiêu đề</label>
                    <input
                      className="w-full border rounded px-2 py-1 text-sm"
                      value={notifForm.title}
                      onChange={(e) =>
                        setNotifForm((f) => ({ ...f, title: e.target.value }))
                      }
                      required
                    />
                  </div>
                  <div>
                    <label className="text-xs text-gray-500">Mức</label>
                    <select
                      className="border rounded px-2 py-1 text-sm"
                      value={notifForm.level}
                      onChange={(e) =>
                        setNotifForm((f) => ({
                          ...f,
                          level: e.target.value as NotificationLevel,
                        }))
                      }
                    >
                      <option value="info">Info</option>
                      <option value="success">Success</option>
                      <option value="warning">Warning</option>
                      <option value="danger">Danger</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="text-xs text-gray-500">Nội dung</label>
                  <textarea
                    className="w-full border rounded px-2 py-1 text-sm"
                    rows={3}
                    value={notifForm.message}
                    onChange={(e) =>
                      setNotifForm((f) => ({ ...f, message: e.target.value }))
                    }
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-xs text-gray-500">
                      Bắt đầu (tuỳ chọn)
                    </label>
                    <input
                      type="datetime-local"
                      className="w-full border rounded px-2 py-1 text-xs"
                      value={notifForm.startTime}
                      onChange={(e) =>
                        setNotifForm((f) => ({
                          ...f,
                          startTime: e.target.value,
                        }))
                      }
                    />
                  </div>
                  <div>
                    <label className="text-xs text-gray-500">
                      Kết thúc (tuỳ chọn)
                    </label>
                    <input
                      type="datetime-local"
                      className="w-full border rounded px-2 py-1 text-xs"
                      value={notifForm.endTime}
                      onChange={(e) =>
                        setNotifForm((f) => ({
                          ...f,
                          endTime: e.target.value,
                        }))
                      }
                    />
                  </div>
                </div>

                <div className="flex items-center justify-between text-xs text-gray-600 mt-1">
                  <div className="space-x-3">
                    <label className="inline-flex items-center space-x-1 cursor-pointer">
                      <input
                        type="checkbox"
                        className="rounded"
                        checked={notifForm.isActive}
                        onChange={(e) =>
                          setNotifForm((f) => ({
                            ...f,
                            isActive: e.target.checked,
                          }))
                        }
                      />
                      <span>Đang hoạt động</span>
                    </label>
                    <label className="inline-flex items-center space-x-1 cursor-pointer">
                      <input
                        type="checkbox"
                        className="rounded"
                        checked={notifForm.showOnDashboard}
                        onChange={(e) =>
                          setNotifForm((f) => ({
                            ...f,
                            showOnDashboard: e.target.checked,
                          }))
                        }
                      />
                      <span>Hiện trên Dashboard</span>
                    </label>
                  </div>

                  <div className="space-x-2">
                    <Button
                      type="button"
                      size="sm"
                      variant="secondary"
                      onClick={() => setNotifFormOpen(false)}
                    >
                      Hủy
                    </Button>
                    <Button
                      type="submit"
                      size="sm"
                      variant="primary"
                      disabled={notifSaving}
                    >
                      {notifSaving
                        ? 'Đang lưu...'
                        : notifForm.id
                        ? 'Cập nhật'
                        : 'Tạo mới'}
                    </Button>
                  </div>
                </div>
              </form>
            )}

            {/* List notifications */}
            <div className="space-y-3">
              {loading ? (
                <div className="text-gray-400 text-sm">
                  Đang tải thông báo...
                </div>
              ) : notifications.length === 0 ? (
                <div className="text-gray-400 text-sm">
                  Hiện chưa có thông báo nào
                </div>
              ) : (
                notifications.map((n) => {
                  const level = (n.level || 'info') as NotificationLevel;
                  const styles =
                    notificationLevelStyles[level] ||
                    notificationLevelStyles.info;

                  return (
                    <div
                      key={n.id}
                      className={`p-3 rounded-lg ${styles.container} flex items-start justify-between space-x-3`}
                    >
                      <div className="flex-1">
                        <div className={`font-medium text-sm ${styles.title}`}>
                          {n.title}
                        </div>
                        <div className={`text-xs mt-1 ${styles.message}`}>
                          {n.message}
                        </div>
                        <div className="text-[11px] text-gray-400 mt-1">
                          {formatTimeAgo(n.createdAt)}
                          {!n.isActive && (
                            <span className="ml-2 text-red-500 font-medium">
                              (Đã tắt)
                            </span>
                          )}
                        </div>
                      </div>

                      {isAdmin && (
                        <div className="flex flex-col items-end space-y-1 text-xs">
                          <button
                            className="text-blue-600 hover:underline"
                            type="button"
                            onClick={() => handleEditNotification(n)}
                          >
                            Sửa
                          </button>
                          <button
                            className="text-red-600 hover:underline"
                            type="button"
                            onClick={() => handleDeleteNotification(n.id)}
                          >
                            Xoá
                          </button>
                        </div>
                      )}
                    </div>
                  );
                })
              )}
            </div>
          </Card>
        </div>

        {/* Congress Schedule + CRUD */}
        <div className="mt-8">
          <Card>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-800 flex items-center">
                <i className="ri-calendar-line text-green-500 mr-2"></i>
                Chương trình Đại hội
              </h3>
              {isAdmin && (
                <Button
                  size="sm"
                  variant="primary"
                  onClick={handleNewSchedule}
                >
                  <i className="ri-add-line mr-1" />
                  Thêm
                </Button>
              )}
            </div>

            {/* Form CRUD Schedule */}
            {isAdmin && scheduleFormOpen && (
              <form
                onSubmit={handleSaveSchedule}
                className="mb-4 p-3 border border-dashed border-green-200 rounded-lg bg-green-50/40 space-y-2"
              >
                <div className="grid md:grid-cols-2 gap-2">
                  <div>
                    <label className="text-xs text-gray-500">Tiêu đề</label>
                    <input
                      className="w-full border rounded px-2 py-1 text-sm"
                      value={scheduleForm.title}
                      onChange={(e) =>
                        setScheduleForm((f) => ({
                          ...f,
                          title: e.target.value,
                        }))
                      }
                      required
                    />
                  </div>
                  <div>
                    <label className="text-xs text-gray-500">Địa điểm</label>
                    <input
                      className="w-full border rounded px-2 py-1 text-sm"
                      value={scheduleForm.location}
                      onChange={(e) =>
                        setScheduleForm((f) => ({
                          ...f,
                          location: e.target.value,
                        }))
                      }
                    />
                  </div>
                </div>

                <div>
                  <label className="text-xs text-gray-500">
                    Mô tả (tuỳ chọn)
                  </label>
                  <textarea
                    className="w-full border rounded px-2 py-1 text-sm"
                    rows={2}
                    value={scheduleForm.description}
                    onChange={(e) =>
                      setScheduleForm((f) => ({
                        ...f,
                        description: e.target.value,
                      }))
                    }
                  />
                </div>

                <div className="grid md:grid-cols-3 gap-2">
                  <div>
                    <label className="text-xs text-gray-500">Bắt đầu</label>
                    <input
                      type="datetime-local"
                      className="w-full border rounded px-2 py-1 text-xs"
                      value={scheduleForm.startTime}
                      onChange={(e) =>
                        setScheduleForm((f) => ({
                          ...f,
                          startTime: e.target.value,
                        }))
                      }
                      required
                    />
                  </div>
                  <div>
                    <label className="text-xs text-gray-500">
                      Kết thúc (tuỳ chọn)
                    </label>
                    <input
                      type="datetime-local"
                      className="w-full border rounded px-2 py-1 text-xs"
                      value={scheduleForm.endTime}
                      onChange={(e) =>
                        setScheduleForm((f) => ({
                          ...f,
                          endTime: e.target.value,
                        }))
                      }
                    />
                  </div>
                  <div>
                    <label className="text-xs text-gray-500">Màu</label>
                    <select
                      className="w-full border rounded px-2 py-1 text-sm"
                      value={scheduleForm.color}
                      onChange={(e) =>
                        setScheduleForm((f) => ({
                          ...f,
                          color: e.target.value,
                        }))
                      }
                    >
                      <option value="green">Xanh lá</option>
                      <option value="blue">Xanh dương</option>
                      <option value="gray">Xám</option>
                      <option value="orange">Cam</option>
                      <option value="red">Đỏ</option>
                    </select>
                  </div>
                </div>

                <div className="flex items-center justify-between text-xs text-gray-600 mt-1">
                  <div>
                    <label className="text-xs text-gray-500">
                      Thứ tự hiển thị
                    </label>
                    <input
                      type="number"
                      className="w-24 border rounded px-2 py-1 text-xs ml-2"
                      value={scheduleForm.orderIndex}
                      onChange={(e) =>
                        setScheduleForm((f) => ({
                          ...f,
                          orderIndex: Number(e.target.value) || 0,
                        }))
                      }
                    />
                  </div>

                  <div className="space-x-2">
                    <Button
                      type="button"
                      size="sm"
                      variant="secondary"
                      onClick={() => setScheduleFormOpen(false)}
                    >
                      Hủy
                    </Button>
                    <Button
                      type="submit"
                      size="sm"
                      variant="primary"
                      disabled={scheduleSaving}
                    >
                      {scheduleSaving
                        ? 'Đang lưu...'
                        : scheduleForm.id
                        ? 'Cập nhật'
                        : 'Tạo mới'}
                    </Button>
                  </div>
                </div>
              </form>
            )}

            <div className="space-y-4">
              {loading ? (
                <div className="text-gray-400 text-sm">
                  Đang tải chương trình...
                </div>
              ) : scheduleItems.length === 0 ? (
                <div className="text-gray-400 text-sm">
                  Chưa có chương trình nào được cấu hình
                </div>
              ) : (
                scheduleItems.map((item) => {
                  const colorKey = item.color || 'gray';
                  const styles =
                    scheduleColorMap[colorKey] || scheduleColorMap.gray;

                  return (
                    <div
                      key={item.id}
                      className={`flex items-center space-x-4 p-3 rounded-lg ${styles.container}`}
                    >
                      <div className="text-center min-w-[52px]">
                        <div className={`text-sm font-medium ${styles.time}`}>
                          {formatTime(item.startTime)}
                        </div>
                        <div className="text-xs text-gray-500">
                          {formatDateShort(item.startTime)}
                        </div>
                      </div>
                      <div className="flex-1">
                        <div className={`font-medium ${styles.time}`}>
                          {item.title}
                        </div>
                        {item.location && (
                          <div className="text-sm text-gray-600">
                            {item.location}
                          </div>
                        )}
                        {item.description && (
                          <div className="text-xs text-gray-500 mt-1">
                            {item.description}
                          </div>
                        )}
                      </div>
                      {isAdmin && (
                        <div className="flex flex-col items-end space-y-1 text-xs">
                          <button
                            className="text-blue-600 hover:underline"
                            type="button"
                            onClick={() => handleEditSchedule(item)}
                          >
                            Sửa
                          </button>
                          <button
                            className="text-red-600 hover:underline"
                            type="button"
                            onClick={() => handleDeleteSchedule(item.id)}
                          >
                            Xoá
                          </button>
                        </div>
                      )}
                      <div className={`w-3 h-3 rounded-full ${styles.dot}`} />
                    </div>
                  );
                })
              )}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;
