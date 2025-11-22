import React from 'react';
import { Card } from '../../components/base/Card';
import { Delegate } from './types';

interface Props {
  delegates: Delegate[];
}

export const StatsCards: React.FC<Props> = ({ delegates }) => {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
      <Card className="text-center">
        <div className="text-2xl font-bold text-blue-600 mb-1">{delegates.length}</div>
        <div className="text-sm text-gray-600">Tổng đại biểu</div>
      </Card>
      <Card className="text-center">
        <div className="text-2xl font-bold text-green-600 mb-1">{delegates.filter((d) => d.checkedIn).length}</div>
        <div className="text-sm text-gray-600">Đã điểm danh</div>
      </Card>
      <Card className="text-center">
        <div className="text-2xl font-bold text-purple-600 mb-1">{delegates.filter((d) => d.partyMember).length}</div>
        <div className="text-sm text-gray-600">Đảng viên</div>
      </Card>
      <Card className="text-center">
        <div className="text-2xl font-bold text-orange-600 mb-1">{delegates.filter((d) => d.gender === 'Nữ').length}</div>
        <div className="text-sm text-gray-600">Nữ</div>
      </Card>
    </div>
  );
};