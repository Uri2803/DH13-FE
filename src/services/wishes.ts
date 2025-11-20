// src/services/wishes.ts
import api from '../lib/api';

// 1. Định nghĩa kiểu dữ liệu (Types)
export type Wish = {
  id: number;
  senderName: string;
  senderPosition?: string | null;
  senderAvatar?: string | null; // [MỚI] Thêm trường avatar
  content: string;
  isDelegate: boolean;
  isVerified: boolean;
  priority: '1' | '2' | '3';
  createdAt: string;
  updatedAt: string;
};

export type CreateWishPayload = {
  senderName: string;
  senderPosition?: string;
  senderAvatar?: string;        // [MỚI] Cho phép gửi avatar lên
  content: string;
  isDelegate?: boolean;
};

export type UpdateWishPayload = Partial<{
  senderName: string;
  senderPosition: string | null;
  senderAvatar: string | null;
  content: string;
  isDelegate: boolean;
  isVerified: boolean;
  priority: '1' | '2' | '3';
}>;

// 2. Các hàm API

/**
 * Lấy danh sách lời chúc
 */
export async function fetchWishes(options?: { onlyVerified?: boolean }): Promise<Wish[]> {
  try {
    // Sử dụng any để linh hoạt xử lý response từ interceptor
    const res: any = await api.get('/wishes', {
      params: { onlyVerified: options?.onlyVerified },
    });

    // Kiểm tra xem kết quả trả về có phải mảng không (Case Interceptor trả về data trực tiếp)
    if (Array.isArray(res)) return res;

    // Kiểm tra trường hợp Axios chuẩn (data nằm trong res.data)
    if (res?.data && Array.isArray(res.data)) return res.data;

    // Nếu backend bọc trong object kiểu { data: [...] }
    if (res?.data?.data && Array.isArray(res.data.data)) return res.data.data;

    return []; // Trả về mảng rỗng nếu không đúng định dạng để tránh crash app
  } catch (error) {
    console.error("Lỗi fetchWishes:", error);
    return [];
  }
}

/**
 * Tạo lời chúc mới
 */
export async function createWish(payload: CreateWishPayload): Promise<Wish> {
  try {
    const res: any = await api.post('/wishes', payload);
    
    // LOG ĐỂ DEBUG: Xem server thực sự trả về cái gì
    console.log("Create Wish Response:", res);

    // TRƯỜNG HỢP 1: Interceptor đã xử lý, res chính là object Wish
    if (res && (res.id || res.senderName)) return res;

    // TRƯỜNG HỢP 2: Axios chuẩn, dữ liệu nằm trong .data
    if (res?.data) return res.data;

    // TRƯỜNG HỢP 3: Server tạo thành công (200/201) nhưng body rỗng hoặc không đúng chuẩn
    // Ta tự tạo object giả lập để frontend hiển thị ngay (Optimistic UI)
    console.warn("Server không trả về body chuẩn, tạo object tạm thời.");
    return {
       ...payload,
       id: Date.now(), // ID tạm
       senderAvatar: payload.senderAvatar || null,
       isVerified: false,
       priority: '3',
       createdAt: new Date().toISOString(),
       updatedAt: new Date().toISOString(),
       isDelegate: !!payload.isDelegate
    } as Wish;

  } catch (error) {
    throw error;
  }
}

/**
 * Cập nhật lời chúc (Dành cho Admin duyệt bài hoặc sửa nội dung)
 */
export async function updateWish(
  id: number,
  payload: UpdateWishPayload,
): Promise<Wish> {
  const res: any = await api.patch(`/wishes/${id}`, payload);
  // Xử lý tương tự: lấy data trực tiếp hoặc qua .data
  return res.data || res; 
}

export async function deleteWish(id: number): Promise<void> {
  await api.delete(`/wishes/${id}`);
}