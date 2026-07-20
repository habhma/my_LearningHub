#!/bin/bash
BASE_URL="http://localhost:5000/api/v1"

echo "Testing Assessment APIs..."
echo ""

# Test 1: Register admin
echo "1. Register admin user..."
curl -s -X POST "$BASE_URL/auth/register" \
    -H "Content-Type: application/json" \
    -d '{
        "email": "testadmin@test.com",
        "password": "Admin123!",
        "fullName": "Test Admin",
        "role": "ADMIN",
        "classLevel": 10
    }' | grep -q "success" && echo "✓ Admin registered" || echo "✗ Failed"

# Test 2: Login admin
echo "2. Login admin..."
LOGIN_RESPONSE=$(curl -s -X POST "$BASE_URL/auth/login" \
    -H "Content-Type: application/json" \
    -d '{
        "email": "testadmin@test.com",
        "password": "Admin123!"
    }')

echo "$LOGIN_RESPONSE" | grep -q "accessToken" && echo "✓ Admin logged in" || echo "✗ Failed"

# Extract token (simple parsing)
TOKEN=$(echo "$LOGIN_RESPONSE" | grep -o '"accessToken":"[^"]*' | cut -d'"' -f4)

if [ -z "$TOKEN" ]; then
    echo "Failed to get token"
    exit 1
fi

# Test 3: Create assessment
echo "3. Create assessment..."
CREATE_RESP=$(curl -s -X POST "$BASE_URL/assessments" \
    -H "Authorization: Bearer $TOKEN" \
    -H "Content-Type: application/json" \
    -d '{
        "testName": "Math Final Exam",
        "testType": "MOCK",
        "testConfig": {
            "duration": 120,
            "totalMarks": 100
        },
        "classLevel": 10
    }')

echo "$CREATE_RESP" | grep -q '"success":true' && echo "✓ Assessment created" || echo "✗ Failed: $CREATE_RESP"

# Extract assessment ID
ASSESSMENT_ID=$(echo "$CREATE_RESP" | grep -o '"id":"[^"]*' | head -1 | cut -d'"' -f4)

if [ -z "$ASSESSMENT_ID" ]; then
    echo "Failed to extract assessment ID"
    exit 1
fi

# Test 4: Get assessment
echo "4. Get assessment by ID..."
curl -s -X GET "$BASE_URL/assessments/$ASSESSMENT_ID" \
    -H "Authorization: Bearer $TOKEN" | grep -q '"success":true' && echo "✓ Got assessment" || echo "✗ Failed"

# Test 5: List assessments
echo "5. List assessments..."
curl -s -X GET "$BASE_URL/assessments?page=1&limit=10" \
    -H "Authorization: Bearer $TOKEN" | grep -q '"success":true' && echo "✓ Listed assessments" || echo "✗ Failed"

# Test 6: Update assessment
echo "6. Update assessment..."
curl -s -X PUT "$BASE_URL/assessments/$ASSESSMENT_ID" \
    -H "Authorization: Bearer $TOKEN" \
    -H "Content-Type: application/json" \
    -d '{
        "testName": "Math Final Exam - Updated"
    }' | grep -q '"success":true' && echo "✓ Updated assessment" || echo "✗ Failed"

# Test 7: Duplicate assessment
echo "7. Duplicate assessment..."
DUPLICATE_RESP=$(curl -s -X POST "$BASE_URL/assessments/$ASSESSMENT_ID/duplicate" \
    -H "Authorization: Bearer $TOKEN" \
    -H "Content-Type: application/json" \
    -d '{
        "newName": "Math Final Exam - Copy"
    }')

echo "$DUPLICATE_RESP" | grep -q '"success":true' && echo "✓ Duplicated assessment" || echo "✗ Failed"

DUPLICATE_ID=$(echo "$DUPLICATE_RESP" | grep -o '"id":"[^"]*' | head -1 | cut -d'"' -f4)

# Test 8: Delete assessment
echo "8. Delete duplicated assessment..."
curl -s -X DELETE "$BASE_URL/assessments/$DUPLICATE_ID" \
    -H "Authorization: Bearer $TOKEN" | grep -q '"success":true' && echo "✓ Deleted assessment" || echo "✗ Failed"

echo ""
echo "All tests completed!"
