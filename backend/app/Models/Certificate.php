<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Certificate extends Model
{
    protected $fillable = ['user_id', 'course_id', 'certificate_number', 'file_path', 'issued_at'];
    protected $casts = ['issued_at' => 'datetime'];

    public function getCredentialIdAttribute(): string
    {
        return $this->certificate_number ?? strtoupper(substr(md5($this->id . $this->user_id), 0, 12));
    }

    public function user() { return $this->belongsTo(User::class); }
    public function course() { return $this->belongsTo(Course::class); }
}
