import { Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { useMutation } from '@tanstack/react-query';
import { authApi } from '@/services/api';
import { GraduationCap, Mail, CheckCircle } from 'lucide-react';
import { useState } from 'react';
import toast from 'react-hot-toast';
import Spinner from '@/components/common/Spinner';

export default function ForgotPassword() {
  const [sent, setSent] = useState(false);
  const { register, handleSubmit, getValues, formState: { errors } } = useForm();

  const mutation = useMutation({
    mutationFn: (data) => authApi.forgotPassword(data.email),
    onSuccess: () => setSent(true),
    onError: (err) => toast.error(err.response?.data?.message || 'Failed to send reset link.'),
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-purple-50 dark:from-gray-950 dark:via-gray-900 dark:to-gray-950 flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center gap-2 text-2xl font-bold text-primary-600">
            <GraduationCap className="w-8 h-8" />SmartCourse
          </Link>
        </div>

        <div className="card p-8 shadow-xl">
          {sent ? (
            <div className="text-center py-4">
              <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="w-8 h-8 text-emerald-600" />
              </div>
              <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-2">Check your email</h2>
              <p className="text-gray-500 mb-6">We sent a reset link to <strong>{getValues('email')}</strong></p>
              <Link to="/login" className="btn btn-primary w-full">Back to Login</Link>
            </div>
          ) : (
            <>
              <div className="mb-6">
                <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Forgot password?</h1>
                <p className="text-gray-500 mt-1 text-sm">Enter your email and we'll send you a reset link.</p>
              </div>
              <form onSubmit={handleSubmit((d) => mutation.mutate(d))} className="space-y-4">
                <div>
                  <label className="label">Email Address</label>
                  <input {...register('email', { required: 'Email is required', pattern: { value: /^\S+@\S+$/i, message: 'Invalid email' } })} type="email" className={`input ${errors.email ? 'input-error' : ''}`} placeholder="you@example.com" />
                  {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email.message}</p>}
                </div>
                <button type="submit" disabled={mutation.isPending} className="btn btn-primary w-full btn-lg">
                  {mutation.isPending ? <Spinner size="sm" /> : <Mail className="w-4 h-4" />}
                  Send Reset Link
                </button>
              </form>
              <p className="text-center text-sm text-gray-500 mt-4">
                Remembered?{' '}
                <Link to="/login" className="text-primary-600 font-medium hover:underline">Back to Login</Link>
              </p>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
