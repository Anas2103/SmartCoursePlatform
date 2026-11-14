import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { teacherApi, categoriesApi } from '@/services/api';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Plus, Trash2, ArrowLeft, Upload, Check } from 'lucide-react';
import toast from 'react-hot-toast';
import Spinner from '@/components/common/Spinner';
import { Link } from 'react-router-dom';

const schema = z.object({
  title: z.string().min(10, 'Title must be at least 10 characters'),
  description: z.string().min(50, 'Description must be at least 50 characters'),
  short_description: z.string().max(200).optional(),
  category_id: z.string().min(1, 'Category is required'),
  level: z.enum(['beginner', 'intermediate', 'advanced', 'all-levels']),
  price: z.coerce.number().min(0),
  discount_price: z.coerce.number().min(0).optional(),
  language: z.string().min(1),
  requirements: z.array(z.object({ value: z.string() })).optional(),
  learning_outcomes: z.array(z.object({ value: z.string() })).optional(),
});

export default function CreateCourse() {
  const navigate = useNavigate();
  const qc = useQueryClient();
  const [thumbnail, setThumbnail] = useState(null);
  const [thumbnailPreview, setThumbnailPreview] = useState(null);

  const { data: categories } = useQuery({
    queryKey: ['categories'],
    queryFn: () => categoriesApi.getAll(),
    select: (res) => res.data,
  });

  const { register, handleSubmit, control, formState: { errors } } = useForm({
    resolver: zodResolver(schema),
    defaultValues: {
      level: 'beginner',
      language: 'English',
      price: 0,
      requirements: [{ value: '' }],
      learning_outcomes: [{ value: '' }],
    },
  });

  const { fields: reqFields, append: addReq, remove: removeReq } = useFieldArray({ control, name: 'requirements' });
  const { fields: outcomeFields, append: addOutcome, remove: removeOutcome } = useFieldArray({ control, name: 'learning_outcomes' });

  const createMutation = useMutation({
    mutationFn: async (formData) => {
      const data = {
        ...formData,
        requirements: formData.requirements?.map(r => r.value).filter(Boolean),
        learning_outcomes: formData.learning_outcomes?.map(o => o.value).filter(Boolean),
      };
      const res = await teacherApi.createCourse(data);
      const courseId = res.data.course.id;

      if (thumbnail) {
        await teacherApi.uploadThumbnail(courseId, thumbnail);
      }
      return res.data;
    },
    onSuccess: (data) => {
      toast.success('Course created! Now add sections and lessons.');
      qc.invalidateQueries(['teacher-courses']);
      navigate(`/teacher/courses/${data.course.id}/edit`);
    },
    onError: (err) => {
      const errors = err.response?.data?.errors;
      if (errors) Object.values(errors).flat().forEach(msg => toast.error(msg));
      else toast.error('Failed to create course.');
    },
  });

  const handleThumbnailChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setThumbnail(file);
      setThumbnailPreview(URL.createObjectURL(file));
    }
  };

  return (
    <div className="max-w-3xl space-y-6 animate-fade-in">
      <div className="flex items-center gap-4">
        <Link to="/teacher/courses" className="btn btn-secondary btn-sm">
          <ArrowLeft className="w-4 h-4" /> Back
        </Link>
        <div>
          <h1 className="section-title">Create New Course</h1>
          <p className="section-subtitle">Fill in the details to create your course</p>
        </div>
      </div>

      <form onSubmit={handleSubmit((d) => createMutation.mutate(d))} className="space-y-6">
        {/* Basic Info */}
        <div className="card p-6 space-y-5">
          <h2 className="font-semibold text-gray-900 dark:text-gray-100 border-b border-gray-100 dark:border-gray-800 pb-3">Basic Information</h2>

          {/* Thumbnail */}
          <div>
            <label className="label">Course Thumbnail</label>
            <div className="mt-2 flex gap-4 items-start">
              {thumbnailPreview ? (
                <img src={thumbnailPreview} alt="Thumbnail" className="w-32 h-20 rounded-xl object-cover border border-gray-200" />
              ) : (
                <div className="w-32 h-20 rounded-xl bg-gray-100 dark:bg-gray-800 flex items-center justify-center border-2 border-dashed border-gray-300">
                  <Upload className="w-6 h-6 text-gray-400" />
                </div>
              )}
              <label className="btn btn-outline btn-sm cursor-pointer">
                <Upload className="w-4 h-4" /> Upload Image
                <input type="file" accept="image/*" onChange={handleThumbnailChange} className="hidden" />
              </label>
            </div>
          </div>

          <div>
            <label className="label">Course Title *</label>
            <input {...register('title')} className={`input ${errors.title ? 'input-error' : ''}`} placeholder="e.g. Complete Web Development Bootcamp 2024" />
            {errors.title && <p className="text-red-500 text-xs mt-1">{errors.title.message}</p>}
          </div>

          <div>
            <label className="label">Short Description</label>
            <input {...register('short_description')} className="input" placeholder="Brief course summary (shown in listings)" />
          </div>

          <div>
            <label className="label">Full Description *</label>
            <textarea {...register('description')} rows={5} className={`input ${errors.description ? 'input-error' : ''}`} placeholder="Describe your course in detail..." />
            {errors.description && <p className="text-red-500 text-xs mt-1">{errors.description.message}</p>}
          </div>

          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="label">Category *</label>
              <select {...register('category_id')} className={`input ${errors.category_id ? 'input-error' : ''}`}>
                <option value="">Select category</option>
                {categories?.map((cat) => (
                  <option key={cat.id} value={cat.id}>{cat.name}</option>
                ))}
              </select>
              {errors.category_id && <p className="text-red-500 text-xs mt-1">{errors.category_id.message}</p>}
            </div>
            <div>
              <label className="label">Level</label>
              <select {...register('level')} className="input">
                <option value="beginner">Beginner</option>
                <option value="intermediate">Intermediate</option>
                <option value="advanced">Advanced</option>
                <option value="all-levels">All Levels</option>
              </select>
            </div>
          </div>

          <div className="grid sm:grid-cols-3 gap-4">
            <div>
              <label className="label">Price ($)</label>
              <input {...register('price')} type="number" min="0" step="0.01" className="input" />
            </div>
            <div>
              <label className="label">Discount Price ($)</label>
              <input {...register('discount_price')} type="number" min="0" step="0.01" className="input" placeholder="Optional" />
            </div>
            <div>
              <label className="label">Language</label>
              <select {...register('language')} className="input">
                {['English', 'Spanish', 'French', 'Arabic', 'German', 'Portuguese'].map(l => (
                  <option key={l} value={l}>{l}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Requirements */}
        <div className="card p-6 space-y-4">
          <h2 className="font-semibold">Course Requirements</h2>
          {reqFields.map((field, i) => (
            <div key={field.id} className="flex gap-2">
              <input {...register(`requirements.${i}.value`)} className="input flex-1" placeholder={`Requirement ${i + 1}`} />
              {reqFields.length > 1 && (
                <button type="button" onClick={() => removeReq(i)} className="btn btn-sm text-red-500 btn-secondary">
                  <Trash2 className="w-4 h-4" />
                </button>
              )}
            </div>
          ))}
          <button type="button" onClick={() => addReq({ value: '' })} className="btn btn-secondary btn-sm">
            <Plus className="w-4 h-4" /> Add Requirement
          </button>
        </div>

        {/* Learning Outcomes */}
        <div className="card p-6 space-y-4">
          <h2 className="font-semibold">What Students Will Learn</h2>
          {outcomeFields.map((field, i) => (
            <div key={field.id} className="flex gap-2">
              <input {...register(`learning_outcomes.${i}.value`)} className="input flex-1" placeholder={`Learning outcome ${i + 1}`} />
              {outcomeFields.length > 1 && (
                <button type="button" onClick={() => removeOutcome(i)} className="btn btn-sm text-red-500 btn-secondary">
                  <Trash2 className="w-4 h-4" />
                </button>
              )}
            </div>
          ))}
          <button type="button" onClick={() => addOutcome({ value: '' })} className="btn btn-secondary btn-sm">
            <Plus className="w-4 h-4" /> Add Outcome
          </button>
        </div>

        <div className="flex gap-4">
          <button type="submit" disabled={createMutation.isPending} className="btn btn-primary btn-lg">
            {createMutation.isPending ? <Spinner size="sm" /> : <Check className="w-4 h-4" />}
            Create Course
          </button>
          <Link to="/teacher/courses" className="btn btn-secondary btn-lg">Cancel</Link>
        </div>
      </form>
    </div>
  );
}
