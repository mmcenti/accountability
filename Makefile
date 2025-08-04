# ChainForge Development Makefile
# Comprehensive automation for Go + Svelte full-stack development

.PHONY: help install dev build test clean deploy docker-build docker-dev docker-stop
.DEFAULT_GOAL := help

# Colors for output
RED    := \033[31m
GREEN  := \033[32m
YELLOW := \033[33m
BLUE   := \033[34m
RESET  := \033[0m

# Project configuration
PROJECT_NAME := chainforge
BACKEND_DIR := backend
FRONTEND_DIR := frontend
DOCKER_IMAGE := $(PROJECT_NAME)
GO_VERSION := 1.24
NODE_VERSION := 20

## Help: Show this help message
help:
	@echo "$(BLUE)ChainForge Development Commands$(RESET)"
	@echo ""
	@grep -E '^##' $(MAKEFILE_LIST) | sed 's/##//g' | column -t -s ':'

## Setup Commands
## install: Install all dependencies (Go modules + NPM packages)
install:
	@echo "$(YELLOW)Installing Go dependencies...$(RESET)"
	cd $(BACKEND_DIR) && go mod download && go mod tidy
	@echo "$(YELLOW)Installing Node.js dependencies...$(RESET)"
	cd $(FRONTEND_DIR) && npm ci || (echo "$(YELLOW)npm ci failed, trying npm install...$(RESET)" && npm install)
	@echo "$(GREEN)✓ All dependencies installed$(RESET)"

## setup: Complete project setup (install + database + env)
setup: install db-setup env-setup
	@echo "$(GREEN)✓ Project setup complete!$(RESET)"

## env-setup: Create environment files from templates
env-setup:
	@if [ ! -f $(BACKEND_DIR)/.env ]; then \
		cp $(BACKEND_DIR)/.env.example $(BACKEND_DIR)/.env; \
		echo "$(YELLOW)Created backend/.env from template$(RESET)"; \
	fi
	@if [ ! -f $(FRONTEND_DIR)/.env ]; then \
		cp $(FRONTEND_DIR)/.env.example $(FRONTEND_DIR)/.env; \
		echo "$(YELLOW)Created frontend/.env from template$(RESET)"; \
	fi

## Development Commands
## dev: Start both backend and frontend in development mode
dev:
	@echo "$(BLUE)Starting ChainForge development servers...$(RESET)"
	@trap 'kill 0' SIGINT; \
	(cd $(BACKEND_DIR) && make dev) & \
	(cd $(FRONTEND_DIR) && npm run dev -- --host 0.0.0.0) & \
	wait

## dev-backend: Start only the backend server
dev-backend:
	cd $(BACKEND_DIR) && make dev

## dev-frontend: Start only the frontend server
dev-frontend:
	cd $(FRONTEND_DIR) && npm run dev -- --host 0.0.0.0

## hot-reload: Start with hot reload for both backend and frontend
hot-reload:
	@echo "$(BLUE)Starting with hot reload...$(RESET)"
	@trap 'kill 0' SIGINT; \
	(cd $(BACKEND_DIR) && air) & \
	(cd $(FRONTEND_DIR) && npm run dev) & \
	wait

## mobile-dev: Start development server accessible from mobile devices
mobile-dev:
	@echo "$(BLUE)Starting mobile-accessible development servers...$(RESET)"
	@echo "$(YELLOW)Backend will be available at: http://0.0.0.0:8080$(RESET)"
	@echo "$(YELLOW)Frontend will be available at: http://0.0.0.0:5173$(RESET)"
	@trap 'kill 0' SIGINT; \
	(cd $(BACKEND_DIR) && HOST=0.0.0.0 make dev) & \
	(cd $(FRONTEND_DIR) && npm run dev -- --host 0.0.0.0) & \
	wait

## Database Commands
## db-setup: Initialize database and run migrations
db-setup:
	cd $(BACKEND_DIR) && make db-setup

## db-migrate: Run database migrations
db-migrate:
	cd $(BACKEND_DIR) && make migrate

## db-seed: Seed database with test data
db-seed:
	cd $(BACKEND_DIR) && make seed

## db-reset: Reset database (drop, create, migrate, seed)
db-reset:
	cd $(BACKEND_DIR) && make db-reset

## db-backup: Backup database
db-backup:
	cd $(BACKEND_DIR) && make backup

## Testing Commands
## test: Run all tests (backend + frontend)
test:
	@echo "$(BLUE)Running all tests...$(RESET)"
	cd $(BACKEND_DIR) && make test
	cd $(FRONTEND_DIR) && npm run test

## test-backend: Run backend tests only
test-backend:
	cd $(BACKEND_DIR) && make test

## test-frontend: Run frontend tests only
test-frontend:
	cd $(FRONTEND_DIR) && npm run test

## test-e2e: Run end-to-end tests
test-e2e:
	cd $(FRONTEND_DIR) && npm run test:e2e

## test-coverage: Generate test coverage reports
test-coverage:
	cd $(BACKEND_DIR) && make test-coverage
	cd $(FRONTEND_DIR) && npm run test:coverage

## lint: Run linters for both backend and frontend
lint:
	cd $(BACKEND_DIR) && make lint
	cd $(FRONTEND_DIR) && npm run lint

## format: Format code (gofmt + prettier)
format:
	cd $(BACKEND_DIR) && make format
	cd $(FRONTEND_DIR) && npm run format

## Build Commands
## build: Build production version of both backend and frontend
build:
	@echo "$(BLUE)Building production version...$(RESET)"
	cd $(FRONTEND_DIR) && npm run build
	cd $(BACKEND_DIR) && make build
	@echo "$(GREEN)✓ Production build complete$(RESET)"

## build-backend: Build backend only
build-backend:
	cd $(BACKEND_DIR) && make build

## build-frontend: Build frontend only
build-frontend:
	cd $(FRONTEND_DIR) && npm run build

## Docker Commands
## docker-build: Build Docker image
docker-build:
	@echo "$(BLUE)Building Docker image...$(RESET)"
	docker build -t $(DOCKER_IMAGE):latest .
	@echo "$(GREEN)✓ Docker image built: $(DOCKER_IMAGE):latest$(RESET)"

## docker-dev: Start development environment with Docker Compose
docker-dev:
	@echo "$(BLUE)Starting Docker development environment...$(RESET)"
	docker-compose -f docker-compose.dev.yml up --build

## docker-prod: Start production environment with Docker Compose
docker-prod:
	docker-compose -f docker-compose.prod.yml up -d

## docker-stop: Stop all Docker containers
docker-stop:
	docker-compose -f docker-compose.dev.yml down
	docker-compose -f docker-compose.prod.yml down

## docker-clean: Clean Docker containers and images
docker-clean:
	docker-compose down --volumes --remove-orphans
	docker system prune -f

## Deployment Commands
## deploy: Deploy to Fly.io
deploy:
	@echo "$(BLUE)Deploying to Fly.io...$(RESET)"
	fly deploy
	@echo "$(GREEN)✓ Deployment complete$(RESET)"

## deploy-staging: Deploy to staging environment
deploy-staging:
	fly deploy --config fly.staging.toml

## fly-setup: Initialize Fly.io configuration
fly-setup:
	fly launch --no-deploy
	fly secrets set JWT_SECRET=$$(openssl rand -base64 32)
	fly secrets set DB_ENCRYPTION_KEY=$$(openssl rand -base64 32)

## logs: View production logs
logs:
	fly logs

## status: Check deployment status
status:
	fly status

## Maintenance Commands
## clean: Clean build artifacts and dependencies
clean:
	@echo "$(YELLOW)Cleaning build artifacts...$(RESET)"
	cd $(BACKEND_DIR) && make clean
	cd $(FRONTEND_DIR) && npm run clean
	rm -rf dist/
	@echo "$(GREEN)✓ Clean complete$(RESET)"

## deps-update: Update all dependencies
deps-update:
	cd $(BACKEND_DIR) && go get -u ./... && go mod tidy
	cd $(FRONTEND_DIR) && npm update

## security-audit: Run security audits
security-audit:
	cd $(BACKEND_DIR) && go list -json -m all | nancy sleuth
	cd $(FRONTEND_DIR) && npm audit

## backup: Create backup of database and critical files
backup:
	mkdir -p backups/$(shell date +%Y%m%d_%H%M%S)
	cd $(BACKEND_DIR) && make backup
	cp -r $(FRONTEND_DIR)/static backups/$(shell date +%Y%m%d_%H%M%S)/

## monitor: Start monitoring dashboard
monitor:
	@echo "$(BLUE)Starting monitoring dashboard...$(RESET)"
	cd $(BACKEND_DIR) && make monitor

## Mobile Testing Commands
## mobile-test: Test mobile compatibility
mobile-test:
	@echo "$(BLUE)Testing mobile compatibility...$(RESET)"
	cd $(FRONTEND_DIR) && npm run test:mobile

## ios-test: Test iOS Safari compatibility
ios-test:
	cd $(FRONTEND_DIR) && npm run test:ios

## android-test: Test Android Chrome compatibility
android-test:
	cd $(FRONTEND_DIR) && npm run test:android

## Performance Commands
## perf-test: Run performance tests
perf-test:
	cd $(FRONTEND_DIR) && npm run test:perf

## lighthouse: Run Lighthouse audit
lighthouse:
	cd $(FRONTEND_DIR) && npm run lighthouse

## Utility Commands
## check-deps: Check for outdated dependencies
check-deps:
	cd $(BACKEND_DIR) && go list -u -m all
	cd $(FRONTEND_DIR) && npm outdated

## version: Show version information
version:
	@echo "$(BLUE)ChainForge Version Information$(RESET)"
	@echo "Go version: $(shell go version)"
	@echo "Node version: $(shell node --version)"
	@echo "Docker version: $(shell docker --version 2>/dev/null || echo 'Not installed')"
	@echo "Fly CLI version: $(shell fly version 2>/dev/null || echo 'Not installed')"

## docs: Generate and serve documentation
docs:
	cd $(BACKEND_DIR) && make docs
	cd $(FRONTEND_DIR) && npm run docs

## all: Run complete CI pipeline (install, lint, test, build)
all: install lint test build
	@echo "$(GREEN)✓ Complete CI pipeline finished successfully$(RESET)"