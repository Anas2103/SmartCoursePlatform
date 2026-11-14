import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { useState, useRef, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useTheme } from '@/contexts/ThemeContext';
import {
  GraduationCap, LayoutDashboard, BookOpen, Users, BarChart3,
  Settings, CreditCard, LogOut, Menu, X, Sun, Moon, Bell,
  User, Award, Heart, Home, Tag, MessageSquare, FileText,
  Video, Trophy, Zap, Package, Map, Globe,
} from 'lucide-react';
import clsx from 'clsx';
import { motion, AnimatePresence } from 'framer-motion';
import { useQuery } from '@tanstack/react-query';
import { notificationsApi } from '@/services/api';
import { useTranslation } from 'react-i18next';

const LANGUAGES = [
  { code: 'en', label: 'English', flag: '🇬🇧' },
  { code: 'fr', label: 'Français', flag: '🇫🇷' },
];


function LanguageSwitcher() {
  const { i18n } = useTranslation();
  const [open, setOpen] = useState(false);
  const ref = useRef(null);
  const current = LANGUAGES.find((l) => l.code === i18n.language) || LANGUAGES[0];

  useEffect(() => {
    const handler = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const change = (lang) => {
    i18n.changeLanguage(lang.code);
    document.documentElement.lang = lang.code;
    setOpen(false);
  };

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors text-sm font-medium"
        title="Change language"
      >
        <Globe className="w-4 h-4" />
        <span className="hidden sm:block">{current.code.toUpperCase()}</span>
      </button>
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: -4 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -4 }}
            transition={{ duration: 0.12 }}
            className="absolute right-0 mt-1.5 w-40 bg-white dark:bg-gray-900 rounded-xl shadow-xl border border-gray-200 dark:border-gray-700 overflow-hidden z-50"
          >
            <div className="p-1">
              {LANGUAGES.map((lang) => (
                <button
                  key={lang.code}
                  onClick={() => change(lang)}
                  className={clsx(
                    'w-full text-left flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm transition-colors',
                    i18n.language === lang.code
                      ? 'bg-primary-50 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300 font-semibold'
                      : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
                  )}
                >
                  <span className="text-base">{lang.flag}</span>
                  {lang.label}
                  {i18n.language === lang.code && (
                    <span className="ml-auto w-1.5 h-1.5 rounded-full bg-primary-600 dark:bg-primary-400" />
                  )}
                </button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function DashboardLayout({ role }) {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const studentNav = [
    { label: t('nav.dashboard'), to: '/student/dashboard', icon: LayoutDashboard },
    { label: t('nav.myCourses'), to: '/student/courses', icon: BookOpen },
    { label: t('nav.liveClasses'), to: '/student/live-classes', icon: Video },
    { label: t('nav.forum'), to: '/student/forum', icon: MessageSquare },
    { label: t('nav.leaderboard'), to: '/student/leaderboard', icon: Trophy },
    { label: t('nav.certificates'), to: '/student/certificates', icon: Award },
    { label: t('nav.wishlist'), to: '/student/wishlist', icon: Heart },
    { label: t('common.profile'), to: '/student/profile', icon: User },
  ];

  const teacherNav = [
    { label: t('nav.dashboard'), to: '/teacher/dashboard', icon: LayoutDashboard },
    { label: t('nav.myCourses'), to: '/teacher/courses', icon: BookOpen },
    { label: t('nav.liveSessions'), to: '/teacher/live-sessions', icon: Video },
    { label: t('nav.students'), to: '/teacher/students', icon: Users },
    { label: t('nav.analytics'), to: '/teacher/analytics', icon: BarChart3 },
    { label: t('common.profile'), to: '/teacher/profile', icon: User },
  ];

  const adminNav = [
    { label: t('nav.dashboard'), to: '/admin/dashboard', icon: LayoutDashboard },
    { label: 'Users', to: '/admin/users', icon: Users },
    { label: 'Courses', to: '/admin/courses', icon: BookOpen },
    { label: 'Categories', to: '/admin/categories', icon: Tag },
    { label: 'Learning Paths', to: '/admin/learning-paths', icon: Map },
    { label: 'Bundles', to: '/admin/bundles', icon: Package },
    { label: 'Coupons', to: '/admin/coupons', icon: Zap },
    { label: 'Payments', to: '/admin/payments', icon: CreditCard },
    { label: 'Reports', to: '/admin/reports', icon: FileText },
    { label: t('common.settings'), to: '/admin/settings', icon: Settings },
  ];

  const navItems = role === 'student' ? studentNav : role === 'teacher' ? teacherNav : adminNav;

  const { data: notifData } = useQuery({
    queryKey: ['notifications'],
    queryFn: () => notificationsApi.getAll({ per_page: 5 }),
    select: (res) => res.data,
    refetchInterval: 30000,
  });

  const unreadCount = notifData?.unread_count || 0;

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  const Sidebar = ({ mobile = false }) => (
    <div className={clsx('flex flex-col h-full', mobile ? 'w-72' : 'w-64')}>
      {/* Logo */}
      <div className="flex items-center gap-2 px-6 py-5 border-b border-gray-100 dark:border-gray-800">
        <GraduationCap className="w-7 h-7 text-primary-600" />
        <span className="font-bold text-lg text-gray-900 dark:text-gray-100">SmartCourse</span>
      </div>

      {/* User info */}
      <div className="px-4 py-4 mx-4 mt-4 mb-2 bg-primary-50 dark:bg-primary-900/20 rounded-xl">
        <div className="flex items-center gap-3">
          <img src={user?.avatar_url} alt={user?.name} className="w-10 h-10 rounded-full object-cover" />
          <div className="flex-1 min-w-0">
            <p className="font-semibold text-sm text-gray-900 dark:text-gray-100 truncate">{user?.name}</p>
            <p className="text-xs text-primary-600 dark:text-primary-400 capitalize">{user?.role}</p>
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-4 py-2 space-y-1 overflow-y-auto">
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            onClick={() => mobile && setSidebarOpen(false)}
            className={({ isActive }) => clsx('sidebar-link', isActive && 'sidebar-link-active')}
          >
            <item.icon className="w-5 h-5 shrink-0" />
            {item.label}
          </NavLink>
        ))}
      </nav>

      {/* Bottom */}
      <div className="px-4 py-4 border-t border-gray-100 dark:border-gray-800 space-y-1">
        <a href="/" className="sidebar-link">
          <Home className="w-5 h-5" />
          {t('nav.backToHome')}
        </a>
        <button onClick={handleLogout} className="sidebar-link w-full text-left text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 hover:text-red-600">
          <LogOut className="w-5 h-5" />
          {t('nav.logout')}
        </button>
      </div>
    </div>
  );

  return (
    <div className="flex h-screen bg-gray-50 dark:bg-gray-950 overflow-hidden">
      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex flex-col w-64 bg-white dark:bg-gray-900 border-r border-gray-100 dark:border-gray-800 shrink-0">
        <Sidebar />
      </aside>

      {/* Mobile Sidebar */}
      <AnimatePresence>
        {sidebarOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSidebarOpen(false)}
              className="fixed inset-0 bg-black/50 z-40 lg:hidden"
            />
            <motion.aside
              initial={{ x: -300 }}
              animate={{ x: 0 }}
              exit={{ x: -300 }}
              className="fixed left-0 top-0 bottom-0 z-50 bg-white dark:bg-gray-900 shadow-2xl lg:hidden"
            >
              <div className="absolute right-4 top-4">
                <button onClick={() => setSidebarOpen(false)} className="p-2 rounded-lg text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800">
                  <X className="w-5 h-5" />
                </button>
              </div>
              <Sidebar mobile />
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* Main Content */}
      <div className="flex flex-col flex-1 min-w-0 overflow-hidden">
        {/* Top Bar */}
        <header className="flex items-center gap-4 px-4 sm:px-6 py-4 bg-white dark:bg-gray-900 border-b border-gray-100 dark:border-gray-800 shrink-0">
          <button onClick={() => setSidebarOpen(true)} className="lg:hidden p-2 text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg">
            <Menu className="w-5 h-5" />
          </button>
          <div className="flex-1" />
          <div className="flex items-center gap-1">
            <LanguageSwitcher />
            <button onClick={toggleTheme} className="p-2 rounded-lg text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
              {theme === 'dark' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            </button>
            <div className="relative">
              <button className="p-2 rounded-lg text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
                <Bell className="w-5 h-5" />
                {unreadCount > 0 && (
                  <span className="absolute top-1 right-1 w-4 h-4 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                    {unreadCount > 9 ? '9+' : unreadCount}
                  </span>
                )}
              </button>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
