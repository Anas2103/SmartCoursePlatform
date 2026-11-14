<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class AssignmentSubmission extends Model
{
    protected $fillable = [
        'assignment_id', 'user_id', 'content', 'file_url', 'file_name',
        'points_earned', 'feedback', 'status', 'graded_by', 'graded_at',
    ];

    protected $casts = ['graded_at' => 'datetime'];

    public function assignment() { return $this->belongsTo(Assignment::class); }
    public function user() { return $this->belongsTo(User::class); }
    public function gradedBy() { return $this->belongsTo(User::class, 'graded_by'); }
}
