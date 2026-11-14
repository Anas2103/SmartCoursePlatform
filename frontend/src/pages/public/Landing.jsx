import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { ArrowRight, Play, Star, Users, BookOpen, Award, CheckCircle, Zap, Globe, Shield } from 'lucide-react';
import { coursesApi, categoriesApi } from '@/services/api';
import CourseCard from '@/components/common/CourseCard';
import Spinner from '@/components/common/Spinner';

const stats = [
  { label: 'Active Students', value: '50,000+', icon: Users },
  { label: 'Total Courses', value: '2,000+', icon: BookOpen },
  { label: 'Expert Instructors', value: '500+', icon: Star },
  { label: 'Certificates Issued', value: '30,000+', icon: Award },
];

const features = [
  { icon: Zap, title: 'Learn at Your Own Pace', desc: 'Access course content 24/7 and learn on your schedule.' },
  { icon: Globe, title: 'Expert Instructors', desc: 'Learn from industry professionals with real-world experience.' },
  { icon: Shield, title: 'Certificate of Completion', desc: 'Earn verified certificates to boost your career.' },
  { icon: CheckCircle, title: 'Lifetime Access', desc: 'Purchase once and access forever, including future updates.' },
];

export default function Landing() {
  const { data: featuredCourses, isLoading: coursesLoading } = useQuery({
    queryKey: ['featured-courses'],
    queryFn: () => coursesApi.getFeatured(),
    select: (res) => res.data,
  });

  const { data: categories } = useQuery({
    queryKey: ['categories'],
    queryFn: () => categoriesApi.getAll(),
    select: (res) => res.data,
  });

  return (
    <div>
      {/* Hero */}
      <section className="bg-gradient-hero text-white py-20 px-4 relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-20 left-20 w-72 h-72 bg-purple-400 rounded-full blur-3xl" />
          <div className="absolute bottom-20 right-20 w-96 h-96 bg-blue-400 rounded-full blur-3xl" />
        </div>
        <div className="max-w-7xl mx-auto relative">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
              <span className="badge bg-primary-500/20 text-primary-200 border border-primary-500/30 mb-4">
                🎓 #1 Online Learning Platform
              </span>
              <h1 className="text-5xl lg:text-6xl font-extrabold leading-tight mb-6">
                Learn Without <span className="text-gradient bg-gradient-to-r from-yellow-300 to-orange-300 bg-clip-text text-transparent">Limits</span>
              </h1>
              <p className="text-lg text-primary-200 mb-8 leading-relaxed max-w-xl">
                Access thousands of expert-led courses and build real-world skills at your own pace. Join 50,000+ learners transforming their careers today.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Link to="/courses" className="btn bg-white text-primary-700 hover:bg-primary-50 btn-lg font-semibold shadow-lg">
                  Explore Courses <ArrowRight className="w-5 h-5" />
                </Link>
                <Link to="/register" className="btn border-2 border-white/50 text-white hover:bg-white/10 btn-lg">
                  <Play className="w-5 h-5" /> Start Free Trial
                </Link>
              </div>
              <div className="flex items-center gap-6 mt-8">
                <div className="flex -space-x-3">
                  {[1,2,3,4].map(i => (
                    <img key={i} src={`https://i.pravatar.cc/40?img=${i+10}`} className="w-9 h-9 rounded-full border-2 border-white" alt="" />
                  ))}
                </div>
                <div>
                  <div className="flex items-center gap-1 mb-0.5">
                    {[1,2,3,4,5].map(i => <Star key={i} className="w-4 h-4 fill-yellow-400 text-yellow-400" />)}
                    <span className="text-yellow-300 font-semibold text-sm ml-1">4.9</span>
                  </div>
                  <p className="text-primary-200 text-sm">Trusted by 50,000+ students</p>
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="hidden lg:block"
            >
              <div className="relative">
                <img src="https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=600&h=400&fit=crop" alt="Learning" className="rounded-2xl shadow-2xl" />
                {/* Floating cards */}
                <div className="absolute -bottom-6 -left-6 bg-white dark:bg-gray-800 rounded-xl shadow-xl p-4 flex items-center gap-3">
                  <div className="w-10 h-10 bg-emerald-100 dark:bg-emerald-900/40 rounded-full flex items-center justify-center">
                    <CheckCircle className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                  </div>
                  <div>
                    <p className="font-semibold text-sm text-gray-900 dark:text-gray-100">Course Completed!</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">Certificate earned</p>
                  </div>
                </div>
                <div className="absolute -top-4 -right-4 bg-white dark:bg-gray-800 rounded-xl shadow-xl p-3 flex items-center gap-2">
                  <div className="w-8 h-8 bg-primary-100 dark:bg-primary-900/40 rounded-full flex items-center justify-center">
                    <Users className="w-4 h-4 text-primary-600 dark:text-primary-400" />
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-gray-900 dark:text-gray-100">2.5k+ students</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">enrolled today</p>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="py-12 bg-white dark:bg-gray-950 border-b border-gray-100 dark:border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
            {stats.map((stat, i) => (
              <motion.div key={stat.label} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }} viewport={{ once: true }} className="text-center">
                <div className="flex justify-center mb-2">
                  <stat.icon className="w-6 h-6 text-primary-600" />
                </div>
                <div className="text-3xl font-extrabold text-gray-900 dark:text-gray-100">{stat.value}</div>
                <div className="text-sm text-gray-500 dark:text-gray-400 mt-1">{stat.label}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Categories */}
      {categories && categories.length > 0 && (
        <section className="py-16 bg-gray-50 dark:bg-gray-950">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-10">
              <h2 className="text-3xl font-bold text-gray-900 dark:text-gray-100">Browse by Category</h2>
              <p className="text-gray-500 mt-2">Explore thousands of courses in popular fields</p>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
              {categories.slice(0, 8).map((cat, i) => (
                <motion.div key={cat.id} initial={{ opacity: 0, scale: 0.95 }} whileInView={{ opacity: 1, scale: 1 }} transition={{ delay: i * 0.05 }} viewport={{ once: true }}>
                  <Link to={`/courses?category=${cat.slug}`} className="card-hover p-5 text-center block">
                    <div className="text-3xl mb-2">{cat.icon || '📚'}</div>
                    <h3 className="font-semibold text-sm text-gray-900 dark:text-gray-100">{cat.name}</h3>
                    <p className="text-xs text-gray-400 mt-1">{cat.courses_count || 0} courses</p>
                  </Link>
                </motion.div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Featured Courses */}
      <section className="py-16 bg-white dark:bg-gray-950">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-10">
            <div>
              <h2 className="text-3xl font-bold text-gray-900 dark:text-gray-100">Featured Courses</h2>
              <p className="text-gray-500 mt-1">Hand-picked courses by our expert team</p>
            </div>
            <Link to="/courses" className="btn btn-outline hidden sm:flex">
              View All <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
          {coursesLoading ? (
            <div className="flex justify-center py-12"><Spinner size="lg" /></div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {featuredCourses?.slice(0, 8).map((course, i) => (
                <motion.div key={course.id} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }} viewport={{ once: true }}>
                  <CourseCard course={course} />
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Features */}
      <section className="py-16 bg-gray-50 dark:bg-gray-900/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-gray-100">Why Choose SmartCourse?</h2>
            <p className="text-gray-500 mt-2 max-w-xl mx-auto">We provide the best learning experience with features designed for your success</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, i) => (
              <motion.div key={feature.title} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }} viewport={{ once: true }} className="card p-6 text-center hover:shadow-md transition-shadow">
                <div className="w-12 h-12 bg-primary-100 dark:bg-primary-900/30 rounded-xl flex items-center justify-center mx-auto mb-4">
                  <feature.icon className="w-6 h-6 text-primary-600" />
                </div>
                <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-2">{feature.title}</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">{feature.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 bg-gradient-hero text-white">
        <div className="max-w-3xl mx-auto px-4 text-center">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
            <h2 className="text-4xl font-extrabold mb-4">Start Learning Today</h2>
            <p className="text-primary-200 mb-8 text-lg">Join thousands of learners who are already upskilling and advancing their careers</p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/register" className="btn bg-white text-primary-700 hover:bg-primary-50 btn-lg font-semibold shadow-lg">
                Get Started for Free <ArrowRight className="w-5 h-5" />
              </Link>
              <Link to="/courses" className="btn border-2 border-white/50 text-white hover:bg-white/10 btn-lg">
                Browse Courses
              </Link>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
