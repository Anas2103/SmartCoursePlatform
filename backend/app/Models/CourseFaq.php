<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class CourseFaq extends Model
{
    protected $table = 'course_faqs';
    protected $fillable = ['course_id', 'question', 'answer', 'order'];

    public function course() { return $this->belongsTo(Course::class); }
}
