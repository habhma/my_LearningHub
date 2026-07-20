# Student Assessment Platform - Complete Setup Guide

**Generated:** 2026-07-19  
**Version:** 1.0.0

---

## 📋 Table of Contents

1. [Prerequisites](#prerequisites)
2. [Project Overview](#project-overview)
3. [Installation Steps](#installation-steps)
4. [Environment Configuration](#environment-configuration)
5. [Database Setup](#database-setup)
6. [Running the Application](#running-the-application)
7. [Verification & Testing](#verification--testing)
8. [Troubleshooting](#troubleshooting)
9. [Next Steps](#next-steps)

---

## Prerequisites

### Required Software

| Software | Version | Purpose | Download Link |
|----------|---------|---------|---------------|
| **Node.js** | ≥18.0.0 | Runtime environment | [nodejs.org](https://nodejs.org/) |
| **npm** | ≥9.0.0 | Package manager | Included with Node.js |
| **PostgreSQL** | ≥14.0 | Database | [postgresql.org](https://www.postgresql.org/download/) |
| **Git** | Latest | Version control | [git-scm.com](https://git-scm.com/) |

### Optional Tools

- **pgAdmin** - PostgreSQL GUI management tool
- **Postman** - API testing
- **VS Code** - Recommended code editor with extensions:
  - ESLint
  - Prettier
  - Prisma
  - Tailwind CSS IntelliSense

### System Requirements

- **OS:** Windows 10/11, macOS, or Linux
- **RAM:** Minimum 4GB (8GB recommended)
- **Disk Space:** 2GB free space
- **Internet:** Required for initial setup

---

## Project Overview

### Architecture

```
Student Assessment Platform
├── Frontend (React + TypeScript + Vite)
│   ├── Port: 3000
│   ├── Framework: React 18.3
│   ├── Styling: Tailwind CSS
│   └── State: Zustand + React Query
│
└── Backend (Node.js + Express + TypeScript)
    ├── Port: 5000
    ├── Framework: Express 4.19
    ├── ORM: Prisma
    └── Database: PostgreSQL
```

### Tech Stack Summary

**Frontend:**
- React 18.3 with TypeScript
- Vite for build tooling
- Tailwind CSS for styling
- Zustand for state management
- React Query for server state
- React Hook Form + Zod for forms/validation
- Axios for API calls

**Backend:**
- Node.js + Express with TypeScript
- Prisma ORM
- PostgreSQL database
- JWT authentication
- bcrypt for password hashing
- Express Validator for validation
- Winston for logging

---

## Installation Steps

### Step 1: Verify Prerequisites

Open terminal/command prompt and verify installations:

```bash
# Check Node.js version
node --version
# Should output: v18.x.x or higher

# Check npm version
npm --version
# Should output: 9.x.x or higher

# Check PostgreSQL
psql --version
# Should output: psql (PostgreSQL) 14.x or higher

# Check Git
git --version
# Should output: git version 2.x.x
```

### Step 2: Install Backend Dependencies

```bash
# Navigate to backend directory
cd backend

# Install all dependencies
npm install

# Expected time: 2-5 minutes
# Expected size: ~200MB node_modules
```

**Verify backend installation:**

```bash
# List installed packages
npm list --depth=0

# Should show 24 dependencies and 16 devDependencies
```

### Step 3: Install Frontend Dependencies

```bash
# Navigate to frontend directory (from root)
cd ../frontend

# Install all dependencies
npm install

# Expected time: 3-7 minutes
# Expected size: ~400MB node_modules
```

**Verify frontend installation:**

```bash
# List installed packages
npm list --depth=0

# Should show 25+ dependencies
```

---

## Environment Configuration

### Backend Environment Variables

1. **Create `.env` file in backend directory:**

```bash
cd backend
```

2. **Add the following configuration:**

```env
# Server Configuration
NODE_ENV=development
PORT=5000
HOST=localhost

# Database Configuration
DATABASE_URL="postgresql://postgres:your_password@localhost:5432/student_assessment_db"

# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key-min-32-characters
JWT_REFRESH_SECRET=your-super-secret-refresh-key-min-32-characters
JWT_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=7d

# CORS Configuration
CORS_ORIGIN=http://localhost:3000

# Redis Configuration (Optional - for caching)
REDIS_URL=redis://localhost:6379
REDIS_ENABLED=false

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100

# Logging
LOG_LEVEL=debug
LOG_FILE_PATH=./logs

# API Configuration
API_PREFIX=/api/v1

# Email Configuration (Optional - for password reset)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
EMAIL_FROM=noreply@studentassessment.com
```

**Important Security Notes:**
- Generate strong JWT secrets (32+ characters)
- Never commit `.env` to version control
- Use `.env.example` as template

**Generate Strong Secrets:**

```bash
# On Linux/Mac - generate random secret
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"

# On Windows PowerShell
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

### Frontend Environment Variables

1. **Create `.env` file in frontend directory:**

```bash
cd ../frontend
```

2. **Add the following configuration:**

```env
# API Configuration
VITE_API_BASE_URL=http://localhost:5000/api/v1

# App Configuration
VITE_APP_NAME=Student Assessment Platform
VITE_APP_VERSION=1.0.0

# Environment
VITE_NODE_ENV=development

# Feature Flags (Optional)
VITE_ENABLE_ANALYTICS=false
VITE_ENABLE_DEBUG=true
```

---

## Database Setup

### Step 1: Install PostgreSQL

**Windows:**
1. Download PostgreSQL installer from [postgresql.org](https://www.postgresql.org/download/windows/)
2. Run installer and follow prompts
3. Remember your postgres user password
4. Default port: 5432

**Mac (using Homebrew):**
```bash
brew install postgresql@14
brew services start postgresql@14
```

**Linux (Ubuntu/Debian):**
```bash
sudo apt update
sudo apt install postgresql postgresql-contrib
sudo systemctl start postgresql
```

### Step 2: Create Database

**Option A: Using psql command line**

```bash
# Login to PostgreSQL
psql -U postgres

# Create database
CREATE DATABASE student_assessment_db;

# Create dedicated user (recommended)
CREATE USER assessment_user WITH PASSWORD 'secure_password';

# Grant privileges
GRANT ALL PRIVILEGES ON DATABASE student_assessment_db TO assessment_user;

# Exit
\q
```

**Option B: Using pgAdmin**

1. Open pgAdmin
2. Right-click "Databases" → "Create" → "Database"
3. Name: `student_assessment_db`
4. Owner: `postgres` (or create new user)
5. Click "Save"

### Step 3: Update DATABASE_URL

Update backend `.env` file with correct credentials:

```env
# If using postgres user:
DATABASE_URL="postgresql://postgres:your_password@localhost:5432/student_assessment_db"

# If using custom user:
DATABASE_URL="postgresql://assessment_user:secure_password@localhost:5432/student_assessment_db"
```

### Step 4: Run Prisma Migrations

```bash
# From backend directory
cd backend

# Generate Prisma Client
npm run db:generate

# Run migrations (creates all tables)
npm run db:migrate

# Expected output:
# - Prisma Client generated
# - 28 tables created
# - Migration complete

# Optional: Open Prisma Studio to view database
npm run db:studio
# Opens at http://localhost:5555
```

**Verify Tables Created:**

```bash
# Connect to database
psql -U postgres -d student_assessment_db

# List all tables
\dt

# Should show 28 tables:
# - User
# - Role
# - Assessment
# - Question
# - QuestionOption
# - Submission
# - Answer
# - Grade
# - Subject
# - Topic
# - Tag
# - etc.

# Exit
\q
```

### Step 5: Seed Database (Optional)

```bash
# From backend directory
npm run db:seed

# Seeds:
# - 3 Roles (Admin, Teacher, Student)
# - 10 Subjects (Math, Science, English, etc.)
# - Sample users
# - Sample assessments
```

---

## Running the Application

### Start Backend Server

**Terminal 1:**

```bash
# From root directory
cd backend

# Start development server
npm run dev

# Expected output:
# [INFO] Server starting...
# [INFO] Connected to PostgreSQL
# [INFO] Server running on http://localhost:5000
# [INFO] Environment: development
```

**Test Backend:**

```bash
# In new terminal
curl http://localhost:5000/api/v1/health

# Expected response:
# {"status":"ok","timestamp":"2026-07-19T...","uptime":...}
```

### Start Frontend Application

**Terminal 2:**

```bash
# From root directory
cd frontend

# Start development server
npm run dev

# Expected output:
# VITE v5.3.3  ready in 1234 ms
# ➜  Local:   http://localhost:3000/
# ➜  Network: use --host to expose
```

**Open Browser:**

Navigate to [http://localhost:3000](http://localhost:3000)

You should see the login page.

---

## Verification & Testing

### Backend Health Check

```bash
# Test health endpoint
curl http://localhost:5000/api/v1/health

# Test API endpoints
curl http://localhost:5000/api/v1/subjects
```

### Frontend Verification

1. Open [http://localhost:3000](http://localhost:3000)
2. Check browser console for errors (F12)
3. Verify no TypeScript errors
4. Check network tab - should connect to backend

### Run Tests

**Backend Tests:**

```bash
cd backend
npm test

# Run with coverage
npm test -- --coverage
```

**Frontend Tests:**

```bash
cd frontend
npm test

# Run with coverage
npm run test:coverage
```

### Code Quality Checks

**Backend:**

```bash
cd backend

# Check linting
npm run lint

# Check formatting
npm run format:check

# Fix issues
npm run lint:fix
npm run format
```

**Frontend:**

```bash
cd frontend

# Check linting
npm run lint

# Check TypeScript
npm run type-check

# Fix issues
npm run lint:fix
npm run format
```

---

## Troubleshooting

### Common Issues

#### 1. Port Already in Use

**Error:** `Port 5000 is already in use`

**Solution:**

```bash
# Windows
netstat -ano | findstr :5000
taskkill /PID <PID> /F

# Mac/Linux
lsof -ti:5000 | xargs kill -9
```

#### 2. Database Connection Failed

**Error:** `Can't reach database server`

**Solutions:**

1. **Verify PostgreSQL is running:**
   ```bash
   # Windows
   services.msc # Check PostgreSQL service
   
   # Mac
   brew services list
   
   # Linux
   sudo systemctl status postgresql
   ```

2. **Check DATABASE_URL format:**
   ```env
   DATABASE_URL="postgresql://USER:PASSWORD@HOST:PORT/DATABASE"
   ```

3. **Test connection:**
   ```bash
   psql -U postgres -d student_assessment_db
   ```

#### 3. npm install fails

**Error:** `EACCES permission denied`

**Solution:**

```bash
# Clear npm cache
npm cache clean --force

# Remove node_modules and package-lock.json
rm -rf node_modules package-lock.json

# Reinstall
npm install
```

#### 4. Prisma Client not generated

**Error:** `Cannot find module '@prisma/client'`

**Solution:**

```bash
cd backend
npm run db:generate
```

#### 5. CORS Error in Browser

**Error:** `Access-Control-Allow-Origin`

**Solution:**

1. Verify backend `.env`:
   ```env
   CORS_ORIGIN=http://localhost:3000
   ```

2. Restart backend server

#### 6. Frontend can't connect to Backend

**Checklist:**

- Backend is running on port 5000
- Frontend `.env` has correct `VITE_API_BASE_URL`
- No firewall blocking localhost
- Check browser console for errors

### Getting Help

1. Check console logs in both backend and frontend
2. Review this troubleshooting section
3. Check GitHub issues
4. Review documentation files:
   - `frontend/SETUP_DOCUMENTATION.md`
   - `backend/README.md`
   - API documentation in `API_Architecture_Documentation.md`

---

## Next Steps

### Immediate Tasks

- [ ] **Install all dependencies** (Steps 2-3)
- [ ] **Configure environment variables** (Step 4)
- [ ] **Setup PostgreSQL database** (Step 5)
- [ ] **Run Prisma migrations** (Step 5.4)
- [ ] **Start backend server** (Step 6.1)
- [ ] **Start frontend application** (Step 6.2)
- [ ] **Verify both are running** (Step 7)

### Development Priorities

#### Phase 1: Core Features (Week 1-2)
1. **Authentication System**
   - Complete login/register pages
   - Implement password reset flow
   - Add session management

2. **Student Dashboard**
   - Display available assessments
   - Show submission history
   - Performance statistics

3. **Assessment Taking**
   - Question display interface
   - Timer implementation
   - Auto-save functionality
   - Submit assessment

#### Phase 2: Admin Features (Week 3-4)
1. **Admin Dashboard**
   - Statistics overview
   - Recent activity feed
   - Charts and analytics

2. **Assessment Management**
   - Create/edit assessments
   - Question builder (MCQ, True/False, Fill-in-blank)
   - Preview functionality

3. **User Management**
   - User list with filters
   - Role management
   - Bulk operations

#### Phase 3: Advanced Features (Week 5-6)
1. **Grading System**
   - Automatic grading for objective questions
   - Manual grading interface for subjective
   - Feedback system

2. **Analytics & Reports**
   - Student performance reports
   - Assessment analytics
   - Export functionality

3. **AI Integration**
   - Question generation
   - Auto-grading assistance
   - Difficulty analysis

### Component Development Checklist

#### Layout Components
- [ ] Header with navigation
- [ ] Sidebar (student/admin versions)
- [ ] Footer
- [ ] Breadcrumbs

#### Common Components
- [ ] Modal/Dialog
- [ ] Data Table with pagination
- [ ] Form inputs (text, select, date, file)
- [ ] Dropdown menu
- [ ] Tabs
- [ ] Alerts/Notifications
- [ ] Progress indicators

#### Feature-Specific Components
- [ ] Question builder
- [ ] Assessment card
- [ ] Result display
- [ ] Timer widget
- [ ] Chart components
- [ ] File uploader

### API Endpoints to Implement

Refer to `openapi-spec.yaml` for complete API documentation.

**Priority Endpoints:**

1. **Authentication** (✅ Schema ready)
   - POST `/auth/register`
   - POST `/auth/login`
   - POST `/auth/refresh`
   - POST `/auth/logout`

2. **Assessments** (✅ Schema ready)
   - GET `/assessments` (list)
   - GET `/assessments/:id`
   - POST `/assessments` (admin)
   - PUT `/assessments/:id` (admin)
   - DELETE `/assessments/:id` (admin)

3. **Submissions** (✅ Schema ready)
   - POST `/submissions/start`
   - POST `/submissions/:id/answers`
   - POST `/submissions/:id/submit`
   - GET `/submissions/student/:id`

4. **Users** (✅ Schema ready)
   - GET `/users/me`
   - PUT `/users/me`
   - GET `/users` (admin)

### Testing Strategy

1. **Unit Tests**
   - Service functions
   - Utility functions
   - Validation schemas

2. **Integration Tests**
   - API endpoints
   - Database operations
   - Authentication flow

3. **E2E Tests** (Optional)
   - User registration → login → take assessment → view results
   - Admin creates assessment → student completes → admin grades

### Documentation Tasks

- [ ] API endpoint documentation (OpenAPI/Swagger)
- [ ] Component documentation (Storybook - optional)
- [ ] User guide
- [ ] Deployment guide
- [ ] Database schema documentation (✅ Complete)

### Deployment Preparation

1. **Environment Setup**
   - Production database
   - Environment variables for production
   - CI/CD pipeline

2. **Security Hardening**
   - Rate limiting
   - Input validation
   - SQL injection prevention
   - XSS protection
   - CSRF tokens

3. **Performance Optimization**
   - Database indexing
   - Query optimization
   - Caching strategy
   - Image optimization
   - Code splitting

4. **Monitoring**
   - Error tracking (Sentry)
   - Performance monitoring
   - User analytics
   - Server monitoring

---

## Project Structure Reference

### Backend Structure

```
backend/
├── src/
│   ├── config/         # Configuration files
│   ├── controllers/    # Route controllers
│   ├── middleware/     # Express middleware
│   ├── models/         # Data models (if needed beyond Prisma)
│   ├── routes/         # API routes
│   ├── services/       # Business logic
│   ├── utils/          # Utility functions
│   └── validators/     # Request validation schemas
├── prisma/
│   ├── schema.prisma   # Database schema (✅ Complete - 28 tables)
│   └── seed.ts         # Database seeding
├── tests/              # Test files
├── .env                # Environment variables (create this)
└── package.json        # Dependencies
```

### Frontend Structure

```
frontend/
├── src/
│   ├── components/     # React components
│   │   ├── common/     # Reusable components
│   │   ├── layout/     # Layout components
│   │   └── features/   # Feature-specific components
│   ├── pages/          # Page components
│   │   ├── admin/      # Admin pages
│   │   ├── student/    # Student pages
│   │   ├── auth/       # Auth pages
│   │   └── errors/     # Error pages
│   ├── hooks/          # Custom React hooks
│   ├── services/       # API service functions
│   ├── store/          # State management (Zustand)
│   ├── routes/         # Route configuration
│   ├── types/          # TypeScript types
│   ├── utils/          # Utility functions
│   └── styles/         # Global styles
├── public/             # Static assets
├── .env                # Environment variables (create this)
└── package.json        # Dependencies
```

---

## Quick Reference Commands

### Development Commands

```bash
# Backend
cd backend
npm run dev          # Start dev server
npm run db:studio    # Open Prisma Studio
npm run db:migrate   # Run migrations
npm test            # Run tests
npm run lint:fix    # Fix linting issues

# Frontend
cd frontend
npm run dev         # Start dev server
npm test           # Run tests
npm run build      # Build for production
npm run preview    # Preview production build
npm run lint:fix   # Fix linting issues
```

### Database Commands

```bash
cd backend

# Generate Prisma Client
npm run db:generate

# Create migration
npm run db:migrate

# Deploy migrations (production)
npm run db:migrate:deploy

# Reset database
npm run db:reset

# Seed database
npm run db:seed

# Open Prisma Studio
npm run db:studio
```

### Git Commands

```bash
# Initialize git (if not already)
git init

# Add all files
git add .

# Commit
git commit -m "Initial setup complete"

# Create .gitignore (should already exist)
# Make sure it includes:
# - node_modules/
# - .env
# - dist/
# - *.log
```

---

## Resources & Documentation

### Project Documentation
- **Requirements:** `requirements_complete_v2.md`
- **Database Schema:** `database_schema_design.md`
- **System Architecture:** `SYSTEM_ARCHITECTURE.md`
- **API Documentation:** `API_Architecture_Documentation.md`
- **UI/UX Design:** `MASTER_UI_UX_DESIGN.md`
- **Frontend Setup:** `frontend/SETUP_DOCUMENTATION.md`

### External Resources
- [React Documentation](https://react.dev/)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [Vite Guide](https://vitejs.dev/guide/)
- [Tailwind CSS](https://tailwindcss.com/docs)
- [Prisma Documentation](https://www.prisma.io/docs)
- [Express.js Guide](https://expressjs.com/)
- [PostgreSQL Documentation](https://www.postgresql.org/docs/)

---

## Support & Contact

For questions, issues, or contributions:
- Review documentation files
- Check troubleshooting section
- Create GitHub issue (if repository exists)

---

## Changelog

### Version 1.0.0 (2026-07-19)
- ✅ Complete documentation created
- ✅ Database schema designed (28 tables)
- ✅ System architecture defined
- ✅ Authentication system designed
- ✅ 40+ API endpoints documented
- ✅ Frontend structure created
- ✅ Backend structure created
- ✅ Development environment configured
- 🚧 Dependency installation in progress
- ⏳ Feature implementation pending

---

**Last Updated:** 2026-07-19  
**Status:** Setup Phase Complete - Ready for Development

---

## License

MIT License - See LICENSE file for details

---

**Good luck with development! 🚀**
