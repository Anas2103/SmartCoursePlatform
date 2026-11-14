import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { adminApi } from '@/services/api';
import { Search, Plus, Edit2, Trash2, Ban, CheckCircle, MoreVertical, Shield } from 'lucide-react';
import Spinner from '@/components/common/Spinner';
import Pagination from '@/components/common/Pagination';
import Modal from '@/components/common/Modal';
import ConfirmModal from '@/components/common/ConfirmModal';
import toast from 'react-hot-toast';
import { useForm } from 'react-hook-form';
import { format } from 'date-fns';
import clsx from 'clsx';
import { useTranslation } from 'react-i18next';

const roleColors = {
  'super-admin': 'badge-danger',
  admin: 'badge-primary',
  teacher: 'badge-warning',
  student: 'badge-gray',
};

export default function AdminUsers() {
  const qc = useQueryClient();
  const { t } = useTranslation();
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [banModal, setBanModal] = useState(null);
  const [createModal, setCreateModal] = useState(false);
  const [banReason, setBanReason] = useState('');

  const { data, isLoading } = useQuery({
    queryKey: ['admin-users', page, search, roleFilter],
    queryFn: () => adminApi.getUsers({ page, search, role: roleFilter, per_page: 15 }),
    select: (res) => res.data,
  });

  const banMutation = useMutation({
    mutationFn: ({ id, reason }) => adminApi.banUser(id, reason),
    onSuccess: () => {
      toast.success('User banned successfully.');
      qc.invalidateQueries({ queryKey: ['admin-users'] });
      setBanModal(null);
    },
  });

  const unbanMutation = useMutation({
    mutationFn: (id) => adminApi.unbanUser(id),
    onSuccess: () => {
      toast.success('User unbanned.');
      qc.invalidateQueries({ queryKey: ['admin-users'] });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => adminApi.deleteUser(id),
    onSuccess: () => {
      toast.success('User deleted.');
      qc.invalidateQueries({ queryKey: ['admin-users'] });
    },
  });

  const createMutation = useMutation({
    mutationFn: (data) => adminApi.createUser(data),
    onSuccess: () => {
      toast.success('User created successfully.');
      qc.invalidateQueries({ queryKey: ['admin-users'] });
      setCreateModal(false);
    },
    onError: (err) => toast.error(err.response?.data?.message || 'Failed to create user.'),
  });

  const { register, handleSubmit, reset, formState: { errors } } = useForm();

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="page-header">
        <div>
          <h1 className="section-title">{t('admin.userManagement')}</h1>
          <p className="section-subtitle">{t('admin.userManagementSubtitle')}</p>
        </div>
        <button onClick={() => setCreateModal(true)} className="btn btn-primary">
          <Plus className="w-4 h-4" /> {t('admin.addUser')}
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder={t('common.searchPlaceholder')} className="input pl-9" />
        </div>
        <select value={roleFilter} onChange={(e) => setRoleFilter(e.target.value)} className="input w-full sm:w-40">
          <option value="">{t('admin.allRoles')}</option>
          <option value="student">Students</option>
          <option value="teacher">Teachers</option>
          <option value="admin">Admins</option>
        </select>
      </div>

      {/* Table */}
      <div className="table-wrapper">
        <table className="table">
          <thead>
            <tr>
              <th className="th">{t('admin.colUser')}</th>
              <th className="th">{t('admin.colRole')}</th>
              <th className="th">{t('admin.colStatus')}</th>
              <th className="th">{t('admin.colJoined')}</th>
              <th className="th">{t('admin.colActions')}</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
            {isLoading ? (
              <tr><td colSpan={5} className="td text-center py-10"><Spinner /></td></tr>
            ) : data?.data?.map((user) => (
              <tr key={user.id} className="tr-hover">
                <td className="td">
                  <div className="flex items-center gap-3">
                    <img src={user.avatar_url} alt={user.name} className="w-9 h-9 rounded-full object-cover" />
                    <div>
                      <p className="font-medium text-gray-900 dark:text-gray-100">{user.name}</p>
                      <p className="text-xs text-gray-400">{user.email}</p>
                    </div>
                  </div>
                </td>
                <td className="td">
                  <span className={clsx('badge capitalize', roleColors[user.role] || 'badge-gray')}>{user.role}</span>
                </td>
                <td className="td">
                  {user.is_banned ? (
                    <span className="badge badge-danger">Banned</span>
                  ) : user.email_verified_at ? (
                    <span className="badge badge-success">Active</span>
                  ) : (
                    <span className="badge badge-warning">Unverified</span>
                  )}
                </td>
                <td className="td text-xs text-gray-400">{user.created_at ? format(new Date(user.created_at), 'MMM d, yyyy') : '-'}</td>
                <td className="td">
                  <div className="flex items-center gap-1">
                    {!user.email_verified_at && (
                      <button onClick={() => adminApi.verifyUser(user.id).then(() => { toast.success('Verified'); qc.invalidateQueries(['admin-users']); })} title="Verify" className="p-1.5 text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 rounded-lg">
                        <CheckCircle className="w-4 h-4" />
                      </button>
                    )}
                    {user.is_banned ? (
                      <button onClick={() => unbanMutation.mutate(user.id)} title="Unban" className="p-1.5 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg">
                        <Shield className="w-4 h-4" />
                      </button>
                    ) : (
                      <button onClick={() => setBanModal(user)} title="Ban" className="p-1.5 text-amber-600 hover:bg-amber-50 dark:hover:bg-amber-900/20 rounded-lg">
                        <Ban className="w-4 h-4" />
                      </button>
                    )}
                    <button onClick={() => deleteMutation.mutate(user.id)} title="Delete" className="p-1.5 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <Pagination meta={data?.meta} onPageChange={setPage} />

      {/* Ban Modal */}
      <Modal isOpen={!!banModal} onClose={() => setBanModal(null)} title={t('admin.banUserTitle')} size="sm">
        <div className="space-y-4">
          <p className="text-sm text-gray-600 dark:text-gray-400">{t('admin.banReasonLabel')}</p>
          <textarea value={banReason} onChange={(e) => setBanReason(e.target.value)} rows={3} className="input" placeholder="Enter reason..." />
          <div className="flex gap-3 justify-end">
            <button onClick={() => setBanModal(null)} className="btn btn-secondary">{t('common.cancel')}</button>
            <button onClick={() => banMutation.mutate({ id: banModal.id, reason: banReason })} disabled={!banReason || banMutation.isPending} className="btn btn-danger">
              {banMutation.isPending && <Spinner size="sm" />}{t('admin.banUserTitle')}
            </button>
          </div>
        </div>
      </Modal>

      {/* Create User Modal */}
      <Modal isOpen={createModal} onClose={() => { setCreateModal(false); reset(); }} title={t('admin.createUser')}>
        <form onSubmit={handleSubmit((d) => createMutation.mutate(d))} className="space-y-4">
          <div>
            <label className="label">{t('auth.fullName')}</label>
            <input {...register('name', { required: true })} className="input" placeholder={t('auth.fullName')} />
          </div>
          <div>
            <label className="label">{t('auth.email')}</label>
            <input {...register('email', { required: true })} type="email" className="input" placeholder="email@example.com" />
          </div>
          <div>
            <label className="label">{t('auth.password')}</label>
            <input {...register('password', { required: true })} type="password" className="input" placeholder={t('auth.password')} />
          </div>
          <div>
            <label className="label">{t('admin.colRole')}</label>
            <select {...register('role', { required: true })} className="input">
              <option value="student">Student</option>
              <option value="teacher">Teacher</option>
              <option value="admin">Admin</option>
            </select>
          </div>
          <div className="flex gap-3 justify-end pt-2">
            <button type="button" onClick={() => setCreateModal(false)} className="btn btn-secondary">{t('common.cancel')}</button>
            <button type="submit" className="btn btn-primary" disabled={createMutation.isPending}>
              {createMutation.isPending && <Spinner size="sm" />}{t('admin.createUser')}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
