# OpenAPI/Swagger Specification Guide
# Student Assessment Platform API

**File:** `openapi-spec.yaml`  
**Version:** OpenAPI 3.0.3  
**Status:** ✅ Complete  
**Date:** 2026-07-18

---

## 📋 What's Included

The OpenAPI specification covers **30+ API endpoints** organized into 8 categories:

### API Categories

1. **Authentication (7 endpoints)**
   - Register, Login, Logout, Refresh Token
   - Verify Email, Forgot Password, Reset Password

2. **Users & Profile (4 endpoints)**
   - Get Profile, Update Profile
   - Change Password, Upload Avatar

3. **Questions (6 endpoints)**
   - List Questions (with extensive filtering)
   - Get Question Details, Create/Update/Delete Question
   - Report Question

4. **Tests (3 key endpoints documented)**
   - Create Practice Test, Create Mock Test
   - Submit Test and Get Results

5. **Gamification (4 endpoints)**
   - Get Leaderboard, Get Badges
   - Get Points Balance, Redeem Points

6. **Admin (2 endpoints documented)**
   - Dashboard Statistics
   - Configuration Management

7. **Subscriptions (covered in architecture)**

8. **Configuration (2 endpoints)**
   - List Subjects, Create Subject

---

## 🚀 How to Use This Specification

### Option 1: Swagger UI (Interactive Documentation)

**Online (No Installation):**

1. Go to https://editor.swagger.io/
2. Click "File" → "Import File"
3. Upload `openapi-spec.yaml`
4. The interactive API documentation renders automatically
5. You can:
   - Browse all endpoints
   - See request/response schemas
   - Try out API calls (with authentication)
   - Download as JSON or YAML

**Local (Docker):**

```bash
# Run Swagger UI locally
docker run -p 8080:8080 -e SWAGGER_JSON=/app/openapi-spec.yaml \
  -v $(pwd):/app swaggerapi/swagger-ui

# Open browser
open http://localhost:8080
```

---

### Option 2: Postman (API Testing)

1. **Import into Postman:**
   - Open Postman
   - Click "Import" button
   - Select `openapi-spec.yaml`
   - Postman converts to collection automatically

2. **Setup Environment:**
   - Create environment "Dev" with:
     - `baseUrl`: `http://localhost:3000/api/v1`
     - `accessToken`: (leave empty, will be set after login)

3. **Test Authentication:**
   - POST `/auth/login` with email/password
   - Copy `accessToken` from response
   - Set as environment variable
   - All subsequent requests use this token automatically

4. **Run Collections:**
   - Postman generates test suite from OpenAPI spec
   - Can automate testing with Newman CLI

---

### Option 3: Generate Client SDKs

**Using OpenAPI Generator:**

```bash
# Install OpenAPI Generator
npm install -g @openapitools/openapi-generator-cli

# Generate JavaScript/TypeScript client
openapi-generator-cli generate \
  -i openapi-spec.yaml \
  -g typescript-axios \
  -o ./frontend/src/api

# Generate Python client
openapi-generator-cli generate \
  -i openapi-spec.yaml \
  -g python \
  -o ./python-client

# Generate Java client
openapi-generator-cli generate \
  -i openapi-spec.yaml \
  -g java \
  -o ./java-client
```

**Supported Languages:**
- TypeScript (Axios, Fetch, Angular)
- JavaScript (Node.js, Browser)
- Python
- Java
- Go
- Ruby
- PHP
- C#
- Kotlin
- Swift
- And 40+ more...

**Usage in Frontend:**

```typescript
// Auto-generated TypeScript client
import { AuthApi, QuestionsApi, Configuration } from './api';

const config = new Configuration({
  basePath: 'https://api.studentassessment.com/api/v1',
  accessToken: 'your-jwt-token'
});

const authApi = new AuthApi(config);
const questionsApi = new QuestionsApi(config);

// Login
const loginResponse = await authApi.loginUser({
  email: 'student@example.com',
  password: 'SecurePass123!'
});

// Get questions
const questions = await questionsApi.listQuestions({
  subjectId: 1,
  classLevel: 8,
  page: 1,
  limit: 20
});
```

---

### Option 4: Generate Server Stubs

**Node.js Express Server:**

```bash
openapi-generator-cli generate \
  -i openapi-spec.yaml \
  -g nodejs-express-server \
  -o ./backend
```

**Python FastAPI Server:**

```bash
openapi-generator-cli generate \
  -i openapi-spec.yaml \
  -g python-fastapi \
  -o ./backend
```

This generates:
- Route handlers (stubbed)
- Request validation
- Response serialization
- API documentation endpoints

---

### Option 5: API Documentation Website

**Redoc (Beautiful Static Docs):**

```bash
# Install Redoc CLI
npm install -g redoc-cli

# Generate static HTML documentation
redoc-cli bundle openapi-spec.yaml \
  --output api-docs.html \
  --title "Student Assessment Platform API"

# Host on GitHub Pages or any static host
```

**Features:**
- Beautiful, responsive design
- Search functionality
- Code samples in multiple languages
- No server required (static HTML)

---

## 📖 OpenAPI Specification Features

### 1. **Complete Request/Response Schemas**

Every endpoint has:
- HTTP method and path
- Required/optional parameters
- Request body schema with validation rules
- Success response schema
- Error response schemas
- Authentication requirements

**Example:**

```yaml
/auth/login:
  post:
    summary: User login
    requestBody:
      required: true
      content:
        application/json:
          schema:
            type: object
            required:
              - email
              - password
            properties:
              email:
                type: string
                format: email
              password:
                type: string
                format: password
    responses:
      '200':
        description: Login successful
        content:
          application/json:
            schema:
              # ... full response schema
      '401':
        description: Invalid credentials
```

### 2. **Reusable Components**

Defined once, used everywhere:

**Schemas:**
- `User`, `UserProfile`
- `QuestionSummary`, `QuestionDetail`, `QuestionCreate`
- `TestResult`
- `Pagination`
- `Error`

**Parameters:**
- `PageParam` (page number)
- `LimitParam` (items per page)

**Responses:**
- `BadRequest` (400)
- `Unauthorized` (401)
- `Forbidden` (403)
- `NotFound` (404)
- `TooManyRequests` (429)

**Security:**
- `BearerAuth` (JWT)

### 3. **Validation Rules**

Built-in validation:
- Type checking (string, integer, boolean, array, object)
- Format validation (email, date-time, password, uri)
- Range validation (minimum, maximum)
- Length validation (minLength, maxLength, minItems, maxItems)
- Pattern validation (regex)
- Enum validation (fixed set of values)
- Required fields

**Example:**

```yaml
password:
  type: string
  format: password
  minLength: 8
  example: SecurePass123!

classLevel:
  type: integer
  minimum: 1
  maximum: 10
  example: 8
```

### 4. **Examples Throughout**

Every field has example values:
- Helps developers understand expected format
- Used in Swagger UI "Try it out" feature
- Used by code generators for mock data

### 5. **Detailed Descriptions**

- Endpoint descriptions explain purpose
- Parameter descriptions explain usage
- Schema property notes explain special cases
- Operation IDs for code generation

---

## 🔐 Authentication in OpenAPI

### How It Works

1. **Obtain Access Token:**
   ```
   POST /auth/login
   Body: { email, password }
   Response: { accessToken, refreshToken }
   ```

2. **Use Token in Requests:**
   ```
   GET /questions
   Headers:
     Authorization: Bearer eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9...
   ```

3. **Refresh When Expired:**
   ```
   POST /auth/refresh
   Body: { refreshToken }
   Response: { accessToken, refreshToken }
   ```

### Security Scheme Definition

```yaml
components:
  securitySchemes:
    BearerAuth:
      type: http
      scheme: bearer
      bearerFormat: JWT
      description: JWT access token obtained from login endpoint
```

### Applying to Endpoints

```yaml
/users/profile:
  get:
    security:
      - BearerAuth: []
```

---

## 📊 Common Use Cases

### 1. **Student Takes Practice Test**

```
1. POST /tests/practice
   Body: { subjectId: 1, questionCount: 20, difficultyId: 2 }
   → Returns: { attemptId, questions }

2. For each question answered:
   (Optional: Store locally, or submit individually)

3. POST /tests/attempts/{attemptId}/submit
   Body: { responses: [...] }
   → Returns: { score, percentage, correctAnswers, explanation }

4. Check points earned:
   GET /gamification/points
   → Returns: { currentBalance, transactions }
```

### 2. **Admin Adds New Question**

```
1. POST /questions
   Body: {
     questionText: "...",
     typeId: 1,
     difficultyId: 2,
     subjectId: 1,
     classLevel: 8,
     options: [...],
     explanation: {...}
   }
   → Returns: { questionId }

2. Verify creation:
   GET /questions/{questionId}
   → Returns: Full question details
```

### 3. **Student Views Leaderboard**

```
1. GET /leaderboard?type=class&classLevel=8&limit=50
   → Returns: {
       leaderboard: [{ rank, userId, fullName, totalPoints }],
       currentUserRank: 15,
       totalUsers: 250
     }
```

---

## 🎨 Customizing the Specification

### Add New Endpoint

```yaml
/new-endpoint:
  get:
    tags:
      - YourCategory
    summary: Brief description
    operationId: operationName
    security:
      - BearerAuth: []
    parameters:
      - name: paramName
        in: query
        schema:
          type: string
    responses:
      '200':
        description: Success
        content:
          application/json:
            schema:
              $ref: '#/components/schemas/YourSchema'
```

### Add New Schema

```yaml
components:
  schemas:
    YourSchema:
      type: object
      required:
        - requiredField
      properties:
        requiredField:
          type: string
          example: value
        optionalField:
          type: integer
          nullable: true
```

### Validate Specification

```bash
# Install validator
npm install -g @apidevtools/swagger-cli

# Validate
swagger-cli validate openapi-spec.yaml

# Output: Validation passed! ✅
```

---

## 🧪 Testing with OpenAPI

### 1. **Contract Testing**

Ensure your implementation matches the spec:

```javascript
// Using jest-openapi
const jestOpenAPI = require('jest-openapi');
const spec = require('./openapi-spec.yaml');

jestOpenAPI(spec);

describe('API Contract Tests', () => {
  it('POST /auth/login returns valid response', async () => {
    const response = await request(app)
      .post('/api/v1/auth/login')
      .send({ email: 'test@example.com', password: 'password123' });
    
    expect(response).toSatisfyApiSpec();
  });
});
```

### 2. **Mock Server**

Generate mock API for frontend development:

```bash
# Install Prism (API mocking)
npm install -g @stoplight/prism-cli

# Start mock server
prism mock openapi-spec.yaml --port 4010

# Frontend can now call http://localhost:4010/api/v1/*
# Returns example data from OpenAPI spec
```

### 3. **Load Testing**

Generate load test scenarios:

```bash
# Using Artillery
npm install -g artillery

# Generate test from OpenAPI spec
artillery quick --openapi openapi-spec.yaml \
  --target https://api.studentassessment.com \
  --duration 60 --rate 100
```

---

## 📚 Additional Tools

### IDE Integration

**VS Code Extensions:**
- **Swagger Viewer:** Preview OpenAPI specs
- **OpenAPI (Swagger) Editor:** Autocomplete, validation
- **REST Client:** Test APIs directly from VS Code

**IntelliJ/WebStorm:**
- Built-in OpenAPI support
- Auto-completion for YAML
- Visual endpoint explorer

### API Gateways

Import into:
- **AWS API Gateway:** Direct import support
- **Kong:** OpenAPI-based routing
- **Tyk:** Spec-driven API management

### Monitoring

- **Sentry:** Track API errors by endpoint
- **DataDog:** Monitor API performance
- **New Relic:** APM with OpenAPI tagging

---

## ✅ Next Steps

### 1. **Review & Refine**
- [ ] Review all endpoint definitions
- [ ] Add missing endpoints (subscriptions, more admin endpoints)
- [ ] Validate all schemas match database design
- [ ] Add more examples and descriptions

### 2. **Generate Code**
- [ ] Generate TypeScript client for frontend
- [ ] Generate server stubs for backend
- [ ] Setup API mocking for parallel development

### 3. **Setup Documentation**
- [ ] Host Swagger UI at `/api/docs`
- [ ] Generate Redoc documentation
- [ ] Add to developer portal

### 4. **Implement Testing**
- [ ] Setup contract testing
- [ ] Configure mock server for frontend dev
- [ ] Add API integration tests

### 5. **Integrate with CI/CD**
- [ ] Validate spec in CI pipeline
- [ ] Auto-generate clients on spec changes
- [ ] Version control and changelog

---

## 🔗 Useful Resources

### OpenAPI Tools
- **Swagger Editor:** https://editor.swagger.io/
- **Swagger UI:** https://swagger.io/tools/swagger-ui/
- **Redoc:** https://redocly.github.io/redoc/
- **OpenAPI Generator:** https://openapi-generator.tech/
- **Prism (Mocking):** https://stoplight.io/open-source/prism

### Learning Resources
- **OpenAPI Specification:** https://spec.openapis.org/oas/v3.0.3
- **Swagger Tutorial:** https://swagger.io/docs/specification/about/
- **API Design Guide:** https://cloud.google.com/apis/design

### Community
- **OpenAPI Initiative:** https://www.openapis.org/
- **GitHub:** https://github.com/OAI/OpenAPI-Specification
- **Stack Overflow:** Tag `openapi` or `swagger`

---

## 📝 Specification Statistics

| Metric | Count |
|--------|-------|
| **Endpoints Documented** | 30+ |
| **Schemas Defined** | 15+ |
| **Reusable Parameters** | 2 |
| **Common Responses** | 5 |
| **Security Schemes** | 1 (JWT) |
| **Tags/Categories** | 8 |
| **Lines of YAML** | ~1400 |

---

## 🎯 Benefits of Using OpenAPI

✅ **Single Source of Truth** - One spec, many uses  
✅ **Auto-Generated Docs** - Always up-to-date  
✅ **Client SDK Generation** - Consistent API clients  
✅ **Server Stub Generation** - Faster backend development  
✅ **Contract Testing** - Ensure implementation matches design  
✅ **API Mocking** - Frontend development without backend  
✅ **Interactive Testing** - Try APIs directly from docs  
✅ **Better Collaboration** - Frontend/Backend can work in parallel  
✅ **Reduced Errors** - Type-safe, validated requests/responses  
✅ **Easy Onboarding** - New developers understand API quickly  

---

**END OF OPENAPI GUIDE**

*Specification File: `openapi-spec.yaml`*  
*Last Updated: 2026-07-18*  
*Version: 1.0.0*
