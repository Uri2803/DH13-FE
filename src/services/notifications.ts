import api from '../lib/api';

export type NotificationLevel = 'info' | 'success' | 'warning' | 'danger';

export interface NotificationItem {
  id: number;
  title: string;
  message: string;
  level: NotificationLevel;
  isActive: boolean;
  showOnDashboard: boolean;
  startTime: string | null;
  endTime: string | null;
  createdAt: string;
  updatedAt: string;
}

// Payload dùng cho create/update
export interface NotificationPayload {
  title: string;
  message: string;
  level?: NotificationLevel;
  isActive?: boolean;
  showOnDashboard?: boolean;
  startTime?: string | null; // ISO string hoặc null
  endTime?: string | null;   // ISO string hoặc null
}

// Lấy danh sách thông báo dành cho Dashboard
export const fetchDashboardNotifications = async () => {
  const res = await api.get<NotificationItem[]>('/notifications/dashboard');
  // vì api đã trả ra data trực tiếp
  return res || [];
};

/**
 * ========== CRUD CHO ADMIN ==========
 */

// Tạo mới thông báo
export const createNotification = async (
  payload: NotificationPayload,
) => {
  const res = await api.post<NotificationItem>('/notifications', payload);
  return res; // KHÔNG dùng res.data
};

// Cập nhật thông báo
export const updateNotification = async (
  id: number,
  payload: NotificationPayload,
) => {
  const res = await api.patch<NotificationItem>(
    `/notifications/${id}`,
    payload,
  );
  return res; // KHÔNG dùng res.data
};

// Xoá thông báo
export const deleteNotification = async (id: number): Promise<void> => {
  await api.delete(`/notifications/${id}`);
};
