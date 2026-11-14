import { useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useQuery, useMutation } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { Play, Clock, Users, BookOpen, Award, CheckCircle, ChevronDown, ChevronUp, Star, Globe, Lock, Heart } from 'lucide-react';
import { coursesApi, paymentsApi, studentApi } from '@/services/api';
import { useAuth } from '@/contexts/AuthContext';
import StarRating from '@/components/common/StarRating';
import Spinner from '@/components/common/Spinner';
import toast from 'react-hot-toast';
import clsx from 'clsx';

export default function CourseDetail() {
  const { slug } = useParams();
  const { isAuthenticated, user } = useAuth();
  const navigate = useNavigate();
  const [expandedSection, setExpandedSection] = useState(null);
  const [activeTab, setActiveTab] = useState('overview');
  const [inWishlist, setInWishlist] = useState(false);

  const { data, isLoading } = useQuery({
    queryKey: ['course', slug],
    queryFn: () => coursesApi.getBySlug(slug),
    select: (res) => res.data,
  });

  const { data: reviewsData } = useQuery({
    queryKey: ['course-reviews', slug],
    queryFn: () => coursesApi.getReviews(slug),
    select: (res) => res.data,
  });

  const enrollMutation = useMutation({
    mutationFn: () => paymentsApi.checkout(course.id),
    onSuccess: (res) => {
      if (res.data.enrollment) {
        toast.success('Enrolled successfully!');
        navigate(`/student/courses/${course.id}/learn`);
      } else {
        // paid course - redirect to checkout
        toast.success('Redirecting to checkout...');
      }
    },
    onError: (err) => {
      toast.error(err.response?.data?.message || 'Enrollment failed');
    },
  });

  const wishlistMutation = useMutation({
    mutationFn: () => studentApi.toggleWishlist(course.id),
    onSuccess: (res) => {
      setInWishlist(res.data.in_wishlist);
      toast.success(res.data.in_wishlist ? 'Added to wishlist' : 'Removed from wishlist');
    },
  });

  if (isLoading) {
    return <div className="flex justify-center items-center min-h-screen"><Spinner size="lg" /></div>;
  }

  if (!data) return null;

  const { course, is_enrolled } = data;

  const formatDuration = (minutes) => {
    const h = Math.floor(minutes / 60);
    const m = minutes % 60;
    return h > 0 ? `${h}h ${m}m` : `${m}m`;
  };

  const handleEnroll = () => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    if (user?.role === 'teacher' || user?.role === 'admin' || user?.role === 'super-admin') {
      toast.error('Instructors and admins cannot enroll in courses.');
      return;
    }
    enrollMutation.mutate();
  };

  const discount = course.discount_price
    ? Math.round(((course.price - course.effective_price) / course.price) * 100)
    : 0;

  return (
    <div className="bg-gray-50 dark:bg-gray-950 min-h-screen">
      {/* Hero */}
      <div className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2">
              <div className="flex items-center gap-2 mb-3 flex-wrap">
                {course.category && (
                  <Link to={`/courses?category=${course.category.slug}`} className="badge badge-primary">{course.category.name}</Link>
                )}
                {course.is_bestseller && <span className="badge bg-amber-400 text-amber-900">Bestseller</span>}
                <span className="badge badge-gray capitalize">{course.level}</span>
              </div>
              <h1 className="text-3xl font-bold mb-4">{course.title}</h1>
              {course.short_description && (
                <p className="text-gray-300 mb-4 text-lg">{course.short_description}</p>
              )}
              <div className="flex items-center gap-4 flex-wrap text-sm text-gray-300 mb-4">
                <div className="flex items-center gap-1">
                  <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                  <span className="font-bold text-amber-400">{Number(course.avg_rating).toFixed(1)}</span>
                  <span>({course.total_reviews?.toLocaleString()} reviews)</span>
                </div>
                <div className="flex items-center gap-1"><Users className="w-4 h-4" />{course.total_enrolled?.toLocaleString()} students</div>
                <div className="flex items-center gap-1"><BookOpen className="w-4 h-4" />{course.total_lessons} lessons</div>
                <div className="flex items-center gap-1"><Clock className="w-4 h-4" />{formatDuration(course.duration_minutes)}</div>
                <div className="flex items-center gap-1"><Globe className="w-4 h-4" />{course.language}</div>
              </div>
              {course.teacher && (
                <div className="flex items-center gap-2 text-sm text-gray-400">
                  <span>Created by</span>
                  <img src={course.teacher.avatar_url} alt={course.teacher.name} className="w-6 h-6 rounded-full" />
                  <span className="text-primary-400 font-medium">{course.teacher.name}</span>
                </div>
              )}
            </div>

            {/* Purchase Card - Desktop */}
            <div className="hidden lg:block">
              <PurchaseCard
                course={course}
                isEnrolled={is_enrolled}
                onEnroll={handleEnroll}
                onWishlist={() => wishlistMutation.mutate()}
                inWishlist={inWishlist}
                enrollLoading={enrollMutation.isPending}
                isAuthenticated={isAuthenticated}
                discount={discount}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Purchase Card */}
      <div className="lg:hidden bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700 p-4">
        <PurchaseCard
          course={course}
          isEnrolled={is_enrolled}
          onEnroll={handleEnroll}
          onWishlist={() => wishlistMutation.mutate()}
          inWishlist={inWishlist}
          enrollLoading={enrollMutation.isPending}
          isAuthenticated={isAuthenticated}
          discount={discount}
          horizontal
        />
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-8">
            {/* Tabs */}
            <div className="flex gap-2 border-b border-gray-200 dark:border-gray-700">
              {['overview', 'curriculum', 'reviews'].map((tab) => (
                <button key={tab} onClick={() => setActiveTab(tab)} className={clsx('pb-3 px-1 text-sm font-medium capitalize border-b-2 transition-colors', tab === activeTab ? 'border-primary-600 text-primary-600' : 'border-transparent text-gray-500 hover:text-gray-700 dark:hover:text-gray-300')}>
                  {tab}
                </button>
              ))}
            </div>

            {/* Overview */}
            {activeTab === 'overview' && (
              <div className="space-y-6">
                {/* What you'll learn */}
                {course.learning_outcomes?.length > 0 && (
                  <div className="card p-6">
                    <h2 className="text-xl font-bold mb-4">What You'll Learn</h2>
                    <div className="grid sm:grid-cols-2 gap-3">
                      {course.learning_outcomes.map((item, i) => (
                        <div key={i} className="flex gap-2 text-sm">
                          <CheckCircle className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                          <span className="text-gray-700 dark:text-gray-300">{item}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Requirements */}
                {course.requirements?.length > 0 && (
                  <div>
                    <h2 className="text-xl font-bold mb-3">Requirements</h2>
                    <ul className="space-y-2">
                      {course.requirements.map((req, i) => (
                        <li key={i} className="flex gap-2 text-sm text-gray-600 dark:text-gray-400">
                          <span className="text-gray-400 shrink-0">•</span>{req}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Description */}
                <div>
                  <h2 className="text-xl font-bold mb-3">Description</h2>
                  <div className="prose-content text-gray-600 dark:text-gray-400 leading-relaxed">{course.description}</div>
                </div>

                {/* Instructor */}
                {course.teacher && (
                  <div>
                    <h2 className="text-xl font-bold mb-4">Your Instructor</h2>
                    <div className="card p-6">
                      <div className="flex gap-4">
                        <img src={course.teacher.avatar_url} alt={course.teacher.name} className="w-16 h-16 rounded-full object-cover" />
                        <div>
                          <h3 className="font-semibold text-gray-900 dark:text-gray-100">{course.teacher.name}</h3>
                          <p className="text-sm text-gray-500 mb-2">{course.teacher.headline}</p>
                          {course.teacher.bio && <p className="text-sm text-gray-600 dark:text-gray-400">{course.teacher.bio}</p>}
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* FAQs */}
                {course.faqs?.length > 0 && (
                  <div>
                    <h2 className="text-xl font-bold mb-4">FAQ</h2>
                    <div className="space-y-3">
                      {course.faqs.map((faq) => (
                        <div key={faq.id} className="card overflow-hidden">
                          <button onClick={() => setExpandedSection(expandedSection === faq.id ? null : faq.id)} className="w-full flex items-center justify-between p-4 text-left">
                            <span className="font-medium text-sm text-gray-900 dark:text-gray-100">{faq.question}</span>
                            {expandedSection === faq.id ? <ChevronUp className="w-4 h-4 text-gray-400 shrink-0" /> : <ChevronDown className="w-4 h-4 text-gray-400 shrink-0" />}
                          </button>
                          {expandedSection === faq.id && (
                            <div className="px-4 pb-4 text-sm text-gray-600 dark:text-gray-400 border-t border-gray-100 dark:border-gray-800 pt-3">{faq.answer}</div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Curriculum */}
            {activeTab === 'curriculum' && (
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-bold">Course Curriculum</h2>
                  <span className="text-sm text-gray-500">{course.total_lessons} lessons • {formatDuration(course.duration_minutes)}</span>
                </div>
                <div className="space-y-3">
                  {course.sections?.map((section, i) => (
                    <div key={section.id} className="card overflow-hidden">
                      <button onClick={() => setExpandedSection(expandedSection === section.id ? null : section.id)} className="w-full flex items-center justify-between p-4 text-left bg-gray-50 dark:bg-gray-800/50">
                        <div>
                          <span className="font-semibold text-sm text-gray-900 dark:text-gray-100">{section.title}</span>
                          <span className="text-xs text-gray-400 ml-2">{section.lessons?.length} lessons</span>
                        </div>
                        {expandedSection === section.id ? <ChevronUp className="w-4 h-4 text-gray-400" /> : <ChevronDown className="w-4 h-4 text-gray-400" />}
                      </button>
                      {expandedSection === section.id && (
                        <div className="divide-y divide-gray-100 dark:divide-gray-800">
                          {section.lessons?.map((lesson) => (
                            <div key={lesson.id} className="flex items-center gap-3 px-4 py-3 text-sm">
                              {lesson.is_free_preview ? (
                                <Play className="w-4 h-4 text-primary-500 shrink-0" />
                              ) : (
                                <Lock className="w-4 h-4 text-gray-300 shrink-0" />
                              )}
                              <span className="flex-1 text-gray-700 dark:text-gray-300">{lesson.title}</span>
                              {lesson.is_free_preview && <span className="badge badge-primary text-xs">Preview</span>}
                              {lesson.duration_minutes > 0 && <span className="text-xs text-gray-400">{lesson.duration_minutes}m</span>}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Reviews */}
            {activeTab === 'reviews' && (
              <div>
                <div className="flex items-center gap-4 mb-6">
                  <div className="text-center">
                    <div className="text-5xl font-extrabold text-gray-900 dark:text-gray-100">{Number(course.avg_rating).toFixed(1)}</div>
                    <StarRating rating={course.avg_rating} size="md" />
                    <p className="text-sm text-gray-400 mt-1">Course Rating</p>
                  </div>
                  <div className="flex-1">
                    {[5,4,3,2,1].map((r) => {
                      const count = reviewsData?.data?.filter(rev => Math.floor(rev.rating) === r).length || 0;
                      const total = reviewsData?.data?.length || 1;
                      return (
                        <div key={r} className="flex items-center gap-2 mb-1">
                          <div className="progress-bar flex-1">
                            <div className="progress-fill bg-amber-400" style={{ width: `${(count / total) * 100}%` }} />
                          </div>
                          <div className="flex items-center gap-1 w-12 text-xs text-gray-500">
                            <Star className="w-3 h-3 fill-amber-400 text-amber-400" />{r}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
                <div className="space-y-4">
                  {reviewsData?.data?.map((review) => (
                    <div key={review.id} className="card p-4">
                      <div className="flex gap-3">
                        <img src={review.user?.avatar_url} alt={review.user?.name} className="w-10 h-10 rounded-full object-cover shrink-0" />
                        <div className="flex-1">
                          <div className="flex items-center justify-between mb-1">
                            <span className="font-medium text-sm">{review.user?.name}</span>
                            <span className="text-xs text-gray-400">{new Date(review.created_at).toLocaleDateString()}</span>
                          </div>
                          <StarRating rating={review.rating} size="sm" />
                          {review.comment && <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">{review.comment}</p>}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Right column - desktop purchase card is handled above */}
        </div>
      </div>
    </div>
  );
}

function PurchaseCard({ course, isEnrolled, onEnroll, onWishlist, inWishlist, enrollLoading, isAuthenticated, discount, horizontal = false }) {
  const navigate = useNavigate();

  if (horizontal) {
    return (
      <div className="flex items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-2xl font-bold text-gray-900 dark:text-gray-100">
              {course.effective_price === 0 ? 'Free' : `$${Number(course.effective_price).toFixed(2)}`}
            </span>
            {course.discount_price && <span className="text-gray-400 line-through text-sm">${Number(course.price).toFixed(2)}</span>}
            {discount > 0 && <span className="badge badge-danger">{discount}% off</span>}
          </div>
        </div>
        {isEnrolled ? (
          <button onClick={() => navigate(`/student/courses/${course.id}/learn`)} className="btn btn-primary">Continue Learning</button>
        ) : (
          <button onClick={onEnroll} disabled={enrollLoading} className="btn btn-primary">
            {enrollLoading && <Spinner size="sm" />}
            {course.effective_price === 0 ? 'Enroll Free' : `Buy Now`}
          </button>
        )}
      </div>
    );
  }

  return (
    <div className="card overflow-hidden sticky top-24">
      {course.thumbnail_url && (
        <img src={course.thumbnail_url} alt={course.title} className="w-full h-44 object-cover" />
      )}
      <div className="p-5">
        <div className="flex items-center gap-2 mb-4">
          <span className="text-3xl font-extrabold text-gray-900 dark:text-gray-100">
            {course.effective_price === 0 ? 'Free' : `$${Number(course.effective_price).toFixed(2)}`}
          </span>
          {course.discount_price && <span className="text-gray-400 line-through">${Number(course.price).toFixed(2)}</span>}
          {discount > 0 && <span className="badge badge-danger">{discount}% off</span>}
        </div>

        {isEnrolled ? (
          <button onClick={() => navigate(`/student/courses/${course.id}/learn`)} className="btn btn-primary w-full btn-lg mb-3">
            Continue Learning
          </button>
        ) : (
          <button onClick={onEnroll} disabled={enrollLoading} className="btn btn-primary w-full btn-lg mb-3">
            {enrollLoading && <Spinner size="sm" />}
            {course.effective_price === 0 ? 'Enroll for Free' : `Buy for $${Number(course.effective_price).toFixed(2)}`}
          </button>
        )}

        {!isEnrolled && isAuthenticated && (
          <button onClick={onWishlist} className="btn btn-outline w-full mb-4">
            <Heart className={clsx('w-4 h-4', inWishlist && 'fill-red-500 text-red-500')} />
            {inWishlist ? 'In Wishlist' : 'Add to Wishlist'}
          </button>
        )}

        <div className="space-y-3 text-sm text-gray-600 dark:text-gray-400">
          {[
            { icon: Clock, label: `${Math.floor(course.duration_minutes / 60)}h ${course.duration_minutes % 60}m total` },
            { icon: BookOpen, label: `${course.total_lessons} lessons` },
            { icon: Globe, label: course.language },
            { icon: Award, label: 'Certificate of completion' },
          ].map(({ icon: Icon, label }) => (
            <div key={label} className="flex items-center gap-2">
              <Icon className="w-4 h-4 text-gray-400" />{label}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
