// Kiểu dữ liệu trả về từ BE
export interface ApiDepartment {
  id: number;
  code: string;
  name: string;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
}

export type ApiRole = 'admin' | 'department' | 'delegate';

export interface ApiUser {
  id: number;
  code: string;         // ví dụ "SV001"
  email: string;
  name: string;         // Họ tên
  mssv?: string | null;
  ava?: string | null;
  role: ApiRole;
  hasContactInfo: boolean;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
  department?: ApiDepartment;
}

export interface LoginResponseBody {
  user?: ApiUser;      
  accessToken?: string; 
}
