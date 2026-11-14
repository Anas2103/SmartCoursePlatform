<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class SubscriptionPlan extends Model
{
    protected $fillable = [
        'name', 'slug', 'description', 'monthly_price', 'yearly_price',
        'stripe_monthly_price_id', 'stripe_yearly_price_id',
        'features', 'is_active', 'is_featured',
    ];

    protected $casts = ['features' => 'array', 'is_active' => 'boolean', 'is_featured' => 'boolean'];

    public function subscriptions() { return $this->hasMany(UserSubscription::class, 'plan_id'); }
    public function scopeActive($q) { return $q->where('is_active', true); }
}
