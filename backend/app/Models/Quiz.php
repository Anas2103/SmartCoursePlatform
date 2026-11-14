<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Quiz extends Model
{
    use HasFactory;

    protected $fillable = [
        'course_id', 'lesson_id', 'title', 'description',
        'time_limit_minutes', 'passing_percentage', 'max_attempts',
        'show_answers', 'randomize_questions', 'is_active',
    ];

    protected $casts = ['show_answers' => 'boolean', 'randomize_questions' => 'boolean', 'is_active' => 'boolean'];

    public function course() { return $this->belongsTo(Course::class); }
    public function lesson() { return $this->belongsTo(Lesson::class); }
    public function questions() { return $this->hasMany(QuizQuestion::class)->orderBy('order'); }
    public function attempts() { return $this->hasMany(QuizAttempt::class); }
}
