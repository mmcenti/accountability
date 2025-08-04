package services

import (
	"database/sql"
	"chainforge/internal/auth"
)

// UserService handles user-related business logic
type UserService struct {
	db *sql.DB
}

// NewUserService creates a new user service
func NewUserService(db *sql.DB, tokenManager *auth.TokenManager) *UserService {
	return &UserService{
		db: db,
	}
}

// GoalService handles goal-related business logic
type GoalService struct {
	db *sql.DB
}

// NewGoalService creates a new goal service
func NewGoalService(db *sql.DB) *GoalService {
	return &GoalService{
		db: db,
	}
}

// GroupService handles group-related business logic
type GroupService struct {
	db *sql.DB
}

// NewGroupService creates a new group service
func NewGroupService(db *sql.DB) *GroupService {
	return &GroupService{
		db: db,
	}
}

// SubscriptionService handles subscription-related business logic
type SubscriptionService struct {
	db *sql.DB
	stripeSecretKey string
}

// NewSubscriptionService creates a new subscription service
func NewSubscriptionService(db *sql.DB, stripeSecretKey string) *SubscriptionService {
	return &SubscriptionService{
		db: db,
		stripeSecretKey: stripeSecretKey,
	}
}