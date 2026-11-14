<?php

use App\Http\Controllers\Api\Auth\AuthController;
use App\Http\Controllers\Api\Auth\PasswordResetController;
use App\Http\Controllers\Api\Auth\EmailVerificationController;
use App\Http\Controllers\Api\Auth\SocialAuthController;
use App\Http\Controllers\Api\Admin\AdminDashboardController;
use App\Http\Controllers\Api\Admin\AdminUserController;
use App\Http\Controllers\Api\Admin\AdminCourseController;
use App\Http\Controllers\Api\Admin\AdminCategoryController;
use App\Http\Controllers\Api\Admin\AdminPaymentController;
use App\Http\Controllers\Api\Admin\AdminSettingsController;
use App\Http\Controllers\Api\Admin\AdminReportController;
use App\Http\Controllers\Api\Admin\AdminCouponController;
use App\Http\Controllers\Api\Admin\AdminBundleController;
use App\Http\Controllers\Api\Admin\AdminLearningPathController;
use App\Http\Controllers\Api\Admin\AdminSubscriptionController;
use App\Http\Controllers\Api\Admin\ContactController;
use App\Http\Controllers\Api\Teacher\TeacherDashboardController;
use App\Http\Controllers\Api\Teacher\TeacherCourseController;
use App\Http\Controllers\Api\Teacher\TeacherStudentController;
use App\Http\Controllers\Api\Teacher\TeacherQuizController;
use App\Http\Controllers\Api\Teacher\TeacherAssignmentController;
use App\Http\Controllers\Api\Teacher\AnnouncementController;
use App\Http\Controllers\Api\Teacher\LiveSessionController as TeacherLiveSessionController;
use App\Http\Controllers\Api\Student\StudentDashboardController;
use App\Http\Controllers\Api\Student\EnrollmentController;
use App\Http\Controllers\Api\Student\LessonProgressController;
use App\Http\Controllers\Api\Student\QuizAttemptController;
use App\Http\Controllers\Api\Student\AssignmentSubmissionController;
use App\Http\Controllers\Api\Student\CertificateController;
use App\Http\Controllers\Api\Student\WishlistController;
use App\Http\Controllers\Api\Student\ReviewController;
use App\Http\Controllers\Api\Student\BookmarkController;
use App\Http\Controllers\Api\Student\QAController;
use App\Http\Controllers\Api\Student\DiscussionController;
use App\Http\Controllers\Api\Student\NoteController;
use App\Http\Controllers\Api\Student\GamificationController;
use App\Http\Controllers\Api\Student\LiveSessionController as StudentLiveSessionController;
use App\Http\Controllers\Api\Student\SubscriptionController;
use App\Http\Controllers\Api\CourseController;
use App\Http\Controllers\Api\CategoryController;
use App\Http\Controllers\Api\ProfileController;
use App\Http\Controllers\Api\NotificationController;
use App\Http\Controllers\Api\PaymentController;
use App\Http\Controllers\Api\CouponController;
use App\Http\Controllers\Api\LearningPathController;
use App\Http\Controllers\Api\BundleController;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
*/

// Public routes
Route::prefix('auth')->group(function () {
    Route::post('/register', [AuthController::class, 'register']);
    Route::post('/login', [AuthController::class, 'login']);
    Route::post('/forgot-password', [PasswordResetController::class, 'sendResetLink']);
    Route::post('/reset-password', [PasswordResetController::class, 'resetPassword']);
    Route::get('/email/verify/{id}/{hash}', [EmailVerificationController::class, 'verify'])->name('verification.verify');
    Route::post('/email/verify/resend', [EmailVerificationController::class, 'resend']);
    // Social auth
    Route::get('/{provider}/redirect', [SocialAuthController::class, 'redirect']);
    Route::get('/{provider}/callback', [SocialAuthController::class, 'callback']);
});

// Public course routes
Route::prefix('courses')->group(function () {
    Route::get('/', [CourseController::class, 'index']);
    Route::get('/featured', [CourseController::class, 'featured']);
    Route::get('/search', [CourseController::class, 'search']);
    Route::get('/{slug}', [CourseController::class, 'show']);
    Route::get('/{slug}/reviews', [CourseController::class, 'reviews']);
});

// Public category routes
Route::get('/categories', [CategoryController::class, 'index']);
Route::get('/categories/{slug}', [CategoryController::class, 'show']);

// Public learning paths & bundles
Route::get('/learning-paths', [LearningPathController::class, 'index']);
Route::get('/learning-paths/{slug}', [LearningPathController::class, 'show']);
Route::get('/bundles', [BundleController::class, 'index']);
Route::get('/bundles/{slug}', [BundleController::class, 'show']);

// Subscription plans (public)
Route::get('/subscription-plans', [SubscriptionController::class, 'plans']);

// Contact form
Route::post('/contact', [ContactController::class, 'store']);

// Authenticated routes
Route::middleware('auth:sanctum')->group(function () {

    // Auth actions
    Route::post('/auth/logout', [AuthController::class, 'logout']);
    Route::get('/auth/me', [AuthController::class, 'me']);
    Route::post('/email/verification-notification', [EmailVerificationController::class, 'resend'])->middleware('throttle:6,1');

    // Profile
    Route::prefix('profile')->group(function () {
        Route::get('/', [ProfileController::class, 'show']);
        Route::put('/', [ProfileController::class, 'update']);
        Route::post('/avatar', [ProfileController::class, 'uploadAvatar']);
        Route::put('/password', [ProfileController::class, 'changePassword']);
    });

    // Notifications
    Route::prefix('notifications')->group(function () {
        Route::get('/', [NotificationController::class, 'index']);
        Route::post('/{id}/read', [NotificationController::class, 'markAsRead']);
        Route::post('/read-all', [NotificationController::class, 'markAllAsRead']);
        Route::delete('/{id}', [NotificationController::class, 'destroy']);
    });

    // Payments
    Route::prefix('payments')->group(function () {
        Route::post('/checkout', [PaymentController::class, 'checkout']);
        Route::get('/history', [PaymentController::class, 'history']);
        Route::get('/{id}/invoice', [PaymentController::class, 'invoice']);
        Route::post('/webhook', [PaymentController::class, 'webhook']);
    });

    // Coupon validation
    Route::post('/coupons/validate', [CouponController::class, 'validate']);

    // Learning path enrollment
    Route::post('/learning-paths/{id}/enroll', [LearningPathController::class, 'enroll']);

    // Student routes
    Route::middleware('role:student')->prefix('student')->group(function () {
        Route::get('/dashboard', [StudentDashboardController::class, 'index']);

        // Enrollments
        Route::get('/enrollments', [EnrollmentController::class, 'index']);
        Route::get('/enrollments/{courseId}', [EnrollmentController::class, 'show']);

        // Lesson progress & notes
        Route::post('/lessons/{lessonId}/complete', [LessonProgressController::class, 'markComplete']);
        Route::get('/courses/{courseId}/progress', [LessonProgressController::class, 'courseProgress']);
        Route::get('/lessons/{lessonId}/notes', [NoteController::class, 'index']);
        Route::post('/lessons/{lessonId}/notes', [NoteController::class, 'store']);
        Route::put('/notes/{id}', [NoteController::class, 'update']);
        Route::delete('/notes/{id}', [NoteController::class, 'destroy']);
        Route::get('/notes', [NoteController::class, 'allNotes']);

        // Q&A
        Route::get('/lessons/{lessonId}/questions', [QAController::class, 'questions']);
        Route::post('/lessons/{lessonId}/questions', [QAController::class, 'askQuestion']);
        Route::post('/questions/{questionId}/answers', [QAController::class, 'answer']);
        Route::post('/questions/{questionId}/upvote', [QAController::class, 'upvoteQuestion']);
        Route::post('/answers/{answerId}/accept', [QAController::class, 'acceptAnswer']);
        Route::delete('/questions/{questionId}', [QAController::class, 'deleteQuestion']);

        // Discussions
        Route::get('/courses/{courseId}/discussions', [DiscussionController::class, 'index']);
        Route::post('/courses/{courseId}/discussions', [DiscussionController::class, 'store']);
        Route::get('/discussions/{id}', [DiscussionController::class, 'show']);
        Route::post('/discussions/{id}/replies', [DiscussionController::class, 'reply']);
        Route::delete('/discussions/{id}', [DiscussionController::class, 'destroy']);

        // Quiz attempts
        Route::get('/quizzes/{quizId}', [QuizAttemptController::class, 'show']);
        Route::post('/quizzes/{quizId}/start', [QuizAttemptController::class, 'start']);
        Route::post('/quizzes/{quizId}/submit', [QuizAttemptController::class, 'submit']);
        Route::get('/quizzes/{quizId}/history', [QuizAttemptController::class, 'history']);

        // Assignment submissions
        Route::post('/assignments/{assignmentId}/submit', [AssignmentSubmissionController::class, 'store']);
        Route::get('/assignments/{assignmentId}/submission', [AssignmentSubmissionController::class, 'show']);

        // Certificates
        Route::get('/certificates', [CertificateController::class, 'index']);
        Route::get('/certificates/{id}/download', [CertificateController::class, 'download']);

        // Wishlist & bookmarks
        Route::get('/wishlist', [WishlistController::class, 'index']);
        Route::post('/wishlist/{courseId}', [WishlistController::class, 'toggle']);
        Route::get('/bookmarks', [BookmarkController::class, 'index']);
        Route::post('/lessons/{lessonId}/bookmark', [BookmarkController::class, 'toggle']);

        // Reviews
        Route::post('/courses/{courseId}/review', [ReviewController::class, 'store']);
        Route::put('/courses/{courseId}/review', [ReviewController::class, 'update']);
        Route::delete('/courses/{courseId}/review', [ReviewController::class, 'destroy']);

        // Gamification
        Route::get('/progress', [GamificationController::class, 'myProgress']);
        Route::get('/leaderboard', [GamificationController::class, 'leaderboard']);

        // Live sessions
        Route::get('/live-sessions/upcoming', [StudentLiveSessionController::class, 'upcoming']);
        Route::get('/live-sessions/past', [StudentLiveSessionController::class, 'past']);
        Route::post('/live-sessions/{id}/rsvp', [StudentLiveSessionController::class, 'rsvp']);

        // Subscriptions
        Route::post('/subscribe', [SubscriptionController::class, 'subscribe']);
        Route::post('/subscription/cancel', [SubscriptionController::class, 'cancel']);
    });

    // Teacher routes
    Route::middleware('role:teacher,admin,super-admin')->prefix('teacher')->group(function () {
        Route::get('/dashboard', [TeacherDashboardController::class, 'index']);
        Route::get('/analytics', [TeacherDashboardController::class, 'analytics']);

        // Course management
        Route::apiResource('/courses', TeacherCourseController::class);
        Route::post('/courses/{course}/publish', [TeacherCourseController::class, 'publish']);
        Route::post('/courses/{course}/unpublish', [TeacherCourseController::class, 'unpublish']);
        Route::post('/courses/{course}/thumbnail', [TeacherCourseController::class, 'uploadThumbnail']);
        Route::post('/courses/{course}/intro-video', [TeacherCourseController::class, 'uploadIntroVideo']);

        // Sections & Lessons
        Route::post('/courses/{course}/sections', [TeacherCourseController::class, 'addSection']);
        Route::put('/sections/{section}', [TeacherCourseController::class, 'updateSection']);
        Route::delete('/sections/{section}', [TeacherCourseController::class, 'deleteSection']);
        Route::post('/sections/{section}/lessons', [TeacherCourseController::class, 'addLesson']);
        Route::put('/lessons/{lesson}', [TeacherCourseController::class, 'updateLesson']);
        Route::delete('/lessons/{lesson}', [TeacherCourseController::class, 'deleteLesson']);
        Route::post('/lessons/{lesson}/video', [TeacherCourseController::class, 'uploadLessonVideo']);

        // Quizzes
        Route::apiResource('/quizzes', TeacherQuizController::class);
        Route::post('/quizzes/{quiz}/questions', [TeacherQuizController::class, 'addQuestion']);
        Route::put('/questions/{question}', [TeacherQuizController::class, 'updateQuestion']);
        Route::delete('/questions/{question}', [TeacherQuizController::class, 'deleteQuestion']);

        // Assignments
        Route::apiResource('/assignments', TeacherAssignmentController::class);
        Route::get('/assignments/{assignment}/submissions', [TeacherAssignmentController::class, 'submissions']);
        Route::post('/submissions/{submission}/grade', [TeacherAssignmentController::class, 'grade']);

        // Students
        Route::get('/students', [TeacherStudentController::class, 'index']);
        Route::get('/courses/{course}/students', [TeacherStudentController::class, 'courseStudents']);
        Route::get('/students/{studentId}/progress/{course}', [TeacherStudentController::class, 'studentProgress']);

        // Announcements
        Route::apiResource('/announcements', AnnouncementController::class);

        // Live Sessions
        Route::get('/live-sessions', [TeacherLiveSessionController::class, 'index']);
        Route::post('/live-sessions', [TeacherLiveSessionController::class, 'store']);
        Route::put('/live-sessions/{id}', [TeacherLiveSessionController::class, 'update']);
        Route::delete('/live-sessions/{id}', [TeacherLiveSessionController::class, 'destroy']);
    });

    // Admin routes
    Route::middleware('role:admin,super-admin')->prefix('admin')->group(function () {
        Route::get('/dashboard', [AdminDashboardController::class, 'index']);
        Route::get('/analytics', [AdminDashboardController::class, 'analytics']);
        Route::get('/reports', [AdminReportController::class, 'index']);

        // User management
        Route::apiResource('/users', AdminUserController::class);
        Route::post('/users/{user}/ban', [AdminUserController::class, 'ban']);
        Route::post('/users/{user}/unban', [AdminUserController::class, 'unban']);
        Route::post('/users/{user}/verify', [AdminUserController::class, 'verify']);

        // Course management
        Route::get('/courses', [AdminCourseController::class, 'index']);
        Route::post('/courses/{course}/approve', [AdminCourseController::class, 'approve']);
        Route::post('/courses/{course}/reject', [AdminCourseController::class, 'reject']);
        Route::delete('/courses/{course}', [AdminCourseController::class, 'destroy']);

        // Category management
        Route::apiResource('/categories', AdminCategoryController::class);

        // Payment management
        Route::get('/payments', [AdminPaymentController::class, 'index']);
        Route::get('/payments/{payment}', [AdminPaymentController::class, 'show']);
        Route::post('/payments/{payment}/refund', [AdminPaymentController::class, 'refund']);

        // Coupon management
        Route::get('/coupons', [AdminCouponController::class, 'index']);
        Route::post('/coupons', [AdminCouponController::class, 'store']);
        Route::put('/coupons/{id}', [AdminCouponController::class, 'update']);
        Route::delete('/coupons/{id}', [AdminCouponController::class, 'destroy']);

        // Bundle management
        Route::get('/bundles', [AdminBundleController::class, 'index']);
        Route::get('/bundles/{id}', [AdminBundleController::class, 'show']);
        Route::post('/bundles', [AdminBundleController::class, 'store']);
        Route::put('/bundles/{id}', [AdminBundleController::class, 'update']);
        Route::delete('/bundles/{id}', [AdminBundleController::class, 'destroy']);

        // Learning path management
        Route::get('/learning-paths', [AdminLearningPathController::class, 'index']);
        Route::get('/learning-paths/{id}', [AdminLearningPathController::class, 'show']);
        Route::post('/learning-paths', [AdminLearningPathController::class, 'store']);
        Route::put('/learning-paths/{id}', [AdminLearningPathController::class, 'update']);
        Route::delete('/learning-paths/{id}', [AdminLearningPathController::class, 'destroy']);

        // Subscription management
        Route::get('/subscription-plans', [AdminSubscriptionController::class, 'plans']);
        Route::post('/subscription-plans', [AdminSubscriptionController::class, 'storePlan']);
        Route::put('/subscription-plans/{id}', [AdminSubscriptionController::class, 'updatePlan']);
        Route::get('/subscribers', [AdminSubscriptionController::class, 'subscribers']);

        // Contact messages
        Route::get('/contacts', [ContactController::class, 'index']);
        Route::put('/contacts/{contact}', [ContactController::class, 'update']);

        // Settings
        Route::get('/settings', [AdminSettingsController::class, 'index']);
        Route::put('/settings', [AdminSettingsController::class, 'update']);
    });
});
