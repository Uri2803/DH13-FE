import { Card } from '../../components/base/Card';

type DashboardStats = {
  totalDelegates: number;
  checkedInCount: number;
  participationRate: number;
  totalWishes: number;
};

interface AdminStatsGridProps {
  loading: boolean;
  stats: DashboardStats;
}

export const AdminStatsGrid: React.FC<AdminStatsGridProps> = ({ loading, stats }) => {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
      <Card className="text-center">
        <div className="text-2xl font-bold text-blue-600 mb-1">
          {loading ? '...' : stats.totalDelegates}
        </div>
        <div className="text-sm text-gray-600">Tổng đại biểu</div>
      </Card>
      <Card className="text-center">
        <div className="text-2xl font-bold text-green-600 mb-1">
          {loading ? '...' : stats.checkedInCount}
        </div>
        <div className="text-sm text-gray-600">Đã điểm danh</div>
      </Card>
      <Card className="text-center">
        <div className="text-2xl font-bold text-purple-600 mb-1">
          {loading ? '...' : `${stats.participationRate}%`}
        </div>
        <div className="text-sm text-gray-600">Tỷ lệ tham gia</div>
      </Card>
      <Card className="text-center">
        <div className="text-2xl font-bold text-orange-600 mb-1">
          {loading ? '...' : stats.totalWishes}
        </div>
        <div className="text-sm text-gray-600">Lời chúc</div>
      </Card>
    </div>
  );
};
