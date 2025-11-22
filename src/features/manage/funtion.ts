import * as XLSX from 'xlsx';
import {
  DelegateRow,
  fetchDelegatesAll,
  fetchDelegatesByDepartment,
  createDelegate,
  updateDelegate,
  deleteDelegate,
  CreateDelegatePayload,
} from '../../services/delegates';
export const toStr = (v: unknown): string => {
  if (v === null || v === undefined) return '';
  return String(v).trim();
};

export const parseBoolPartyMember = (x: unknown): 0 | 1 => {
  const s = toStr(x).trim().toLowerCase();
  if (!s) return 0;

  if (s === 'x') return 1;
  if (['co', 'có', 'yes', '1', 'true'].includes(s)) return 1;

  return 0;
};

 export const safeFloat = (x: unknown): number | undefined => {
  const s = toStr(x).replace(',', '.');
  if (!s) return undefined;
  const n = Number(s);
  if (Number.isNaN(n)) return undefined;
  return n;
};


export const parseDateToYYYYMMDD = (val: unknown): string | undefined => {
  if (val === null || val === undefined || val === '') return undefined;
  if (typeof val === 'number') {
    const parsed = (XLSX.SSF as any).parse_date_code(val);
    if (!parsed) return undefined;

    const y = parsed.y;
    const m = String(parsed.m).padStart(2, '0');
    const d = String(parsed.d).padStart(2, '0');
    return `${y}-${m}-${d}`;
  }

  // 2. JS Date object
  if (val instanceof Date) {
    const y = val.getFullYear();
    const m = String(val.getMonth() + 1).padStart(2, '0');
    const d = String(val.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
  }

  // 3. String (dd/MM/yyyy, dd/MM/yy, yyyy-MM-dd, ...)
  const s = String(val).trim();
  if (!s) return undefined;

  // dd/MM/yyyy hoặc dd-MM-yyyy
  let m = s.match(/^(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{4})$/);
  if (m) {
    const d = m[1].padStart(2, '0');
    const mo = m[2].padStart(2, '0');
    const y = m[3];
    return `${y}-${mo}-${d}`;
  }

  // dd/MM/yy hoặc dd-MM-yy
  m = s.match(/^(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{2})$/);
  if (m) {
    const d = m[1].padStart(2, '0');
    const mo = m[2].padStart(2, '0');
    const yy = parseInt(m[3], 10);
    const fullYear = yy <= 29 ? 2000 + yy : 1900 + yy;
    return `${fullYear}-${mo}-${d}`;
  }

  // yyyy-MM-dd
  m = s.match(/^(\d{4})-(\d{1,2})-(\d{1,2})$/);
  if (m) {
    const y = m[1];
    const mo = m[2].padStart(2, '0');
    const d = m[3].padStart(2, '0');
    return `${y}-${mo}-${d}`;
  }

  // 4. fallback: để JS tự parse string
  const dt = new Date(s);
  if (Number.isNaN(dt.getTime())) return undefined;
  const y = dt.getFullYear();
  const mo = String(dt.getMonth() + 1).padStart(2, '0');
  const d = String(dt.getDate()).padStart(2, '0');
  return `${y}-${mo}-${d}`;
};



export const mapGender = (x: unknown): string | undefined => {
  const s = toStr(x);
  if (!s) return undefined;
  const lower = s.toLowerCase();

  if (s === '1') return 'Nam';
  if (s === '0') return 'Nữ';

  if (lower === 'nam' || lower === 'm' || lower === 'male') return 'Nam';
  if (lower === 'nữ' || lower === 'nu' || lower === 'f' || lower === 'female')
    return 'Nữ';

  return 'Khác';
};

export const normalizeShirtSize = (
  raw: unknown,
): 'XS' | 'S' | 'M' | 'L' | 'XL' | 'XXL' | '2XL' |'3XL'| '4XL' | '5XL' |undefined => {
  const s = toStr(raw).toUpperCase();
  if (!s) return undefined;
  const allowed = ['XS', 'S', 'M', 'L', 'XL', 'XXL', '2XL', '3XL', '4XL', '5XL'] as const;
  return allowed.includes(s as any) ? (s as any) : undefined;
};

export const buildPasswordFromDob = (val: unknown): string | undefined => {
  
  const iso = parseDateToYYYYMMDD(val);
  if (!iso) return undefined;
  const [y, m, d] = iso.split('-');
  console.log(val, d,m,y)
  return `${d}${m}${y}`; 
};


export const mapExcelRowToPayload = (
  row: any,
  fallbackDeptCode?: string,
): CreateDelegatePayload | null => {
  const fullName = toStr(
    row['HỌ VÀ TÊN'] ??
      row['Ho ten'] ??
      row['Họ tên'] ??
      row['FULLNAME'] ??
      '',
  );
  const email = toStr(row['Email'] ?? row['EMAIL'] ?? '');

  if (!fullName || !email) return null;

  const ma_db = toStr(
    row['MÃ ĐẠI BIỂU'] ?? row['Ma dai bieu'] ?? row['MÃ DB'] ?? '',
  );
  const mssv = toStr(
    row['MSSV'] ?? row['MSSV'] ?? '',
  );

  const deptCodeFromRow = toStr(
    row['MÃ ĐƠN VỊ'] ?? row['Ma don vi'] ?? row['DEPARTMENT_CODE'] ?? '',
  );
  const departmentCode = deptCodeFromRow || fallbackDeptCode || '';
  if (!departmentCode) {
    return null;
  }

  const dobRaw = row['NTNS'] ?? row['Ngày sinh'] ?? row['Ngay sinh'];
  const dateOfBirth = parseDateToYYYYMMDD(dobRaw); // yyyy-MM-dd (gửi lên BE để lưu DB)
  const password = buildPasswordFromDob(dobRaw); // ddMMyy (6 số) làm pass mặc định

  const genderRaw = row['GIỚI TÍNH'] ?? row['Gioi tinh'];
  const gender = mapGender(genderRaw);

  const joinAssociationDate = parseDateToYYYYMMDD(
    row['NGÀY VÀO HỘI'] ?? row['Ngay vao hoi'],
  );
  const joinUnionDate = parseDateToYYYYMMDD(
    row['NGÀY VÀO ĐOÀN'] ?? row['Ngay vao doan'],
  );

  const isPartyMember = parseBoolPartyMember(
    row['ĐẢNG VIÊN'] ?? row['Dang vien'],
  ); // 0 | 1

  const studentYear = safeFloat(row['LÀ SINH VIÊN NĂM'] ?? row['Nam hoc']);
  const academicScore = safeFloat(
    row['ĐIỂM HỌC TẬP'] ?? row['Diem hoc tap'],
  );
  const achievements = toStr(
    row['THÀNH TÍCH'] ?? row['Thanh tich'],
  );
  const shirtSize = normalizeShirtSize(
    row['SIZE ÁO SƠ MI'] ?? row['Size ao so mi'],
  );
  const phone = toStr(
    row['Số điện thoại'] ??
      row['So dien thoai'] ??
      row['Điện thoại'] ??
      row['Dien thoai'],
  );

  const position = toStr(row['CHỨC VỤ'] ?? row['Chuc vu']);

  // Tôn giáo / dân tộc mặc định nếu trống
  const religionRaw = toStr(row['TÔN GIÁO'] ?? row['Ton giao']);
  const ethnicityRaw = toStr(row['DÂN TỘC'] ?? row['Dan toc']);

  const religion = religionRaw || 'Không tôn giáo';
  const ethnicity = ethnicityRaw || 'Không';

  const dto: CreateDelegatePayload = {
    email,
    emailContact: email,
    name: fullName,
    departmentCode,
    mssv: mssv || undefined,
    code: ma_db || undefined,
    delegateCode: ma_db || undefined,
    position: position || undefined,
    mssv_or_mscb: mssv || undefined,
    dateOfBirth: dateOfBirth || undefined,
    gender,
    religion,
    ethnicity,
    joinUnionDate: joinUnionDate || undefined,
    joinAssociationDate: joinAssociationDate || undefined,

    // gửi 0/1 sang BE
    isPartyMember,

    studentYear: studentYear !== undefined ? Math.round(studentYear) : undefined,
    academicScore: academicScore ?? undefined,
    achievements: achievements || undefined,
    shirtSize,
    phone: phone || undefined,
    password: password || undefined, // pass mặc định ddMMyy
  };

  return dto;
};


 export const normalizeString = (s: string) =>
  s
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // bỏ dấu
    .toLowerCase();

export const findAvatarFileForRow = (row: any, files: File[]): File | undefined => {
  if (!files.length) return undefined;

  const ma_db = toStr(
    row['MÃ ĐẠI BIỂU'] ?? row['Ma dai bieu'] ?? row['MÃ DB'] ?? '',
  );
  const ho_ten = toStr(
    row['HỌ VÀ TÊN'] ??
      row['Ho ten'] ??
      row['Họ tên'] ??
      row['FULLNAME'] ??
      '',
  );

  if (!ma_db && !ho_ten) return undefined;

  const bases: string[] = [];
  if (ma_db) {
    bases.push(ma_db); // ĐN_01
    if (ho_ten) {
      bases.push(`${ma_db}_${ho_ten}`);
      bases.push(`${ma_db}_${ho_ten.replace(/\s+/g, '_')}`);
    }
  } else if (ho_ten) {
    bases.push(ho_ten);
    bases.push(ho_ten.replace(/\s+/g, '_'));
  }

  const normalizedBases = bases.map((b) => normalizeString(b));

  for (const file of files) {
    const lowerName = file.name.toLowerCase();
    const nameNoExt = lowerName.replace(/\.[^/.]+$/, '');
    const normalizedName = normalizeString(nameNoExt);

    const hit = normalizedBases.some((base) =>
      normalizedName.includes(normalizeString(base)),
    );

    if (hit) {
      return file;
    }
  }

  return undefined;
};


