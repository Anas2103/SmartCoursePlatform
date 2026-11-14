import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { adminApi } from '@/services/api';
import { Package, Plus, Trash2, Edit2 } from 'lucide-react';
import Spinner from '@/components/common/Spinner';
import Modal from '@/components/common/Modal';
import { useForm, useFieldArray } from 'react-hook-form';
import toast from 'react-hot-toast';

export default function AdminBundles() {
  const qc = useQueryClient();
  const [modal, setModal] = useState(false);
  const [editing, setEditing] = useState(null);

  const { data, isLoading } = useQuery({
    queryKey: ['admin-bundles'],
    queryFn: () => adminApi.getBundles(),
    select: (res) => res.data?.data || [],
  });

  const { data: allCourses } = useQuery({
    queryKey: ['admin-courses-list'],
    queryFn: () => adminApi.getCourses({ per_page: 100, status: 'published' }),
    select: (res) => res.data?.data || [],
  });

  const { register, handleSubmit, reset, control } = useForm({ defaultValues: { course_ids: [''] } });
  const { fields, append, remove } = useFieldArray({ control, name: 'course_ids_arr' });

  const saveMutation = useMutation({
    mutationFn: (data) => editing ? adminApi.updateBundle(editing.id, data) : adminApi.createBundle(data),
    onSuccess: () => {
      toast.success(editing ? 'Bundle updated!' : 'Bundle created!');
      qc.invalidateQueries(['admin-bundles']);
      setModal(false); setEditing(null); reset();
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => adminApi.deleteBundle(id),
    onSuccess: () => { toast.success('Deleted.'); qc.invalidateQueries(['admin-bundles']); },
  });

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="section-title">Bundles</h1>
          <p className="section-subtitle">Sell multiple courses together at a discount</p>
        </div>
        <button onClick={() => { setEditing(null); reset(); setModal(true); }} className="btn btn-primary">
          <Plus className="w-4 h-4" /> Create Bundle
        </button>
      </div>

      {isLoading ? <div className="flex justify-center py-10"><Spinner /></div> : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {data?.map((bundle) => (
            <div key={bundle.id} className="card overflow-hidden">
              {bundle.thumbnail_url ? (
                <img src={bundle.thumbnail_url} alt={bundle.title} className="w-full h-36 object-cover" />
              ) : (
                <div className="w-full h-36 bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center">
                  <Package className="w-10 h-10 text-white/50" />
                </div>
              )}
              <div className="p-4">
                <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-1">{bundle.title}</h3>
                <p className="text-xs text-gray-400 mb-3">{bundle.courses_count} courses</p>
                <div className="flex items-center justify-between mb-3">
                  <span className="font-bold text-emerald-600 text-lg">${Number(bundle.price).toFixed(2)}</span>
                  {bundle.compare_price && <span className="text-sm text-gray-400 line-through">${Number(bundle.compare_price).toFixed(2)}</span>}
                </div>
                <div className="flex gap-2">
                  <button onClick={() => { setEditing(bundle); setModal(true); }} className="btn btn-secondary btn-sm flex-1"><Edit2 className="w-3 h-3" /> Edit</button>
                  <button onClick={() => deleteMutation.mutate(bundle.id)} className="btn btn-secondary btn-sm text-red-500"><Trash2 className="w-3 h-3" /></button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <Modal isOpen={modal} onClose={() => { setModal(false); reset(); }} title={editing ? 'Edit Bundle' : 'Create Bundle'} size="lg">
        <form onSubmit={handleSubmit((d) => {
          const courseIds = Array.from(document.querySelectorAll('[name="course_select"]')).map(s => s.value).filter(Boolean);
          saveMutation.mutate({ ...d, course_ids: courseIds });
        })} className="space-y-4">
          <div>
            <label className="label">Bundle Title *</label>
            <input {...register('title', { required: true })} className="input" placeholder="e.g. Full Stack Developer Bundle" />
          </div>
          <div>
            <label className="label">Description</label>
            <textarea {...register('description')} rows={2} className="input" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label">Bundle Price ($) *</label>
              <input {...register('price', { required: true })} type="number" step="0.01" min="0" className="input" />
            </div>
            <div>
              <label className="label">Compare Price ($)</label>
              <input {...register('compare_price')} type="number" step="0.01" min="0" className="input" placeholder="Original total" />
            </div>
          </div>
          <div>
            <label className="label">Select Courses (min 2) *</label>
            <select name="course_select" multiple className="input h-40">
              {allCourses?.map((c) => <option key={c.id} value={c.id}>{c.title}</option>)}
            </select>
            <p className="text-xs text-gray-400 mt-1">Hold Ctrl/Cmd to select multiple</p>
          </div>
          <div className="flex gap-3 justify-end">
            <button type="button" onClick={() => { setModal(false); reset(); }} className="btn btn-secondary">Cancel</button>
            <button type="submit" disabled={saveMutation.isPending} className="btn btn-primary">
              {saveMutation.isPending && <Spinner size="sm" />}{editing ? 'Update' : 'Create'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
