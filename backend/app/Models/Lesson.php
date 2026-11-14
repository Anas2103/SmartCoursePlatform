<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Lesson extends Model
{
    use HasFactory;

    protected $fillable = [
        'section_id', 'course_id', 'title', 'description', 'type',
        'video_url', 'video_duration', 'duration_minutes', 'content',
        'resource_url', 'resource_name', 'is_free_preview', 'is_published', 'order',
    ];

    protected $casts = ['is_free_preview' => 'boolean', 'is_published' => 'boolean'];

    public function section()
    {
        return $this->belongsTo(Section::class);
    }

    public function course()
    {
        return $this->belongsTo(Course::class);
    }

    public function progress()
    {
        return $this->hasMany(LessonProgress::class);
    }

    public function bookmarks()
    {
        return $this->hasMany(Bookmark::class);
    }

    public function quiz()
    {
        return $this->hasOne(Quiz::class);
    }

    public function assignment()
    {
        return $this->hasOne(Assignment::class);
    }
}
