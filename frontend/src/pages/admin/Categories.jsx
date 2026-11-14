import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { adminApi } from '@/services/api';
import { Plus, Edit2, Trash2 } from 'lucide-react';
import Modal from '@/components/common/Modal';
import ConfirmModal from '@/components/common/ConfirmModal';
import Spinner from '@/components/common/Spinner';
import toast from 'react-hot-toast';
import { useForm } from 'react-hook-form';

export default function AdminCategories() {
  const qc = useQueryClient();
  const [modal, setModal] = useState(null); // null | 'create' | category
  const [deleteId, setDeleteId] = useState(null);

  const { data: categories, isLoading } = useQuery({
    queryKey: ['admin-categories'],
    queryFn: () => adminApi.getCategories(),
    select: (res) => res.data,
  });

  const { register, handleSubmit, reset, setValue } = useForm();

  const createMutation = useMutation({
    mutationFn: (data) => adminApi.createCategory(data),
    onSuccess: () => { toast.success('Category created.'); qc.invalidateQueries(['admin-categories']); setModal(null); reset(); },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => adminApi.updateCategory(id, data),
    onSuccess: () => { toast.success('Category updated.'); qc.invalidateQueries(['admin-categories']); setModal(null); reset(); },
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => adminApi.deleteCategory(id),
    onSuccess: () => { toast.success('Category deleted.'); qc.invalidateQueries(['admin-categories']); setDeleteId(null); },
    onError: (err) => toast.error(err.response?.data?.message || 'Cannot delete category.'),
  });

  const openEdit = (cat) => {
    setValue('name', cat.name);
    setValue('description', cat.description);
    setValue('icon', cat.icon);
    setValue('color', cat.color);
    setModal(cat);
  };

  const onSubmit = (data) => {
    if (modal === 'create') createMutation.mutate(data);
    else updateMutation.mutate({ id: modal.id, data });
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="page-header">
        <div>
          <h1 className="section-title">Categories</h1>
          <p className="section-subtitle">Manage course categories</p>
        </div>
        <button onClick={() => { reset(); setModal('create'); }} className="btn btn-primary">
          <Plus className="w-4 h-4" /> Add Category
        </button>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-10"><Spinner /></div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {categories?.map((cat) => (
            <div key={cat.id} className="card p-5 flex items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl" style={{ backgroundColor: cat.color + '20' }}>
                  {cat.icon || '📚'}
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 dark:text-gray-100">{cat.name}</h3>
                  <p className="text-xs text-gray-400">{cat.courses_count || 0} courses</p>
                </div>
              </div>
              <div className="flex gap-1">
                <button onClick={() => openEdit(cat)} className="p-1.5 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg">
                  <Edit2 className="w-4 h-4" />
                </button>
                <button onClick={() => setDeleteId(cat.id)} className="p-1.5 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create/Edit Modal */}
      <Modal isOpen={!!modal} onClose={() => { setModal(null); reset(); }} title={modal === 'create' ? 'Add Category' : 'Edit Category'}>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label className="label">Name</label>
            <input {...register('name', { required: true })} className="input" placeholder="Category name" />
          </div>
          <div>
            <label className="label">Description</label>
            <textarea {...register('description')} rows={3} className="input" placeholder="Brief description" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label">Icon (emoji)</label>
              <input {...register('icon')} className="input" placeholder="🌐" />
            </div>
            <div>
              <label className="label">Color</label>
              <input {...register('color')} type="color" className="input h-10 cursor-pointer" />
            </div>
          </div>
          <div className="flex gap-3 justify-end pt-2">
            <button type="button" onClick={() => setModal(null)} className="btn btn-secondary">Cancel</button>
            <button type="submit" className="btn btn-primary" disabled={createMutation.isPending || updateMutation.isPending}>
              {(createMutation.isPending || updateMutation.isPending) && <Spinner size="sm" />}
              {modal === 'create' ? 'Create' : 'Update'}
            </button>
          </div>
        </form>
      </Modal>

      <ConfirmModal
        isOpen={!!deleteId}
        onClose={() => setDeleteId(null)}
        onConfirm={() => deleteMutation.mutate(deleteId)}
        title="Delete Category"
        message="Are you sure? This cannot be undone."
        loading={deleteMutation.isPending}
      />
    </div>
  );
}
