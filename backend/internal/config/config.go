package config

import (
	"fmt"
	"os"
	"strconv"
	"strings"
	"time"
)

// Config holds all configuration for the application
type Config struct {
	Server   ServerConfig   `json:"server"`
	Database DatabaseConfig `json:"database"`
	Auth     AuthConfig     `json:"auth"`
	Stripe   StripeConfig   `json:"stripe"`
	Email    EmailConfig    `json:"email"`
	Storage  StorageConfig  `json:"storage"`
}

// ServerConfig holds server-related configuration
type ServerConfig struct {
	Port           int           `json:"port"`
	Host           string        `json:"host"`
	Environment    string        `json:"environment"`
	AllowedOrigins []string      `json:"allowed_origins"`
	ReadTimeout    time.Duration `json:"read_timeout"`
	WriteTimeout   time.Duration `json:"write_timeout"`
	IdleTimeout    time.Duration `json:"idle_timeout"`
	RateLimit      float64       `json:"rate_limit"`
	RateBurst      int           `json:"rate_burst"`
}

// DatabaseConfig holds database-related configuration
type DatabaseConfig struct {
	URL           string `json:"url"`
	EncryptionKey string `json:"encryption_key"`
	MaxOpenConns  int    `json:"max_open_conns"`
	MaxIdleConns  int    `json:"max_idle_conns"`
	ConnMaxLife   time.Duration `json:"conn_max_life"`
}

// AuthConfig holds authentication-related configuration
type AuthConfig struct {
	JWTSecret        string        `json:"jwt_secret"`
	RefreshSecret    string        `json:"refresh_secret"`
	AccessTokenTTL   time.Duration `json:"access_token_ttl"`
	RefreshTokenTTL  time.Duration `json:"refresh_token_ttl"`
	Issuer           string        `json:"issuer"`
	PasswordResetTTL time.Duration `json:"password_reset_ttl"`
}

// StripeConfig holds Stripe-related configuration
type StripeConfig struct {
	SecretKey      string `json:"secret_key"`
	PublishableKey string `json:"publishable_key"`
	WebhookSecret  string `json:"webhook_secret"`
	PriceIDMonthly string `json:"price_id_monthly"`
	PriceIDYearly  string `json:"price_id_yearly"`
}

// EmailConfig holds email-related configuration
type EmailConfig struct {
	Provider     string `json:"provider"`
	APIKey       string `json:"api_key"`
	FromEmail    string `json:"from_email"`
	FromName     string `json:"from_name"`
	ReplyToEmail string `json:"reply_to_email"`
}

// StorageConfig holds file storage configuration
type StorageConfig struct {
	Provider        string `json:"provider"`
	LocalPath       string `json:"local_path"`
	MaxFileSize     int64  `json:"max_file_size"`
	AllowedMimeTypes []string `json:"allowed_mime_types"`
	AWSS3Config     *AWSS3Config `json:"aws_s3,omitempty"`
}

// AWSS3Config holds AWS S3 configuration
type AWSS3Config struct {
	Region          string `json:"region"`
	Bucket          string `json:"bucket"`
	AccessKeyID     string `json:"access_key_id"`
	SecretAccessKey string `json:"secret_access_key"`
	CloudFrontURL   string `json:"cloudfront_url"`
}

// Load loads configuration from environment variables
func Load() (*Config, error) {
	cfg := &Config{}

	// Server configuration
	cfg.Server = ServerConfig{
		Port:        getEnvInt("PORT", 8080),
		Host:        getEnv("HOST", "0.0.0.0"),
		Environment: getEnv("ENVIRONMENT", "development"),
		AllowedOrigins: getEnvStringSlice("ALLOWED_ORIGINS", []string{
			"http://localhost:5173",
			"http://localhost:3000",
			"http://0.0.0.0:5173",
			"http://127.0.0.1:5173",
		}),
		ReadTimeout:  getEnvDuration("READ_TIMEOUT", 15*time.Second),
		WriteTimeout: getEnvDuration("WRITE_TIMEOUT", 15*time.Second),
		IdleTimeout:  getEnvDuration("IDLE_TIMEOUT", 60*time.Second),
		RateLimit:    getEnvFloat("RATE_LIMIT", 100.0),
		RateBurst:    getEnvInt("RATE_BURST", 20),
	}

	// Database configuration
	cfg.Database = DatabaseConfig{
		URL:           getEnv("DATABASE_URL", "./data/chainforge.db"),
		EncryptionKey: getEnvRequired("DB_ENCRYPTION_KEY"),
		MaxOpenConns:  getEnvInt("DB_MAX_OPEN_CONNS", 25),
		MaxIdleConns:  getEnvInt("DB_MAX_IDLE_CONNS", 5),
		ConnMaxLife:   getEnvDuration("DB_CONN_MAX_LIFE", 5*time.Minute),
	}

	// Auth configuration
	cfg.Auth = AuthConfig{
		JWTSecret:        getEnvRequired("JWT_SECRET"),
		RefreshSecret:    getEnvRequired("REFRESH_SECRET"),
		AccessTokenTTL:   getEnvDuration("ACCESS_TOKEN_TTL", 15*time.Minute),
		RefreshTokenTTL:  getEnvDuration("REFRESH_TOKEN_TTL", 7*24*time.Hour),
		Issuer:           getEnv("JWT_ISSUER", "chainforge"),
		PasswordResetTTL: getEnvDuration("PASSWORD_RESET_TTL", 1*time.Hour),
	}

	// Stripe configuration
	cfg.Stripe = StripeConfig{
		SecretKey:      getEnv("STRIPE_SECRET_KEY", ""),
		PublishableKey: getEnv("STRIPE_PUBLISHABLE_KEY", ""),
		WebhookSecret:  getEnv("STRIPE_WEBHOOK_SECRET", ""),
		PriceIDMonthly: getEnv("STRIPE_PRICE_ID_MONTHLY", ""),
		PriceIDYearly:  getEnv("STRIPE_PRICE_ID_YEARLY", ""),
	}

	// Email configuration
	cfg.Email = EmailConfig{
		Provider:     getEnv("EMAIL_PROVIDER", "console"),
		APIKey:       getEnv("EMAIL_API_KEY", ""),
		FromEmail:    getEnv("EMAIL_FROM", "noreply@chainforge.app"),
		FromName:     getEnv("EMAIL_FROM_NAME", "ChainForge"),
		ReplyToEmail: getEnv("EMAIL_REPLY_TO", "support@chainforge.app"),
	}

	// Storage configuration
	cfg.Storage = StorageConfig{
		Provider:    getEnv("STORAGE_PROVIDER", "local"),
		LocalPath:   getEnv("STORAGE_LOCAL_PATH", "./static/uploads"),
		MaxFileSize: getEnvInt64("STORAGE_MAX_FILE_SIZE", 5*1024*1024), // 5MB
		AllowedMimeTypes: getEnvStringSlice("STORAGE_ALLOWED_MIME_TYPES", []string{
			"image/jpeg",
			"image/png",
			"image/gif",
			"image/webp",
		}),
	}

	// AWS S3 configuration (if using S3)
	if cfg.Storage.Provider == "s3" {
		cfg.Storage.AWSS3Config = &AWSS3Config{
			Region:          getEnvRequired("AWS_REGION"),
			Bucket:          getEnvRequired("AWS_S3_BUCKET"),
			AccessKeyID:     getEnvRequired("AWS_ACCESS_KEY_ID"),
			SecretAccessKey: getEnvRequired("AWS_SECRET_ACCESS_KEY"),
			CloudFrontURL:   getEnv("AWS_CLOUDFRONT_URL", ""),
		}
	}

	// Validate configuration
	if err := cfg.Validate(); err != nil {
		return nil, fmt.Errorf("configuration validation failed: %w", err)
	}

	return cfg, nil
}

// Validate validates the configuration
func (c *Config) Validate() error {
	// Validate required fields
	if c.Database.EncryptionKey == "" {
		return fmt.Errorf("DB_ENCRYPTION_KEY is required")
	}
	if c.Auth.JWTSecret == "" {
		return fmt.Errorf("JWT_SECRET is required")
	}
	if c.Auth.RefreshSecret == "" {
		return fmt.Errorf("REFRESH_SECRET is required")
	}

	// Validate environment
	validEnvs := []string{"development", "staging", "production"}
	if !contains(validEnvs, c.Server.Environment) {
		return fmt.Errorf("invalid environment: %s (must be one of: %s)", 
			c.Server.Environment, strings.Join(validEnvs, ", "))
	}

	// Validate port
	if c.Server.Port < 1 || c.Server.Port > 65535 {
		return fmt.Errorf("invalid port: %d (must be between 1 and 65535)", c.Server.Port)
	}

	// Validate storage provider
	validProviders := []string{"local", "s3"}
	if !contains(validProviders, c.Storage.Provider) {
		return fmt.Errorf("invalid storage provider: %s (must be one of: %s)", 
			c.Storage.Provider, strings.Join(validProviders, ", "))
	}

	// Validate Stripe configuration for production
	if c.Server.Environment == "production" {
		if c.Stripe.SecretKey == "" {
			return fmt.Errorf("STRIPE_SECRET_KEY is required in production")
		}
		if c.Stripe.WebhookSecret == "" {
			return fmt.Errorf("STRIPE_WEBHOOK_SECRET is required in production")
		}
	}

	return nil
}

// IsDevelopment returns true if running in development mode
func (c *Config) IsDevelopment() bool {
	return c.Server.Environment == "development"
}

// IsProduction returns true if running in production mode
func (c *Config) IsProduction() bool {
	return c.Server.Environment == "production"
}

// IsStaging returns true if running in staging mode
func (c *Config) IsStaging() bool {
	return c.Server.Environment == "staging"
}

// Helper functions for environment variable parsing

func getEnv(key, defaultValue string) string {
	if value := os.Getenv(key); value != "" {
		return value
	}
	return defaultValue
}

func getEnvRequired(key string) string {
	value := os.Getenv(key)
	if value == "" {
		panic(fmt.Sprintf("required environment variable %s is not set", key))
	}
	return value
}

func getEnvInt(key string, defaultValue int) int {
	if value := os.Getenv(key); value != "" {
		if intValue, err := strconv.Atoi(value); err == nil {
			return intValue
		}
	}
	return defaultValue
}

func getEnvInt64(key string, defaultValue int64) int64 {
	if value := os.Getenv(key); value != "" {
		if intValue, err := strconv.ParseInt(value, 10, 64); err == nil {
			return intValue
		}
	}
	return defaultValue
}

func getEnvFloat(key string, defaultValue float64) float64 {
	if value := os.Getenv(key); value != "" {
		if floatValue, err := strconv.ParseFloat(value, 64); err == nil {
			return floatValue
		}
	}
	return defaultValue
}

func getEnvBool(key string, defaultValue bool) bool {
	if value := os.Getenv(key); value != "" {
		if boolValue, err := strconv.ParseBool(value); err == nil {
			return boolValue
		}
	}
	return defaultValue
}

func getEnvDuration(key string, defaultValue time.Duration) time.Duration {
	if value := os.Getenv(key); value != "" {
		if duration, err := time.ParseDuration(value); err == nil {
			return duration
		}
	}
	return defaultValue
}

func getEnvStringSlice(key string, defaultValue []string) []string {
	if value := os.Getenv(key); value != "" {
		return strings.Split(value, ",")
	}
	return defaultValue
}

func contains(slice []string, item string) bool {
	for _, s := range slice {
		if s == item {
			return true
		}
	}
	return false
}