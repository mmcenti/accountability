package auth

import (
	"crypto/rand"
	"encoding/hex"
	"fmt"
	"time"

	"github.com/golang-jwt/jwt/v5"
	"github.com/google/uuid"
)

// TokenType represents the type of JWT token
type TokenType string

const (
	AccessToken  TokenType = "access"
	RefreshToken TokenType = "refresh"
)

// Claims represents the JWT claims
type Claims struct {
	UserID    uuid.UUID `json:"user_id"`
	Email     string    `json:"email"`
	TokenType TokenType `json:"token_type"`
	jwt.RegisteredClaims
}

// TokenPair represents an access and refresh token pair
type TokenPair struct {
	AccessToken  string `json:"access_token"`
	RefreshToken string `json:"refresh_token"`
	ExpiresIn    int64  `json:"expires_in"`
	TokenType    string `json:"token_type"`
}

// TokenManager handles JWT token operations
type TokenManager struct {
	accessSecret  []byte
	refreshSecret []byte
	accessTTL     time.Duration
	refreshTTL    time.Duration
	issuer        string
}

// NewTokenManager creates a new token manager
func NewTokenManager(accessSecret, refreshSecret string, accessTTL, refreshTTL time.Duration, issuer string) *TokenManager {
	return &TokenManager{
		accessSecret:  []byte(accessSecret),
		refreshSecret: []byte(refreshSecret),
		accessTTL:     accessTTL,
		refreshTTL:    refreshTTL,
		issuer:        issuer,
	}
}

// GenerateTokenPair generates both access and refresh tokens
func (tm *TokenManager) GenerateTokenPair(userID uuid.UUID, email string) (*TokenPair, error) {
	// Generate access token
	accessToken, err := tm.generateToken(userID, email, AccessToken, tm.accessSecret, tm.accessTTL)
	if err != nil {
		return nil, fmt.Errorf("failed to generate access token: %w", err)
	}

	// Generate refresh token
	refreshToken, err := tm.generateToken(userID, email, RefreshToken, tm.refreshSecret, tm.refreshTTL)
	if err != nil {
		return nil, fmt.Errorf("failed to generate refresh token: %w", err)
	}

	return &TokenPair{
		AccessToken:  accessToken,
		RefreshToken: refreshToken,
		ExpiresIn:    int64(tm.accessTTL.Seconds()),
		TokenType:    "Bearer",
	}, nil
}

// generateToken creates a JWT token with the specified parameters
func (tm *TokenManager) generateToken(userID uuid.UUID, email string, tokenType TokenType, secret []byte, ttl time.Duration) (string, error) {
	now := time.Now().UTC()
	jti, err := generateJTI()
	if err != nil {
		return "", fmt.Errorf("failed to generate JTI: %w", err)
	}

	claims := Claims{
		UserID:    userID,
		Email:     email,
		TokenType: tokenType,
		RegisteredClaims: jwt.RegisteredClaims{
			Issuer:    tm.issuer,
			Subject:   userID.String(),
			Audience:  []string{"chainforge"},
			ExpiresAt: jwt.NewNumericDate(now.Add(ttl)),
			NotBefore: jwt.NewNumericDate(now),
			IssuedAt:  jwt.NewNumericDate(now),
			ID:        jti,
		},
	}

	token := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)
	tokenString, err := token.SignedString(secret)
	if err != nil {
		return "", fmt.Errorf("failed to sign token: %w", err)
	}

	return tokenString, nil
}

// ValidateAccessToken validates an access token and returns the claims
func (tm *TokenManager) ValidateAccessToken(tokenString string) (*Claims, error) {
	return tm.validateToken(tokenString, AccessToken, tm.accessSecret)
}

// ValidateRefreshToken validates a refresh token and returns the claims
func (tm *TokenManager) ValidateRefreshToken(tokenString string) (*Claims, error) {
	return tm.validateToken(tokenString, RefreshToken, tm.refreshSecret)
}

// validateToken validates a JWT token with the specified parameters
func (tm *TokenManager) validateToken(tokenString string, expectedType TokenType, secret []byte) (*Claims, error) {
	token, err := jwt.ParseWithClaims(tokenString, &Claims{}, func(token *jwt.Token) (interface{}, error) {
		// Validate signing method
		if _, ok := token.Method.(*jwt.SigningMethodHMAC); !ok {
			return nil, fmt.Errorf("unexpected signing method: %v", token.Header["alg"])
		}
		return secret, nil
	})

	if err != nil {
		return nil, fmt.Errorf("failed to parse token: %w", err)
	}

	claims, ok := token.Claims.(*Claims)
	if !ok || !token.Valid {
		return nil, fmt.Errorf("invalid token claims")
	}

	// Validate token type
	if claims.TokenType != expectedType {
		return nil, fmt.Errorf("invalid token type: expected %s, got %s", expectedType, claims.TokenType)
	}

	// Validate issuer
	if claims.Issuer != tm.issuer {
		return nil, fmt.Errorf("invalid issuer: expected %s, got %s", tm.issuer, claims.Issuer)
	}

	// Validate audience
	if len(claims.Audience) > 0 && claims.Audience[0] != "chainforge" {
		return nil, fmt.Errorf("invalid audience")
	}

	return claims, nil
}

// RefreshTokens validates a refresh token and generates a new token pair
func (tm *TokenManager) RefreshTokens(refreshTokenString string) (*TokenPair, error) {
	// Validate refresh token
	claims, err := tm.ValidateRefreshToken(refreshTokenString)
	if err != nil {
		return nil, fmt.Errorf("invalid refresh token: %w", err)
	}

	// Generate new token pair
	return tm.GenerateTokenPair(claims.UserID, claims.Email)
}

// ExtractUserID extracts user ID from access token without full validation
func (tm *TokenManager) ExtractUserID(tokenString string) (uuid.UUID, error) {
	token, _, err := new(jwt.Parser).ParseUnverified(tokenString, &Claims{})
	if err != nil {
		return uuid.Nil, fmt.Errorf("failed to parse token: %w", err)
	}

	claims, ok := token.Claims.(*Claims)
	if !ok {
		return uuid.Nil, fmt.Errorf("invalid token claims")
	}

	return claims.UserID, nil
}

// IsTokenExpired checks if a token is expired without validating signature
func (tm *TokenManager) IsTokenExpired(tokenString string) bool {
	token, _, err := new(jwt.Parser).ParseUnverified(tokenString, &Claims{})
	if err != nil {
		return true
	}

	claims, ok := token.Claims.(*Claims)
	if !ok {
		return true
	}

	return time.Now().UTC().After(claims.ExpiresAt.Time)
}

// generateJTI generates a unique JWT ID
func generateJTI() (string, error) {
	bytes := make([]byte, 16)
	if _, err := rand.Read(bytes); err != nil {
		return "", err
	}
	return hex.EncodeToString(bytes), nil
}

// TokenBlacklist represents a simple in-memory token blacklist
// In production, this should be replaced with Redis or database storage
type TokenBlacklist struct {
	tokens map[string]time.Time // token_id -> expiry_time
}

// NewTokenBlacklist creates a new token blacklist
func NewTokenBlacklist() *TokenBlacklist {
	return &TokenBlacklist{
		tokens: make(map[string]time.Time),
	}
}

// Add adds a token to the blacklist
func (tb *TokenBlacklist) Add(jti string, expiryTime time.Time) {
	tb.tokens[jti] = expiryTime
}

// IsBlacklisted checks if a token is blacklisted
func (tb *TokenBlacklist) IsBlacklisted(jti string) bool {
	expiryTime, exists := tb.tokens[jti]
	if !exists {
		return false
	}

	// If token has expired, remove it from blacklist
	if time.Now().UTC().After(expiryTime) {
		delete(tb.tokens, jti)
		return false
	}

	return true
}

// Cleanup removes expired tokens from the blacklist
func (tb *TokenBlacklist) Cleanup() {
	now := time.Now().UTC()
	for jti, expiryTime := range tb.tokens {
		if now.After(expiryTime) {
			delete(tb.tokens, jti)
		}
	}
}

// GetBlacklistedCount returns the number of blacklisted tokens
func (tb *TokenBlacklist) GetBlacklistedCount() int {
	return len(tb.tokens)
}