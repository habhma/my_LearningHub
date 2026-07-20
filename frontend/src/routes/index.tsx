import { Routes, Route, Navigate } from 'react-router-dom';
import { lazy, Suspense } from 'react';
import ProtectedRoute from '@/components/common/ProtectedRoute';
import PublicRoute from '@/components/common/PublicRoute';
import LoadingSpinner from '@/components/common/LoadingSpinner';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { UserRole } from '@/types';

// Lazy load pages for code splitting
const Login = lazy(() => import('@/pages/auth/Login'));
const Register = lazy(() => import('@/pages/auth/Register'));
const ForgotPassword = lazy(() => import('@/pages/auth/ForgotPassword'));
const ResetPassword = lazy(() => import('@/pages/auth/ResetPassword'));

// Student pages
const StudentDashboard = lazy(() => import('@/pages/student/Dashboard'));
const StudentAssessments = lazy(() => import('@/pages/student/Assessments'));
const TakeAssessment = lazy(() => import('@/pages/student/TakeAssessment'));
const StudentResults = lazy(() => import('@/pages/student/Results'));
const ResultDetail = lazy(() => import('@/pages/student/ResultDetail'));
const StudentProfile = lazy(() => import('@/pages/student/Profile'));
const SelectSportsStars = lazy(() => import('@/pages/student/SelectSportsStars'));

// Admin pages
const AdminDashboard = lazy(() => import('@/pages/admin/Dashboard'));
const AdminAssessments = lazy(() => import('@/pages/admin/Assessments'));
const CreateAssessment = lazy(() => import('@/pages/admin/CreateAssessment'));
const EditAssessment = lazy(() => import('@/pages/admin/EditAssessment'));
const ManageAssessmentQuestions = lazy(() => import('@/pages/admin/ManageAssessmentQuestions'));
const AdminQuestions = lazy(() => import('@/pages/admin/Questions'));
const CreateQuestion = lazy(() => import('@/pages/admin/CreateQuestion'));
const EditQuestion = lazy(() => import('@/pages/admin/EditQuestion'));
const AdminSubmissions = lazy(() => import('@/pages/admin/Submissions'));
const AdminUsers = lazy(() => import('@/pages/admin/Users'));
const AdminAnalytics = lazy(() => import('@/pages/admin/Analytics'));

// Error pages
const NotFound = lazy(() => import('@/pages/errors/NotFound'));
const Unauthorized = lazy(() => import('@/pages/errors/Unauthorized'));

function AppRoutes() {
  return (
    <Suspense fallback={<LoadingSpinner fullScreen />}>
      <Routes>
        {/* Public routes */}
        <Route
          path="/login"
          element={
            <PublicRoute>
              <Login />
            </PublicRoute>
          }
        />
        <Route
          path="/register"
          element={
            <PublicRoute>
              <Register />
            </PublicRoute>
          }
        />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password/:token" element={<ResetPassword />} />

        {/* Student routes */}
        <Route
          path="/student"
          element={
            <ProtectedRoute allowedRoles={[UserRole.STUDENT]}>
              <DashboardLayout>
                <StudentDashboard />
              </DashboardLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/student/assessments"
          element={
            <ProtectedRoute allowedRoles={[UserRole.STUDENT]}>
              <DashboardLayout>
                <StudentAssessments />
              </DashboardLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/student/assessments/:id/take"
          element={
            <ProtectedRoute allowedRoles={[UserRole.STUDENT]}>
              <DashboardLayout>
                <TakeAssessment />
              </DashboardLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/student/results"
          element={
            <ProtectedRoute allowedRoles={[UserRole.STUDENT]}>
              <DashboardLayout>
                <StudentResults />
              </DashboardLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/student/results/:id"
          element={
            <ProtectedRoute allowedRoles={[UserRole.STUDENT]}>
              <DashboardLayout>
                <ResultDetail />
              </DashboardLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/student/profile"
          element={
            <ProtectedRoute allowedRoles={[UserRole.STUDENT]}>
              <DashboardLayout>
                <StudentProfile />
              </DashboardLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/student/select-sports-stars"
          element={
            <ProtectedRoute allowedRoles={[UserRole.STUDENT]}>
              <SelectSportsStars />
            </ProtectedRoute>
          }
        />

        {/* Admin routes */}
        <Route
          path="/admin"
          element={
            <ProtectedRoute allowedRoles={[UserRole.ADMIN]}>
              <DashboardLayout>
                <AdminDashboard />
              </DashboardLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/assessments"
          element={
            <ProtectedRoute allowedRoles={[UserRole.ADMIN]}>
              <DashboardLayout>
                <AdminAssessments />
              </DashboardLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/assessments/create"
          element={
            <ProtectedRoute allowedRoles={[UserRole.ADMIN]}>
              <DashboardLayout>
                <CreateAssessment />
              </DashboardLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/assessments/:id/edit"
          element={
            <ProtectedRoute allowedRoles={[UserRole.ADMIN]}>
              <DashboardLayout>
                <EditAssessment />
              </DashboardLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/assessments/:id/questions"
          element={
            <ProtectedRoute allowedRoles={[UserRole.ADMIN]}>
              <DashboardLayout>
                <ManageAssessmentQuestions />
              </DashboardLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/questions"
          element={
            <ProtectedRoute allowedRoles={[UserRole.ADMIN]}>
              <DashboardLayout>
                <AdminQuestions />
              </DashboardLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/questions/create"
          element={
            <ProtectedRoute allowedRoles={[UserRole.ADMIN]}>
              <DashboardLayout>
                <CreateQuestion />
              </DashboardLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/questions/:id/edit"
          element={
            <ProtectedRoute allowedRoles={[UserRole.ADMIN]}>
              <DashboardLayout>
                <EditQuestion />
              </DashboardLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/submissions"
          element={
            <ProtectedRoute allowedRoles={[UserRole.ADMIN]}>
              <DashboardLayout>
                <AdminSubmissions />
              </DashboardLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/users"
          element={
            <ProtectedRoute allowedRoles={[UserRole.ADMIN]}>
              <DashboardLayout>
                <AdminUsers />
              </DashboardLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/analytics"
          element={
            <ProtectedRoute allowedRoles={[UserRole.ADMIN]}>
              <DashboardLayout>
                <AdminAnalytics />
              </DashboardLayout>
            </ProtectedRoute>
          }
        />

        {/* Error routes */}
        <Route path="/unauthorized" element={<Unauthorized />} />
        <Route path="/404" element={<NotFound />} />

        {/* Default redirects */}
        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="*" element={<Navigate to="/404" replace />} />
      </Routes>
    </Suspense>
  );
}

export default AppRoutes;
