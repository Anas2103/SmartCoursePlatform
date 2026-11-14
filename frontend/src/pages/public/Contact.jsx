import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useMutation } from '@tanstack/react-query';
import { publicApi } from '@/services/api';
import { Mail, Phone, MapPin, Send } from 'lucide-react';
import toast from 'react-hot-toast';
import Spinner from '@/components/common/Spinner';

const schema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email'),
  subject: z.string().min(5, 'Subject must be at least 5 characters'),
  message: z.string().min(20, 'Message must be at least 20 characters'),
});

export default function Contact() {
  const { register, handleSubmit, reset, formState: { errors } } = useForm({
    resolver: zodResolver(schema),
  });

  const mutation = useMutation({
    mutationFn: (data) => publicApi.submitContact(data),
    onSuccess: () => {
      toast.success('Message sent! We\'ll get back to you soon.');
      reset();
    },
    onError: () => toast.error('Failed to send message. Please try again.'),
  });

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold text-gray-900 dark:text-gray-100">Contact Us</h1>
        <p className="text-gray-500 mt-3 max-w-xl mx-auto">Have a question or want to learn more? We'd love to hear from you.</p>
      </div>

      <div className="grid md:grid-cols-3 gap-12">
        {/* Info */}
        <div className="space-y-6">
          {[
            { icon: Mail, title: 'Email', info: 'support@smartcourse.com' },
            { icon: Phone, title: 'Phone', info: '+1 (555) 123-4567' },
            { icon: MapPin, title: 'Address', info: '123 Learning St, San Francisco, CA 94105' },
          ].map(({ icon: Icon, title, info }) => (
            <div key={title} className="flex gap-4">
              <div className="w-10 h-10 bg-primary-100 dark:bg-primary-900/30 rounded-lg flex items-center justify-center shrink-0">
                <Icon className="w-5 h-5 text-primary-600" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 dark:text-gray-100">{title}</h3>
                <p className="text-sm text-gray-500">{info}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Form */}
        <div className="md:col-span-2">
          <div className="card p-8">
            <form onSubmit={handleSubmit((data) => mutation.mutate(data))} className="space-y-5">
              <div className="grid sm:grid-cols-2 gap-5">
                <div>
                  <label className="label">Name</label>
                  <input {...register('name')} className={`input ${errors.name ? 'input-error' : ''}`} placeholder="John Doe" />
                  {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name.message}</p>}
                </div>
                <div>
                  <label className="label">Email</label>
                  <input {...register('email')} className={`input ${errors.email ? 'input-error' : ''}`} placeholder="john@example.com" />
                  {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email.message}</p>}
                </div>
              </div>
              <div>
                <label className="label">Subject</label>
                <input {...register('subject')} className={`input ${errors.subject ? 'input-error' : ''}`} placeholder="How can we help?" />
                {errors.subject && <p className="text-red-500 text-xs mt-1">{errors.subject.message}</p>}
              </div>
              <div>
                <label className="label">Message</label>
                <textarea {...register('message')} rows={5} className={`input resize-none ${errors.message ? 'input-error' : ''}`} placeholder="Tell us more..." />
                {errors.message && <p className="text-red-500 text-xs mt-1">{errors.message.message}</p>}
              </div>
              <button type="submit" disabled={mutation.isPending} className="btn btn-primary btn-lg w-full">
                {mutation.isPending ? <Spinner size="sm" /> : <Send className="w-4 h-4" />}
                Send Message
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
