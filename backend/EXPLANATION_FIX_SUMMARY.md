# Fix: Missing Question Explanations on Assessment Results

## Problem
When students submit an assessment and view their results at `/student/results/:id`, the explanations for wrong answers were not being displayed, even though the `question_explanations` table exists in the database.

## Root Cause
The backend service method `getAttemptById` in `backend/src/services/submission.service.ts` was not including the `explanations` relation when fetching question data for the attempt responses.

## Changes Made

### 1. Backend Fix (backend/src/services/submission.service.ts)
**Location:** Lines 286-303

**Before:**
```typescript
question: { select: { questionText: true, correctAnswer: true } },
```

**After:**
```typescript
question: {
  select: {
    questionText: true,
    correctAnswer: true,
    explanations: {
      orderBy: { displayOrder: 'asc' },
    },
  }
},
```

This change ensures that when fetching attempt details, the API now includes all question explanations ordered by their display order.

### 2. Frontend Fix (frontend/src/pages/student/ResultDetail.tsx)

#### 2.1 Added TypeScript Interface
Added `QuestionExplanation` interface to properly type the explanation data:

```typescript
interface QuestionExplanation {
  id: string;
  explanationType: string;
  explanationText: string;
  explanationHtml: string | null;
  explanationImages: any[];
  explanationVideoUrl: string | null;
  stepByStep: any | null;
  displayOrder: number;
}
```

#### 2.2 Updated QuestionResponse Interface
Added `explanations` field to the question object:

```typescript
question: {
  id: string;
  questionText: string;
  correctAnswer: string;
  options?: QuestionOption[];
  explanations?: QuestionExplanation[];  // NEW
};
```

#### 2.3 Added Explanation Display UI
Added a new section that displays explanations for wrong answers (lines ~330-380):

**Features:**
- Shows an info icon with "Explanation:" header
- Filters explanations to show only `WRONG_ANSWER` or `CORRECT_ANSWER` types
- Displays explanation text (supports both plain text and HTML)
- Shows video explanation links if available
- Displays step-by-step solutions if provided
- Styled with blue background to differentiate from answer sections
- Supports dark mode

## Database Schema Reference
The explanations come from the `question_explanations` table with the following structure:
- `explanation_id`: Primary key
- `question_id`: Foreign key to questions table
- `explanation_type`: ENUM (WRONG_ANSWER, CORRECT_ANSWER, HINT)
- `explanation_text`: Text explanation
- `explanation_html`: HTML formatted explanation (optional)
- `explanation_images`: JSON array of image URLs
- `explanation_video_url`: URL to video explanation
- `step_by_step`: JSON for step-by-step solutions
- `display_order`: Order of display

## Testing Instructions

1. **Ensure backend is rebuilt:**
   ```bash
   cd backend
   npm run build
   ```

2. **Restart backend server if needed:**
   ```bash
   npm run dev
   ```

3. **Test the feature:**
   - Navigate to `http://localhost:3000/student/assessments`
   - Take assessment #14 or any assessment with questions that have explanations
   - Submit the assessment with some wrong answers
   - Navigate to `http://localhost:3000/student/results`
   - Click "View Details" on the submitted assessment
   - Filter by "Wrong" answers
   - Verify that explanations appear below the correct answer for each wrong answer

## Expected Behavior

### For Wrong Answers:
1. Shows "Your Answer" (in red background)
2. Shows "Correct Answer" (in green background)
3. Shows "Explanation" section (in blue background) with:
   - Explanation text/HTML
   - Video link (if available)
   - Step-by-step solution (if available)

### For Correct Answers:
- No explanation shown (only shows "Your Answer" in green)

### For Unattempted Questions:
- Shows "Not attempted" status
- Shows "Correct Answer"
- No explanation (as student didn't attempt)

## Notes
- Explanations are only shown for **wrong answers** to help students learn from their mistakes
- The system supports multiple explanation types: WRONG_ANSWER, CORRECT_ANSWER, and HINT
- Explanations can include text, HTML, images, videos, and step-by-step solutions
- The display is responsive and supports both light and dark modes
