<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Concerns\HasUuids;

class Subscription extends Model
{
    use HasFactory, HasUuids;

    protected $fillable = [
        'user_id',
        'plan',
        'status',
        'stripe_customer_id',
        'stripe_subscription_id',
        'stripe_price_id',
        'trial_start_date',
        'trial_end_date',
        'current_period_start',
        'current_period_end',
        'canceled_at',
    ];

    protected function casts(): array
    {
        return [
            'trial_start_date' => 'datetime',
            'trial_end_date' => 'datetime',
            'current_period_start' => 'datetime',
            'current_period_end' => 'datetime',
            'canceled_at' => 'datetime',
        ];
    }

    /**
     * Get the user that owns this subscription.
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Get the invoices for this subscription.
     */
    public function invoices(): HasMany
    {
        return $this->hasMany(Invoice::class);
    }

    /**
     * Get the usage records for this subscription.
     */
    public function usage(): HasMany
    {
        return $this->hasMany(SubscriptionUsage::class);
    }

    /**
     * Check if the subscription is active.
     */
    public function getIsActiveAttribute(): bool
    {
        return in_array($this->status, ['active', 'trial']);
    }

    /**
     * Check if the subscription is on trial.
     */
    public function getIsOnTrialAttribute(): bool
    {
        return $this->status === 'trial' && 
               $this->trial_end_date && 
               $this->trial_end_date->isFuture();
    }

    /**
     * Check if the subscription is premium.
     */
    public function getIsPremiumAttribute(): bool
    {
        return $this->plan === 'premium' && $this->is_active;
    }
}
