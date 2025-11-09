import React, { useEffect, useMemo, useState } from 'react';
import { Navigation } from '../../components/feature/Navigation';
import { Card } from '../../components/base/Card';
import { Button } from '../../components/base/Button';
import { useAuth } from '../../hooks/useAuth';
import { getInfor, updateInfor } from '../../services/auth';
import api from '../../lib/api'; // axios instance: baseURL + withCredentials: true

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
  partyJoinDate?: string;     // (ở BE là joinAssociationDate)
  partyMember?: boolean;      // isPartyMember
  academicYear?: number;      // studentYear
  gpa?: string | number;      // academicScore
  achievements?: string;
  shirtSize?: string;
  phone?: string;
  email?: string;
  unit?: string;
  checkedIn?: boolean;
  checkinTime?: string;
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

const ProfilePage: React.FC = () => {
  const { user } = useAuth();
  const [delegate, setDelegate]     = useState<DelegateVM | null>(null);
  const [editing, setEditing]       = useState(false);
  const [formData, setFormData]     = useState<DelegateVM | null>(null);
  const [saving, setSaving]         = useState(false);
  const [loading, setLoading]       = useState(true);
  const [loadError, setLoadError]   = useState<string>('');
  const [saveError, setSaveError]   = useState<string>('');

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
    };
  };

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
        const vm  = normalize(res);
        if (mounted) {
          setDelegate(vm);
          setFormData(vm);
        }
      } catch (err: any) {
        if (mounted) setLoadError(err?.message || 'Không tải được hồ sơ.');
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => {
      mounted = false;
    };
  }, [user]);

  const handleInputChange = (field: keyof DelegateVM, value: any) => {
    setFormData(prev => ({ ...(prev || {}), [field]: value }) as DelegateVM);
  };

  const updateDelegateInfo = async (payload: any) =>{
    return updateInfor(payload)
  };

  const handleSave = async () => {
    if (!formData) return;

    try {
      setSaving(true);
      setSaveError('');

      const payload = {
        code: formData.delegateCode,
        position: formData.position,
        mssv_or_mscb: formData.studentId,
        dateOfBirth: formData.birthDate || null,
        gender: formData.gender,
        religion: formData.religion,
        ethnicity: formData.ethnicity,
        joinUnionDate: formData.unionJoinDate || null,
        joinAssociationDate: formData.partyJoinDate || null,
        isPartyMember: !!formData.partyMember,
        studentYear: formData.academicYear ? Number(formData.academicYear) : null,
        academicScore:
          typeof formData.gpa === 'number' ? formData.gpa.toFixed(2) : formData.gpa,
        achievements: formData.achievements,
        shirtSize: formData.shirtSize,
        phone: formData.phone,
        email: formData.email,
      };

      await updateDelegateInfo(payload);


      const latest = await getInfor();
      const vm = normalize(latest);
      setDelegate(vm);
      setFormData(vm);
      setEditing(false);
    } catch (err: any) {
      const msg = err?.response?.data?.message || err?.message || 'Không thể lưu thay đổi.';
      setSaveError(Array.isArray(msg) ? msg[0] : msg);
    } finally {
      setSaving(false);
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
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-800 mb-2">Hồ sơ cá nhân</h1>
            <p className="text-gray-600">Thông tin đại biểu của bạn</p>
          </div>
          {!editing ? (
            <Button onClick={() => setEditing(true)}>
              <i className="ri-edit-line mr-2"></i>
              Chỉnh sửa
            </Button>
          ) : (
            <div className="flex space-x-2">
              <Button onClick={() => { setFormData(delegate); setEditing(false); }} variant="secondary">
                <i className="ri-close-line mr-2"></i>
                Hủy
              </Button>
              <Button onClick={handleSave} disabled={saving}>
                {saving ? (
                  <>
                    <i className="ri-loader-4-line animate-spin mr-2"></i>
                    Đang lưu...
                  </>
                ) : (
                  <>
                    <i className="ri-save-line mr-2"></i>
                    Lưu
                  </>
                )}
              </Button>
            </div>
          )}
        </div>

        {saveError && (
          <div className="mb-6 bg-red-50 text-red-700 border border-red-200 rounded-md p-3">
            <i className="ri-error-warning-line mr-2" />
            {saveError}
          </div>
        )}

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Tóm tắt */}
          <Card>
            <div className="text-center">
              <div className="w-24 h-24 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <i className="ri-user-line text-3xl text-blue-600"></i>
              </div>
              <h2 className="text-xl font-semibold text-gray-800 mb-1">{delegate.fullName || '-'}</h2>
              <p className="text-gray-600 mb-2">{delegate.delegateCode || '-'}</p>
              <p className="text-sm text-gray-500 mb-4">{delegate.position || '-'}</p>

              <div className="space-y-2 text-sm">
                <div className="flex items-center justify-center space-x-2">
                  <i className="ri-building-line text-gray-400"></i>
                  <span>{delegate.unit || '-'}</span>
                </div>
                <div className="flex items-center justify-center space-x-2">
                  <i className="ri-phone-line text-gray-400"></i>
                  <span>{delegate.phone || '-'}</span>
                </div>
                <div className="flex items-center justify-center space-x-2">
                  <i className="ri-mail-line text-gray-400"></i>
                  <span>{delegate.email || '-'}</span>
                </div>
              </div>

              {delegate.checkedIn && (
                <div className="mt-4 p-3 bg-green-50 rounded-lg">
                  <div className="flex items-center justify-center text-green-600 text-sm">
                    <i className="ri-check-line mr-2"></i>
                    Đã điểm danh
                  </div>
                  <div className="text-xs text-green-500 mt-1">
                    {delegate.checkinTime ? new Date(delegate.checkinTime).toLocaleString('vi-VN') : ''}
                  </div>
                </div>
              )}
            </div>
          </Card>

          {/* Chi tiết */}
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <h3 className="text-lg font-semibold mb-4 flex items-center">
                <i className="ri-user-settings-line text-blue-500 mr-2"></i>
                Thông tin cá nhân
              </h3>

              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Họ và tên *
                  </label>
                  {editing ? (
                    <input
                      type="text"
                      value={formData?.fullName || ''}
                      onChange={(e) => handleInputChange('fullName', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  ) : (
                    <div className="py-2 text-gray-800">{delegate.fullName || '-'}</div>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    MSSV
                  </label>
                  {editing ? (
                    <input
                      type="text"
                      value={formData?.studentId || ''}
                      onChange={(e) => handleInputChange('studentId', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  ) : (
                    <div className="py-2 text-gray-800">{delegate.studentId || '-'}</div>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Ngày sinh
                  </label>
                  {editing ? (
                    <input
                      type="date"
                      value={formData?.birthDate || ''}
                      onChange={(e) => handleInputChange('birthDate', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  ) : (
                    <div className="py-2 text-gray-800">
                      {delegate.birthDate ? dateToVN(delegate.birthDate) : '-'}
                    </div>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Giới tính
                  </label>
                  {editing ? (
                    <select
                      value={formData?.gender || ''}
                      onChange={(e) => handleInputChange('gender', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 pr-8"
                    >
                      <option value="">-- Chọn --</option>
                      <option value="Nam">Nam</option>
                      <option value="Nữ">Nữ</option>
                    </select>
                  ) : (
                    <div className="py-2 text-gray-800">{delegate.gender || '-'}</div>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Tôn giáo
                  </label>
                  {editing ? (
                    <input
                      type="text"
                      value={formData?.religion || ''}
                      onChange={(e) => handleInputChange('religion', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  ) : (
                    <div className="py-2 text-gray-800">{delegate.religion || '-'}</div>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Dân tộc
                  </label>
                  {editing ? (
                    <input
                      type="text"
                      value={formData?.ethnicity || ''}
                      onChange={(e) => handleInputChange('ethnicity', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  ) : (
                    <div className="py-2 text-gray-800">{delegate.ethnicity || '-'}</div>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Số điện thoại
                  </label>
                  {editing ? (
                    <input
                      type="tel"
                      value={formData?.phone || ''}
                      onChange={(e) => handleInputChange('phone', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  ) : (
                    <div className="py-2 text-gray-800">{delegate.phone || '-'}</div>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Email
                  </label>
                  {editing ? (
                    <input
                      type="email"
                      value={formData?.email || ''}
                      onChange={(e) => handleInputChange('email', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  ) : (
                    <div className="py-2 text-gray-800">{delegate.email || '-'}</div>
                  )}
                </div>
              </div>
            </Card>

            <Card>
              <h3 className="text-lg font-semibold mb-4 flex items-center">
                <i className="ri-government-line text-red-500 mr-2"></i>
                Thông tin chính trị - xã hội
              </h3>

              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Ngày vào Đoàn
                  </label>
                  {editing ? (
                    <input
                      type="date"
                      value={formData?.unionJoinDate || ''}
                      onChange={(e) => handleInputChange('unionJoinDate', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  ) : (
                    <div className="py-2 text-gray-800">
                      {delegate.unionJoinDate ? dateToVN(delegate.unionJoinDate) : '-'}
                    </div>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Ngày vào Hội
                  </label>
                  {editing ? (
                    <input
                      type="date"
                      value={formData?.partyJoinDate || ''}
                      onChange={(e) => handleInputChange('partyJoinDate', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  ) : (
                    <div className="py-2 text-gray-800">
                      {delegate.partyJoinDate ? dateToVN(delegate.partyJoinDate) : '-'}
                    </div>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Đảng viên
                  </label>
                  {editing ? (
                    <select
                      value={String(!!formData?.partyMember)}
                      onChange={(e) => handleInputChange('partyMember', e.target.value === 'true')}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 pr-8"
                    >
                      <option value="false">Chưa</option>
                      <option value="true">Đã là đảng viên</option>
                    </select>
                  ) : (
                    <div className="py-2 text-gray-800">
                      {delegate.partyMember ? 'Đã là đảng viên' : 'Chưa'}
                    </div>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Năm học
                  </label>
                  {editing ? (
                    <select
                      value={formData?.academicYear ?? ''}
                      onChange={(e) => handleInputChange('academicYear', Number(e.target.value))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 pr-8"
                    >
                      <option value="">-- Chọn --</option>
                      {[1,2,3,4,5].map(n => <option key={n} value={n}>Năm {n}</option>)}
                    </select>
                  ) : (
                    <div className="py-2 text-gray-800">
                      {delegate.academicYear ? `Năm ${delegate.academicYear}` : '-'}
                    </div>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Điểm trung bình
                  </label>
                  {editing ? (
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      max="4"
                      value={formData?.gpa ?? ''}
                      onChange={(e) => handleInputChange('gpa', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  ) : (
                    <div className="py-2 text-gray-800">
                      {delegate.gpa ? `${delegate.gpa}/4.0` : '-'}
                    </div>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Size áo sơ mi
                  </label>
                  {editing ? (
                    <select
                      value={formData?.shirtSize || ''}
                      onChange={(e) => handleInputChange('shirtSize', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 pr-8"
                    >
                      <option value="">-- Chọn --</option>
                      {['S','M','L','XL','XXL'].map(s => <option key={s} value={s}>{s}</option>)}
                    </select>
                  ) : (
                    <div className="py-2 text-gray-800">{delegate.shirtSize || '-'}</div>
                  )}
                </div>
              </div>
            </Card>

            <Card>
              <h3 className="text-lg font-semibold mb-4 flex items-center">
                <i className="ri-trophy-line text-yellow-500 mr-2"></i>
                Thành tích
              </h3>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Thành tích nổi bật
                </label>
                {editing ? (
                  <textarea
                    value={formData?.achievements || ''}
                    onChange={(e) => handleInputChange('achievements', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    rows={3}
                    maxLength={500}
                  />
                ) : (
                  <div className="py-2 text-gray-800">{delegate.achievements || '-'}</div>
                )}
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
