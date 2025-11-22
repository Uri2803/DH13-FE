import api from '../lib/api';

// Nếu bạn muốn fix cứng màu:
export type ScheduleColor = 'green' | 'blue' | 'gray' | 'orange' | 'red' | string;

export interface CongressScheduleItem {
  id: number;
  title: string;
  description: string | null;
  location: string | null;
  startTime: string;     // ISO string từ BE
  endTime: string | null;
  color: ScheduleColor | null;
  orderIndex: number;
  createdAt: string;
  updatedAt: string;
}

// Payload dùng cho create/update
export interface CongressSchedulePayload {
  title: string;
  description?: string | null;
  location?: string | null;
  startTime: string;          // ISO string
  endTime?: string | null;    // ISO string hoặc null
  color?: ScheduleColor | null;
  orderIndex?: number;
}

/**
 * Lấy danh sách chương trình dùng cho Dashboard
 * GET /congress-schedule/dashboard
 */
export const fetchDashboardSchedule = async () => {
  const res = await api.get(
    '/congress-schedule/dashboard',
  );
  return res || [];
};

export const fetchAllScheduleItems = async () => {
  const res = await api.get<CongressScheduleItem[]>('/congress-schedule');
  return res || [];
};

export const fetchScheduleItem = async (id: number) => {
  const res = await api.get<CongressScheduleItem>(`/congress-schedule/${id}`);
  return res;
};

// Tạo mới
export const createScheduleItem = async (
  payload: CongressSchedulePayload,
) =>{
  const res = await api.post<CongressScheduleItem>(
    '/congress-schedule',
    payload,
  );
  return res;
};

// Cập nhật
export const updateScheduleItem = async (
  id: number,
  payload: CongressSchedulePayload,
) => {
  const res = await api.patch<CongressScheduleItem>(
    `/congress-schedule/${id}`,
    payload,
  );
  return res;
};

// Xoá
export const deleteScheduleItem = async (id: number): Promise<void> => {
  await api.delete(`/congress-schedule/${id}`);
};
