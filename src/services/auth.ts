import api from "../lib/api";
import type { ApiUser, LoginResponseBody } from "../types/api";


export async function loginApi(userCode: string, password: string): Promise<LoginResponseBody> {
  // Gợi ý endpoint: POST /auth/login
  return api.post("/user/login", { userCode, password });
}

// Lấy user từ cookie HttpOnly sau khi login
export async function getInfor(): Promise<ApiUser> {
  return api.get(`/user`);
}

export async function logoutApi(): Promise<void> {
  await api.post("/user/logout");
}

export async function updateInfor(payload:any):Promise<void>{
  return api.put('user',payload)
}

export async function changePassword(payload: {
  currentPassword: string;
  newPassword: string;
}) {
  const res = await api.put('/user/me/password', payload);
  return res.data;
}

export async function uploadAvatar(file: File) {
  const formData = new FormData();
  formData.append('avatar', file);

  const res = await api.put('/user/me/avatar', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });

  return res.data;
}