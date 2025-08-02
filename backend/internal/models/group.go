package models

import (
	"crypto/rand"
	"encoding/hex"
	"time"

	"github.com/google/uuid"
)

// GroupStatus represents the status of a group
type GroupStatus string

const (
	GroupStatusActive   GroupStatus = "active"
	GroupStatusInactive GroupStatus = "inactive"
	GroupStatusArchived GroupStatus = "archived"
)

// MemberRole represents the role of a member in a group
type MemberRole string

const (
	RoleOwner  MemberRole = "owner"
	RoleAdmin  MemberRole = "admin"
	RoleMember MemberRole = "member"
)

// Group represents an accountability group
type Group struct {
	ID          uuid.UUID   `json:"id" db:"id"`
	Name        string      `json:"name" db:"name"`
	Description *string     `json:"description" db:"description"`
	InviteCode  string      `json:"invite_code" db:"invite_code"`
	MaxMembers  int         `json:"max_members" db:"max_members"`
	IsPrivate   bool        `json:"is_private" db:"is_private"`
	Status      GroupStatus `json:"status" db:"status"`
	CreatedBy   uuid.UUID   `json:"created_by" db:"created_by"`
	CreatedAt   time.Time   `json:"created_at" db:"created_at"`
	UpdatedAt   time.Time   `json:"updated_at" db:"updated_at"`
}

// GroupMember represents a member of a group
type GroupMember struct {
	ID        uuid.UUID  `json:"id" db:"id"`
	GroupID   uuid.UUID  `json:"group_id" db:"group_id"`
	UserID    uuid.UUID  `json:"user_id" db:"user_id"`
	Role      MemberRole `json:"role" db:"role"`
	JoinedAt  time.Time  `json:"joined_at" db:"joined_at"`
	IsActive  bool       `json:"is_active" db:"is_active"`
	CreatedAt time.Time  `json:"created_at" db:"created_at"`
	UpdatedAt time.Time  `json:"updated_at" db:"updated_at"`
}

// GroupGoal represents a shared goal for a group
type GroupGoal struct {
	ID           uuid.UUID `json:"id" db:"id"`
	GroupID      uuid.UUID `json:"group_id" db:"group_id"`
	Name         string    `json:"name" db:"name"`
	Description  *string   `json:"description" db:"description"`
	Unit         string    `json:"unit" db:"unit"`
	PeriodType   string    `json:"period_type" db:"period_type"` // "weekly", "monthly"
	IsActive     bool      `json:"is_active" db:"is_active"`
	CreatedBy    uuid.UUID `json:"created_by" db:"created_by"`
	CreatedAt    time.Time `json:"created_at" db:"created_at"`
	UpdatedAt    time.Time `json:"updated_at" db:"updated_at"`
}

// GroupGoalPeriod represents a period (usually weekly) for a group goal
type GroupGoalPeriod struct {
	ID         uuid.UUID `json:"id" db:"id"`
	GroupGoalID uuid.UUID `json:"group_goal_id" db:"group_goal_id"`
	StartDate  time.Time `json:"start_date" db:"start_date"`
	EndDate    time.Time `json:"end_date" db:"end_date"`
	IsActive   bool      `json:"is_active" db:"is_active"`
	CreatedAt  time.Time `json:"created_at" db:"created_at"`
}

// GroupGoalProgress represents individual progress within a group goal period
type GroupGoalProgress struct {
	ID               uuid.UUID `json:"id" db:"id"`
	GroupGoalPeriodID uuid.UUID `json:"group_goal_period_id" db:"group_goal_period_id"`
	UserID           uuid.UUID `json:"user_id" db:"user_id"`
	TargetAmount     float64   `json:"target_amount" db:"target_amount"`
	CurrentAmount    float64   `json:"current_amount" db:"current_amount"`
	PenaltyCarryOver float64   `json:"penalty_carry_over" db:"penalty_carry_over"`
	DailyEntries     string    `json:"daily_entries" db:"daily_entries"` // JSON array of daily progress
	IsCompleted      bool      `json:"is_completed" db:"is_completed"`
	CreatedAt        time.Time `json:"created_at" db:"created_at"`
	UpdatedAt        time.Time `json:"updated_at" db:"updated_at"`
}

// DailyEntry represents a single day's progress entry
type DailyEntry struct {
	Date   time.Time `json:"date"`
	Amount float64   `json:"amount"`
	Note   *string   `json:"note,omitempty"`
}

// GroupWithMembers represents a group with its members
type GroupWithMembers struct {
	Group       Group                `json:"group"`
	Members     []GroupMemberProfile `json:"members"`
	MemberCount int                  `json:"member_count"`
	UserRole    MemberRole           `json:"user_role"`
}

// GroupMemberProfile represents a group member with user profile
type GroupMemberProfile struct {
	GroupMember GroupMember `json:"group_member"`
	User        UserProfile `json:"user"`
}

// GroupGoalWithProgress represents a group goal with current period progress
type GroupGoalWithProgress struct {
	GroupGoal       GroupGoal               `json:"group_goal"`
	CurrentPeriod   *GroupGoalPeriod        `json:"current_period"`
	MemberProgress  []MemberProgressSummary `json:"member_progress"`
	TotalProgress   float64                 `json:"total_progress"`
	AverageProgress float64                 `json:"average_progress"`
	CompletionRate  float64                 `json:"completion_rate"`
}

// MemberProgressSummary represents a member's progress summary
type MemberProgressSummary struct {
	UserID            uuid.UUID   `json:"user_id"`
	User              UserProfile `json:"user"`
	TargetAmount      float64     `json:"target_amount"`
	CurrentAmount     float64     `json:"current_amount"`
	PenaltyCarryOver  float64     `json:"penalty_carry_over"`
	ProgressPercentage float64    `json:"progress_percentage"`
	IsCompleted       bool        `json:"is_completed"`
	DaysActive        int         `json:"days_active"`
	LastActivity      *time.Time  `json:"last_activity"`
}

// Leaderboard represents group leaderboard data
type Leaderboard struct {
	GroupID     uuid.UUID          `json:"group_id"`
	PeriodID    uuid.UUID          `json:"period_id"`
	Rankings    []LeaderboardEntry `json:"rankings"`
	UpdatedAt   time.Time          `json:"updated_at"`
}

// LeaderboardEntry represents a single entry in the leaderboard
type LeaderboardEntry struct {
	Rank              int         `json:"rank"`
	UserID            uuid.UUID   `json:"user_id"`
	User              UserProfile `json:"user"`
	CurrentAmount     float64     `json:"current_amount"`
	TargetAmount      float64     `json:"target_amount"`
	ProgressPercentage float64    `json:"progress_percentage"`
	PenaltyCarryOver  float64     `json:"penalty_carry_over"`
	IsCompleted       bool        `json:"is_completed"`
	Points            int         `json:"points"`
}

// Request/Response models
type CreateGroupRequest struct {
	Name        string  `json:"name" validate:"required,min=1,max=100"`
	Description *string `json:"description,omitempty" validate:"omitempty,max=500"`
	MaxMembers  int     `json:"max_members" validate:"required,min=2,max=100"`
	IsPrivate   bool    `json:"is_private"`
}

type UpdateGroupRequest struct {
	Name        *string `json:"name,omitempty" validate:"omitempty,min=1,max=100"`
	Description *string `json:"description,omitempty" validate:"omitempty,max=500"`
	MaxMembers  *int    `json:"max_members,omitempty" validate:"omitempty,min=2,max=100"`
	IsPrivate   *bool   `json:"is_private,omitempty"`
}

type JoinGroupRequest struct {
	InviteCode string `json:"invite_code" validate:"required,len=8"`
}

type CreateGroupGoalRequest struct {
	Name        string  `json:"name" validate:"required,min=1,max=100"`
	Description *string `json:"description,omitempty" validate:"omitempty,max=500"`
	Unit        string  `json:"unit" validate:"required,min=1,max=20"`
	PeriodType  string  `json:"period_type" validate:"required,oneof=weekly monthly"`
}

type UpdateGroupGoalRequest struct {
	Name        *string `json:"name,omitempty" validate:"omitempty,min=1,max=100"`
	Description *string `json:"description,omitempty" validate:"omitempty,max=500"`
	Unit        *string `json:"unit,omitempty" validate:"omitempty,min=1,max=20"`
	IsActive    *bool   `json:"is_active,omitempty"`
}

type SetTargetRequest struct {
	TargetAmount float64 `json:"target_amount" validate:"required,gt=0"`
}

type AddGroupProgressRequest struct {
	Amount float64   `json:"amount" validate:"required,gte=0"`
	Note   *string   `json:"note,omitempty" validate:"omitempty,max=200"`
	Date   *time.Time `json:"date,omitempty"`
}

// Constructor functions
func NewGroup(name string, description *string, maxMembers int, isPrivate bool, createdBy uuid.UUID) *Group {
	return &Group{
		ID:          uuid.New(),
		Name:        name,
		Description: description,
		InviteCode:  generateInviteCode(),
		MaxMembers:  maxMembers,
		IsPrivate:   isPrivate,
		Status:      GroupStatusActive,
		CreatedBy:   createdBy,
		CreatedAt:   time.Now().UTC(),
		UpdatedAt:   time.Now().UTC(),
	}
}

func NewGroupMember(groupID, userID uuid.UUID, role MemberRole) *GroupMember {
	return &GroupMember{
		ID:        uuid.New(),
		GroupID:   groupID,
		UserID:    userID,
		Role:      role,
		JoinedAt:  time.Now().UTC(),
		IsActive:  true,
		CreatedAt: time.Now().UTC(),
		UpdatedAt: time.Now().UTC(),
	}
}

func NewGroupGoal(groupID uuid.UUID, name, unit, periodType string, description *string, createdBy uuid.UUID) *GroupGoal {
	return &GroupGoal{
		ID:          uuid.New(),
		GroupID:     groupID,
		Name:        name,
		Description: description,
		Unit:        unit,
		PeriodType:  periodType,
		IsActive:    true,
		CreatedBy:   createdBy,
		CreatedAt:   time.Now().UTC(),
		UpdatedAt:   time.Now().UTC(),
	}
}

func NewGroupGoalPeriod(groupGoalID uuid.UUID, startDate, endDate time.Time) *GroupGoalPeriod {
	return &GroupGoalPeriod{
		ID:          uuid.New(),
		GroupGoalID: groupGoalID,
		StartDate:   startDate,
		EndDate:     endDate,
		IsActive:    true,
		CreatedAt:   time.Now().UTC(),
	}
}

func NewGroupGoalProgress(periodID, userID uuid.UUID, targetAmount, penaltyCarryOver float64) *GroupGoalProgress {
	return &GroupGoalProgress{
		ID:               uuid.New(),
		GroupGoalPeriodID: periodID,
		UserID:           userID,
		TargetAmount:     targetAmount + penaltyCarryOver, // Add penalty to target
		CurrentAmount:    0,
		PenaltyCarryOver: penaltyCarryOver,
		DailyEntries:     "[]", // Empty JSON array
		IsCompleted:      false,
		CreatedAt:        time.Now().UTC(),
		UpdatedAt:        time.Now().UTC(),
	}
}

// Utility functions
func generateInviteCode() string {
	bytes := make([]byte, 4)
	rand.Read(bytes)
	return hex.EncodeToString(bytes)
}

// CalculateProgressPercentage calculates progress percentage
func (gp *GroupGoalProgress) CalculateProgressPercentage() float64 {
	if gp.TargetAmount <= 0 {
		return 0
	}
	percentage := (gp.CurrentAmount / gp.TargetAmount) * 100
	if percentage > 100 {
		return 100
	}
	return percentage
}

// CalculatePenaltyCarryOver calculates penalty to carry over to next period
func (gp *GroupGoalProgress) CalculatePenaltyCarryOver() float64 {
	deficit := gp.TargetAmount - gp.CurrentAmount
	if deficit <= 0 {
		return 0
	}
	return deficit
}

// IsOwner checks if user is group owner
func (gm *GroupMember) IsOwner() bool {
	return gm.Role == RoleOwner
}

// IsAdmin checks if user is group admin or owner
func (gm *GroupMember) IsAdmin() bool {
	return gm.Role == RoleAdmin || gm.Role == RoleOwner
}

// CanManageGroup checks if user can manage group settings
func (gm *GroupMember) CanManageGroup() bool {
	return gm.IsAdmin()
}

// CanManageMembers checks if user can manage group members
func (gm *GroupMember) CanManageMembers() bool {
	return gm.IsAdmin()
}