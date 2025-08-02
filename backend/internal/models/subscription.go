package models

import (
	"time"

	"github.com/google/uuid"
)

// SubscriptionStatus represents the status of a subscription
type SubscriptionStatus string

const (
	SubscriptionStatusTrial    SubscriptionStatus = "trial"
	SubscriptionStatusActive   SubscriptionStatus = "active"
	SubscriptionStatusPastDue  SubscriptionStatus = "past_due"
	SubscriptionStatusCanceled SubscriptionStatus = "canceled"
	SubscriptionStatusExpired  SubscriptionStatus = "expired"
)

// SubscriptionPlan represents available subscription plans
type SubscriptionPlan string

const (
	PlanFree    SubscriptionPlan = "free"
	PlanPremium SubscriptionPlan = "premium"
)

// Subscription represents a user's subscription
type Subscription struct {
	ID                uuid.UUID          `json:"id" db:"id"`
	UserID            uuid.UUID          `json:"user_id" db:"user_id"`
	Plan              SubscriptionPlan   `json:"plan" db:"plan"`
	Status            SubscriptionStatus `json:"status" db:"status"`
	StripeCustomerID  *string            `json:"stripe_customer_id" db:"stripe_customer_id"`
	StripeSubscriptionID *string         `json:"stripe_subscription_id" db:"stripe_subscription_id"`
	StripePriceID     *string            `json:"stripe_price_id" db:"stripe_price_id"`
	TrialStartDate    *time.Time         `json:"trial_start_date" db:"trial_start_date"`
	TrialEndDate      *time.Time         `json:"trial_end_date" db:"trial_end_date"`
	CurrentPeriodStart *time.Time        `json:"current_period_start" db:"current_period_start"`
	CurrentPeriodEnd   *time.Time        `json:"current_period_end" db:"current_period_end"`
	CanceledAt        *time.Time         `json:"canceled_at" db:"canceled_at"`
	CreatedAt         time.Time          `json:"created_at" db:"created_at"`
	UpdatedAt         time.Time          `json:"updated_at" db:"updated_at"`
}

// SubscriptionFeatures represents the features available for each plan
type SubscriptionFeatures struct {
	Plan                SubscriptionPlan `json:"plan"`
	MaxPersonalGoals    *int             `json:"max_personal_goals"`    // nil = unlimited
	GroupGoalsAllowed   bool             `json:"group_goals_allowed"`
	AdvancedAnalytics   bool             `json:"advanced_analytics"`
	PrioritySupport     bool             `json:"priority_support"`
	CustomCategories    bool             `json:"custom_categories"`
	DataExport          bool             `json:"data_export"`
	APIAccess           bool             `json:"api_access"`
}

// PaymentMethod represents a user's payment method
type PaymentMethod struct {
	ID               uuid.UUID `json:"id" db:"id"`
	UserID           uuid.UUID `json:"user_id" db:"user_id"`
	StripePaymentMethodID string `json:"stripe_payment_method_id" db:"stripe_payment_method_id"`
	Type             string    `json:"type" db:"type"` // "card", "bank_account", etc.
	Brand            *string   `json:"brand" db:"brand"`
	Last4            *string   `json:"last4" db:"last4"`
	ExpiryMonth      *int      `json:"expiry_month" db:"expiry_month"`
	ExpiryYear       *int      `json:"expiry_year" db:"expiry_year"`
	IsDefault        bool      `json:"is_default" db:"is_default"`
	CreatedAt        time.Time `json:"created_at" db:"created_at"`
	UpdatedAt        time.Time `json:"updated_at" db:"updated_at"`
}

// Invoice represents a billing invoice
type Invoice struct {
	ID               uuid.UUID `json:"id" db:"id"`
	UserID           uuid.UUID `json:"user_id" db:"user_id"`
	SubscriptionID   uuid.UUID `json:"subscription_id" db:"subscription_id"`
	StripeInvoiceID  string    `json:"stripe_invoice_id" db:"stripe_invoice_id"`
	Amount           float64   `json:"amount" db:"amount"`
	Currency         string    `json:"currency" db:"currency"`
	Status           string    `json:"status" db:"status"`
	PeriodStart      time.Time `json:"period_start" db:"period_start"`
	PeriodEnd        time.Time `json:"period_end" db:"period_end"`
	PaidAt           *time.Time `json:"paid_at" db:"paid_at"`
	DueDate          time.Time `json:"due_date" db:"due_date"`
	InvoiceURL       *string   `json:"invoice_url" db:"invoice_url"`
	CreatedAt        time.Time `json:"created_at" db:"created_at"`
}

// SubscriptionUsage represents usage metrics for billing
type SubscriptionUsage struct {
	ID             uuid.UUID `json:"id" db:"id"`
	UserID         uuid.UUID `json:"user_id" db:"user_id"`
	SubscriptionID uuid.UUID `json:"subscription_id" db:"subscription_id"`
	PersonalGoals  int       `json:"personal_goals" db:"personal_goals"`
	GroupGoals     int       `json:"group_goals" db:"group_goals"`
	GroupsJoined   int       `json:"groups_joined" db:"groups_joined"`
	APIRequests    int       `json:"api_requests" db:"api_requests"`
	StorageUsed    int64     `json:"storage_used" db:"storage_used"` // in bytes
	PeriodStart    time.Time `json:"period_start" db:"period_start"`
	PeriodEnd      time.Time `json:"period_end" db:"period_end"`
	CreatedAt      time.Time `json:"created_at" db:"created_at"`
}

// Request/Response models
type CreateSubscriptionRequest struct {
	Plan              SubscriptionPlan `json:"plan" validate:"required"`
	PaymentMethodID   *string          `json:"payment_method_id,omitempty"`
	PromotionCode     *string          `json:"promotion_code,omitempty"`
}

type UpdateSubscriptionRequest struct {
	Plan *SubscriptionPlan `json:"plan,omitempty"`
}

type CancelSubscriptionRequest struct {
	CancelAtPeriodEnd bool   `json:"cancel_at_period_end"`
	CancellationReason *string `json:"cancellation_reason,omitempty"`
}

type AddPaymentMethodRequest struct {
	PaymentMethodID string `json:"payment_method_id" validate:"required"`
	SetAsDefault    bool   `json:"set_as_default"`
}

type SubscriptionSummary struct {
	Subscription Subscription         `json:"subscription"`
	Features     SubscriptionFeatures `json:"features"`
	Usage        *SubscriptionUsage   `json:"usage,omitempty"`
	NextInvoice  *Invoice             `json:"next_invoice,omitempty"`
}

type BillingPortalRequest struct {
	ReturnURL string `json:"return_url" validate:"required,url"`
}

type BillingPortalResponse struct {
	URL string `json:"url"`
}

// Constructor functions
func NewSubscription(userID uuid.UUID, plan SubscriptionPlan) *Subscription {
	now := time.Now().UTC()
	
	subscription := &Subscription{
		ID:        uuid.New(),
		UserID:    userID,
		Plan:      plan,
		CreatedAt: now,
		UpdatedAt: now,
	}

	// Set up trial for new users
	if plan == PlanPremium {
		subscription.Status = SubscriptionStatusTrial
		subscription.TrialStartDate = &now
		trialEnd := now.AddDate(0, 0, 30) // 30-day trial
		subscription.TrialEndDate = &trialEnd
		subscription.CurrentPeriodStart = &now
		subscription.CurrentPeriodEnd = &trialEnd
	} else {
		subscription.Status = SubscriptionStatusActive
	}

	return subscription
}

func NewPaymentMethod(userID uuid.UUID, stripePaymentMethodID, paymentType string, brand, last4 *string, expiryMonth, expiryYear *int) *PaymentMethod {
	return &PaymentMethod{
		ID:                    uuid.New(),
		UserID:                userID,
		StripePaymentMethodID: stripePaymentMethodID,
		Type:                  paymentType,
		Brand:                 brand,
		Last4:                 last4,
		ExpiryMonth:           expiryMonth,
		ExpiryYear:            expiryYear,
		IsDefault:             false,
		CreatedAt:             time.Now().UTC(),
		UpdatedAt:             time.Now().UTC(),
	}
}

func NewInvoice(userID, subscriptionID uuid.UUID, stripeInvoiceID string, amount float64, currency, status string, periodStart, periodEnd, dueDate time.Time) *Invoice {
	return &Invoice{
		ID:              uuid.New(),
		UserID:          userID,
		SubscriptionID:  subscriptionID,
		StripeInvoiceID: stripeInvoiceID,
		Amount:          amount,
		Currency:        currency,
		Status:          status,
		PeriodStart:     periodStart,
		PeriodEnd:       periodEnd,
		DueDate:         dueDate,
		CreatedAt:       time.Now().UTC(),
	}
}

func NewSubscriptionUsage(userID, subscriptionID uuid.UUID, periodStart, periodEnd time.Time) *SubscriptionUsage {
	return &SubscriptionUsage{
		ID:             uuid.New(),
		UserID:         userID,
		SubscriptionID: subscriptionID,
		PersonalGoals:  0,
		GroupGoals:     0,
		GroupsJoined:   0,
		APIRequests:    0,
		StorageUsed:    0,
		PeriodStart:    periodStart,
		PeriodEnd:      periodEnd,
		CreatedAt:      time.Now().UTC(),
	}
}

// Business logic methods
func (s *Subscription) IsActive() bool {
	return s.Status == SubscriptionStatusActive || s.Status == SubscriptionStatusTrial
}

func (s *Subscription) IsInTrial() bool {
	return s.Status == SubscriptionStatusTrial && s.TrialEndDate != nil && time.Now().UTC().Before(*s.TrialEndDate)
}

func (s *Subscription) IsPremium() bool {
	return s.Plan == PlanPremium && s.IsActive()
}

func (s *Subscription) DaysRemainingInTrial() *int {
	if !s.IsInTrial() {
		return nil
	}
	
	now := time.Now().UTC()
	days := int(s.TrialEndDate.Sub(now).Hours() / 24)
	if days < 0 {
		days = 0
	}
	return &days
}

func (s *Subscription) GetFeatures() SubscriptionFeatures {
	switch s.Plan {
	case PlanPremium:
		return SubscriptionFeatures{
			Plan:                PlanPremium,
			MaxPersonalGoals:    nil, // unlimited
			GroupGoalsAllowed:   true,
			AdvancedAnalytics:   true,
			PrioritySupport:     true,
			CustomCategories:    true,
			DataExport:          true,
			APIAccess:           true,
		}
	default: // PlanFree
		maxGoals := 3
		return SubscriptionFeatures{
			Plan:                PlanFree,
			MaxPersonalGoals:    &maxGoals,
			GroupGoalsAllowed:   false,
			AdvancedAnalytics:   false,
			PrioritySupport:     false,
			CustomCategories:    false,
			DataExport:          false,
			APIAccess:           false,
		}
	}
}

func (s *Subscription) CanCreatePersonalGoal(currentGoalCount int) bool {
	features := s.GetFeatures()
	if features.MaxPersonalGoals == nil {
		return true // unlimited
	}
	return currentGoalCount < *features.MaxPersonalGoals
}

func (s *Subscription) CanJoinGroups() bool {
	return s.GetFeatures().GroupGoalsAllowed
}

func (s *Subscription) HasAdvancedAnalytics() bool {
	return s.GetFeatures().AdvancedAnalytics
}

// Plan pricing constants (in cents)
const (
	PremiumMonthlyPrice = 999  // $9.99/month
	PremiumYearlyPrice  = 9999 // $99.99/year (2 months free)
)

// GetPlanPrice returns the price for a plan in cents
func GetPlanPrice(plan SubscriptionPlan, yearly bool) int {
	switch plan {
	case PlanPremium:
		if yearly {
			return PremiumYearlyPrice
		}
		return PremiumMonthlyPrice
	default:
		return 0
	}
}