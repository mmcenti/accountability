package database

import (
	"database/sql"
	"fmt"

	_ "github.com/mattn/go-sqlite3"
)

// New creates a new database connection
func New(databaseURL, encryptionKey string) (*sql.DB, error) {
	// For SQLite, the URL is typically just the file path
	db, err := sql.Open("sqlite3", databaseURL)
	if err != nil {
		return nil, fmt.Errorf("failed to open database: %w", err)
	}

	// Test the connection
	if err := db.Ping(); err != nil {
		return nil, fmt.Errorf("failed to ping database: %w", err)
	}

	return db, nil
}

// RunMigrations runs database migrations
func RunMigrations(db *sql.DB) error {
	// TODO: Implement migration logic based on migration files
	// For now, create basic tables
	migrations := []string{
		`CREATE TABLE IF NOT EXISTS users (
			id INTEGER PRIMARY KEY AUTOINCREMENT,
			email TEXT UNIQUE NOT NULL,
			password_hash TEXT NOT NULL,
			name TEXT NOT NULL,
			created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
			updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
		)`,
		`CREATE TABLE IF NOT EXISTS goals (
			id INTEGER PRIMARY KEY AUTOINCREMENT,
			user_id INTEGER NOT NULL,
			title TEXT NOT NULL,
			description TEXT,
			target_date DATE,
			completed BOOLEAN DEFAULT FALSE,
			created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
			updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
			FOREIGN KEY (user_id) REFERENCES users (id)
		)`,
		`CREATE TABLE IF NOT EXISTS groups (
			id INTEGER PRIMARY KEY AUTOINCREMENT,
			name TEXT NOT NULL,
			description TEXT,
			created_by INTEGER NOT NULL,
			created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
			updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
			FOREIGN KEY (created_by) REFERENCES users (id)
		)`,
		`CREATE TABLE IF NOT EXISTS subscriptions (
			id INTEGER PRIMARY KEY AUTOINCREMENT,
			user_id INTEGER NOT NULL,
			stripe_subscription_id TEXT,
			status TEXT NOT NULL,
			created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
			updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
			FOREIGN KEY (user_id) REFERENCES users (id)
		)`,
	}

	for _, migration := range migrations {
		if _, err := db.Exec(migration); err != nil {
			return fmt.Errorf("failed to run migration: %w", err)
		}
	}

	return nil
}

// SeedDatabase seeds the database with initial data
func SeedDatabase(db *sql.DB) error {
	// TODO: Add seed data if needed
	return nil
}