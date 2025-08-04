<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Concerns\HasUuids;

class PaymentMethod extends Model
{
    use HasFactory, HasUuids;

    protected $fillable = [
        'user_id',
        'stripe_payment_method_id',
        'type',
        'brand',
        'last4',
        'expiry_month',
        'expiry_year',
        'is_default',
    ];

    protected function casts(): array
    {
        return [
            'is_default' => 'boolean',
        ];
    }

    /**
     * Get the user that owns this payment method.
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Get formatted expiry date.
     */
    public function getExpiryAttribute(): string
    {
        return sprintf('%02d/%d', $this->expiry_month, $this->expiry_year);
    }

    /**
     * Check if the payment method is expired.
     */
    public function getIsExpiredAttribute(): bool
    {
        $currentYear = date('Y');
        $currentMonth = date('n');

        return $this->expiry_year < $currentYear || 
               ($this->expiry_year == $currentYear && $this->expiry_month < $currentMonth);
    }

    /**
     * Get display name for the payment method.
     */
    public function getDisplayNameAttribute(): string
    {
        return ucfirst($this->brand) . ' ending in ' . $this->last4;
    }

    /**
     * Scope to get default payment method.
     */
    public function scopeDefault($query)
    {
        return $query->where('is_default', true);
    }

    /**
     * Scope to get non-expired payment methods.
     */
    public function scopeActive($query)
    {
        $currentYear = date('Y');
        $currentMonth = date('n');

        return $query->where(function ($q) use ($currentYear, $currentMonth) {
            $q->where('expiry_year', '>', $currentYear)
              ->orWhere(function ($subQ) use ($currentYear, $currentMonth) {
                  $subQ->where('expiry_year', $currentYear)
                       ->where('expiry_month', '>=', $currentMonth);
              });
        });
    }
}
