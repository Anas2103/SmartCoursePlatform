import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { adminApi } from '@/services/api';
import { BookOpen, Plus, Trash2, Edit2, Clock } from 'lucide-react';
import Spinner from '@/components/common/Spinner';
import Modal from '@/components/common/Modal';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import clsx from 'clsx';

export default function AdminLearningPaths() {
  const qc = useQueryClient();
  const [modal, setModal] = useState(false);
  const [editing, setEditing] = useState(null);

  const { data, isLoading } = useQuery({
    queryKey: ['admin-learning-paths'],
    queryFn: () => adminApi.getLearningPaths(),
    select: (res) => res.data?.data || [],
  });

  const { data: allCourses } = useQuery({
    queryKey: ['admin-courses-list'],
    queryFn: () => adminApi.getCourses({ per_page: 100, status: 'published' }),
    select: (res) => res.data?.data || [],
  });

  const { register, handleSubmit, reset, setValue } = useForm({ defaultValues: { level: 'all-levels', price: 0 } });

  const saveMutation = useMutation({
    mutationFn: (data) => editing ? adminApi.updateLearningPath(editing.id, data) : adminApi.createLearningPath(data),
    onSuccess: () => {
      toast.success(editing ? 'Updated!' : 'Created!');
      qc.invalidateQueries(['admin-learning-paths']);
      setModal(false); setEditing(null); reset();
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => adminApi.deleteLearningPath(id),
    onSuccess: () => { toast.success('Deleted.'); qc.invalidateQueries(['admin-learning-paths']); },
  });

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="section-title">Learning Paths</h1>
          <p className="section-subtitle">Create structured course roadmaps</p>
        </div>
        <button onClick={() => { setEditing(null); reset(); setModal(true); }} className="btn btn-primary">
          <Plus className="w-4 h-4" /> Create Path
        </button>
      </div>

      {isLoading ? <div className="flex justify-center py-10"><Spinner /></div> : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {data?.map((path) => (
            <div key={path.id} className="card overflow-hidden">
              {path.thumbnail_url ? (
                <img src={path.thumbnail_url} alt={path.title} className="w-full h-36 object-cover" />
              ) : (
                <div className="w-full h-36 bg-gradient-to-br from-primary-500 to-purple-600 flex items-center justify-center">
                  <BookOpen className="w-10 h-10 text-white/50" />
                </div>
              )}
              <div className="p-4">
                <div className="flex items-center gap-2 mb-1">
                  <span className="badge badge-primary capitalize text-xs">{path.level}</span>
                  {!path.is_active && <span className="badge badge-gray text-xs">Inactive</span>}
                </div>
                <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-1 line-clamp-1">{path.title}</h3>
                <p className="text-xs text-gray-400 flex items-center gap-1 mb-3"><BookOpen className="w-3 h-3" />{path.courses_count} courses <Clock className="w-3 h-3 ml-1" />{path.estimated_hours}h</p>
                <div className="flex gap-2">
                  <button onClick={() => { setEditing(path); setModal(true); }} className="btn btn-secondary btn-sm flex-1"><Edit2 className="w-3 h-3" /> Edit</button>
                  <button onClick={() => deleteMutation.mutate(path.id)} className="btn btn-secondary btn-sm text-red-500"><Trash2 className="w-3 h-3" /></button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <Modal isOpen={modal} onClose={() => { setModal(false); reset(); }} title={editing ? 'Edit Learning Path' : 'Create Learning Path'} size="lg">
        <form onSubmit={handleSubmit((d) => {
          const courseIds = Array.from(document.querySelectorAll('[name="path_course_select"]')).map(s => s.value).filter(Boolean);
          saveMutation.mutate({ ...d, course_ids: courseIds });
        })} className="space-y-4">
          <div>
            <label className="label">Title *</label>
            <input {...register('title', { required: true })} className="input" placeholder="e.g. Become a Full Stack Developer" />
          </div>
          <div>
            <label className="label">Description</label>
            <textarea {...register('description')} rows={2} className="input" />
          </div>
          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="label">Level</label>
              <select {...register('level')} className="input">
                {['beginner', 'intermediate', 'advanced', 'all-levels'].map(l => <option key={l} value={l}>{l}</option>)}
              </select>
            </div>
            <div>
              <label className="label">Price ($)</label>
              <input {...register('price')} type="number" step="0.01" min="0" className="input" />
            </div>
            <div>
              <label className="label">Est. Hours</label>
              <input {...register('estimated_hours')} type="number" min="0" className="input" />
            </div>
          </div>
          <div>
            <label className="label">Select Courses *</label>
            <select name="path_course_select" multiple className="input h-40">
              {allCourses?.map((c) => <option key={c.id} value={c.id}>{c.title}</option>)}
            </select>
            <p className="text-xs text-gray-400 mt-1">Hold Ctrl/Cmd to select multiple</p>
          </div>
          <label className="flex items-center gap-2 cursor-pointer">
            <input {...register('is_active')} type="checkbox" defaultChecked className="w-4 h-4" />
            <span className="text-sm">Active</span>
          </label>
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
