<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class DiscussionReply extends Model
{
    protected $fillable = ['discussion_id', 'user_id', 'parent_id', 'body', 'upvotes'];

    public function discussion() { return $this->belongsTo(CourseDiscussion::class); }
    public function user() { return $this->belongsTo(User::class); }
    public function parent() { return $this->belongsTo(DiscussionReply::class, 'parent_id'); }
    public function children() { return $this->hasMany(DiscussionReply::class, 'parent_id'); }
}
