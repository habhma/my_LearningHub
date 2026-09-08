import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuthStore } from '@/store/authStore';
import ThemeToggle from '@/components/common/ThemeToggle';
import toast from 'react-hot-toast';

interface LayoutProps {
  children: React.ReactNode;
}

function DashboardLayout({ children }: LayoutProps) {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuthStore();

  const isStudent = user?.role === 'STUDENT';

  const studentNav = [
    { path: '/student', label: 'Dashboard', icon: '📊' },
    { path: '/student/assessments', label: 'Assessments', icon: '📝' },
    { path: '/student/results', label: 'Results', icon: '📈' },
    { path: '/student/profile', label: 'Profile', icon: '👤' },
  ];

  const adminNav = [
    { path: '/admin', label: 'Dashboard', icon: '📊' },
    { path: '/admin/users', label: 'Users', icon: '👥' },
    { path: '/admin/questions', label: 'Questions', icon: '❓' },
    { path: '/admin/assessments', label: 'Assessments', icon: '📝' },
    { path: '/admin/analytics', label: 'Analytics', icon: '📈' },
  ];

  const navigation = isStudent ? studentNav : adminNav;

  const handleLogout = async () => {
    try {
      await logout();
      toast.success('Logged out successfully');
      navigate('/login');
    } catch (error) {
      toast.error('Logout failed');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Top Navigation Bar */}
      <nav className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <span className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                📚 Assessment Platform
              </span>
            </div>
            <div className="flex items-center gap-4">
              <div className="text-sm">
                <p className="font-medium text-gray-900 dark:text-white">
                  {user?.profile?.fullName || user?.email}
                </p>
                <p className="text-gray-500 dark:text-gray-400 text-xs">
                  {user?.role}
                </p>
              </div>
              <ThemeToggle />
              <button
                onClick={handleLogout}
                className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Navigation Tabs */}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <nav className="flex space-x-8" aria-label="Tabs">
            {navigation.map((item) => {
              const isActive = location.pathname === item.path;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`
                    py-4 px-1 border-b-2 font-medium text-sm inline-flex items-center gap-2
                    ${
                      isActive
                        ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'
                    }
                  `}
                >
                  <span>{item.icon}</span>
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </nav>
        </div>
      </div>

      {/* Main Content */}
      <main>{children}</main>
    </div>
  );
}

export default DashboardLayout;
