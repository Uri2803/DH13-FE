
import { RouteObject } from 'react-router-dom';
import { lazy } from 'react';

// Lazy load components
const HomePage = lazy(() => import('../features/home/page'));
const LoginPage = lazy(() => import('../features/login/page'));
const DashboardPage = lazy(() => import('../features/dashboard/page'));
const ProfilePage = lazy(() => import('../features/profile/page'));
const WishesPage = lazy(() => import('../features/wishes/page'));
const DocumentsPage = lazy(() => import('../features/documents/page'));
const CheckinPage = lazy(() => import('../features/checkin/page'));
const StatisticsPage = lazy(() => import('../features/statistics/page'));
const ManagePage = lazy(() => import('../features/manage/page'));
const CongressUpdatesPage = lazy(() => import('../features/congress-updates/page'));
const CongressInfoPage = lazy(() => import('../features/congress-info/page'));
// const NotFoundPage = lazy(() => import('../pages/NotFound'));

const routes: RouteObject[] = [
  {
    path: '/',
    element: <HomePage />
  },
  {
    path: '/login',
    element: <LoginPage />
  },
  {
    path: '/dashboard',
    element: <DashboardPage />
  },
  {
    path: '/profile',
    element: <ProfilePage />
  },
  {
    path: '/wishes',
    element: <WishesPage />
  },
  {
    path: '/documents',
    element: <DocumentsPage />
  },
  {
    path: '/checkin',
    element: <CheckinPage />
  },
  {
    path: '/statistics',
    element: <StatisticsPage />
  },
  {
    path: '/manage',
    element: <ManagePage />
  },
  {
    path: '/congress-updates',
    element: <CongressUpdatesPage />
  },
  {
    path: '/congress-info',
    element: <CongressInfoPage />
  },
//   {
//     path: '*',
//     element: <NotFoundPage />
//   }
];

export default routes;
