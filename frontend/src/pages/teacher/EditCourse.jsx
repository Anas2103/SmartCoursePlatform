import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { teacherApi, categoriesApi } from '@/services/api';
import { useForm } from 'react-hook-form';
import { Plus, Trash2, Edit2, Upload, ArrowLeft, Save, ChevronDown, ChevronUp, Play } from 'lucide-react';
import toast from 'react-hot-toast';
import Spinner from '@/components/common/Spinner';
import Modal from '@/components/common/Modal';
import clsx from 'clsx';

export default function EditCourse() {
  const { id } = useParams();
  const qc = useQueryClient();
  const [sectionModal, setSectionModal] = useState(false);
  const [lessonModal, setLessonModal] = useState(null); // sectionId
  const [expandedSection, setExpandedSection] = useState(null);

  const { data: course, isLoading } = useQuery({
    queryKey: ['teacher-course', id],
    queryFn: () => teacherApi.getCourse(id),
    select: (res) => res.data,
  });

  const { data: categories } = useQuery({
    queryKey: ['categories'],
    queryFn: () => categoriesApi.getAll(),
    select: (res) => res.data,
  });

  const { register, handleSubmit, reset } = useForm();
  const { register: sReg, handleSubmit: sSub, reset: sReset } = useForm();
  const { register: lReg, handleSubmit: lSub, reset: lReset } = useForm({ defaultValues: { type: 'video', duration_minutes: 0 } });

  useEffect(() => {
    if (course) {
      reset({
        title: course.title,
        description: course.description,
        short_description: course.short_description,
        category_id: course.category_id,
        level: course.level,
        price: course.price,
        discount_price: course.discount_price,
        language: course.language,
      });
    }
  }, [course, reset]);

  const updateMutation = useMutation({
    mutationFn: (data) => teacherApi.updateCourse(id, data),
    onSuccess: () => { toast.success('Course updated.'); qc.invalidateQueries(['teacher-course', id]); },
  });

  const addSectionMutation = useMutation({
    mutationFn: (data) => teacherApi.addSection(id, data),
    onSuccess: () => { toast.success('Section added.'); qc.invalidateQueries(['teacher-course', id]); setSectionModal(false); sReset(); },
  });

  const deleteSectionMutation = useMutation({
    mutationFn: (sectionId) => teacherApi.deleteSection(sectionId),
    onSuccess: () => { toast.success('Section deleted.'); qc.invalidateQueries(['teacher-course', id]); },
  });

  const addLessonMutation = useMutation({
    mutationFn: ({ sectionId, data }) => teacherApi.addLesson(sectionId, data),
    onSuccess: () => { toast.success('Lesson added.'); qc.invalidateQueries(['teacher-course', id]); setLessonModal(null); lReset(); },
  });

  const deleteLessonMutation = useMutation({
    mutationFn: (lessonId) => teacherApi.deleteLesson(lessonId),
    onSuccess: () => { toast.success('Lesson deleted.'); qc.invalidateQueries(['teacher-course', id]); },
  });

  const publishMutation = useMutation({
    mutationFn: () => teacherApi.publishCourse(id),
    onSuccess: () => { toast.success('Submitted for review!'); qc.invalidateQueries(['teacher-course', id]); },
  });

  if (isLoading) return <div className="flex justify-center py-20"><Spinner size="lg" /></div>;
  if (!course) return null;

  return (
    <div className="max-w-4xl space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link to="/teacher/courses" className="btn btn-secondary btn-sm">
            <ArrowLeft className="w-4 h-4" /> Back
          </Link>
          <div>
            <h1 className="section-title">Edit Course</h1>
            <p className="section-subtitle text-sm">{course.title}</p>
          </div>
        </div>
        {(course.status === 'draft' || course.status === 'rejected') && (
          <button onClick={() => publishMutation.mutate()} disabled={publishMutation.isPending} className="btn btn-primary">
            {publishMutation.isPending && <Spinner size="sm" />}Submit for Review
          </button>
        )}
      </div>

      {/* Course Info */}
      <div className="card p-6">
        <h2 className="font-semibold mb-4 border-b border-gray-100 dark:border-gray-800 pb-3">Course Information</h2>
        <form onSubmit={handleSubmit((d) => updateMutation.mutate(d))} className="space-y-4">
          <div>
            <label className="label">Title</label>
            <input {...register('title')} className="input" />
          </div>
          <div>
            <label className="label">Short Description</label>
            <input {...register('short_description')} className="input" />
          </div>
          <div>
            <label className="label">Description</label>
            <textarea {...register('description')} rows={4} className="input" />
          </div>
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="label">Category</label>
              <select {...register('category_id')} className="input">
                {categories?.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </div>
            <div>
              <label className="label">Level</label>
              <select {...register('level')} className="input">
                {['beginner', 'intermediate', 'advanced', 'all-levels'].map(l => <option key={l} value={l}>{l}</option>)}
              </select>
            </div>
          </div>
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="label">Price ($)</label>
              <input {...register('price')} type="number" min="0" step="0.01" className="input" />
            </div>
            <div>
              <label className="label">Discount Price ($)</label>
              <input {...register('discount_price')} type="number" min="0" step="0.01" className="input" />
            </div>
          </div>
          <button type="submit" disabled={updateMutation.isPending} className="btn btn-primary">
            {updateMutation.isPending ? <Spinner size="sm" /> : <Save className="w-4 h-4" />}Save Changes
          </button>
        </form>
      </div>

      {/* Curriculum */}
      <div className="card p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-semibold">Curriculum</h2>
          <button onClick={() => setSectionModal(true)} className="btn btn-primary btn-sm">
            <Plus className="w-4 h-4" /> Add Section
          </button>
        </div>

        {!course.sections?.length ? (
          <p className="text-gray-400 text-sm text-center py-8">No sections yet. Add your first section to get started.</p>
        ) : (
          <div className="space-y-3">
            {course.sections?.map((section, si) => (
              <div key={section.id} className="border border-gray-100 dark:border-gray-800 rounded-xl overflow-hidden">
                <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800/50">
                  <button onClick={() => setExpandedSection(expandedSection === section.id ? null : section.id)} className="flex items-center gap-2 flex-1 text-left">
                    {expandedSection === section.id ? <ChevronUp className="w-4 h-4 text-gray-400" /> : <ChevronDown className="w-4 h-4 text-gray-400" />}
                    <span className="font-medium text-gray-900 dark:text-gray-100">{section.title}</span>
                    <span className="text-xs text-gray-400">{section.lessons?.length || 0} lessons</span>
                  </button>
                  <div className="flex gap-1">
                    <button onClick={() => setLessonModal(section.id)} className="btn btn-sm btn-secondary">
                      <Plus className="w-3 h-3" /> Lesson
                    </button>
                    <button onClick={() => deleteSectionMutation.mutate(section.id)} className="btn btn-sm text-red-500 btn-secondary">
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>
                </div>

                {expandedSection === section.id && (
                  <div className="divide-y divide-gray-100 dark:divide-gray-800">
                    {section.lessons?.length === 0 ? (
                      <p className="text-sm text-gray-400 px-4 py-3">No lessons. Add lessons to this section.</p>
                    ) : section.lessons?.map((lesson) => (
                      <div key={lesson.id} className="flex items-center gap-3 px-4 py-3">
                        <Play className="w-4 h-4 text-primary-400 shrink-0" />
                        <span className="flex-1 text-sm text-gray-700 dark:text-gray-300">{lesson.title}</span>
                        <span className="badge badge-gray text-xs capitalize">{lesson.type}</span>
                        {lesson.duration_minutes > 0 && <span className="text-xs text-gray-400">{lesson.duration_minutes}m</span>}
                        <button onClick={() => deleteLessonMutation.mutate(lesson.id)} className="p-1 text-red-400 hover:text-red-600">
                          <Trash2 className="w-3 h-3" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Add Section Modal */}
      <Modal isOpen={sectionModal} onClose={() => setSectionModal(false)} title="Add Section" size="sm">
        <form onSubmit={sSub((d) => addSectionMutation.mutate(d))} className="space-y-4">
          <div>
            <label className="label">Section Title</label>
            <input {...sReg('title', { required: true })} className="input" placeholder="e.g. Getting Started" />
          </div>
          <div>
            <label className="label">Description (optional)</label>
            <textarea {...sReg('description')} rows={2} className="input" />
          </div>
          <div className="flex gap-3 justify-end">
            <button type="button" onClick={() => setSectionModal(false)} className="btn btn-secondary">Cancel</button>
            <button type="submit" className="btn btn-primary" disabled={addSectionMutation.isPending}>
              {addSectionMutation.isPending && <Spinner size="sm" />}Add Section
            </button>
          </div>
        </form>
      </Modal>

      {/* Add Lesson Modal */}
      <Modal isOpen={!!lessonModal} onClose={() => setLessonModal(null)} title="Add Lesson">
        <form onSubmit={lSub((d) => addLessonMutation.mutate({ sectionId: lessonModal, data: d }))} className="space-y-4">
          <div>
            <label className="label">Lesson Title</label>
            <input {...lReg('title', { required: true })} className="input" placeholder="Lesson title" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label">Type</label>
              <select {...lReg('type')} className="input">
                <option value="video">Video</option>
                <option value="text">Text</option>
                <option value="pdf">PDF</option>
                <option value="quiz">Quiz</option>
                <option value="assignment">Assignment</option>
              </select>
            </div>
            <div>
              <label className="label">Duration (minutes)</label>
              <input {...lReg('duration_minutes')} type="number" min="0" className="input" />
            </div>
          </div>
          <div>
            <label className="label">Content</label>
            <textarea {...lReg('content')} rows={3} className="input" placeholder="Lesson content or description" />
          </div>
          <label className="flex items-center gap-2 cursor-pointer">
            <input {...lReg('is_free_preview')} type="checkbox" className="w-4 h-4 rounded" />
            <span className="text-sm">Free preview</span>
          </label>
          <div className="flex gap-3 justify-end">
            <button type="button" onClick={() => setLessonModal(null)} className="btn btn-secondary">Cancel</button>
            <button type="submit" className="btn btn-primary" disabled={addLessonMutation.isPending}>
              {addLessonMutation.isPending && <Spinner size="sm" />}Add Lesson
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
