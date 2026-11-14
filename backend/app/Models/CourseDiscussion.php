<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class CourseDiscussion extends Model
{
    protected $fillable = ['course_id', 'user_id', 'title', 'body', 'is_pinned', 'is_locked', 'replies_count', 'views'];

    public function course() { return $this->belongsTo(Course::class); }
    public function user() { return $this->belongsTo(User::class); }
    public function replies() { return $this->hasMany(DiscussionReply::class, 'discussion_id'); }
    public function topReplies() { return $this->replies()->whereNull('parent_id')->with('user', 'children.user')->latest(); }
}
