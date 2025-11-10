// src/pages/statistics/StatisticsPage.tsx
import React, { useEffect, useMemo, useState } from 'react';
import { Navigation } from '../../components/feature/Navigation';
import { Card } from '../../components/base/Card';
import { Button } from '../../components/base/Button';
import { useAuth } from '../../hooks/useAuth';
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { getSocket } from '../../utils/socket';
import { fetchDelegatesAll, fetchDelegatesByDepartment, DelegateRow } from '../../services/delegates';

const StatisticsPage: React.FC = () => {
  const { user } = useAuth();
  const [delegates, setDelegates] = useState<DelegateRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string>('');
  const [selectedPeriod, setSelectedPeriod] = useState<'today' | 'all'>('today');
  const [conn, setConn] = useState<'connecting' | 'connected' | 'disconnected'>('connecting');

  // ======= Load dữ liệu thật từ BE =======
  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        setLoading(true);
        setErr('');
        if (!user) {
          setErr('Vui lòng đăng nhập');
          return;
        }

        let rows: DelegateRow[] = [];
        if (user.role === 'admin') {
          rows = await fetchDelegatesAll();
        } else if (user.role === 'department' && (user as any).department?.id) {
          rows = await fetchDelegatesByDepartment((user as any).department.id);
        } else if ((user as any).department?.id) {
          // fallback: nếu vai trò khác nhưng vẫn muốn xem theo khoa của mình
          rows = await fetchDelegatesByDepartment((user as any).department.id);
        } else {
          rows = []; // không có scope phù hợp
        }

        if (alive) setDelegates(rows);
      } catch (e: any) {
        if (alive) setErr(e?.message || 'Không tải được dữ liệu');
      } finally {
        if (alive) setLoading(false);
      }
    })();
    return () => { alive = false; };
  }, [user]);

  // ======= Realtime: checkin.updated (delegateId = delegate_info.id) =======
  useEffect(() => {
    const s = getSocket(); // đảm bảo s.auth.token = cookie Authentication (nếu BE yêu cầu)
    const onConnect = () => setConn('connected');
    const onDisconnect = () => setConn('disconnected');
    const onUpdate = (evt: { delegateId: number | string; checkedIn: boolean; checkinTime?: string | null }) => {
      setDelegates((prev) =>
        prev.map((x) =>
          String(x.id) === String(evt.delegateId)
            ? { ...x, checkedIn: evt.checkedIn, checkinTime: evt.checkinTime ?? null }
            : x
        )
      );
    };

    s.on('connect', onConnect);
    s.on('disconnect', onDisconnect);
    s.on('checkin.updated', onUpdate);

    return () => {
      s.off('connect', onConnect);
      s.off('disconnect', onDisconnect);
      s.off('checkin.updated', onUpdate);
    };
  }, []);

  // ======= Derive stats =======
  const checkedInDelegates = useMemo(() => delegates.filter((d) => d.checkedIn), [delegates]);
  const totalDelegates = delegates.length;
  const attendanceRate = Math.round((checkedInDelegates.length / Math.max(totalDelegates, 1)) * 100);

  const genderStats = useMemo(
    () => [
      { name: 'Nam', value: checkedInDelegates.filter((d) => d.gender === 'Nam').length, color: '#3B82F6' },
      { name: 'Nữ', value: checkedInDelegates.filter((d) => d.gender === 'Nữ').length, color: '#EC4899' },
    ],
    [checkedInDelegates]
  );

  const membershipStats = useMemo(
    () => [
      { name: 'Đảng viên', value: checkedInDelegates.filter((d) => d.partyMember).length, color: '#DC2626' },
      { name: 'Đoàn viên', value: checkedInDelegates.filter((d) => !d.partyMember).length, color: '#059669' },
    ],
    [checkedInDelegates]
  );

  const facultyStats = useMemo(() => {
    const acc: any[] = [];
    for (const d of delegates) {
      const key = d.unit || '';
      const name = key.replace?.('Khoa ', '') ?? key;
      let ex = acc.find((x) => x.name === name);
      if (!ex) { ex = { name, total: 0, checkedIn: 0 }; acc.push(ex); }
      ex.total += 1;
      if (d.checkedIn) ex.checkedIn += 1;
    }
    return acc;
  }, [delegates]);

  const getAge = (birthDate?: string) => {
    if (!birthDate) return 0;
    const dt = new Date(birthDate);
    if (isNaN(dt.getTime())) return 0;
    return new Date().getFullYear() - dt.getFullYear();
  };

  const oldestDelegate = useMemo(
    () => (delegates.length ? delegates.reduce((a, b) => (getAge(b.birthDate) > getAge(a.birthDate) ? b : a)) : undefined),
    [delegates]
  );

  const ageStats = useMemo(() => {
    const ages = checkedInDelegates.map((d) => getAge(d.birthDate));
    return [
      { name: '20-21 tuổi', value: ages.filter((age) => age >= 20 && age <= 21).length },
      { name: '22-23 tuổi', value: ages.filter((age) => age >= 22 && age <= 23).length },
      { name: '24+ tuổi', value: ages.filter((age) => age >= 24).length },
    ];
  }, [checkedInDelegates]);

  // ======= UI =======
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navigation />
        <div className="container mx-auto px-4 py-12 text-center text-gray-600">
          <i className="ri-loader-4-line animate-spin mr-2" />
          Đang tải thống kê...
        </div>
      </div>
    );
  }

  if (err) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navigation />
        <div className="container mx-auto px-4 py-12">
          <div className="bg-red-50 text-red-700 border border-red-200 rounded-md p-4">{err}</div>
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
            <h1 className="text-3xl font-bold text-gray-800 mb-2">Thống kê tham gia</h1>
            <p className="text-gray-600">
              Báo cáo chi tiết về tình hình tham gia đại hội ·{' '}
              <span className={conn === 'connected' ? 'text-green-600' : conn === 'connecting' ? 'text-yellow-600' : 'text-red-600'}>
                {conn === 'connected' ? 'Realtime: đã kết nối' : conn === 'connecting' ? 'Realtime: đang kết nối...' : 'Realtime: ngắt kết nối'}
              </span>
            </p>
          </div>
          <div className="flex space-x-2">
            <Button variant={selectedPeriod === 'today' ? 'primary' : 'secondary'} onClick={() => setSelectedPeriod('today')} size="sm">
              Hôm nay
            </Button>
            <Button variant={selectedPeriod === 'all' ? 'primary' : 'secondary'} onClick={() => setSelectedPeriod('all')} size="sm">
              Tổng thể
            </Button>
          </div>
        </div>

        {/* Overview */}
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
              {checkedInDelegates.filter((d) => d.partyMember).length}
            </div>
            <div className="text-sm text-gray-600">Đảng viên</div>
          </Card>
          <Card className="text-center">
            <div className="text-2xl font-bold text-red-600 mb-1">{oldestDelegate ? getAge(oldestDelegate.birthDate) : '-'}</div>
            <div className="text-sm text-gray-600">Tuổi cao nhất</div>
          </Card>
        </div>

        <div className="grid lg:grid-cols-2 gap-8 mb-8">
          {/* Gender */}
          <Card>
            <h3 className="text-lg font-semibold mb-4 flex items-center">
              <i className="ri-user-line text-blue-500 mr-2" />
              Phân bố theo giới tính
            </h3>
            <div className="flex items-center justify-between">
              <ResponsiveContainer width="60%" height={200}>
                <PieChart>
                  <Pie data={genderStats} cx="50%" cy="50%" outerRadius={80} dataKey="value">
                    {genderStats.map((entry, i) => <Cell key={i} fill={entry.color} />)}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
              <div className="space-y-3">
                {genderStats.map((st, i) => (
                  <div key={i} className="flex items-center">
                    <div className="w-4 h-4 rounded-full mr-2" style={{ backgroundColor: st.color }} />
                    <span className="text-sm">{st.name}: {st.value} người</span>
                  </div>
                ))}
              </div>
            </div>
          </Card>

          {/* Membership */}
          <Card>
            <h3 className="text-lg font-semibold mb-4 flex items-center">
              <i className="ri-shield-star-line text-red-500 mr-2" />
              Đảng viên / Đoàn viên
            </h3>
            <div className="flex items-center justify-between">
              <ResponsiveContainer width="60%" height={200}>
                <PieChart>
                  <Pie data={membershipStats} cx="50%" cy="50%" outerRadius={80} dataKey="value">
                    {membershipStats.map((entry, i) => <Cell key={i} fill={entry.color} />)}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
              <div className="space-y-3">
                {membershipStats.map((st, i) => (
                  <div key={i} className="flex items-center">
                    <div className="w-4 h-4 rounded-full mr-2" style={{ backgroundColor: st.color }} />
                    <span className="text-sm">{st.name}: {st.value} người</span>
                  </div>
                ))}
              </div>
            </div>
          </Card>
        </div>

        {/* Faculty */}
        <Card className="mb-8">
          <h3 className="text-lg font-semibold mb-4 flex items-center">
            <i className="ri-building-line text-green-500 mr-2" />
            Tỷ lệ tham gia theo khoa
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={facultyStats}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis allowDecimals={false} />
              <Tooltip />
              <Legend />
              <Bar dataKey="total" fill="#E5E7EB" name="Tổng số" />
              <Bar dataKey="checkedIn" fill="#3B82F6" name="Đã tham gia" />
            </BarChart>
          </ResponsiveContainer>
        </Card>

        {/* Age */}
        <Card className="mb-8">
          <h3 className="text-lg font-semibold mb-4 flex items-center">
            <i className="ri-calendar-line text-purple-500 mr-2" />
            Phân bố theo độ tuổi
          </h3>
          <div className="grid grid-cols-3 gap-4">
            {ageStats.map((st, i) => (
              <div key={i} className="text-center p-4 bg-gray-50 rounded-lg">
                <div className="text-2xl font-bold text-purple-600 mb-1">{st.value}</div>
                <div className="text-sm text-gray-600">{st.name}</div>
              </div>
            ))}
          </div>
          {oldestDelegate && (
            <div className="mt-4 p-3 bg-blue-50 rounded-lg">
              <div className="text-sm text-blue-800">
                <strong>Đại biểu có tuổi cao nhất:</strong> {oldestDelegate.fullName} - {getAge(oldestDelegate.birthDate)} tuổi ({oldestDelegate.unit})
              </div>
            </div>
          )}
        </Card>

        {/* Table */}
        <Card>
          <h3 className="text-lg font-semibold mb-4 flex items-center">
            <i className="ri-list-check-2 text-orange-500 mr-2" />
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
                {delegates.map((d) => (
                  <tr key={d.id} className={d.checkedIn ? 'bg-green-50' : ''}>
                    <td className="px-3 py-2 font-medium">{d.delegateCode}</td>
                    <td className="px-3 py-2">{d.fullName}</td>
                    <td className="px-3 py-2 text-xs">{d.unit?.replace?.('Khoa ', '') ?? d.unit}</td>
                    <td className="px-3 py-2">{d.gender}</td>
                    <td className="px-3 py-2">{d.partyMember ? <span className="text-red-600">✓</span> : <span className="text-gray-400">-</span>}</td>
                    <td className="px-3 py-2">
                      {d.checkedIn ? (
                        <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full">Đã tham gia</span>
                      ) : (
                        <span className="bg-gray-100 text-gray-600 text-xs px-2 py-1 rounded-full">Chưa tham gia</span>
                      )}
                    </td>
                    <td className="px-3 py-2 text-xs">{d.checkinTime ? new Date(d.checkinTime).toLocaleString('vi-VN') : '-'}</td>
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
