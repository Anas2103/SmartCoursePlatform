import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useAuth } from '@/contexts/AuthContext';
import { GraduationCap, Eye, EyeOff, UserPlus, GraduationCap as TeacherIcon, BookOpen } from 'lucide-react';
import { useState } from 'react';
import toast from 'react-hot-toast';
import Spinner from '@/components/common/Spinner';
import clsx from 'clsx';
import { authApi } from '@/services/api';
import { useTranslation } from 'react-i18next';

const schema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters').regex(/[A-Z]/, 'Must contain uppercase').regex(/[0-9]/, 'Must contain a number'),
  password_confirmation: z.string(),
  role: z.enum(['student', 'teacher']),
}).refine((d) => d.password === d.password_confirmation, {
  message: 'Passwords do not match',
  path: ['password_confirmation'],
});

const GoogleIcon = () => (
  <svg className="w-5 h-5" viewBox="0 0 24 24">
    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
  </svg>
);

export default function Register() {
  const { register: registerUser } = useAuth();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [socialLoading, setSocialLoading] = useState(false);

  const { register, handleSubmit, watch, setValue, formState: { errors } } = useForm({
    resolver: zodResolver(schema),
    defaultValues: { role: 'student' },
  });

  const selectedRole = watch('role');

  const onSubmit = async (data) => {
    setLoading(true);
    try {
      const res = await registerUser(data);
      toast.success('Account created! Please verify your email.');
      const role = res.user.role;
      if (role === 'teacher') navigate('/teacher/dashboard');
      else navigate('/student/dashboard');
    } catch (err) {
      const errs = err.response?.data?.errors;
      if (errs) {
        Object.values(errs).flat().forEach((msg) => toast.error(msg));
      } else {
        toast.error(err.response?.data?.message || 'Registration failed.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setSocialLoading(true);
    try {
      const res = await authApi.googleRedirect();
      window.location.href = res.data.url;
    } catch {
      toast.error('Google sign-up failed. Please try again.');
      setSocialLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-purple-50 dark:from-gray-950 dark:via-gray-900 dark:to-gray-950 flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center gap-2 text-2xl font-bold text-primary-600">
            <GraduationCap className="w-8 h-8" />SmartCourse
          </Link>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mt-4">{t('auth.createAccount')}</h1>
          <p className="text-gray-500 mt-1">{t('auth.joinLearners')}</p>
        </div>

        <div className="card p-8 shadow-xl">
          {/* Social Login */}
          <button
            type="button"
            onClick={handleGoogleLogin}
            disabled={socialLoading}
            className="w-full flex items-center justify-center gap-3 px-4 py-2.5 border border-gray-200 dark:border-gray-700 rounded-xl text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors mb-5"
          >
            {socialLoading ? <Spinner size="sm" /> : <GoogleIcon />}
            {t('auth.continueWithGoogle')}
          </button>

          <div className="relative mb-5">
            <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-gray-200 dark:border-gray-700" /></div>
            <div className="relative flex justify-center text-xs text-gray-400 bg-white dark:bg-gray-900 px-2">{t('auth.orRegisterWithEmail')}</div>
          </div>

          {/* Role selector */}
          <div className="grid grid-cols-2 gap-3 mb-6">
            {[
              { value: 'student', label: t('auth.iWantToLearn'), icon: BookOpen },
              { value: 'teacher', label: t('auth.iWantToTeach'), icon: TeacherIcon },
            ].map(({ value, label, icon: Icon }) => (
              <button key={value} type="button" onClick={() => setValue('role', value)} className={clsx('flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all', selectedRole === value ? 'border-primary-600 bg-primary-50 text-primary-700 dark:bg-primary-900/30 dark:border-primary-500 dark:text-primary-300' : 'border-gray-200 text-gray-600 hover:border-gray-300 dark:border-gray-700 dark:text-gray-400')}>
                <Icon className="w-5 h-5" />
                <span className="text-sm font-medium">{label}</span>
              </button>
            ))}
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div>
              <label className="label">{t('auth.fullName')}</label>
              <input {...register('name')} className={`input ${errors.name ? 'input-error' : ''}`} placeholder="John Doe" />
              {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name.message}</p>}
            </div>

            <div>
              <label className="label">{t('auth.email')}</label>
              <input {...register('email')} type="email" className={`input ${errors.email ? 'input-error' : ''}`} placeholder="you@example.com" />
              {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email.message}</p>}
            </div>

            <div>
              <label className="label">{t('auth.password')}</label>
              <div className="relative">
                <input {...register('password')} type={showPass ? 'text' : 'password'} className={`input pr-10 ${errors.password ? 'input-error' : ''}`} placeholder="Create a strong password" />
                <button type="button" onClick={() => setShowPass(!showPass)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">
                  {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {errors.password && <p className="text-red-500 text-xs mt-1">{errors.password.message}</p>}
            </div>

            <div>
              <label className="label">{t('auth.confirmPassword')}</label>
              <input {...register('password_confirmation')} type="password" className={`input ${errors.password_confirmation ? 'input-error' : ''}`} placeholder="Repeat your password" />
              {errors.password_confirmation && <p className="text-red-500 text-xs mt-1">{errors.password_confirmation.message}</p>}
            </div>

            <div className="pt-1">
              <button type="submit" disabled={loading} className="btn btn-primary w-full btn-lg">
                {loading ? <Spinner size="sm" /> : <UserPlus className="w-4 h-4" />}
                {t('auth.createAccountBtn')}
              </button>
            </div>

            <p className="text-center text-xs text-gray-400">
              {t('auth.agreePrefix')}{' '}
              <Link to="/terms" className="text-primary-600 hover:underline">{t('auth.terms')}</Link>{' '}
              {t('auth.and')}{' '}
              <Link to="/privacy" className="text-primary-600 hover:underline">{t('auth.privacyPolicy')}</Link>
            </p>
          </form>

          <p className="text-center text-sm text-gray-500 mt-4">
            {t('auth.alreadyHaveAccount')}{' '}
            <Link to="/login" className="text-primary-600 font-medium hover:underline">{t('auth.signInLink')}</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
