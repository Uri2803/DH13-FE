import React, { useEffect, useMemo, useState } from 'react';
import { Navigation } from '../../components/feature/Navigation';
import { Card } from '../../components/base/Card';
import { Button } from '../../components/base/Button';
import { useAuth } from '../../hooks/useAuth';
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
} from 'recharts';
import { getSocket } from '../../utils/socket';
import { fetchDelegatesAll, fetchDelegatesByDepartment, DelegateRow } from '../../services/delegates';

const StatisticsPage: React.FC = () => {
  const { user } = useAuth();
  const [delegates, setDelegates] = useState<DelegateRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string>('');
  const [selectedPeriod, setSelectedPeriod] = useState<'today' | 'all'>('all');
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
          rows = await fetchDelegatesByDepartment((user as any).department.id);
        } else {
          rows = [];
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

  // ======= Realtime: checkin.updated =======
  useEffect(() => {
    const s = getSocket();
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

    setConn(s.connected ? 'connected' : 'connecting');
    s.on('connect', onConnect);
    s.on('disconnect', onDisconnect);
    s.on('checkin.updated', onUpdate);

    return () => {
      s.off('connect', onConnect);
      s.off('disconnect', onDisconnect);
      s.off('checkin.updated', onUpdate);
    };
  }, []);

  // ======= Helpers & Stats =======
  const totalDelegates = delegates.length;
  const checkedInDelegates = useMemo(
    () => delegates.filter((d) => d.checkedIn),
    [delegates]
  );
  const totalPresent = checkedInDelegates.length;
  const attendanceRate = totalDelegates
    ? Math.round((totalPresent / totalDelegates) * 100)
    : 0;

  const femaleTotal = useMemo(
    () => delegates.filter((d) => d.gender === 'Nữ').length,
    [delegates]
  );
  const femaleRate = totalDelegates
    ? Math.round((femaleTotal / totalDelegates) * 100)
    : 0;

  const partyTotal = useMemo(
    () => delegates.filter((d) => d.partyMember).length,
    [delegates]
  );
  const partyRate = totalDelegates
    ? Math.round((partyTotal / totalDelegates) * 100)
    : 0;

  const getAge = (birthDate?: string) => {
    if (!birthDate) return 0;
    const dt = new Date(birthDate);
    if (isNaN(dt.getTime())) return 0;
    const now = new Date();
    let age = now.getFullYear() - dt.getFullYear();
    const m = now.getMonth() - dt.getMonth();
    if (m < 0 || (m === 0 && now.getDate() < dt.getDate())) age--;
    return age;
  };

  const ageInfo = useMemo(() => {
    const list = delegates
      .map((d) => ({ d, age: getAge(d.birthDate ?? undefined) }))
      .filter((x) => x.age > 0);

    if (!list.length) {
      return {
        avg: 0,
        oldest: undefined as DelegateRow | undefined,
        youngest: undefined as DelegateRow | undefined,
      };
    }

    const totalAge = list.reduce((sum, item) => sum + item.age, 0);
    const avg = Math.round((totalAge / list.length) * 10) / 10;

    const oldest = list.reduce((a, b) => (b.age > a.age ? b : a)).d;
    const youngest = list.reduce((a, b) => (b.age < a.age ? b : a)).d;

    return { avg, oldest, youngest };
  }, [delegates]);

  // Charts data
  const attendancePieData = [
    {
      name: 'Có mặt',
      value: totalPresent,
      color: '#22C55E',
    },
    {
      name: 'Vắng',
      value: Math.max(totalDelegates - totalPresent, 0),
      color: '#E5E7EB',
    },
  ];

  const genderPieData = [
    {
      name: 'Nam',
      value: delegates.filter((d) => d.gender === 'Nam').length,
      color: '#3B82F6',
    },
    {
      name: 'Nữ',
      value: femaleTotal,
      color: '#EC4899',
    },
  ];

  const partyPieData = [
    {
      name: 'Đảng viên',
      value: partyTotal,
      color: '#DC2626',
    },
    {
      name: 'Chưa là Đảng viên',
      value: Math.max(totalDelegates - partyTotal, 0),
      color: '#10B981',
    },
  ];

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
      <div className="container mx-auto px-4 py-8 space-y-6">
        {/* Header */}
        <div className="flex flex-wrap justify-between items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-800 mb-1">Thống kê đại biểu</h1>
            <p className="text-gray-600">
              Tình hình tham dự Đại hội ·{' '}
              <span
                className={
                  conn === 'connected'
                    ? 'text-green-600'
                    : conn === 'connecting'
                    ? 'text-yellow-600'
                    : 'text-red-600'
                }
              >
                {conn === 'connected'
                  ? 'Realtime: đã kết nối'
                  : conn === 'connecting'
                  ? 'Realtime: đang kết nối...'
                  : 'Realtime: ngắt kết nối'}
              </span>
            </p>
          </div>
          <div className="flex space-x-2">
            <Button
              variant={selectedPeriod === 'all' ? 'primary' : 'secondary'}
              size="sm"
              onClick={() => setSelectedPeriod('all')}
            >
              Tổng thể
            </Button>
            <Button
              variant={selectedPeriod === 'today' ? 'primary' : 'secondary'}
              size="sm"
              onClick={() => setSelectedPeriod('today')}
              disabled
            >
              Hôm nay
            </Button>
          </div>
        </div>

        {/* Báo cáo nhanh dạng text giống mẫu */}
        <Card>
          <h2 className="text-lg font-semibold mb-3">Tóm tắt báo cáo</h2>
          <div className="space-y-1 text-sm text-gray-700">
            <p>
              • <b>Tổng số đại biểu được triệu tập:</b> {totalDelegates} đại biểu.
            </p>
            <p>
              • <b>Tổng số đại biểu có mặt tham dự đại hội:</b> {totalPresent} đại biểu,
              chiếm tỉ lệ <b>{attendanceRate}%</b>.
            </p>
            <p>
              • <b>Đại biểu nữ:</b> {femaleTotal} đại biểu, chiếm <b>{femaleRate}%</b>.
            </p>
            <p>
              • <b>Đại biểu là Đảng viên:</b> {partyTotal} đại biểu, chiếm <b>{partyRate}%</b>.
            </p>
            {ageInfo.avg > 0 && (
              <p>
                • <b>Độ tuổi trung bình:</b> {ageInfo.avg} tuổi.
              </p>
            )}
          </div>
        </Card>

        {/* Overview cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
          <Card className="text-center">
            <div className="text-2xl font-bold text-blue-600 mb-1">{totalDelegates}</div>
            <div className="text-xs text-gray-600">Tổng đại biểu</div>
          </Card>
          <Card className="text-center">
            <div className="text-2xl font-bold text-emerald-600 mb-1">{totalPresent}</div>
            <div className="text-xs text-gray-600">Có mặt</div>
          </Card>
          <Card className="text-center">
            <div className="text-2xl font-bold text-purple-600 mb-1">{attendanceRate}%</div>
            <div className="text-xs text-gray-600">Tỷ lệ tham dự</div>
          </Card>
          <Card className="text-center">
            <div className="text-2xl font-bold text-pink-600 mb-1">{femaleTotal}</div>
            <div className="text-xs text-gray-600">Đại biểu nữ</div>
          </Card>
          <Card className="text-center">
            <div className="text-2xl font-bold text-red-600 mb-1">{partyTotal}</div>
            <div className="text-xs text-gray-600">Đảng viên</div>
          </Card>
        </div>

        {/* 3 biểu đồ gọn trong 1 hàng (trên màn hình rộng) */}
        <div className="grid md:grid-cols-3 gap-6">
          {/* Attendance */}
          <Card>
            <h3 className="text-sm font-semibold mb-2 flex items-center">
              <i className="ri-pie-chart-2-line text-emerald-500 mr-2" />
              Tỷ lệ tham dự
            </h3>
            <div className="flex items-center justify-center">
              <ResponsiveContainer width="100%" height={220}>
                <PieChart>
                  <Pie
                    data={attendancePieData}
                    dataKey="value"
                    nameKey="name"
                    innerRadius={60}
                    outerRadius={90}
                  >
                    {attendancePieData.map((entry, index) => (
                      <Cell key={index} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="text-center text-sm text-gray-600 mt-[-20px]">
              Có mặt: <b>{totalPresent}</b> / {totalDelegates} ({attendanceRate}%)
            </div>
          </Card>

          {/* Gender */}
          <Card>
            <h3 className="text-sm font-semibold mb-2 flex items-center">
              <i className="ri-user-line text-blue-500 mr-2" />
              Cơ cấu giới tính
            </h3>
            <div className="flex items-center justify-center">
              <ResponsiveContainer width="100%" height={220}>
                <PieChart>
                  <Pie
                    data={genderPieData}
                    dataKey="value"
                    nameKey="name"
                    innerRadius={50}
                    outerRadius={85}
                  >
                    {genderPieData.map((entry, index) => (
                      <Cell key={index} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="flex justify-center gap-4 text-xs text-gray-600 mt-[-12px]">
              <span>Nam: {genderPieData[0].value}</span>
              <span>Nữ: {genderPieData[1].value}</span>
            </div>
          </Card>

          {/* Party */}
          <Card>
            <h3 className="text-sm font-semibold mb-2 flex items-center">
              <i className="ri-shield-star-line text-red-500 mr-2" />
              Thành phần Đảng viên
            </h3>
            <div className="flex items-center justify-center">
              <ResponsiveContainer width="100%" height={220}>
                <PieChart>
                  <Pie
                    data={partyPieData}
                    dataKey="value"
                    nameKey="name"
                    innerRadius={50}
                    outerRadius={85}
                  >
                    {partyPieData.map((entry, index) => (
                      <Cell key={index} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="text-center text-xs text-gray-600 mt-[-12px]">
              Đảng viên: <b>{partyTotal}</b> ({partyRate}%)
            </div>
          </Card>
        </div>

        {/* Tuổi đời */}
        <Card>
          <h3 className="text-sm font-semibold mb-3 flex items-center">
            <i className="ri-calendar-line text-purple-500 mr-2" />
            Thống kê tuổi đời
          </h3>
          <div className="grid md:grid-cols-3 gap-4">
            <div className="p-4 bg-purple-50 rounded-xl text-center">
              <div className="text-xs text-gray-500 mb-1">Độ tuổi trung bình</div>
              <div className="text-2xl font-bold text-purple-700">
                {ageInfo.avg > 0 ? `${ageInfo.avg} tuổi` : '-'}
              </div>
            </div>
            <div className="p-4 bg-blue-50 rounded-xl text-center">
              <div className="text-xs text-gray-500 mb-1">Tuổi cao nhất</div>
              {ageInfo.oldest ? (
                <>
                  <div className="text-xl font-semibold text-blue-700">
                    {getAge(ageInfo.oldest.birthDate?? undefined)} tuổi
                  </div>
                  <div className="text-xs text-gray-600 mt-1">
                    {ageInfo.oldest.fullName} ({ageInfo.oldest.unit})
                  </div>
                </>
              ) : (
                <div className="text-xl font-semibold text-blue-700">-</div>
              )}
            </div>
            <div className="p-4 bg-emerald-50 rounded-xl text-center">
              <div className="text-xs text-gray-500 mb-1">Tuổi thấp nhất</div>
              {ageInfo.youngest ? (
                <>
                  <div className="text-xl font-semibold text-emerald-700">
                    {getAge(ageInfo.youngest.birthDate ?? undefined)} tuổi
                  </div>
                  <div className="text-xs text-gray-600 mt-1">
                    {ageInfo.youngest.fullName} ({ageInfo.youngest.unit})
                  </div>
                </>
              ) : (
                <div className="text-xl font-semibold text-emerald-700">-</div>
              )}
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default StatisticsPage;
