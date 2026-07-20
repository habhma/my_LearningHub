# Complete Testing Scenarios

## Admin Testing (already logged in)

### Scenario 1: Create Multiple Assessments
1. Change the test name to "Math Quiz"
2. Select "Practice" type
3. Click Create
4. Change name to "Science Exam"
5. Select "Mock" type
6. Click Create
7. Click "List All" → Should see both assessments

### Scenario 2: Create Assessment with Different Settings
Try creating assessments with:
- Different test types (Practice, Mock, Diagnostic)
- Different durations (30, 60, 90, 120 minutes)
- Different test names

### Scenario 3: View What's Created
- After creating each assessment, note the ID number
- The JSON response shows all details:
  - id, testName, testType, testConfig
  - createdBy (your admin user ID)
  - timestamps (createdAt, updatedAt)

---

## Student Testing

### Scenario 4: Login as Student
1. Click "Login as Student" button (pre-fills student@test.com)
2. ✅ Should successfully login
3. Click "List All Assessments"
4. ✅ Students can VIEW assessments
5. Try to click "Create Assessment"
6. ❌ Should fail with "Not authorized" error

---

## Testing with Postman (Advanced)

If you want more control, use the Postman collection:

1. Open Postman
2. Import: `backend/Postman_Collection.json`
3. Run requests in order:
   - Login Admin → auto-saves token
   - Create Assessment → auto-saves ID
   - Get Assessment by ID
   - Update Assessment
   - Duplicate Assessment
   - Delete Assessment

---

## What Each Response Means

### Successful Create Response:
```json
{
  "success": true,
  "data": {
    "id": "1",
    "testName": "Math Quiz",
    "testType": "PRACTICE",
    "testConfig": {...},
    "isActive": true,
    "createdBy": "3",
    "createdAt": "2026-07-19T10:00:00.000Z"
  }
}
```

### Successful List Response:
```json
{
  "success": true,
  "data": {
    "assessments": [...],
    "pagination": {
      "page": 1,
      "limit": 10,
      "total": 5,
      "totalPages": 1
    }
  }
}
```

### Error Response:
```json
{
  "success": false,
  "error": {
    "message": "Not authorized"
  }
}
```

---

## Testing Checklist

✅ **Admin can:**
- [ ] Login successfully
- [ ] Create assessments
- [ ] View all assessments (active and inactive)
- [ ] See assessment details
- [ ] Create multiple assessments

✅ **Student can:**
- [ ] Login successfully
- [ ] View active assessments only
- [ ] See assessment details

❌ **Student cannot:**
- [ ] Create assessments (should get 403 error)
- [ ] Update assessments
- [ ] Delete assessments

---

## Common Issues & Solutions

**Issue:** "Not authorized" when creating assessment
- **Solution:** Make sure you clicked "Login as Admin" first
- Check that the status shows "Login successful!"

**Issue:** Empty list when clicking "List All"
- **Solution:** Create some assessments first
- Make sure you're logged in

**Issue:** Buttons are grayed out
- **Solution:** You need to login first
- The "Create" and "List" buttons only enable after successful login

---

## Next Steps After Testing

Once you've verified everything works:

1. **Build the Frontend UI** - React interface for students/admins
2. **Add Question Management** - Create/edit questions for assessments
3. **Implement Test Taking** - Students can actually take the assessments
4. **Add Grading System** - Auto-grade and show results

Which would you like to work on next?
