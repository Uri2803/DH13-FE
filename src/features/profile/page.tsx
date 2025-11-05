
import React, { useState, useEffect } from 'react';
import { Navigation } from '../../components/feature/Navigation';
import { Card } from '../../components/base/Card';
import { Button } from '../../components/base/Button';
import { useAuth } from '../../hooks/useAuth';
import { mockDelegates } from '../../mocks/delegates';

const ProfilePage: React.FC = () => {
  const { user } = useAuth();
  const [delegate, setDelegate] = useState<any>(null);
  const [editing, setEditing] = useState(false);
  const [formData, setFormData] = useState<any>({});
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    // Tìm thông tin đại biểu từ mock data
    if (user?.role === 'delegate') {
      const delegateInfo = mockDelegates.find(d => d.delegateCode === user.delegateCode);
      if (delegateInfo) {
        setDelegate(delegateInfo);
        setFormData(delegateInfo);
      }
    }
  }, [user]);

  const handleInputChange = (field: string, value: string) => {
    setFormData({ ...formData, [field]: value });
  };

  const handleSave = async () => {
    setSaving(true);
    
    // Simulate API call
    setTimeout(() => {
      setDelegate(formData);
      setEditing(false);
      setSaving(false);
    }, 1000);
  };

  const handleCancel = () => {
    setFormData(delegate);
    setEditing(false);
  };

  if (!delegate) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navigation />
        <div className="container mx-auto px-4 py-8 text-center">
          <div className="text-gray-600">Không tìm thấy thông tin đại biểu</div>
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
              <Button onClick={handleCancel} variant="secondary">
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

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Profile Summary */}
          <Card>
            <div className="text-center">
              <div className="w-24 h-24 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <i className="ri-user-line text-3xl text-blue-600"></i>
              </div>
              <h2 className="text-xl font-semibold text-gray-800 mb-1">{delegate.fullName}</h2>
              <p className="text-gray-600 mb-2">{delegate.delegateCode}</p>
              <p className="text-sm text-gray-500 mb-4">{delegate.position}</p>
              
              <div className="space-y-2 text-sm">
                <div className="flex items-center justify-center space-x-2">
                  <i className="ri-building-line text-gray-400"></i>
                  <span>{delegate.unit}</span>
                </div>
                <div className="flex items-center justify-center space-x-2">
                  <i className="ri-phone-line text-gray-400"></i>
                  <span>{delegate.phone}</span>
                </div>
                <div className="flex items-center justify-center space-x-2">
                  <i className="ri-mail-line text-gray-400"></i>
                  <span>{delegate.email}</span>
                </div>
              </div>

              {delegate.checkedIn && (
                <div className="mt-4 p-3 bg-green-50 rounded-lg">
                  <div className="flex items-center justify-center text-green-600 text-sm">
                    <i className="ri-check-line mr-2"></i>
                    Đã điểm danh
                  </div>
                  <div className="text-xs text-green-500 mt-1">
                    {new Date(delegate.checkinTime).toLocaleString('vi-VN')}
                  </div>
                </div>
              )}
            </div>
          </Card>

          {/* Profile Details */}
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
                      value={formData.fullName}
                      onChange={(e) => handleInputChange('fullName', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  ) : (
                    <div className="py-2 text-gray-800">{delegate.fullName}</div>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    MSSV
                  </label>
                  {editing ? (
                    <input
                      type="text"
                      value={formData.studentId}
                      onChange={(e) => handleInputChange('studentId', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  ) : (
                    <div className="py-2 text-gray-800">{delegate.studentId}</div>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Ngày sinh
                  </label>
                  {editing ? (
                    <input
                      type="date"
                      value={formData.birthDate}
                      onChange={(e) => handleInputChange('birthDate', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  ) : (
                    <div className="py-2 text-gray-800">
                      {new Date(delegate.birthDate).toLocaleDateString('vi-VN')}
                    </div>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Giới tính
                  </label>
                  {editing ? (
                    <select
                      value={formData.gender}
                      onChange={(e) => handleInputChange('gender', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 pr-8"
                    >
                      <option value="Nam">Nam</option>
                      <option value="Nữ">Nữ</option>
                    </select>
                  ) : (
                    <div className="py-2 text-gray-800">{delegate.gender}</div>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Tôn giáo
                  </label>
                  {editing ? (
                    <input
                      type="text"
                      value={formData.religion}
                      onChange={(e) => handleInputChange('religion', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  ) : (
                    <div className="py-2 text-gray-800">{delegate.religion}</div>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Dân tộc
                  </label>
                  {editing ? (
                    <input
                      type="text"
                      value={formData.ethnicity}
                      onChange={(e) => handleInputChange('ethnicity', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  ) : (
                    <div className="py-2 text-gray-800">{delegate.ethnicity}</div>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Số điện thoại
                  </label>
                  {editing ? (
                    <input
                      type="tel"
                      value={formData.phone}
                      onChange={(e) => handleInputChange('phone', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  ) : (
                    <div className="py-2 text-gray-800">{delegate.phone}</div>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Email
                  </label>
                  {editing ? (
                    <input
                      type="email"
                      value={formData.email}
                      onChange={(e) => handleInputChange('email', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  ) : (
                    <div className="py-2 text-gray-800">{delegate.email}</div>
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
                      value={formData.unionJoinDate}
                      onChange={(e) => handleInputChange('unionJoinDate', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  ) : (
                    <div className="py-2 text-gray-800">
                      {new Date(delegate.unionJoinDate).toLocaleDateString('vi-VN')}
                    </div>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Ngày vào Đảng
                  </label>
                  {editing ? (
                    <input
                      type="date"
                      value={formData.partyJoinDate}
                      onChange={(e) => handleInputChange('partyJoinDate', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  ) : (
                    <div className="py-2 text-gray-800">
                      {delegate.partyJoinDate ? 
                        new Date(delegate.partyJoinDate).toLocaleDateString('vi-VN') : 
                        'Chưa là đảng viên'
                      }
                    </div>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Năm học
                  </label>
                  {editing ? (
                    <select
                      value={formData.academicYear}
                      onChange={(e) => handleInputChange('academicYear', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 pr-8"
                    >
                      <option value={1}>Năm 1</option>
                      <option value={2}>Năm 2</option>
                      <option value={3}>Năm 3</option>
                      <option value={4}>Năm 4</option>
                      <option value={5}>Năm 5</option>
                    </select>
                  ) : (
                    <div className="py-2 text-gray-800">Năm {delegate.academicYear}</div>
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
                      value={formData.gpa}
                      onChange={(e) => handleInputChange('gpa', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  ) : (
                    <div className="py-2 text-gray-800">{delegate.gpa}/4.0</div>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Size áo sơ mi
                  </label>
                  {editing ? (
                    <select
                      value={formData.shirtSize}
                      onChange={(e) => handleInputChange('shirtSize', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 pr-8"
                    >
                      <option value="S">S</option>
                      <option value="M">M</option>
                      <option value="L">L</option>
                      <option value="XL">XL</option>
                      <option value="XXL">XXL</option>
                    </select>
                  ) : (
                    <div className="py-2 text-gray-800">{delegate.shirtSize}</div>
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
                    value={formData.achievements}
                    onChange={(e) => handleInputChange('achievements', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    rows={3}
                    maxLength={500}
                  />
                ) : (
                  <div className="py-2 text-gray-800">{delegate.achievements}</div>
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
