// tuỳ nếu bạn có sẵn type User thì import vào, còn không có thể khai báo tối thiểu như này:
type DashboardUser = {
  name: string;
  role: 'admin' | 'department' | 'delegate' | string;
  code?: string;
  department?: {
    id?: number | string;
    name?: string;
  } | null;
};

interface DashboardWelcomeSectionProps {
  user: DashboardUser;
}

export const DashboardWelcomeSection: React.FC<DashboardWelcomeSectionProps> = ({ user }) => {
  return (
    <div className="mb-8">
      <h1 className="text-xl font-bold text-gray-800 mb-2">
        Chào mừng, {user.name}!
      </h1>
      <p className="text-gray-600">
        {user.role === 'admin' && 'Quản trị viên hệ thống'}
        {user.role === 'department' &&
          `Quản lý khoa ${user.department?.name}`}
        {user.role === 'delegate' &&
          `Đại biểu ${user.code} - ${user.department?.name}`}
      </p>
    </div>
  );
};
