package main

import (
	"context"
	"database/sql"
	"fmt"
	"log"
	"net/http"
	"os"
	"os/signal"
	"strconv"
	"syscall"
	"time"

	"github.com/go-chi/chi/v5"
	"github.com/go-chi/chi/v5/middleware"
	"github.com/go-chi/cors"
	"github.com/joho/godotenv"
	_ "github.com/mattn/go-sqlite3"
	"golang.org/x/time/rate"

	"chainforge/internal/auth"
	"chainforge/internal/config"
	"chainforge/internal/database"
	"chainforge/internal/handlers"
	"chainforge/internal/services"
)

func main() {
	// Load environment variables
	if err := godotenv.Load(); err != nil {
		log.Printf("Warning: .env file not found: %v", err)
	}

	// Load configuration
	cfg, err := config.Load()
	if err != nil {
		log.Fatalf("Failed to load configuration: %v", err)
	}

	// Initialize database
	db, err := database.New(cfg.Database.URL, cfg.Database.EncryptionKey)
	if err != nil {
		log.Fatalf("Failed to initialize database: %v", err)
	}
	defer db.Close()

	// Run migrations if needed
	if err := database.RunMigrations(db); err != nil {
		log.Fatalf("Failed to run migrations: %v", err)
	}

	// Initialize authentication
	tokenManager := auth.NewTokenManager(
		cfg.Auth.JWTSecret,
		cfg.Auth.RefreshSecret,
		cfg.Auth.AccessTokenTTL,
		cfg.Auth.RefreshTokenTTL,
		cfg.Auth.Issuer,
	)
	tokenBlacklist := auth.NewTokenBlacklist()

	// Initialize services
	userService := services.NewUserService(db, tokenManager)
	goalService := services.NewGoalService(db)
	groupService := services.NewGroupService(db)
	subscriptionService := services.NewSubscriptionService(db, cfg.Stripe.SecretKey)

	// Initialize handlers
	authHandler := handlers.NewAuthHandler(userService, tokenManager, tokenBlacklist)
	userHandler := handlers.NewUserHandler(userService)
	goalHandler := handlers.NewGoalHandler(goalService, subscriptionService)
	groupHandler := handlers.NewGroupHandler(groupService, subscriptionService)
	subscriptionHandler := handlers.NewSubscriptionHandler(subscriptionService)

	// Create router
	r := chi.NewRouter()

	// Middleware
	r.Use(middleware.Logger)
	r.Use(middleware.Recoverer)
	r.Use(middleware.RequestID)
	r.Use(middleware.RealIP)
	r.Use(middleware.Heartbeat("/health"))

	// CORS configuration for mobile development
	r.Use(cors.Handler(cors.Options{
		AllowedOrigins:   cfg.Server.AllowedOrigins,
		AllowedMethods:   []string{"GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"},
		AllowedHeaders:   []string{"Accept", "Authorization", "Content-Type", "X-CSRF-Token"},
		ExposedHeaders:   []string{"Link"},
		AllowCredentials: true,
		MaxAge:           300,
	}))

	// Rate limiting
	limiter := rate.NewLimiter(rate.Limit(cfg.Server.RateLimit), cfg.Server.RateBurst)
	r.Use(func(next http.Handler) http.Handler {
		return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
			if !limiter.Allow() {
				http.Error(w, "Rate limit exceeded", http.StatusTooManyRequests)
				return
			}
			next.ServeHTTP(w, r)
		})
	})

	// Security headers
	r.Use(func(next http.Handler) http.Handler {
		return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
			w.Header().Set("X-Frame-Options", "DENY")
			w.Header().Set("X-Content-Type-Options", "nosniff")
			w.Header().Set("X-XSS-Protection", "1; mode=block")
			w.Header().Set("Referrer-Policy", "strict-origin-when-cross-origin")
			w.Header().Set("Content-Security-Policy", "default-src 'self'")
			next.ServeHTTP(w, r)
		})
	})

	// Auth middleware
	authMiddleware := handlers.NewAuthMiddleware(tokenManager, tokenBlacklist)

	// Public routes
	r.Route("/api/v1", func(r chi.Router) {
		// Health check
		r.Get("/health", func(w http.ResponseWriter, r *http.Request) {
			w.Header().Set("Content-Type", "application/json")
			w.WriteHeader(http.StatusOK)
			w.Write([]byte(`{"status":"healthy","timestamp":"` + time.Now().UTC().Format(time.RFC3339) + `"}`))
		})

		// Authentication routes
		r.Route("/auth", func(r chi.Router) {
			r.Post("/register", authHandler.Register)
			r.Post("/login", authHandler.Login)
			r.Post("/refresh", authHandler.RefreshToken)
			r.Post("/logout", authHandler.Logout)
			r.Post("/forgot-password", authHandler.ForgotPassword)
			r.Post("/reset-password", authHandler.ResetPassword)
			r.Post("/validate-password", authHandler.ValidatePassword)
		})

		// Stripe webhooks (public)
		r.Post("/webhooks/stripe", subscriptionHandler.HandleStripeWebhook)

		// Protected routes
		r.Group(func(r chi.Router) {
			r.Use(authMiddleware.RequireAuth)

			// User routes
			r.Route("/users", func(r chi.Router) {
				r.Get("/me", userHandler.GetCurrentUser)
				r.Put("/me", userHandler.UpdateCurrentUser)
				r.Delete("/me", userHandler.DeleteCurrentUser)
				r.Get("/me/stats", userHandler.GetUserStats)
				r.Post("/me/avatar", userHandler.UploadAvatar)
				r.Post("/me/change-password", userHandler.ChangePassword)
			})

			// Goal routes
			r.Route("/goals", func(r chi.Router) {
				r.Get("/", goalHandler.GetGoals)
				r.Post("/", goalHandler.CreateGoal)
				r.Get("/{goalID}", goalHandler.GetGoal)
				r.Put("/{goalID}", goalHandler.UpdateGoal)
				r.Delete("/{goalID}", goalHandler.DeleteGoal)
				r.Post("/{goalID}/progress", goalHandler.AddProgress)
				r.Get("/{goalID}/progress", goalHandler.GetProgress)
				r.Get("/{goalID}/analytics", goalHandler.GetAnalytics)
			})

			// Group routes
			r.Route("/groups", func(r chi.Router) {
				r.Get("/", groupHandler.GetGroups)
				r.Post("/", groupHandler.CreateGroup)
				r.Post("/join", groupHandler.JoinGroup)
				r.Get("/{groupID}", groupHandler.GetGroup)
				r.Put("/{groupID}", groupHandler.UpdateGroup)
				r.Delete("/{groupID}", groupHandler.DeleteGroup)
				r.Post("/{groupID}/leave", groupHandler.LeaveGroup)
				r.Get("/{groupID}/members", groupHandler.GetMembers)
				r.Put("/{groupID}/members/{userID}", groupHandler.UpdateMember)
				r.Delete("/{groupID}/members/{userID}", groupHandler.RemoveMember)

				// Group goals
				r.Route("/{groupID}/goals", func(r chi.Router) {
					r.Get("/", groupHandler.GetGroupGoals)
					r.Post("/", groupHandler.CreateGroupGoal)
					r.Get("/{goalID}", groupHandler.GetGroupGoal)
					r.Put("/{goalID}", groupHandler.UpdateGroupGoal)
					r.Delete("/{goalID}", groupHandler.DeleteGroupGoal)
					r.Post("/{goalID}/target", groupHandler.SetTarget)
					r.Post("/{goalID}/progress", groupHandler.AddGroupProgress)
					r.Get("/{goalID}/leaderboard", groupHandler.GetLeaderboard)
				})
			})

			// Subscription routes
			r.Route("/subscription", func(r chi.Router) {
				r.Get("/", subscriptionHandler.GetSubscription)
				r.Post("/", subscriptionHandler.CreateSubscription)
				r.Put("/", subscriptionHandler.UpdateSubscription)
				r.Delete("/", subscriptionHandler.CancelSubscription)
				r.Get("/features", subscriptionHandler.GetFeatures)
				r.Get("/usage", subscriptionHandler.GetUsage)
				r.Post("/billing-portal", subscriptionHandler.CreateBillingPortal)

				// Payment methods
				r.Route("/payment-methods", func(r chi.Router) {
					r.Get("/", subscriptionHandler.GetPaymentMethods)
					r.Post("/", subscriptionHandler.AddPaymentMethod)
					r.Delete("/{paymentMethodID}", subscriptionHandler.DeletePaymentMethod)
					r.Put("/{paymentMethodID}/default", subscriptionHandler.SetDefaultPaymentMethod)
				})

				// Invoices
				r.Get("/invoices", subscriptionHandler.GetInvoices)
			})

			// Analytics routes (premium feature)
			r.Route("/analytics", func(r chi.Router) {
				r.Use(authMiddleware.RequirePremium)
				r.Get("/overview", userHandler.GetAnalyticsOverview)
				r.Get("/goals", goalHandler.GetGoalsAnalytics)
				r.Get("/groups", groupHandler.GetGroupsAnalytics)
			})
		})
	})

	// Serve static files (for uploaded avatars, etc.)
	fileServer := http.FileServer(http.Dir("./static/"))
	r.Handle("/static/*", http.StripPrefix("/static", fileServer))

	// Create server
	srv := &http.Server{
		Addr:         ":" + strconv.Itoa(cfg.Server.Port),
		Handler:      r,
		ReadTimeout:  cfg.Server.ReadTimeout,
		WriteTimeout: cfg.Server.WriteTimeout,
		IdleTimeout:  cfg.Server.IdleTimeout,
	}

	// Start server in a goroutine
	go func() {
		log.Printf("🚀 ChainForge server starting on port %d", cfg.Server.Port)
		log.Printf("📱 Mobile access: http://0.0.0.0:%d", cfg.Server.Port)
		log.Printf("🔗 Health check: http://localhost:%d/api/v1/health", cfg.Server.Port)
		
		if err := srv.ListenAndServe(); err != nil && err != http.ErrServerClosed {
			log.Fatalf("Failed to start server: %v", err)
		}
	}()

	// Start background tasks
	go func() {
		ticker := time.NewTicker(24 * time.Hour)
		defer ticker.Stop()

		for {
			select {
			case <-ticker.C:
				// Clean up expired tokens from blacklist
				tokenBlacklist.Cleanup()
				log.Printf("Token blacklist cleanup completed. Active tokens: %d", tokenBlacklist.GetBlacklistedCount())

				// Clean up expired group goal periods and create new ones
				if err := groupService.ProcessPeriodTransitions(context.Background()); err != nil {
					log.Printf("Error processing period transitions: %v", err)
				}

				// Update subscription statuses
				if err := subscriptionService.UpdateSubscriptionStatuses(context.Background()); err != nil {
					log.Printf("Error updating subscription statuses: %v", err)
				}
			}
		}
	}()

	// Wait for interrupt signal to gracefully shutdown the server
	quit := make(chan os.Signal, 1)
	signal.Notify(quit, syscall.SIGINT, syscall.SIGTERM)
	<-quit

	log.Println("🛑 ChainForge server shutting down...")

	// Create a deadline for graceful shutdown
	ctx, cancel := context.WithTimeout(context.Background(), 30*time.Second)
	defer cancel()

	// Shutdown server gracefully
	if err := srv.Shutdown(ctx); err != nil {
		log.Fatalf("Server forced to shutdown: %v", err)
	}

	log.Println("✅ ChainForge server stopped gracefully")
}

// CLI commands for database operations
func init() {
	if len(os.Args) > 1 {
		switch os.Args[1] {
		case "migrate":
			runMigrations()
			os.Exit(0)
		case "seed":
			seedDatabase()
			os.Exit(0)
		case "generate-secret":
			generateSecret()
			os.Exit(0)
		}
	}
}

func runMigrations() {
	cfg, err := config.Load()
	if err != nil {
		log.Fatalf("Failed to load configuration: %v", err)
	}

	db, err := database.New(cfg.Database.URL, cfg.Database.EncryptionKey)
	if err != nil {
		log.Fatalf("Failed to connect to database: %v", err)
	}
	defer db.Close()

	if err := database.RunMigrations(db); err != nil {
		log.Fatalf("Failed to run migrations: %v", err)
	}

	log.Println("✅ Database migrations completed successfully")
}

func seedDatabase() {
	cfg, err := config.Load()
	if err != nil {
		log.Fatalf("Failed to load configuration: %v", err)
	}

	db, err := database.New(cfg.Database.URL, cfg.Database.EncryptionKey)
	if err != nil {
		log.Fatalf("Failed to connect to database: %v", err)
	}
	defer db.Close()

	if err := database.SeedDatabase(db); err != nil {
		log.Fatalf("Failed to seed database: %v", err)
	}

	log.Println("✅ Database seeded successfully")
}

func generateSecret() {
	secret, err := auth.GenerateSecretKey(32)
	if err != nil {
		log.Fatalf("Failed to generate secret: %v", err)
	}

	fmt.Printf("Generated secret key: %s\n", secret)
	fmt.Println("Add this to your .env file as JWT_SECRET or REFRESH_SECRET")
}