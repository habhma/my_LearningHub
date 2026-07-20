# Manual Testing Commands - Assessment Platform

BASE_URL="http://localhost:5000/api/v1"

## 1. HEALTH CHECK
curl http://localhost:5000/health

## 2. REGISTER USERS

# Register Admin
curl -X POST $BASE_URL/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "myadmin@test.com",
    "password": "Admin123!",
    "fullName": "My Admin",
    "role": "ADMIN",
    "classLevel": 12
  }'

# Register Student
curl -X POST $BASE_URL/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "mystudent@test.com",
    "password": "Student123!",
    "fullName": "My Student",
    "role": "STUDENT",
    "classLevel": 10
  }'

## 3. LOGIN AND GET TOKENS

# Login Admin
ADMIN_RESPONSE=$(curl -s -X POST $BASE_URL/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email": "myadmin@test.com", "password": "Admin123!"}')

echo "Admin Response: $ADMIN_RESPONSE"

# Extract token (manually copy from response)
# ADMIN_TOKEN="paste_your_token_here"

# Login Student
STUDENT_RESPONSE=$(curl -s -X POST $BASE_URL/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email": "mystudent@test.com", "password": "Student123!"}')

echo "Student Response: $STUDENT_RESPONSE"

# STUDENT_TOKEN="paste_your_token_here"

## 4. ASSESSMENT OPERATIONS (use your actual tokens)

# Create Assessment (Admin)
curl -X POST $BASE_URL/assessments \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "testName": "Science Quiz",
    "testType": "PRACTICE",
    "testConfig": {
      "duration": 60,
      "totalMarks": 50,
      "passingMarks": 25
    },
    "classLevel": 10,
    "accessLevel": "FREE",
    "isActive": true
  }'

# List Assessments (Admin)
curl -X GET "$BASE_URL/assessments?page=1&limit=10" \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN"

# Get Assessment by ID (Admin)
curl -X GET $BASE_URL/assessments/1 \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN"

# Update Assessment (Admin)
curl -X PUT $BASE_URL/assessments/1 \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "testName": "Science Quiz - Updated",
    "isActive": true
  }'

# Duplicate Assessment (Admin)
curl -X POST $BASE_URL/assessments/1/duplicate \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"newName": "Science Quiz - Copy"}'

# Delete Assessment (Admin)
curl -X DELETE $BASE_URL/assessments/2 \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN"

## 5. STUDENT ACCESS

# List Assessments (Student - only active)
curl -X GET $BASE_URL/assessments \
  -H "Authorization: Bearer YOUR_STUDENT_TOKEN"

# View Assessment (Student)
curl -X GET $BASE_URL/assessments/1 \
  -H "Authorization: Bearer YOUR_STUDENT_TOKEN"

# Try to Create (Student - should fail with 403)
curl -X POST $BASE_URL/assessments \
  -H "Authorization: Bearer YOUR_STUDENT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "testName": "Unauthorized",
    "testType": "PRACTICE",
    "testConfig": {}
  }'

## 6. FILTERING & PAGINATION

# Filter by test type
curl -X GET "$BASE_URL/assessments?testType=MOCK" \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN"

# Filter by class level
curl -X GET "$BASE_URL/assessments?classLevel=10" \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN"

# Pagination
curl -X GET "$BASE_URL/assessments?page=2&limit=5" \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN"
