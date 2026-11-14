<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Badge extends Model
{
    protected $fillable = ['name', 'slug', 'description', 'icon', 'color', 'condition_type', 'condition_value', 'xp_reward'];

    public function users() { return $this->belongsToMany(User::class, 'user_badges')->withPivot('earned_at'); }
}
