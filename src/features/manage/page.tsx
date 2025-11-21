// src/features/manage/page.tsx
import React, { useEffect, useRef, useState } from 'react';
import * as XLSX from 'xlsx';
import { Navigation } from '../../components/feature/Navigation';
import { Card } from '../../components/base/Card';
import { Button } from '../../components/base/Button';
import { useAuth } from '../../hooks/useAuth';
import {toStr,parseBoolPartyMember, safeFloat } from './funtion';
import {
  DelegateRow,
  fetchDelegatesAll,
  fetchDelegatesByDepartment,
  createDelegate,
  updateDelegate,
  deleteDelegate,
  CreateDelegatePayload,
} from '../../services/delegates';

// Mở rộng Delegate local, không đụng DelegateRow gốc
type Delegate = DelegateRow & {
  achievements?: string;
  phone?: string;
  email?: string;
  position?: string;
};

// ===== helper dùng lại logic Python + fix =====

// ĐẢNG VIÊN: trả 0 / 1 giống Python


// parse Excel date -> yyyy-MM-dd (support số serial, Date, string dd/MM/yy...)
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


// dùng để build mật khẩu mặc định ddMMyy từ ngày sinh
const buildPasswordFromDob = (val: unknown): string | undefined => {
  
  const iso = parseDateToYYYYMMDD(val);
  if (!iso) return undefined;
  const [y, m, d] = iso.split('-');
  console.log(val, d,m,y)
  return `${d}${m}${y}`; // ddMMyy (6 số)
};

// map giới tính: 1 = Nam, 0 = Nữ, còn lại Nam/Nữ/Khác
const mapGender = (x: unknown): string | undefined => {
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

const normalizeShirtSize = (
  raw: unknown,
): 'XS' | 'S' | 'M' | 'L' | 'XL' | 'XXL' | '2XL' |'3XL'| '4XL' | '5XL' |undefined => {
  const s = toStr(raw).toUpperCase();
  if (!s) return undefined;
  const allowed = ['XS', 'S', 'M', 'L', 'XL', 'XXL', '2XL', '3XL', '4XL', '5XL'] as const;
  return allowed.includes(s as any) ? (s as any) : undefined;
};

// ===== tìm avatar File giống Python (IMAGE_DIR) nhưng ở browser =====
const normalizeString = (s: string) =>
  s
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // bỏ dấu
    .toLowerCase();

const findAvatarFileForRow = (row: any, files: File[]): File | undefined => {
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

// map 1 row Excel -> CreateDelegatePayload
const mapExcelRowToPayload = (
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
    // Không biết khoa nào -> bỏ qua dòng này
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

const ManagePage: React.FC = () => {
  const { user } = useAuth();
  const [delegates, setDelegates] = useState<Delegate[]>([]);
  const [selectedDelegate, setSelectedDelegate] = useState<Delegate | null>(
    null,
  );
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingDelegate, setEditingDelegate] = useState<Delegate | null>(null);
  const [isCreating, setIsCreating] = useState(false);

  const [searchTerm, setSearchTerm] = useState('');
  const [filterUnit, setFilterUnit] = useState('all');

  const excelInputRef = useRef<HTMLInputElement | null>(null);
  const avatarDirInputRef = useRef<HTMLInputElement | null>(null);

  const [excelImporting, setExcelImporting] = useState(false);
  const [sheetName, setSheetName] = useState<string>(''); // giống SHEET_NAME bên Python
  const [avatarFiles, setAvatarFiles] = useState<File[]>([]); // giống IMAGE_DIR bên Python

  // MÃ ĐƠN VỊ mặc định khi import (cho admin)
  const [defaultDeptCode, setDefaultDeptCode] = useState<string>('');

  const [editingAvatarFile, setEditingAvatarFile] =
    useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);

  // ===== load delegates từ BE =====
  useEffect(() => {
    if (!user) return;

    const load = async () => {
      try {
        let list: DelegateRow[] = [];
        if (user.role === 'admin') {
          list = await fetchDelegatesAll();
        } else if (user.role === 'department' && user.department?.id) {
          list = await fetchDelegatesByDepartment(user.department.id);
        }
        setDelegates(list as Delegate[]);
      } catch (err) {
        console.error('Load delegates error', err);
      }
    };

    void load();
  }, [user]);

  const units = [
    ...new Set(delegates.map((d) => d.unit).filter(Boolean)),
  ] as string[];

  const getFilteredDelegates = () => {
    let filtered = delegates;

    if (user?.role === 'department') {
      const deptName = user.department?.name;
      filtered = filtered.filter(
        (d) => d.unit === deptName || d.unit === user.code,
      );
    }

    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(
        (d) =>
          d.fullName?.toLowerCase().includes(term) ||
          d.delegateCode?.toLowerCase().includes(term) ||
          d.studentId?.includes(searchTerm),
      );
    }

    if (filterUnit !== 'all') {
      filtered = filtered.filter((d) => d.unit === filterUnit);
    }

    return filtered;
  };

  const filteredDelegates = getFilteredDelegates();

  // ========== CRUD ==========
  const openCreateModal = () => {
    setIsCreating(true);
    setEditingDelegate({
      id: '',
      delegateCode: '',
      fullName: '',
      unit:
        user?.role === 'department'
          ? user.department?.name || user.code || ''
          : '',
      gender: '',
      partyMember: false,
      checkedIn: false,
      checkinTime: null,
      birthDate: '',
      studentId: '',
      ava: null,
      achievements: '',
      phone: '',
      email: '',
      position: '',
    });
    setAvatarPreview(null);
    setEditingAvatarFile(null);
    setShowEditModal(true);
  };

  const handleEditDelegate = (delegate: Delegate) => {
    setIsCreating(false);
    setEditingDelegate({ ...delegate });
    setAvatarPreview(delegate.ava ?? null);
    setEditingAvatarFile(null);
    setShowEditModal(true);
  };

  const handleDeleteDelegate = async (delegate: Delegate) => {
    if (!delegate.id) return;
    if (
      !window.confirm(
        `Bạn có chắc chắn muốn xoá đại biểu "${delegate.fullName}"?`,
      )
    )
      return;

    try {
      await deleteDelegate(delegate.id);
      setDelegates((prev) => prev.filter((d) => d.id !== delegate.id));
    } catch (err) {
      console.error(err);
      alert('Xoá thất bại, kiểm tra lại API.');
    }
  };

  const handleSaveDelegate = async () => {
    if (!editingDelegate) return;
    if (!editingDelegate.fullName || !editingDelegate.fullName.trim()) {
      alert('Họ tên không được để trống');
      return;
    }

    const deptCodeFromUser =
      user?.department?.code || user?.code || undefined;

    const payloadBase: Partial<CreateDelegatePayload> = {
      name: editingDelegate.fullName,
      email: editingDelegate.email ?? undefined,
      emailContact: editingDelegate.email ?? undefined,
      mssv: editingDelegate.studentId ?? undefined,
      mssv_or_mscb: editingDelegate.studentId ?? undefined,
      delegateCode: editingDelegate.delegateCode ?? undefined,
      code: editingDelegate.delegateCode ?? undefined,
      position: editingDelegate.position ?? undefined,
      phone: editingDelegate.phone ?? undefined,
      achievements: editingDelegate.achievements ?? undefined,
      gender: editingDelegate.gender ?? undefined,
      // nếu sau này cần cho chỉnh sửa Đảng viên, có thể map bool -> 0/1 ở đây
    };

    try {
      if (isCreating || !editingDelegate.id) {
        if (!deptCodeFromUser) {
          alert('Không xác định được mã khoa (departmentCode) để tạo đại biểu.');
          return;
        }

        const createPayload: CreateDelegatePayload = {
          email: editingDelegate.email || '',
          name: editingDelegate.fullName,
          departmentCode: deptCodeFromUser,
          ...payloadBase,
        };

        const created = await createDelegate(
          createPayload,
          editingAvatarFile ?? undefined,
        );
        setDelegates((prev) => [...prev, created as Delegate]);
      } else {
        const updatePayload: Partial<CreateDelegatePayload> = {
          ...payloadBase,
        };

        const updated = await updateDelegate(
          editingDelegate.id,
          updatePayload,
          editingAvatarFile ?? undefined,
        );
        setDelegates((prev) =>
          prev.map((d) =>
            d.id === updated.id ? (updated as Delegate) : d,
          ),
        );
      }

      setShowEditModal(false);
      setEditingDelegate(null);
      setIsCreating(false);
      setAvatarPreview(null);
      setEditingAvatarFile(null);
    } catch (err) {
      console.error(err);
      alert('Lưu thất bại, kiểm tra lại API hoặc dữ liệu.');
    }
  };

  const handleInputChange = (field: keyof Delegate, value: unknown) => {
    setEditingDelegate(
      (prev) => ({ ...(prev || {}), [field]: value } as Delegate),
    );
  };

  // ========== Avatar ==========
  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setEditingAvatarFile(file);

    const reader = new FileReader();
    reader.onloadend = () => {
      setAvatarPreview(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  // ========== Import Excel ==========
  const triggerExcelInput = () => {
    excelInputRef.current?.click();
  };

  const triggerAvatarDirInput = () => {
    avatarDirInputRef.current?.click();
  };

  const handleAvatarFolderChange = (
    e: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const files = e.target.files;
    if (!files) return;
    setAvatarFiles(Array.from(files));
    alert(`Đã chọn ${files.length} file ảnh avatar từ thư mục.`);
  };

  const handleImportExcel = async (
    e: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setExcelImporting(true);
      const data = await file.arrayBuffer();
      const workbook = XLSX.read(data);

      // chọn sheet giống SHEET_NAME bên Python
      const desiredSheet = sheetName.trim();
      let sheetNameToUse: string;

      if (desiredSheet && workbook.SheetNames.includes(desiredSheet)) {
        sheetNameToUse = desiredSheet;
      } else if (desiredSheet) {
        sheetNameToUse = workbook.SheetNames[0];
        alert(
          `Không tìm thấy sheet "${desiredSheet}", đang dùng sheet đầu tiên: "${sheetNameToUse}"`,
        );
      } else {
        sheetNameToUse = workbook.SheetNames[0];
      }

      const worksheet = workbook.Sheets[sheetNameToUse];
      if (!worksheet) {
        alert(`Không đọc được sheet "${sheetNameToUse}" trong file Excel.`);
        return;
      }

      const rows = XLSX.utils.sheet_to_json(worksheet) as any[];

      const fallbackDeptCode =
        user?.role === 'department'
          ? user.department?.code || user.code || undefined
          : defaultDeptCode || undefined; // admin nhập tay

      let success = 0;
      let fail = 0;
      const createdList: Delegate[] = [];

      for (const row of rows) {
        const dto = mapExcelRowToPayload(row, fallbackDeptCode);
        if (!dto) {
          console.warn(
            '[IMPORT] Bỏ qua dòng vì thiếu fullName / email / departmentCode',
            {
              row,
              fallbackDeptCode,
            },
          );
          fail++;
          continue;
        }

        const avatarFile = findAvatarFileForRow(row, avatarFiles);

        try {
          const created = await createDelegate(dto, avatarFile);
          createdList.push(created as Delegate);
          success++;
        } catch (err) {
          console.error(
            '[IMPORT] Lỗi khi gọi API createDelegate',
            err,
            {
              dto,
              row,
            },
          );
          fail++;
        }
      }

      setDelegates((prev) => [...prev, ...createdList]);

      alert(
        `Import hoàn tất: ${success} dòng thành công, ${fail} dòng lỗi (xem console để xem chi tiết lỗi).`,
      );
    } catch (err) {
      console.error(err);
      alert('Không thể đọc file Excel. Vui lòng kiểm tra lại cấu trúc file.');
    } finally {
      setExcelImporting(false);
      e.target.value = '';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />

      <div className="container mx-auto px-4 py-8">
        {/* Header + Actions */}
        <div className="mb-8 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-800 mb-2">
              {user?.role === 'admin'
                ? 'Quản lý đại biểu'
                : `Quản lý đại biểu - ${user?.department?.name}`}
            </h1>
            <p className="text-gray-600">
              {user?.role === 'admin'
                ? 'Quản lý thông tin tất cả đại biểu tham gia đại hội'
                : 'Quản lý thông tin đại biểu thuộc khoa của bạn'}
            </p>
          </div>

          <div className="flex flex-wrap gap-2 items-center">
            {/* Sheet name input */}
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-600">Sheet Excel:</span>
              <input
                type="text"
                value={sheetName}
                onChange={(ev) => setSheetName(ev.target.value)}
                placeholder="VD: ĐƯƠNG NHIÊN (bỏ trống = sheet đầu)"
                className="px-2 py-1 border border-gray-300 rounded text-sm"
              />
            </div>

            {/* Mã đơn vị mặc định (chỉ cho admin nhập) */}
            {user?.role === 'admin' && (
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-600">
                  Mã đơn vị mặc định:
                </span>
                <input
                  type="text"
                  value={defaultDeptCode}
                  onChange={(ev) =>
                    setDefaultDeptCode(ev.target.value.toUpperCase())
                  }
                  placeholder="VD: HSVT"
                  className="px-2 py-1 border border-gray-300 rounded text-sm"
                />
              </div>
            )}

            {/* Chọn folder ảnh avatar */}
            <input
              ref={avatarDirInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              multiple
              // @ts-expect-error - thuộc tính webkitdirectory không có trong type chuẩn nhưng browser vẫn hỗ trợ
              webkitdirectory="true"
              onChange={handleAvatarFolderChange}
            />
            <Button
              variant="secondary"
              onClick={triggerAvatarDirInput}
              className="flex items-center"
            >
              <i className="ri-folder-image-line mr-2"></i>
              Chọn thư mục ảnh
            </Button>

            {/* Import Excel */}
            <input
              ref={excelInputRef}
              type="file"
              accept=".xlsx,.xls"
              className="hidden"
              onChange={handleImportExcel}
            />
            <Button
              variant="secondary"
              onClick={triggerExcelInput}
              disabled={excelImporting}
              className="flex items-center"
            >
              {excelImporting ? (
                <>
                  <i className="ri-loader-4-line animate-spin mr-2"></i>
                  Đang import...
                </>
              ) : (
                <>
                  <i className="ri-file-excel-2-line mr-2"></i>
                  Import Excel
                </>
              )}
            </Button>

            {/* Thêm mới */}
            <Button onClick={openCreateModal} className="flex items-center">
              <i className="ri-add-line mr-2"></i>
              Thêm đại biểu
            </Button>
          </div>
        </div>

        {/* Search and Filter */}
        <Card className="mb-8">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Tìm kiếm theo tên, mã đại biểu, MSSV..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full px-4 py-2 pl-10 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <i className="ri-search-line absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"></i>
              </div>
            </div>

            {user?.role === 'admin' && (
              <div className="md:w-64">
                <select
                  value={filterUnit}
                  onChange={(e) => setFilterUnit(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 pr-8"
                >
                  <option value="all">Tất cả khoa</option>
                  {units.map((unit) => (
                    <option key={unit} value={unit}>
                      {unit}
                    </option>
                  ))}
                </select>
              </div>
            )}
          </div>
        </Card>

        {/* Statistics */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <Card className="text-center">
            <div className="text-2xl font-bold text-blue-600 mb-1">
              {filteredDelegates.length}
            </div>
            <div className="text-sm text-gray-600">Tổng đại biểu</div>
          </Card>
          <Card className="text-center">
            <div className="text-2xl font-bold text-green-600 mb-1">
              {filteredDelegates.filter((d) => d.checkedIn).length}
            </div>
            <div className="text-sm text-gray-600">Đã điểm danh</div>
          </Card>
          <Card className="text-center">
            <div className="text-2xl font-bold text-purple-600 mb-1">
              {filteredDelegates.filter((d) => d.partyMember).length}
            </div>
            <div className="text-sm text-gray-600">Đảng viên</div>
          </Card>
          <Card className="text-center">
            <div className="text-2xl font-bold text-orange-600 mb-1">
              {
                filteredDelegates.filter((d) => d.gender === 'Nữ')
                  .length
              }
            </div>
            <div className="text-sm text-gray-600">Nữ</div>
          </Card>
        </div>

        {/* Delegates List */}
        <Card>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left font-medium text-gray-700">
                    Đại biểu
                  </th>
                  <th className="px-2 py-3 text-left font-medium text-gray-700 w-32">
                    Đơn vị
                  </th>
                  <th className="px-4 py-3 text-left font-medium text-gray-700 w-32">
                  Chức vụ
                </th>
                  <th className="px-4 py-3 text-left font-medium text-gray-700">
                    Giới tính
                  </th>
                  <th className="px-4 py-3 text-left font-medium text-gray-700">
                    Đảng viên
                  </th>
                  <th className="px-4 py-3 text-left font-medium text-gray-700">
                    Trạng thái
                  </th>
                  <th className="px-4 py-3 text-left font-medium text-gray-700">
                    Thao tác
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredDelegates.map((delegate) => (
                  <tr
                    key={delegate.id}
                    className="hover:bg-gray-50"
                  >
                    <td className="px-4 py-3">
                      <div className="flex items-center space-x-3">
                        {delegate.ava ? (
                          <img
                            src={delegate.ava}
                            alt={delegate.fullName}
                            className="w-8 h-8 rounded-full object-cover"
                          />
                        ) : (
                          <div className="w-9 h-9 rounded-full bg-blue-100 flex items-center justify-center">
                            <span className="text-sm font-semibold text-blue-700">
                              {delegate.fullName
                                ?.charAt(0)
                                ?.toUpperCase() || 'Đ'}
                            </span>
                          </div>
                        )}
                        <div>
                          <div className="font-medium text-gray-800">
                            {delegate.fullName}
                          </div>
                          <div className="text-gray-500 text-xs">
                            {delegate.delegateCode}{' '}
                            {delegate.delegateCode && ' - '}{' '}
                            {delegate.studentId}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-gray-600">
                      {delegate.unit?.replace('Khoa ', '')}
                    </td>
                    <td className="px-4 py-3 text-gray-600">
                      {delegate.position}
                    </td>
                    <td className="px-4 py-3 text-gray-600">
                      {delegate.gender}
                    </td>
                    <td className="px-4 py-3">
                      {delegate.partyMember ? (
                        <span className="bg-red-100 text-red-800 text-xs px-2 py-1 rounded-full">
                          Đảng viên
                        </span>
                      ) : (
                        <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full">
                          Đoàn viên
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      {delegate.checkedIn ? (
                        <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full">
                          Đã tham gia
                        </span>
                      ) : (
                        <span className="bg-gray-100 text-gray-600 text-xs px-2 py-1 rounded-full">
                          Chưa tham gia
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex space-x-2">
                        <Button
                          size="sm"
                          variant="secondary"
                          onClick={() =>
                            setSelectedDelegate(delegate)
                          }
                        >
                          <i className="ri-eye-line"></i>
                        </Button>
                        <Button
                          size="sm"
                          onClick={() =>
                            handleEditDelegate(delegate)
                          }
                        >
                          <i className="ri-edit-line"></i>
                        </Button>
                        <button
                          onClick={() => handleDeleteDelegate(delegate)}
                          className="px-2 py-1 rounded hover:bg-red-50 text-red-600 text-sm"
                        >
                          <i className="ri-delete-bin-line" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {filteredDelegates.length === 0 && (
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <i className="ri-user-line text-2xl text-gray-400"></i>
              </div>
              <h3 className="text-lg font-medium text-gray-600 mb-2">
                Không tìm thấy đại biểu
              </h3>
              <p className="text-gray-500">
                Thử thay đổi từ khóa tìm kiếm hoặc bộ lọc
              </p>
            </div>
          )}
        </Card>

        {/* View Detail Modal */}
        {selectedDelegate && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
            <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
              <div className="flex justify-between items-start mb-4">
                <div className="flex items-center space-x-3">
                  {selectedDelegate.ava ? (
                    <img
                      src={selectedDelegate.ava}
                      alt={selectedDelegate.fullName}
                      className="w-14 h-14 rounded-full object-cover border border-gray-200"
                    />
                  ) : (
                    <div className="w-14 h-14 rounded-full bg-blue-100 flex items-center justify-center">
                      <span className="text-xs font-semibold text-blue-700">
                        {selectedDelegate.fullName
                          ?.charAt(0)
                          ?.toUpperCase() || 'Đ'}
                      </span>
                    </div>
                  )}
                  <div>
                    <h2 className="text-xl font-semibold">
                      Thông tin đại biểu
                    </h2>
                    <div className="text-sm text-gray-500">
                      {selectedDelegate.delegateCode}{' '}
                      {selectedDelegate.delegateCode && ' - '}{' '}
                      {selectedDelegate.studentId}
                    </div>
                  </div>
                </div>
                <button
                  onClick={() => setSelectedDelegate(null)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <i className="ri-close-line text-xl"></i>
                </button>
              </div>

              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-gray-600">
                      Mã đại biểu
                    </label>
                    <div className="text-gray-800">
                      {selectedDelegate.delegateCode}
                    </div>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-600">
                      Họ tên
                    </label>
                    <div className="text-gray-800">
                      {selectedDelegate.fullName}
                    </div>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-600">
                      MSSV
                    </label>
                    <div className="text-gray-800">
                      {selectedDelegate.studentId}
                    </div>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-600">
                      Giới tính
                    </label>
                    <div className="text-gray-800">
                      {selectedDelegate.gender}
                    </div>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-600">
                      Ngày sinh
                    </label>
                    <div className="text-gray-800">
                      {selectedDelegate.birthDate
                        ? new Date(
                            selectedDelegate.birthDate,
                          ).toLocaleDateString('vi-VN')
                        : '-'}
                    </div>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-600">
                      Điện thoại
                    </label>
                    <div className="text-gray-800">
                      {selectedDelegate.phone}
                    </div>
                  </div>
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-600">
                    Email
                  </label>
                  <div className="text-gray-800">
                    {selectedDelegate.email}
                  </div>
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-600">
                    Đơn vị
                  </label>
                  <div className="text-gray-800">
                    {selectedDelegate.unit}
                  </div>
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-600">
                    Chức vụ
                  </label>
                  <div className="text-gray-800">
                    {selectedDelegate.position}
                  </div>
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-600">
                    Thành tích
                  </label>
                  <div className="text-gray-800">
                    {selectedDelegate.achievements}
                  </div>
                </div>
              </div>
            </Card>
          </div>
        )}

        {/* Edit / Create Modal */}
        {showEditModal && editingDelegate && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
            <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold">
                  {isCreating ? 'Thêm đại biểu' : 'Chỉnh sửa thông tin'}
                </h2>
                <button
                  onClick={() => {
                    setShowEditModal(false);
                    setEditingDelegate(null);
                    setIsCreating(false);
                    setAvatarPreview(null);
                    setEditingAvatarFile(null);
                  }}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <i className="ri-close-line text-xl"></i>
                </button>
              </div>

              {/* Avatar */}
              <div className="flex items-center mb-4 space-x-3">
                {avatarPreview ? (
                  <img
                    src={avatarPreview}
                    alt={editingDelegate.fullName}
                    className="w-16 h-16 rounded-full object-cover"
                  />
                ) : editingDelegate.ava ? (
                  <img
                    src={editingDelegate.ava}
                    alt={editingDelegate.fullName}
                    className="w-16 h-16 rounded-full object-cover"
                  />
                ) : (
                  <div className="w-16 h-16 rounded-full bg-blue-100 flex items-center justify-center">
                    <i className="ri-user-line text-2xl text-blue-500"></i>
                  </div>
                )}
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Ảnh đại biểu
                  </label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleAvatarChange}
                    className="mt-1 text-sm"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Ảnh sẽ upload thật lên BE qua API.
                  </p>
                </div>
              </div>

              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Họ tên *
                    </label>
                    <input
                      type="text"
                      value={editingDelegate.fullName || ''}
                      onChange={(e) =>
                        handleInputChange('fullName', e.target.value)
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Mã đại biểu
                    </label>
                    <input
                      type="text"
                      value={editingDelegate.delegateCode || ''}
                      onChange={(e) =>
                        handleInputChange('delegateCode', e.target.value)
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      MSSV
                    </label>
                    <input
                      type="text"
                      value={editingDelegate.studentId || ''}
                      onChange={(e) =>
                        handleInputChange('studentId', e.target.value)
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Điện thoại
                    </label>
                    <input
                      type="tel"
                      value={editingDelegate.phone || ''}
                      onChange={(e) =>
                        handleInputChange('phone', e.target.value)
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Email
                    </label>
                    <input
                      type="email"
                      value={editingDelegate.email || ''}
                      onChange={(e) =>
                        handleInputChange('email', e.target.value)
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Đơn vị
                    </label>
                    <input
                      type="text"
                      value={editingDelegate.unit || ''}
                      onChange={(e) =>
                        handleInputChange('unit', e.target.value)
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Chức vụ
                    </label>
                    <input
                      type="text"
                      value={editingDelegate.position || ''}
                      onChange={(e) =>
                        handleInputChange('position', e.target.value)
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Giới tính
                    </label>
                    <input
                      type="text"
                      value={editingDelegate.gender || ''}
                      onChange={(e) =>
                        handleInputChange('gender', e.target.value)
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Thành tích
                  </label>
                  <textarea
                    value={editingDelegate.achievements || ''}
                    onChange={(e) =>
                      handleInputChange('achievements', e.target.value)
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    rows={3}
                  />
                </div>

                <div className="flex space-x-3">
                  <Button
                    variant="secondary"
                    onClick={() => {
                      setShowEditModal(false);
                      setEditingDelegate(null);
                      setIsCreating(false);
                      setAvatarPreview(null);
                      setEditingAvatarFile(null);
                    }}
                    className="flex-1"
                  >
                    Hủy
                  </Button>
                  <Button onClick={handleSaveDelegate} className="flex-1">
                    {isCreating ? 'Thêm đại biểu' : 'Lưu thay đổi'}
                  </Button>
                </div>
              </div>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
};

export default ManagePage;
