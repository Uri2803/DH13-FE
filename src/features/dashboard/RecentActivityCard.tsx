// src/pages/dashboard/RecentActivityCard.tsx
import React from 'react';
import { Card } from '../../components/base/Card';
import { ActivityItem, formatTimeAgo } from './funtion';

interface RecentActivityCardProps {
  activities: ActivityItem[];
  loading: boolean;
}

export const RecentActivityCard: React.FC<RecentActivityCardProps> = ({
  activities,
  loading,
}) => {
  return (
    <Card>
      <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
        <i className="ri-time-line text-blue-500 mr-2"></i>
        Hoạt động gần đây
      </h3>
      <div className="space-y-3">
        {loading ? (
          <div className="text-gray-400 text-sm">
            Đang tải hoạt động...
          </div>
        ) : activities.length === 0 ? (
          <div className="text-gray-400 text-sm">
            Chưa có hoạt động mới
          </div>
        ) : (
          activities.map((activity) => (
            <div
              key={activity.id}
              className="flex items-center space-x-3 text-sm"
            >
              <div
                className={`w-2 h-2 rounded-full ${
                  activity.type === 'checkin'
                    ? 'bg-green-500'
                    : 'bg-pink-500'
                }`}
              ></div>
              <span className="text-gray-600 flex-1 truncate">
                {activity.content}
              </span>
              <span className="text-gray-400 whitespace-nowrap text-xs">
                {formatTimeAgo(activity.time)}
              </span>
            </div>
          ))
        )}
      </div>
    </Card>
  );
};
