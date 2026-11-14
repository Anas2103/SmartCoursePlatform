import { useState, useRef } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { profileApi } from '@/services/api';
import { useAuth } from '@/contexts/AuthContext';
import { useForm } from 'react-hook-form';
import { Camera, Save, Lock, User } from 'lucide-react';
import toast from 'react-hot-toast';
import Spinner from '@/components/common/Spinner';
import { useTranslation } from 'react-i18next';

export default function Profile() {
  const { user, updateUser } = useAuth();
  const { t } = useTranslation();
  const qc = useQueryClient();
  const fileRef = useRef(null);
  const [activeTab, setActiveTab] = useState('profile');

  const { register, handleSubmit, formState: { errors } } = useForm({
    defaultValues: {
      name: user?.name || '',
      bio: user?.bio || '',
      headline: user?.headline || '',
      website: user?.website || '',
    },
  });

  const { register: passReg, handleSubmit: passSub, reset: passReset, formState: { errors: passErrors }, watch } = useForm();
  const newPassword = watch('new_password');

  const updateMutation = useMutation({
    mutationFn: (data) => profileApi.update(data),
    onSuccess: (res) => {
      updateUser(res.data.user);
      toast.success('Profile updated!');
    },
    onError: () => toast.error('Failed to update profile.'),
  });

  const avatarMutation = useMutation({
    mutationFn: (file) => profileApi.uploadAvatar(file),
    onSuccess: (res) => {
      updateUser(res.data.user);
      toast.success('Avatar updated!');
    },
    onError: () => toast.error('Failed to upload avatar.'),
  });

  const passwordMutation = useMutation({
    mutationFn: (data) => profileApi.changePassword(data),
    onSuccess: () => { toast.success('Password changed!'); passReset(); },
    onError: (err) => toast.error(err.response?.data?.message || 'Failed to change password.'),
  });

  const handleAvatarChange = (e) => {
    const file = e.target.files[0];
    if (file) avatarMutation.mutate(file);
  };

  const tabs = [
    { key: 'profile', label: t('profile.profileInfo'), icon: User },
    { key: 'password', label: t('auth.password'), icon: Lock },
  ];

  return (
    <div className="max-w-2xl space-y-6 animate-fade-in">
      <div>
        <h1 className="section-title">{t('profile.title')}</h1>
        <p className="section-subtitle">{t('profile.subtitle')}</p>
      </div>

      {/* Avatar */}
      <div className="card p-6 flex items-center gap-6">
        <div className="relative">
          <img
            src={user?.avatar_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(user?.name || 'U')}&background=6366f1&color=fff&size=96`}
            alt={user?.name}
            className="w-24 h-24 rounded-full object-cover border-4 border-white dark:border-gray-800 shadow-lg"
          />
          <button
            onClick={() => fileRef.current?.click()}
            disabled={avatarMutation.isPending}
            className="absolute -bottom-1 -right-1 w-8 h-8 rounded-full bg-primary-600 text-white flex items-center justify-center shadow-lg hover:bg-primary-700 transition-colors"
          >
            {avatarMutation.isPending ? <Spinner size="sm" /> : <Camera className="w-4 h-4" />}
          </button>
          <input ref={fileRef} type="file" accept="image/*" onChange={handleAvatarChange} className="hidden" />
        </div>
        <div>
          <h2 className="font-semibold text-gray-900 dark:text-gray-100 text-lg">{user?.name}</h2>
          <p className="text-sm text-gray-500">{user?.email}</p>
          <span className="badge badge-primary capitalize mt-1">{user?.role}</span>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 border-b border-gray-200 dark:border-gray-700">
        {tabs.map(({ key, label, icon: Icon }) => (
          <button
            key={key}
            onClick={() => setActiveTab(key)}
            className={`flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
              activeTab === key
                ? 'border-primary-600 text-primary-600 dark:text-primary-400'
                : 'border-transparent text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'
            }`}
          >
            <Icon className="w-4 h-4" />
            {label}
          </button>
        ))}
      </div>

      {activeTab === 'profile' && (
        <div className="card p-6">
          <form onSubmit={handleSubmit((d) => updateMutation.mutate(d))} className="space-y-4">
            <div>
              <label className="label">{t('auth.fullName')}</label>
              <input {...register('name', { required: 'Name is required' })} className={`input ${errors.name ? 'input-error' : ''}`} />
              {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name.message}</p>}
            </div>
            <div>
              <label className="label">{t('profile.headline')}</label>
              <input {...register('headline')} className="input" placeholder={t('profile.headlinePlaceholder')} />
            </div>
            <div>
              <label className="label">{t('profile.bio')}</label>
              <textarea {...register('bio')} rows={4} className="input" placeholder={t('profile.bioPlaceholder')} />
            </div>
            <div>
              <label className="label">{t('profile.website')}</label>
              <input {...register('website')} type="url" className="input" placeholder={t('profile.websitePlaceholder')} />
            </div>
            <button type="submit" disabled={updateMutation.isPending} className="btn btn-primary">
              {updateMutation.isPending ? <Spinner size="sm" /> : <Save className="w-4 h-4" />}
              {t('profile.saveChanges')}
            </button>
          </form>
        </div>
      )}

      {activeTab === 'password' && (
        <div className="card p-6">
          <form onSubmit={passSub((d) => passwordMutation.mutate(d))} className="space-y-4">
            <div>
              <label className="label">{t('profile.currentPassword')}</label>
              <input
                {...passReg('current_password', { required: 'Current password is required' })}
                type="password"
                className={`input ${passErrors.current_password ? 'input-error' : ''}`}
              />
              {passErrors.current_password && <p className="text-red-500 text-xs mt-1">{passErrors.current_password.message}</p>}
            </div>
            <div>
              <label className="label">{t('profile.newPassword')}</label>
              <input
                {...passReg('new_password', { required: 'New password is required', minLength: { value: 8, message: 'Minimum 8 characters' } })}
                type="password"
                className={`input ${passErrors.new_password ? 'input-error' : ''}`}
              />
              {passErrors.new_password && <p className="text-red-500 text-xs mt-1">{passErrors.new_password.message}</p>}
            </div>
            <div>
              <label className="label">{t('profile.confirmNewPassword')}</label>
              <input
                {...passReg('new_password_confirmation', {
                  required: 'Please confirm your password',
                  validate: v => v === newPassword || 'Passwords do not match',
                })}
                type="password"
                className={`input ${passErrors.new_password_confirmation ? 'input-error' : ''}`}
              />
              {passErrors.new_password_confirmation && <p className="text-red-500 text-xs mt-1">{passErrors.new_password_confirmation.message}</p>}
            </div>
            <button type="submit" disabled={passwordMutation.isPending} className="btn btn-primary">
              {passwordMutation.isPending ? <Spinner size="sm" /> : <Lock className="w-4 h-4" />}
              {t('profile.changePassword')}
            </button>
          </form>
        </div>
      )}
    </div>
  );
}
