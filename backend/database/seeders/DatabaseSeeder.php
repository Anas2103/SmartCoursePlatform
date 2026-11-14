<?php

namespace Database\Seeders;

use App\Models\Badge;
use App\Models\Bookmark;
use App\Models\Category;
use App\Models\Certificate;
use App\Models\Course;
use App\Models\CourseFaq;
use App\Models\CourseDiscussion;
use App\Models\DiscussionReply;
use App\Models\Enrollment;
use App\Models\Lesson;
use App\Models\LessonProgress;
use App\Models\Payment;
use App\Models\PlatformSetting;
use App\Models\Review;
use App\Models\Section;
use App\Models\SubscriptionPlan;
use App\Models\User;
use App\Models\UserBadge;
use App\Models\UserXp;
use App\Models\Wishlist;
use App\Models\XpTransaction;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        $faker = \Faker\Factory::create();

        // ── Fixed Demo Accounts ───────────────────────────────────────────────
        User::create([
            'name' => 'Super Admin',
            'email' => 'superadmin@smartcourse.com',
            'password' => Hash::make('Password123!'),
            'role' => 'super-admin',
            'email_verified_at' => now(),
            'headline' => 'Platform Administrator',
            'bio' => 'Responsible for managing the SmartCourse platform.',
        ]);

        User::create([
            'name' => 'Admin User',
            'email' => 'admin@smartcourse.com',
            'password' => Hash::make('Password123!'),
            'role' => 'admin',
            'email_verified_at' => now(),
            'headline' => 'Platform Admin',
        ]);

        // ── Teachers ──────────────────────────────────────────────────────────
        $teacherData = [
            ['name' => 'Dr. Sarah Johnson',    'email' => 'sarah@smartcourse.com',   'headline' => 'Senior Web Developer & Educator',         'bio' => 'Over 12 years of experience in full-stack development. Taught 25,000+ students across 80 countries. Former engineer at Google.'],
            ['name' => 'Prof. Michael Chen',   'email' => 'michael@smartcourse.com', 'headline' => 'Data Science & ML Expert',                'bio' => 'PhD in Computer Science from MIT. Published researcher in machine learning with 10+ years of industry experience at Amazon.'],
            ['name' => 'Emma Williams',        'email' => 'emma@smartcourse.com',    'headline' => 'UX/UI Design Specialist',                  'bio' => 'Award-winning designer with a portfolio spanning Fortune 500 clients. Passionate about making great design accessible to everyone.'],
            ['name' => 'James Rodriguez',      'email' => 'james@smartcourse.com',   'headline' => 'Mobile App Development Expert',           'bio' => 'Built and launched 30+ apps on the App Store and Google Play. Specializes in React Native and Flutter development.'],
            ['name' => 'Dr. Aisha Patel',      'email' => 'aisha@smartcourse.com',   'headline' => 'Cybersecurity & Cloud Architect',         'bio' => 'Certified AWS Solutions Architect and CISSP. 15 years in enterprise security consulting for banks and government agencies.'],
            ['name' => 'Carlos Mendoza',       'email' => 'carlos@smartcourse.com',  'headline' => 'DevOps & Kubernetes Specialist',          'bio' => 'Led DevOps transformations at three unicorn startups. Deep expertise in CI/CD pipelines, Docker, and cloud infrastructure.'],
        ];

        $teachers = [];
        foreach ($teacherData as $t) {
            $teachers[] = User::create([
                ...$t,
                'password' => Hash::make('Password123!'),
                'role' => 'teacher',
                'email_verified_at' => now()->subDays(rand(60, 400)),
            ]);
        }

        // ── Students ──────────────────────────────────────────────────────────
        // Fixed demo students
        for ($i = 1; $i <= 10; $i++) {
            User::create([
                'name' => "Student $i",
                'email' => "student{$i}@smartcourse.com",
                'password' => Hash::make('Password123!'),
                'role' => 'student',
                'email_verified_at' => now()->subDays(rand(10, 200)),
                'bio' => $faker->sentence(),
                'headline' => $faker->jobTitle(),
            ]);
        }

        // Faker students
        $fakeStudentCount = 60;
        for ($i = 0; $i < $fakeStudentCount; $i++) {
            User::create([
                'name' => $faker->name(),
                'email' => $faker->unique()->safeEmail(),
                'password' => Hash::make('Password123!'),
                'role' => 'student',
                'email_verified_at' => now()->subDays(rand(1, 500)),
                'bio' => $faker->optional(0.6)->sentence(),
                'headline' => $faker->optional(0.5)->jobTitle(),
            ]);
        }

        $allStudents = User::where('role', 'student')->get();

        // ── Categories ────────────────────────────────────────────────────────
        $categoryData = [
            ['name' => 'Web Development',     'slug' => 'web-development',     'icon' => '🌐', 'color' => '#6366f1', 'description' => 'HTML, CSS, JavaScript, React, Vue, Laravel and more.'],
            ['name' => 'Data Science',         'slug' => 'data-science',         'icon' => '📊', 'color' => '#8b5cf6', 'description' => 'Python, Machine Learning, Deep Learning, and Data Analytics.'],
            ['name' => 'UI/UX Design',         'slug' => 'ui-ux-design',         'icon' => '🎨', 'color' => '#ec4899', 'description' => 'Figma, user research, prototyping, and design systems.'],
            ['name' => 'Mobile Development',   'slug' => 'mobile-development',   'icon' => '📱', 'color' => '#14b8a6', 'description' => 'iOS, Android, React Native, and Flutter.'],
            ['name' => 'DevOps & Cloud',       'slug' => 'devops-cloud',         'icon' => '☁️', 'color' => '#f59e0b', 'description' => 'Docker, Kubernetes, AWS, CI/CD pipelines.'],
            ['name' => 'Cybersecurity',        'slug' => 'cybersecurity',        'icon' => '🔒', 'color' => '#ef4444', 'description' => 'Ethical hacking, penetration testing, security fundamentals.'],
            ['name' => 'Business',             'slug' => 'business',             'icon' => '💼', 'color' => '#10b981', 'description' => 'Marketing, entrepreneurship, and business strategy.'],
            ['name' => 'Photography',          'slug' => 'photography',          'icon' => '📷', 'color' => '#f97316', 'description' => 'Photography techniques, Lightroom, and photo editing.'],
        ];

        $categories = [];
        foreach ($categoryData as $cat) {
            $categories[] = Category::create($cat);
        }

        // ── Courses ───────────────────────────────────────────────────────────
        $coursesData = [
            // Web Development
            ['title' => 'Complete React JS Masterclass 2024', 'slug' => 'complete-react-js-masterclass-2024', 'short_description' => 'Master React 18 with hooks, context, Redux Toolkit and build 5 real-world projects.', 'level' => 'beginner', 'price' => 79.99, 'discount_price' => 19.99, 'is_featured' => true, 'is_bestseller' => true, 'total_enrolled' => 12480, 'avg_rating' => 4.8, 'total_reviews' => 3421, 'total_lessons' => 48, 'duration_minutes' => 1440, 'teacher_idx' => 0, 'cat_idx' => 0],
            ['title' => 'Laravel 11 - The Complete Developer Course', 'slug' => 'laravel-11-complete-developer-course', 'short_description' => 'Build scalable REST APIs, admin panels and SaaS apps with Laravel 11.', 'level' => 'intermediate', 'price' => 89.99, 'discount_price' => 24.99, 'is_featured' => true, 'total_enrolled' => 8920, 'avg_rating' => 4.7, 'total_reviews' => 2150, 'total_lessons' => 62, 'duration_minutes' => 1860, 'teacher_idx' => 0, 'cat_idx' => 0],
            ['title' => 'Modern JavaScript: ES6 to ES2024', 'slug' => 'modern-javascript-es6-to-es2024', 'short_description' => 'Deep dive into modern JS features, async/await, modules, and browser APIs.', 'level' => 'intermediate', 'price' => 69.99, 'discount_price' => 17.99, 'total_enrolled' => 6340, 'avg_rating' => 4.6, 'total_reviews' => 1820, 'total_lessons' => 54, 'duration_minutes' => 1620, 'teacher_idx' => 0, 'cat_idx' => 0],
            ['title' => 'Next.js 14 & Full-Stack Development', 'slug' => 'nextjs-14-fullstack-development', 'short_description' => 'Server components, App Router, Prisma, Auth.js and deployment on Vercel.', 'level' => 'advanced', 'price' => 94.99, 'discount_price' => 27.99, 'total_enrolled' => 4210, 'avg_rating' => 4.9, 'total_reviews' => 980, 'total_lessons' => 70, 'duration_minutes' => 2100, 'teacher_idx' => 0, 'cat_idx' => 0],

            // Data Science
            ['title' => 'Python for Data Science & Machine Learning', 'slug' => 'python-data-science-machine-learning', 'short_description' => 'NumPy, Pandas, Matplotlib, Scikit-Learn, TensorFlow — the complete bootcamp.', 'level' => 'intermediate', 'price' => 99.99, 'discount_price' => 29.99, 'is_featured' => true, 'is_bestseller' => true, 'total_enrolled' => 21000, 'avg_rating' => 4.9, 'total_reviews' => 5800, 'total_lessons' => 75, 'duration_minutes' => 2250, 'teacher_idx' => 1, 'cat_idx' => 1],
            ['title' => 'Deep Learning with PyTorch', 'slug' => 'deep-learning-pytorch', 'short_description' => 'Build CNNs, RNNs, transformers and deploy models to production.', 'level' => 'advanced', 'price' => 109.99, 'discount_price' => 34.99, 'total_enrolled' => 7800, 'avg_rating' => 4.8, 'total_reviews' => 1940, 'total_lessons' => 82, 'duration_minutes' => 2460, 'teacher_idx' => 1, 'cat_idx' => 1],
            ['title' => 'SQL & Database Design Masterclass', 'slug' => 'sql-database-design-masterclass', 'short_description' => 'Master SQL from basics to advanced query optimization and database design.', 'level' => 'beginner', 'price' => 59.99, 'discount_price' => 14.99, 'total_enrolled' => 9100, 'avg_rating' => 4.7, 'total_reviews' => 2430, 'total_lessons' => 44, 'duration_minutes' => 1320, 'teacher_idx' => 1, 'cat_idx' => 1],

            // UI/UX Design
            ['title' => 'UI/UX Design Bootcamp with Figma', 'slug' => 'ui-ux-design-bootcamp-figma', 'short_description' => 'User research, wireframing, prototyping and design systems — from zero to hero.', 'level' => 'beginner', 'price' => 74.99, 'discount_price' => 18.99, 'is_featured' => true, 'total_enrolled' => 11200, 'avg_rating' => 4.8, 'total_reviews' => 3100, 'total_lessons' => 58, 'duration_minutes' => 1740, 'teacher_idx' => 2, 'cat_idx' => 2],
            ['title' => 'Advanced Figma: Design Systems & Components', 'slug' => 'advanced-figma-design-systems', 'short_description' => 'Build production-ready design systems, auto-layout mastery, and developer handoff.', 'level' => 'advanced', 'price' => 84.99, 'discount_price' => 22.99, 'total_enrolled' => 4500, 'avg_rating' => 4.7, 'total_reviews' => 1050, 'total_lessons' => 40, 'duration_minutes' => 1200, 'teacher_idx' => 2, 'cat_idx' => 2],

            // Mobile
            ['title' => 'React Native: Build Mobile Apps from Scratch', 'slug' => 'react-native-mobile-apps', 'short_description' => 'Build iOS & Android apps with React Native, Expo, and native device APIs.', 'level' => 'intermediate', 'price' => 89.99, 'discount_price' => 24.99, 'total_enrolled' => 7300, 'avg_rating' => 4.6, 'total_reviews' => 1680, 'total_lessons' => 65, 'duration_minutes' => 1950, 'teacher_idx' => 3, 'cat_idx' => 3],
            ['title' => 'Flutter & Dart: The Complete App Development Course', 'slug' => 'flutter-dart-complete-course', 'short_description' => 'Cross-platform mobile development with Flutter 3 and Dart — build 7 real apps.', 'level' => 'beginner', 'price' => 84.99, 'discount_price' => 21.99, 'is_bestseller' => true, 'total_enrolled' => 5600, 'avg_rating' => 4.8, 'total_reviews' => 1420, 'total_lessons' => 72, 'duration_minutes' => 2160, 'teacher_idx' => 3, 'cat_idx' => 3],

            // DevOps
            ['title' => 'Docker & Kubernetes: The Complete Guide', 'slug' => 'docker-kubernetes-complete-guide', 'short_description' => 'Containerize apps, orchestrate with Kubernetes, deploy on AWS EKS and GKE.', 'level' => 'intermediate', 'price' => 94.99, 'discount_price' => 26.99, 'is_featured' => true, 'total_enrolled' => 8700, 'avg_rating' => 4.9, 'total_reviews' => 2200, 'total_lessons' => 68, 'duration_minutes' => 2040, 'teacher_idx' => 5, 'cat_idx' => 4],
            ['title' => 'AWS Certified Solutions Architect — Associate', 'slug' => 'aws-certified-solutions-architect', 'short_description' => 'Pass the SAA-C03 exam and master 60+ AWS services with hands-on labs.', 'level' => 'intermediate', 'price' => 99.99, 'discount_price' => 29.99, 'is_bestseller' => true, 'total_enrolled' => 14300, 'avg_rating' => 4.8, 'total_reviews' => 3900, 'total_lessons' => 80, 'duration_minutes' => 2400, 'teacher_idx' => 5, 'cat_idx' => 4],

            // Cybersecurity
            ['title' => 'Ethical Hacking & Penetration Testing', 'slug' => 'ethical-hacking-penetration-testing', 'short_description' => 'Learn to think like a hacker — network scanning, exploitation, and reporting.', 'level' => 'intermediate', 'price' => 89.99, 'discount_price' => 24.99, 'is_featured' => true, 'total_enrolled' => 9800, 'avg_rating' => 4.7, 'total_reviews' => 2650, 'total_lessons' => 70, 'duration_minutes' => 2100, 'teacher_idx' => 4, 'cat_idx' => 5],

            // Business
            ['title' => 'Digital Marketing Masterclass 2024', 'slug' => 'digital-marketing-masterclass-2024', 'short_description' => 'SEO, Google Ads, Facebook Ads, email marketing and analytics — all in one course.', 'level' => 'beginner', 'price' => 69.99, 'discount_price' => 16.99, 'total_enrolled' => 13400, 'avg_rating' => 4.6, 'total_reviews' => 3750, 'total_lessons' => 55, 'duration_minutes' => 1650, 'teacher_idx' => 2, 'cat_idx' => 6],
        ];

        $reviewComments = [
            'This course completely changed how I think about programming. Highly recommend!',
            'Excellent content, well structured, and the instructor explains everything clearly.',
            'Best course I have taken on this topic. Worth every penny.',
            'Great course! I got a job offer two weeks after finishing this.',
            'The projects are very practical and directly applicable to real work.',
            'Clear explanations, great pacing. The instructor is fantastic.',
            'I have tried many courses on this topic. This is by far the best.',
            'Very comprehensive. Covers everything from basics to advanced concepts.',
            'Amazing course! Already applied what I learned at my current job.',
            'Loved the hands-on approach. No fluff — just pure knowledge.',
            'The course is well-organized and easy to follow even as a beginner.',
            'Perfect balance of theory and practice. Highly recommended.',
            'Instructor has deep knowledge and explains complex topics simply.',
            'Finished this in 3 weeks and landed a freelance client right after.',
            'Solid content. The quizzes helped reinforce everything.',
        ];

        // Course thumbnails, in the same order as $coursesData
        $thumbnailIds = [
            '1633356122544-f134324a6cee', // React
            '1555066931-4365d14bab8c',    // Laravel
            '1627398242454-45a1465c2479', // JavaScript
            '1517694712202-14dd9538aa97', // Next.js
            '1551288049-bebda4e38f71',    // Data science
            '1526379095098-d400fd0bf935', // PyTorch
            '1544383835-bda2bc66a55d',    // SQL
            '1561070791-2526d30994b5',    // UI/UX
            '1586717791821-3f44a563fa4c', // Figma systems
            '1512941937669-90a1b58e7e9c', // React Native
            '1551650975-87deedd944c3',    // Flutter
            '1605745341112-85968b19335b', // Docker/K8s
            '1451187580459-43490279c0fa', // AWS
            '1550751827-4bd374c3f58b',    // Security
            '1460925895917-afdab827c52f', // Marketing
        ];

        $courses = [];
        foreach ($coursesData as $i => $cd) {
            $teacher = $teachers[$cd['teacher_idx']];
            $category = $categories[$cd['cat_idx']];

            $course = Course::create([
                'title' => $cd['title'],
                'slug' => $cd['slug'],
                'thumbnail' => isset($thumbnailIds[$i])
                    ? "https://images.unsplash.com/photo-{$thumbnailIds[$i]}?w=800&h=450&fit=crop"
                    : null,
                'description' => $faker->paragraphs(4, true),
                'short_description' => $cd['short_description'],
                'teacher_id' => $teacher->id,
                'category_id' => $category->id,
                'level' => $cd['level'],
                'price' => $cd['price'],
                'discount_price' => $cd['discount_price'],
                'language' => 'English',
                'is_featured' => $cd['is_featured'] ?? false,
                'is_bestseller' => $cd['is_bestseller'] ?? false,
                'status' => 'published',
                'published_at' => now()->subDays(rand(30, 600)),
                'total_enrolled' => $cd['total_enrolled'],
                'avg_rating' => $cd['avg_rating'],
                'total_reviews' => $cd['total_reviews'],
                'total_lessons' => $cd['total_lessons'],
                'duration_minutes' => $cd['duration_minutes'],
                'certificate_enabled' => true,
                'requirements' => ['Basic computer skills', 'No prior experience needed', 'A computer with internet access'],
                'learning_outcomes' => ['Build real-world projects', 'Master industry best practices', 'Get job-ready skills', 'Earn a verified certificate'],
            ]);

            // Sections & Lessons
            $sectionTitles = ['Getting Started', 'Core Concepts', 'Intermediate Topics', 'Advanced Techniques', 'Real-World Projects', 'Deployment & Best Practices'];
            $numSections = rand(4, 6);
            $allLessons = [];
            for ($s = 0; $s < $numSections; $s++) {
                $section = Section::create([
                    'course_id' => $course->id,
                    'title' => "Section " . ($s + 1) . ": " . $sectionTitles[$s],
                    'order' => $s + 1,
                ]);
                $numLessons = rand(6, 10);
                for ($l = 0; $l < $numLessons; $l++) {
                    $lesson = Lesson::create([
                        'section_id' => $section->id,
                        'course_id' => $course->id,
                        'title' => $faker->sentence(rand(4, 8)),
                        'type' => $l % 5 === 4 ? 'quiz' : 'video',
                        'duration_minutes' => rand(8, 40),
                        'is_free_preview' => $l === 0 && $s === 0,
                        'order' => $l + 1,
                    ]);
                    $allLessons[] = $lesson;
                }
            }

            // FAQs
            CourseFaq::create(['course_id' => $course->id, 'question' => 'Do I need prior experience to take this course?', 'answer' => 'No prior experience is needed. We start from the basics and progressively move to advanced topics.', 'order' => 1]);
            CourseFaq::create(['course_id' => $course->id, 'question' => 'Will I get a certificate upon completion?', 'answer' => 'Yes! You will receive a verified SmartCourse certificate that you can share on LinkedIn and your resume.', 'order' => 2]);
            CourseFaq::create(['course_id' => $course->id, 'question' => 'How long do I have access to the course?', 'answer' => 'You get lifetime access including all future updates to the course content.', 'order' => 3]);

            // Enroll students (30-50 per course)
            $numEnrolled = rand(30, 50);
            $enrolledStudents = $allStudents->random(min($numEnrolled, $allStudents->count()));
            $usedStudentIds = [];

            foreach ($enrolledStudents as $student) {
                if (in_array($student->id, $usedStudentIds)) continue;
                $usedStudentIds[] = $student->id;

                $progressPct = rand(0, 100);
                $isCompleted = $progressPct === 100;
                $completedLessonsCount = (int) (count($allLessons) * $progressPct / 100);
                $enrolledAt = now()->subDays(rand(1, 300));

                // Payment
                $payment = Payment::create([
                    'user_id' => $student->id,
                    'course_id' => $course->id,
                    'amount' => $course->discount_price ?? $course->price,
                    'currency' => 'USD',
                    'status' => 'completed',
                    'payment_method' => $faker->randomElement(['card', 'paypal']),
                    'stripe_payment_intent_id' => 'pi_' . Str::random(24),
                    'created_at' => $enrolledAt,
                    'updated_at' => $enrolledAt,
                ]);

                $enrollment = Enrollment::create([
                    'user_id' => $student->id,
                    'course_id' => $course->id,
                    'payment_id' => $payment->id,
                    'amount_paid' => $payment->amount,
                    'progress_percentage' => $progressPct,
                    'completed_lessons' => $completedLessonsCount,
                    'is_completed' => $isCompleted,
                    'completed_at' => $isCompleted ? $enrolledAt->copy()->addDays(rand(14, 90)) : null,
                    'last_accessed_at' => now()->subDays(rand(0, 30)),
                    'created_at' => $enrolledAt,
                    'updated_at' => $enrolledAt,
                ]);

                // Lesson progress
                $lessonsToMark = array_slice($allLessons, 0, $completedLessonsCount);
                foreach ($lessonsToMark as $lesson) {
                    LessonProgress::create([
                        'user_id' => $student->id,
                        'lesson_id' => $lesson->id,
                        'course_id' => $course->id,
                        'is_completed' => true,
                        'watch_time_seconds' => rand(300, $lesson->duration_minutes * 60),
                        'completed_at' => $enrolledAt->copy()->addDays(rand(1, 60)),
                    ]);
                }

                // Certificate for completed students
                if ($isCompleted) {
                    Certificate::create([
                        'user_id' => $student->id,
                        'course_id' => $course->id,
                        'certificate_number' => 'CERT-' . strtoupper(Str::random(4)) . '-' . date('Y') . '-' . rand(1000, 9999),
                        'issued_at' => $enrollment->completed_at ?? now()->subDays(rand(1, 60)),
                    ]);
                }

                // Reviews (70% of enrolled students leave a review)
                if (rand(1, 10) <= 7 && $progressPct > 20) {
                    Review::create([
                        'user_id' => $student->id,
                        'course_id' => $course->id,
                        'rating' => $faker->randomElement([3, 4, 4, 4, 5, 5, 5, 5]),
                        'comment' => $faker->randomElement($reviewComments),
                        'is_approved' => true,
                        'created_at' => $enrolledAt->copy()->addDays(rand(3, 60)),
                    ]);
                }
            }

            // Wishlists (random students)
            $wishlistStudents = $allStudents->random(rand(5, 15));
            foreach ($wishlistStudents as $ws) {
                if (!in_array($ws->id, $usedStudentIds)) {
                    Wishlist::firstOrCreate(['user_id' => $ws->id, 'course_id' => $course->id]);
                }
            }

            // Forum discussions
            $numDiscussions = rand(3, 8);
            $discussionTopics = [
                'Question about ' . explode(' ', $cd['title'])[0] . ' concepts',
                'Having trouble with the project in section 3',
                'Resources for further learning?',
                'How does this apply to real-world jobs?',
                'Best practices discussed in this course',
                'Thank you instructor — just got hired!',
                'Clarification needed on lesson 12',
                'Anyone want to study together?',
            ];
            shuffle($discussionTopics);
            for ($d = 0; $d < $numDiscussions && $d < count($enrolledStudents); $d++) {
                $poster = $enrolledStudents[$d];
                $disc = CourseDiscussion::create([
                    'course_id' => $course->id,
                    'user_id' => $poster->id,
                    'title' => $discussionTopics[$d % count($discussionTopics)],
                    'body' => $faker->paragraph(rand(2, 4)),
                    'views' => rand(10, 200),
                    'created_at' => now()->subDays(rand(1, 90)),
                ]);

                $numReplies = rand(1, 5);
                for ($r = 0; $r < $numReplies && $r < count($enrolledStudents); $r++) {
                    DiscussionReply::create([
                        'discussion_id' => $disc->id,
                        'user_id' => $enrolledStudents[($d + $r + 1) % count($enrolledStudents)]->id,
                        'body' => $faker->sentence(rand(10, 30)),
                    ]);
                }
            }

            $courses[] = $course;
        }

        // ── Bookmarks (random students bookmark random lessons) ────────────────
        $allLessonsAll = Lesson::all();
        for ($i = 0; $i < 80; $i++) {
            $student = $allStudents->random();
            $lesson = $allLessonsAll->random();
            Bookmark::firstOrCreate(['user_id' => $student->id, 'lesson_id' => $lesson->id]);
        }

        // ── Gamification: XP, Badges ──────────────────────────────────────────
        $badges = [
            ['name' => 'First Step',       'slug' => 'first-step',       'description' => 'Complete your first lesson',      'icon' => '👣', 'color' => '#6366f1', 'condition_type' => 'lessons_completed',   'condition_value' => 1,   'xp_reward' => 10],
            ['name' => 'Quick Learner',    'slug' => 'quick-learner',    'description' => 'Complete 10 lessons',             'icon' => '⚡', 'color' => '#f59e0b', 'condition_type' => 'lessons_completed',   'condition_value' => 10,  'xp_reward' => 50],
            ['name' => 'Scholar',          'slug' => 'scholar',          'description' => 'Complete 50 lessons',             'icon' => '📚', 'color' => '#8b5cf6', 'condition_type' => 'lessons_completed',   'condition_value' => 50,  'xp_reward' => 200],
            ['name' => 'Course Finisher',  'slug' => 'course-finisher',  'description' => 'Complete your first course',      'icon' => '🎓', 'color' => '#10b981', 'condition_type' => 'courses_completed',   'condition_value' => 1,   'xp_reward' => 100],
            ['name' => 'Multi-Tasker',     'slug' => 'multi-tasker',     'description' => 'Complete 5 courses',              'icon' => '🏆', 'color' => '#f97316', 'condition_type' => 'courses_completed',   'condition_value' => 5,   'xp_reward' => 500],
            ['name' => '7-Day Streak',     'slug' => '7-day-streak',     'description' => 'Learn for 7 consecutive days',   'icon' => '🔥', 'color' => '#ef4444', 'condition_type' => 'streak_days',        'condition_value' => 7,   'xp_reward' => 150],
            ['name' => '30-Day Streak',    'slug' => '30-day-streak',    'description' => 'Learn for 30 consecutive days',  'icon' => '💎', 'color' => '#14b8a6', 'condition_type' => 'streak_days',        'condition_value' => 30,  'xp_reward' => 750],
            ['name' => 'XP Hunter',        'slug' => 'xp-hunter',        'description' => 'Earn 1,000 XP points',           'icon' => '⭐', 'color' => '#eab308', 'condition_type' => 'xp_earned',          'condition_value' => 1000,'xp_reward' => 100],
            ['name' => 'XP Legend',        'slug' => 'xp-legend',        'description' => 'Earn 10,000 XP points',          'icon' => '👑', 'color' => '#a855f7', 'condition_type' => 'xp_earned',          'condition_value' => 10000,'xp_reward' => 500],
            ['name' => 'Quiz Master',      'slug' => 'quiz-master',      'description' => 'Pass 10 quizzes',                'icon' => '🧠', 'color' => '#0ea5e9', 'condition_type' => 'quizzes_passed',    'condition_value' => 10,  'xp_reward' => 200],
            ['name' => 'Certified',        'slug' => 'certified',        'description' => 'Earn your first certificate',    'icon' => '📜', 'color' => '#84cc16', 'condition_type' => 'certificates_earned','condition_value' => 1,   'xp_reward' => 300],
        ];

        $badgeModels = [];
        foreach ($badges as $b) {
            $badgeModels[] = Badge::create($b);
        }

        foreach ($allStudents as $student) {
            $completedCount = Enrollment::where('user_id', $student->id)->where('is_completed', true)->count();
            $lessonsCount   = LessonProgress::where('user_id', $student->id)->count();
            $certsCount     = Certificate::where('user_id', $student->id)->count();

            $baseXp = $lessonsCount * 10 + $completedCount * 200 + $certsCount * 300 + rand(0, 500);
            $streak = rand(0, 30);

            UserXp::create([
                'user_id' => $student->id,
                'total_xp' => $baseXp,
                'weekly_xp' => rand(0, min($baseXp, 800)),
                'monthly_xp' => rand(0, min($baseXp, 3000)),
                'streak_days' => $streak,
                'last_activity_date' => now()->subDays(rand(0, 3)),
            ]);

            XpTransaction::create([
                'user_id' => $student->id,
                'amount' => $baseXp,
                'reason' => 'Initial XP from completed lessons and courses',
            ]);

            // Award badges based on activity
            $earnedBadges = [];
            if ($lessonsCount >= 1)   $earnedBadges[] = 'first-step';
            if ($lessonsCount >= 10)  $earnedBadges[] = 'quick-learner';
            if ($lessonsCount >= 50)  $earnedBadges[] = 'scholar';
            if ($completedCount >= 1) $earnedBadges[] = 'course-finisher';
            if ($completedCount >= 5) $earnedBadges[] = 'multi-tasker';
            if ($streak >= 7)         $earnedBadges[] = '7-day-streak';
            if ($streak >= 30)        $earnedBadges[] = '30-day-streak';
            if ($baseXp >= 1000)      $earnedBadges[] = 'xp-hunter';
            if ($baseXp >= 10000)     $earnedBadges[] = 'xp-legend';
            if ($certsCount >= 1)     $earnedBadges[] = 'certified';

            foreach ($earnedBadges as $slug) {
                $badge = collect($badgeModels)->firstWhere('slug', $slug);
                if ($badge) {
                    UserBadge::firstOrCreate(
                        ['user_id' => $student->id, 'badge_id' => $badge->id],
                        ['earned_at' => now()->subDays(rand(1, 100))]
                    );
                }
            }
        }

        // ── Subscription Plans ────────────────────────────────────────────────
        SubscriptionPlan::create(['name' => 'Free',  'slug' => 'free',  'description' => 'Get started with free courses and limited access.', 'monthly_price' => 0,     'yearly_price' => 0,      'features' => ['Access to free courses', 'Community forum access', 'Basic progress tracking', '1 certificate per month'], 'is_active' => true,  'is_featured' => false]);
        SubscriptionPlan::create(['name' => 'Pro',   'slug' => 'pro',   'description' => 'Unlimited access to all courses with premium features.', 'monthly_price' => 29.99, 'yearly_price' => 287.90, 'features' => ['Unlimited course access', 'HD video streaming', 'Downloadable resources', 'All certificates included', 'Priority support', 'Offline mobile access'], 'is_active' => true, 'is_featured' => true]);
        SubscriptionPlan::create(['name' => 'Team',  'slug' => 'team',  'description' => 'Perfect for teams with advanced management tools.', 'monthly_price' => 79.99, 'yearly_price' => 767.90, 'features' => ['Everything in Pro', 'Up to 25 team members', 'Team progress dashboard', 'Custom learning paths', 'Dedicated account manager', 'SSO integration', 'Advanced analytics'], 'is_active' => true, 'is_featured' => false]);

        // ── Platform Settings ─────────────────────────────────────────────────
        $settings = [
            ['key' => 'site_name',           'value' => 'Smart Course Platform', 'group' => 'general'],
            ['key' => 'site_description',    'value' => 'The best online learning platform',   'group' => 'general'],
            ['key' => 'teacher_commission',  'value' => '70',  'group' => 'payments'],
            ['key' => 'platform_commission', 'value' => '30',  'group' => 'payments'],
            ['key' => 'currency',            'value' => 'USD', 'group' => 'payments'],
            ['key' => 'allow_registration',  'value' => 'true','group' => 'general'],
            ['key' => 'xp_per_lesson',       'value' => '10',  'group' => 'gamification'],
            ['key' => 'xp_per_quiz_pass',    'value' => '50',  'group' => 'gamification'],
            ['key' => 'xp_per_course_complete', 'value' => '200', 'group' => 'gamification'],
        ];
        foreach ($settings as $s) {
            PlatformSetting::create($s);
        }
    }
}
