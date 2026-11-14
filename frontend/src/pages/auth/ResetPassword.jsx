import { Link, useSearchParams, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { useMutation } from '@tanstack/react-query';
import { authApi } from '@/services/api';
import { GraduationCap, Eye, EyeOff, CheckCircle } from 'lucide-react';
import { useState } from 'react';
import toast from 'react-hot-toast';
import Spinner from '@/components/common/Spinner';

export default function ResetPassword() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [showPass, setShowPass] = useState(false);
  const [done, setDone] = useState(false);

  const { register, handleSubmit, formState: { errors } } = useForm({
    defaultValues: {
      email: searchParams.get('email') || '',
      token: searchParams.get('token') || '',
    },
  });

  const mutation = useMutation({
    mutationFn: (data) => authApi.resetPassword(data),
    onSuccess: () => setDone(true),
    onError: (err) => toast.error(err.response?.data?.message || 'Reset failed. Link may be expired.'),
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
          {done ? (
            <div className="text-center py-4">
              <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="w-8 h-8 text-emerald-600" />
              </div>
              <h2 className="text-xl font-bold mb-2">Password Reset!</h2>
              <p className="text-gray-500 mb-6">Your password has been successfully reset.</p>
              <Link to="/login" className="btn btn-primary w-full">Sign In</Link>
            </div>
          ) : (
            <>
              <div className="mb-6">
                <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Create new password</h1>
                <p className="text-gray-500 mt-1 text-sm">Enter your new password below.</p>
              </div>
              <form onSubmit={handleSubmit((d) => mutation.mutate(d))} className="space-y-4">
                <input type="hidden" {...register('token')} />
                <input type="hidden" {...register('email')} />
                <div>
                  <label className="label">New Password</label>
                  <div className="relative">
                    <input {...register('password', { required: 'Password is required', minLength: { value: 8, message: 'Min 8 characters' } })} type={showPass ? 'text' : 'password'} className={`input pr-10 ${errors.password ? 'input-error' : ''}`} placeholder="New password" />
                    <button type="button" onClick={() => setShowPass(!showPass)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">
                      {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                  {errors.password && <p className="text-red-500 text-xs mt-1">{errors.password.message}</p>}
                </div>
                <div>
                  <label className="label">Confirm Password</label>
                  <input {...register('password_confirmation', { required: 'Please confirm password' })} type="password" className={`input ${errors.password_confirmation ? 'input-error' : ''}`} placeholder="Repeat password" />
                  {errors.password_confirmation && <p className="text-red-500 text-xs mt-1">{errors.password_confirmation.message}</p>}
                </div>
                <button type="submit" disabled={mutation.isPending} className="btn btn-primary w-full btn-lg">
                  {mutation.isPending && <Spinner size="sm" />}
                  Reset Password
                </button>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
