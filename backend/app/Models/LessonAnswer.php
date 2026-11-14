<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class LessonAnswer extends Model
{
    protected $fillable = ['question_id', 'user_id', 'body', 'is_accepted', 'upvotes'];

    public function question() { return $this->belongsTo(LessonQuestion::class); }
    public function user() { return $this->belongsTo(User::class); }
}
