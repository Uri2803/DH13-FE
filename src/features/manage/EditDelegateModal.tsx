// src/features/manage/EditDelegateModal.tsx
import React, { useRef } from 'react';
import { Card } from '../../components/base/Card';
import { Button } from '../../components/base/Button';
import { Delegate } from './types';

interface Props {
  isCreating: boolean;
  editingDelegate: Delegate;
  avatarPreview: string | null;
  onClose: () => void;
  onSave: () => void;
  onInputChange: (field: keyof Delegate, value: unknown) => void;
  onAvatarFileChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onEditCurrentAvatar: () => void;
}

export const EditDelegateModal: React.FC<Props> = ({
  isCreating,
  editingDelegate,
  avatarPreview,
  onClose,
  onSave,
  onInputChange,
  onAvatarFileChange,
  onEditCurrentAvatar,
}) => {
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const handleDateValue = (value?: string | null) =>
    value ? value.slice(0, 10) : '';

  const isPartyMember = !!editingDelegate.partyMember;
  console.log(editingDelegate)

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <Card className="w-full max-w-3xl max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">
            {isCreating ? 'Thêm đại biểu' : 'Chỉnh sửa thông tin'}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <i className="ri-close-line text-xl"></i>
          </button>
        </div>

        {/* AVATAR */}
        <div className="flex items-center mb-6 space-x-4 bg-gray-50 p-4 rounded-xl border border-gray-100">
          <div className="w-16 h-16 rounded-full border-2 border-white shadow-sm overflow-hidden flex-shrink-0 bg-gray-200">
            {avatarPreview ? (
              <img
                src={avatarPreview}
                alt="Preview"
                className="w-full h-full object-cover"
              />
            ) : editingDelegate.ava ? (
              <img
                src={editingDelegate.ava}
                alt={editingDelegate.fullName}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-gray-400">
                <i className="ri-user-fill text-2xl"></i>
              </div>
            )}
          </div>

          <div className="flex-1">
            <label className="block text-sm font-bold text-gray-700 mb-2">
              Ảnh đại biểu
            </label>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={onAvatarFileChange}
            />
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="px-3 py-1 bg-white border border-gray-300 text-gray-700 text-sm rounded hover:bg-gray-50 transition-colors shadow-sm"
              >
                <i className="ri-upload-line mr-1"></i> Chọn ảnh
              </button>
              {(avatarPreview || editingDelegate.ava) && (
                <button
                  type="button"
                  onClick={onEditCurrentAvatar}
                  className="px-3 py-1 bg-blue-50 border border-blue-200 text-blue-700 text-sm rounded hover:bg-blue-100 transition-colors shadow-sm"
                >
                  <i className="ri-crop-line mr-1"></i> Căn chỉnh
                </button>
              )}
            </div>
          </div>
        </div>

        {/* FORM */}
        <div className="space-y-6">
          {/* Hàng 1: thông tin cơ bản */}
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Họ tên *
              </label>
              <input
                type="text"
                value={editingDelegate.fullName || ''}
                onChange={(e) => onInputChange('fullName', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 outline-none"
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
                  onInputChange('delegateCode', e.target.value)
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 outline-none"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                MSSV / MSCB
              </label>
              <input
                type="text"
                value={editingDelegate.studentId || ''}
                onChange={(e) =>
                  onInputChange('studentId', e.target.value)
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 outline-none"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Đơn vị
              </label>
              <input
                type="text"
                value={editingDelegate.unit || ''}
                onChange={(e) => onInputChange('unit', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 outline-none"
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
                  onInputChange('position', e.target.value)
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 outline-none"
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
                  onInputChange('gender', e.target.value)
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 outline-none"
              />
            </div>
          </div>

          {/* Hàng 2: liên hệ + ngày tháng */}
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Điện thoại
              </label>
              <input
                type="tel"
                value={editingDelegate.phone || ''}
                onChange={(e) => onInputChange('phone', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 outline-none"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Email liên hệ
              </label>
              <input
                type="email"
                value={editingDelegate.email || ''}
                onChange={(e) => onInputChange('email', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 outline-none"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Ngày sinh
              </label>
              <input
                type="date"
                value={handleDateValue(editingDelegate.birthDate)}
                onChange={(e) => onInputChange('birthDate', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 outline-none"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Ngày vào Đoàn
              </label>
              <input
                type="date"
                value={handleDateValue(editingDelegate.joinUnionDate)}
                onChange={(e) =>
                  onInputChange('joinUnionDate', e.target.value)
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 outline-none"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Ngày vào Hội
              </label>
              <input
                type="date"
                value={handleDateValue(editingDelegate.joinAssociationDate)}
                onChange={(e) =>
                  onInputChange('joinAssociationDate', e.target.value)
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 outline-none"
              />
            </div>
          </div>

          {/* Hàng 3: thông tin thêm */}
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Tôn giáo
              </label>
              <input
                type="text"
                value={editingDelegate.religion || ''}
                onChange={(e) =>
                  onInputChange('religion', e.target.value)
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 outline-none"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Dân tộc
              </label>
              <input
                type="text"
                value={editingDelegate.ethnicity || ''}
                onChange={(e) =>
                  onInputChange('ethnicity', e.target.value)
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 outline-none"
              />
            </div>

            <div className="flex items-center mt-6">
              <input
                id="isPartyMember"
                type="checkbox"
                checked={isPartyMember}
                onChange={(e) =>
                  onInputChange('partyMember', e.target.checked)
                }
                className="h-4 w-4 text-blue-600 border-gray-300 rounded"
              />
              <label
                htmlFor="isPartyMember"
                className="ml-2 text-sm font-medium text-gray-700"
              >
                Đảng viên
              </label>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Năm học
              </label>
              <input
                type="number"
                value={editingDelegate.studentYear ?? ''}
                onChange={(e) =>
                  onInputChange(
                    'studentYear',
                    e.target.value ? Number(e.target.value) : null,
                  )
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 outline-none"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Điểm TB
              </label>
              <input
                type="number"
                step="0.01"
                value={editingDelegate.academicScore ?? ''}
                onChange={(e) =>
                  onInputChange(
                    'academicScore',
                    e.target.value ? Number(e.target.value) : null,
                  )
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 outline-none"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Size áo
              </label>
              <input
                type="text"
                value={editingDelegate.shirtSize || ''}
                onChange={(e) =>
                  onInputChange('shirtSize', e.target.value)
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 outline-none"
              />
            </div>
          </div>

          {/* Thành tích */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Thành tích
            </label>
            <textarea
              value={editingDelegate.achievements || ''}
              onChange={(e) =>
                onInputChange('achievements', e.target.value)
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 outline-none"
              rows={3}
            />
          </div>

          <div className="flex space-x-3">
            <Button
              variant="secondary"
              onClick={onClose}
              className="flex-1"
            >
              Hủy
            </Button>
            <Button onClick={onSave} className="flex-1">
              {isCreating ? 'Thêm đại biểu' : 'Lưu thay đổi'}
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
};
