# Authentication & Authorization System Design
## Student Assessment Platform

---

## 1. Authentication Flows

### 1.1 Email/Password Registration Flow

```
User → Frontend → Backend → Database → Email Service
  1. User submits: email, password, name, role
  2. Frontend validates: format, password strength (min 8 chars, uppercase, number, special char)
  3. Backend validates: email uniqueness
  4. Backend hashes password: bcrypt with salt (cost factor 12)
  5. Backend creates user record: status = 'unverified'
  6. Backend generates verification token: JWT with 24h expiry
  7. Backend sends verification email with token link
  8. Response: 201 Created with message "Check email to verify account"
  
User Verifies Email:
  1. User clicks email link with token
  2. Backend validates token (signature, expiry, not revoked)
  3. Backend updates user: status = 'active'
  4. Backend generates auth tokens (access + refresh)
  5. Frontend stores tokens and redirects to dashboard
```

### 1.2 Email/Password Login Flow

```
User → Frontend → Backend → Database
  1. User submits: email, password
  2. Backend retrieves user by email
  3. Backend checks account status (active, locked, unverified)
  4. Backend verifies password: bcrypt.compare(input, stored_hash)
  5. Backend checks failed_attempts < 5
  6. On success:
     - Reset failed_attempts to 0
     - Update last_login timestamp
     - Generate access token (15 min expiry)
     - Generate refresh token (7 day expiry)
     - Store refresh token in database with device_info
     - Return tokens + user profile
  7. On failure:
     - Increment failed_attempts
     - If attempts >= 5: lock account for 30 minutes
     - Return generic error (prevent user enumeration)
```

### 1.3 Social Login Flow (Google/Facebook OAuth 2.0)

```
User → Frontend → OAuth Provider → Backend → Database
  1. User clicks "Login with Google/Facebook"
  2. Frontend redirects to OAuth provider with:
     - client_id
     - redirect_uri
     - scope (email, profile)
     - state (CSRF token)
  3. User authenticates with provider
  4. Provider redirects to callback URL with authorization code
  5. Backend validates state parameter (CSRF protection)
  6. Backend exchanges code for access token
  7. Backend fetches user profile from provider
  8. Backend checks if user exists by email:
     - Exists: Link account or login
     - New: Create user with provider_id
  9. Backend generates JWT tokens
  10. Frontend receives tokens and redirects to dashboard
```

### 1.4 SMS OTP Verification Flow

```
User → Frontend → Backend → SMS Service
  1. User enters phone number
  2. Backend validates phone format and uniqueness
  3. Backend generates 6-digit OTP (random, expires in 5 min)
  4. Backend stores OTP hash with phone, expiry, attempts = 0
  5. Backend sends SMS via service (Twilio/SNS)
  6. User enters OTP
  7. Backend validates:
     - OTP matches hash
     - Not expired
     - attempts < 3
  8. On success:
     - Mark phone as verified
     - Generate auth tokens
  9. On failure:
     - Increment attempts
     - If attempts >= 3: invalidate OTP, require new request
```

### 1.5 Email Verification Flow

```
Registration → Email → Verification → Activation
  1. Backend generates verification token:
     - JWT signed with secret
     - Payload: {user_id, email, exp: 24h}
  2. Backend sends email with link:
     - https://app.com/verify?token=JWT
  3. User clicks link
  4. Frontend extracts token, sends to backend
  5. Backend validates token:
     - Signature valid
     - Not expired
     - user_id exists
     - email matches user record
  6. Backend updates user.email_verified = true
  7. Auto-login user with new JWT tokens
  
Resend Flow:
  - User requests new verification email
  - Backend checks last_sent_at (rate limit: 1 per minute)
  - Generate new token, send email
```

### 1.6 Password Reset Flow

```
Request → Email → Reset → Confirmation
  1. User enters email on "Forgot Password" page
  2. Backend checks if email exists (return success regardless)
  3. Backend generates reset token:
     - JWT with payload: {user_id, purpose: 'reset', exp: 1h}
     - Or random token stored in database
  4. Backend sends email with reset link
  5. User clicks link, redirected to reset form
  6. Frontend validates token with backend
  7. User submits new password
  8. Backend validates:
     - Token valid and not expired
     - Token not already used
     - New password meets requirements
     - New password != old password
  9. Backend updates password hash
  10. Backend invalidates all refresh tokens (force re-login)
  11. Backend marks reset token as used
  12. Send confirmation email
```

### 1.7 Session Management

```
Access Token (15 min):
  - Short-lived, stored in memory or httpOnly cookie
  - Sent with every API request
  - Contains: user_id, role, permissions, exp

Refresh Token (7 days):
  - Long-lived, stored in database + httpOnly cookie
  - Used only to get new access token
  - Rotates on each use (refresh token rotation)
  - Contains: token_id, user_id, exp

Token Refresh Flow:
  1. Access token expires
  2. Frontend sends refresh token to /auth/refresh
  3. Backend validates refresh token:
     - Exists in database
     - Not expired
     - Not revoked
     - Device fingerprint matches
  4. Backend generates new access token
  5. Backend rotates refresh token (optional but recommended)
  6. Backend invalidates old refresh token
  7. Return new tokens
```

---

## 2. Authorization System

### 2.1 Role-Based Access Control (RBAC)

```
Database Schema:
- users (id, email, role_id, status)
- roles (id, name, description)
- permissions (id, resource, action, description)
- role_permissions (role_id, permission_id)

Roles:
- STUDENT: View own data, submit assessments
- ADMIN: Full access to all resources
- TEACHER: (Phase 2) View assigned students, manage assessments
- PARENT: (Phase 2) View children's data
```

### 2.2 Permission Matrix

| Resource | Action | Student | Admin | Teacher (P2) | Parent (P2) |
|----------|--------|---------|-------|--------------|-------------|
| Own Profile | Read | ✓ | ✓ | ✓ | ✓ |
| Own Profile | Update | ✓ | ✓ | ✓ | ✓ |
| Other Profiles | Read | ✗ | ✓ | ✓ (assigned) | ✓ (children) |
| Other Profiles | Update | ✗ | ✓ | ✗ | ✗ |
| Assessments | Create | ✗ | ✓ | ✓ | ✗ |
| Assessments | Read Own | ✓ | ✓ | ✓ | ✓ (children) |
| Assessments | Read All | ✗ | ✓ | ✓ (assigned) | ✗ |
| Assessments | Update | ✗ | ✓ | ✓ | ✗ |
| Assessments | Delete | ✗ | ✓ | ✗ | ✗ |
| Submissions | Create | ✓ | ✓ | ✗ | ✗ |
| Submissions | Read Own | ✓ | ✓ | ✗ | ✓ (children) |
| Submissions | Read All | ✗ | ✓ | ✓ | ✗ |
| Results | View Own | ✓ | ✓ | ✓ | ✓ (children) |
| Results | View All | ✗ | ✓ | ✓ (assigned) | ✗ |
| Analytics | View Own | ✓ | ✓ | ✓ | ✓ (children) |
| Analytics | View All | ✗ | ✓ | ✓ (assigned) | ✗ |
| Users | Create | ✗ | ✓ | ✗ | ✗ |
| Users | Read | ✗ | ✓ | ✓ (assigned) | ✗ |
| Users | Update | ✗ | ✓ | ✗ | ✗ |
| Users | Delete | ✗ | ✓ | ✗ | ✗ |

### 2.3 API Endpoint Protection

```javascript
// Endpoint protection patterns
app.get('/api/profile/:id', 
  authenticate,           // Verify JWT token
  authorize(['student', 'admin', 'teacher']),  // Role check
  ownershipCheck,        // Verify user owns resource or has permission
  handler
);

// Protection levels
1. Public: No authentication (login, register, health check)
2. Authenticated: Valid JWT required
3. Role-based: Specific role required
4. Permission-based: Specific permission required
5. Ownership: User must own resource or have override permission
```

### 2.4 Database Row-Level Security (RLS)

```sql
-- Enable RLS on tables
ALTER TABLE assessments ENABLE ROW LEVEL SECURITY;
ALTER TABLE submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE results ENABLE ROW LEVEL SECURITY;

-- Students see only their own data
CREATE POLICY student_view_own_submissions ON submissions
  FOR SELECT
  USING (auth.user_id() = student_id);

CREATE POLICY student_view_own_results ON results
  FOR SELECT
  USING (auth.user_id() = student_id);

-- Admins see all data
CREATE POLICY admin_all_access ON submissions
  FOR ALL
  USING (auth.user_role() = 'admin');

-- Students can insert their own submissions
CREATE POLICY student_insert_submission ON submissions
  FOR INSERT
  WITH CHECK (auth.user_id() = student_id);

-- Function to get current user context
CREATE FUNCTION auth.user_id() RETURNS uuid AS $$
  SELECT current_setting('app.user_id', true)::uuid;
$$ LANGUAGE sql STABLE;

CREATE FUNCTION auth.user_role() RETURNS text AS $$
  SELECT current_setting('app.user_role', true);
$$ LANGUAGE sql STABLE;

-- Set user context in API middleware
SET LOCAL app.user_id = 'uuid-from-jwt';
SET LOCAL app.user_role = 'student';
```

---

## 3. Token Management

### 3.1 JWT Structure

```javascript
// Access Token (15 min expiry)
{
  "header": {
    "alg": "HS256",
    "typ": "JWT"
  },
  "payload": {
    "sub": "user_id",
    "role": "student",
    "permissions": ["read:own", "submit:assessment"],
    "email": "user@example.com",
    "iat": 1721404800,
    "exp": 1721405700,
    "type": "access"
  },
  "signature": "..."
}

// Refresh Token (7 day expiry)
{
  "header": {
    "alg": "HS256",
    "typ": "JWT"
  },
  "payload": {
    "sub": "user_id",
    "token_id": "unique_token_id",
    "device": "fingerprint_hash",
    "iat": 1721404800,
    "exp": 1722009600,
    "type": "refresh"
  },
  "signature": "..."
}
```

### 3.2 Token Storage Strategy

```
Access Token:
  - Storage: httpOnly cookie (primary) or memory (SPA alternative)
  - Name: access_token
  - Flags: HttpOnly, Secure, SameSite=Strict
  - Expiry: 15 minutes
  - Pros: Automatic inclusion, XSS protection
  - Cons: CSRF vulnerable (mitigated by SameSite)

Refresh Token:
  - Storage: httpOnly cookie (ONLY)
  - Name: refresh_token
  - Flags: HttpOnly, Secure, SameSite=Strict, Path=/auth/refresh
  - Expiry: 7 days
  - Never store in localStorage (XSS risk)
  
Alternative (SPA with different domain):
  - Access token in memory (lost on refresh)
  - Refresh token in httpOnly cookie
  - Silent refresh before expiry
```

### 3.3 Token Refresh Mechanism

```javascript
// Token refresh flow
async function refreshTokens() {
  try {
    // Send refresh token (automatic from cookie)
    const response = await fetch('/auth/refresh', {
      method: 'POST',
      credentials: 'include'
    });
    
    if (response.ok) {
      // New access token set in cookie automatically
      return true;
    }
    
    // Refresh token expired/invalid
    redirectToLogin();
    return false;
  } catch (error) {
    redirectToLogin();
    return false;
  }
}

// Automatic refresh before expiry
setInterval(() => {
  const tokenExp = getTokenExpiry(); // From JWT payload
  const now = Date.now() / 1000;
  
  if (tokenExp - now < 60) { // Refresh 1 min before expiry
    refreshTokens();
  }
}, 30000); // Check every 30 seconds
```

### 3.4 Token Revocation Strategy

```sql
-- Refresh tokens table
CREATE TABLE refresh_tokens (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES users(id),
  token_hash TEXT NOT NULL,
  device_info JSONB,
  created_at TIMESTAMP DEFAULT NOW(),
  expires_at TIMESTAMP NOT NULL,
  revoked_at TIMESTAMP,
  last_used_at TIMESTAMP
);

-- Revocation scenarios
1. Logout: Revoke current refresh token
2. Logout all devices: Revoke all user's refresh tokens
3. Password change: Revoke all user's refresh tokens
4. Security breach: Revoke all tokens for affected users
5. Token rotation: Revoke old token when issuing new one

-- Check token validity
SELECT * FROM refresh_tokens
WHERE token_hash = hash(token)
  AND revoked_at IS NULL
  AND expires_at > NOW();
```

---

## 4. Security Measures

### 4.1 Password Security

```javascript
// Password hashing with bcrypt
const bcrypt = require('bcrypt');
const SALT_ROUNDS = 12;

async function hashPassword(password) {
  return await bcrypt.hash(password, SALT_ROUNDS);
}

async function verifyPassword(password, hash) {
  return await bcrypt.compare(password, hash);
}

// Password requirements
const PASSWORD_REGEX = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;

function validatePassword(password) {
  return {
    minLength: password.length >= 8,
    hasUppercase: /[A-Z]/.test(password),
    hasLowercase: /[a-z]/.test(password),
    hasNumber: /\d/.test(password),
    hasSpecial: /[@$!%*?&]/.test(password)
  };
}
```

### 4.2 Rate Limiting

```javascript
// Login rate limiting
const rateLimit = require('express-rate-limit');

const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // 5 attempts per window
  message: 'Too many login attempts, please try again later',
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req) => req.body.email || req.ip
});

app.post('/auth/login', loginLimiter, loginHandler);

// API rate limiting
const apiLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute
  max: 100, // 100 requests per minute
  keyGenerator: (req) => req.user?.id || req.ip
});

app.use('/api', apiLimiter);
```

### 4.3 Account Lockout

```sql
-- Track failed attempts
CREATE TABLE login_attempts (
  id SERIAL PRIMARY KEY,
  user_id UUID REFERENCES users(id),
  ip_address INET,
  success BOOLEAN,
  attempted_at TIMESTAMP DEFAULT NOW()
);

-- User lockout tracking
ALTER TABLE users ADD COLUMN failed_attempts INT DEFAULT 0;
ALTER TABLE users ADD COLUMN locked_until TIMESTAMP;

-- Lockout logic
UPDATE users
SET failed_attempts = failed_attempts + 1,
    locked_until = CASE 
      WHEN failed_attempts + 1 >= 5 THEN NOW() + INTERVAL '30 minutes'
      ELSE locked_until
    END
WHERE id = $1;
```

### 4.4 CSRF Protection

```javascript
// CSRF token generation and validation
const csrf = require('csurf');

const csrfProtection = csrf({
  cookie: {
    httpOnly: true,
    secure: true,
    sameSite: 'strict'
  }
});

// Apply to state-changing endpoints
app.post('/api/*', csrfProtection, handler);

// Frontend sends token
fetch('/api/resource', {
  method: 'POST',
  headers: {
    'X-CSRF-Token': getCsrfToken() // From cookie or meta tag
  }
});

// Alternative: Double submit cookie pattern
// - Send CSRF token in both cookie and header
// - Backend verifies they match
```

### 4.5 XSS Prevention

```javascript
// Content Security Policy
app.use((req, res, next) => {
  res.setHeader('Content-Security-Policy', 
    "default-src 'self'; " +
    "script-src 'self'; " +
    "style-src 'self' 'unsafe-inline'; " +
    "img-src 'self' data: https:; " +
    "font-src 'self'; " +
    "connect-src 'self'; " +
    "frame-ancestors 'none';"
  );
  next();
});

// Input sanitization
const validator = require('validator');

function sanitizeInput(input) {
  return validator.escape(input);
}

// Output encoding (use framework defaults)
// React: Automatic escaping in JSX
// Express + EJS: Use <%- for raw, <%= for escaped
```

### 4.6 Secure Session Handling

```javascript
// Secure cookie configuration
app.use(cookieParser());

const COOKIE_OPTIONS = {
  httpOnly: true,      // Prevent JS access
  secure: true,        // HTTPS only
  sameSite: 'strict',  // CSRF protection
  maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
  signed: true,        // Prevent tampering
  path: '/'
};

// Set auth cookies
res.cookie('access_token', accessToken, {
  ...COOKIE_OPTIONS,
  maxAge: 15 * 60 * 1000 // 15 minutes
});

res.cookie('refresh_token', refreshToken, {
  ...COOKIE_OPTIONS,
  path: '/auth/refresh' // Restrict to refresh endpoint
});
```

---

## 5. API Authentication Middleware

### 5.1 Middleware Flow

```javascript
// Authentication middleware
async function authenticate(req, res, next) {
  try {
    // 1. Extract token
    const token = extractToken(req);
    if (!token) {
      return res.status(401).json({ error: 'No token provided' });
    }
    
    // 2. Verify token signature and expiry
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // 3. Check token type
    if (decoded.type !== 'access') {
      return res.status(401).json({ error: 'Invalid token type' });
    }
    
    // 4. Optional: Check if token is revoked (blacklist)
    const isRevoked = await isTokenRevoked(decoded.jti);
    if (isRevoked) {
      return res.status(401).json({ error: 'Token revoked' });
    }
    
    // 5. Attach user to request
    req.user = {
      id: decoded.sub,
      role: decoded.role,
      permissions: decoded.permissions
    };
    
    next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ error: 'Token expired' });
    }
    return res.status(401).json({ error: 'Invalid token' });
  }
}

function extractToken(req) {
  // Try cookie first
  if (req.cookies?.access_token) {
    return req.cookies.access_token;
  }
  
  // Fallback to Authorization header
  const authHeader = req.headers.authorization;
  if (authHeader?.startsWith('Bearer ')) {
    return authHeader.substring(7);
  }
  
  return null;
}
```

### 5.2 Authorization Middleware

```javascript
// Role-based authorization
function authorize(allowedRoles) {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ error: 'Unauthorized' });
    }
    
    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({ error: 'Forbidden' });
    }
    
    next();
  };
}

// Permission-based authorization
function requirePermission(permission) {
  return (req, res, next) => {
    if (!req.user?.permissions.includes(permission)) {
      return res.status(403).json({ error: 'Insufficient permissions' });
    }
    next();
  };
}

// Ownership verification
async function requireOwnership(req, res, next) {
  const resourceId = req.params.id;
  const resource = await getResource(resourceId);
  
  // Allow if owner or admin
  if (resource.user_id === req.user.id || req.user.role === 'admin') {
    next();
  } else {
    res.status(403).json({ error: 'Access denied' });
  }
}
```

### 5.3 Error Handling

```javascript
// Centralized error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  
  // Authentication errors
  if (err.name === 'UnauthorizedError') {
    return res.status(401).json({
      error: 'Unauthorized',
      message: 'Invalid or expired token'
    });
  }
  
  // Authorization errors
  if (err.name === 'ForbiddenError') {
    return res.status(403).json({
      error: 'Forbidden',
      message: 'Insufficient permissions'
    });
  }
  
  // Generic error
  res.status(500).json({
    error: 'Internal Server Error',
    message: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

// Custom error responses
const AuthErrors = {
  INVALID_CREDENTIALS: { code: 401, message: 'Invalid email or password' },
  ACCOUNT_LOCKED: { code: 403, message: 'Account locked due to failed attempts' },
  EMAIL_NOT_VERIFIED: { code: 403, message: 'Please verify your email' },
  TOKEN_EXPIRED: { code: 401, message: 'Session expired, please login again' },
  INSUFFICIENT_PERMISSIONS: { code: 403, message: 'You do not have permission' }
};
```

---

## 6. Database Security

### 6.1 User Credentials Storage

```sql
-- Users table with security fields
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  role_id INT REFERENCES roles(id),
  status VARCHAR(20) DEFAULT 'unverified',
  email_verified BOOLEAN DEFAULT FALSE,
  phone_verified BOOLEAN DEFAULT FALSE,
  failed_attempts INT DEFAULT 0,
  locked_until TIMESTAMP,
  last_login TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_status ON users(status);
CREATE INDEX idx_users_locked ON users(locked_until) WHERE locked_until IS NOT NULL;

-- Never expose password_hash in queries
CREATE VIEW user_public AS
SELECT id, email, role_id, status, email_verified, last_login, created_at
FROM users;
```

### 6.2 Session Management

```sql
-- Refresh tokens table
CREATE TABLE refresh_tokens (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  token_hash TEXT NOT NULL,
  device_fingerprint TEXT,
  ip_address INET,
  user_agent TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  expires_at TIMESTAMP NOT NULL,
  revoked_at TIMESTAMP,
  last_used_at TIMESTAMP,
  CONSTRAINT valid_expiry CHECK (expires_at > created_at)
);

-- Indexes
CREATE INDEX idx_refresh_tokens_user ON refresh_tokens(user_id);
CREATE INDEX idx_refresh_tokens_hash ON refresh_tokens(token_hash);
CREATE INDEX idx_refresh_tokens_expiry ON refresh_tokens(expires_at);

-- Cleanup expired tokens (run periodically)
DELETE FROM refresh_tokens WHERE expires_at < NOW();
```

### 6.3 PostgreSQL Row-Level Security

```sql
-- Enable RLS
ALTER TABLE assessments ENABLE ROW LEVEL SECURITY;
ALTER TABLE submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE results ENABLE ROW LEVEL SECURITY;

-- Helper functions
CREATE OR REPLACE FUNCTION current_user_id() RETURNS UUID AS $$
  SELECT nullif(current_setting('app.user_id', true), '')::uuid;
$$ LANGUAGE sql STABLE;

CREATE OR REPLACE FUNCTION current_user_role() RETURNS TEXT AS $$
  SELECT nullif(current_setting('app.user_role', true), '');
$$ LANGUAGE sql STABLE;

-- Policies for students
CREATE POLICY students_read_own_submissions ON submissions
  FOR SELECT
  TO authenticated
  USING (student_id = current_user_id() OR current_user_role() = 'admin');

CREATE POLICY students_create_submissions ON submissions
  FOR INSERT
  TO authenticated
  WITH CHECK (student_id = current_user_id());

-- Policies for admins
CREATE POLICY admins_all_access ON submissions
  FOR ALL
  TO authenticated
  USING (current_user_role() = 'admin');

-- Set user context in API middleware
async function setDbUserContext(req, res, next) {
  if (req.user) {
    await db.query('SELECT set_config($1, $2, true)', ['app.user_id', req.user.id]);
    await db.query('SELECT set_config($1, $2, true)', ['app.user_role', req.user.role]);
  }
  next();
}
```

---

## Implementation Checklist

### Backend Setup
- [ ] Install dependencies: jsonwebtoken, bcrypt, express-rate-limit, cookie-parser
- [ ] Configure environment variables: JWT_SECRET, REFRESH_SECRET, BCRYPT_ROUNDS
- [ ] Implement password hashing utilities
- [ ] Create JWT generation and validation utilities
- [ ] Build authentication middleware
- [ ] Build authorization middleware
- [ ] Set up rate limiting
- [ ] Configure CSRF protection
- [ ] Implement refresh token rotation
- [ ] Set up email service for verification/reset
- [ ] Configure OAuth providers (Google, Facebook)
- [ ] Implement SMS service for OTP

### Database Setup
- [ ] Create users table with security fields
- [ ] Create roles and permissions tables
- [ ] Create refresh_tokens table
- [ ] Enable Row-Level Security on sensitive tables
- [ ] Create RLS policies for each role
- [ ] Create indexes for performance
- [ ] Set up cleanup job for expired tokens

### Frontend Setup
- [ ] Implement token storage (httpOnly cookies)
- [ ] Build automatic token refresh logic
- [ ] Create protected route components
- [ ] Implement login/register forms with validation
- [ ] Add error handling for 401/403 responses
- [ ] Build password strength indicator
- [ ] Implement social login buttons
- [ ] Create email verification UI
- [ ] Create password reset flow

### Testing
- [ ] Unit tests for password hashing
- [ ] Unit tests for JWT generation/validation
- [ ] Integration tests for auth flows
- [ ] Test rate limiting
- [ ] Test account lockout
- [ ] Test token refresh mechanism
- [ ] Test RLS policies
- [ ] Security audit and penetration testing

---

**Document Version:** 1.0  
**Last Updated:** 2026-07-19  
**Word Count:** ~2480