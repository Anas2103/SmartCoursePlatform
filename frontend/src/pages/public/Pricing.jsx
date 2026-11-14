import { Link } from 'react-router-dom';
import { CheckCircle, Zap } from 'lucide-react';
import { motion } from 'framer-motion';

const plans = [
  {
    name: 'Free',
    price: 0,
    description: 'Perfect for exploring',
    features: ['Access to free courses', 'Basic progress tracking', 'Community forum access', 'Mobile-friendly'],
    cta: 'Get Started Free',
    href: '/register',
    featured: false,
  },
  {
    name: 'Pro',
    price: 29,
    description: 'For serious learners',
    features: ['All free features', 'Unlimited course purchases', 'Certificate of completion', 'Priority support', 'Offline downloads', 'Advanced analytics'],
    cta: 'Start Pro Plan',
    href: '/register',
    featured: true,
    badge: 'Most Popular',
  },
  {
    name: 'Enterprise',
    price: 99,
    description: 'For teams & organizations',
    features: ['Everything in Pro', 'Team management dashboard', 'Bulk course enrollment', 'Custom learning paths', 'Dedicated account manager', 'SSO & advanced security'],
    cta: 'Contact Sales',
    href: '/contact',
    featured: false,
  },
];

export default function Pricing() {
  return (
    <div className="py-20 bg-gray-50 dark:bg-gray-950 px-4">
      <div className="max-w-5xl mx-auto">
        <div className="text-center mb-16">
          <h1 className="text-4xl font-extrabold text-gray-900 dark:text-gray-100 mb-4">Simple, Transparent Pricing</h1>
          <p className="text-gray-500 text-lg max-w-xl mx-auto">Choose the plan that's right for you. All plans include access to our core platform.</p>
        </div>

        <div className="grid md:grid-cols-3 gap-8 items-start">
          {plans.map((plan, i) => (
            <motion.div key={plan.name} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }} viewport={{ once: true }} className={`card p-8 relative ${plan.featured ? 'ring-2 ring-primary-600 shadow-2xl' : ''}`}>
              {plan.badge && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                  <span className="badge badge-primary shadow px-3 py-1 text-xs font-semibold">
                    <Zap className="w-3 h-3 mr-1" />{plan.badge}
                  </span>
                </div>
              )}
              <div className="mb-6">
                <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">{plan.name}</h2>
                <p className="text-gray-500 text-sm mt-1">{plan.description}</p>
                <div className="mt-4 flex items-baseline gap-1">
                  <span className="text-4xl font-extrabold text-gray-900 dark:text-gray-100">${plan.price}</span>
                  <span className="text-gray-400">/month</span>
                </div>
              </div>
              <ul className="space-y-3 mb-8">
                {plan.features.map((feat) => (
                  <li key={feat} className="flex gap-2 text-sm text-gray-600 dark:text-gray-400">
                    <CheckCircle className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />{feat}
                  </li>
                ))}
              </ul>
              <Link to={plan.href} className={`btn w-full btn-lg justify-center ${plan.featured ? 'btn-primary' : 'btn-outline'}`}>
                {plan.cta}
              </Link>
            </motion.div>
          ))}
        </div>

        <div className="mt-16 text-center">
          <p className="text-gray-500 text-sm">All plans come with a 30-day money-back guarantee. No questions asked.</p>
        </div>
      </div>
    </div>
  );
}
