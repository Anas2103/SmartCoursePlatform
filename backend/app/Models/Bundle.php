<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Bundle extends Model
{
    protected $fillable = ['title', 'slug', 'description', 'thumbnail', 'price', 'compare_price', 'is_active', 'expires_at'];
    protected $casts = ['is_active' => 'boolean', 'expires_at' => 'datetime'];

    public function getThumbnailUrlAttribute(): ?string
    {
        return $this->thumbnail ? asset('storage/' . $this->thumbnail) : null;
    }

    public function getSavingsPercentageAttribute(): int
    {
        if (!$this->compare_price || $this->compare_price <= 0) return 0;
        return (int) round((1 - $this->price / $this->compare_price) * 100);
    }

    public function courses() { return $this->belongsToMany(Course::class, 'bundle_courses')->withPivot('position')->orderByPivot('position'); }

    public function scopeActive($q) { return $q->where('is_active', true)->where(fn($q) => $q->whereNull('expires_at')->orWhere('expires_at', '>=', now())); }
}
