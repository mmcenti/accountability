# ChainForge - Stripe Integration Setup

## 🎯 Overview

ChainForge now includes full Stripe integration using Laravel Cashier for handling subscriptions and payments. This setup provides:

- **30-day free trial** (no credit card required)
- **$9.99/month Premium subscription**
- **Secure payment processing** with Stripe
- **Subscription management** (cancel, resume, billing portal)
- **Automatic billing** and invoice generation

## 🔧 Setup Instructions

### 1. Create Stripe Account

1. Visit [stripe.com](https://stripe.com) and create an account
2. Complete the onboarding process
3. Access your Dashboard

### 2. Get API Keys

In your Stripe Dashboard:

1. Go to **Developers** → **API Keys**
2. Copy your **Publishable Key** (`pk_test_...`)
3. Copy your **Secret Key** (`sk_test_...`)

### 3. Create Products and Prices

#### Create Premium Product:
```bash
# Using Stripe CLI (recommended)
stripe products create \
  --name="ChainForge Premium" \
  --description="Unlimited goals, group accountability, and advanced features"

stripe prices create \
  --unit-amount=999 \
  --currency=usd \
  --recurring=month \
  --product={PRODUCT_ID_FROM_ABOVE}
```

#### Or via Stripe Dashboard:
1. Go to **Products** → **Add Product**
2. Name: "ChainForge Premium"
3. Description: "Unlimited goals, group accountability, and advanced features"
4. Pricing: $9.99 USD monthly recurring
5. Copy the **Price ID** (`price_...`)

### 4. Update Environment Variables

Edit your `.env` file:

```env
# Stripe Configuration
STRIPE_KEY=pk_test_your_publishable_key_here
STRIPE_SECRET=sk_test_your_secret_key_here
STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret_here
CASHIER_CURRENCY=usd
CASHIER_LOGGER=stack
```

### 5. Update Subscription Controller

In `app/Http/Controllers/SubscriptionController.php`, replace the price ID:

```php
// Line ~52 - Update this with your actual Price ID
$user->newSubscription('default', 'price_YOUR_ACTUAL_PRICE_ID')
```

Also update line ~129:
```php
'price_id' => 'price_YOUR_ACTUAL_PRICE_ID',
```

### 6. Set Up Webhooks (Production)

For production, set up webhooks in Stripe Dashboard:

1. Go to **Developers** → **Webhooks**
2. Add endpoint: `https://yourdomain.com/stripe/webhook`
3. Select events:
   - `customer.subscription.created`
   - `customer.subscription.updated` 
   - `customer.subscription.deleted`
   - `invoice.payment_succeeded`
   - `invoice.payment_failed`
4. Copy the **Webhook Secret** to your `.env`

### 7. Testing

Use Stripe's test card numbers:

- **Success**: `4242 4242 4242 4242`
- **Declined**: `4000 0000 0000 0002`
- Any future expiration date and any 3-digit CVC

## 🚀 Features

### Free Trial (30 Days)
- No credit card required
- Full premium feature access
- Automatic trial period based on registration date
- User can upgrade anytime during trial

### Premium Subscription
- $9.99/month
- Unlimited goals
- Group accountability features
- Penalty carry-over system
- Advanced analytics
- Priority support

### Subscription Management
- Cancel anytime (access until period end)
- Resume canceled subscriptions
- Update payment methods
- View billing history via Stripe portal

## 🔒 Security Features

- PCI compliant payment processing
- Secure tokenization of payment methods
- Webhook signature verification
- CSRF protection on all forms
- Authorization policies for all subscription actions

## 📱 User Experience

### Free User Flow:
1. Register → Immediate free access
2. See trial banner with days remaining
3. One-click trial start (no payment required)
4. Upgrade anytime with payment method

### Premium User Flow:
1. Enter payment details
2. Instant subscription activation
3. Full feature access
4. Manage billing via Stripe portal

## 🛠️ Development Commands

```bash
# Start development server
php artisan serve --host=0.0.0.0 --port=8000

# Run frontend
npm run dev

# Process group goal periods
php artisan chainforge:process-periods

# Test webhooks locally (requires Stripe CLI)
stripe listen --forward-to localhost:8000/stripe/webhook
```

## 📊 Business Model

- **Free Tier**: Personal goals only, up to 5 active goals
- **Premium Tier**: Everything + groups, unlimited goals, analytics
- **Trial**: 30 days full access, no payment required
- **Pricing**: $9.99/month, cancel anytime

## 🎯 Key Features Enabled by Premium

1. **Group Accountability**: Create/join groups with shared goals
2. **Penalty Carry-Over**: Missed targets carry to next period
3. **Advanced Analytics**: Progress patterns and completion rates
4. **Unlimited Goals**: No restrictions on personal goals
5. **Priority Support**: Faster response times
6. **Data Export**: Download your progress data

## 🔍 Monitoring

Monitor your subscription metrics in Stripe Dashboard:
- Monthly recurring revenue (MRR)
- Churn rate
- Trial conversion rates
- Failed payment recovery

---

## 🆘 Troubleshooting

### Common Issues:

1. **"No such price" error**: Update price ID in SubscriptionController
2. **Webhook failures**: Check webhook secret in .env
3. **Payment declined**: Use test cards or check user's payment method
4. **Trial not showing**: Verify user registration date logic

### Support:
- Stripe Documentation: [stripe.com/docs](https://stripe.com/docs)
- Laravel Cashier: [laravel.com/docs/billing](https://laravel.com/docs/billing)

---

**Ready to launch!** 🚀 Your ChainForge application now has enterprise-grade payment processing with a user-friendly freemium model.