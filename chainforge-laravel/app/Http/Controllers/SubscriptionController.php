<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Inertia\Inertia;
use Laravel\Cashier\Exceptions\IncompletePayment;

class SubscriptionController extends Controller
{
    /**
     * Show subscription management page.
     */
    public function index(Request $request)
    {
        $user = $request->user();

        // Get current subscription
        $subscription = $user->subscription('default');
        
        // Check if user is on trial (30-day free trial, no credit card)
        $isOnFreeTrial = !$subscription && !$user->hasEverSubscribed() && $this->isWithinTrialPeriod($user);
        
        // Get payment methods
        $paymentMethods = [];
        $setupIntent = null;
        
        if ($user->hasStripeId()) {
            $paymentMethods = $user->paymentMethods()->map(function ($pm) {
                return [
                    'id' => $pm->id,
                    'type' => $pm->type,
                    'brand' => $pm->card->brand ?? 'card',
                    'last4' => $pm->card->last4 ?? '0000',
                    'exp_month' => $pm->card->exp_month ?? 1,
                    'exp_year' => $pm->card->exp_year ?? date('Y'),
                ];
            })->toArray();
            
            // Create setup intent for adding payment methods
            $setupIntent = $user->createSetupIntent();
        }

        return Inertia::render('Subscription/Index', [
            'subscription' => $subscription ? [
                'id' => $subscription->stripe_id,
                'status' => $subscription->stripe_status,
                'name' => $subscription->name,
                'trial_ends_at' => $subscription->trial_ends_at,
                'ends_at' => $subscription->ends_at,
                'created_at' => $subscription->created_at,
                'on_trial' => $subscription->onTrial(),
                'active' => $subscription->active(),
                'canceled' => $subscription->canceled(),
                'on_grace_period' => $subscription->onGracePeriod(),
            ] : null,
            'is_on_free_trial' => $isOnFreeTrial,
            'trial_ends_at' => $this->getTrialEndDate($user),
            'payment_methods' => $paymentMethods,
            'setup_intent' => $setupIntent?->client_secret,
            'stripe_key' => config('cashier.key'),
            'plans' => $this->getAvailablePlans(),
            'has_ever_subscribed' => $user->hasEverSubscribed(),
        ]);
    }

    /**
     * Start the 30-day free trial (no credit card required).
     */
    public function startFreeTrial(Request $request)
    {
        $user = $request->user();
        
        // Check if user is eligible for free trial
        if ($user->hasEverSubscribed()) {
            return back()->withErrors(['error' => 'Free trial is only available to new users.']);
        }
        
        if ($this->isWithinTrialPeriod($user)) {
            return back()->withErrors(['error' => 'You are already on a free trial.']);
        }

        // Create a trial subscription without requiring payment method
        try {
            $user->newSubscription('default', 'price_premium_monthly')
                ->trialDays(30)
                ->create();

            return back()->with('success', 'Your 30-day free trial has started! Enjoy full access to ChainForge Premium.');
        } catch (\Exception $e) {
            return back()->withErrors(['error' => 'Failed to start trial: ' . $e->getMessage()]);
        }
    }

    /**
     * Subscribe to premium with payment method.
     */
    public function subscribe(Request $request)
    {
        $request->validate([
            'payment_method' => 'required|string',
        ]);

        $user = $request->user();

        try {
            // If user has an existing trial subscription, update it
            if ($user->subscription('default') && $user->subscription('default')->onTrial()) {
                $subscription = $user->subscription('default');
                $subscription->updateDefaultPaymentMethod($request->payment_method);
                $subscription->skipTrial()->swap('price_premium_monthly');
            } else {
                // Create new subscription
                $user->newSubscription('default', 'price_premium_monthly')
                    ->create($request->payment_method);
            }

            return back()->with('success', 'Successfully subscribed to ChainForge Premium!');
        } catch (IncompletePayment $exception) {
            return redirect()->route('cashier.payment', [
                $exception->payment->id,
                'redirect' => route('subscription.index')
            ]);
        } catch (\Exception $e) {
            return back()->withErrors(['error' => 'Subscription failed: ' . $e->getMessage()]);
        }
    }

    /**
     * Cancel subscription.
     */
    public function cancel(Request $request)
    {
        $user = $request->user();
        $subscription = $user->subscription('default');

        if (!$subscription || !$subscription->active()) {
            return back()->withErrors(['error' => 'No active subscription to cancel.']);
        }

        $subscription->cancel();

        return back()->with('success', 'Subscription canceled. You can continue using premium features until ' . $subscription->ends_at->format('M j, Y') . '.');
    }

    /**
     * Resume subscription.
     */
    public function resume(Request $request)
    {
        $user = $request->user();
        $subscription = $user->subscription('default');

        if (!$subscription || !$subscription->onGracePeriod()) {
            return back()->withErrors(['error' => 'No subscription to resume.']);
        }

        $subscription->resume();

        return back()->with('success', 'Subscription resumed successfully!');
    }

    /**
     * Update payment method.
     */
    public function updatePaymentMethod(Request $request)
    {
        $request->validate([
            'payment_method' => 'required|string',
        ]);

        $user = $request->user();
        $subscription = $user->subscription('default');

        if (!$subscription) {
            return back()->withErrors(['error' => 'No subscription found.']);
        }

        try {
            $subscription->updateDefaultPaymentMethod($request->payment_method);
            return back()->with('success', 'Payment method updated successfully!');
        } catch (\Exception $e) {
            return back()->withErrors(['error' => 'Failed to update payment method: ' . $e->getMessage()]);
        }
    }

    /**
     * Get billing portal URL.
     */
    public function billingPortal(Request $request)
    {
        $user = $request->user();
        
        if (!$user->hasStripeId()) {
            return back()->withErrors(['error' => 'No billing information found.']);
        }

        return $user->redirectToBillingPortal(route('subscription.index'));
    }

    /**
     * Check if user is within the 30-day trial period.
     */
    private function isWithinTrialPeriod($user): bool
    {
        return $user->created_at->isAfter(now()->subDays(30));
    }

    /**
     * Get trial end date for user.
     */
    private function getTrialEndDate($user)
    {
        return $user->created_at->addDays(30);
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
                'price_id' => 'price_premium_monthly',
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
     * Handle Stripe webhooks.
     */
    public function handleWebhook(Request $request)
    {
        return $this->handleStripeWebhook($request);
    }
}
