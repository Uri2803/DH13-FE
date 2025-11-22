import React from 'react';
import { Card } from '../../components/base/Card';
import { Button } from '../../components/base/Button';
import { Delegate } from './types';

interface Props {
  delegates: Delegate[];
  onView: (d: Delegate) => void;
  onEdit: (d: Delegate) => void;
  onDelete: (d: Delegate) => void;
}

export const DelegateTable: React.FC<Props> = ({ delegates, onView, onEdit, onDelete }) => {
  if (delegates.length === 0) {
    return (
      <Card>
        <div className="text-center py-12">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <i className="ri-user-line text-2xl text-gray-400"></i>
          </div>
          <h3 className="text-lg font-medium text-gray-600 mb-2">Không tìm thấy đại biểu</h3>
        </div>
      </Card>
    );
  }

  return (
    <Card>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-3 text-left font-medium text-gray-700">Đại biểu</th>
              <th className="px-2 py-3 text-left font-medium text-gray-700 w-32">Đơn vị</th>
              <th className="px-4 py-3 text-left font-medium text-gray-700 w-32">Chức vụ</th>
              <th className="px-4 py-3 text-left font-medium text-gray-700">Giới tính</th>
              <th className="px-4 py-3 text-left font-medium text-gray-700">Đảng viên</th>
              <th className="px-4 py-3 text-left font-medium text-gray-700">Trạng thái</th>
              <th className="px-4 py-3 text-left font-medium text-gray-700">Thao tác</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {delegates.map((delegate) => (
              <tr key={delegate.id} className="hover:bg-gray-50">
                <td className="px-4 py-3">
                  <div className="flex items-center space-x-3">
                    {delegate.ava ? (
                      <img src={delegate.ava} alt={delegate.fullName} className="w-8 h-8 rounded-full object-cover" />
                    ) : (
                      <div className="w-9 h-9 rounded-full bg-blue-100 flex items-center justify-center">
                        <span className="text-sm font-semibold text-blue-700">{delegate.fullName?.charAt(0)?.toUpperCase() || 'Đ'}</span>
                      </div>
                    )}
                    <div>
                      <div className="font-medium text-gray-800">{delegate.fullName}</div>
                      <div className="text-gray-500 text-xs">{delegate.delegateCode} {delegate.delegateCode && ' - '} {delegate.studentId}</div>
                    </div>
                  </div>
                </td>
                <td className="px-4 py-3 text-gray-600">{delegate.unit?.replace('Khoa ', '')}</td>
                <td className="px-4 py-3 text-gray-600">{delegate.position}</td>
                <td className="px-4 py-3 text-gray-600">{delegate.gender}</td>
                <td className="px-4 py-3">
                  {delegate.partyMember ? <span className="bg-red-100 text-red-800 text-xs px-2 py-1 rounded-full">Đảng viên</span> : <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full">Đoàn viên</span>}
                </td>
                <td className="px-4 py-3">
                  {delegate.checkedIn ? <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full">Đã tham gia</span> : <span className="bg-gray-100 text-gray-600 text-xs px-2 py-1 rounded-full">Chưa tham gia</span>}
                </td>
                <td className="px-4 py-3">
                  <div className="flex space-x-2">
                    <Button size="sm" variant="secondary" onClick={() => onView(delegate)}><i className="ri-eye-line"></i></Button>
                    <Button size="sm" onClick={() => onEdit(delegate)}><i className="ri-edit-line"></i></Button>
                    <button onClick={() => onDelete(delegate)} className="px-2 py-1 rounded hover:bg-red-50 text-red-600 text-sm"><i className="ri-delete-bin-line" /></button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Card>
  );
};