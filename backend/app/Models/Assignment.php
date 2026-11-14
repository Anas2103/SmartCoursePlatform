<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Assignment extends Model
{
    protected $fillable = [
        'course_id', 'lesson_id', 'title', 'description', 'instructions',
        'max_points', 'due_date', 'allow_late_submission',
        'allowed_file_types', 'max_file_size_mb', 'is_active',
    ];

    protected $casts = [
        'allowed_file_types' => 'array',
        'due_date' => 'datetime',
        'allow_late_submission' => 'boolean',
        'is_active' => 'boolean',
    ];

    public function course() { return $this->belongsTo(Course::class); }
    public function lesson() { return $this->belongsTo(Lesson::class); }
    public function submissions() { return $this->hasMany(AssignmentSubmission::class); }
}
