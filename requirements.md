# Student Assessment Platform - Requirements Document

**Project Name:** Student Assessment Platform  
**Date:** 2026-07-18  
**Version:** 1.0

---

## 1. EXECUTIVE SUMMARY

An educational web platform enabling students (Class 1-10) to practice and test their knowledge through various question formats. The platform supports multiple exam boards, subjects, and competitive exams with a focus on configurability and scalability.

---

## 2. USER ROLES & PERSONAS

### 2.1 Primary User Roles (MVP)

1. **Students (Class 1-10)**
   - Primary end-users who attempt questions
   - Track their progress and performance
   - Access practice and mock test modes
   - Choose questions based on subscription tier
   - Receive AI-powered recommendations based on performance patterns

2. **Admin**
   - Manage question bank (add/edit/delete)
   - Configure exam categories, subjects, boards
   - Bulk upload questions
   - User management
   - System configuration
   - Manage subscription plans

**Future Roles (Post-MVP):**
- Teachers (to monitor and assign)
- Parents (to track child's progress)

### 2.2 Account Requirements

**Mandatory Registration Information:**
- Student Name
- Email ID (primary identifier)
  - Students can use their own email
  - OR use parent's email if they don't have one
- School Name
- Educational Board (CBSE, ICSE, configurable for more)
- Standard/Class (1-10)

**Self-Registration:** Students can register and approve themselves (no admin approval needed)

---

## 3. CONTENT STRUCTURE & ORGANIZATION

### 3.1 Exam Categories (Configurable)

**Initial Launch:**
- Math Olympiad

**Future Expansion (Configurable):**
- CBSE Board Exams
- ICSE Board Exams
- Other competitive exams (JEE, NEET, NTSE, etc.)

> **Design Principle:** System should dynamically adopt to new exam categories without code changes

### 3.2 Academic Coverage

**Classes:** 1 to 10

**Subjects:**
- **Initial:** Mathematics
- **Future:** Science, English, Social Studies, etc. (Configurable)

### 3.3 Question Organization (Multi-dimensional)

Questions can be filtered/organized by:
1. **Subject** (Math, Science, etc.)
2. **Chapter/Topic** within subject
3. **Difficulty Level** (Easy, Medium, Hard)
4. **Year** (for previous year papers)
5. **Exam Category** (Olympiad, Board, etc.)
6. **Class/Standard** (1-10)

### 3.4 Question Types Supported

1. **Multiple Choice Questions (MCQ)** - Single correct answer
2. **Multiple Select Questions (MSQ)** - Multiple correct answers
3. **True/False Questions**
4. **Subjective/Descriptive Answers**
5. **Numerical Answer Type**

---

## 4. FUNCTIONAL REQUIREMENTS

### 4.1 Question Attempt Modes

**Phase 1:**
1. **Practice Mode**
   - Random questions from selected topics
   - No time pressure
   - Can be attempted multiple times

2. **Mock Test Mode**
   - Timed tests
   - Specific question count
   - Simulates real exam environment

**Future Phases (Configurable):**
3. Previous Year Papers
4. Daily Challenge/Quiz
5. Custom Tests

### 4.2 Timing Mechanism

- **Overall Test Timer** (not per-question)
- **Optional** (can be enabled/disabled)
- TBD: Default time allocations per test?

### 4.3 Feedback & Assessment

**At End of Test:**
- Overall score/percentage
- Question-wise results (correct/incorrect)
- **Explanations for wrong answers only**
- Time taken

**Performance Analytics:**
- Accuracy percentage over time
- Subject-wise performance breakdown
- Topic-wise strengths/weaknesses
- Time spent analysis
- Improvement trends

### 4.4 Progress Tracking

**Student Dashboard showing:**
- Total questions attempted
- Overall accuracy rate
- Subject-wise performance
- Recent test history
- Performance graphs/charts over time
- Weak areas identification
- Improvement metrics
- **Downloadable test results** (PDF format)

### 4.5 Gamification & Engagement Features

**To boost student motivation and engagement:**

1. **Leaderboards**
   - Class-wise rankings
   - School-wise rankings
   - Global rankings
   - Subject-specific leaderboards

2. **Badges & Achievements**
   - Milestone badges (100 questions, 500 questions, etc.)
   - Streak badges (7-day streak, 30-day streak)
   - Subject mastery badges
   - Accuracy badges (90%+ accuracy)
   - Speed badges (quick completion)

3. **Points/Rewards System**
   - Points earned per correct answer
   - Bonus points for streaks
   - Bonus points for difficult questions
   - Points deduction for incorrect answers (optional)
   - Redemption options (TBD)

### 4.6 Subscription & Access Control

**Question Access Based on Subscription:**
- Different subscription tiers (Free, Basic, Premium, etc.)
- Questions tagged with access levels
- Students can only access questions within their subscription tier
- TBD: Define specific subscription plans and pricing

**AI-Powered Recommendations:**
- System analyzes student's performance patterns
- Identifies weak areas
- Recommends specific topics/questions for practice
- Suggests appropriate difficulty level
- Adaptive learning path based on progress

### 4.7 Content Management System (Admin Panel)

**Question Management:**
1. **Manual Entry**
   - Add new questions
   - Edit existing questions
   - Delete questions
   - Add explanations

2. **Bulk Operations**
   - Upload via Excel/CSV
   - Template-based import
   - Validation and error handling

3. **Future: AI-Based Question Generation** (Advanced feature)

**Configuration Management:**
1. **Exam Categories** (Add/Edit/Delete)
2. **Subjects** (Add/Edit/Delete)
3. **Boards** (Add/Edit/Delete - CBSE, ICSE, etc.)
4. **Topics/Chapters** within subjects
5. **Difficulty Levels** (customizable)

**User Management:**
- View all users (Students)
- Role assignment
- Subscription management
- Account activation/deactivation

**Subscription Plan Management:**
- Create/Edit/Delete subscription tiers
- Define access levels per tier
- Pricing configuration
- Duration settings (monthly, yearly, lifetime)

**Analytics Dashboard (Admin):**
- Total registered users
- Active users
- Question attempt statistics
- Popular topics/subjects
- Subscription revenue metrics

---

## 5. NON-FUNCTIONAL REQUIREMENTS

### 5.1 Configurability (Critical Requirement)

> **Core Design Principle:** The system must be highly configurable to support:
> - New exam categories
> - New subjects
> - New educational boards
> - Varying number of questions per category
> - New question types
> 
> **WITHOUT requiring code changes or developer intervention**

This requires:
- Database-driven configuration
- Dynamic UI rendering based on configuration
- Flexible data models
- Admin-controlled metadata management

### 5.2 Initial Scale

- **Initial Question Volume:** ~50 questions
- **Expected Growth:** Variable, potentially thousands
- **Design for:** Scalable architecture supporting 10,000+ questions

### 5.3 Accessibility & Localization

- Classes 1-10 means age groups from 6-16 years
- UI should be age-appropriate and intuitive
- **Language Support:** English only (initially)
- Responsive web design for desktop, tablet, and mobile browsers
- No native mobile app required in Phase 1

### 5.4 Technology Stack (Recommended)

**Frontend:**
- **Framework:** React.js with TypeScript
- **UI Library:** Material-UI (MUI) or Tailwind CSS
- **State Management:** Redux Toolkit or Zustand
- **Charts/Graphs:** Recharts or Chart.js
- **Form Handling:** React Hook Form with Zod validation

**Backend:**
- **Framework:** Node.js with Express.js OR Python with FastAPI
- **ORM:** Prisma (Node.js) or SQLAlchemy (Python)
- **Authentication:** JWT with refresh tokens
- **File Upload:** Multer (Node.js) or similar

**Database:**
- **Primary Database:** PostgreSQL (relational data - users, questions, results)
- **Cache Layer:** Redis (for session management, leaderboards)
- **File Storage:** AWS S3 or similar (for bulk uploads, exports)

**Payment Integration (Future):**
- Stripe or Razorpay for subscription management

**Hosting & Infrastructure:**
- **Cloud Platform:** AWS, Azure, or Google Cloud Platform
- **Frontend Hosting:** Vercel or Netlify
- **Backend Hosting:** AWS EC2/ECS or Google Cloud Run
- **Database Hosting:** AWS RDS or managed PostgreSQL service
- **CDN:** CloudFront or similar

**DevOps:**
- **CI/CD:** GitHub Actions or GitLab CI
- **Monitoring:** New Relic, DataDog, or similar
- **Logging:** Winston (Node.js) or Python logging

**AI/ML (for recommendations):**
- Python-based service using scikit-learn or TensorFlow
- Separate microservice architecture for ML models

### 5.5 Reporting & Export Features

**Student Features:**
- **Downloadable Test Results** in PDF format
  - Test name and date
  - Score and percentage
  - Time taken
  - Question-wise breakdown
  - Correct answers and explanations for wrong answers
  
- **Performance Dashboard**
  - Interactive charts (line, bar, pie)
  - Subject-wise performance
  - Topic-wise performance
  - Historical trends
  - Comparison with average performance
  
- **Export Options**
  - Download test history as CSV
  - Download performance report as PDF

**Admin Features:**
- Export user data as CSV
- Export question bank as CSV/Excel
- Download analytics reports

---

## 6. SECURITY & COMPLIANCE

### 6.1 Authentication & Authorization
- Secure password hashing (bcrypt or Argon2)
- JWT-based authentication with refresh tokens
- Role-based access control (Student, Admin)
- Password reset via email
- Account verification via email (optional)

### 6.2 Data Protection
- **Child Data Privacy:** Since users include minors (6-16 years)
  - Parent email can be used for younger students
  - Minimal data collection
  - No sharing of personal data with third parties
- HTTPS encryption for all data transmission
- Database encryption at rest
- Secure API endpoints

### 6.3 Payment Security (Future)
- PCI DSS compliant payment gateway
- No storage of credit card information
- Secure checkout flow

---

## 7. SUBSCRIPTION MODEL & MONETIZATION

### 7.1 Subscription Tiers

**Free Tier:**
- **Access:** 10 questions in ANY 2 subjects of student's choice
- **Limitations:** 
  - After 10 questions in selected subjects, payment required
  - Limited to 2 subjects total
- **Purpose:** Trial/evaluation period for students

**Premium Tier:**
- **Access:** Unlimited questions across all subjects and exam categories
- **Pricing:** To be determined later (configurable by admin)
- **Payment Factors:**
  - Based on Class (1-10)
  - Based on Subject selection
  - User can choose subjects they want to pay for
  - Flexible pricing matrix

**Subscription Configuration:**
- Admin can configure pricing per class and subject combination
- Example: Class 5 Math = X, Class 10 Math = Y
- Students pay only for subjects they select
- No forced bundles (pay-per-subject model)

### 7.2 AI/ML Features

**Phase 1 - Rule-Based Recommendations:**
- Simple logic: if score < 60% in topic, recommend practice
- Identify weak areas based on historical performance
- Suggest difficulty progression

**Phase 2 - Complex ML for Question Generation:**
- **Primary Use:** Help Admin generate new questions
- ML model suggests questions based on:
  - Existing question patterns
  - Curriculum analysis
  - Difficulty calibration
- Admin reviews and approves AI-generated questions
- Not for student-facing features initially

**Phase 3 - Advanced Student Recommendations:**
- Deep learning for personalized learning paths
- Predict optimal question difficulty
- Adaptive testing based on performance

### 7.3 Points & Rewards System

**Dual Purpose:**

1. **Leaderboard Rankings**
   - Points determine position on leaderboards
   - Class-wise, school-wise, global rankings
   - Competitive motivation

2. **Redemption Options**
   - Redeem points for premium features
   - Possible redemptions:
     - Unlock additional practice questions
     - Get access to specific mock tests
     - Earn certificates
     - Get explanation credits (if explanations are paid feature)
     - TBD: Define specific redemption catalog

**Points Earning:**
- Correct answer: +10 points
- Wrong answer: -2 points (optional)
- Streak bonuses: +20 points per 7-day streak
- Daily challenge completion: +50 points
- Mock test completion: +100 points
- Difficulty multipliers: Hard questions = 2x points

### 7.4 Question Explanations

**Explanation Requirements:**

**Mandatory:**
- **Wrong answers MUST have explanations**
- Text + images supported
- Admin must provide explanation when creating question

**Optional:**
- Students can request explanations for correct answers too
- "Show explanation" button available for all questions

**Format Support:**
- **Phase 1:** Text and images only
- **Phase 2:** Video explanations support
- Images can include:
  - Diagrams
  - Step-by-step solutions
  - Visual aids

**Creation:**
- Admin creates all explanations
- Bulk upload should include explanation field
- AI-generated questions (Phase 2) will include AI-generated explanations for admin review

### 7.5 Mock Test Configuration

**Flexible Mock Test System - Both Options Supported:**

**Option 1: Pre-configured by Admin**
- Admin creates named mock tests (e.g., "Class 8 Math Olympiad Mock 1")
- Manually selects questions
- Sets custom duration and question count
- Can be based on previous year patterns

**Option 2: Auto-generated by System**
- Students select criteria:
  - Subject(s)
  - Topics
  - Difficulty level
  - Number of questions
- System randomly generates test based on criteria
- Ensures no repetition from student's history

**Default Mock Test Configuration:**
- **Duration:** 2 hours (120 minutes)
- **Question Count:** 40 questions
- **Customizable:** Admin can override defaults per test
- **Time per question:** ~3 minutes average

**Mock Test Features:**
- Timer countdown visible
- Save and resume (optional)
- Auto-submit when time expires
- Warning at 10 minutes remaining
- Question palette showing attempted/unattempted
- Mark for review functionality

---

## 8. SUCCESS METRICS

**User Engagement:**
- 70%+ of registered users attempt at least 1 test per week
- Average 50+ questions attempted per user per month
- 40%+ user retention after 3 months

**Performance Improvement:**
- 15%+ improvement in accuracy over 2 months of regular practice
- 30%+ of students complete recommended practice modules

**Business Metrics (Post-Subscription Launch):**
- 10%+ conversion rate from free to paid subscriptions
- 60%+ subscription renewal rate
- Average 2.5 subjects selected per premium user
- Revenue targets: TBD based on pricing strategy

---

## 9. TIMELINE & PHASES

**Phase 1 (MVP) - 3-4 months:**
- Student and Admin roles only
- Math Olympiad category
- Mathematics subject only (Classes 1-10)
- All 5 question types
- Practice and Mock Test modes (both pre-configured and auto-generated)
- Admin panel with manual + bulk upload
- Progress tracking and basic analytics
- Student dashboard with downloadable PDF results
- Gamification (leaderboards, badges, points system with redemption)
- Responsive web design
- User authentication and authorization
- Free tier (10 questions, 2 subjects) implementation
- Rule-based recommendations

**Phase 2 - 2-3 months:**
- **Payment integration** (Stripe/Razorpay)
- Premium subscription management with flexible pricing matrix
- Subject-wise pricing configuration
- AI-powered question generation (ML-based) for Admin
- Additional exam categories (CBSE Board Exams, ICSE)
- Additional subjects (Science, English, Social Studies)
- Advanced analytics and insights
- Email notifications for test completion
- Performance reports

**Phase 3 - 2-3 months:**
- Teacher and Parent roles
- Advanced ML-based student recommendations (adaptive learning)
- Mobile app (iOS/Android)
- Video explanations for questions
- Additional exam boards (State boards, IGCSE)
- Multi-language support (Hindi, regional languages)
- Advanced gamification (tournaments, challenges)
- Social features (study groups, peer comparison)

---

## 10. ASSUMPTIONS

1. Internet connectivity required (no offline mode in Phase 1)
2. English language interface initially
3. Web-based platform (responsive for tablets/mobile)
4. Students have basic computer/device literacy appropriate to their age
5. Email access available (student's or parent's)
6. Payment gateway integration in Phase 2
7. Initial question bank of ~50 questions will be manually created
8. Admin will configure initial exam categories, subjects, and boards

---

## 11. NEXT STEPS

1. ✅ **Requirements gathering completed**
2. **Answer remaining open questions** (Section 7)
3. **Database schema design**
   - Design ER diagram
   - Define all tables and relationships
   - Ensure configurability is built into schema
4. **System architecture design**
   - High-level architecture diagram
   - API design and endpoints
   - Data flow diagrams
5. **Wireframes & UI/UX design**
   - Student dashboard mockups
   - Question attempt interface
   - Admin panel mockups
   - Results and analytics screens
6. **Technical setup**
   - Initialize project repositories
   - Setup development environment
   - Configure CI/CD pipelines
7. **MVP Development sprint planning**
   - Break down into 2-week sprints
   - Prioritize features
   - Assign development tasks
8. **Testing strategy**
   - Unit testing approach
   - Integration testing
   - User acceptance testing with sample students

---

**Document Owner:** Product Owner  
**Stakeholders:** Development Team, Educational Advisors, Business Stakeholders  
**Last Updated:** 2026-07-18  
**Next Review Date:** TBD  
**Status:** Requirements Gathering Complete - Ready for Technical Design Phase
