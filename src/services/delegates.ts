// src/services/delegates.ts
import api from '../lib/api';

export type DelegateRow = {
  id: number | string;
  delegateCode: string;
  fullName: string;
  unit: string;

  gender?: string;
  partyMember?: boolean;
  checkedIn?: boolean;
  checkinTime?: string | null;

  birthDate?: string | null;          // yyyy-MM-dd | ISO string
  studentId?: string;
  ava?: string | null;

  phone?: string | null;
  email?: string | null;
  position?: string | null;
  achievements?: string | null;

  // ===== các field nâng cao từ delegateInfo =====
  religion?: string | null;
  ethnicity?: string | null;
  joinUnionDate?: string | null;
  joinAssociationDate?: string | null;
  studentYear?: number | null;
  academicScore?: number | null;
  shirtSize?: string | null;
};


const toRow = (u: any): DelegateRow | null => {
  const di = u?.delegateInfo ?? {};
  if (!di?.id) return null; // cần có delegateInfo

  return {
    id: di.id, // id = delegate_info.id để bắt realtime
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
    phone: di?.phone ?? null,
    email: di?.email ?? u?.email ?? null,
    position: di?.position ?? null,
    achievements: di?.achievements ?? null,

    // ===== bổ sung các field nâng cao =====
    religion: di?.religion ?? null,
    ethnicity: di?.ethnicity ?? null,
    joinUnionDate: di?.joinUnionDate ?? null,
    joinAssociationDate: di?.joinAssociationDate ?? null,
    studentYear:
      di?.studentYear !== undefined && di?.studentYear !== null
        ? Number(di.studentYear)
        : null,
    academicScore:
      di?.academicScore !== undefined && di?.academicScore !== null
        ? Number(di.academicScore)
        : null,
    shirtSize: di?.shirtSize ?? null,
  };
};


/** ADMIN: lấy tất cả đại biểu */
export async function fetchDelegatesAll(): Promise<DelegateRow[]> {
  const res = await api.get('/user/delegates');
  const arr = Array.isArray(res) ? res : (res as any)?.data ?? [];
  return arr.map(toRow).filter(Boolean) as DelegateRow[];
}

/** PHÒNG/KHOA: lấy đại biểu theo departmentId */
export async function fetchDelegatesByDepartment(
  deptId: number,
): Promise<DelegateRow[]> {
  const res = await api.get(`/user/department/${deptId}`);
  const arr = Array.isArray(res) ? res : (res as any)?.data ?? [];
  return arr
    .filter((u: any) => u?.role === 'delegate')
    .map(toRow)
    .filter(Boolean) as DelegateRow[];
}

export async function fetchDelegateById(
  id: number | string,
): Promise<any> {
  return api.get(`/user/delegates/${id}`);
}

// ===== Payload tạo / sửa delegate (form-data text fields) =====
export type CreateDelegatePayload = {
  email: string;
  name: string;
  departmentCode: string;

  emailContact?: string;

  mssv?: string;
  code?: string;
  delegateCode?: string;
  position?: string;
  mssv_or_mscb?: string;

  dateOfBirth?: string; // yyyy-MM-dd
  gender?: string;
  religion?: string;
  ethnicity?: string;

  joinUnionDate?: string;
  joinAssociationDate?: string;

  isPartyMember?: 0|1;
  studentYear?: number;
  academicScore?: number;
  achievements?: string;
  shirtSize?: 'XS' | 'S' | 'M' | 'L' | 'XL' | 'XXL' | '2XL' |'3XL'| '4XL' | '5XL';

  phone?: string;
  password?: string;
};

function buildFormData(
  payload: Partial<CreateDelegatePayload>,
  avatarFile?: File,
): FormData {
  const form = new FormData();
  Object.entries(payload).forEach(([key, value]) => {
    if (value === undefined || value === null) return;
    form.append(key, String(value));
  });
  if (avatarFile) {
    form.append('avatar', avatarFile);
  }
  return form;
}

export async function createDelegate(
  payload: CreateDelegatePayload,
  avatarFile?: File,
): Promise<DelegateRow> {
  const form = buildFormData(payload, avatarFile);
  const res = await api.post('/user/admin/delegates', form);
  const data = (res as any)?.data ?? res;
  return toRow(data) as DelegateRow;
}

export async function updateDelegate(
  id: number | string,
  payload: Partial<CreateDelegatePayload>,
  avatarFile?: File,
): Promise<DelegateRow> {
  const form = buildFormData(payload, avatarFile);
  const res = await api.patch(`/user/admin/delegates/${id}`, form);
  const data = (res as any)?.data ?? res;
  return toRow(data) as DelegateRow;
}

export async function deleteDelegate(id: number | string): Promise<void> {
  await api.delete(`/user/admin/delegates/${id}`);
}
