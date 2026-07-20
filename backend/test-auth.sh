#!/bin/bash
BASE_URL="http://localhost:5000/api/v1"

# Login admin
echo "Logging in..."
RESPONSE=$(curl -s -X POST "$BASE_URL/auth/login" \
    -H "Content-Type: application/json" \
    -d '{
        "email": "testadmin@test.com",
        "password": "Admin123!"
    }')

echo "Login response:"
echo "$RESPONSE"
echo ""
echo "Extracting token..."
echo "$RESPONSE" | python3 -c "import sys, json; data=json.load(sys.stdin); print(data.get('data', {}).get('accessToken', 'NO TOKEN'))"
