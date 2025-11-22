
import React, { useEffect, useState, useCallback, useRef } from 'react';
import Cropper from 'react-easy-crop';
import { Point, Area } from 'react-easy-crop';
import { Navigation } from '../../components/feature/Navigation';
import { Card } from '../../components/base/Card';
import { Button } from '../../components/base/Button';
import { useAuth } from '../../hooks/useAuth';
import { getInfor, changePassword, uploadAvatar } from '../../services/auth';

// --- TYPE DEFINITIONS ---
type DelegateVM = {
  id?: number | string;
  fullName: string;
  delegateCode?: string;
  position?: string;
  studentId?: string;
  birthDate?: string;
  gender?: string;
  religion?: string;
  ethnicity?: string;
  unionJoinDate?: string;
  partyJoinDate?: string;
  partyMember?: boolean;
  academicYear?: number;
  gpa?: string | number;
  achievements?: string;
  shirtSize?: string;
  phone?: string;
  email?: string;
  unit?: string;
  checkedIn?: boolean;
  checkinTime?: string;
  avatarUrl?: string;
};

// --- UTILS HELPERS ---
const dateToInput = (d?: string | Date | null) => {
  if (!d) return '';
  const dt = typeof d === 'string' ? new Date(d) : d;
  if (Number.isNaN(dt.getTime())) return '';
  return dt.toISOString().slice(0, 10);
};

const dateToVN = (d?: string | Date | null) => {
  if (!d) return '';
  const dt = typeof d === 'string' ? new Date(d) : d;
  if (Number.isNaN(dt.getTime())) return '';
  return dt.toLocaleDateString('vi-VN');
};

const normalize = (apiUser: any): DelegateVM => {
  const di = apiUser?.delegateInfo ?? {};
  return {
    id: di?.id ?? apiUser?.id,
    fullName: apiUser?.name || apiUser?.fullName || '',
    delegateCode: di?.code ?? apiUser?.code,
    position: di?.position,
    studentId: apiUser?.mssv ?? di?.mssv_or_mscb,
    birthDate: dateToInput(di?.dateOfBirth),
    gender: di?.gender,
    religion: di?.religion,
    ethnicity: di?.ethnicity,
    unionJoinDate: dateToInput(di?.joinUnionDate),
    partyJoinDate: dateToInput(di?.joinAssociationDate),
    partyMember: !!di?.isPartyMember,
    academicYear: di?.studentYear ? Number(di?.studentYear) : undefined,
    gpa: di?.academicScore,
    achievements: di?.achievements,
    shirtSize: di?.shirtSize,
    phone: di?.phone,
    email: di?.email ?? apiUser?.email,
    unit: apiUser?.department?.name,
    checkedIn: !!di?.checkedIn,
    checkinTime: di?.checkinTime,
    avatarUrl: apiUser?.ava || undefined,
  };
};

// --- CROP IMAGE HELPER FUNCTIONS ---
const createImage = (url: string): Promise<HTMLImageElement> =>
  new Promise((resolve, reject) => {
    const image = new Image();
    image.addEventListener('load', () => resolve(image));
    image.addEventListener('error', (error) => reject(error));
    image.setAttribute('crossOrigin', 'anonymous'); 
    image.src = url;
  });

async function getCroppedImg(imageSrc: string, pixelCrop: Area): Promise<Blob> {
  const image = await createImage(imageSrc);
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');

  if (!ctx) throw new Error('No 2d context');

  canvas.width = pixelCrop.width;
  canvas.height = pixelCrop.height;

  ctx.drawImage(
    image,
    pixelCrop.x, pixelCrop.y, pixelCrop.width, pixelCrop.height,
    0, 0, pixelCrop.width, pixelCrop.height
  );

  return new Promise((resolve, reject) => {
    canvas.toBlob((blob) => {
      if (!blob) { reject(new Error('Canvas is empty')); return; }
      resolve(blob);
    }, 'image/jpeg');
  });
}

// --- MAIN COMPONENT ---
const ProfilePage: React.FC = () => {
  const { user } = useAuth();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [delegate, setDelegate] = useState<DelegateVM | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState('');

  // Avatar Upload State
  const [avatarUploading, setAvatarUploading] = useState(false);
  const [avatarError, setAvatarError] = useState('');
  const [avatarSuccess, setAvatarSuccess] = useState('');

  // --- CROP STATE ---
  const [imageSrc, setImageSrc] = useState<string | null>(null);
  const [crop, setCrop] = useState<Point>({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<Area | null>(null);
  const [isCropping, setIsCropping] = useState(false);

  // Password state
  const [passwordForm, setPasswordForm] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });
  const [passwordSaving, setPasswordSaving] = useState(false);
  const [passwordError, setPasswordError] = useState('');
  const [passwordSuccess, setPasswordSuccess] = useState('');

  // Load data
  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        setLoading(true);
        setLoadError('');
        if (!user) { setLoadError('Vui lòng đăng nhập.'); return; }
        if (user.role !== 'delegate') { setLoadError('Chỉ đại biểu mới có trang hồ sơ này.'); return; }
        const res = await getInfor();
        const vm = normalize(res);
        if (mounted) setDelegate(vm);
      } catch (err: any) {
        if (mounted) setLoadError(err?.message || 'Không tải được hồ sơ.');
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => { mounted = false; };
  }, [user]);

  // 1. Chọn file từ máy -> Chuyển thành URL -> Mở Modal
  const onFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      const reader = new FileReader();
      reader.addEventListener('load', () => {
        setImageSrc(reader.result as string);
        setCrop({ x: 0, y: 0 });
        setZoom(1);
        setIsCropping(true);
        setAvatarError('');
        setAvatarSuccess('');
      });
      reader.readAsDataURL(file);
      // Reset input
      e.target.value = '';
    }
  };

  // 2. [FIX QUAN TRỌNG] Cắt ảnh hiện tại -> Tải ảnh về Blob -> Mở Modal
  const handleEditCurrentAvatar = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation(); // Chặn sự kiện click lan ra ngoài

    if (!delegate?.avatarUrl) return;

    try {
      setAvatarUploading(true); // Hiện loading giả để báo đang xử lý
      
      // Dùng fetch để tải ảnh về dưới dạng Blob (tránh lỗi canvas trực tiếp)
      const response = await fetch(delegate.avatarUrl, { mode: 'cors' });
      
      if (!response.ok) throw new Error('Không tải được ảnh từ server');
      
      const blob = await response.blob();
      const objectUrl = URL.createObjectURL(blob);

      setImageSrc(objectUrl); // Dùng URL nội bộ này sẽ an toàn hơn
      setCrop({ x: 0, y: 0 });
      setZoom(1);
      setIsCropping(true);
      setAvatarError('');
      setAvatarSuccess('');
    } catch (err) {
      console.error("Lỗi tải ảnh hiện tại:", err);
      setAvatarError('Không thể chỉnh sửa ảnh này (Lỗi CORS hoặc đường dẫn hỏng). Hãy tải ảnh mới.');
    } finally {
      setAvatarUploading(false);
    }
  };

  // 3. Lưu vùng chọn
  const onCropComplete = useCallback((croppedArea: Area, croppedAreaPixels: Area) => {
    setCroppedAreaPixels(croppedAreaPixels);
  }, []);

  // 4. Cắt & Upload
  const showCroppedImage = async () => {
    try {
      if (!imageSrc || !croppedAreaPixels) return;
      
      setAvatarUploading(true);
      setIsCropping(false); 

      const croppedBlob = await getCroppedImg(imageSrc, croppedAreaPixels);
      const fileToUpload = new File([croppedBlob], "avatar.jpg", { type: "image/jpeg" });

      await uploadAvatar(fileToUpload);

      // Reload data
      const latest = await getInfor();
      const vm = normalize(latest);
      setDelegate(vm);
      setAvatarSuccess('Cập nhật ảnh đại diện thành công.');
      
      // Cleanup
      setImageSrc(null);
      setZoom(1);
    } catch (e: any) {
      console.error(e);
      setAvatarError('Xử lý ảnh thất bại. Vui lòng thử ảnh khác.');
    } finally {
      setAvatarUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const cancelCrop = () => {
    setIsCropping(false);
    setImageSrc(null);
    setZoom(1);
  };

  // Logic Password (giữ nguyên)
  const handlePasswordChange = (field: keyof typeof passwordForm, value: string) => {
    setPasswordForm((prev) => ({ ...prev, [field]: value }));
  };
  const handleSubmitPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordError(''); setPasswordSuccess('');
    if (!passwordForm.currentPassword || !passwordForm.newPassword) { setPasswordError('Nhập thiếu thông tin.'); return; }
    if (passwordForm.newPassword.length < 6) { setPasswordError('Mật khẩu quá ngắn.'); return; }
    if (passwordForm.newPassword !== passwordForm.confirmPassword) { setPasswordError('Mật khẩu không khớp.'); return; }
    try {
      setPasswordSaving(true);
      await changePassword({ currentPassword: passwordForm.currentPassword, newPassword: passwordForm.newPassword });
      setPasswordSuccess('Đổi mật khẩu thành công.');
      setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (err: any) {
      const msg = err?.response?.data?.message || err?.message || 'Lỗi đổi mật khẩu.';
      setPasswordError(Array.isArray(msg) ? msg[0] : msg);
    } finally {
      setPasswordSaving(false);
    }
  };

  if (loading) return <div className="min-h-screen bg-gray-50 p-12 text-center"><i className="ri-loader-4-line animate-spin" /> Đang tải...</div>;
  if (loadError || !delegate) return <div className="min-h-screen bg-gray-50 p-4 text-red-600">{loadError || 'Lỗi tải trang'}</div>;

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-800">Hồ sơ cá nhân</h1>
          <p className="text-gray-600">Thông tin đại biểu & cài đặt tài khoản</p>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          <Card>
            <div className="text-center">
              {/* INPUT ẨN HOÀN TOÀN */}
              <input 
                type="file" 
                id="avatar-upload-input"
                accept="image/*" 
                className="hidden" 
                onChange={onFileChange} 
                ref={fileInputRef}
              />

              {/* KHUNG AVATAR */}
              <div className="relative mx-auto mb-4 h-28 w-28 group">
                <div className="h-full w-full overflow-hidden rounded-full border-4 border-blue-100 bg-blue-50 flex items-center justify-center relative z-0">
                  {delegate.avatarUrl ? (
                    <img src={delegate.avatarUrl} alt="Avatar" className="h-full w-full object-cover" />
                  ) : (
                    <i className="ri-user-line text-4xl text-blue-500" />
                  )}
                </div>

                {/* NÚT 1: CAMERA (LABEL) -> Kích hoạt input ẩn */}
                <label 
                  htmlFor="avatar-upload-input"
                  className="absolute bottom-0 right-0 inline-flex h-9 w-9 cursor-pointer items-center justify-center rounded-full bg-blue-600 text-white shadow-md hover:bg-blue-700 transition-colors z-10"
                  title="Tải ảnh mới"
                >
                  <i className="ri-camera-line text-lg" />
                </label>

                {/* NÚT 2: CROP (BUTTON) -> Kích hoạt hàm handleEditCurrentAvatar */}
                {delegate.avatarUrl && !avatarUploading && (
                  <button
                    type="button" 
                    onClick={handleEditCurrentAvatar}
                    className="absolute top-0 right-0 -mt-1 -mr-1 h-8 w-8 bg-white text-gray-700 rounded-full shadow-sm border border-gray-200 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all hover:bg-gray-100 hover:text-blue-600 z-20"
                    title="Căn chỉnh lại ảnh hiện tại"
                  >
                    <i className="ri-crop-line text-lg pointer-events-none"></i>
                  </button>
                )}
              </div>

              {avatarUploading && <div className="mb-2 text-xs text-blue-600 font-medium"><i className="ri-loader-4-line animate-spin mr-1" /> Đang xử lý...</div>}
              {avatarError && <div className="mb-2 text-xs text-red-600 bg-red-50 p-2 rounded">{avatarError}</div>}
              {avatarSuccess && <div className="mb-2 text-xs text-green-600 bg-green-50 p-2 rounded">{avatarSuccess}</div>}

              <h2 className="text-xl font-semibold text-gray-800">{delegate.fullName || '-'}</h2>
              <p className="text-sm text-gray-600">{delegate.delegateCode || '-'}</p>
              <p className="mb-4 text-xs text-gray-500">{delegate.position || '-'}</p>

              <div className="space-y-2 text-sm text-gray-600">
                 <div className="flex items-center justify-center gap-2"><i className="ri-building-line text-gray-400" /> {delegate.unit || '-'}</div>
                 <div className="flex items-center justify-center gap-2"><i className="ri-phone-line text-gray-400" /> {delegate.phone || '-'}</div>
                 <div className="flex items-center justify-center gap-2"><i className="ri-mail-line text-gray-400" /> {delegate.email || '-'}</div>
              </div>
            </div>
          </Card>

          <div className="space-y-6 lg:col-span-2">
             <Card>
              <h3 className="mb-4 flex items-center text-lg font-semibold"><i className="ri-user-settings-line mr-2 text-blue-500" /> Thông tin cá nhân</h3>
              <div className="grid gap-4 md:grid-cols-2">
                 <div><div className="text-xs font-bold text-gray-500 uppercase">Họ tên</div><div>{delegate.fullName}</div></div>
                 <div><div className="text-xs font-bold text-gray-500 uppercase">MSSV</div><div>{delegate.studentId}</div></div>
                 <div><div className="text-xs font-bold text-gray-500 uppercase">Ngày sinh</div><div>{dateToVN(delegate.birthDate)}</div></div>
                 <div><div className="text-xs font-bold text-gray-500 uppercase">Giới tính</div><div>{delegate.gender}</div></div>
                 <div><div className="text-xs font-bold text-gray-500 uppercase">Tôn giáo</div><div>{delegate.religion}</div></div>
                 <div><div className="text-xs font-bold text-gray-500 uppercase">Dân tộc</div><div>{delegate.ethnicity}</div></div>
                 <div><div className="text-xs font-bold text-gray-500 uppercase">Khóa</div><div>{delegate.academicYear}</div></div>
                 <div><div className="text-xs font-bold text-gray-500 uppercase">GPA</div><div>{delegate.gpa}</div></div>
              </div>
            </Card>
            <Card>
               <h3 className="mb-4 flex items-center text-lg font-semibold"><i className="ri-government-line mr-2 text-red-500" /> Chính trị - Xã hội</h3>
              <div className="grid gap-4 md:grid-cols-2">
                <div><div className="text-xs font-bold text-gray-500 uppercase">Ngày vào Đoàn</div><div>{dateToVN(delegate.unionJoinDate)}</div></div>
                <div><div className="text-xs font-bold text-gray-500 uppercase">Ngày vào Hội</div><div>{dateToVN(delegate.partyJoinDate)}</div></div>
                <div><div className="text-xs font-bold text-gray-500 uppercase">Đảng viên</div><div>{delegate.partyMember ? 'Đã kết nạp' : 'Chưa'}</div></div>
                <div><div className="text-xs font-bold text-gray-500 uppercase">Size áo</div><div>{delegate.shirtSize}</div></div>
              </div>
              <div className="mt-4"><div className="text-xs font-bold text-gray-500 uppercase">Thành tích</div><div className="whitespace-pre-line">{delegate.achievements}</div></div>
            </Card>
            <Card>
               <h3 className="mb-4 flex items-center text-lg font-semibold"><i className="ri-lock-password-line mr-2 text-purple-500" /> Đổi mật khẩu</h3>
               {passwordError && <div className="mb-3 p-2 bg-red-50 text-red-600 text-sm rounded">{passwordError}</div>}
               {passwordSuccess && <div className="mb-3 p-2 bg-green-50 text-green-600 text-sm rounded">{passwordSuccess}</div>}
               <form className="grid gap-4 md:grid-cols-2" onSubmit={handleSubmitPassword}>
                  <div className="md:col-span-2"><label className="block text-sm font-medium mb-1">Mật khẩu hiện tại</label><input type="password" value={passwordForm.currentPassword} onChange={e => handlePasswordChange('currentPassword', e.target.value)} className="w-full border rounded px-3 py-2" /></div>
                  <div><label className="block text-sm font-medium mb-1">Mật khẩu mới</label><input type="password" value={passwordForm.newPassword} onChange={e => handlePasswordChange('newPassword', e.target.value)} className="w-full border rounded px-3 py-2" /></div>
                  <div><label className="block text-sm font-medium mb-1">Xác nhận mật khẩu</label><input type="password" value={passwordForm.confirmPassword} onChange={e => handlePasswordChange('confirmPassword', e.target.value)} className="w-full border rounded px-3 py-2" /></div>
                  <div className="md:col-span-2 flex justify-end"><Button type="submit" disabled={passwordSaving}>{passwordSaving ? 'Đang lưu...' : 'Lưu mật khẩu'}</Button></div>
               </form>
            </Card>
          </div>
        </div>
      </div>

      {isCropping && imageSrc && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4" style={{zIndex: 9999}}>
          <div className="bg-white w-full max-w-md rounded-xl overflow-hidden shadow-2xl animate-fade-in-up">
            <div className="p-4 border-b flex justify-between items-center">
              <h3 className="font-bold text-lg text-gray-800">Điều chỉnh ảnh đại diện</h3>
              <button type="button" onClick={cancelCrop} className="text-gray-500 hover:text-red-500"><i className="ri-close-line text-2xl"></i></button>
            </div>
            <div className="relative h-80 w-full bg-gray-900">
              <Cropper
                image={imageSrc} crop={crop} zoom={zoom} aspect={1} cropShape="round"
                onCropChange={setCrop} onZoomChange={setZoom} onCropComplete={onCropComplete}
              />
            </div>
            <div className="p-4 space-y-4">
              <div>
                <label className="text-xs text-gray-500 uppercase font-bold mb-1 block">Thu phóng</label>
                <input type="range" value={zoom} min={1} max={3} step={0.1} onChange={(e) => setZoom(Number(e.target.value))} className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-600" />
              </div>
              <div className="flex gap-3">
                <Button variant="secondary" className="flex-1 justify-center" onClick={cancelCrop}>Hủy bỏ</Button>
                <Button className="flex-1 justify-center" onClick={showCroppedImage} disabled={avatarUploading}>
                  {avatarUploading ? <i className="ri-loader-4-line animate-spin mr-2"/> : <i className="ri-save-line mr-2"/>} Lưu ảnh này
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProfilePage;