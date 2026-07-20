# REST API Architecture and Endpoints Documentation
## Student Assessment Platform

---

## Table of Contents
1. [API Architecture Principles](#api-architecture-principles)
2. [Standard Response Formats](#standard-response-formats)
3. [Authentication APIs](#authentication-apis)
4. [User/Profile APIs](#userprofile-apis)
5. [Question APIs](#question-apis)
6. [Test APIs](#test-apis)
7. [Subscription APIs](#subscription-apis)
8. [Gamification APIs](#gamification-apis)
9. [Admin APIs](#admin-apis)
10. [Rate Limiting](#rate-limiting)

---

## API Architecture Principles

### RESTful Design Principles

**Resource-Based URLs:**
- URLs represent resources (nouns), not actions
- Use plural nouns for collections: `/api/v1/questions`, `/api/v1/tests`
- Use hierarchical structure for relationships: `/api/v1/tests/{testId}/questions`

**HTTP Methods Usage:**
- `GET` - Retrieve resources (safe, idempotent)
- `POST` - Create new resources or trigger actions
- `PUT` - Full replacement of a resource (idempotent)
- `PATCH` - Partial update of a resource
- `DELETE` - Remove a resource (idempotent)

**Statelessness:**
- Each request contains all necessary information
- Authentication via JWT tokens in headers
- No server-side session storage

**URL Structure Conventions:**
```
https://api.example.com/api/v1/{resource}/{id}/{sub-resource}
```

### HTTP Status Codes

| Code | Meaning | Usage |
|------|---------|-------|
| 200 | OK | Successful GET, PUT, PATCH, DELETE |
| 201 | Created | Successful POST that creates a resource |
| 204 | No Content | Successful DELETE with no response body |
| 400 | Bad Request | Invalid request syntax or validation errors |
| 401 | Unauthorized | Missing or invalid authentication token |
| 403 | Forbidden | Authenticated but insufficient permissions |
| 404 | Not Found | Resource doesn't exist |
| 409 | Conflict | Resource conflict (duplicate email, etc.) |
| 422 | Unprocessable Entity | Validation errors with detailed field errors |
| 429 | Too Many Requests | Rate limit exceeded |
| 500 | Internal Server Error | Server-side error |
| 503 | Service Unavailable | Server temporarily unavailable |

### API Versioning Strategy

**URL-Based Versioning:**
```
/api/v1/questions
/api/v2/questions
```

**Benefits:**
- Clear and explicit version in URL
- Easy to route different versions
- Simple for clients to understand

**Version Header (Alternative):**
```
Accept: application/vnd.sap.v1+json
```

### Pagination Strategy

**Offset-Based Pagination:**
```
GET /api/v1/questions?page=2&limit=20
```

**Response includes:**
- `data`: Array of resources
- `pagination`: Metadata object with page info

### Filtering and Sorting

**Filtering:**
```
GET /api/v1/questions?subject_id=5&difficulty=medium&board_id=1
```

**Sorting:**
```
GET /api/v1/questions?sort_by=created_at&order=desc
```

**Multiple Sort Fields:**
```
GET /api/v1/questions?sort_by=difficulty,created_at&order=asc,desc
```

---

## Standard Response Formats

### Success Response Format

```json
{
  "success": true,
  "data": {
    // Resource data or array of resources
  },
  "message": "Operation completed successfully",
  "timestamp": "2026-07-19T10:30:00Z"
}
```

### Success Response with Pagination

```json
{
  "success": true,
  "data": [
    // Array of resources
  ],
  "pagination": {
    "page": 2,
    "limit": 20,
    "total_items": 156,
    "total_pages": 8,
    "has_next": true,
    "has_previous": true
  },
  "message": "Questions retrieved successfully",
  "timestamp": "2026-07-19T10:30:00Z"
}
```

### Error Response Format

```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid input data",
    "details": [
      {
        "field": "email",
        "message": "Invalid email format"
      },
      {
        "field": "password",
        "message": "Password must be at least 8 characters"
      }
    ]
  },
  "timestamp": "2026-07-19T10:30:00Z"
}
```

### Common Query Parameters

| Parameter | Type | Description | Example |
|-----------|------|-------------|---------|
| `page` | integer | Page number (1-indexed) | `?page=2` |
| `limit` | integer | Items per page (default: 20, max: 100) | `?limit=50` |
| `sort_by` | string | Field to sort by | `?sort_by=created_at` |
| `order` | string | Sort order (asc/desc) | `?order=desc` |
| `search` | string | Search query | `?search=algebra` |
| `fields` | string | Comma-separated fields to return | `?fields=id,title,difficulty` |

---

## Authentication APIs

### 1. Register New User

**Endpoint:** `POST /api/v1/auth/register`  
**Authentication:** No  
**Role:** Public

**Request Body:**
```json
{
  "full_name": "John Doe",
  "email": "john.doe@example.com",
  "password": "SecurePass123!",
  "phone_number": "+1234567890",
  "date_of_birth": "2005-03-15",
  "board_id": 1,
  "class_id": 3
}
```

**Success Response (201):**
```json
{
  "success": true,
  "data": {
    "user": {
      "id": 125,
      "full_name": "John Doe",
      "email": "john.doe@example.com",
      "role": "student",
      "is_email_verified": false,
      "created_at": "2026-07-19T10:30:00Z"
    },
    "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "refresh_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "token_type": "Bearer",
    "expires_in": 3600
  },
  "message": "Registration successful. Please verify your email.",
  "timestamp": "2026-07-19T10:30:00Z"
}
```

**Error Response (400):**
```json
{
  "success": false,
  "error": {
    "code": "EMAIL_EXISTS",
    "message": "Email already registered",
    "details": null
  },
  "timestamp": "2026-07-19T10:30:00Z"
}
```

**cURL Example:**
```bash
curl -X POST https://api.example.com/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "full_name": "John Doe",
    "email": "john.doe@example.com",
    "password": "SecurePass123!",
    "phone_number": "+1234567890",
    "date_of_birth": "2005-03-15",
    "board_id": 1,
    "class_id": 3
  }'
```

---

### 2. Login

**Endpoint:** `POST /api/v1/auth/login`  
**Authentication:** No  
**Role:** Public

**Request Body:**
```json
{
  "email": "john.doe@example.com",
  "password": "SecurePass123!"
}
```

**Success Response (200):**
```json
{
  "success": true,
  "data": {
    "user": {
      "id": 125,
      "full_name": "John Doe",
      "email": "john.doe@example.com",
      "role": "student",
      "is_email_verified": true,
      "profile_image": "https://cdn.example.com/profiles/125.jpg"
    },
    "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "refresh_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "token_type": "Bearer",
    "expires_in": 3600
  },
  "message": "Login successful",
  "timestamp": "2026-07-19T10:30:00Z"
}
```

**Error Response (401):**
```json
{
  "success": false,
  "error": {
    "code": "INVALID_CREDENTIALS",
    "message": "Invalid email or password",
    "details": null
  },
  "timestamp": "2026-07-19T10:30:00Z"
}
```

**cURL Example:**
```bash
curl -X POST https://api.example.com/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john.doe@example.com",
    "password": "SecurePass123!"
  }'
```

---

### 3. Refresh Token

**Endpoint:** `POST /api/v1/auth/refresh`  
**Authentication:** No (requires refresh token)  
**Role:** Public

**Request Body:**
```json
{
  "refresh_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Success Response (200):**
```json
{
  "success": true,
  "data": {
    "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "refresh_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "token_type": "Bearer",
    "expires_in": 3600
  },
  "message": "Token refreshed successfully",
  "timestamp": "2026-07-19T10:30:00Z"
}
```

---

### 4. Logout

**Endpoint:** `POST /api/v1/auth/logout`  
**Authentication:** Yes  
**Role:** All authenticated users

**Headers:**
```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Request Body:**
```json
{
  "refresh_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Success Response (200):**
```json
{
  "success": true,
  "data": null,
  "message": "Logout successful",
  "timestamp": "2026-07-19T10:30:00Z"
}
```

---

### 5. Verify Email

**Endpoint:** `POST /api/v1/auth/verify-email`  
**Authentication:** No  
**Role:** Public

**Request Body:**
```json
{
  "token": "abc123def456ghi789"
}
```

**Success Response (200):**
```json
{
  "success": true,
  "data": {
    "email_verified": true
  },
  "message": "Email verified successfully",
  "timestamp": "2026-07-19T10:30:00Z"
}
```

---

### 6. Request Password Reset

**Endpoint:** `POST /api/v1/auth/forgot-password`  
**Authentication:** No  
**Role:** Public

**Request Body:**
```json
{
  "email": "john.doe@example.com"
}
```

**Success Response (200):**
```json
{
  "success": true,
  "data": null,
  "message": "Password reset email sent if account exists",
  "timestamp": "2026-07-19T10:30:00Z"
}
```

---

### 7. Reset Password

**Endpoint:** `POST /api/v1/auth/reset-password`  
**Authentication:** No  
**Role:** Public

**Request Body:**
```json
{
  "token": "reset_token_xyz",
  "new_password": "NewSecurePass123!"
}
```

**Success Response (200):**
```json
{
  "success": true,
  "data": null,
  "message": "Password reset successfully",
  "timestamp": "2026-07-19T10:30:00Z"
}
```

---

## User/Profile APIs

### 8. Get Current User Profile

**Endpoint:** `GET /api/v1/users/me`  
**Authentication:** Yes  
**Role:** All authenticated users

**Headers:**
```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Success Response (200):**
```json
{
  "success": true,
  "data": {
    "id": 125,
    "full_name": "John Doe",
    "email": "john.doe@example.com",
    "phone_number": "+1234567890",
    "date_of_birth": "2005-03-15",
    "profile_image": "https://cdn.example.com/profiles/125.jpg",
    "role": "student",
    "board": {
      "id": 1,
      "name": "CBSE"
    },
    "class": {
      "id": 3,
      "name": "Class 10"
    },
    "subscription": {
      "plan_name": "Premium",
      "status": "active",
      "expires_at": "2027-01-15T00:00:00Z"
    },
    "gamification": {
      "total_points": 2450,
      "level": 8,
      "badges_count": 12
    },
    "is_email_verified": true,
    "created_at": "2026-01-10T08:20:00Z",
    "updated_at": "2026-07-15T14:30:00Z"
  },
  "message": "Profile retrieved successfully",
  "timestamp": "2026-07-19T10:30:00Z"
}
```

**cURL Example:**
```bash
curl -X GET https://api.example.com/api/v1/users/me \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

---

### 9. Update User Profile

**Endpoint:** `PATCH /api/v1/users/me`  
**Authentication:** Yes  
**Role:** All authenticated users

**Request Body:**
```json
{
  "full_name": "John Michael Doe",
  "phone_number": "+1234567891",
  "board_id": 2,
  "class_id": 4
}
```

**Success Response (200):**
```json
{
  "success": true,
  "data": {
    "id": 125,
    "full_name": "John Michael Doe",
    "email": "john.doe@example.com",
    "phone_number": "+1234567891",
    "board_id": 2,
    "class_id": 4,
    "updated_at": "2026-07-19T10:35:00Z"
  },
  "message": "Profile updated successfully",
  "timestamp": "2026-07-19T10:35:00Z"
}
```

---

### 10. Change Password

**Endpoint:** `POST /api/v1/users/me/change-password`  
**Authentication:** Yes  
**Role:** All authenticated users

**Request Body:**
```json
{
  "current_password": "SecurePass123!",
  "new_password": "NewSecurePass456!"
}
```

**Success Response (200):**
```json
{
  "success": true,
  "data": null,
  "message": "Password changed successfully",
  "timestamp": "2026-07-19T10:40:00Z"
}
```

**Error Response (400):**
```json
{
  "success": false,
  "error": {
    "code": "INVALID_PASSWORD",
    "message": "Current password is incorrect",
    "details": null
  },
  "timestamp": "2026-07-19T10:40:00Z"
}
```

---

### 11. Upload Profile Image

**Endpoint:** `POST /api/v1/users/me/profile-image`  
**Authentication:** Yes  
**Role:** All authenticated users

**Request:** Multipart form data
```
Content-Type: multipart/form-data
image: [file]
```

**Success Response (200):**
```json
{
  "success": true,
  "data": {
    "profile_image": "https://cdn.example.com/profiles/125.jpg",
    "uploaded_at": "2026-07-19T10:45:00Z"
  },
  "message": "Profile image uploaded successfully",
  "timestamp": "2026-07-19T10:45:00Z"
}
```

---

## Question APIs

### 12. List Questions (Student)

**Endpoint:** `GET /api/v1/questions`  
**Authentication:** Yes  
**Role:** Student

**Query Parameters:**
- `page` (integer): Page number
- `limit` (integer): Items per page
- `subject_id` (integer): Filter by subject
- `board_id` (integer): Filter by board
- `class_id` (integer): Filter by class
- `category_id` (integer): Filter by category (chapter/topic)
- `difficulty` (string): Filter by difficulty (easy/medium/hard)
- `question_type` (string): Filter by type (mcq/true_false/fill_blank/short_answer/long_answer)
- `search` (string): Search in question text
- `sort_by` (string): Sort field (created_at/difficulty/view_count)
- `order` (string): Sort order (asc/desc)

**Example Request:**
```
GET /api/v1/questions?subject_id=5&difficulty=medium&page=1&limit=20&sort_by=created_at&order=desc
```

**Success Response (200):**
```json
{
  "success": true,
  "data": [
    {
      "id": 1234,
      "question_text": "What is the derivative of x^2?",
      "question_type": "mcq",
      "difficulty": "medium",
      "marks": 2,
      "subject": {
        "id": 5,
        "name": "Mathematics"
      },
      "category": {
        "id": 12,
        "name": "Differentiation",
        "parent": "Calculus"
      },
      "options": [
        {"id": 1, "text": "x", "is_correct": false},
        {"id": 2, "text": "2x", "is_correct": true},
        {"id": 3, "text": "x^2", "is_correct": false},
        {"id": 4, "text": "2x^2", "is_correct": false}
      ],
      "tags": ["calculus", "derivatives", "basic"],
      "view_count": 245,
      "created_at": "2026-06-10T09:20:00Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total_items": 156,
    "total_pages": 8,
    "has_next": true,
    "has_previous": false
  },
  "message": "Questions retrieved successfully",
  "timestamp": "2026-07-19T11:00:00Z"
}
```

**cURL Example:**
```bash
curl -X GET "https://api.example.com/api/v1/questions?subject_id=5&difficulty=medium&page=1&limit=20" \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

---

### 13. Get Question Details

**Endpoint:** `GET /api/v1/questions/{questionId}`  
**Authentication:** Yes  
**Role:** Student

**Path Parameters:**
- `questionId` (integer): Question ID

**Success Response (200):**
```json
{
  "success": true,
  "data": {
    "id": 1234,
    "question_text": "What is the derivative of x^2?",
    "question_type": "mcq",
    "difficulty": "medium",
    "marks": 2,
    "time_limit_seconds": 120,
    "subject": {
      "id": 5,
      "name": "Mathematics",
      "board_id": 1
    },
    "category": {
      "id": 12,
      "name": "Differentiation",
      "parent": "Calculus"
    },
    "options": [
      {"id": 1, "text": "x", "is_correct": false},
      {"id": 2, "text": "2x", "is_correct": true},
      {"id": 3, "text": "x^2", "is_correct": false},
      {"id": 4, "text": "2x^2", "is_correct": false}
    ],
    "explanation": "The derivative of x^2 is 2x using the power rule.",
    "solution_steps": [
      "Apply the power rule: d/dx(x^n) = n*x^(n-1)",
      "For x^2, n=2",
      "Result: 2*x^(2-1) = 2x"
    ],
    "hints": ["Remember the power rule", "Multiply by the exponent"],
    "reference_materials": ["Chapter 5, Page 45"],
    "tags": ["calculus", "derivatives", "basic"],
    "view_count": 245,
    "created_at": "2026-06-10T09:20:00Z",
    "updated_at": "2026-07-01T14:30:00Z"
  },
  "message": "Question retrieved successfully",
  "timestamp": "2026-07-19T11:05:00Z"
}
```

---

### 14. Create Question (Admin)

**Endpoint:** `POST /api/v1/admin/questions`  
**Authentication:** Yes  
**Role:** Admin/Content Creator

**Request Body:**
```json
{
  "question_text": "What is the derivative of x^2?",
  "question_type": "mcq",
  "difficulty": "medium",
  "marks": 2,
  "time_limit_seconds": 120,
  "subject_id": 5,
  "category_id": 12,
  "board_id": 1,
  "class_id": 3,
  "options": [
    {"text": "x", "is_correct": false},
    {"text": "2x", "is_correct": true},
    {"text": "x^2", "is_correct": false},
    {"text": "2x^2", "is_correct": false}
  ],
  "explanation": "The derivative of x^2 is 2x using the power rule.",
  "solution_steps": [
    "Apply the power rule: d/dx(x^n) = n*x^(n-1)",
    "For x^2, n=2",
    "Result: 2*x^(2-1) = 2x"
  ],
  "hints": ["Remember the power rule", "Multiply by the exponent"],
  "reference_materials": ["Chapter 5, Page 45"],
  "tags": ["calculus", "derivatives", "basic"]
}
```

**Success Response (201):**
```json
{
  "success": true,
  "data": {
    "id": 1234,
    "question_text": "What is the derivative of x^2?",
    "question_type": "mcq",
    "difficulty": "medium",
    "created_at": "2026-07-19T11:10:00Z"
  },
  "message": "Question created successfully",
  "timestamp": "2026-07-19T11:10:00Z"
}
```

---

### 15. Update Question (Admin)

**Endpoint:** `PATCH /api/v1/admin/questions/{questionId}`  
**Authentication:** Yes  
**Role:** Admin/Content Creator

**Request Body:**
```json
{
  "question_text": "What is the first derivative of x^2?",
  "difficulty": "easy",
  "explanation": "Updated explanation text"
}
```

**Success Response (200):**
```json
{
  "success": true,
  "data": {
    "id": 1234,
    "question_text": "What is the first derivative of x^2?",
    "difficulty": "easy",
    "updated_at": "2026-07-19T11:15:00Z"
  },
  "message": "Question updated successfully",
  "timestamp": "2026-07-19T11:15:00Z"
}
```

---

### 16. Delete Question (Admin)

**Endpoint:** `DELETE /api/v1/admin/questions/{questionId}`  
**Authentication:** Yes  
**Role:** Admin

**Success Response (200):**
```json
{
  "success": true,
  "data": null,
  "message": "Question deleted successfully",
  "timestamp": "2026-07-19T11:20:00Z"
}
```

---

### 17. Report Question Issue

**Endpoint:** `POST /api/v1/questions/{questionId}/report`  
**Authentication:** Yes  
**Role:** Student

**Request Body:**
```json
{
  "issue_type": "incorrect_answer",
  "description": "The correct answer should be option 3, not option 2"
}
```

**Success Response (201):**
```json
{
  "success": true,
  "data": {
    "report_id": 567,
    "status": "pending",
    "created_at": "2026-07-19T11:25:00Z"
  },
  "message": "Report submitted successfully",
  "timestamp": "2026-07-19T11:25:00Z"
}
```

---

## Test APIs

### 18. Create Practice Test

**Endpoint:** `POST /api/v1/tests/practice`  
**Authentication:** Yes  
**Role:** Student

**Request Body:**
```json
{
  "test_name": "Mathematics Practice - Calculus",
  "subject_id": 5,
  "category_ids": [12, 13],
  "difficulty": "medium",
  "question_count": 20,
  "time_limit_minutes": 40
}
```

**Success Response (201):**
```json
{
  "success": true,
  "data": {
    "test_id": 789,
    "test_name": "Mathematics Practice - Calculus",
    "test_type": "practice",
    "question_count": 20,
    "total_marks": 40,
    "time_limit_minutes": 40,
    "created_at": "2026-07-19T11:30:00Z"
  },
  "message": "Practice test created successfully",
  "timestamp": "2026-07-19T11:30:00Z"
}
```

---

### 19. Create Mock Test

**Endpoint:** `POST /api/v1/tests/mock`  
**Authentication:** Yes  
**Role:** Student (requires active subscription)

**Request Body:**
```json
{
  "test_name": "JEE Main Mock Test 1",
  "template_id": 15,
  "board_id": 1,
  "class_id": 3
}
```

**Success Response (201):**
```json
{
  "success": true,
  "data": {
    "test_id": 790,
    "test_name": "JEE Main Mock Test 1",
    "test_type": "mock",
    "question_count": 75,
    "total_marks": 300,
    "time_limit_minutes": 180,
    "sections": [
      {"name": "Physics", "question_count": 25},
      {"name": "Chemistry", "question_count": 25},
      {"name": "Mathematics", "question_count": 25}
    ],
    "created_at": "2026-07-19T11:35:00Z"
  },
  "message": "Mock test created successfully",
  "timestamp": "2026-07-19T11:35:00Z"
}
```

---

### 20. List User Tests

**Endpoint:** `GET /api/v1/tests`  
**Authentication:** Yes  
**Role:** Student

**Query Parameters:**
- `test_type` (string): Filter by type (practice/mock)
- `status` (string): Filter by status (not_started/in_progress/completed)
- `subject_id` (integer): Filter by subject
- `page` (integer): Page number
- `limit` (integer): Items per page

**Success Response (200):**
```json
{
  "success": true,
  "data": [
    {
      "test_id": 789,
      "test_name": "Mathematics Practice - Calculus",
      "test_type": "practice",
      "status": "completed",
      "question_count": 20,
      "total_marks": 40,
      "obtained_marks": 34,
      "percentage": 85.0,
      "time_limit_minutes": 40,
      "time_taken_minutes": 35,
      "started_at": "2026-07-18T10:00:00Z",
      "completed_at": "2026-07-18T10:35:00Z"
    },
    {
      "test_id": 790,
      "test_name": "JEE Main Mock Test 1",
      "test_type": "mock",
      "status": "in_progress",
      "question_count": 75,
      "total_marks": 300,
      "started_at": "2026-07-19T09:00:00Z",
      "time_remaining_seconds": 3420
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total_items": 45,
    "total_pages": 3,
    "has_next": true,
    "has_previous": false
  },
  "message": "Tests retrieved successfully",
  "timestamp": "2026-07-19T11:40:00Z"
}
```

---

### 21. Get Test Details

**Endpoint:** `GET /api/v1/tests/{testId}`  
**Authentication:** Yes  
**Role:** Student

**Success Response (200):**
```json
{
  "success": true,
  "data": {
    "test_id": 789,
    "test_name": "Mathematics Practice - Calculus",
    "test_type": "practice",
    "status": "not_started",
    "description": "Practice test covering differentiation and integration",
    "question_count": 20,
    "total_marks": 40,
    "time_limit_minutes": 40,
    "passing_marks": 16,
    "negative_marking": true,
    "negative_marks_per_question": 0.25,
    "instructions": [
      "All questions are mandatory",
      "Each correct answer: +2 marks",
      "Each incorrect answer: -0.25 marks",
      "Time limit: 40 minutes"
    ],
    "sections": [
      {
        "section_name": "Differentiation",
        "question_count": 10,
        "marks": 20
      },
      {
        "section_name": "Integration",
        "question_count": 10,
        "marks": 20
      }
    ],
    "created_at": "2026-07-19T11:30:00Z"
  },
  "message": "Test details retrieved successfully",
  "timestamp": "2026-07-19T11:45:00Z"
}
```

---

### 22. Start Test

**Endpoint:** `POST /api/v1/tests/{testId}/start`  
**Authentication:** Yes  
**Role:** Student

**Success Response (200):**
```json
{
  "success": true,
  "data": {
    "test_attempt_id": 1001,
    "test_id": 789,
    "status": "in_progress",
    "started_at": "2026-07-19T12:00:00Z",
    "expires_at": "2026-07-19T12:40:00Z",
    "questions": [
      {
        "id": 1234,
        "question_number": 1,
        "question_text": "What is the derivative of x^2?",
        "question_type": "mcq",
        "marks": 2,
        "section": "Differentiation",
        "options": [
          {"id": 1, "text": "x"},
          {"id": 2, "text": "2x"},
          {"id": 3, "text": "x^2"},
          {"id": 4, "text": "2x^2"}
        ]
      }
    ]
  },
  "message": "Test started successfully",
  "timestamp": "2026-07-19T12:00:00Z"
}
```

---

### 23. Submit Test Answer

**Endpoint:** `POST /api/v1/tests/{testId}/answers`  
**Authentication:** Yes  
**Role:** Student

**Request Body:**
```json
{
  "test_attempt_id": 1001,
  "question_id": 1234,
  "answer": {
    "selected_option_id": 2
  },
  "time_spent_seconds": 45
}
```

**Success Response (200):**
```json
{
  "success": true,
  "data": {
    "question_id": 1234,
    "status": "answered",
    "saved_at": "2026-07-19T12:01:00Z"
  },
  "message": "Answer saved successfully",
  "timestamp": "2026-07-19T12:01:00Z"
}
```

---

### 24. Submit Complete Test

**Endpoint:** `POST /api/v1/tests/{testId}/submit`  
**Authentication:** Yes  
**Role:** Student

**Request Body:**
```json
{
  "test_attempt_id": 1001,
  "force_submit": false
}
```

**Success Response (200):**
```json
{
  "success": true,
  "data": {
    "test_attempt_id": 1001,
    "test_id": 789,
    "status": "completed",
    "total_questions": 20,
    "attempted_questions": 18,
    "correct_answers": 15,
    "incorrect_answers": 3,
    "total_marks": 40,
    "obtained_marks": 29.25,
    "percentage": 73.13,
    "time_taken_minutes": 35,
    "rank": 142,
    "completed_at": "2026-07-19T12:35:00Z"
  },
  "message": "Test submitted successfully",
  "timestamp": "2026-07-19T12:35:00Z"
}
```

---

### 25. Get Test Results

**Endpoint:** `GET /api/v1/tests/{testId}/results`  
**Authentication:** Yes  
**Role:** Student

**Success Response (200):**
```json
{
  "success": true,
  "data": {
    "test_attempt_id": 1001,
    "test_name": "Mathematics Practice - Calculus",
    "test_type": "practice",
    "summary": {
      "total_questions": 20,
      "attempted_questions": 18,
      "correct_answers": 15,
      "incorrect_answers": 3,
      "skipped_questions": 2,
      "total_marks": 40,
      "obtained_marks": 29.25,
      "percentage": 73.13,
      "time_taken_minutes": 35,
      "accuracy": 83.33,
      "rank": 142,
      "total_participants": 523
    },
    "section_wise_performance": [
      {
        "section_name": "Differentiation",
        "total_questions": 10,
        "correct": 8,
        "incorrect": 2,
        "percentage": 80.0
      }
    ],
    "difficulty_wise_performance": {
      "easy": {"total": 8, "correct": 7, "percentage": 87.5},
      "medium": {"total": 10, "correct": 7, "percentage": 70.0},
      "hard": {"total": 2, "correct": 1, "percentage": 50.0}
    },
    "detailed_answers": [
      {
        "question_id": 1234,
        "question_number": 1,
        "question_text": "What is the derivative of x^2?",
        "your_answer": "2x",
        "correct_answer": "2x",
        "is_correct": true,
        "marks_obtained": 2,
        "time_spent_seconds": 45,
        "explanation": "The derivative of x^2 is 2x using the power rule."
      }
    ],
    "completed_at": "2026-07-19T12:35:00Z"
  },
  "message": "Test results retrieved successfully",
  "timestamp": "2026-07-19T12:40:00Z"
}
```

---

### 26. Get Test History

**Endpoint:** `GET /api/v1/tests/history`  
**Authentication:** Yes  
**Role:** Student

**Query Parameters:**
- `test_type` (string): Filter by type
- `subject_id` (integer): Filter by subject
- `date_from` (date): Start date
- `date_to` (date): End date
- `page` (integer): Page number
- `limit` (integer): Items per page

**Success Response (200):**
```json
{
  "success": true,
  "data": {
    "summary": {
      "total_tests_taken": 45,
      "average_score": 78.5,
      "total_time_spent_minutes": 1350,
      "highest_score": 95.0,
      "lowest_score": 45.0
    },
    "tests": [
      {
        "test_id": 789,
        "test_name": "Mathematics Practice - Calculus",
        "test_type": "practice",
        "obtained_marks": 29.25,
        "total_marks": 40,
        "percentage": 73.13,
        "rank": 142,
        "completed_at": "2026-07-19T12:35:00Z"
      }
    ]
  },
  "pagination": {
    "page": 1,
    "limit": 20,
    "total_items": 45,
    "total_pages": 3,
    "has_next": true,
    "has_previous": false
  },
  "message": "Test history retrieved successfully",
  "timestamp": "2026-07-19T12:45:00Z"
}
```

---

## Subscription APIs

### 27. List Subscription Plans

**Endpoint:** `GET /api/v1/subscriptions/plans`  
**Authentication:** No  
**Role:** Public

**Success Response (200):**
```json
{
  "success": true,
  "data": [
    {
      "plan_id": 1,
      "name": "Basic",
      "description": "Access to practice tests and basic features",
      "price": 0,
      "currency": "USD",
      "duration_days": 30,
      "features": [
        "10 practice tests per month",
        "Access to question bank",
        "Basic performance analytics"
      ],
      "limitations": {
        "mock_tests": 0,
        "practice_tests": 10,
        "question_access": "limited"
      },
      "is_popular": false
    },
    {
      "plan_id": 2,
      "name": "Premium",
      "description": "Full access with mock tests and advanced features",
      "price": 29.99,
      "currency": "USD",
      "duration_days": 30,
      "features": [
        "Unlimited practice tests",
        "Unlimited mock tests",
        "Full question bank access",
        "Advanced performance analytics",
        "Downloadable reports",
        "Priority support"
      ],
      "limitations": null,
      "is_popular": true
    }
  ],
  "message": "Subscription plans retrieved successfully",
  "timestamp": "2026-07-19T13:00:00Z"
}
```

---

### 28. Create Subscription

**Endpoint:** `POST /api/v1/subscriptions`  
**Authentication:** Yes  
**Role:** Student

**Request Body:**
```json
{
  "plan_id": 2,
  "payment_method": "stripe",
  "payment_token": "tok_visa_1234567890"
}
```

**Success Response (201):**
```json
{
  "success": true,
  "data": {
    "subscription_id": 456,
    "user_id": 125,
    "plan_id": 2,
    "plan_name": "Premium",
    "status": "active",
    "amount": 29.99,
    "currency": "USD",
    "started_at": "2026-07-19T13:05:00Z",
    "expires_at": "2026-08-19T13:05:00Z",
    "auto_renew": true
  },
  "message": "Subscription created successfully",
  "timestamp": "2026-07-19T13:05:00Z"
}
```

---

### 29. Check Subscription Access

**Endpoint:** `GET /api/v1/subscriptions/access`  
**Authentication:** Yes  
**Role:** Student

**Query Parameters:**
- `feature` (string): Feature to check (e.g., "mock_tests", "question_bank")

**Success Response (200):**
```json
{
  "success": true,
  "data": {
    "has_access": true,
    "plan_name": "Premium",
    "subscription_status": "active",
    "expires_at": "2026-08-19T13:05:00Z",
    "days_remaining": 31,
    "features_available": [
      "unlimited_practice_tests",
      "unlimited_mock_tests",
      "full_question_bank",
      "advanced_analytics",
      "downloadable_reports"
    ]
  },
  "message": "Access details retrieved successfully",
  "timestamp": "2026-07-19T13:10:00Z"
}
```

---

### 30. Payment Webhook Handler

**Endpoint:** `POST /api/v1/webhooks/payment`  
**Authentication:** No (webhook signature verification)  
**Role:** System

**Request Body:**
```json
{
  "event_type": "payment.succeeded",
  "payment_id": "pay_xyz123",
  "subscription_id": 456,
  "amount": 29.99,
  "currency": "USD",
  "timestamp": "2026-07-19T13:05:00Z"
}
```

**Success Response (200):**
```json
{
  "success": true,
  "data": {
    "processed": true
  },
  "message": "Webhook processed successfully",
  "timestamp": "2026-07-19T13:05:00Z"
}
```

---

## Gamification APIs

### 31. Get Leaderboard

**Endpoint:** `GET /api/v1/gamification/leaderboard`  
**Authentication:** Yes  
**Role:** Student

**Query Parameters:**
- `scope` (string): Leaderboard scope (global/board/class/subject)
- `board_id` (integer): Filter by board (if scope=board)
- `class_id` (integer): Filter by class (if scope=class)
- `subject_id` (integer): Filter by subject (if scope=subject)
- `period` (string): Time period (all_time/monthly/weekly)
- `limit` (integer): Number of top users (default: 50)

**Success Response (200):**
```json
{
  "success": true,
  "data": {
    "leaderboard_type": "global",
    "period": "monthly",
    "updated_at": "2026-07-19T13:15:00Z",
    "current_user_rank": {
      "rank": 142,
      "user_id": 125,
      "full_name": "John Doe",
      "total_points": 2450,
      "level": 8,
      "badges_count": 12
    },
    "top_users": [
      {
        "rank": 1,
        "user_id": 89,
        "full_name": "Jane Smith",
        "total_points": 8750,
        "level": 15,
        "badges_count": 28,
        "profile_image": "https://cdn.example.com/profiles/89.jpg"
      },
      {
        "rank": 2,
        "user_id": 145,
        "full_name": "Mike Johnson",
        "total_points": 7890,
        "level": 14,
        "badges_count": 25,
        "profile_image": "https://cdn.example.com/profiles/145.jpg"
      }
    ]
  },
  "message": "Leaderboard retrieved successfully",
  "timestamp": "2026-07-19T13:15:00Z"
}
```

---

### 32. Get User Badges

**Endpoint:** `GET /api/v1/gamification/badges`  
**Authentication:** Yes  
**Role:** Student

**Success Response (200):**
```json
{
  "success": true,
  "data": {
    "earned_badges": [
      {
        "badge_id": 5,
        "name": "First Test Champion",
        "description": "Complete your first test with 80% or more",
        "icon_url": "https://cdn.example.com/badges/first_test.png",
        "rarity": "common",
        "points_awarded": 50,
        "earned_at": "2026-06-15T10:20:00Z"
      },
      {
        "badge_id": 12,
        "name": "Streak Master",
        "description": "Maintain a 7-day login streak",
        "icon_url": "https://cdn.example.com/badges/streak_master.png",
        "rarity": "rare",
        "points_awarded": 200,
        "earned_at": "2026-07-10T08:30:00Z"
      }
    ],
    "available_badges": [
      {
        "badge_id": 20,
        "name": "Perfect Score Hero",
        "description": "Score 100% in any mock test",
        "icon_url": "https://cdn.example.com/badges/perfect_score.png",
        "rarity": "legendary",
        "points_reward": 500,
        "progress": {
          "current": 0,
          "required": 1,
          "percentage": 0
        }
      }
    ],
    "total_earned": 12,
    "total_available": 45
  },
  "message": "Badges retrieved successfully",
  "timestamp": "2026-07-19T13:20:00Z"
}
```

---

### 33. Get Points Balance

**Endpoint:** `GET /api/v1/gamification/points`  
**Authentication:** Yes  
**Role:** Student

**Success Response (200):**
```json
{
  "success": true,
  "data": {
    "total_points": 2450,
    "available_points": 1850,
    "redeemed_points": 600,
    "level": 8,
    "level_name": "Expert Learner",
    "points_to_next_level": 550,
    "recent_transactions": [
      {
        "transaction_id": 789,
        "type": "earned",
        "amount": 50,
        "reason": "Completed Mathematics Practice Test",
        "created_at": "2026-07-19T12:35:00Z"
      },
      {
        "transaction_id": 788,
        "type": "redeemed",
        "amount": -200,
        "reason": "Redeemed for Premium Mock Test Access",
        "created_at": "2026-07-18T14:20:00Z"
      }
    ]
  },
  "message": "Points balance retrieved successfully",
  "timestamp": "2026-07-19T13:25:00Z"
}
```

---

### 34. Redeem Points

**Endpoint:** `POST /api/v1/gamification/redeem`  
**Authentication:** Yes  
**Role:** Student

**Request Body:**
```json
{
  "reward_id": 15,
  "points_required": 200
}
```

**Success Response (200):**
```json
{
  "success": true,
  "data": {
    "transaction_id": 790,
    "reward_name": "Unlock Premium Mock Test",
    "points_redeemed": 200,
    "remaining_points": 1650,
    "redemption_code": "MOCK-XYZ123",
    "expires_at": "2026-08-19T13:30:00Z"
  },
  "message": "Points redeemed successfully",
  "timestamp": "2026-07-19T13:30:00Z"
}
```

---

## Admin APIs

### 35. Get Admin Dashboard Stats

**Endpoint:** `GET /api/v1/admin/dashboard`  
**Authentication:** Yes  
**Role:** Admin

**Success Response (200):**
```json
{
  "success": true,
  "data": {
    "overview": {
      "total_users": 12567,
      "active_users_today": 3245,
      "total_questions": 15890,
      "total_tests_taken": 45632,
      "total_subscriptions": 4521,
      "active_subscriptions": 3876,
      "revenue_this_month": 116280.50,
      "revenue_last_month": 108450.25
    },
    "user_growth": {
      "new_users_today": 45,
      "new_users_this_week": 312,
      "new_users_this_month": 1456
    },
    "test_statistics": {
      "tests_taken_today": 523,
      "average_score": 72.5,
      "most_popular_subject": "Mathematics",
      "most_popular_test_type": "mock"
    },
    "question_statistics": {
      "questions_added_this_week": 125,
      "pending_reports": 15,
      "questions_by_difficulty": {
        "easy": 5234,
        "medium": 7456,
        "hard": 3200
      }
    },
    "subscription_statistics": {
      "new_subscriptions_this_month": 234,
      "renewals_this_month": 412,
      "cancellations_this_month": 87,
      "churn_rate": 2.5
    }
  },
  "message": "Dashboard statistics retrieved successfully",
  "timestamp": "2026-07-19T14:00:00Z"
}
```

---

### 36. List All Users (Admin)

**Endpoint:** `GET /api/v1/admin/users`  
**Authentication:** Yes  
**Role:** Admin

**Query Parameters:**
- `role` (string): Filter by role
- `subscription_status` (string): Filter by subscription status
- `search` (string): Search by name/email
- `page` (integer): Page number
- `limit` (integer): Items per page

**Success Response (200):**
```json
{
  "success": true,
  "data": [
    {
      "id": 125,
      "full_name": "John Doe",
      "email": "john.doe@example.com",
      "role": "student",
      "is_email_verified": true,
      "subscription_status": "active",
      "subscription_plan": "Premium",
      "total_tests_taken": 45,
      "average_score": 78.5,
      "created_at": "2026-01-10T08:20:00Z",
      "last_login": "2026-07-19T09:00:00Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 50,
    "total_items": 12567,
    "total_pages": 252,
    "has_next": true,
    "has_previous": false
  },
  "message": "Users retrieved successfully",
  "timestamp": "2026-07-19T14:05:00Z"
}
```

---

### 37. Update User Role (Admin)

**Endpoint:** `PATCH /api/v1/admin/users/{userId}/role`  
**Authentication:** Yes  
**Role:** Admin

**Request Body:**
```json
{
  "role": "content_creator"
}
```

**Success Response (200):**
```json
{
  "success": true,
  "data": {
    "user_id": 125,
    "role": "content_creator",
    "updated_at": "2026-07-19T14:10:00Z"
  },
  "message": "User role updated successfully",
  "timestamp": "2026-07-19T14:10:00Z"
}
```

---

### 38. Manage Boards (Admin)

**Endpoint:** `GET /api/v1/admin/config/boards`  
**Authentication:** Yes  
**Role:** Admin

**Success Response (200):**
```json
{
  "success": true,
  "data": [
    {
      "board_id": 1,
      "name": "CBSE",
      "description": "Central Board of Secondary Education",
      "is_active": true,
      "classes_count": 12,
      "subjects_count": 15
    },
    {
      "board_id": 2,
      "name": "ICSE",
      "description": "Indian Certificate of Secondary Education",
      "is_active": true,
      "classes_count": 12,
      "subjects_count": 14
    }
  ],
  "message": "Boards retrieved successfully",
  "timestamp": "2026-07-19T14:15:00Z"
}
```

**Create Board:**
```
POST /api/v1/admin/config/boards
```

**Update Board:**
```
PATCH /api/v1/admin/config/boards/{boardId}
```

**Delete Board:**
```
DELETE /api/v1/admin/config/boards/{boardId}
```

---

### 39. Manage Subjects (Admin)

**Endpoint:** `GET /api/v1/admin/config/subjects`  
**Authentication:** Yes  
**Role:** Admin

**Query Parameters:**
- `board_id` (integer): Filter by board
- `class_id` (integer): Filter by class

**Success Response (200):**
```json
{
  "success": true,
  "data": [
    {
      "subject_id": 5,
      "name": "Mathematics",
      "description": "Mathematics subject covering all topics",
      "board_id": 1,
      "board_name": "CBSE",
      "is_active": true,
      "questions_count": 3450,
      "categories_count": 25
    }
  ],
  "message": "Subjects retrieved successfully",
  "timestamp": "2026-07-19T14:20:00Z"
}
```

---

### 40. View Question Reports (Admin)

**Endpoint:** `GET /api/v1/admin/question-reports`  
**Authentication:** Yes  
**Role:** Admin

**Query Parameters:**
- `status` (string): Filter by status (pending/resolved/rejected)
- `issue_type` (string): Filter by issue type
- `page` (integer): Page number
- `limit` (integer): Items per page

**Success Response (200):**
```json
{
  "success": true,
  "data": [
    {
      "report_id": 567,
      "question_id": 1234,
      "question_text": "What is the derivative of x^2?",
      "reported_by": {
        "user_id": 125,
        "full_name": "John Doe"
      },
      "issue_type": "incorrect_answer",
      "description": "The correct answer should be option 3, not option 2",
      "status": "pending",
      "created_at": "2026-07-19T11:25:00Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total_items": 15,
    "total_pages": 1,
    "has_next": false,
    "has_previous": false
  },
  "message": "Question reports retrieved successfully",
  "timestamp": "2026-07-19T14:25:00Z"
}
```

---

## Rate Limiting

### Rate Limit Configuration

**Per-Endpoint Rate Limits:**

| Endpoint Category | Limit | Window |
|------------------|-------|--------|
| Authentication | 5 requests | 15 minutes |
| Public APIs | 60 requests | 1 minute |
| Student APIs | 120 requests | 1 minute |
| Admin APIs | 300 requests | 1 minute |
| File Uploads | 10 requests | 5 minutes |

**Rate Limit Headers:**

Every API response includes rate limit information:

```
X-RateLimit-Limit: 120
X-RateLimit-Remaining: 115
X-RateLimit-Reset: 1689765600
```

**Rate Limit Exceeded Response (429):**

```json
{
  "success": false,
  "error": {
    "code": "RATE_LIMIT_EXCEEDED",
    "message": "Too many requests. Please try again later.",
    "details": {
      "limit": 120,
      "window_seconds": 60,
      "retry_after": 45
    }
  },
  "timestamp": "2026-07-19T14:30:00Z"
}
```

**Rate Limiting Strategy:**

1. **IP-Based Limiting:** For unauthenticated endpoints
2. **User-Based Limiting:** For authenticated endpoints
3. **Endpoint-Specific Limits:** Different limits for different endpoint categories
4. **Burst Allowance:** Allow short bursts while maintaining average rate
5. **Graceful Degradation:** Return meaningful error messages with retry information

---

## Additional API Standards

### Authentication Header Format

```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### Content-Type Headers

**Request:**
```
Content-Type: application/json
```

**Response:**
```
Content-Type: application/json; charset=utf-8
```

### CORS Headers

```
Access-Control-Allow-Origin: https://app.example.com
Access-Control-Allow-Methods: GET, POST, PUT, PATCH, DELETE, OPTIONS
Access-Control-Allow-Headers: Content-Type, Authorization
Access-Control-Max-Age: 86400
```

### API Error Codes

| Code | Description |
|------|-------------|
| `VALIDATION_ERROR` | Request validation failed |
| `AUTHENTICATION_REQUIRED` | Missing authentication token |
| `INVALID_TOKEN` | Invalid or expired JWT token |
| `INSUFFICIENT_PERMISSIONS` | User lacks required permissions |
| `RESOURCE_NOT_FOUND` | Requested resource doesn't exist |
| `DUPLICATE_RESOURCE` | Resource already exists |
| `SUBSCRIPTION_REQUIRED` | Feature requires active subscription |
| `RATE_LIMIT_EXCEEDED` | Too many requests |
| `INTERNAL_SERVER_ERROR` | Unexpected server error |

---

## API Best Practices

1. **Use HTTPS:** All API communications must use HTTPS
2. **Token Expiration:** Access tokens expire in 1 hour, refresh tokens in 30 days
3. **Idempotency:** PUT and DELETE operations are idempotent
4. **Data Validation:** Validate all inputs server-side
5. **Error Handling:** Return meaningful error messages with proper status codes
6. **Logging:** Log all API requests for auditing and debugging
7. **Versioning:** Support at least 2 API versions simultaneously during transitions
8. **Documentation:** Keep API documentation synchronized with implementation
9. **Testing:** Maintain comprehensive API test coverage
10. **Monitoring:** Monitor API performance, error rates, and usage patterns

---

## Conclusion

This comprehensive REST API architecture provides a solid foundation for the Student Assessment Platform. The design follows RESTful principles, implements proper authentication and authorization, includes comprehensive error handling, and supports scalability through pagination and rate limiting.

**Key Features:**
- Clear and consistent URL structure
- Comprehensive authentication flow
- Role-based access control
- Detailed response formats
- Pagination and filtering support
- Rate limiting protection
- Admin management capabilities
- Gamification integration
- Subscription management

**Next Steps:**
1. Implement API endpoints following this specification
2. Set up automated API testing
3. Configure API gateway and rate limiting
4. Implement monitoring and logging
5. Create interactive API documentation (Swagger/OpenAPI)
6. Set up API versioning strategy
7. Implement caching where appropriate
8. Configure CDN for static assets
