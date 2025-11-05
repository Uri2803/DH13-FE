
import React, { useState } from 'react';
import { Navigation } from '../../components/feature/Navigation';
import { Card } from '../../components/base/Card';
import { Button } from '../../components/base/Button';
import { useAuth } from '../../hooks/useAuth';
import { mockDelegates } from '../../mocks/delegates';

const ManagePage: React.FC = () => {
  const { user } = useAuth();
  const [delegates, setDelegates] = useState(mockDelegates);
  const [selectedDelegate, setSelectedDelegate] = useState<any>(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingDelegate, setEditingDelegate] = useState<any>({});
  const [searchTerm, setSearchTerm] = useState('');
  const [filterUnit, setFilterUnit] = useState('all');

  const units = [...new Set(delegates.map(d => d.unit))];

  const getFilteredDelegates = () => {
    let filtered = delegates;

    // Phân quyền: manager chỉ thấy đại biểu của khoa mình
    if (user?.role === 'manager') {
      filtered = filtered.filter(d => d.unit === user.unit);
    }

    // Lọc theo tìm kiếm
    if (searchTerm) {
      filtered = filtered.filter(d => 
        d.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        d.delegateCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
        d.studentId.includes(searchTerm)
      );
    }

    // Lọc theo đơn vị
    if (filterUnit !== 'all') {
      filtered = filtered.filter(d => d.unit === filterUnit);
    }

    return filtered;
  };

  const handleEditDelegate = (delegate: any) => {
    setEditingDelegate({ ...delegate });
    setShowEditModal(true);
  };

  const handleSaveDelegate = () => {
    setDelegates(delegates.map(d => 
      d.id === editingDelegate.id ? editingDelegate : d
    ));
    setShowEditModal(false);
    setEditingDelegate({});
  };

  const handleInputChange = (field: string, value: any) => {
    setEditingDelegate({ ...editingDelegate, [field]: value });
  };

  const filteredDelegates = getFilteredDelegates();

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">
            {user?.role === 'admin' ? 'Quản lý đại biểu' : `Quản lý đại biểu - ${user?.unit}`}
          </h1>
          <p className="text-gray-600">
            {user?.role === 'admin' 
              ? 'Quản lý thông tin tất cả đại biểu tham gia đại hội'
              : 'Quản lý thông tin đại biểu thuộc khoa của bạn'
            }
          </p>
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
                  {units.map(unit => (
                    <option key={unit} value={unit}>{unit}</option>
                  ))}
                </select>
              </div>
            )}
          </div>
        </Card>

        {/* Statistics */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <Card className="text-center">
            <div className="text-2xl font-bold text-blue-600 mb-1">{filteredDelegates.length}</div>
            <div className="text-sm text-gray-600">Tổng đại biểu</div>
          </Card>
          <Card className="text-center">
            <div className="text-2xl font-bold text-green-600 mb-1">
              {filteredDelegates.filter(d => d.checkedIn).length}
            </div>
            <div className="text-sm text-gray-600">Đã điểm danh</div>
          </Card>
          <Card className="text-center">
            <div className="text-2xl font-bold text-purple-600 mb-1">
              {filteredDelegates.filter(d => d.partyMember).length}
            </div>
            <div className="text-sm text-gray-600">Đảng viên</div>
          </Card>
          <Card className="text-center">
            <div className="text-2xl font-bold text-orange-600 mb-1">
              {filteredDelegates.filter(d => d.gender === 'Nữ').length}
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
                  <th className="px-4 py-3 text-left font-medium text-gray-700">Đại biểu</th>
                  <th className="px-4 py-3 text-left font-medium text-gray-700">Đơn vị</th>
                  <th className="px-4 py-3 text-left font-medium text-gray-700">Chức vụ</th>
                  <th className="px-4 py-3 text-left font-medium text-gray-700">Giới tính</th>
                  <th className="px-4 py-3 text-left font-medium text-gray-700">Đảng viên</th>
                  <th className="px-4 py-3 text-left font-medium text-gray-700">Trạng thái</th>
                  <th className="px-4 py-3 text-left font-medium text-gray-700">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredDelegates.map((delegate) => (
                  <tr key={delegate.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3">
                      <div>
                        <div className="font-medium text-gray-800">{delegate.fullName}</div>
                        <div className="text-gray-500">{delegate.delegateCode} - {delegate.studentId}</div>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-gray-600">{delegate.unit.replace('Khoa ', '')}</td>
                    <td className="px-4 py-3 text-gray-600">{delegate.position}</td>
                    <td className="px-4 py-3 text-gray-600">{delegate.gender}</td>
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
                          onClick={() => setSelectedDelegate(delegate)}
                        >
                          <i className="ri-eye-line"></i>
                        </Button>
                        <Button
                          size="sm"
                          onClick={() => handleEditDelegate(delegate)}
                        >
                          <i className="ri-edit-line"></i>
                        </Button>
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
              <h3 className="text-lg font-medium text-gray-600 mb-2">Không tìm thấy đại biểu</h3>
              <p className="text-gray-500">Thử thay đổi từ khóa tìm kiếm hoặc bộ lọc</p>
            </div>
          )}
        </Card>

        {/* View Detail Modal */}
        {selectedDelegate && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
            <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold">Thông tin đại biểu</h2>
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
                    <label className="text-sm font-medium text-gray-600">Mã đại biểu</label>
                    <div className="text-gray-800">{selectedDelegate.delegateCode}</div>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-600">Họ tên</label>
                    <div className="text-gray-800">{selectedDelegate.fullName}</div>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-600">MSSV</label>
                    <div className="text-gray-800">{selectedDelegate.studentId}</div>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-600">Giới tính</label>
                    <div className="text-gray-800">{selectedDelegate.gender}</div>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-600">Ngày sinh</label>
                    <div className="text-gray-800">
                      {new Date(selectedDelegate.birthDate).toLocaleDateString('vi-VN')}
                    </div>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-600">Điện thoại</label>
                    <div className="text-gray-800">{selectedDelegate.phone}</div>
                  </div>
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-600">Email</label>
                  <div className="text-gray-800">{selectedDelegate.email}</div>
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-600">Đơn vị</label>
                  <div className="text-gray-800">{selectedDelegate.unit}</div>
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-600">Chức vụ</label>
                  <div className="text-gray-800">{selectedDelegate.position}</div>
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-600">Thành tích</label>
                  <div className="text-gray-800">{selectedDelegate.achievements}</div>
                </div>
              </div>
            </Card>
          </div>
        )}

        {/* Edit Modal */}
        {showEditModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
            <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold">Chỉnh sửa thông tin</h2>
                <button
                  onClick={() => setShowEditModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <i className="ri-close-line text-xl"></i>
                </button>
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
                      onChange={(e) => handleInputChange('fullName', e.target.value)}
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
                      onChange={(e) => handleInputChange('studentId', e.target.value)}
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
                      onChange={(e) => handleInputChange('phone', e.target.value)}
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
                      onChange={(e) => handleInputChange('email', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Chức vụ
                  </label>
                  <input
                    type="text"
                    value={editingDelegate.position || ''}
                    onChange={(e) => handleInputChange('position', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Thành tích
                  </label>
                  <textarea
                    value={editingDelegate.achievements || ''}
                    onChange={(e) => handleInputChange('achievements', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    rows={3}
                  />
                </div>

                <div className="flex space-x-3">
                  <Button
                    variant="secondary"
                    onClick={() => setShowEditModal(false)}
                    className="flex-1"
                  >
                    Hủy
                  </Button>
                  <Button
                    onClick={handleSaveDelegate}
                    className="flex-1"
                  >
                    Lưu thay đổi
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
