<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Course extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'title', 'slug', 'description', 'short_description', 'thumbnail',
        'intro_video', 'teacher_id', 'category_id', 'level', 'status',
        'price', 'discount_price', 'discount_ends_at', 'language',
        'requirements', 'learning_outcomes', 'target_audience',
        'duration_minutes', 'total_lessons', 'total_enrolled',
        'avg_rating', 'total_reviews', 'is_featured', 'is_bestseller',
        'certificate_enabled', 'rejection_reason', 'published_at',
    ];

    protected $casts = [
        'requirements' => 'array',
        'learning_outcomes' => 'array',
        'target_audience' => 'array',
        'is_featured' => 'boolean',
        'is_bestseller' => 'boolean',
        'certificate_enabled' => 'boolean',
        'discount_ends_at' => 'datetime',
        'published_at' => 'datetime',
        'price' => 'decimal:2',
        'discount_price' => 'decimal:2',
    ];

    public function getEffectivePriceAttribute(): float
    {
        if ($this->discount_price && (!$this->discount_ends_at || $this->discount_ends_at->isFuture())) {
            return (float) $this->discount_price;
        }
        return (float) $this->price;
    }

    public function getThumbnailUrlAttribute(): ?string
    {
        if ($this->thumbnail) {
            return str_starts_with($this->thumbnail, 'http')
                ? $this->thumbnail
                : asset('storage/' . $this->thumbnail);
        }
        return null; // frontend renders its own placeholder
    }

    public function teacher()
    {
        return $this->belongsTo(User::class, 'teacher_id');
    }

    public function category()
    {
        return $this->belongsTo(Category::class);
    }

    public function sections()
    {
        return $this->hasMany(Section::class)->orderBy('order');
    }

    public function lessons()
    {
        return $this->hasMany(Lesson::class);
    }

    public function enrollments()
    {
        return $this->hasMany(Enrollment::class);
    }

    public function enrolledStudents()
    {
        return $this->belongsToMany(User::class, 'enrollments')
            ->withPivot('progress_percentage', 'is_completed', 'completed_at')
            ->withTimestamps();
    }

    public function reviews()
    {
        return $this->hasMany(Review::class);
    }

    public function payments()
    {
        return $this->hasMany(Payment::class);
    }

    public function certificates()
    {
        return $this->hasMany(Certificate::class);
    }

    public function tags()
    {
        return $this->belongsToMany(Tag::class, 'course_tag');
    }

    public function quizzes()
    {
        return $this->hasMany(Quiz::class);
    }

    public function assignments()
    {
        return $this->hasMany(Assignment::class);
    }

    public function faqs()
    {
        return $this->hasMany(CourseFaq::class)->orderBy('order');
    }

    public function wishlists()
    {
        return $this->hasMany(Wishlist::class);
    }

    public function announcements()
    {
        return $this->hasMany(Announcement::class);
    }

    public function scopePublished($query)
    {
        return $query->where('status', 'published');
    }

    public function scopeFeatured($query)
    {
        return $query->where('is_featured', true);
    }
}
