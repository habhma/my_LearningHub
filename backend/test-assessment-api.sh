#!/bin/bash

# Assessment API Test Script
# Tests all CRUD operations for the Assessment Management feature

BASE_URL="http://localhost:5000/api/v1"
ADMIN_TOKEN=""
STUDENT_TOKEN=""

echo "============================================"
echo "Assessment Management API Tests"
echo "============================================"
echo ""

# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Test counter
TOTAL=0
PASSED=0
FAILED=0

# Function to print test result
test_result() {
    TOTAL=$((TOTAL + 1))
    if [ $1 -eq 0 ]; then
        echo -e "${GREEN}✓ PASSED${NC}: $2"
        PASSED=$((PASSED + 1))
    else
        echo -e "${RED}✗ FAILED${NC}: $2"
        FAILED=$((FAILED + 1))
    fi
}

# Function to make authenticated request
auth_request() {
    local method=$1
    local endpoint=$2
    local token=$3
    local data=$4

    if [ -z "$data" ]; then
        curl -s -X $method "$BASE_URL$endpoint" \
            -H "Authorization: Bearer $token" \
            -H "Content-Type: application/json"
    else
        curl -s -X $method "$BASE_URL$endpoint" \
            -H "Authorization: Bearer $token" \
            -H "Content-Type: application/json" \
            -d "$data"
    fi
}

echo "Step 1: Register and login test users"
echo "--------------------------------------"

# Register admin user
ADMIN_REGISTER=$(curl -s -X POST "$BASE_URL/auth/register" \
    -H "Content-Type: application/json" \
    -d '{
        "email": "admin@test.com",
        "password": "Admin123!",
        "fullName": "Test Admin",
        "role": "ADMIN",
        "classLevel": 10
    }')

# Register student user
STUDENT_REGISTER=$(curl -s -X POST "$BASE_URL/auth/register" \
    -H "Content-Type: application/json" \
    -d '{
        "email": "student@test.com",
        "password": "Student123!",
        "fullName": "Test Student",
        "role": "STUDENT",
        "classLevel": 10
    }')

# Login admin
ADMIN_LOGIN=$(curl -s -X POST "$BASE_URL/auth/login" \
    -H "Content-Type: application/json" \
    -d '{
        "email": "admin@test.com",
        "password": "Admin123!"
    }')

ADMIN_TOKEN=$(echo $ADMIN_LOGIN | jq -r '.data.accessToken // empty')

# Login student
STUDENT_LOGIN=$(curl -s -X POST "$BASE_URL/auth/login" \
    -H "Content-Type: application/json" \
    -d '{
        "email": "student@test.com",
        "password": "Student123!"
    }')

STUDENT_TOKEN=$(echo $STUDENT_LOGIN | jq -r '.data.accessToken // empty')

if [ -n "$ADMIN_TOKEN" ] && [ -n "$STUDENT_TOKEN" ]; then
    test_result 0 "User registration and login"
else
    test_result 1 "User registration and login"
    echo "Error: Failed to get tokens. Exiting..."
    exit 1
fi

echo ""
echo "Step 2: Test Assessment Creation (Admin only)"
echo "----------------------------------------------"

# Create assessment as admin
CREATE_RESPONSE=$(auth_request POST "/assessments" "$ADMIN_TOKEN" '{
    "testName": "Math Final Exam",
    "testType": "MOCK",
    "testConfig": {
        "duration": 120,
        "totalMarks": 100,
        "passingMarks": 40,
        "showResults": true,
        "shuffleQuestions": true
    },
    "classLevel": 10,
    "accessLevel": "FREE",
    "isActive": true
}')

ASSESSMENT_ID=$(echo $CREATE_RESPONSE | jq -r '.data.id // empty')

if [ -n "$ASSESSMENT_ID" ]; then
    test_result 0 "Create assessment (Admin)"
else
    test_result 1 "Create assessment (Admin)"
    echo "Response: $CREATE_RESPONSE"
fi

# Try to create assessment as student (should fail)
STUDENT_CREATE=$(auth_request POST "/assessments" "$STUDENT_TOKEN" '{
    "testName": "Unauthorized Test",
    "testType": "PRACTICE",
    "testConfig": {}
}')

if echo "$STUDENT_CREATE" | jq -e '.success == false' > /dev/null; then
    test_result 0 "Block assessment creation (Student)"
else
    test_result 1 "Block assessment creation (Student)"
fi

echo ""
echo "Step 3: Test Assessment Retrieval"
echo "----------------------------------"

# Get assessment by ID (Admin)
GET_RESPONSE=$(auth_request GET "/assessments/$ASSESSMENT_ID" "$ADMIN_TOKEN")
if echo "$GET_RESPONSE" | jq -e '.success == true' > /dev/null; then
    test_result 0 "Get assessment by ID (Admin)"
else
    test_result 1 "Get assessment by ID (Admin)"
fi

# Get assessment by ID (Student)
GET_STUDENT=$(auth_request GET "/assessments/$ASSESSMENT_ID" "$STUDENT_TOKEN")
if echo "$GET_STUDENT" | jq -e '.success == true' > /dev/null; then
    test_result 0 "Get assessment by ID (Student)"
else
    test_result 1 "Get assessment by ID (Student)"
fi

# List assessments (Admin)
LIST_ADMIN=$(auth_request GET "/assessments?page=1&limit=10" "$ADMIN_TOKEN")
if echo "$LIST_ADMIN" | jq -e '.success == true' > /dev/null; then
    test_result 0 "List assessments (Admin)"
else
    test_result 1 "List assessments (Admin)"
fi

# List assessments (Student - should only see active)
LIST_STUDENT=$(auth_request GET "/assessments" "$STUDENT_TOKEN")
if echo "$LIST_STUDENT" | jq -e '.success == true' > /dev/null; then
    test_result 0 "List assessments (Student)"
else
    test_result 1 "List assessments (Student)"
fi

echo ""
echo "Step 4: Test Assessment Update (Admin only)"
echo "--------------------------------------------"

# Update assessment as admin
UPDATE_RESPONSE=$(auth_request PUT "/assessments/$ASSESSMENT_ID" "$ADMIN_TOKEN" '{
    "testName": "Math Final Exam - Updated",
    "testConfig": {
        "duration": 150,
        "totalMarks": 100,
        "passingMarks": 50
    }
}')

if echo "$UPDATE_RESPONSE" | jq -e '.success == true' > /dev/null; then
    test_result 0 "Update assessment (Admin)"
else
    test_result 1 "Update assessment (Admin)"
fi

# Try to update as student (should fail)
STUDENT_UPDATE=$(auth_request PUT "/assessments/$ASSESSMENT_ID" "$STUDENT_TOKEN" '{
    "testName": "Hacked Name"
}')

if echo "$STUDENT_UPDATE" | jq -e '.success == false' > /dev/null; then
    test_result 0 "Block assessment update (Student)"
else
    test_result 1 "Block assessment update (Student)"
fi

echo ""
echo "Step 5: Test Assessment Duplication"
echo "------------------------------------"

# Duplicate assessment as admin
DUPLICATE_RESPONSE=$(auth_request POST "/assessments/$ASSESSMENT_ID/duplicate" "$ADMIN_TOKEN" '{
    "newName": "Math Final Exam - Copy"
}')

DUPLICATE_ID=$(echo $DUPLICATE_RESPONSE | jq -r '.data.id // empty')

if [ -n "$DUPLICATE_ID" ] && [ "$DUPLICATE_ID" != "$ASSESSMENT_ID" ]; then
    test_result 0 "Duplicate assessment (Admin)"
else
    test_result 1 "Duplicate assessment (Admin)"
    echo "Response: $DUPLICATE_RESPONSE"
fi

echo ""
echo "Step 6: Test Assessment Deletion"
echo "---------------------------------"

# Delete duplicated assessment
DELETE_RESPONSE=$(auth_request DELETE "/assessments/$DUPLICATE_ID" "$ADMIN_TOKEN")

if echo "$DELETE_RESPONSE" | jq -e '.success == true' > /dev/null; then
    test_result 0 "Delete assessment (Admin)"
else
    test_result 1 "Delete assessment (Admin)"
fi

# Try to delete as student (should fail)
STUDENT_DELETE=$(auth_request DELETE "/assessments/$ASSESSMENT_ID" "$STUDENT_TOKEN")

if echo "$STUDENT_DELETE" | jq -e '.success == false' > /dev/null; then
    test_result 0 "Block assessment deletion (Student)"
else
    test_result 1 "Block assessment deletion (Student)"
fi

# Verify deleted assessment is not accessible
DELETED_CHECK=$(auth_request GET "/assessments/$DUPLICATE_ID" "$ADMIN_TOKEN")

if echo "$DELETED_CHECK" | jq -e '.success == false' > /dev/null; then
    test_result 0 "Verify soft delete works"
else
    test_result 1 "Verify soft delete works"
fi

echo ""
echo "Step 7: Test Filter and Pagination"
echo "-----------------------------------"

# Create more assessments for testing
for i in {1..3}; do
    auth_request POST "/assessments" "$ADMIN_TOKEN" "{
        \"testName\": \"Test Assessment $i\",
        \"testType\": \"PRACTICE\",
        \"testConfig\": {\"duration\": 60},
        \"classLevel\": 10
    }" > /dev/null
done

# Test pagination
PAGE_RESPONSE=$(auth_request GET "/assessments?page=1&limit=2" "$ADMIN_TOKEN")
ITEMS_COUNT=$(echo $PAGE_RESPONSE | jq '.data.assessments | length')

if [ "$ITEMS_COUNT" -le 2 ]; then
    test_result 0 "Pagination works correctly"
else
    test_result 1 "Pagination works correctly"
fi

# Test filtering by testType
FILTER_RESPONSE=$(auth_request GET "/assessments?testType=PRACTICE" "$ADMIN_TOKEN")
if echo "$FILTER_RESPONSE" | jq -e '.success == true' > /dev/null; then
    test_result 0 "Filter by testType"
else
    test_result 1 "Filter by testType"
fi

echo ""
echo "============================================"
echo "Test Summary"
echo "============================================"
echo -e "Total Tests: $TOTAL"
echo -e "${GREEN}Passed: $PASSED${NC}"
echo -e "${RED}Failed: $FAILED${NC}"
echo ""

if [ $FAILED -eq 0 ]; then
    echo -e "${GREEN}All tests passed! ✓${NC}"
    exit 0
else
    echo -e "${RED}Some tests failed. Please review.${NC}"
    exit 1
fi
