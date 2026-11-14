import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { adminApi } from '@/services/api';
import { useForm } from 'react-hook-form';
import { useEffect } from 'react';
import { Save } from 'lucide-react';
import Spinner from '@/components/common/Spinner';
import toast from 'react-hot-toast';

export default function AdminSettings() {
  const qc = useQueryClient();
  const { register, handleSubmit, reset } = useForm();

  const { data: settings, isLoading } = useQuery({
    queryKey: ['admin-settings'],
    queryFn: () => adminApi.getSettings(),
    select: (res) => res.data,
  });

  useEffect(() => {
    if (settings) reset(settings);
  }, [settings, reset]);

  const mutation = useMutation({
    mutationFn: (data) => adminApi.updateSettings(data),
    onSuccess: () => { toast.success('Settings saved.'); qc.invalidateQueries(['admin-settings']); },
  });

  if (isLoading) return <div className="flex justify-center py-10"><Spinner /></div>;

  return (
    <div className="space-y-6 animate-fade-in max-w-2xl">
      <div>
        <h1 className="section-title">Platform Settings</h1>
        <p className="section-subtitle">Configure your platform settings</p>
      </div>

      <form onSubmit={handleSubmit((d) => mutation.mutate(d))} className="space-y-6">
        {/* General */}
        <div className="card p-6 space-y-4">
          <h2 className="font-semibold text-gray-900 dark:text-gray-100 border-b border-gray-100 dark:border-gray-800 pb-3">General</h2>
          <div>
            <label className="label">Platform Name</label>
            <input {...register('site_name')} className="input" />
          </div>
          <div>
            <label className="label">Platform Description</label>
            <textarea {...register('site_description')} rows={2} className="input" />
          </div>
          <div>
            <label className="label">Default Language</label>
            <select {...register('default_language')} className="input">
              <option value="en">English</option>
              <option value="fr">French (Français)</option>
            </select>
          </div>
          <label className="flex items-center gap-2 cursor-pointer">
            <input {...register('allow_registration')} type="checkbox" className="w-4 h-4 rounded" />
            <span className="text-sm text-gray-700 dark:text-gray-300">Allow new user registration</span>
          </label>
        </div>

        {/* Payment */}
        <div className="card p-6 space-y-4">
          <h2 className="font-semibold text-gray-900 dark:text-gray-100 border-b border-gray-100 dark:border-gray-800 pb-3">Payments</h2>
          <div>
            <label className="label">Currency</label>
            <select {...register('currency')} className="input">
              <option value="USD">USD ($)</option>
              <option value="EUR">EUR (€)</option>
              <option value="GBP">GBP (£)</option>
            </select>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label">Teacher Commission (%)</label>
              <input {...register('teacher_commission')} type="number" min="0" max="100" className="input" />
            </div>
            <div>
              <label className="label">Platform Commission (%)</label>
              <input {...register('platform_commission')} type="number" min="0" max="100" className="input" />
            </div>
          </div>
        </div>

        <button type="submit" className="btn btn-primary" disabled={mutation.isPending}>
          {mutation.isPending ? <Spinner size="sm" /> : <Save className="w-4 h-4" />}
          Save Settings
        </button>
      </form>
    </div>
  );
}
