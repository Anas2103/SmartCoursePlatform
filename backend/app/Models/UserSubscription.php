<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class UserSubscription extends Model
{
    protected $fillable = [
        'user_id', 'plan_id', 'stripe_subscription_id', 'stripe_customer_id',
        'billing_cycle', 'status', 'trial_ends_at', 'current_period_start',
        'current_period_end', 'cancelled_at',
    ];

    protected $casts = [
        'trial_ends_at' => 'datetime',
        'current_period_start' => 'datetime',
        'current_period_end' => 'datetime',
        'cancelled_at' => 'datetime',
    ];

    public function user() { return $this->belongsTo(User::class); }
    public function plan() { return $this->belongsTo(SubscriptionPlan::class, 'plan_id'); }

    public function isActive(): bool { return $this->status === 'active'; }
}
