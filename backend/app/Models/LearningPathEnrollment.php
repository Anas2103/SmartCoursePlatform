<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class LearningPathEnrollment extends Model
{
    protected $fillable = ['learning_path_id', 'user_id'];

    public function learningPath() { return $this->belongsTo(LearningPath::class); }
    public function user() { return $this->belongsTo(User::class); }
}
