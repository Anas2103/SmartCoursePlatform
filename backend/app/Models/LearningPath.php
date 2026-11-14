<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class LearningPath extends Model
{
    protected $fillable = [
        'title', 'slug', 'description', 'thumbnail', 'level',
        'price', 'discount_price', 'is_active', 'estimated_hours',
    ];

    protected $casts = ['is_active' => 'boolean'];

    public function getThumbnailUrlAttribute(): ?string
    {
        return $this->thumbnail ? asset('storage/' . $this->thumbnail) : null;
    }

    public function getEffectivePriceAttribute(): float
    {
        return $this->discount_price ?? $this->price;
    }

    public function courses() { return $this->belongsToMany(Course::class, 'learning_path_courses')->withPivot('position')->orderByPivot('position'); }
    public function enrollments() { return $this->hasMany(LearningPathEnrollment::class); }

    public function scopeActive($q) { return $q->where('is_active', true); }
}
