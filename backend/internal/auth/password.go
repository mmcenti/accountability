package auth

import (
	"crypto/rand"
	"encoding/base64"
	"fmt"
	"strings"
	"unicode"

	"golang.org/x/crypto/bcrypt"
)

const (
	// BcryptCost defines the cost parameter for bcrypt hashing
	// 12 provides a good balance between security and performance
	BcryptCost = 12

	// MinPasswordLength defines the minimum password length
	MinPasswordLength = 8

	// MaxPasswordLength defines the maximum password length
	MaxPasswordLength = 128
)

// PasswordStrength represents password strength levels
type PasswordStrength int

const (
	PasswordWeak PasswordStrength = iota
	PasswordMedium
	PasswordStrong
	PasswordVeryStrong
)

func (ps PasswordStrength) String() string {
	switch ps {
	case PasswordWeak:
		return "weak"
	case PasswordMedium:
		return "medium"
	case PasswordStrong:
		return "strong"
	case PasswordVeryStrong:
		return "very_strong"
	default:
		return "unknown"
	}
}

// PasswordValidationResult contains password validation information
type PasswordValidationResult struct {
	IsValid    bool             `json:"is_valid"`
	Strength   PasswordStrength `json:"strength"`
	Score      int              `json:"score"`
	Errors     []string         `json:"errors,omitempty"`
	Suggestions []string        `json:"suggestions,omitempty"`
}

// HashPassword hashes a password using bcrypt
func HashPassword(password string) (string, error) {
	if len(password) < MinPasswordLength {
		return "", fmt.Errorf("password must be at least %d characters long", MinPasswordLength)
	}

	if len(password) > MaxPasswordLength {
		return "", fmt.Errorf("password must be no more than %d characters long", MaxPasswordLength)
	}

	hashedBytes, err := bcrypt.GenerateFromPassword([]byte(password), BcryptCost)
	if err != nil {
		return "", fmt.Errorf("failed to hash password: %w", err)
	}

	return string(hashedBytes), nil
}

// VerifyPassword verifies a password against its hash
func VerifyPassword(password, hashedPassword string) error {
	return bcrypt.CompareHashAndPassword([]byte(hashedPassword), []byte(password))
}

// IsPasswordValid checks if a password meets basic requirements
func IsPasswordValid(password string) bool {
	return len(password) >= MinPasswordLength && len(password) <= MaxPasswordLength
}

// ValidatePassword performs comprehensive password validation
func ValidatePassword(password string) PasswordValidationResult {
	result := PasswordValidationResult{
		IsValid:     true,
		Errors:      []string{},
		Suggestions: []string{},
	}

	// Check length
	if len(password) < MinPasswordLength {
		result.IsValid = false
		result.Errors = append(result.Errors, fmt.Sprintf("Password must be at least %d characters long", MinPasswordLength))
		result.Suggestions = append(result.Suggestions, "Use a longer password with mixed characters")
	}

	if len(password) > MaxPasswordLength {
		result.IsValid = false
		result.Errors = append(result.Errors, fmt.Sprintf("Password must be no more than %d characters long", MaxPasswordLength))
		return result
	}

	// Calculate strength and score
	result.Strength, result.Score = calculatePasswordStrength(password)

	// Add suggestions based on strength
	if result.Strength == PasswordWeak {
		result.Suggestions = append(result.Suggestions, "Consider using a mix of uppercase, lowercase, numbers, and special characters")
	}

	if result.Strength <= PasswordMedium {
		result.Suggestions = append(result.Suggestions, "Consider making your password longer")
	}

	return result
}

// calculatePasswordStrength calculates password strength and returns a score
func calculatePasswordStrength(password string) (PasswordStrength, int) {
	score := 0
	
	// Length scoring
	length := len(password)
	if length >= 8 {
		score += 10
	}
	if length >= 12 {
		score += 10
	}
	if length >= 16 {
		score += 10
	}
	if length >= 20 {
		score += 10
	}

	// Character variety scoring
	hasLower := false
	hasUpper := false
	hasNumber := false
	hasSpecial := false
	
	for _, char := range password {
		switch {
		case unicode.IsLower(char):
			hasLower = true
		case unicode.IsUpper(char):
			hasUpper = true
		case unicode.IsDigit(char):
			hasNumber = true
		case unicode.IsPunct(char) || unicode.IsSymbol(char):
			hasSpecial = true
		}
	}

	// Award points for character variety
	if hasLower {
		score += 5
	}
	if hasUpper {
		score += 5
	}
	if hasNumber {
		score += 5
	}
	if hasSpecial {
		score += 10
	}

	// Bonus for having all character types
	if hasLower && hasUpper && hasNumber && hasSpecial {
		score += 10
	}

	// Penalty for common patterns
	if isCommonPattern(password) {
		score -= 20
	}

	// Ensure score is not negative
	if score < 0 {
		score = 0
	}

	// Determine strength based on score
	switch {
	case score >= 70:
		return PasswordVeryStrong, score
	case score >= 50:
		return PasswordStrong, score
	case score >= 30:
		return PasswordMedium, score
	default:
		return PasswordWeak, score
	}
}

// isCommonPattern checks for common weak patterns
func isCommonPattern(password string) bool {
	commonPatterns := []string{
		"password", "123456", "qwerty", "abc123", "password123",
		"admin", "letmein", "welcome", "monkey", "dragon",
		"111111", "123123", "1234567890", "qwertyuiop",
	}

	lowPassword := strings.ToLower(password)
	for _, pattern := range commonPatterns {
		if strings.Contains(lowPassword, pattern) {
			return true
		}
	}

	// Check for simple sequences
	if isSequence(password) {
		return true
	}

	// Check for repeated characters
	if hasRepeatedChars(password) {
		return true
	}

	return false
}

// isSequence checks if password contains simple sequences
func isSequence(password string) bool {
	sequences := []string{
		"abcdefghijklmnopqrstuvwxyz",
		"zyxwvutsrqponmlkjihgfedcba",
		"1234567890",
		"0987654321",
		"qwertyuiop",
		"poiuytrewq",
	}

	lowPassword := strings.ToLower(password)
	for _, seq := range sequences {
		for i := 0; i <= len(seq)-4; i++ {
			if strings.Contains(lowPassword, seq[i:i+4]) {
				return true
			}
		}
	}

	return false
}

// hasRepeatedChars checks if password has too many repeated characters
func hasRepeatedChars(password string) bool {
	if len(password) < 4 {
		return false
	}

	for i := 0; i <= len(password)-4; i++ {
		if password[i] == password[i+1] && password[i] == password[i+2] && password[i] == password[i+3] {
			return true
		}
	}

	return false
}

// GenerateSecurePassword generates a cryptographically secure random password
func GenerateSecurePassword(length int) (string, error) {
	if length < MinPasswordLength {
		length = MinPasswordLength
	}
	if length > MaxPasswordLength {
		length = MaxPasswordLength
	}

	// Character sets
	lowercase := "abcdefghijklmnopqrstuvwxyz"
	uppercase := "ABCDEFGHIJKLMNOPQRSTUVWXYZ"
	numbers := "0123456789"
	special := "!@#$%^&*()_+-=[]{}|;:,.<>?"
	
	// Combine all character sets
	allChars := lowercase + uppercase + numbers + special

	// Generate random password
	password := make([]byte, length)
	for i := range password {
		randomIndex, err := randomInt(len(allChars))
		if err != nil {
			return "", fmt.Errorf("failed to generate random password: %w", err)
		}
		password[i] = allChars[randomIndex]
	}

	// Ensure password contains at least one character from each set
	if length >= 4 {
		// Replace some characters to guarantee variety
		sets := []string{lowercase, uppercase, numbers, special}
		for i, set := range sets {
			if i < length {
				randomIndex, err := randomInt(len(set))
				if err != nil {
					return "", fmt.Errorf("failed to generate random password: %w", err)
				}
				password[i] = set[randomIndex]
			}
		}

		// Shuffle the password
		for i := range password {
			j, err := randomInt(len(password))
			if err != nil {
				return "", fmt.Errorf("failed to shuffle password: %w", err)
			}
			password[i], password[j] = password[j], password[i]
		}
	}

	return string(password), nil
}

// randomInt generates a cryptographically secure random integer
func randomInt(max int) (int, error) {
	if max <= 0 {
		return 0, fmt.Errorf("max must be positive")
	}

	// Calculate number of bytes needed
	bytes := make([]byte, 4)
	_, err := rand.Read(bytes)
	if err != nil {
		return 0, err
	}

	// Convert bytes to int and apply modulo
	num := int(bytes[0])<<24 | int(bytes[1])<<16 | int(bytes[2])<<8 | int(bytes[3])
	if num < 0 {
		num = -num
	}

	return num % max, nil
}

// GenerateSecretKey generates a cryptographically secure secret key
func GenerateSecretKey(length int) (string, error) {
	if length <= 0 {
		length = 32 // Default to 32 bytes (256 bits)
	}

	bytes := make([]byte, length)
	_, err := rand.Read(bytes)
	if err != nil {
		return "", fmt.Errorf("failed to generate secret key: %w", err)
	}

	return base64.URLEncoding.EncodeToString(bytes), nil
}

