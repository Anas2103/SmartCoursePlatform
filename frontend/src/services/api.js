import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:8000/api',
  withCredentials: true,
  headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('auth_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('auth_token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default api;

// Auth
export const authApi = {
  register: (data) => api.post('/auth/register', data),
  login: (data) => api.post('/auth/login', data),
  logout: () => api.post('/auth/logout'),
  me: () => api.get('/auth/me'),
  forgotPassword: (email) => api.post('/auth/forgot-password', { email }),
  resetPassword: (data) => api.post('/auth/reset-password', data),
  resendVerification: () => api.post('/email/verification-notification'),
  googleRedirect: () => api.get('/auth/google/redirect'),
  googleCallback: (code) => api.get(`/auth/google/callback?code=${code}`),
};

// Profile
export const profileApi = {
  get: () => api.get('/profile'),
  update: (data) => api.put('/profile', data),
  uploadAvatar: (file) => {
    const form = new FormData();
    form.append('avatar', file);
    return api.post('/profile/avatar', form, { headers: { 'Content-Type': 'multipart/form-data' } });
  },
  changePassword: (data) => api.put('/profile/password', data),
};

// Public API
export const publicApi = {
  getCourses: (params) => api.get('/courses', { params }),
  getFeaturedCourses: () => api.get('/courses/featured'),
  getCourse: (slug) => api.get(`/courses/${slug}`),
  getCourseReviews: (slug, params) => api.get(`/courses/${slug}/reviews`, { params }),
  searchCourses: (q) => api.get('/courses/search', { params: { q } }),
  getCategories: () => api.get('/categories'),
  getCategory: (slug, params) => api.get(`/categories/${slug}`, { params }),
  getLearningPaths: (params) => api.get('/learning-paths', { params }),
  getLearningPath: (slug) => api.get(`/learning-paths/${slug}`),
  getBundles: () => api.get('/bundles'),
  getBundle: (slug) => api.get(`/bundles/${slug}`),
  getSubscriptionPlans: () => api.get('/subscription-plans'),
  validateCoupon: (data) => api.post('/coupons/validate', data),
  submitContact: (data) => api.post('/contact', data),
};

// Legacy aliases
export const coursesApi = {
  getAll: publicApi.getCourses,
  getFeatured: publicApi.getFeaturedCourses,
  getBySlug: publicApi.getCourse,
  getReviews: publicApi.getCourseReviews,
  search: publicApi.searchCourses,
};

export const categoriesApi = {
  getAll: publicApi.getCategories,
  getBySlug: publicApi.getCategory,
};

// Payments
export const paymentsApi = {
  checkout: (courseId, couponCode) => api.post('/payments/checkout', { course_id: courseId, coupon_code: couponCode }),
  getHistory: (params) => api.get('/payments/history', { params }),
  getInvoice: (id) => api.get(`/payments/${id}/invoice`),
};

// Notifications
export const notificationsApi = {
  getAll: (params) => api.get('/notifications', { params }),
  markAsRead: (id) => api.post(`/notifications/${id}/read`),
  markAllAsRead: () => api.post('/notifications/read-all'),
  delete: (id) => api.delete(`/notifications/${id}`),
};

// Student APIs
export const studentApi = {
  getDashboard: () => api.get('/student/dashboard'),

  // Enrollments
  getEnrollments: (params) => api.get('/student/enrollments', { params }),
  getEnrollment: (courseId) => api.get(`/student/enrollments/${courseId}`),
  markLessonComplete: (lessonId) => api.post(`/student/lessons/${lessonId}/complete`),
  getCourseProgress: (courseId) => api.get(`/student/courses/${courseId}/progress`),

  // Notes
  getLessonNotes: (lessonId) => api.get(`/student/lessons/${lessonId}/notes`),
  getAllNotes: () => api.get('/student/notes'),
  addNote: (lessonId, data) => api.post(`/student/lessons/${lessonId}/notes`, data),
  updateNote: (id, data) => api.put(`/student/notes/${id}`, data),
  deleteNote: (id) => api.delete(`/student/notes/${id}`),

  // Q&A
  getLessonQuestions: (lessonId) => api.get(`/student/lessons/${lessonId}/questions`),
  askQuestion: (lessonId, data) => api.post(`/student/lessons/${lessonId}/questions`, data),
  answerQuestion: (questionId, data) => api.post(`/student/questions/${questionId}/answers`, data),
  upvoteQuestion: (questionId) => api.post(`/student/questions/${questionId}/upvote`),
  acceptAnswer: (answerId) => api.post(`/student/answers/${answerId}/accept`),

  // Discussions
  getCourseDiscussions: (courseId) => api.get(`/student/courses/${courseId}/discussions`),
  createDiscussion: (courseId, data) => api.post(`/student/courses/${courseId}/discussions`, data),
  getDiscussion: (id) => api.get(`/student/discussions/${id}`),
  replyDiscussion: (id, data) => api.post(`/student/discussions/${id}/replies`, data),

  // Quizzes
  getQuiz: (quizId) => api.get(`/student/quizzes/${quizId}`),
  startQuizAttempt: (quizId) => api.post(`/student/quizzes/${quizId}/start`),
  submitQuizAttempt: (quizId, data) => api.post(`/student/quizzes/${quizId}/submit`, data),
  getQuizHistory: (quizId) => api.get(`/student/quizzes/${quizId}/history`),

  // Assignments
  submitAssignment: (assignmentId, data) => {
    const form = new FormData();
    if (data.content) form.append('content', data.content);
    if (data.file) form.append('file', data.file);
    return api.post(`/student/assignments/${assignmentId}/submit`, form, { headers: { 'Content-Type': 'multipart/form-data' } });
  },
  getSubmission: (assignmentId) => api.get(`/student/assignments/${assignmentId}/submission`),

  // Certificates
  getCertificates: () => api.get('/student/certificates'),
  downloadCertificate: (id) => api.get(`/student/certificates/${id}/download`, { responseType: 'blob' }),

  // Wishlist & Bookmarks
  getWishlist: () => api.get('/student/wishlist'),
  toggleWishlist: (courseId) => api.post(`/student/wishlist/${courseId}`),
  getBookmarks: () => api.get('/student/bookmarks'),
  toggleBookmark: (lessonId) => api.post(`/student/lessons/${lessonId}/bookmark`),

  // Reviews
  submitReview: (courseId, data) => api.post(`/student/courses/${courseId}/review`, data),
  updateReview: (courseId, data) => api.put(`/student/courses/${courseId}/review`, data),
  deleteReview: (courseId) => api.delete(`/student/courses/${courseId}/review`),

  // Gamification
  getMyProgress: () => api.get('/student/progress'),
  getLeaderboard: () => api.get('/student/leaderboard'),

  // Live Sessions
  getUpcomingLiveSessions: () => api.get('/student/live-sessions/upcoming'),
  getPastLiveSessions: () => api.get('/student/live-sessions/past'),
  rsvpLiveSession: (id) => api.post(`/student/live-sessions/${id}/rsvp`),

  // Subscriptions
  subscribe: (data) => api.post('/student/subscribe', data),
  cancelSubscription: () => api.post('/student/subscription/cancel'),

  // Learning Paths
  enrollLearningPath: (id) => api.post(`/learning-paths/${id}/enroll`),
};

// Teacher APIs
export const teacherApi = {
  getDashboard: () => api.get('/teacher/dashboard'),
  getAnalytics: () => api.get('/teacher/analytics'),
  getCourses: (params) => api.get('/teacher/courses', { params }),
  createCourse: (data) => api.post('/teacher/courses', data),
  updateCourse: (id, data) => api.put(`/teacher/courses/${id}`, data),
  getCourse: (id) => api.get(`/teacher/courses/${id}`),
  deleteCourse: (id) => api.delete(`/teacher/courses/${id}`),
  publishCourse: (id) => api.post(`/teacher/courses/${id}/publish`),
  unpublishCourse: (id) => api.post(`/teacher/courses/${id}/unpublish`),
  uploadThumbnail: (id, file) => {
    const form = new FormData();
    form.append('thumbnail', file);
    return api.post(`/teacher/courses/${id}/thumbnail`, form, { headers: { 'Content-Type': 'multipart/form-data' } });
  },
  addSection: (courseId, data) => api.post(`/teacher/courses/${courseId}/sections`, data),
  updateSection: (id, data) => api.put(`/teacher/sections/${id}`, data),
  deleteSection: (id) => api.delete(`/teacher/sections/${id}`),
  addLesson: (sectionId, data) => api.post(`/teacher/sections/${sectionId}/lessons`, data),
  updateLesson: (id, data) => api.put(`/teacher/lessons/${id}`, data),
  deleteLesson: (id) => api.delete(`/teacher/lessons/${id}`),
  uploadLessonVideo: (lessonId, file) => {
    const form = new FormData();
    form.append('video', file);
    return api.post(`/teacher/lessons/${lessonId}/video`, form, { headers: { 'Content-Type': 'multipart/form-data' } });
  },
  getStudents: (params) => api.get('/teacher/students', { params }),
  getCourseStudents: (courseId) => api.get(`/teacher/courses/${courseId}/students`),
  getStudentProgress: (studentId, courseId) => api.get(`/teacher/students/${studentId}/progress/${courseId}`),
  getQuizzes: () => api.get('/teacher/quizzes'),
  createQuiz: (data) => api.post('/teacher/quizzes', data),
  updateQuiz: (id, data) => api.put(`/teacher/quizzes/${id}`, data),
  deleteQuiz: (id) => api.delete(`/teacher/quizzes/${id}`),
  addQuestion: (quizId, data) => api.post(`/teacher/quizzes/${quizId}/questions`, data),
  getAssignments: () => api.get('/teacher/assignments'),
  createAssignment: (data) => api.post('/teacher/assignments', data),
  updateAssignment: (id, data) => api.put(`/teacher/assignments/${id}`, data),
  getSubmissions: (assignmentId) => api.get(`/teacher/assignments/${assignmentId}/submissions`),
  gradeSubmission: (submissionId, data) => api.post(`/teacher/submissions/${submissionId}/grade`, data),
  getAnnouncements: () => api.get('/teacher/announcements'),
  createAnnouncement: (data) => api.post('/teacher/announcements', data),
  deleteAnnouncement: (id) => api.delete(`/teacher/announcements/${id}`),
  // Live Sessions
  getLiveSessions: () => api.get('/teacher/live-sessions'),
  createLiveSession: (data) => api.post('/teacher/live-sessions', data),
  updateLiveSession: (id, data) => api.put(`/teacher/live-sessions/${id}`, data),
  deleteLiveSession: (id) => api.delete(`/teacher/live-sessions/${id}`),
};

// Admin APIs
export const adminApi = {
  getDashboard: () => api.get('/admin/dashboard'),
  getAnalytics: () => api.get('/admin/analytics'),
  getReports: (params) => api.get('/admin/reports', { params }),
  getUsers: (params) => api.get('/admin/users', { params }),
  createUser: (data) => api.post('/admin/users', data),
  updateUser: (id, data) => api.put(`/admin/users/${id}`, data),
  deleteUser: (id) => api.delete(`/admin/users/${id}`),
  banUser: (id, reason) => api.post(`/admin/users/${id}/ban`, { reason }),
  unbanUser: (id) => api.post(`/admin/users/${id}/unban`),
  verifyUser: (id) => api.post(`/admin/users/${id}/verify`),
  getCourses: (params) => api.get('/admin/courses', { params }),
  approveCourse: (id) => api.post(`/admin/courses/${id}/approve`),
  rejectCourse: (id, reason) => api.post(`/admin/courses/${id}/reject`, { reason }),
  deleteCourse: (id) => api.delete(`/admin/courses/${id}`),
  getCategories: () => api.get('/admin/categories'),
  createCategory: (data) => api.post('/admin/categories', data),
  updateCategory: (id, data) => api.put(`/admin/categories/${id}`, data),
  deleteCategory: (id) => api.delete(`/admin/categories/${id}`),
  getPayments: (params) => api.get('/admin/payments', { params }),
  refundPayment: (id, amount) => api.post(`/admin/payments/${id}/refund`, { amount }),
  getContacts: (params) => api.get('/admin/contacts', { params }),
  updateContact: (id, data) => api.put(`/admin/contacts/${id}`, data),
  getSettings: () => api.get('/admin/settings'),
  updateSettings: (data) => api.put('/admin/settings', data),
  // Coupons
  getCoupons: () => api.get('/admin/coupons'),
  createCoupon: (data) => api.post('/admin/coupons', data),
  updateCoupon: (id, data) => api.put(`/admin/coupons/${id}`, data),
  deleteCoupon: (id) => api.delete(`/admin/coupons/${id}`),
  // Bundles
  getBundles: () => api.get('/admin/bundles'),
  createBundle: (data) => api.post('/admin/bundles', data),
  updateBundle: (id, data) => api.put(`/admin/bundles/${id}`, data),
  deleteBundle: (id) => api.delete(`/admin/bundles/${id}`),
  // Learning Paths
  getLearningPaths: () => api.get('/admin/learning-paths'),
  createLearningPath: (data) => api.post('/admin/learning-paths', data),
  updateLearningPath: (id, data) => api.put(`/admin/learning-paths/${id}`, data),
  deleteLearningPath: (id) => api.delete(`/admin/learning-paths/${id}`),
  // Subscriptions
  getSubscriptionPlans: () => api.get('/admin/subscription-plans'),
  createSubscriptionPlan: (data) => api.post('/admin/subscription-plans', data),
  updateSubscriptionPlan: (id, data) => api.put(`/admin/subscription-plans/${id}`, data),
  getSubscribers: () => api.get('/admin/subscribers'),
};

export { api };
