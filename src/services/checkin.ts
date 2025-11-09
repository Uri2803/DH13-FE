import api from "../lib/api";

export async function checkinByQr(token: string) {
  return api.post('/checkin/qr', { token }, { withCredentials: true }) as Promise<{
    ok: boolean;
    delegate: {
      id: number;
      code: string;
      fullName: string;
      unit?: string;
      position?: string;
      checkedIn: boolean;
      checkinTime: string;
    }
  }>;
}

export async function checkinManual(delegateInfoId: number) {
  return api.post(`/checkin/${delegateInfoId}`, {}, { withCredentials: true });
}
