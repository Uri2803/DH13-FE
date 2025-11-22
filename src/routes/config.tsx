
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
const CheckinDisplay = lazy(() => import ('../features/checkin/CheckinDisplay'))
const HeroImagesPage = lazy(()=> import ('../features/hero-image/HeroImagesPage'))
const AdminWishesPage = lazy(()=> import('../features/wishes/AdminWishesPage'))
import { ProtectedRoute } from "./ProtectedRoute";


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
    element: 
    <ProtectedRoute>
       <DashboardPage />
    </ProtectedRoute>
   
  },
  {
    path: '/profile',
    element: <ProtectedRoute>
          <ProfilePage />
        </ProtectedRoute>
   
  },
  {
    path: '/wishes',
    element: <WishesPage />
  },
  {
    path: '/documents',
    element:   
      <ProtectedRoute>
        <DocumentsPage />
      </ProtectedRoute>
    
  },
  {
    path: '/checkin',
    element: 
    <ProtectedRoute>
      <CheckinPage />
    </ProtectedRoute>
    
  },
  {
    path: '/statistics',
    element: <ProtectedRoute>
      <StatisticsPage />
    </ProtectedRoute>
  },
  {
    path: '/manage',
    element: <ProtectedRoute>
      <ManagePage />
    </ProtectedRoute>
  },
  {
    path: '/congress-info',
    element: <ProtectedRoute>
      <CongressInfoPage />
    </ProtectedRoute>
    
  },
   {
    path: '/checkin-display',
    element: <ProtectedRoute>
      <CheckinDisplay />
    </ProtectedRoute>
  },{
    path: '/hero-images',
    element: <ProtectedRoute>
      <HeroImagesPage />
    </ProtectedRoute>
  },
  {
    path: '/admin/wishes',
    element: <AdminWishesPage />
  },
//   {
//     path: '*',
//     element: <NotFoundPage />
//   }
];

export default routes;
