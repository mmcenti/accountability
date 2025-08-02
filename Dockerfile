# ChainForge Multi-stage Dockerfile
# Build both backend and frontend for production deployment

# Stage 1: Build frontend
FROM node:20-alpine AS frontend-builder

WORKDIR /app/frontend

# Copy package files
COPY frontend/package*.json ./
RUN npm ci --only=production

# Copy frontend source
COPY frontend/ ./

# Build frontend
RUN npm run build

# Stage 2: Build backend
FROM golang:1.24-alpine AS backend-builder

# Install build dependencies
RUN apk add --no-cache gcc musl-dev sqlite-dev

WORKDIR /app/backend

# Copy go mod files
COPY backend/go.mod backend/go.sum ./
RUN go mod download

# Copy backend source
COPY backend/ ./

# Build backend binary
RUN CGO_ENABLED=1 GOOS=linux GOARCH=amd64 go build \
    -ldflags="-w -s -extldflags '-static'" \
    -a -installsuffix cgo \
    -o bin/chainforge \
    ./cmd/server

# Stage 3: Final production image
FROM alpine:3.19

# Install runtime dependencies
RUN apk add --no-cache \
    ca-certificates \
    tzdata \
    sqlite \
    && addgroup -g 1001 -S chainforge \
    && adduser -S -D -H -u 1001 -h /app -s /sbin/nologin -G chainforge -g chainforge chainforge

WORKDIR /app

# Copy backend binary
COPY --from=backend-builder --chown=chainforge:chainforge /app/backend/bin/chainforge ./

# Copy frontend build
COPY --from=frontend-builder --chown=chainforge:chainforge /app/frontend/build ./static

# Copy backend assets
COPY --from=backend-builder --chown=chainforge:chainforge /app/backend/migrations ./migrations

# Create necessary directories
RUN mkdir -p ./data ./static/uploads ./logs \
    && chown -R chainforge:chainforge ./data ./static ./logs

# Create non-root user
USER chainforge

# Expose port
EXPOSE 8080

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
    CMD wget --no-verbose --tries=1 --spider http://localhost:8080/api/v1/health || exit 1

# Set environment variables
ENV ENVIRONMENT=production \
    PORT=8080 \
    HOST=0.0.0.0 \
    DATABASE_URL=./data/chainforge.db

# Run the application
CMD ["./chainforge"]