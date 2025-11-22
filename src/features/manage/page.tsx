import React, { useEffect, useRef, useState, useCallback } from 'react';
import * as XLSX from 'xlsx';
import { Point, Area } from 'react-easy-crop';
import { Navigation } from '../../components/feature/Navigation';
import { Card } from '../../components/base/Card';
import { Button } from '../../components/base/Button';
import { useAuth } from '../../hooks/useAuth';
import { mapExcelRowToPayload, findAvatarFileForRow } from './funtion';
import { DelegateRow, fetchDelegatesAll, fetchDelegatesByDepartment, createDelegate, updateDelegate, deleteDelegate, CreateDelegatePayload } from '../../services/delegates';
import { toast } from 'react-toastify';
// Imports Components & Helpers
import { Delegate } from './types';
import { getCroppedImg } from '../../utils/imageUtils';
import { StatsCards } from './StatsCards';
import { DelegateTable } from './DelegateTable';
import { EditDelegateModal } from './EditDelegateModal';
import { CropImageModal } from './CropImageModal';

const ManagePage: React.FC = () => {
  const { user } = useAuth();
  const [delegates, setDelegates] = useState<Delegate[]>([]);
  const [selectedDelegate, setSelectedDelegate] = useState<Delegate | null>(null);
  
  // Modal States
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingDelegate, setEditingDelegate] = useState<Delegate | null>(null);
  const [isCreating, setIsCreating] = useState(false);

  // Filter States
  const [searchTerm, setSearchTerm] = useState('');
  const [filterUnit, setFilterUnit] = useState('all');

  // Import States
  const excelInputRef = useRef<HTMLInputElement | null>(null);
  const avatarDirInputRef = useRef<HTMLInputElement | null>(null);
  const [excelImporting, setExcelImporting] = useState(false);
  const [sheetName, setSheetName] = useState<string>('');
  const [avatarFiles, setAvatarFiles] = useState<File[]>([]);
  const [defaultDeptCode, setDefaultDeptCode] = useState<string>('');

  // Avatar & Crop States
  const [editingAvatarFile, setEditingAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [imageSrc, setImageSrc] = useState<string | null>(null);
  const [crop, setCrop] = useState<Point>({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<Area | null>(null);
  const [isCropping, setIsCropping] = useState(false);

  // ===== Load Data =====
  useEffect(() => {
    if (!user) return;
    const load = async () => {
      try {
        let list: DelegateRow[] = [];
        if (user.role === 'admin') list = await fetchDelegatesAll();
        else if (user.role === 'department' && user.department?.id) list = await fetchDelegatesByDepartment(user.department.id);
        setDelegates(list as Delegate[]);
      } catch (err) { console.error('Load delegates error', err); }
    };
    void load();
  }, [user]);

  // ===== Filter Logic =====
  const units = [...new Set(delegates.map((d) => d.unit).filter(Boolean))] as string[];
  const getFilteredDelegates = () => {
    let filtered = delegates;
    if (user?.role === 'department') {
      const deptName = user.department?.name;
      filtered = filtered.filter((d) => d.unit === deptName || d.unit === user.code);
    }
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter((d) => d.fullName?.toLowerCase().includes(term) || d.delegateCode?.toLowerCase().includes(term) || d.studentId?.includes(searchTerm));
    }
    if (filterUnit !== 'all') {
      filtered = filtered.filter((d) => d.unit === filterUnit);
    }
    return filtered;
  };
  const filteredDelegates = getFilteredDelegates();

  // ===== CRUD Handlers =====
  const openCreateModal = () => {
    setIsCreating(true);
    setEditingDelegate({
      id: '', delegateCode: '', fullName: '', unit: user?.role === 'department' ? user.department?.name || user.code || '' : '',
      gender: '', partyMember: false, checkedIn: false, checkinTime: null, birthDate: '', studentId: '', ava: null, achievements: '', phone: '', email: '', position: '',
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
    if (!delegate.id || !window.confirm(`Xoá đại biểu "${delegate.fullName}"?`)) return;
    try {
      await deleteDelegate(delegate.id);
      setDelegates((prev) => prev.filter((d) => d.id !== delegate.id));
    } catch (err) { alert('Xoá thất bại.'); }
  };

    const handleSaveDelegate = async () => {
    if (!editingDelegate) return;
    if (!editingDelegate.fullName?.trim()) {
      alert('Họ tên trống');
      return;
    }

    const deptCode = user?.department?.code || user?.code;

    const payload: Partial<CreateDelegatePayload> = {
      // bắt buộc
      name: editingDelegate.fullName,

      // thông tin liên hệ
      email: editingDelegate.email || undefined,
      emailContact: editingDelegate.email || undefined,

      // mã số
      mssv: editingDelegate.studentId || undefined,
      mssv_or_mscb: editingDelegate.studentId || undefined,
      delegateCode: editingDelegate.delegateCode || undefined,
      code: editingDelegate.delegateCode || undefined,

      // cơ bản
      position: editingDelegate.position || undefined,
      phone: editingDelegate.phone || undefined,
      gender: editingDelegate.gender || undefined,

      // nâng cao – giống import
      dateOfBirth: editingDelegate.birthDate || undefined,
      religion: (editingDelegate as any).religion || undefined,
      ethnicity: (editingDelegate as any).ethnicity || undefined,
      joinUnionDate: (editingDelegate as any).joinUnionDate || undefined,
      joinAssociationDate: (editingDelegate as any).joinAssociationDate || undefined,

      // partyMember (FE dùng boolean, payload cần 0|1)
      isPartyMember:
        (editingDelegate as any).isPartyMember !== undefined
          ? ((editingDelegate as any).isPartyMember ? 1 : 0)
          : editingDelegate.partyMember !== undefined
          ? (editingDelegate.partyMember ? 1 : 0)
          : undefined,

      studentYear:
        (editingDelegate as any).studentYear !== undefined
          ? (editingDelegate as any).studentYear
          : undefined,

      academicScore:
        (editingDelegate as any).academicScore !== undefined
          ? (editingDelegate as any).academicScore
          : undefined,

      achievements: editingDelegate.achievements || undefined,

      shirtSize: (editingDelegate as any).shirtSize || undefined,
    };

    try {
      if (isCreating || !editingDelegate.id) {
        if (!deptCode) {
          alert('Lỗi mã khoa');
          return;
        }

        const createPayload: CreateDelegatePayload = {
          // 3 field bắt buộc
          name: payload.name!,
          email: payload.email || '',
          departmentCode: deptCode,
          // còn lại spread từ payload
          ...payload,
        };

        const created = await createDelegate(
          createPayload,
          editingAvatarFile ?? undefined,
        );
        setDelegates((prev) => [...prev, created as Delegate]);
      } else {
        const updated = await updateDelegate(
          editingDelegate.id,
          payload,
          editingAvatarFile ?? undefined,
        );
        setDelegates((prev) =>
          prev.map((d) => (d.id === updated.id ? (updated as Delegate) : d)),
        );
      }

      setShowEditModal(false);
      setEditingDelegate(null);
      setIsCreating(false);
      setAvatarPreview(null);
      setEditingAvatarFile(null);
      toast.success('Cập nhật thành công!');
    } catch (err) {
      console.error(err);
      alert('Lưu thất bại.');
    }
  };

  const handleInputChange = (field: keyof Delegate, value: unknown) => {
    setEditingDelegate((prev) => ({ ...(prev || {}), [field]: value } as Delegate));
  };

  // ===== CROP Handlers =====
  const onAvatarFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const reader = new FileReader();
      reader.onload = () => { setImageSrc(reader.result as string); setCrop({ x: 0, y: 0 }); setZoom(1); setIsCropping(true); };
      reader.readAsDataURL(e.target.files[0]);
      e.target.value = '';
    }
  };

  const handleEditCurrentAvatar = async () => {
    const url = avatarPreview || editingDelegate?.ava;
    if (!url) return;
    try {
      const res = await fetch(url, { mode: 'cors' });
      if (!res.ok) throw new Error();
      const blob = await res.blob();
      setImageSrc(URL.createObjectURL(blob)); setCrop({ x: 0, y: 0 }); setZoom(1); setIsCropping(true);
    } catch { alert('Không thể chỉnh sửa ảnh này. Hãy tải ảnh mới.'); }
  };

  const onCropComplete = useCallback((_: Area, croppedAreaPixels: Area) => setCroppedAreaPixels(croppedAreaPixels), []);

  const showCroppedImage = async () => {
    if (!imageSrc || !croppedAreaPixels) return;
    try {
      const blob = await getCroppedImg(imageSrc, croppedAreaPixels);
      setEditingAvatarFile(new File([blob], "avatar.jpg", { type: "image/jpeg" }));
      setAvatarPreview(URL.createObjectURL(blob));
      setIsCropping(false); setImageSrc(null); setZoom(1);
    } catch { alert('Lỗi crop ảnh'); }
  };

  const cancelCrop = () => { setIsCropping(false); setImageSrc(null); setZoom(1); };

  // ===== Import Logic (Giữ nguyên, rút gọn hiển thị) =====
  const handleImportExcel = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setExcelImporting(true);
    try {
      const data = await file.arrayBuffer();
      const wb = XLSX.read(data);
      const ws = wb.Sheets[sheetName.trim() || wb.SheetNames[0]];
      if(!ws) throw new Error();
      const rows = XLSX.utils.sheet_to_json(ws) as any[];
      const dept = user?.role === 'department' ? user.department?.code || user.code : defaultDeptCode;
      let success = 0, fail = 0;
      const newDelegates: Delegate[] = [];
      for (const row of rows) {
        const dto = mapExcelRowToPayload(row, dept);
        if (!dto) { fail++; continue; }
        const avt = findAvatarFileForRow(row, avatarFiles);
        try {
          const d = await createDelegate(dto, avt);
          newDelegates.push(d as Delegate); success++;
        } catch { fail++; }
      }
      setDelegates(p => [...p, ...newDelegates]);
      alert(`Xong: ${success} OK, ${fail} Lỗi`);
    } catch { alert('Lỗi file Excel'); } 
    finally { setExcelImporting(false); e.target.value = ''; }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      <div className="container mx-auto px-4 py-8">
        {/* Header & Actions */}
        <div className="mb-8 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-800 mb-2">{user?.role === 'admin' ? 'Quản lý đại biểu' : `Đại biểu - ${user?.department?.name}`}</h1>
            <p className="text-gray-600">Quản lý thông tin đại biểu.</p>
          </div>
          <div className="flex flex-wrap gap-2 items-center">
             <input type="text" value={sheetName} onChange={e => setSheetName(e.target.value)} placeholder="Sheet Name" className="px-2 py-1 border rounded text-sm w-24" />
             {user?.role === 'admin' && <input type="text" value={defaultDeptCode} onChange={e => setDefaultDeptCode(e.target.value.toUpperCase())} placeholder="Mã ĐV" className="px-2 py-1 border rounded text-sm w-24" />}
             <input ref={avatarDirInputRef} type="file" className="hidden" multiple onChange={(e) => { if(e.target.files) setAvatarFiles(Array.from(e.target.files)); }} />
             <Button variant="secondary" onClick={() => avatarDirInputRef.current?.click()}><i className="ri-folder-image-line mr-2"></i> Ảnh</Button>
             <input ref={excelInputRef} type="file" accept=".xlsx,.xls" className="hidden" onChange={handleImportExcel} />
             <Button variant="secondary" onClick={() => excelInputRef.current?.click()} disabled={excelImporting}>{excelImporting ? 'Loading...' : 'Import Excel'}</Button>
             <Button onClick={openCreateModal}><i className="ri-add-line mr-2"></i> Thêm</Button>
          </div>
        </div>

        {/* Filter */}
        <Card className="mb-8">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
               <input type="text" placeholder="Tìm kiếm..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} className="w-full pl-10 pr-4 py-3 bg-gray-50/50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm" />
               <i className="ri-search-line absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"></i>
            </div>
            {user?.role === 'admin' && (
              <div className="md:w-64">
                <select value={filterUnit} onChange={e => setFilterUnit(e.target.value)} className="w-full px-3 py-2 border rounded-md outline-none">
                  <option value="all">Tất cả khoa</option>
                  {units.map(u => <option key={u} value={u}>{u}</option>)}
                </select>
              </div>
            )}
          </div>
        </Card>

        <StatsCards delegates={filteredDelegates} />
        
        <DelegateTable 
          delegates={filteredDelegates} 
          onView={setSelectedDelegate} 
          onEdit={handleEditDelegate} 
          onDelete={handleDeleteDelegate} 
        />

 
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
        

        {showEditModal && editingDelegate && (
          <EditDelegateModal 
            isCreating={isCreating}
            editingDelegate={editingDelegate}
            avatarPreview={avatarPreview}
            onClose={() => setShowEditModal(false)}
            onSave={handleSaveDelegate}
            onInputChange={handleInputChange}
            onAvatarFileChange={onAvatarFileChange}
            onEditCurrentAvatar={handleEditCurrentAvatar}
          />
        )}

        {isCropping && imageSrc && (
          <CropImageModal 
            imageSrc={imageSrc} crop={crop} zoom={zoom}
            setCrop={setCrop} setZoom={setZoom}
            onCropComplete={onCropComplete}
            onCancel={cancelCrop}
            onSave={showCroppedImage}
          />
        )}
      </div>
    </div>
  );
};

export default ManagePage;