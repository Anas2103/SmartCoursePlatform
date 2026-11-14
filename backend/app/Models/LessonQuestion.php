<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class LessonQuestion extends Model
{
    protected $fillable = ['lesson_id', 'user_id', 'body', 'is_pinned', 'upvotes'];

    public function lesson() { return $this->belongsTo(Lesson::class); }
    public function user() { return $this->belongsTo(User::class); }
    public function answers() { return $this->hasMany(LessonAnswer::class, 'question_id'); }
}
