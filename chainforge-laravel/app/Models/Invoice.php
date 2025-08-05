<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Concerns\HasUuids;

class Invoice extends Model
{
    use HasFactory, HasUuids;

    protected $fillable = [
        'user_id',
        'subscription_id',
        'stripe_invoice_id',
        'amount',
        'currency',
        'status',
        'period_start',
        'period_end',
        'paid_at',
        'due_date',
        'invoice_url',
    ];

    protected function casts(): array
    {
        return [
            'amount' => 'decimal:2',
            'period_start' => 'datetime',
            'period_end' => 'datetime',
            'paid_at' => 'datetime',
            'due_date' => 'datetime',
        ];
    }

    /**
     * Get the user this invoice belongs to.
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Get the subscription this invoice belongs to.
     */
    public function subscription(): BelongsTo
    {
        return $this->belongsTo(Subscription::class);
    }

    /**
     * Get formatted amount with currency.
     */
    public function getFormattedAmountAttribute(): string
    {
        $symbol = match($this->currency) {
            'usd' => '$',
            'eur' => '€',
            'gbp' => '£',
            default => '$'
        };

        return $symbol . number_format($this->amount, 2);
    }

    /**
     * Check if the invoice is paid.
     */
    public function getIsPaidAttribute(): bool
    {
        return $this->status === 'paid' && $this->paid_at !== null;
    }

    /**
     * Check if the invoice is overdue.
     */
    public function getIsOverdueAttribute(): bool
    {
        return $this->status !== 'paid' && $this->due_date < now();
    }

    /**
     * Get the billing period description.
     */
    public function getBillingPeriodAttribute(): string
    {
        return $this->period_start->format('M j, Y') . ' - ' . $this->period_end->format('M j, Y');
    }

    /**
     * Scope to get paid invoices.
     */
    public function scopePaid($query)
    {
        return $query->where('status', 'paid');
    }

    /**
     * Scope to get unpaid invoices.
     */
    public function scopeUnpaid($query)
    {
        return $query->where('status', '!=', 'paid');
    }

    /**
     * Scope to get overdue invoices.
     */
    public function scopeOverdue($query)
    {
        return $query->where('status', '!=', 'paid')
                    ->where('due_date', '<', now());
    }
}
