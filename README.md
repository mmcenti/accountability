# ChainForge 🔗⚒️

A modern, mobile-first goal tracking application that combines personal goal management with innovative group accountability features.

## 🚀 Quick Start

```bash
# Clone and setup
git clone <repository-url>
cd chainforge

# Start development environment
make dev

# Or with Docker
make docker-dev
```

## 🎯 Key Features

- **Personal Goal Tracking**: Set and track individual goals with progress visualization
- **Group Accountability**: Join groups with shared goals and penalty carry-over system
- **Mobile-First Design**: Optimized for touch interactions and mobile usage
- **Freemium Model**: 30-day trial, then premium features for group goals
- **Real-Time Updates**: Live progress tracking and group leaderboards

## 🏗️ Architecture

### Backend (Go + Chi)
- RESTful API with JWT authentication
- SQLite database with encryption
- Stripe payment integration
- Rate limiting and security

### Frontend (Svelte + TypeScript)
- Mobile-first responsive design
- Tailwind CSS for styling
- Touch gestures and animations
- Offline-capable PWA

## 📱 Mobile Optimizations

- Bottom navigation for easy thumb access
- Swipe gestures for quick actions
- Touch-optimized buttons and forms
- Network-aware development server
- iOS/Android compatibility testing

## 🛠️ Development

```bash
# Available commands
make help              # Show all available commands
make install           # Install dependencies
make dev               # Start development servers
make test              # Run all tests
make build             # Build for production
make deploy            # Deploy to Fly.io
```

## 🏢 Business Model

- **Free Tier**: Personal goals only
- **Premium Tier** ($9.99/month): Group goals, advanced analytics, unlimited goals
- **30-Day Free Trial**: Full access to all features

## 🔐 Security

- JWT-based authentication with refresh tokens
- Database encryption
- Rate limiting
- Audit logging
- Data privacy compliance

## 📊 Unique Features

### Penalty Carry-Over System
When you miss your weekly target in a group goal, the deficit gets added to next week's requirement, creating real accountability pressure.

### Group Accountability
Join groups where everyone works toward shared objectives. See real-time progress of group members and compete on leaderboards.

## 🚀 Deployment

Designed for Fly.io deployment with Docker containerization and automated CI/CD pipeline.

## 📱 Supported Platforms

- iOS Safari
- Android Chrome
- Desktop browsers (responsive design)
- PWA installation support

---

Built with ❤️ for people who want to achieve their goals through accountability and community.
