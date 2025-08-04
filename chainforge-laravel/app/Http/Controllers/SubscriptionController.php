<?php

namespace App\Http\Controllers;

use App\Models\Subscription;
use App\Models\PaymentMethod;
use App\Models\Invoice;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Inertia\Inertia;

class SubscriptionController extends Controller
{
    /**
     * Show subscription management page.
     */
    public function index(Request $request)
    {
        $user = $request->user();
        $subscription = $user->subscription;

        if (!$subscription) {
            // Create a free subscription if none exists
            $subscription = Subscription::create([
                'id' => Str::uuid(),
                'user_id' => $user->id,
                'plan' => 'free',
                'status' => 'active',
            ]);
        }

        $paymentMethods = $user->paymentMethods()->orderBy('is_default', 'desc')->get();
        $invoices = $user->invoices()->orderBy('created_at', 'desc')->limit(10)->get();

        return Inertia::render('Subscription/Index', [
            'subscription' => [
                'id' => $subscription->id,
                'plan' => $subscription->plan,
                'status' => $subscription->status,
                'is_active' => $subscription->is_active,
                'is_on_trial' => $subscription->is_on_trial,
                'is_premium' => $subscription->is_premium,
                'trial_start_date' => $subscription->trial_start_date,
                'trial_end_date' => $subscription->trial_end_date,
                'current_period_start' => $subscription->current_period_start,
                'current_period_end' => $subscription->current_period_end,
                'canceled_at' => $subscription->canceled_at,
                'created_at' => $subscription->created_at,
            ],
            'payment_methods' => $paymentMethods->map(function ($pm) {
                return [
                    'id' => $pm->id,
                    'type' => $pm->type,
                    'brand' => $pm->brand,
                    'last4' => $pm->last4,
                    'expiry_month' => $pm->expiry_month,
                    'expiry_year' => $pm->expiry_year,
                    'is_default' => $pm->is_default,
                    'created_at' => $pm->created_at,
                ];
            }),
            'recent_invoices' => $invoices->map(function ($invoice) {
                return [
                    'id' => $invoice->id,
                    'amount' => $invoice->amount,
                    'currency' => $invoice->currency,
                    'status' => $invoice->status,
                    'period_start' => $invoice->period_start,
                    'period_end' => $invoice->period_end,
                    'paid_at' => $invoice->paid_at,
                    'due_date' => $invoice->due_date,
                    'invoice_url' => $invoice->invoice_url,
                    'created_at' => $invoice->created_at,
                ];
            }),
            'plans' => $this->getAvailablePlans(),
        ]);
    }

    /**
     * Start premium subscription trial.
     */
    public function startTrial(Request $request)
    {
        $user = $request->user();
        $subscription = $user->subscription;

        if (!$subscription) {
            return back()->withErrors(['error' => 'No subscription found.']);
        }

        if ($subscription->is_on_trial || $subscription->trial_end_date) {
            return back()->withErrors(['error' => 'Trial already used or active.']);
        }

        $subscription->update([
            'plan' => 'premium',
            'status' => 'trial',
            'trial_start_date' => now(),
            'trial_end_date' => now()->addDays(30),
        ]);

        return back()->with('success', 'Premium trial started! You have 30 days of full access.');
    }

    /**
     * Upgrade to premium subscription.
     */
    public function upgradeToPremium(Request $request)
    {
        $request->validate([
            'payment_method_id' => 'required|exists:payment_methods,id',
        ]);

        $user = $request->user();
        $subscription = $user->subscription;
        $paymentMethod = PaymentMethod::where('id', $request->payment_method_id)
            ->where('user_id', $user->id)
            ->firstOrFail();

        // In a real implementation, you would integrate with Stripe here
        // For now, we'll simulate the upgrade
        $subscription->update([
            'plan' => 'premium',
            'status' => 'active',
            'current_period_start' => now(),
            'current_period_end' => now()->addMonth(),
            'stripe_subscription_id' => 'sub_' . Str::random(24), // Mock Stripe ID
        ]);

        // Create invoice record
        Invoice::create([
            'id' => Str::uuid(),
            'user_id' => $user->id,
            'subscription_id' => $subscription->id,
            'stripe_invoice_id' => 'in_' . Str::random(24), // Mock Stripe ID
            'amount' => 9.99,
            'currency' => 'usd',
            'status' => 'paid',
            'period_start' => now(),
            'period_end' => now()->addMonth(),
            'paid_at' => now(),
            'due_date' => now()->addDays(7),
        ]);

        return back()->with('success', 'Successfully upgraded to Premium! Welcome to ChainForge Pro.');
    }

    /**
     * Cancel subscription.
     */
    public function cancel(Request $request)
    {
        $user = $request->user();
        $subscription = $user->subscription;

        if (!$subscription || !$subscription->is_active) {
            return back()->withErrors(['error' => 'No active subscription to cancel.']);
        }

        // In a real implementation, you would cancel with Stripe here
        $subscription->update([
            'status' => 'canceled',
            'canceled_at' => now(),
        ]);

        return back()->with('success', 'Subscription canceled. You can continue using premium features until the end of your billing period.');
    }

    /**
     * Reactivate subscription.
     */
    public function reactivate(Request $request)
    {
        $user = $request->user();
        $subscription = $user->subscription;

        if (!$subscription || $subscription->status !== 'canceled') {
            return back()->withErrors(['error' => 'No canceled subscription to reactivate.']);
        }

        // In a real implementation, you would reactivate with Stripe here
        $subscription->update([
            'status' => 'active',
            'canceled_at' => null,
        ]);

        return back()->with('success', 'Subscription reactivated successfully!');
    }

    /**
     * Add payment method.
     */
    public function addPaymentMethod(Request $request)
    {
        $request->validate([
            'type' => 'required|string|in:card',
            'brand' => 'required|string|max:50',
            'last4' => 'required|string|size:4',
            'expiry_month' => 'required|integer|min:1|max:12',
            'expiry_year' => 'required|integer|min:' . date('Y'),
        ]);

        $user = $request->user();

        // If this is the first payment method, make it default
        $isDefault = $user->paymentMethods()->count() === 0;

        // In a real implementation, you would save to Stripe and get the payment method ID
        $paymentMethod = PaymentMethod::create([
            'id' => Str::uuid(),
            'user_id' => $user->id,
            'stripe_payment_method_id' => 'pm_' . Str::random(24), // Mock Stripe ID
            'type' => $request->type,
            'brand' => $request->brand,
            'last4' => $request->last4,
            'expiry_month' => $request->expiry_month,
            'expiry_year' => $request->expiry_year,
            'is_default' => $isDefault,
        ]);

        return back()->with('success', 'Payment method added successfully!');
    }

    /**
     * Set default payment method.
     */
    public function setDefaultPaymentMethod(Request $request, PaymentMethod $paymentMethod)
    {
        $this->authorize('update', $paymentMethod);

        // Remove default from all other payment methods
        $request->user()->paymentMethods()->update(['is_default' => false]);

        // Set this one as default
        $paymentMethod->update(['is_default' => true]);

        return back()->with('success', 'Default payment method updated.');
    }

    /**
     * Remove payment method.
     */
    public function removePaymentMethod(PaymentMethod $paymentMethod)
    {
        $this->authorize('delete', $paymentMethod);

        // Don't allow removing the default payment method if user has active premium subscription
        if ($paymentMethod->is_default && $paymentMethod->user->subscription->is_premium) {
            return back()->withErrors(['error' => 'Cannot remove default payment method with active premium subscription.']);
        }

        // In a real implementation, you would remove from Stripe here
        $paymentMethod->delete();

        return back()->with('success', 'Payment method removed.');
    }

    /**
     * Get available subscription plans.
     */
    private function getAvailablePlans(): array
    {
        return [
            'free' => [
                'name' => 'Free',
                'price' => 0,
                'interval' => null,
                'features' => [
                    'Personal goals only',
                    'Basic progress tracking',
                    'Mobile app access',
                    'Up to 5 active goals',
                ],
                'limitations' => [
                    'No group goals',
                    'No advanced analytics',
                    'Limited goal categories',
                ],
            ],
            'premium' => [
                'name' => 'Premium',
                'price' => 9.99,
                'interval' => 'month',
                'features' => [
                    'Everything in Free',
                    'Unlimited goals',
                    'Group accountability',
                    'Advanced analytics',
                    'Custom goal categories',
                    'Penalty carry-over system',
                    'Priority support',
                    'Export data',
                ],
                'popular' => true,
            ],
        ];
    }

    /**
     * Show billing history.
     */
    public function billingHistory(Request $request)
    {
        $invoices = $request->user()->invoices()
            ->orderBy('created_at', 'desc')
            ->paginate(15);

        return Inertia::render('Subscription/BillingHistory', [
            'invoices' => $invoices,
        ]);
    }

    /**
     * Download invoice.
     */
    public function downloadInvoice(Invoice $invoice)
    {
        $this->authorize('view', $invoice);

        // In a real implementation, you would generate/fetch the PDF from Stripe
        return back()->with('info', 'Invoice download would be available with Stripe integration.');
    }
}
