import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { adminApi } from '@/services/api';
import { Tag, Plus, Trash2, Edit2, Check, X } from 'lucide-react';
import Spinner from '@/components/common/Spinner';
import Modal from '@/components/common/Modal';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import { format } from 'date-fns';
import clsx from 'clsx';

export default function AdminCoupons() {
  const qc = useQueryClient();
  const [modal, setModal] = useState(false);
  const [editing, setEditing] = useState(null);

  const { data, isLoading } = useQuery({
    queryKey: ['admin-coupons'],
    queryFn: () => adminApi.getCoupons(),
    select: (res) => res.data?.data || [],
  });

  const { register, handleSubmit, reset, setValue } = useForm();

  const openEdit = (coupon) => {
    setEditing(coupon);
    Object.entries(coupon).forEach(([k, v]) => setValue(k, v));
    setModal(true);
  };

  const createMutation = useMutation({
    mutationFn: (data) => editing ? adminApi.updateCoupon(editing.id, data) : adminApi.createCoupon(data),
    onSuccess: () => {
      toast.success(editing ? 'Coupon updated!' : 'Coupon created!');
      qc.invalidateQueries(['admin-coupons']);
      setModal(false); setEditing(null); reset();
    },
    onError: (err) => toast.error(err.response?.data?.message || 'Failed.'),
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => adminApi.deleteCoupon(id),
    onSuccess: () => { toast.success('Deleted.'); qc.invalidateQueries(['admin-coupons']); },
  });

  const toggleMutation = useMutation({
    mutationFn: ({ id, is_active }) => adminApi.updateCoupon(id, { is_active: !is_active }),
    onSuccess: () => qc.invalidateQueries(['admin-coupons']),
  });

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="section-title">Coupons</h1>
          <p className="section-subtitle">Manage discount codes for your platform</p>
        </div>
        <button onClick={() => { setEditing(null); reset(); setModal(true); }} className="btn btn-primary">
          <Plus className="w-4 h-4" /> Create Coupon
        </button>
      </div>

      <div className="table-wrapper">
        <table className="table">
          <thead>
            <tr>
              <th className="th">Code</th>
              <th className="th">Discount</th>
              <th className="th">Usage</th>
              <th className="th">Expires</th>
              <th className="th">Status</th>
              <th className="th">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
            {isLoading ? (
              <tr><td colSpan={6} className="td text-center py-10"><Spinner /></td></tr>
            ) : data?.map((coupon) => (
              <tr key={coupon.id} className="tr-hover">
                <td className="td font-mono font-bold text-primary-600">{coupon.code}</td>
                <td className="td">
                  <span className="badge badge-success">
                    {coupon.type === 'percentage' ? `${coupon.value}%` : `$${coupon.value}`} OFF
                  </span>
                </td>
                <td className="td text-sm">{coupon.usage_count}/{coupon.usage_limit || '∞'}</td>
                <td className="td text-xs text-gray-400">
                  {coupon.expires_at ? format(new Date(coupon.expires_at), 'MMM d, yyyy') : 'Never'}
                </td>
                <td className="td">
                  <button onClick={() => toggleMutation.mutate({ id: coupon.id, is_active: coupon.is_active })} className={clsx('badge cursor-pointer', coupon.is_active ? 'badge-success' : 'badge-gray')}>
                    {coupon.is_active ? <><Check className="w-3 h-3" /> Active</> : <><X className="w-3 h-3" /> Inactive</>}
                  </button>
                </td>
                <td className="td">
                  <div className="flex gap-1">
                    <button onClick={() => openEdit(coupon)} className="btn btn-sm btn-secondary"><Edit2 className="w-3 h-3" /></button>
                    <button onClick={() => deleteMutation.mutate(coupon.id)} className="btn btn-sm btn-secondary text-red-500"><Trash2 className="w-3 h-3" /></button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <Modal isOpen={modal} onClose={() => { setModal(false); setEditing(null); reset(); }} title={editing ? 'Edit Coupon' : 'Create Coupon'}>
        <form onSubmit={handleSubmit((d) => createMutation.mutate(d))} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label">Code *</label>
              <input {...register('code', { required: true })} className="input uppercase" placeholder="SAVE20" />
            </div>
            <div>
              <label className="label">Type *</label>
              <select {...register('type')} className="input">
                <option value="percentage">Percentage (%)</option>
                <option value="fixed">Fixed ($)</option>
              </select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label">Value *</label>
              <input {...register('value', { required: true })} type="number" step="0.01" min="0" className="input" placeholder="20" />
            </div>
            <div>
              <label className="label">Usage Limit</label>
              <input {...register('usage_limit')} type="number" min="1" className="input" placeholder="Unlimited" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label">Starts At</label>
              <input {...register('starts_at')} type="datetime-local" className="input" />
            </div>
            <div>
              <label className="label">Expires At</label>
              <input {...register('expires_at')} type="datetime-local" className="input" />
            </div>
          </div>
          <label className="flex items-center gap-2 cursor-pointer">
            <input {...register('is_active')} type="checkbox" defaultChecked className="w-4 h-4" />
            <span className="text-sm">Active</span>
          </label>
          <div className="flex gap-3 justify-end">
            <button type="button" onClick={() => { setModal(false); setEditing(null); reset(); }} className="btn btn-secondary">Cancel</button>
            <button type="submit" disabled={createMutation.isPending} className="btn btn-primary">
              {createMutation.isPending && <Spinner size="sm" />}{editing ? 'Update' : 'Create'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
