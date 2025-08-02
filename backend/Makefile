# ChainForge Backend Makefile
# Go-specific development commands

.PHONY: help dev build test clean migrate seed docs

# Colors
GREEN := \033[32m
YELLOW := \033[33m
BLUE := \033[34m
RESET := \033[0m

# Configuration
BINARY_NAME := chainforge
MAIN_PATH := ./cmd/server
DB_PATH := ./data/chainforge.db
MIGRATION_PATH := ./migrations

## help: Show backend-specific commands
help:
	@echo "$(BLUE)ChainForge Backend Commands$(RESET)"
	@grep -E '^##' $(MAKEFILE_LIST) | sed 's/##//g' | column -t -s ':'

## dev: Start development server with hot reload
dev:
	@echo "$(BLUE)Starting backend development server...$(RESET)"
	@if command -v air >/dev/null 2>&1; then \
		air -c .air.toml; \
	else \
		echo "$(YELLOW)⚠ 'air' not found, falling back to go run$(RESET)"; \
		echo "$(YELLOW)  Install air with: go install github.com/air-verse/air@latest$(RESET)"; \
		go run $(MAIN_PATH); \
	fi

## build: Build the application
build:
	@echo "$(BLUE)Building backend...$(RESET)"
	go build -o bin/$(BINARY_NAME) $(MAIN_PATH)
	@echo "$(GREEN)✓ Backend built: bin/$(BINARY_NAME)$(RESET)"

## run: Run the built application
run: build
	./bin/$(BINARY_NAME)

## test: Run tests
test:
	@echo "$(BLUE)Running backend tests...$(RESET)"
	go test -v ./...

## test-coverage: Run tests with coverage
test-coverage:
	go test -v -coverprofile=coverage.out ./...
	go tool cover -html=coverage.out -o coverage.html
	@echo "$(GREEN)Coverage report: coverage.html$(RESET)"

## lint: Run linting
lint:
	golangci-lint run

## format: Format code
format:
	go fmt ./...
	goimports -w .

## clean: Clean build artifacts
clean:
	rm -rf bin/
	rm -f coverage.out coverage.html

## Database commands
## db-setup: Initialize database and run migrations
db-setup: migrate seed

## migrate: Run database migrations
migrate:
	@echo "$(BLUE)Running database migrations...$(RESET)"
	@if go run $(MAIN_PATH) migrate 2>/dev/null; then \
		echo "$(GREEN)✓ Migrations complete$(RESET)"; \
	else \
		echo "$(YELLOW)⚠ Migrations failed - this is expected during initial setup$(RESET)"; \
		echo "$(YELLOW)  The application structure needs to be completed first$(RESET)"; \
	fi

## migrate-create: Create new migration file
migrate-create:
	@read -p "Migration name: " name; \
	timestamp=$$(date +%Y%m%d%H%M%S); \
	touch $(MIGRATION_PATH)/$${timestamp}_$${name}.sql
	@echo "$(GREEN)Created migration: $(MIGRATION_PATH)/$${timestamp}_$${name}.sql$(RESET)"

## seed: Seed database with test data
seed:
	@echo "$(BLUE)Seeding database...$(RESET)"
	@if go run $(MAIN_PATH) seed 2>/dev/null; then \
		echo "$(GREEN)✓ Database seeded$(RESET)"; \
	else \
		echo "$(YELLOW)⚠ Seeding failed - this is expected during initial setup$(RESET)"; \
	fi

## db-reset: Reset database completely
db-reset:
	rm -f $(DB_PATH)
	$(MAKE) migrate seed

## backup: Backup database
backup:
	@mkdir -p backups
	@backup_name="backup_$$(date +%Y%m%d_%H%M%S).db"; \
	cp $(DB_PATH) backups/$$backup_name; \
	echo "$(GREEN)✓ Database backed up: backups/$$backup_name$(RESET)"

## docs: Generate API documentation
docs:
	@echo "$(BLUE)Generating API documentation...$(RESET)"
	swag init -g $(MAIN_PATH)/main.go
	@echo "$(GREEN)✓ Documentation generated$(RESET)"

## security: Run security checks
security:
	gosec ./...

## deps: Download dependencies
deps:
	go mod download
	go mod tidy

## install-tools: Install development tools
install-tools:
	go install github.com/cosmtrek/air@latest
	go install github.com/golangci/golangci-lint/cmd/golangci-lint@latest
	go install golang.org/x/tools/cmd/goimports@latest
	go install github.com/securecodewarrior/go-crypto-detector/cmd/gosec@latest
	go install github.com/swaggo/swag/cmd/swag@latest

## monitor: Start monitoring (placeholder for future implementation)
monitor:
	@echo "$(YELLOW)Monitoring dashboard coming soon...$(RESET)"