package models

import (
	"time"

	"github.com/google/uuid"
)

// GoalStatus represents the status of a goal
type GoalStatus string

const (
	GoalStatusActive     GoalStatus = "active"
	GoalStatusInProgress GoalStatus = "in_progress"
	GoalStatusCompleted  GoalStatus = "completed"
	GoalStatusCanceled   GoalStatus = "canceled"
)

// GoalCategory represents the category of a goal
type GoalCategory string

const (
	CategoryFitness     GoalCategory = "fitness"
	CategoryHealth      GoalCategory = "health"
	CategoryEducation   GoalCategory = "education"
	CategoryCareer      GoalCategory = "career"
	CategoryFinance     GoalCategory = "finance"
	CategoryHobbies     GoalCategory = "hobbies"
	CategoryRelationship GoalCategory = "relationship"
	CategoryPersonal    GoalCategory = "personal"
	CategoryOther       GoalCategory = "other"
)

// Goal represents a personal goal
type Goal struct {
	ID            uuid.UUID    `json:"id" db:"id"`
	UserID        uuid.UUID    `json:"user_id" db:"user_id"`
	Name          string       `json:"name" db:"name"`
	Description   *string      `json:"description" db:"description"`
	TargetAmount  float64      `json:"target_amount" db:"target_amount"`
	CurrentAmount float64      `json:"current_amount" db:"current_amount"`
	Unit          string       `json:"unit" db:"unit"`
	Category      GoalCategory `json:"category" db:"category"`
	Status        GoalStatus   `json:"status" db:"status"`
	StartDate     time.Time    `json:"start_date" db:"start_date"`
	EndDate       *time.Time   `json:"end_date" db:"end_date"`
	Punishment    *string      `json:"punishment" db:"punishment"`
	IsPublic      bool         `json:"is_public" db:"is_public"`
	CreatedAt     time.Time    `json:"created_at" db:"created_at"`
	UpdatedAt     time.Time    `json:"updated_at" db:"updated_at"`
}

// GoalProgress represents daily progress entries for a goal
type GoalProgress struct {
	ID        uuid.UUID `json:"id" db:"id"`
	GoalID    uuid.UUID `json:"goal_id" db:"goal_id"`
	Amount    float64   `json:"amount" db:"amount"`
	Note      *string   `json:"note" db:"note"`
	Date      time.Time `json:"date" db:"date"`
	CreatedAt time.Time `json:"created_at" db:"created_at"`
}

// GoalWithProgress represents a goal with its recent progress
type GoalWithProgress struct {
	Goal              Goal           `json:"goal"`
	RecentProgress    []GoalProgress `json:"recent_progress"`
	ProgressPercentage float64       `json:"progress_percentage"`
	DaysRemaining     *int           `json:"days_remaining"`
	AverageDaily      float64        `json:"average_daily"`
	RequiredDaily     float64        `json:"required_daily"`
}

// CreateGoalRequest represents the request to create a new goal
type CreateGoalRequest struct {
	Name         string       `json:"name" validate:"required,min=1,max=100"`
	Description  *string      `json:"description,omitempty" validate:"omitempty,max=500"`
	TargetAmount float64      `json:"target_amount" validate:"required,gt=0"`
	Unit         string       `json:"unit" validate:"required,min=1,max=20"`
	Category     GoalCategory `json:"category" validate:"required"`
	StartDate    time.Time    `json:"start_date" validate:"required"`
	EndDate      *time.Time   `json:"end_date,omitempty"`
	Punishment   *string      `json:"punishment,omitempty" validate:"omitempty,max=200"`
	IsPublic     bool         `json:"is_public"`
}

// UpdateGoalRequest represents the request to update a goal
type UpdateGoalRequest struct {
	Name        *string      `json:"name,omitempty" validate:"omitempty,min=1,max=100"`
	Description *string      `json:"description,omitempty" validate:"omitempty,max=500"`
	Unit        *string      `json:"unit,omitempty" validate:"omitempty,min=1,max=20"`
	Category    *GoalCategory `json:"category,omitempty"`
	EndDate     *time.Time   `json:"end_date,omitempty"`
	Punishment  *string      `json:"punishment,omitempty" validate:"omitempty,max=200"`
	IsPublic    *bool        `json:"is_public,omitempty"`
	Status      *GoalStatus  `json:"status,omitempty"`
}

// AddProgressRequest represents the request to add progress to a goal
type AddProgressRequest struct {
	Amount float64  `json:"amount" validate:"required,gte=0"`
	Note   *string  `json:"note,omitempty" validate:"omitempty,max=200"`
	Date   *time.Time `json:"date,omitempty"`
}

// GoalAnalytics represents analytics data for a goal
type GoalAnalytics struct {
	GoalID               uuid.UUID       `json:"goal_id"`
	TotalProgress        float64         `json:"total_progress"`
	ProgressPercentage   float64         `json:"progress_percentage"`
	DaysActive           int             `json:"days_active"`
	DaysRemaining        *int            `json:"days_remaining"`
	AverageDaily         float64         `json:"average_daily"`
	RequiredDaily        float64         `json:"required_daily"`
	BestDay              *time.Time      `json:"best_day"`
	BestDayAmount        float64         `json:"best_day_amount"`
	ConsistencyScore     float64         `json:"consistency_score"`
	ProjectedCompletion  *time.Time      `json:"projected_completion"`
	WeeklyProgress       []WeeklyStats   `json:"weekly_progress"`
	MonthlyProgress      []MonthlyStats  `json:"monthly_progress"`
}

// WeeklyStats represents weekly statistics
type WeeklyStats struct {
	Week      string  `json:"week"`
	Amount    float64 `json:"amount"`
	DaysActive int    `json:"days_active"`
}

// MonthlyStats represents monthly statistics
type MonthlyStats struct {
	Month     string  `json:"month"`
	Amount    float64 `json:"amount"`
	DaysActive int    `json:"days_active"`
}

// NewGoal creates a new goal
func NewGoal(userID uuid.UUID, req CreateGoalRequest) *Goal {
	return &Goal{
		ID:            uuid.New(),
		UserID:        userID,
		Name:          req.Name,
		Description:   req.Description,
		TargetAmount:  req.TargetAmount,
		CurrentAmount: 0,
		Unit:          req.Unit,
		Category:      req.Category,
		Status:        GoalStatusActive,
		StartDate:     req.StartDate,
		EndDate:       req.EndDate,
		Punishment:    req.Punishment,
		IsPublic:      req.IsPublic,
		CreatedAt:     time.Now().UTC(),
		UpdatedAt:     time.Now().UTC(),
	}
}

// NewGoalProgress creates a new progress entry
func NewGoalProgress(goalID uuid.UUID, amount float64, note *string, date *time.Time) *GoalProgress {
	progressDate := time.Now().UTC()
	if date != nil {
		progressDate = *date
	}

	return &GoalProgress{
		ID:        uuid.New(),
		GoalID:    goalID,
		Amount:    amount,
		Note:      note,
		Date:      progressDate,
		CreatedAt: time.Now().UTC(),
	}
}

// CalculateProgressPercentage calculates the progress percentage
func (g *Goal) CalculateProgressPercentage() float64 {
	if g.TargetAmount <= 0 {
		return 0
	}
	percentage := (g.CurrentAmount / g.TargetAmount) * 100
	if percentage > 100 {
		return 100
	}
	return percentage
}

// IsCompleted checks if the goal is completed
func (g *Goal) IsCompleted() bool {
	return g.CurrentAmount >= g.TargetAmount || g.Status == GoalStatusCompleted
}

// DaysRemaining calculates days remaining until end date
func (g *Goal) DaysRemaining() *int {
	if g.EndDate == nil {
		return nil
	}
	
	now := time.Now().UTC()
	if g.EndDate.Before(now) {
		return nil
	}
	
	days := int(g.EndDate.Sub(now).Hours() / 24)
	return &days
}

// RequiredDailyProgress calculates required daily progress to meet goal
func (g *Goal) RequiredDailyProgress() float64 {
	remaining := g.TargetAmount - g.CurrentAmount
	if remaining <= 0 {
		return 0
	}
	
	daysLeft := g.DaysRemaining()
	if daysLeft == nil || *daysLeft <= 0 {
		return remaining // All remaining progress needed immediately
	}
	
	return remaining / float64(*daysLeft)
}

// IsValid validates the goal data
func (g *Goal) IsValid() bool {
	return g.Name != "" && g.TargetAmount > 0 && g.Unit != ""
}