// src/pages/profile/ProfilePage.tsx
import React, { useEffect, useState } from 'react';
import { Navigation } from '../../components/feature/Navigation';
import { Card } from '../../components/base/Card';
import { Button } from '../../components/base/Button';
import { useAuth } from '../../hooks/useAuth';
import { getInfor, changePassword, uploadAvatar } from '../../services/auth';

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

const ProfilePage: React.FC = () => {
  const { user } = useAuth();

  const [delegate, setDelegate] = useState<DelegateVM | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState('');

  // Avatar state
  const [avatarUploading, setAvatarUploading] = useState(false);
  const [avatarError, setAvatarError] = useState('');
  const [avatarSuccess, setAvatarSuccess] = useState('');

  // Password state
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [passwordSaving, setPasswordSaving] = useState(false);
  const [passwordError, setPasswordError] = useState('');
  const [passwordSuccess, setPasswordSuccess] = useState('');

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        setLoading(true);
        setLoadError('');

        if (!user) {
          setLoadError('Vui lòng đăng nhập.');
          return;
        }
        if (user.role !== 'delegate') {
          setLoadError('Chỉ đại biểu mới có trang hồ sơ này.');
          return;
        }

        const res = await getInfor();
        const vm = normalize(res);
        if (mounted) {
          setDelegate(vm);
        }
      } catch (err: any) {
        if (mounted) {
          setLoadError(err?.message || 'Không tải được hồ sơ.');
        }
      } finally {
        if (mounted) setLoading(false);
      }
    })();

    return () => {
      mounted = false;
    };
  }, [user]);

  const handleAvatarChange = async (
    e: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setAvatarError('');
    setAvatarSuccess('');
    setAvatarUploading(true);

    try {
      const res = await uploadAvatar(file);
      // có thể dùng res.user, nhưng để chắc thì gọi lại getInfor
      const latest = await getInfor();
      const vm = normalize(latest);
      setDelegate(vm);
      setAvatarSuccess('Cập nhật ảnh đại diện thành công.');
    } catch (err: any) {
      const msg =
        err?.response?.data?.message ||
        err?.message ||
        'Không thể cập nhật ảnh đại diện.';
      setAvatarError(Array.isArray(msg) ? msg[0] : msg);
    } finally {
      setAvatarUploading(false);
      // reset input value
      e.target.value = '';
    }
  };

  const handlePasswordChange = (
    field: keyof typeof passwordForm,
    value: string,
  ) => {
    setPasswordForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmitPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordError('');
    setPasswordSuccess('');

    if (!passwordForm.currentPassword || !passwordForm.newPassword) {
      setPasswordError('Vui lòng nhập đầy đủ mật khẩu hiện tại và mật khẩu mới.');
      return;
    }

    if (passwordForm.newPassword.length < 6) {
      setPasswordError('Mật khẩu mới phải từ 6 ký tự trở lên.');
      return;
    }

    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setPasswordError('Xác nhận mật khẩu mới không khớp.');
      return;
    }

    try {
      setPasswordSaving(true);
      await changePassword({
        currentPassword: passwordForm.currentPassword,
        newPassword: passwordForm.newPassword,
      });
      setPasswordSuccess('Đổi mật khẩu thành công.');
      setPasswordForm({
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
      });
    } catch (err: any) {
      const msg =
        err?.response?.data?.message ||
        err?.message ||
        'Không thể đổi mật khẩu.';
      setPasswordError(Array.isArray(msg) ? msg[0] : msg);
    } finally {
      setPasswordSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navigation />
        <div className="container mx-auto px-4 py-12 text-center text-gray-600">
          <i className="ri-loader-4-line animate-spin mr-2" />
          Đang tải hồ sơ...
        </div>
      </div>
    );
  }

  if (loadError || !delegate) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navigation />
        <div className="container mx-auto px-4 py-8">
          <div className="bg-red-50 text-red-700 border border-red-200 rounded-md p-4">
            {loadError || 'Không tìm thấy thông tin đại biểu'}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />

      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex flex-col gap-2 mb-8 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-800 mb-1">
              Hồ sơ cá nhân
            </h1>
            <p className="text-gray-600">
              Thông tin đại biểu & cài đặt tài khoản
            </p>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Tóm tắt + Avatar */}
          <Card>
            <div className="text-center">
              <div className="relative mx-auto mb-4 h-28 w-28">
                <div className="h-full w-full overflow-hidden rounded-full border-4 border-blue-100 bg-blue-50 flex items-center justify-center">
                  {delegate.avatarUrl ? (
                    <img
                      src={delegate.avatarUrl}
                      alt="Avatar"
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <i className="ri-user-line text-4xl text-blue-500" />
                  )}
                </div>

                {/* nút upload nhỏ ở góc */}
                <label className="absolute bottom-0 right-0 inline-flex h-9 w-9 cursor-pointer items-center justify-center rounded-full bg-blue-600 text-white shadow-md hover:bg-blue-700">
                  <i className="ri-camera-line text-lg" />
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleAvatarChange}
                  />
                </label>
              </div>

              {avatarUploading && (
                <div className="mb-2 text-xs text-gray-500">
                  <i className="ri-loader-4-line animate-spin mr-1" />
                  Đang tải lên ảnh...
                </div>
              )}
              {avatarError && (
                <div className="mb-2 rounded bg-red-50 px-2 py-1 text-xs text-red-600">
                  {avatarError}
                </div>
              )}
              {avatarSuccess && (
                <div className="mb-2 rounded bg-green-50 px-2 py-1 text-xs text-green-600">
                  {avatarSuccess}
                </div>
              )}

              <h2 className="mb-1 text-xl font-semibold text-gray-800">
                {delegate.fullName || '-'}
              </h2>
              <p className="text-sm text-gray-600">
                {delegate.delegateCode || '-'}
              </p>
              <p className="mb-4 text-xs text-gray-500">
                {delegate.position || '-'}
              </p>

              <div className="space-y-2 text-sm">
                <div className="flex items-center justify-center gap-2 text-gray-600">
                  <i className="ri-building-line text-gray-400" />
                  <span>{delegate.unit || '-'}</span>
                </div>
                <div className="flex items-center justify-center gap-2 text-gray-600">
                  <i className="ri-phone-line text-gray-400" />
                  <span>{delegate.phone || '-'}</span>
                </div>
                <div className="flex items-center justify-center gap-2 text-gray-600">
                  <i className="ri-mail-line text-gray-400" />
                  <span>{delegate.email || '-'}</span>
                </div>
              </div>

              {delegate.checkedIn && (
                <div className="mt-4 rounded-lg bg-green-50 p-3">
                  <div className="flex items-center justify-center text-sm text-green-600">
                    <i className="ri-check-line mr-2" />
                    Đã điểm danh
                  </div>
                  <div className="mt-1 text-xs text-green-500">
                    {delegate.checkinTime
                      ? new Date(delegate.checkinTime).toLocaleString('vi-VN')
                      : ''}
                  </div>
                </div>
              )}
            </div>
          </Card>

          {/* Thông tin hiển thị (read-only) */}
          <div className="space-y-6 lg:col-span-2">
            <Card>
              <h3 className="mb-4 flex items-center text-lg font-semibold">
                <i className="ri-user-settings-line mr-2 text-blue-500" />
                Thông tin cá nhân
              </h3>

              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <div className="text-xs font-semibold uppercase text-gray-500">
                    Họ và tên
                  </div>
                  <div className="mt-1 text-gray-800">
                    {delegate.fullName || '-'}
                  </div>
                </div>
                <div>
                  <div className="text-xs font-semibold uppercase text-gray-500">
                    MSSV
                  </div>
                  <div className="mt-1 text-gray-800">
                    {delegate.studentId || '-'}
                  </div>
                </div>
                <div>
                  <div className="text-xs font-semibold uppercase text-gray-500">
                    Ngày sinh
                  </div>
                  <div className="mt-1 text-gray-800">
                    {delegate.birthDate
                      ? dateToVN(delegate.birthDate)
                      : '-'}
                  </div>
                </div>
                <div>
                  <div className="text-xs font-semibold uppercase text-gray-500">
                    Giới tính
                  </div>
                  <div className="mt-1 text-gray-800">
                    {delegate.gender || '-'}
                  </div>
                </div>
                <div>
                  <div className="text-xs font-semibold uppercase text-gray-500">
                    Tôn giáo
                  </div>
                  <div className="mt-1 text-gray-800">
                    {delegate.religion || '-'}
                  </div>
                </div>
                <div>
                  <div className="text-xs font-semibold uppercase text-gray-500">
                    Dân tộc
                  </div>
                  <div className="mt-1 text-gray-800">
                    {delegate.ethnicity || '-'}
                  </div>
                </div>
                <div>
                  <div className="text-xs font-semibold uppercase text-gray-500">
                    Năm học
                  </div>
                  <div className="mt-1 text-gray-800">
                    {delegate.academicYear
                      ? `Năm ${delegate.academicYear}`
                      : '-'}
                  </div>
                </div>
                <div>
                  <div className="text-xs font-semibold uppercase text-gray-500">
                    Điểm trung bình
                  </div>
                  <div className="mt-1 text-gray-800">
                    {delegate.gpa ? `${delegate.gpa}/10` : '-'}
                  </div>
                </div>
              </div>
            </Card>

            <Card>
              <h3 className="mb-4 flex items-center text-lg font-semibold">
                <i className="ri-government-line mr-2 text-red-500" />
                Thông tin chính trị - xã hội
              </h3>

              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <div className="text-xs font-semibold uppercase text-gray-500">
                    Ngày vào Đoàn
                  </div>
                  <div className="mt-1 text-gray-800">
                    {delegate.unionJoinDate
                      ? dateToVN(delegate.unionJoinDate)
                      : '-'}
                  </div>
                </div>
                <div>
                  <div className="text-xs font-semibold uppercase text-gray-500">
                    Ngày vào Hội
                  </div>
                  <div className="mt-1 text-gray-800">
                    {delegate.partyJoinDate
                      ? dateToVN(delegate.partyJoinDate)
                      : '-'}
                  </div>
                </div>
                <div>
                  <div className="text-xs font-semibold uppercase text-gray-500">
                    Đảng viên
                  </div>
                  <div className="mt-1 text-gray-800">
                    {delegate.partyMember ? 'Đã là đảng viên' : 'Chưa'}
                  </div>
                </div>
                <div>
                  <div className="text-xs font-semibold uppercase text-gray-500">
                    Size áo sơ mi
                  </div>
                  <div className="mt-1 text-gray-800">
                    {delegate.shirtSize || '-'}
                  </div>
                </div>
              </div>

              <div className="mt-4">
                <div className="text-xs font-semibold uppercase text-gray-500">
                  Thành tích nổi bật
                </div>
                <div className="mt-1 whitespace-pre-line text-gray-800">
                  {delegate.achievements || '-'}
                </div>
              </div>
            </Card>

            {/* Đổi mật khẩu */}
            <Card>
              <h3 className="mb-4 flex items-center text-lg font-semibold">
                <i className="ri-lock-password-line mr-2 text-purple-500" />
                Đổi mật khẩu
              </h3>

              {passwordError && (
                <div className="mb-3 rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
                  <i className="ri-error-warning-line mr-2" />
                  {passwordError}
                </div>
              )}
              {passwordSuccess && (
                <div className="mb-3 rounded-md border border-green-200 bg-green-50 px-3 py-2 text-sm text-green-700">
                  <i className="ri-checkbox-circle-line mr-2" />
                  {passwordSuccess}
                </div>
              )}

              <form className="grid gap-4 md:grid-cols-2" onSubmit={handleSubmitPassword}>
                <div className="md:col-span-2">
                  <label className="mb-2 block text-sm font-medium text-gray-700">
                    Mật khẩu hiện tại
                  </label>
                  <input
                    type="password"
                    value={passwordForm.currentPassword}
                    onChange={(e) =>
                      handlePasswordChange('currentPassword', e.target.value)
                    }
                    className="w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    autoComplete="current-password"
                  />
                </div>
                <div>
                  <label className="mb-2 block text-sm font-medium text-gray-700">
                    Mật khẩu mới
                  </label>
                  <input
                    type="password"
                    value={passwordForm.newPassword}
                    onChange={(e) =>
                      handlePasswordChange('newPassword', e.target.value)
                    }
                    className="w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    autoComplete="new-password"
                  />
                </div>
                <div>
                  <label className="mb-2 block text-sm font-medium text-gray-700">
                    Xác nhận mật khẩu mới
                  </label>
                  <input
                    type="password"
                    value={passwordForm.confirmPassword}
                    onChange={(e) =>
                      handlePasswordChange('confirmPassword', e.target.value)
                    }
                    className="w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    autoComplete="new-password"
                  />
                </div>
                <div className="md:col-span-2 flex justify-end">
                  <Button type="submit" disabled={passwordSaving}>
                    {passwordSaving ? (
                      <>
                        <i className="ri-loader-4-line mr-2 animate-spin" />
                        Đang đổi mật khẩu...
                      </>
                    ) : (
                      <>
                        <i className="ri-save-line mr-2" />
                        Lưu mật khẩu mới
                      </>
                    )}
                  </Button>
                </div>
              </form>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
