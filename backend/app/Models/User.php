<?php

namespace App\Models;

use Illuminate\Contracts\Auth\MustVerifyEmail;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;

class User extends Authenticatable implements MustVerifyEmail
{
    use HasApiTokens, HasFactory, Notifiable, SoftDeletes;

    protected $fillable = [
        'name', 'email', 'password', 'role', 'avatar', 'bio', 'headline',
        'website', 'twitter', 'linkedin', 'github', 'phone', 'country',
        'language', 'is_active', 'is_banned', 'ban_reason', 'banned_at',
    ];

    protected $hidden = ['password', 'remember_token'];

    protected $casts = [
        'email_verified_at' => 'datetime',
        'banned_at' => 'datetime',
        'is_active' => 'boolean',
        'is_banned' => 'boolean',
        'password' => 'hashed',
    ];

    // Role helpers
    public function isSuperAdmin(): bool { return $this->role === 'super-admin'; }
    public function isAdmin(): bool { return in_array($this->role, ['admin', 'super-admin']); }
    public function isTeacher(): bool { return $this->role === 'teacher'; }
    public function isStudent(): bool { return $this->role === 'student'; }

    public function getAvatarUrlAttribute(): string
    {
        if ($this->avatar) {
            return str_starts_with($this->avatar, 'http') ? $this->avatar : asset('storage/' . $this->avatar);
        }
        return "https://ui-avatars.com/api/?name=" . urlencode($this->name) . "&background=6366f1&color=fff";
    }

    // Relationships
    public function taughtCourses()
    {
        return $this->hasMany(Course::class, 'teacher_id');
    }

    public function courseSales()
    {
        return $this->hasManyThrough(Payment::class, Course::class, 'teacher_id', 'course_id');
    }

    public function badges()
    {
        return $this->belongsToMany(Badge::class, 'user_badges')->withPivot('earned_at');
    }

    public function enrollments()
    {
        return $this->hasMany(Enrollment::class);
    }

    public function enrolledCourses()
    {
        return $this->belongsToMany(Course::class, 'enrollments')
            ->withPivot('progress_percentage', 'completed_lessons', 'is_completed', 'completed_at', 'last_accessed_at', 'amount_paid')
            ->withTimestamps();
    }

    public function payments()
    {
        return $this->hasMany(Payment::class);
    }

    public function reviews()
    {
        return $this->hasMany(Review::class);
    }

    public function certificates()
    {
        return $this->hasMany(Certificate::class);
    }

    public function wishlists()
    {
        return $this->hasMany(Wishlist::class);
    }

    public function bookmarks()
    {
        return $this->hasMany(Bookmark::class);
    }

    public function quizAttempts()
    {
        return $this->hasMany(QuizAttempt::class);
    }

    public function submissions()
    {
        return $this->hasMany(AssignmentSubmission::class);
    }

    public function lessonProgress()
    {
        return $this->hasMany(LessonProgress::class);
    }
}
