# High-Level System Architecture
## Student Assessment Platform (Class 1-10)

---

## 1. Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────────────┐
│                           CLIENT LAYER                                   │
│  ┌──────────────────────────────────────────────────────────────────┐  │
│  │  React SPA (Single Page Application)                             │  │
│  │  - Redux/Context API for State Management                        │  │
│  │  - React Router for Navigation                                   │  │
│  │  - Axios/Fetch for API calls                                     │  │
│  └────────────────────┬─────────────────────────────────────────────┘  │
└─────────────────────────┼───────────────────────────────────────────────┘
                          │ HTTPS/TLS (443)
                          │ REST API Calls (JSON)
┌─────────────────────────▼───────────────────────────────────────────────┐
│                          CDN LAYER                                       │
│  ┌──────────────────────────────────────────────────────────────────┐  │
│  │  CloudFront / Cloudflare CDN                                     │  │
│  │  - Static Assets (JS, CSS, Images)                               │  │
│  │  - Edge Caching                                                  │  │
│  │  - DDoS Protection                                               │  │
│  └──────────────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────────────┘
                          │
┌─────────────────────────▼───────────────────────────────────────────────┐
│                     LOAD BALANCER LAYER                                 │
│  ┌──────────────────────────────────────────────────────────────────┐  │
│  │  Application Load Balancer (ALB)                                 │  │
│  │  - SSL/TLS Termination                                           │  │
│  │  - Health Checks                                                 │  │
│  │  - Round-robin / Least Connection                                │  │
│  │  - Auto-scaling triggers                                         │  │
│  └────────┬──────────────┬──────────────┬─────────────┬─────────────┘  │
└───────────┼──────────────┼──────────────┼─────────────┼────────────────┘
            │              │              │             │
┌───────────▼──────────────▼──────────────▼─────────────▼────────────────┐
│                    APPLICATION SERVER LAYER                             │
│  ┌────────────┐  ┌────────────┐  ┌────────────┐  ┌────────────┐      │
│  │   API      │  │   API      │  │   API      │  │   API      │      │
│  │ Server 1   │  │ Server 2   │  │ Server 3   │  │ Server N   │      │
│  │            │  │            │  │            │  │            │      │
│  │ Node.js/   │  │ Node.js/   │  │ Node.js/   │  │ Node.js/   │      │
│  │ Python     │  │ Python     │  │ Python     │  │ Python     │      │
│  │ Express/   │  │ Express/   │  │ Express/   │  │ Express/   │      │
│  │ FastAPI    │  │ FastAPI    │  │ FastAPI    │  │ FastAPI    │      │
│  └─────┬──────┘  └─────┬──────┘  └─────┬──────┘  └─────┬──────┘      │
│        │               │               │               │              │
│        │   ┌───────────┴───────────────┴───────────────┘              │
│        │   │                                                           │
└────────┼───┼───────────────────────────────────────────────────────────┘
         │   │
         │   │  ┌──────────────────────────────────────────────────┐
         │   └──►  CACHE LAYER                                      │
         │      │  ┌──────────────────────────────────────────┐    │
         │      │  │  Redis Cluster (Master-Replica)          │    │
         │      │  │  - Session Storage                        │    │
         │      │  │  - Leaderboard Cache                      │    │
         │      │  │  - Question Cache                         │    │
         │      │  │  - API Rate Limiting                      │    │
         │      │  │  - Real-time Analytics                    │    │
         │      │  └──────────────────────────────────────────┘    │
         │      └──────────────────────────────────────────────────┘
         │
         │      ┌──────────────────────────────────────────────────┐
         └──────►  DATABASE LAYER                                   │
                │  ┌──────────────────────────────────────────┐    │
                │  │  PostgreSQL Primary (Master)             │    │
                │  │  - ACID Transactions                      │    │
                │  │  - Connection Pooling (PgBouncer)        │    │
                │  │  - 28 Tables (Users, Tests, etc.)        │    │
                │  └─────────────┬────────────────────────────┘    │
                │                │ Replication                      │
                │  ┌─────────────▼────────────────────────────┐    │
                │  │  PostgreSQL Replicas (Read Replicas)     │    │
                │  │  - Read-only queries                      │    │
                │  │  - Reporting & Analytics                  │    │
                │  └──────────────────────────────────────────┘    │
                └──────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────────┐
│                      STORAGE & EXTERNAL SERVICES                         │
│                                                                           │
│  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐         │
│  │   AWS S3        │  │  Payment        │  │  Notification   │         │
│  │                 │  │  Gateway        │  │  Services       │         │
│  │ - Question      │  │                 │  │                 │         │
│  │   Images        │  │ - Razorpay      │  │ - AWS SES       │         │
│  │ - User Avatars  │  │ - Stripe        │  │   (Email)       │         │
│  │ - Certificates  │  │ - PayPal        │  │ - Twilio/SNS    │         │
│  │ - Static Assets │  │                 │  │   (SMS)         │         │
│  │                 │  │ - Webhooks      │  │ - Push Notif.   │         │
│  └─────────────────┘  └─────────────────┘  └─────────────────┘         │
│                                                                           │
│  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐         │
│  │   Monitoring    │  │  Analytics      │  │  Secret Mgmt    │         │
│  │                 │  │                 │  │                 │         │
│  │ - CloudWatch/   │  │ - Google        │  │ - AWS Secrets   │         │
│  │   DataDog       │  │   Analytics     │  │   Manager       │         │
│  │ - Error Track   │  │ - Mixpanel      │  │ - Vault         │         │
│  │   (Sentry)      │  │ - Custom        │  │ - Env Variables │         │
│  └─────────────────┘  └─────────────────┘  └─────────────────┘         │
└─────────────────────────────────────────────────────────────────────────┘
```

---

## 2. Component Descriptions

### 2.1 Frontend Layer (React Application)

**Technology Stack:**
- React 18+ with TypeScript
- State Management: Redux Toolkit / Zustand
- Routing: React Router v6
- UI Framework: Material-UI / Ant Design / Tailwind CSS
- HTTP Client: Axios with interceptors
- Form Handling: React Hook Form + Yup validation
- Build Tool: Vite / Webpack

**Key Responsibilities:**
- **User Interface Rendering:** All student-facing screens (dashboard, test interface, results, leaderboard)
- **Admin Panel:** Content management, analytics dashboards, user management
- **State Management:** User session, test state, progress tracking
- **API Communication:** RESTful API calls to backend services
- **Client-side Validation:** Form validation, input sanitization
- **Responsive Design:** Mobile-first approach for Class 1-10 students
- **Real-time Updates:** WebSocket connections for live leaderboards

**Deployment:**
- Static files hosted on S3 + CloudFront CDN
- Environment-specific builds (dev, staging, production)
- Code splitting and lazy loading for performance

---

### 2.2 Backend API Layer

**Technology Stack:**

**Option A: Node.js**
- Framework: Express.js / NestJS
- Language: TypeScript
- ORM: Prisma / TypeORM / Sequelize
- Authentication: Passport.js + JWT
- Validation: Joi / Zod
- Background Jobs: Bull (Redis-based queue)

**Option B: Python**
- Framework: FastAPI / Django REST Framework
- ORM: SQLAlchemy / Django ORM
- Authentication: JWT + OAuth2
- Validation: Pydantic
- Background Jobs: Celery (Redis/RabbitMQ)

**Core Services:**

**Authentication Service:**
- User registration, login, logout
- JWT token generation and validation
- Role-based access control (RBAC)
- Session management with Redis
- Password hashing (bcrypt/argon2)
- Multi-factor authentication (optional)

**Test Management Service:**
- Create/Read/Update/Delete tests
- Question bank management
- Test scheduling and availability
- Answer evaluation (auto-grading)
- Time-based test session control
- Test analytics and insights

**Gamification Service:**
- Points calculation and award
- Badge/Achievement management
- Leaderboard generation
- Streak tracking
- Daily challenges

**Subscription Service:**
- Plan management (Free/Premium tiers)
- Payment processing integration
- Subscription lifecycle (activate, renew, cancel)
- Feature access control
- Trial period management

**Notification Service:**
- Email notifications (test reminders, results)
- SMS alerts (critical updates)
- In-app notifications
- Push notifications (mobile)

**Analytics Service:**
- User activity tracking
- Test performance metrics
- Engagement analytics
- Custom reports for admins

**API Design:**
- RESTful endpoints
- Versioning (v1, v2)
- Standardized response format
- Pagination, filtering, sorting
- Rate limiting (per user/IP)
- API documentation (Swagger/OpenAPI)

---

### 2.3 Database Layer

#### **PostgreSQL (Primary Database)**

**Configuration:**
- Version: PostgreSQL 14+
- Connection Pooling: PgBouncer (500-1000 connections)
- Replication: Master-Replica setup (1 master, 2+ replicas)
- Backup: Daily automated backups with point-in-time recovery

**Schema Organization (28 Tables):**
- **User Management:** users, roles, permissions, user_profiles
- **Content:** questions, question_options, subjects, topics, chapters
- **Assessments:** tests, test_questions, test_attempts, test_responses
- **Gamification:** achievements, badges, user_badges, points_history, leaderboards
- **Subscriptions:** subscription_plans, user_subscriptions, transactions, payment_history
- **Admin:** admin_users, audit_logs, system_settings
- **Analytics:** user_activity, test_analytics, engagement_metrics

**Performance Optimization:**
- Indexes on frequently queried columns (user_id, test_id, created_at)
- Partial indexes for filtered queries
- Full-text search indexes for question search
- Query optimization with EXPLAIN ANALYZE
- Materialized views for complex reports

**Data Integrity:**
- Foreign key constraints
- Check constraints for data validation
- Triggers for audit logging
- Transactions for critical operations

---

#### **Redis (Caching & Session Store)**

**Configuration:**
- Redis Cluster / Sentinel for high availability
- Persistence: RDB + AOF for durability
- Memory: 16GB+ per instance
- Eviction Policy: LRU (Least Recently Used)

**Use Cases:**

**Session Storage:**
- User authentication tokens (JWT)
- Active session tracking
- Session expiry management

**Caching Layer:**
- **Hot Data:** Frequently accessed questions, leaderboards
- **API Response Cache:** Test lists, subject hierarchies
- **Query Results:** Dashboard statistics, user progress
- **TTL Strategy:** Short-lived (5-15 min) for dynamic data, long-lived (1-24 hours) for static content

**Rate Limiting:**
- API request counting per user/IP
- Sliding window rate limiting
- Brute-force protection

**Real-time Features:**
- Live leaderboard updates
- Concurrent user counts
- Test timer synchronization

**Background Job Queue:**
- Test result processing
- Email notification queue
- Report generation tasks

**Cache Invalidation Strategy:**
- Write-through for critical data
- Cache-aside for read-heavy data
- Event-driven invalidation on updates

---

### 2.4 Storage Layer (AWS S3)

**Configuration:**
- Bucket Structure: Organized by content type
- Access Control: IAM roles and bucket policies
- Versioning: Enabled for critical assets
- Lifecycle Policies: Archive old content to Glacier

**Content Types:**

**Question Assets:**
- `s3://bucket-name/questions/images/{question_id}.png`
- Diagrams, charts, and visual aids
- MIME types: image/jpeg, image/png, image/svg+xml

**User-Generated Content:**
- `s3://bucket-name/users/avatars/{user_id}.jpg`
- Profile pictures
- Size limits: 2MB per file

**Achievement Badges:**
- `s3://bucket-name/badges/{badge_id}.png`
- Pre-rendered badge images
- SVG format for scalability

**Certificates:**
- `s3://bucket-name/certificates/{user_id}/{test_id}.pdf`
- Auto-generated on test completion
- Digitally signed PDFs

**Static Assets:**
- JavaScript bundles
- CSS stylesheets
- Font files
- Icon libraries

**Access Patterns:**
- **Public Read:** Static assets via CloudFront CDN
- **Authenticated Access:** User-specific content with signed URLs
- **Pre-signed URLs:** Temporary upload/download links (expiry: 5-60 minutes)

**Performance:**
- CloudFront CDN integration for global delivery
- Multi-region replication for disaster recovery
- Compression (gzip/brotli) for text-based files

---

### 2.5 External Services

#### **Payment Gateway**

**Primary: Razorpay (India-focused)**
- Subscription payments (monthly/yearly)
- One-time purchases
- Auto-debit for recurring subscriptions
- Refund processing
- Webhook integration for payment status

**Alternative: Stripe/PayPal**
- International payments
- Multiple currency support

**Integration Flow:**
1. Frontend initiates checkout
2. Backend creates payment order
3. Payment gateway processes transaction
4. Webhook confirms payment to backend
5. Subscription activated in database

---

#### **Email Service (AWS SES / SendGrid)**

**Use Cases:**
- Welcome emails on registration
- Test reminder emails
- Result notification emails
- Subscription renewal reminders
- Password reset emails
- Weekly progress reports

**Features:**
- HTML email templates
- Personalization with user data
- Bounce and complaint handling
- Email analytics (open rates, click rates)

---

#### **SMS Service (Twilio / AWS SNS)**

**Use Cases:**
- OTP for login verification
- Critical alerts (subscription expiry)
- Test start reminders

**Configuration:**
- Country-specific sender IDs
- Message templates with variables
- Delivery status tracking

---

#### **Push Notifications (Firebase Cloud Messaging / OneSignal)**

**Use Cases:**
- Test reminders
- Achievement unlocks
- Daily challenge alerts
- Leaderboard position changes

---

#### **Monitoring & Logging**

**CloudWatch / DataDog:**
- Server metrics (CPU, memory, disk)
- Application logs
- Custom metrics (test completion rate, signup rate)
- Alarms for critical thresholds

**Sentry / Rollbar:**
- Frontend error tracking
- Backend exception monitoring
- Real-time alerts for critical errors

---

## 3. Technology Stack Integration

### 3.1 Frontend to Backend Communication

**Protocol:** HTTPS (TLS 1.3)

**API Communication Flow:**

```
React Component
    │
    ├─> Axios Instance (with interceptors)
    │       │
    │       ├─> Request Interceptor
    │       │   - Add JWT token to Authorization header
    │       │   - Add request ID for tracing
    │       │   - Add timestamp
    │       │
    │       ├─> HTTP Request (JSON payload)
    │       │   - Method: GET, POST, PUT, DELETE
    │       │   - Headers: Content-Type: application/json
    │       │   - Body: JSON data
    │       │
    │       ├─> Response Interceptor
    │       │   - Handle 401 (refresh token)
    │       │   - Handle 500 (error logging)
    │       │   - Parse response data
    │       │
    │       └─> Return to Component
    │
    └─> State Update (Redux/Context)
```

**Authentication Flow:**

1. User logs in with credentials
2. Backend validates and returns JWT token + refresh token
3. Frontend stores tokens in memory/localStorage
4. Every API request includes `Authorization: Bearer {token}`
5. Backend validates token on each request
6. Token expires after 15 minutes, refresh token after 7 days
7. Frontend auto-refreshes token before expiry

**Error Handling:**
- Network errors: Retry with exponential backoff
- 4xx errors: Display user-friendly messages
- 5xx errors: Log to Sentry, show generic error

---

### 3.2 Backend to Database Communication

**Connection Management:**

```
Application Server
    │
    ├─> Connection Pool (PgBouncer)
    │   - Min: 10 connections
    │   - Max: 100 connections per server
    │   - Idle timeout: 10 minutes
    │   - Connection recycling
    │
    ├─> ORM Layer (Prisma/SQLAlchemy)
    │   - Query builder
    │   - Migrations management
    │   - Type-safe queries
    │
    ├─> PostgreSQL Primary (Write operations)
    │   - INSERT, UPDATE, DELETE
    │   - Transactions
    │
    └─> PostgreSQL Replicas (Read operations)
        - SELECT queries
        - Reports and analytics
        - Load distribution
```

**Query Routing:**
- **Write Operations:** Always go to primary database
- **Read Operations:** Route to replicas with round-robin
- **Critical Reads:** Route to primary to avoid replication lag
- **Transactions:** Entire transaction on primary

**Performance Optimization:**
- Prepared statements to prevent SQL injection
- Batch operations for bulk inserts
- Lazy loading for related entities
- Query result caching in Redis

---

### 3.3 Redis vs PostgreSQL Usage

**When to Use Redis:**

| Use Case | Redis | Reason |
|----------|-------|--------|
| Session storage | Yes | Fast read/write, auto-expiry |
| Leaderboard (real-time) | Yes | Sorted sets, O(log N) operations |
| Rate limiting | Yes | Atomic increment, TTL support |
| API response cache | Yes | Sub-millisecond latency |
| Question cache | Yes | Frequently accessed, read-heavy |
| Recent activity feed | Yes | List data structure, fast push/pop |

**When to Use PostgreSQL:**

| Use Case | PostgreSQL | Reason |
|----------|------------|--------|
| User profiles | Yes | ACID compliance, relational data |
| Test results | Yes | Permanent storage, complex queries |
| Subscription data | Yes | Financial data integrity |
| Analytics (historical) | Yes | Complex aggregations, joins |
| Audit logs | Yes | Compliance, immutability |

**Hybrid Approach:**
- **Write:** Update PostgreSQL first, then invalidate/update Redis cache
- **Read:** Check Redis first, if miss, query PostgreSQL and populate cache

---

### 3.4 CDN for Static Assets

**CloudFront Configuration:**
- **Origin:** S3 bucket (React build files)
- **Cache Behavior:** Cache static assets for 1 year (immutable)
- **Compression:** Gzip and Brotli enabled
- **Edge Locations:** Global distribution
- **Custom Domain:** cdn.studentassessment.com
- **HTTPS Only:** Automatic HTTP to HTTPS redirect

**Cache Invalidation:**
- Use versioned URLs (`app.v1.2.3.js`) to avoid manual invalidation
- Invalidate on deployment for non-versioned files

**Benefits:**
- Reduced latency (edge caching)
- Reduced origin server load
- Better user experience (faster page loads)

---

## 4. Scalability Considerations

### 4.1 Horizontal Scaling Strategy

**Application Servers:**
- **Current:** 4 servers (t3.medium/t3.large)
- **Auto-scaling Policy:**
  - Scale up: CPU > 70% for 3 minutes
  - Scale down: CPU < 30% for 10 minutes
  - Min instances: 2
  - Max instances: 20
- **Stateless Design:** No server-side session storage (use Redis)
- **Load Distribution:** Round-robin or least connections

**Target Capacity:**
- 5000 concurrent users
- Assume 1000 requests/sec at peak
- Each server handles 250 requests/sec
- Minimum 4 servers, scale to 8-10 during exams

---

### 4.2 Load Balancing Approach

**Application Load Balancer (ALB):**

**Configuration:**
- **Algorithm:** Round-robin (default) or least outstanding requests
- **Health Checks:**
  - Endpoint: `/api/health`
  - Interval: 30 seconds
  - Timeout: 5 seconds
  - Healthy threshold: 2 consecutive successes
  - Unhealthy threshold: 3 consecutive failures
- **Sticky Sessions:** Disabled (stateless architecture)
- **SSL/TLS Termination:** ALB handles HTTPS, communicates with servers via HTTP

**Traffic Distribution:**
- WebSocket connections: Consistent routing to same server
- Regular API calls: Distribute across all healthy servers

**Failover:**
- Unhealthy server removed from pool automatically
- Traffic redistributed to healthy servers
- Alerts sent to ops team

---

### 4.3 Database Connection Pooling

**PgBouncer Configuration:**

```
[databases]
studentdb = host=postgres-primary.internal port=5432 dbname=studentdb

[pgbouncer]
pool_mode = transaction
max_client_conn = 5000
default_pool_size = 25
reserve_pool_size = 5
reserve_pool_timeout = 3
max_db_connections = 100
```

**Pooling Strategy:**
- **Transaction Mode:** Connection returned after transaction
- **Connection Lifecycle:** Reused for multiple clients
- **Benefits:**
  - Reduced connection overhead
  - Prevent database connection exhaustion
  - Better resource utilization

**Per-Server Allocation:**
- 4 app servers × 25 connections = 100 connections
- Database supports 200 max connections
- 100 reserved for direct admin access

---

### 4.4 Caching Strategy Overview

**Multi-Layer Caching:**

**Layer 1: Browser Cache**
- Static assets cached for 1 year
- API responses cached for 5 minutes (Cache-Control headers)

**Layer 2: CDN Cache (CloudFront)**
- Edge caching for static assets
- Reduces origin server requests by 90%

**Layer 3: Application Cache (Redis)**
- **Hot Data:** Leaderboards, active test sessions
- **API Responses:** Test lists, subject hierarchies
- **TTL Strategy:**
  - Leaderboards: 30 seconds
  - Question data: 1 hour
  - Subject/Topic lists: 24 hours
  - User profiles: 15 minutes

**Layer 4: Database Query Cache**
- PostgreSQL shared_buffers (2GB)
- OS page cache

**Cache Invalidation:**
- **Time-based:** Automatic expiry via TTL
- **Event-based:** Invalidate on data update
- **Manual:** Admin-triggered cache clear

---

## 5. Security Architecture

### 5.1 HTTPS/TLS Encryption

**Transport Layer Security:**
- **TLS Version:** 1.3 (fallback to 1.2)
- **Certificate:** AWS Certificate Manager (ACM) or Let's Encrypt
- **Certificate Renewal:** Automatic
- **Cipher Suites:** Strong encryption only (AES-256, ChaCha20)

**Implementation:**
- **Frontend to CDN:** HTTPS enforced
- **CDN to Load Balancer:** HTTPS enforced
- **Load Balancer to App Servers:** HTTP (internal VPC)
- **App Servers to Database:** SSL/TLS connection

**Additional Measures:**
- HSTS (HTTP Strict Transport Security) header
- Certificate pinning for mobile apps
- Regular SSL Labs security audits

---

### 5.2 API Security

**Authentication:**
- **JWT (JSON Web Tokens):**
  - Algorithm: RS256 (asymmetric)
  - Payload: user_id, role, permissions, exp
  - Access Token Expiry: 15 minutes
  - Refresh Token Expiry: 7 days
  - Stored: Access token in memory, refresh token in httpOnly cookie

**Authorization:**
- **Role-Based Access Control (RBAC):**
  - Roles: Student, Parent, Teacher, Admin, Super Admin
  - Permissions: Fine-grained (e.g., `test.create`, `user.delete`)
  - Middleware checks token and permissions per route

**Input Validation:**
- Request payload validation (Joi/Pydantic schemas)
- SQL injection prevention (parameterized queries)
- XSS prevention (input sanitization, output encoding)
- CSRF protection (CSRF tokens for state-changing operations)

**Rate Limiting:**
- **Per User:** 100 requests/minute
- **Per IP:** 500 requests/minute
- **Login Attempts:** 5 attempts per 15 minutes, then lockout
- Implementation: Redis-based sliding window counter

**API Versioning:**
- URL-based: `/api/v1/tests`
- Allows backward compatibility during upgrades

**CORS (Cross-Origin Resource Sharing):**
- Whitelist approved domains only
- No wildcard (*) in production

---

### 5.3 Database Security

**Access Control:**
- **Network Level:**
  - Database in private subnet (no public access)
  - Security group allows only app server IPs
  - VPC isolation
- **Authentication:**
  - Strong passwords (16+ characters)
  - Individual database users per service
  - No shared credentials
- **Authorization:**
  - Principle of least privilege
  - App user: SELECT, INSERT, UPDATE, DELETE (no DROP, ALTER)
  - Admin user: Full access (used for migrations only)
  - Read-only user for replicas

**Data Protection:**
- **Encryption at Rest:**
  - Database volume encryption (AES-256)
  - Backup encryption
- **Encryption in Transit:**
  - SSL/TLS connections from app servers
  - Certificate validation
- **Sensitive Data:**
  - Passwords hashed with bcrypt (cost factor: 12)
  - PII (Personally Identifiable Information) encrypted with AES-256
  - Payment data: Never stored (tokenization via payment gateway)

**Audit Logging:**
- All write operations logged with user_id and timestamp
- Audit log table separate from transactional tables
- Retention: 1 year minimum
- Monitoring for suspicious activity (mass deletions, unauthorized access)

**Backup & Recovery:**
- Daily automated backups (retention: 30 days)
- Point-in-time recovery enabled
- Backup stored in separate region
- Regular restore testing (monthly)

---

### 5.4 Secret Management

**Secrets Store:**
- **Primary:** AWS Secrets Manager / HashiCorp Vault
- **Alternative:** Encrypted environment variables

**Secrets Stored:**
- Database credentials
- JWT signing keys (private/public key pair)
- API keys (payment gateway, email service, SMS service)
- Encryption keys for PII
- Third-party service credentials

**Access Control:**
- IAM roles for app servers (no hardcoded credentials)
- Secrets accessed at runtime
- Automatic rotation for database passwords (every 90 days)

**Development vs Production:**
- Separate secrets per environment (dev, staging, prod)
- Development secrets have no access to production resources
- `.env.example` file with dummy values (not actual secrets)

**Secret Rotation:**
- Regular rotation schedule (quarterly)
- Zero-downtime rotation strategy
- Notification to ops team before rotation

---

## 6. Data Flow Examples

### 6.1 User Takes a Test (End-to-End Flow)

```
1. Student clicks "Start Test" (React)
   ↓
2. Frontend sends POST /api/v1/tests/{testId}/start (HTTPS)
   ↓
3. Load Balancer routes to available app server
   ↓
4. App server validates JWT token (checks Redis for session)
   ↓
5. App server checks subscription status (PostgreSQL)
   ↓
6. App server creates test_attempt record (PostgreSQL primary)
   ↓
7. App server fetches test questions:
   - Check Redis cache first
   - If cache miss, query PostgreSQL replica
   - Store in Redis (TTL: 1 hour)
   ↓
8. App server fetches question images from S3 (signed URLs)
   ↓
9. Response sent back to frontend (JSON)
   ↓
10. Student answers questions (state stored in React)
   ↓
11. On submit, frontend sends POST /api/v1/tests/{attemptId}/submit
   ↓
12. App server validates answers
   ↓
13. App server calculates score and updates:
    - test_attempt record (PostgreSQL)
    - user points (PostgreSQL + Redis leaderboard)
    - achievements (check if unlocked)
   ↓
14. App server queues notification job (Redis/Celery)
   ↓
15. Background worker sends result email (AWS SES)
   ↓
16. Frontend displays results page
```

---

### 6.2 Admin Adds New Question

```
1. Admin uploads question + image (React Admin Panel)
   ↓
2. Frontend sends POST /api/v1/admin/questions (multipart/form-data)
   ↓
3. App server validates admin JWT token and permissions
   ↓
4. App server uploads image to S3:
   - Generate unique filename
   - Upload to s3://bucket/questions/images/{id}.png
   - Get public URL
   ↓
5. App server creates question record (PostgreSQL):
   - Store question text, options, correct answer
   - Store S3 image URL
   ↓
6. App server invalidates question cache in Redis
   ↓
7. Response sent to frontend (success message)
   ↓
8. Frontend updates question list
```

---

## 7. Deployment Architecture

**Environment Structure:**
- **Development:** Single server, shared database, no CDN
- **Staging:** 2 servers, replicated database, CDN enabled
- **Production:** 4+ servers, full HA setup, monitoring enabled

**CI/CD Pipeline:**
1. Code push to GitHub
2. GitHub Actions triggers
3. Run tests (unit, integration)
4. Build Docker images
5. Push to container registry (ECR/Docker Hub)
6. Deploy to staging (blue-green deployment)
7. Run smoke tests
8. Manual approval for production
9. Deploy to production (rolling update)
10. Health checks
11. Rollback on failure

**Infrastructure as Code:**
- Terraform for AWS resources
- Docker/Kubernetes for container orchestration
- Ansible for server configuration

---

## 8. Monitoring & Observability

**Metrics to Monitor:**
- Request rate, error rate, latency (RED method)
- Database connection pool usage
- Redis memory usage
- API endpoint performance
- User signup/login rate
- Test completion rate
- Payment success rate

**Alerting:**
- Critical: Error rate > 5%, API latency > 2s
- Warning: CPU > 80%, Memory > 85%
- Info: New deployment, configuration change

**Logging:**
- Structured logging (JSON format)
- Log levels: DEBUG, INFO, WARN, ERROR
- Log aggregation: ELK stack / CloudWatch Logs
- Retention: 90 days

---

## 9. Disaster Recovery & High Availability

**High Availability:**
- Multi-AZ deployment for database
- Cross-region S3 replication
- Redundant app servers across availability zones
- Automated failover for database

**Disaster Recovery:**
- RPO (Recovery Point Objective): 1 hour (latest backup)
- RTO (Recovery Time Objective): 4 hours (restore time)
- Regular DR drills (quarterly)

**Backup Strategy:**
- Database: Daily full backup + continuous WAL archiving
- S3: Versioning enabled + cross-region replication
- Application: Infrastructure code in Git

---

## Conclusion

This high-level architecture is designed to support **5000 concurrent users** with:

- **Scalability:** Horizontal scaling for app servers, read replicas for database
- **Performance:** Multi-layer caching (browser, CDN, Redis), connection pooling
- **Security:** HTTPS/TLS, JWT authentication, RBAC, encrypted data at rest/transit
- **Reliability:** Load balancing, health checks, automated failover, monitoring
- **Maintainability:** Modular services, clear separation of concerns, IaC

**Next Steps:**
1. Detailed API documentation (Swagger/OpenAPI spec)
2. Database indexing strategy based on query patterns
3. Performance testing plan (load testing with 5000 concurrent users)
4. Security audit and penetration testing
5. Cost estimation and optimization plan

---

**Document Version:** 1.0  
**Last Updated:** 2026-07-19  
**Total Word Count:** ~2,950 words
