// src/services/delegates.ts
import api from "../lib/api";

export type DelegateRow = {
  id: number | string;
  delegateCode: string;
  fullName: string;
  unit: string;
  gender?: string;
  partyMember?: boolean;
  checkedIn?: boolean;
  checkinTime?: string | null;
  birthDate?: string;          // yyyy-MM-dd | ISO
  studentId?: string;  
  ava?: string | null; 
};

const toRow = (u: any): DelegateRow | null => {
  const di = u?.delegateInfo ?? {};
  if (!di?.id) return null; // cần có delegateInfo
  return {
    id: di.id, // CHỐT: id này = delegate_info.id để bắt realtime
    delegateCode: di.code ?? u?.code ?? '',
    fullName: u?.name ?? u?.fullName ?? '',
    unit: u?.department?.name ?? '',
    gender: di?.gender ?? '',
    partyMember: !!di?.isPartyMember,
    checkedIn: !!di?.checkedIn,
    checkinTime: di?.checkinTime ?? null,
    birthDate: di?.dateOfBirth ?? null,
    studentId: di?.mssv_or_mscb ?? u?.mssv ?? '',
    ava: u?.ava ?? null,  
  };
};


/** ADMIN: lấy tất cả đại biểu */
export async function fetchDelegatesAll(): Promise<DelegateRow[]> {
  const res = await api.get('/user/delegates'); 
  const arr = Array.isArray(res) ? res : res?.data ?? [];
  return arr.map(toRow).filter(Boolean)
}

/** PHÒNG/KHOA: lấy đại biểu theo departmentId */
export async function fetchDelegatesByDepartment(deptId: number): Promise<DelegateRow[]> {
  const res = await api.get(`/user/department/${deptId}`);
  const arr = Array.isArray(res) ? res : res?.data ?? [];
  return arr
    .filter((u: any) => u?.role === 'delegate') // đề phòng api trả cả user khác
    .map(toRow).filter(Boolean) as DelegateRow[];
}


export async function fetchDelegateById(id: number): Promise<any> {
  const res = await api.get(`/user/delegates/${id}`);
  return res;
}