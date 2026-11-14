<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class LiveSession extends Model
{
    protected $fillable = [
        'course_id', 'teacher_id', 'title', 'description', 'platform',
        'meeting_url', 'meeting_id', 'meeting_password', 'scheduled_at',
        'duration_minutes', 'status', 'recording_url',
    ];

    protected $casts = ['scheduled_at' => 'datetime'];

    public function course() { return $this->belongsTo(Course::class); }
    public function teacher() { return $this->belongsTo(User::class, 'teacher_id'); }
    public function attendees() { return $this->belongsToMany(User::class, 'live_session_attendees')->withPivot('joined_at'); }

    public function scopeUpcoming($q) { return $q->where('scheduled_at', '>=', now())->where('status', 'scheduled'); }
    public function scopePast($q) { return $q->where('scheduled_at', '<', now())->orWhere('status', 'completed'); }
}
