import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { publicApi, studentApi } from '@/services/api';
import { Check, Zap, Crown, Star } from 'lucide-react';
import Spinner from '@/components/common/Spinner';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import clsx from 'clsx';

export default function SubscriptionPage() {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [billing, setBilling] = useState('monthly');

  const { data, isLoading } = useQuery({
    queryKey: ['subscription-plans'],
    queryFn: () => publicApi.getSubscriptionPlans(),
    select: (res) => res.data,
  });

  const subscribeMutation = useMutation({
    mutationFn: (plan) => studentApi.subscribe({ plan_id: plan.id, billing_cycle: billing }),
    onSuccess: (res) => {
      toast.success(res.data.message || 'Subscription activated!');
      queryClient.invalidateQueries({ queryKey: ['subscription-plans'] });
    },
    onError: (err) => toast.error(err.response?.data?.message || 'Subscription failed'),
  });

  const plans = data?.plans || [];
  const currentPlan = data?.current;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 py-16 px-4">
      <div className="max-w-5xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-gray-100 mb-4">Choose Your Plan</h1>
          <p className="text-xl text-gray-500 mb-8">Get unlimited access to all courses</p>

          {/* Billing toggle */}
          <div className="inline-flex bg-gray-100 dark:bg-gray-800 p-1 rounded-full">
            <button onClick={() => setBilling('monthly')} className={clsx('px-5 py-2 rounded-full text-sm font-medium transition-all', billing === 'monthly' ? 'bg-white dark:bg-gray-700 shadow text-gray-900 dark:text-gray-100' : 'text-gray-500')}>
              Monthly
            </button>
            <button onClick={() => setBilling('yearly')} className={clsx('px-5 py-2 rounded-full text-sm font-medium transition-all relative', billing === 'yearly' ? 'bg-white dark:bg-gray-700 shadow text-gray-900 dark:text-gray-100' : 'text-gray-500')}>
              Yearly <span className="ml-1 text-xs bg-emerald-500 text-white px-1.5 py-0.5 rounded-full">Save 20%</span>
            </button>
          </div>
        </div>

        {isLoading ? <div className="flex justify-center py-20"><Spinner size="lg" /></div> : (
          <div className="grid md:grid-cols-3 gap-6">
            {plans.map((plan) => {
              const price = billing === 'yearly' ? plan.yearly_price : plan.monthly_price;
              const isActive = currentPlan?.plan?.id === plan.id;
              return (
                <div key={plan.id} className={clsx('card p-8 relative', plan.is_featured && 'ring-2 ring-primary-500 shadow-xl shadow-primary-100 dark:shadow-primary-900/20')}>
                  {plan.is_featured && (
                    <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-primary-600 text-white text-xs font-bold px-4 py-1.5 rounded-full flex items-center gap-1">
                      <Star className="w-3 h-3 fill-current" /> Most Popular
                    </div>
                  )}
                  <div className="mb-6">
                    <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-1">{plan.name}</h3>
                    <p className="text-sm text-gray-500">{plan.description}</p>
                  </div>
                  <div className="mb-6">
                    <span className="text-4xl font-bold text-gray-900 dark:text-gray-100">${Number(price).toFixed(0)}</span>
                    <span className="text-gray-500">/{billing === 'yearly' ? 'year' : 'month'}</span>
                    {billing === 'yearly' && (
                      <p className="text-sm text-emerald-600 mt-1">${(Number(plan.monthly_price) * 12).toFixed(0)}/year billed monthly</p>
                    )}
                  </div>
                  <ul className="space-y-3 mb-8">
                    {(plan.features || []).map((f, i) => (
                      <li key={i} className="flex items-start gap-2 text-sm text-gray-700 dark:text-gray-300">
                        <Check className="w-4 h-4 text-emerald-500 mt-0.5 shrink-0" />{f}
                      </li>
                    ))}
                  </ul>
                  {isActive ? (
                    <div className="btn w-full justify-center bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 border border-emerald-200 dark:border-emerald-800 cursor-default">
                      <Check className="w-4 h-4" /> Current Plan
                    </div>
                  ) : (
                    <button
                      onClick={() => isAuthenticated ? subscribeMutation.mutate(plan) : navigate('/register')}
                      disabled={subscribeMutation.isPending}
                      className={clsx('btn w-full justify-center', plan.is_featured ? 'btn-primary' : 'btn-secondary')}
                    >
                      {Number(price) === 0 ? 'Get Started Free' : `Get ${plan.name}`}
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        )}

        <p className="text-center text-sm text-gray-400 mt-8">All plans include a 30-day money-back guarantee. Cancel anytime.</p>
      </div>
    </div>
  );
}
