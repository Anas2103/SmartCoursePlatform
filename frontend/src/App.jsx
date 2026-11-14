import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Suspense, lazy } from 'react';

// Layouts
import PublicLayout from '@/components/layout/PublicLayout';
import DashboardLayout from '@/components/layout/DashboardLayout';
import LoadingScreen from '@/components/common/LoadingScreen';

// Auth Pages
import Login from '@/pages/auth/Login';
import Register from '@/pages/auth/Register';
import ForgotPassword from '@/pages/auth/ForgotPassword';
import ResetPassword from '@/pages/auth/ResetPassword';

// Public Pages
import Landing from '@/pages/public/Landing';
import About from '@/pages/public/About';
import Contact from '@/pages/public/Contact';
import Pricing from '@/pages/public/Pricing';
import CourseCatalog from '@/pages/public/CourseCatalog';
import CourseDetail from '@/pages/public/CourseDetail';
import LearningPaths from '@/pages/public/LearningPaths';
import LearningPathDetail from '@/pages/public/LearningPathDetail';
import Bundles from '@/pages/public/Bundles';
import SubscriptionPage from '@/pages/public/Subscription';
import Terms from '@/pages/public/Terms';
import Privacy from '@/pages/public/Privacy';
import Cookies from '@/pages/public/Cookies';
import NotFound from '@/pages/public/NotFound';

// Student Pages
import StudentDashboard from '@/pages/student/Dashboard';
import MyCourses from '@/pages/student/MyCourses';
import CoursePlayer from '@/pages/student/CoursePlayer';
import StudentProfile from '@/pages/student/Profile';
import Certificates from '@/pages/student/Certificates';
import Wishlist from '@/pages/student/Wishlist';
import QuizPage from '@/pages/student/QuizPage';
import Forum from '@/pages/student/Forum';
import DiscussionDetail from '@/pages/student/DiscussionDetail';
import Leaderboard from '@/pages/student/Leaderboard';
import LiveClasses from '@/pages/student/LiveClasses';

// Teacher Pages
import TeacherDashboard from '@/pages/teacher/Dashboard';
import TeacherCourses from '@/pages/teacher/Courses';
import CreateCourse from '@/pages/teacher/CreateCourse';
import EditCourse from '@/pages/teacher/EditCourse';
import TeacherStudents from '@/pages/teacher/Students';
import TeacherAnalytics from '@/pages/teacher/Analytics';
import TeacherLiveSessions from '@/pages/teacher/LiveSessions';

// Admin Pages
import AdminDashboard from '@/pages/admin/Dashboard';
import AdminUsers from '@/pages/admin/Users';
import AdminCourses from '@/pages/admin/Courses';
import AdminCategories from '@/pages/admin/Categories';
import AdminPayments from '@/pages/admin/Payments';
import AdminSettings from '@/pages/admin/Settings';
import AdminReports from '@/pages/admin/Reports';
import AdminCoupons from '@/pages/admin/Coupons';
import AdminBundles from '@/pages/admin/Bundles';
import AdminLearningPaths from '@/pages/admin/LearningPaths';

const ProtectedRoute = ({ children, roles }) => {
  const { isAuthenticated, user, loading } = useAuth();
  if (loading) return <LoadingScreen />;
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  if (roles && !roles.includes(user?.role)) {
    if (user?.role === 'student') return <Navigate to="/student/dashboard" replace />;
    if (user?.role === 'teacher') return <Navigate to="/teacher/dashboard" replace />;
    if (['admin', 'super-admin'].includes(user?.role)) return <Navigate to="/admin/dashboard" replace />;
    return <Navigate to="/" replace />;
  }
  return children;
};

const GuestRoute = ({ children }) => {
  const { isAuthenticated, user, loading } = useAuth();
  if (loading) return <LoadingScreen />;
  if (isAuthenticated) {
    if (user?.role === 'student') return <Navigate to="/student/dashboard" replace />;
    if (user?.role === 'teacher') return <Navigate to="/teacher/dashboard" replace />;
    if (['admin', 'super-admin'].includes(user?.role)) return <Navigate to="/admin/dashboard" replace />;
  }
  return children;
};

export default function App() {
  return (
    <Suspense fallback={<LoadingScreen />}>
      <Routes>
        {/* Public Routes */}
        <Route element={<PublicLayout />}>
          <Route path="/" element={<Landing />} />
          <Route path="/about" element={<About />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/pricing" element={<Pricing />} />
          <Route path="/courses" element={<CourseCatalog />} />
          <Route path="/courses/:slug" element={<CourseDetail />} />
          <Route path="/learning-paths" element={<LearningPaths />} />
          <Route path="/learning-paths/:slug" element={<LearningPathDetail />} />
          <Route path="/bundles" element={<Bundles />} />
          <Route path="/subscription" element={<SubscriptionPage />} />
          <Route path="/terms" element={<Terms />} />
          <Route path="/privacy" element={<Privacy />} />
          <Route path="/cookies" element={<Cookies />} />
        </Route>

        {/* Guest-only routes */}
        <Route path="/login" element={<GuestRoute><Login /></GuestRoute>} />
        <Route path="/register" element={<GuestRoute><Register /></GuestRoute>} />
        <Route path="/forgot-password" element={<GuestRoute><ForgotPassword /></GuestRoute>} />
        <Route path="/reset-password" element={<GuestRoute><ResetPassword /></GuestRoute>} />

        {/* Course Player - standalone full-screen route */}
        <Route path="/student/courses/:courseId/learn" element={
          <ProtectedRoute roles={['student']}>
            <CoursePlayer />
          </ProtectedRoute>
        } />

        {/* Student Routes */}
        <Route path="/student" element={
          <ProtectedRoute roles={['student']}>
            <DashboardLayout role="student" />
          </ProtectedRoute>
        }>
          <Route index element={<Navigate to="dashboard" replace />} />
          <Route path="dashboard" element={<StudentDashboard />} />
          <Route path="courses" element={<MyCourses />} />
          <Route path="quizzes/:quizId" element={<QuizPage />} />
          <Route path="certificates" element={<Certificates />} />
          <Route path="wishlist" element={<Wishlist />} />
          <Route path="forum" element={<Forum />} />
          <Route path="discussions/:id" element={<DiscussionDetail />} />
          <Route path="leaderboard" element={<Leaderboard />} />
          <Route path="live-classes" element={<LiveClasses />} />
          <Route path="profile" element={<StudentProfile />} />
        </Route>

        {/* Teacher Routes */}
        <Route path="/teacher" element={
          <ProtectedRoute roles={['teacher']}>
            <DashboardLayout role="teacher" />
          </ProtectedRoute>
        }>
          <Route index element={<Navigate to="dashboard" replace />} />
          <Route path="dashboard" element={<TeacherDashboard />} />
          <Route path="courses" element={<TeacherCourses />} />
          <Route path="courses/create" element={<CreateCourse />} />
          <Route path="courses/:id/edit" element={<EditCourse />} />
          <Route path="students" element={<TeacherStudents />} />
          <Route path="analytics" element={<TeacherAnalytics />} />
          <Route path="live-sessions" element={<TeacherLiveSessions />} />
          <Route path="profile" element={<StudentProfile />} />
        </Route>

        {/* Admin Routes */}
        <Route path="/admin" element={
          <ProtectedRoute roles={['admin', 'super-admin']}>
            <DashboardLayout role="admin" />
          </ProtectedRoute>
        }>
          <Route index element={<Navigate to="dashboard" replace />} />
          <Route path="dashboard" element={<AdminDashboard />} />
          <Route path="users" element={<AdminUsers />} />
          <Route path="courses" element={<AdminCourses />} />
          <Route path="categories" element={<AdminCategories />} />
          <Route path="payments" element={<AdminPayments />} />
          <Route path="coupons" element={<AdminCoupons />} />
          <Route path="bundles" element={<AdminBundles />} />
          <Route path="learning-paths" element={<AdminLearningPaths />} />
          <Route path="reports" element={<AdminReports />} />
          <Route path="settings" element={<AdminSettings />} />
          <Route path="profile" element={<StudentProfile />} />
        </Route>

        {/* 404 */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </Suspense>
  );
}
