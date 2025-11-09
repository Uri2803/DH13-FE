// src/utils/socket.ts
import { io, Socket } from 'socket.io-client';

let socket: Socket | null = null;

export function getSocket(): Socket {
  if (!socket) {
    const base = (import.meta as any).env?.VITE_API_URL ?? 'http://localhost:3000';
    // dùng namespace /realtime giống Gateway
    socket = io(`${base.replace(/\/+$/, '')}/realtime`, {
      transports: ['websocket'],
      withCredentials: true, // để gửi cookie Authentication
      // auth: { token: '...'} // nếu bạn muốn kèm token tay
    });
  }
  return socket;
}

export function disconnectSocket() {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
}
