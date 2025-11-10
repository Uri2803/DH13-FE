import api from "../lib/api";

// export async function checkinByQr(token: string) {
//   return api.post('/checkin/qr', { token }, { withCredentials: true }) as Promise<{
//     ok: boolean;
//     delegate: {
//       id: number;
//       code: string;
//       fullName: string;
//       unit?: string;
//       position?: string;
//       checkedIn: boolean;
//       checkinTime: string;
//     }
//   }>;
// }

type CheckinResponse = {
  ok: boolean;
  delegate?: {
    id: number;
    fullName: string;
    position: string;
    unit: string;
    code: string;
    checkinTime?: string;
    checkedIn?: boolean;
  };
  message?: string;
};


export async function checkinManual(delegateInfoId: number): Promise<any> {
   const data  = await api.post(`/checkin/${delegateInfoId}`, {});
   return data;
}

export async function fetchDelegates(): Promise<any[]> {
  const { data } = await api.get<any[]>('/user/delegates', { withCredentials: true });
  return Array.isArray(data) ? data : [];
}

export async function checkinByQr(raw: string): Promise<any>{
  const data = await api.post<CheckinResponse>('/checkin/qr', { token: raw });
  return data
}