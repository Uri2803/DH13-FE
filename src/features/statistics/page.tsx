
import React, { useState } from 'react';
import { Navigation } from '../../components/feature/Navigation';
import { Card } from '../../components/base/Card';
import { Button } from '../../components/base/Button';
import { useAuth } from '../../hooks/useAuth';
import { mockDelegates } from '../../mocks/delegates';
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const StatisticsPage: React.FC = () => {
  const { user } = useAuth();
  const [delegates] = useState(mockDelegates);
  const [selectedPeriod, setSelectedPeriod] = useState('today');

  const checkedInDelegates = delegates.filter(d => d.checkedIn);
  const totalDelegates = delegates.length;
  const attendanceRate = Math.round((checkedInDelegates.length / totalDelegates) * 100);

  // Thống kê theo giới tính
  const genderStats = [
    { name: 'Nam', value: checkedInDelegates.filter(d => d.gender === 'Nam').length, color: '#3B82F6' },
    { name: 'Nữ', value: checkedInDelegates.filter(d => d.gender === 'Nữ').length, color: '#EC4899' }
  ];

  // Thống kê đảng viên/đoàn viên
  const membershipStats = [
    { name: 'Đảng viên', value: checkedInDelegates.filter(d => d.partyMember).length, color: '#DC2626' },
    { name: 'Đoàn viên', value: checkedInDelegates.filter(d => !d.partyMember).length, color: '#059669' }
  ];

  // Thống kê theo khoa
  const facultyStats = delegates.reduce((acc: any[], delegate) => {
    const existing = acc.find(item => item.name === delegate.unit);
    if (existing) {
      existing.total += 1;
      if (delegate.checkedIn) existing.checkedIn += 1;
    } else {
      acc.push({
        name: delegate.unit.replace('Khoa ', ''),
        total: 1,
        checkedIn: delegate.checkedIn ? 1 : 0
      });
    }
    return acc;
  }, []);

  // Thống kê theo độ tuổi
  const getAge = (birthDate: string) => {
    return new Date().getFullYear() - new Date(birthDate).getFullYear();
  };

  const ages = checkedInDelegates.map(d => getAge(d.birthDate));
  const oldestDelegate = delegates.reduce((oldest, current) => 
    getAge(current.birthDate) > getAge(oldest.birthDate) ? current : oldest
  );

  const ageStats = [
    { name: '20-21 tuổi', value: ages.filter(age => age >= 20 && age <= 21).length },
    { name: '22-23 tuổi', value: ages.filter(age => age >= 22 && age <= 23).length },
    { name: '24+ tuổi', value: ages.filter(age => age >= 24).length }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-800 mb-2">Thống kê tham gia</h1>
            <p className="text-gray-600">Báo cáo chi tiết về tình hình tham gia đại hội</p>
          </div>
          <div className="flex space-x-2">
            <Button
              variant={selectedPeriod === 'today' ? 'primary' : 'secondary'}
              onClick={() => setSelectedPeriod('today')}
              size="sm"
            >
              Hôm nay
            </Button>
            <Button
              variant={selectedPeriod === 'all' ? 'primary' : 'secondary'}
              onClick={() => setSelectedPeriod('all')}
              size="sm"
            >
              Tổng thể
            </Button>
          </div>
        </div>

        {/* Overview Stats */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
          <Card className="text-center">
            <div className="text-2xl font-bold text-blue-600 mb-1">{totalDelegates}</div>
            <div className="text-sm text-gray-600">Tổng đại biểu</div>
          </Card>
          <Card className="text-center">
            <div className="text-2xl font-bold text-green-600 mb-1">{checkedInDelegates.length}</div>
            <div className="text-sm text-gray-600">Đã tham gia</div>
          </Card>
          <Card className="text-center">
            <div className="text-2xl font-bold text-purple-600 mb-1">{attendanceRate}%</div>
            <div className="text-sm text-gray-600">Tỷ lệ tham gia</div>
          </Card>
          <Card className="text-center">
            <div className="text-2xl font-bold text-orange-600 mb-1">
              {checkedInDelegates.filter(d => d.partyMember).length}
            </div>
            <div className="text-sm text-gray-600">Đảng viên</div>
          </Card>
          <Card className="text-center">
            <div className="text-2xl font-bold text-red-600 mb-1">{getAge(oldestDelegate.birthDate)}</div>
            <div className="text-sm text-gray-600">Tuổi cao nhất</div>
          </Card>
        </div>

        <div className="grid lg:grid-cols-2 gap-8 mb-8">
          {/* Gender Distribution */}
          <Card>
            <h3 className="text-lg font-semibold mb-4 flex items-center">
              <i className="ri-user-line text-blue-500 mr-2"></i>
              Phân bố theo giới tính
            </h3>
            <div className="flex items-center justify-between">
              <ResponsiveContainer width="60%" height={200}>
                <PieChart>
                  <Pie
                    data={genderStats}
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    dataKey="value"
                  >
                    {genderStats.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
              <div className="space-y-3">
                {genderStats.map((stat, index) => (
                  <div key={index} className="flex items-center">
                    <div 
                      className="w-4 h-4 rounded-full mr-2"
                      style={{ backgroundColor: stat.color }}
                    ></div>
                    <span className="text-sm">{stat.name}: {stat.value} người</span>
                  </div>
                ))}
              </div>
            </div>
          </Card>

          {/* Membership Distribution */}
          <Card>
            <h3 className="text-lg font-semibold mb-4 flex items-center">
              <i className="ri-shield-star-line text-red-500 mr-2"></i>
              Đảng viên / Đoàn viên
            </h3>
            <div className="flex items-center justify-between">
              <ResponsiveContainer width="60%" height={200}>
                <PieChart>
                  <Pie
                    data={membershipStats}
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    dataKey="value"
                  >
                    {membershipStats.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
              <div className="space-y-3">
                {membershipStats.map((stat, index) => (
                  <div key={index} className="flex items-center">
                    <div 
                      className="w-4 h-4 rounded-full mr-2"
                      style={{ backgroundColor: stat.color }}
                    ></div>
                    <span className="text-sm">{stat.name}: {stat.value} người</span>
                  </div>
                ))}
              </div>
            </div>
          </Card>
        </div>

        {/* Faculty Attendance */}
        <Card className="mb-8">
          <h3 className="text-lg font-semibold mb-4 flex items-center">
            <i className="ri-building-line text-green-500 mr-2"></i>
            Tỷ lệ tham gia theo khoa
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={facultyStats}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="total" fill="#E5E7EB" name="Tổng số" />
              <Bar dataKey="checkedIn" fill="#3B82F6" name="Đã tham gia" />
            </BarChart>
          </ResponsiveContainer>
        </Card>

        {/* Age Distribution */}
        <Card className="mb-8">
          <h3 className="text-lg font-semibold mb-4 flex items-center">
            <i className="ri-calendar-line text-purple-500 mr-2"></i>
            Phân bố theo độ tuổi
          </h3>
          <div className="grid grid-cols-3 gap-4">
            {ageStats.map((stat, index) => (
              <div key={index} className="text-center p-4 bg-gray-50 rounded-lg">
                <div className="text-2xl font-bold text-purple-600 mb-1">{stat.value}</div>
                <div className="text-sm text-gray-600">{stat.name}</div>
              </div>
            ))}
          </div>
          <div className="mt-4 p-3 bg-blue-50 rounded-lg">
            <div className="text-sm text-blue-800">
              <strong>Đại biểu có tuổi cao nhất:</strong> {oldestDelegate.fullName} - {getAge(oldestDelegate.birthDate)} tuổi ({oldestDelegate.unit})
            </div>
          </div>
        </Card>

        {/* Detailed List */}
        <Card>
          <h3 className="text-lg font-semibold mb-4 flex items-center">
            <i className="ri-list-check-2 text-orange-500 mr-2"></i>
            Danh sách chi tiết
          </h3>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-3 py-2 text-left">Mã ĐB</th>
                  <th className="px-3 py-2 text-left">Họ tên</th>
                  <th className="px-3 py-2 text-left">Đơn vị</th>
                  <th className="px-3 py-2 text-left">Giới tính</th>
                  <th className="px-3 py-2 text-left">Đảng viên</th>
                  <th className="px-3 py-2 text-left">Trạng thái</th>
                  <th className="px-3 py-2 text-left">Thời gian</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {delegates.map((delegate) => (
                  <tr key={delegate.id} className={delegate.checkedIn ? 'bg-green-50' : ''}>
                    <td className="px-3 py-2 font-medium">{delegate.delegateCode}</td>
                    <td className="px-3 py-2">{delegate.fullName}</td>
                    <td className="px-3 py-2 text-xs">{delegate.unit.replace('Khoa ', '')}</td>
                    <td className="px-3 py-2">{delegate.gender}</td>
                    <td className="px-3 py-2">
                      {delegate.partyMember ? (
                        <span className="text-red-600">✓</span>
                      ) : (
                        <span className="text-gray-400">-</span>
                      )}
                    </td>
                    <td className="px-3 py-2">
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
                    <td className="px-3 py-2 text-xs">
                      {delegate.checkinTime ? 
                        new Date(delegate.checkinTime).toLocaleString('vi-VN') : 
                        '-'
                      }
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default StatisticsPage;
