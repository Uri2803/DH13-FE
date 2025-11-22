// src/pages/dashboard/QuickActionsSection.tsx
import React from 'react';
import { Link } from 'react-router-dom';
import { Card } from '../../components/base/Card';


type QuickAction = {
  title: string;
  description: string;
  icon: string;
  link: string;
  color: string;
};

interface DashboardQuickActionsProps {
  actions: QuickAction[];
}

export const DashboardQuickActions: React.FC<DashboardQuickActionsProps> = ({
  actions,
}) => {
  if (!actions || actions.length === 0) return null;

  return (
    <div className="mb-8">
      <h2 className="text-xl font-semibold text-gray-800 mb-4">
        Thao tác nhanh
      </h2>
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {actions.map((action, index) => (
          <Link key={index} to={action.link}>
            <Card className="hover:shadow-lg transition-shadow cursor-pointer">
              <div className="flex items-start space-x-4">
                <div
                  className={`w-12 h-12 ${action.color} rounded-lg flex items-center justify-center`}
                >
                  <i className={`${action.icon} text-white text-xl`}></i>
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-800 mb-1">
                    {action.title}
                  </h3>
                  <p className="text-sm text-gray-600">
                    {action.description}
                  </p>
                </div>
                <i className="ri-arrow-right-line text-gray-400"></i>
              </div>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
};
