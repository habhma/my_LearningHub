# Student Assessment Platform - COMPLETE Requirements Document (v2.0)

**Date:** 2026-07-18  
**Status:** ✅ COMPLETE - Ready for Database Design  
**Document Version:** 2.0 (Principal Product Owner Review Complete)

---

## 📋 DOCUMENT CONTROL

| Version | Date | Changes | Approved By |
|---------|------|---------|-------------|
| 1.0 | 2026-07-18 | Initial requirements gathering | Product Owner |
| 2.0 | 2026-07-18 | Principal PO deep-dive, strategic clarity | Product Owner |

---

## 🎯 EXECUTIVE SUMMARY

### Vision Statement
A cost-effective, merit-based educational platform providing Indian students (Class 1-10) a **single unified platform** to practice and excel across multiple exams (olympiads, board exams) with complete historical tracking to support future career decisions.

### Key Differentiators
1. **Cost Proposition:** ₹200/month vs competitors like Logikids
2. **Merit-based Rewards:** Redeem points earned through performance
3. **Unified History:** One platform for all exams from Class 1-10, comprehensive learning journey
4. **Career Guidance Foundation:** Historical data to help students make informed career decisions later

### Market Position
- **Target Geography:** India (urban + rural schools)
- **Go-to-Market:** School partnerships + word-of-mouth
- **Business Model:** B2C (direct to students) + B2B2C (bulk licensing to schools)
- **Funding:** Bootstrapped

---

## 💰 BUSINESS MODEL DETAILS

### Pricing Structure
**Premium Subscription:** ₹200 per month
- Unlimited questions across all subjects
- Pay-per-subject flexibility (students choose subjects)
- Class-based + Subject-based pricing matrix (configurable)

### Free Tier (Lifetime Limit)
- **10 questions total** in **ANY 2 subjects** of student's choice
- **Locked:** Once 2 subjects chosen, cannot switch
- **No Reset:** Lifetime limit (never resets)
- After 10 questions exhausted → payment required

### Points Economy
**Earning Points:**
- Correct answer: +10 points
- 7-day streak: +20 bonus
- Daily challenge (mini-quiz): +50 points
- Mock test completion: +100 points
- Hard questions: 2x multiplier

**Redeeming Points:**
- **Primary Use:** Unlock additional question papers/mock tests
- **Cap:** Redeemed value ≤ 20% of total payment made by student
  - Example: Student paid ₹1000 → can redeem max ₹200 worth of content
- Secondary uses: TBD (certificates, explanations, etc.)

### Revenue Target
**Break-even:** TBD (to be calculated after infrastructure costs estimated)

---

## 👥 USER ROLES & ACCOUNT MANAGEMENT

### MVP Roles (Phase 1)
1. **Students** (Primary users)
2. **Admin** (Super Admin only initially)

### Future Roles (Phase 2+)
3. **Teachers** (Phase 2)
4. **Parents** (Phase 3)
5. **Admin Sub-roles:** Content Admin, Tech Admin, Support Admin (Phase 2)

### Registration Requirements

**All Students:**
- Student Name
- Email ID (own or parent's)
- School Name
- Educational Board (CBSE, ICSE, etc.)
- Standard/Class (1-10)

**Students Below Age 8 (Class 1-3):**
- **Mandatory:** Parent Email
- **Mandatory:** Parent Contact Number

**Age Restrictions:**
- Minimum age: 8 years to register independently
- Below 8: Must use parent's email

**Authentication Options:**
- Email + Password
- Google Social Login
- Facebook Social Login
- SMS OTP for verification

---

## 📚 CONTENT STRUCTURE & CURRICULUM

### Exam Categories

**Phase 1 Launch:**
- **Math Olympiad** (IMO - International Mathematics Olympiad / SOF IMO)

**Phase 2 Expansion (Configurable):**
- CBSE Board Exams
- ICSE Board Exams
- Other olympiads (Science, English, Cyber, etc.)
- State board exams
- Competitive exams (NTSE, etc.)

### Subject Coverage

**Phase 1:** Mathematics only

**Phase 2+:** Science, English, Social Studies, etc. (all configurable)

### Class Coverage

**Soft Launch (MVP):** 
- **Single Class** (e.g., Class 8) - Option A: Narrow but Deep
- 100+ questions for that class
- All critical features working perfectly

**Full Launch:**
- Classes 1-10 (all classes)

### Curriculum Alignment
- **CBSE:** Aligned with latest NCERT curriculum
- **Math Olympiad:** IMO/SOF syllabus initially, other olympiad types configurable
- **Subject Matter Experts:** Review questions in Phase 2+

### Question Types Supported
1. Multiple Choice Questions (MCQ) - Single answer
2. Multiple Select Questions (MSQ) - Multiple answers
3. True/False
4. Subjective/Descriptive
5. Numerical Answer Type

### Question Organization (Multi-dimensional)
- By Subject
- By Chapter/Topic
- By Difficulty Level (Easy, Medium, Hard)
- By Class/Standard
- By Exam Category
- By Year (previous papers)
- By Tags (algebra, geometry, logical reasoning, word problems)

---

## 📊 CONTENT CREATION & QUALITY ASSURANCE

### Content Volume Plan

**Soft Launch (MVP):**
- **1 Class** (e.g., Class 8)
- **100+ questions** for Math
- **Target:** High quality over quantity

**3-Month Target:**
- Expand to 3-5 classes
- 100 questions per class

**6-Month Target:**
- All classes (1-10)
- 500-1000 questions total

### Content Creation Methods (All Four)

1. **LLM/AI Generation**
   - GPT-4 / Claude / Gemini generates questions based on:
     - Sample questions provided
     - Syllabus/curriculum input
     - Difficulty calibration rules
   - **Admin reviews and approves** all AI-generated content

2. **Manual Creation (In-house)**
   - Admin creates questions via admin panel
   - Direct input with rich text editor

3. **Outsourced to Teachers**
   - Subject matter experts create questions
   - Content partnership model

4. **Crowdsourced**
   - Teacher community contributions (Phase 2+)
   - Incentive model TBD

**Note:** AI question generation might be done **outside this platform** as a separate tool/process

### Question Quality Assurance

**Validation Process:**
1. **AI Generation:** LLM creates question
2. **Manual Review:** Admin validates accuracy
3. **Live Deployment:** Question goes live
4. **Ongoing Monitoring:** Track success rate, time taken, reports

**Student Reporting Mechanism:**
- "Report Question" button on each question
- Email sent to help/support email
- Admin reviews and corrects
- Question versioning to track corrections

**Quality Metrics Tracked:**
- **Success Rate %** (what % of students answer correctly)
- **Number of Times Attempted**
- **Average Time Taken** (used to calibrate difficulty)
- Questions with <20% success rate → flagged as "too hard"
- Questions with >90% success rate → flagged as "too easy"
- Reported questions → reviewed within 48 hours

**Question Retirement:**
- Questions flagged as "too hard" + multiple reports → retire or revise
- Questions with persistent complaints → removed from active pool

### Question Difficulty Calibration

**Age-Appropriate Content:**
- Class 1-3 (ages 6-9): Simple language, visual aids, basic concepts
- Class 4-5 (ages 9-11): Moderate complexity, word problems
- Class 6-8 (ages 11-14): Advanced concepts, multi-step problems
- Class 9-10 (ages 14-16): Complex, olympiad-level reasoning

**Sub-levels Within Class:**
- Easy (foundational concepts)
- Medium (application-based)
- Hard (olympiad-level, reasoning, multi-step)

**Calibration Method:**
- Sample questions fed into system as benchmarks
- AI/ML uses samples to generate questions at similar difficulty
- Live data (success rate, time taken) fine-tunes difficulty rating

---

## 🎯 FUNCTIONAL REQUIREMENTS

### 4.1 Student Onboarding Flow

**Registration → Dashboard:**
1. Student registers (email, name, school, board, class)
2. Email verification (OTP or link)
3. **Immediately start practicing** (no mandatory tutorial)
4. Dashboard shows:
   - "Start Your First Practice" CTA
   - Free tier status (10 questions remaining)
   - Subject selection prompt

**Phase 2 Enhancement:**
- Optional diagnostic test to assess current level
- Goal setting (improve weak areas, prepare for exam, general practice)

### 4.2 Question Attempt Modes

#### **4.2.1 Practice Mode** ✅ CRITICAL
- **Selection Criteria:**
  - Choose Subject
  - Choose Topic(s)
  - Choose Difficulty (Easy/Medium/Hard or Auto)
  - Choose number of questions (10, 20, 50, or custom)
- **No time limit**
- **Immediate feedback option** (show answer after each question)
- **Can attempt multiple times**
- **Progress saved** (can resume later)

#### **4.2.2 Mock Test Mode** ✅ CRITICAL
**Default Configuration:**
- **Duration:** 2 hours (120 minutes)
- **Questions:** 40 questions
- **Customizable by Admin** (can create tests with different duration/count)

**Two Creation Methods:**

**Method 1: Pre-configured by Admin**
- Admin creates named tests (e.g., "Class 8 Math Olympiad Mock 1")
- Manually selects specific questions
- Sets custom rules (duration, difficulty distribution)
- Based on previous year patterns

**Method 2: Auto-generated by System**
- Student selects:
  - Subject(s)
  - Topic(s) (optional)
  - Difficulty level distribution
  - Number of questions
- System randomly generates test
- No repetition from student's history

**Mock Test Features:**
- Timer countdown (visible)
- Auto-submit when time expires
- Warning at 10 minutes remaining
- Question palette (shows attempted/unattempted/marked for review)
- Mark for review functionality
- Save and resume (optional - can be enabled/disabled per test)
- No cheating prevention in Phase 1 (no browser lockdown, no proctoring)

### 4.3 Feedback & Assessment

**During Test:**
- Practice Mode: Can enable "show answer immediately"
- Mock Test: No feedback until test ends

**After Test Completion:**
- Overall score and percentage
- Time taken
- Question-wise results (correct/incorrect/unattempted)
- **Explanations shown ONLY for wrong answers** (mandatory)
- **"Show Explanation" button** for correct answers (optional, student can request)

**Explanation Format:**
- Text + Images (Phase 1) ✅ IMPORTANT
- Videos (Phase 2+)
- Step-by-step solutions
- Visual diagrams where applicable

### 4.4 Progress Tracking & Analytics

**Student Dashboard** ✅ CRITICAL

**Overview Section:**
- Total questions attempted
- Overall accuracy rate %
- Current streak (daily practice)
- Points balance
- Free tier status (if applicable)
- Subscription status

**Performance Charts:**
- Accuracy trend over time (line chart)
- Subject-wise performance (bar chart)
- Topic-wise breakdown (pie/bar chart)
- Time spent per session (area chart)
- Weekly/monthly comparisons

**Recent Activity:**
- Last 5 tests taken
- Recent achievements/badges earned
- Upcoming daily challenges

**Weak Areas Identification:**
- Topics with <60% accuracy highlighted
- Recommended practice modules

**Downloadable Reports:** ⚠️ NICE-TO-HAVE (can defer)
- PDF test results (detailed)
- Monthly performance summary
- Progress report for parents

### 4.5 Gamification & Engagement

#### **4.5.1 Leaderboards** ✅ IMPORTANT (should have)

**Multiple Leaderboard Views:**
1. **Class-wise Leaderboard**
   - Students compete only within their class
   - Separate leaderboard per class (1-10)
   
2. **School-wise Leaderboard**
   - Students from same school compete
   - Filtered by class within school

3. **Global Leaderboard** (Phase 2)
   - All students across platform
   - Filtered by class

**Reset Policy:** NEVER
- Cumulative points from day 1
- All-time leaderboard
- No monthly/quarterly resets

**Leaderboard Data Shown:**
- Rank
- Student name (or username/anonymous option)
- Total points
- School name
- Badges earned

#### **4.5.2 Badges System** ✅ IMPORTANT (should have)

**Age-Appropriate Badges:**

**Class 1-3 (Ages 6-9):**
- 🌟 First Question (complete 1st question)
- 🎈 10 Questions Master
- 🎨 Perfect Score (100% in practice)
- 🦋 3-Day Streak

**Class 4-6 (Ages 9-12):**
- 🏅 50 Questions Champion
- 🎯 High Accuracy (90%+ in 10 questions)
- 🔥 7-Day Streak
- 💎 Mock Test Hero (complete first mock)

**Class 7-10 (Ages 12-16):**
- 🏆 100 Questions Legend
- 🎓 Subject Master (90%+ in 50 questions)
- ⚡ Speed Demon (complete test 20% faster than average)
- 🔥 30-Day Streak
- 💪 Mock Test Pro (complete 10 mocks)

**Badge Properties:**
- NOT shareable (no social media, no download in Phase 1)
- Displayed on student profile
- Shown in leaderboards
- Class-appropriate milestones

#### **4.5.3 Points System** ⚠️ NICE-TO-HAVE (can defer)

See "Points Economy" in Business Model section above.

#### **4.5.4 Daily Challenge** (Phase 2)

**Format:** Mini-quiz
- 5 questions
- 10 minutes time limit
- Changes at midnight IST
- +50 bonus points for completion
- Separate leaderboard for daily challenges

**Streak Tracking:**
- Tracks consecutive days of practice
- **Reset rule:** Miss 3 consecutive days → streak resets to 0
- Email reminders (Phase 2): "Don't break your streak!"

### 4.6 Subscription & Access Control

**Free Tier Access:**
- 10 questions total (lifetime)
- 2 subjects of choice (locked once selected)
- Access to practice mode only
- Basic dashboard
- No mock tests

**Premium Tier Access:**
- Unlimited questions
- All subjects
- All exam categories
- Practice + Mock Test modes
- Full analytics dashboard
- Downloadable reports
- Priority support

**Payment Integration:** ✅ IMPORTANT (Phase 1)
- Razorpay or Stripe
- SMS OTP for transaction verification
- **No refunds policy**
- **Manual renewal** (not auto-renewal)
- Grace period: None (immediate lockout after expiry)

**Subscription Management:**
- Admin configures pricing matrix
  - Class × Subject combinations
  - Example: Class 8 Math = ₹200/month
- Students select subjects à la carte
- Total price calculated based on selection

### 4.7 AI-Powered Recommendations (Phase 1: Rule-Based)

**Triggers:**
- After completing a test
- When opening dashboard
- Weekly summary email

**Simple Rules:**
- If accuracy < 60% in a topic → "Practice more on [Topic]"
- If no activity for 3 days → "Continue your learning journey"
- If stuck at same difficulty → "Try harder questions to challenge yourself"
- If improving → "Great progress! Keep it up"

**Recommendations Include:**
- Specific topics to practice
- Suggested difficulty level
- Number of questions to attempt
- Link to start recommended practice

**Phase 3: ML-Based Adaptive Learning**
- Deep learning models
- Personalized learning paths
- Predict optimal question difficulty
- Adaptive testing (adjust difficulty real-time)

---

## 🛠️ ADMIN PANEL FEATURES

### 5.1 Question Management ✅ CRITICAL

**Manual Question Entry:**
- Rich text editor for question text
- Support for mathematical equations (LaTeX or MathJax)
- Image upload for diagrams/figures
- Multiple choice options entry
- Correct answer marking
- **Mandatory explanation field** for wrong answers
- Optional explanation for correct answer
- Tags/keywords for categorization
- Difficulty level selection
- Topic/chapter assignment
- Class assignment
- Exam category assignment

**Bulk Upload:** ⚠️ NICE-TO-HAVE (can defer to Phase 2)
- CSV/Excel template download
- Upload file
- Validation (check for errors)
- Preview before import
- Bulk import execution
- Error log for failed imports

**Edit/Delete:**
- Search questions by text, tags, class, subject
- Edit any field
- Version history (track changes)
- Soft delete (archive instead of hard delete)

**Question Preview:**
- Preview how question appears to students
- Test all options
- View explanation rendering

### 5.2 Configuration Management ✅ CRITICAL

**This is the MOST IMPORTANT feature for configurability**

**Exam Categories:**
- Add new exam category (name, description, icon)
- Edit existing categories
- Enable/disable categories
- No code deployment needed

**Subjects:**
- Add new subject
- Assign subject to classes
- Enable/disable subjects
- Subject-specific configuration (e.g., formula sheet allowed)

**Boards:**
- Add educational boards (CBSE, ICSE, state boards)
- Map boards to classes
- Board-specific curriculum notes

**Topics/Chapters:**
- Hierarchical structure: Subject → Chapter → Topic
- Add/edit/delete topics
- Reorder topics
- Map topics to classes

**Difficulty Levels:**
- Define difficulty levels (default: Easy, Medium, Hard)
- Can add custom levels (e.g., Olympiad, Advanced)

**Question Types:**
- Metadata-driven question types
- Can add new question types without code changes
- Define validation rules per type

### 5.3 Mock Test Management

**Pre-configured Tests:**
- Create named mock test
- Select questions manually or by criteria
- Set duration and question count
- Set availability (date range, class restriction)
- Preview test

**Auto-generation Rules:**
- Define templates for auto-generated tests
- Set difficulty distribution (30% easy, 50% medium, 20% hard)
- Set topic coverage rules

### 5.4 User Management

**View Users:**
- List all students
- Filter by class, school, board, registration date
- Search by name, email
- View user profile (history, performance)

**Subscription Management:**
- View active/expired subscriptions
- Manual subscription grant (for promotions)
- Extend subscription
- Cancel subscription
- View payment history

**Account Actions:**
- Activate/deactivate accounts
- Reset password (send email)
- Merge duplicate accounts
- View login history

### 5.5 Analytics Dashboard ✅ CRITICAL

**Key Metrics (Real-time or Near-realtime):**

**User Metrics:**
- Total registered users
- New registrations (today, this week, this month)
- Active users (DAU, WAU, MAU)

**Engagement Metrics:**
- Total questions attempted (platform-wide)
- Tests completed (today, this week, this month)
- Average questions per user
- Average time spent per session

**Revenue Metrics:** (Phase 2)
- Total revenue (today, this week, this month)
- Free to paid conversion rate
- Active subscriptions count
- Revenue by class/subject
- Subscription renewal rate

**Content Metrics:**
- Total questions in database
- Questions per subject/class
- Question usage statistics (most/least attempted)
- Question quality metrics (success rate, reports)

**Conversion Funnel:**
- Registrations
- → Free tier users (attempted questions)
- → Trial completers (exhausted 10 free questions)
- → Paid conversions
- → Active subscribers
- → Churned users

**Charts/Visualizations:**
- Line charts (trends over time)
- Bar charts (comparisons)
- Pie charts (distributions)
- Funnels (conversion visualization)

### 5.6 Support & Moderation

**Question Reports:**
- View all reported questions
- Filter by status (pending, reviewed, resolved)
- Review question details
- Edit/delete question
- Respond to reporter (email)
- Mark as resolved

**User Support:**
- View support tickets (email-based in Phase 1)
- Assign tickets to support team
- Respond to queries
- Track resolution time

**Audit Logs:**
- Track all admin actions
- Who changed what and when
- Question edits history
- Configuration changes log
- User account changes log

---

## 🔒 SECURITY & COMPLIANCE

### Data Protection & Privacy

**India Legal Compliance:**
- Digital Personal Data Protection Act, 2023 (DPDPA)
- Collect only necessary data (minimal data principle)
- Parental consent for students below 8 years
- No data sharing with third parties without consent

**Data Retention:**
- Active accounts: Retain all data
- Inactive accounts (no login for 2 years): Archive data
- Deleted accounts: Anonymize personal data, retain performance data for analytics

**Security Measures:**
- HTTPS encryption (TLS 1.3)
- Password hashing (bcrypt, cost factor 12)
- JWT tokens for authentication (15-min access, 7-day refresh)
- Database encryption at rest
- Daily automated backups
- Role-based access control (RBAC)
- SQL injection prevention (parameterized queries)
- XSS protection (input sanitization)
- CSRF tokens
- Rate limiting (API throttling)
- Security headers (HSTS, CSP, etc.)

**Payment Security:** (Phase 2)
- PCI DSS compliant gateway (Razorpay/Stripe)
- No storage of card numbers
- Tokenization for recurring payments
- SMS OTP for transaction verification
- Transaction logs and audit trail

### Academic Integrity

**Phase 1: Minimal Enforcement**
- Randomized question order (different for each student)
- No browser lockdown
- No proctoring
- No copy-paste prevention
- Honor system

**Future Phases:**
- Browser lockdown for high-stakes tests
- Webcam proctoring (optional)
- AI-based cheating detection
- Plagiarism detection for subjective answers

**Anti-Gaming Leaderboards:**
- Rate limiting (max questions per hour)
- Detect multiple accounts from same IP (Phase 2)
- Anomaly detection (suspiciously fast answers)

### Terms of Service

**Key Terms:**
- Minimum age: 8 years for independent registration
- Below 8: Must use parent account/email
- No refunds policy
- Account termination for violations (cheating, abuse)
- Content copyright (questions owned by platform)
- Usage restrictions (no scraping, no sharing accounts)

---

## 🖥️ TECHNICAL ARCHITECTURE

### Technology Stack (Recommended)

**Frontend:**
- React 18+ with TypeScript
- UI Framework: Material-UI (MUI) or Tailwind CSS + Headless UI
- State Management: Zustand or Redux Toolkit
- Forms: React Hook Form + Zod validation
- Charts: Recharts or Apache ECharts
- HTTP Client: Axios with interceptors
- Build Tool: Vite
- Testing: Jest + React Testing Library

**Backend:**
- **Option 1:** Node.js 20+ with Express.js
- **Option 2:** Python 3.11+ with FastAPI
- API Style: RESTful JSON APIs
- Authentication: JWT (jsonwebtoken or PyJWT)
- File Upload: Multer (Node) or Python-multipart
- Email: NodeMailer (Node) or Python smtplib
- Validation: Joi (Node) or Pydantic (Python)
- Testing: Jest/Mocha (Node) or Pytest (Python)

**Database:**
- **Primary:** PostgreSQL 15+
  - Users, questions, test results, subscriptions
  - JSONB columns for flexible metadata
- **Cache:** Redis 7+
  - Session management
  - Leaderboard caching (sorted sets)
  - Rate limiting counters
  - Temporary data (OTPs, tokens)
- **Search** (Phase 2): Elasticsearch or PostgreSQL Full-Text Search

**Storage:**
- **Images:** AWS S3 or DigitalOcean Spaces
- **Backups:** S3 Glacier or equivalent
- **CDN:** CloudFront or Cloudflare

**AI/ML (Phase 2):**
- Separate Python microservice
- FastAPI for ML API endpoints
- Models: scikit-learn, TensorFlow, or Hugging Face Transformers
- Question generation: OpenAI GPT-4, Anthropic Claude, or Google Gemini

**Payment Gateway:**
- Razorpay (India-focused, supports UPI, cards, wallets)
- Stripe (international, if expanding later)
- SMS OTP: Twilio or MSG91

**DevOps & Infrastructure:**
- **Hosting:** AWS, Azure, or Google Cloud Platform
  - **Option:** DigitalOcean (cost-effective for bootstrapped)
- **Frontend:** Vercel or Netlify (free tier for MVP)
- **Backend:** 
  - AWS EC2/ECS/Fargate
  - Google Cloud Run (serverless)
  - DigitalOcean App Platform
- **Database:** 
  - AWS RDS PostgreSQL
  - DigitalOcean Managed Database
- **CI/CD:** GitHub Actions or GitLab CI
- **Monitoring:** 
  - New Relic, DataDog (paid)
  - OR Prometheus + Grafana (open-source)
- **Logging:** 
  - Winston (Node) or Python logging
  - Centralized: AWS CloudWatch or Sentry
- **Error Tracking:** Sentry

**Performance Targets:**
- Page load time: < 2 seconds
- API response time: < 200ms (p95)
- Support 5000 concurrent users
- 99.5% uptime SLA

### Database Design Principles

**Configurability-First Schema:**
1. **No hardcoded enums in code** - Use lookup tables
2. **Metadata-driven** - Store configuration in database
3. **Extensible** - JSON/JSONB columns for flexible attributes
4. **Versioned** - Track changes to questions/configs
5. **Soft deletes** - Archive instead of hard delete

**Key Tables (High-Level):**
- users
- exam_categories (configurable)
- subjects (configurable)
- boards (configurable)
- topics (configurable, hierarchical)
- difficulty_levels (configurable)
- question_types (configurable)
- questions (with JSONB metadata)
- question_explanations
- question_options (for MCQ/MSQ)
- tests (both practice and mock)
- test_attempts
- test_responses (student answers)
- subscriptions
- payments
- points_transactions
- badges
- badge_awards
- leaderboard_cache (Redis + PostgreSQL)
- configuration_audit_log

**Scalability Considerations:**
- Indexing on frequently queried columns
- Partitioning for large tables (test_responses by month)
- Read replicas for analytics queries
- Caching strategy (Redis for hot data)
- CDN for static assets

---

## 📱 PLATFORM & ACCESSIBILITY

### Device Support

**Phase 1 Priority: Desktop First**
- Primary: Desktop/Laptop (1920x1080, 1366x768)
- Secondary: Tablet (iPad, Android tablets)
- Responsive design, but optimized for larger screens

**Phase 2: Mobile Optimization**
- Port UI to mobile-friendly layouts
- Touch-optimized interactions
- Mobile-first CSS

**Phase 3: Native Mobile Apps**
- iOS app (Swift or React Native)
- Android app (Kotlin or React Native)

**Minimum Screen Size:** 1024x768 (tablet landscape)

### Connectivity Requirements

**Phase 1:**
- 4G or better internet required
- Always-online (no offline mode)
- Optimize for 4G speeds (~5-10 Mbps)
- Lazy loading for images
- Code splitting for faster initial load

**Phase 2:**
- 3G optimization (with degraded experience)
- Progressive Web App (PWA) for basic offline viewing

### Accessibility Standards

**Phase 1: Basic Accessibility**
- Semantic HTML
- ARIA labels where needed
- Keyboard navigation support
- Color contrast meeting WCAG AA

**Phase 2: Enhanced Accessibility**
- Text-to-speech for questions
- High contrast mode
- Font size adjustment
- Extended time option for students with learning disabilities

**Not in Scope (Phase 1):**
- Screen reader optimization
- Dyslexia-friendly fonts
- ADHD-specific accommodations

### Language Support

**Phase 1:** English only
**Phase 2:** Hindi
**Phase 3:** Regional languages (Tamil, Telugu, Marathi, Bengali, etc.)

---

## 🧪 TESTING & QUALITY ASSURANCE

### Beta Testing Plan

**Scope:**
- 10 beta users (students from target class)
- 2-week testing period
- Supervised testing sessions + independent usage

**Success Criteria:**
1. **Features Working:** All critical features functional
2. **User Satisfaction:** >80% satisfied or very satisfied
3. **Performance:** Page load <3s, no crashes
4. **Usability:** Students can complete a test without assistance

**Feedback Collection:**
- Post-test survey
- One-on-one interviews
- Usage analytics (time spent, completion rate)

### Feedback Mechanisms

**Student Feedback:**
- "Report Question" button (sends email)
- In-app feedback form (general feedback)
- Rating: Was this question helpful? (thumbs up/down)

**Support Channels:**
- **Phase 1:** Email support (support@domain.com) + help email for question reports
- **Phase 2:** Live chat (Intercom, Crisp, or similar)
- **Phase 3:** Chatbot for FAQs

### Quality Metrics

**"Good Question" Definition:**
- Success rate: 40-70% (appropriately challenging)
- Average time: Within expected range for difficulty
- Low report rate: <2% of attempts result in reports
- High engagement: Attempted by many students

**Question Lifecycle:**
1. **New:** Just added, limited data
2. **Validated:** >50 attempts, metrics look good
3. **Flagged:** Metrics off (too hard/easy/reported)
4. **Retired:** Removed from active pool

**"Bad Question" Triggers:**
- Success rate <20% (too hard)
- Success rate >95% (too easy)
- Multiple reports (>5 reports)
- Average time 3x expected
- Admin review → retire or revise

---

## 🚀 LAUNCH STRATEGY

### MVP Launch Scope (Soft Launch)

**✅ MUST HAVE (Critical):**
1. Practice Mode (topic selection, difficulty selection)
2. Mock Test Mode (2hrs, 40 questions, timer, auto-submit)
3. Student Dashboard with charts and analytics
4. Free tier (10 questions, 2 subjects, locked)
5. Admin panel (add/edit/delete questions manually)
6. Configuration management (add exams/subjects/boards via UI)
7. User registration and authentication
8. Email verification

**✅ SHOULD HAVE (Important - include if time allows):**
9. Premium subscription with payment integration (Razorpay)
10. Question explanations (text + images)
11. Leaderboards (class-wise, school-wise)
12. Badges system (age-appropriate badges)

**⚠️ NICE TO HAVE (Defer to Phase 2):**
13. Points system (earn and redeem)
14. Downloadable PDF reports
15. Bulk question upload (CSV/Excel)
16. AI recommendations (even rule-based)
17. Daily challenge mini-quiz
18. Email reminders/notifications

### Launch Target

**Scope: Option A - Narrow but Deep**
- **1 Class Only:** Class 8 (ages 13-14)
- **100+ Questions:** High-quality, well-calibrated
- **1 Subject:** Mathematics
- **1 Exam Category:** Math Olympiad (IMO)
- **All Critical Features:** Working perfectly
- **10 Beta Users:** Thorough testing

**Why Class 8?**
- Middle of the range (not too young, not too old)
- Students mature enough to give meaningful feedback
- Math Olympiad most relevant for this age group
- Can expand down (Class 1-7) and up (Class 9-10) later

**Launch Type:** Soft launch (invite-only)
- Invite beta users
- School partnership (1-2 pilot schools)
- Referral-based expansion
- Public launch after 1 month of soft launch

### Growth Roadmap

**Month 1-2 (Soft Launch):**
- Class 8, 100 questions, 10-50 users
- Collect feedback, fix bugs
- Stabilize infrastructure

**Month 3-4:**
- Expand to Class 6, 7, 9, 10
- 100 questions per class (500 total)
- Public launch
- School partnerships (5-10 schools)
- Target: 500-1000 registered users

**Month 5-6:**
- Add Class 1-5
- Expand to 100 questions per class (1000 total)
- Add Science Olympiad category
- Payment integration (if deferred)
- Target: 2000-5000 users, 100+ paid

**Month 7-9 (Phase 2):**
- Add CBSE Board Exam category
- Add Science subject
- Bulk upload feature
- AI question generation tool (admin-facing)
- Email notifications
- Target: 10,000 users, 500+ paid

**Month 10-12 (Phase 2+):**
- Add more subjects (English, Social Studies)
- Add more exam categories (ICSE, NTSE)
- Teacher role (basic)
- Advanced analytics
- Mobile optimization
- Target: 25,000 users, 2000+ paid

**Year 2 (Phase 3):**
- Parent role
- Mobile apps (iOS, Android)
- ML-based adaptive learning
- Video explanations
- Multi-language support
- B2B2C (bulk licensing to schools)
- Geographic expansion (other Indian states)

### Marketing & Acquisition

**Phase 1 (MVP):**
- School partnerships (pilot program)
- Word-of-mouth (encourage students to invite friends)
- Social media (organic posts, student success stories)
- Content marketing (blog: exam tips, study techniques)

**Phase 2:**
- Referral program (invite 5 friends, get 1 month free)
- Google Ads (search: "math olympiad practice online")
- Facebook/Instagram Ads (targeting parents)
- YouTube (explainer videos, demo)
- Influencer marketing (education YouTubers)

**Phase 3:**
- School bulk licensing (B2B2C)
- Partnerships with coaching institutes
- Offline events (workshops, seminars)
- PR (education media, news coverage)

**Customer Acquisition Cost (CAC) Target:** <₹500 per paid user

---

## 💡 RISKS & MITIGATION

### Content Creation Risk

**Risk:** Creating 100 questions per class takes too long

**Mitigation:**
- Start with Class 8 only (100 questions total)
- Use AI generation + manual review (faster than pure manual)
- Outsource to teachers (parallel creation)
- Launch with fewer classes if needed (Class 8 only is acceptable)

**Fallback:** Launch with 50 questions if quality is high

### Technical Risk

**Risk:** Chosen tech stack doesn't scale as expected

**Mitigation:**
- Build modular architecture (easy to swap components)
- Start simple, optimize later
- Monitor performance from day 1
- Ready to switch (e.g., Node.js → Python, or vice versa)

**Budget:** No hard cap, but monitor cloud costs weekly

**Timeline Risk:** If development takes longer than 3-4 months
- Defer nice-to-have features
- Launch with critical features only
- Iterative releases (release early, improve continuously)

### Business Risk

**Risk:** Low conversion rate (1-2% instead of 10%)

**Mitigation:**
- Improve value proposition (more features, better content)
- Optimize pricing (A/B test ₹150 vs ₹200)
- Extend free tier (20 questions instead of 10)
- Introduce time-limited promotions

**Risk:** Competition launches similar features

**Mitigation:**
- Focus on unique differentiators (unified history, merit-rewards, lower cost)
- Build strong school partnerships (lock-in)
- Faster iteration (agile, continuous improvement)

**Risk:** Pay-per-subject model doesn't resonate

**Mitigation:**
- Offer bundles (all subjects at discount)
- A/B test: à la carte vs bundles
- Flexible: can pivot to subscription tiers

**Risk:** Schools prefer bulk licensing

**Mitigation:** ✅ Already planned in B2B2C model
- Offer school licensing (Phase 2)
- Volume discounts for schools
- Custom pricing for 100+ students

---

## 📊 SUCCESS METRICS & KPIs

### Top 5 KPIs (Tracked Weekly)

1. **New Registrations** (signups per week)
   - Target: 50+ per week (post-public launch)

2. **Free to Paid Conversion Rate** (% of free users who pay)
   - Target: 10%+ conversion
   - Track: After free tier exhausted (10 questions done)

3. **Revenue** (weekly/monthly revenue in ₹)
   - Target: TBD based on user acquisition
   - Break-even: TBD after infrastructure cost estimation

4. **Tests Completed** (mock tests + practice sessions completed)
   - Target: 80%+ completion rate (students who start, finish)
   - Engagement indicator

5. **Question Attempt Trends** (total questions attempted platform-wide)
   - Target: 50+ questions per active user per month
   - Engagement indicator

### Secondary Metrics (Tracked Monthly)

- Daily Active Users (DAU)
- Weekly Active Users (WAU)
- Monthly Active Users (MAU)
- Churn rate (% of paid users who don't renew)
- Customer Lifetime Value (CLTV)
- Customer Acquisition Cost (CAC)
- CLTV:CAC ratio (target >3:1)
- Net Promoter Score (NPS) - would you recommend?
- Average session duration
- Questions per session
- Mock test attempts per user
- Leaderboard engagement (% of users viewing leaderboards)

### 6-Month Success Definition

**User Metrics:**
- 5,000+ registered users
- 500+ paying users (10% conversion)
- 60%+ user retention (still active after 3 months)

**Revenue Metrics:**
- ₹1,00,000/month revenue (500 users × ₹200)
- Break-even or near break-even
- 70%+ subscription renewal rate

**Engagement Metrics:**
- 50,000+ questions attempted per month
- 2,000+ mock tests completed per month
- 70%+ weekly active users

**Quality Metrics:**
- 80%+ user satisfaction (surveys)
- <5% question report rate
- <1% critical bugs

### North Star Metric

**Primary:** Total Revenue (₹)
- Indicates business viability
- Directly tied to sustainability

**Secondary:** Number of Questions Attempted (platform-wide)
- Indicates engagement and value delivery
- Leading indicator of retention and word-of-mouth

**Formula:** Success = Growing Revenue + High Engagement

---

## 🎯 MVP FEATURE PRIORITY MATRIX

| Feature | Priority | Phase | Notes |
|---------|----------|-------|-------|
| Practice Mode | CRITICAL | 1 | Must have |
| Mock Test Mode | CRITICAL | 1 | Must have |
| Student Dashboard | CRITICAL | 1 | Must have |
| Free Tier (10Q, 2 subjects) | CRITICAL | 1 | Must have |
| Admin Panel (manual CRUD) | CRITICAL | 1 | Must have |
| Configuration Management | CRITICAL | 1 | Must have for scalability |
| User Registration/Auth | CRITICAL | 1 | Must have |
| Premium Subscription | IMPORTANT | 1 | Try to include, but can defer |
| Payment Integration | IMPORTANT | 1 | Try to include, but can defer |
| Question Explanations | IMPORTANT | 1 | Try to include |
| Leaderboards | IMPORTANT | 1 | Try to include |
| Badges System | IMPORTANT | 1 | Try to include |
| Points Earn/Redeem | NICE | 2 | Can defer |
| PDF Download Reports | NICE | 2 | Can defer |
| Bulk Upload (CSV) | NICE | 2 | Can defer |
| AI Recommendations | NICE | 2 | Can defer |
| Daily Challenge | NICE | 2 | Can defer |
| Email Notifications | NICE | 2 | Can defer |
| Social Login | IMPORTANT | 1-2 | Try to include |
| SMS OTP | IMPORTANT | 1-2 | Try to include |
| Teacher Role | FUTURE | 2 | Explicitly Phase 2 |
| Parent Role | FUTURE | 3 | Explicitly Phase 3 |
| Mobile Apps | FUTURE | 3 | Explicitly Phase 3 |
| Video Explanations | FUTURE | 2-3 | After text+image works |
| Multi-language | FUTURE | 3 | English only for now |

---

## 📝 ASSUMPTIONS & CONSTRAINTS

### Assumptions

1. **Target audience has basic digital literacy** appropriate to age
2. **Internet connectivity:** 4G or better available
3. **Device access:** Students have access to desktop/laptop or tablet
4. **Email access:** Students or parents have email IDs
5. **Payment methods:** Users have UPI/cards/wallets for online payment
6. **Content availability:** Can source/create 100 questions for MVP
7. **Tech stack:** Chosen stack will scale to 5000 concurrent users
8. **Funding:** Sufficient bootstrap funding for 6-12 month runway
9. **Team:** Can assemble development team (2-3 developers, 1 designer)
10. **Legal:** India data protection laws will be followed

### Constraints

1. **Budget:** Bootstrapped (no external funding initially)
2. **Timeline:** MVP in 3-4 months (not faster)
3. **Team size:** Small team (not 10+ developers)
4. **Geography:** India only (Phase 1)
5. **Language:** English only (Phase 1)
6. **Platform:** Web only, no mobile apps (Phase 1)
7. **Content:** Manual + AI creation (not large content team)
8. **Scale:** Start small (Class 8 only), expand gradually

---

## ✅ NEXT STEPS

### Immediate Next Steps (Week 1)

1. ✅ **Requirements Complete** (DONE)
2. 🔄 **Database Schema Design**
   - Create ER diagram
   - Define all tables with columns and relationships
   - Focus on configurability (lookup tables, JSONB)
   - Review and finalize schema

### Week 2

3. **System Architecture Design**
   - High-level architecture diagram (frontend, backend, database, cache, storage)
   - API design (REST endpoint list with request/response)
   - Authentication flow diagram
   - Data flow diagrams (user registration, question attempt, test submission)

### Week 3-4

4. **UI/UX Design**
   - Wireframes for all key screens
   - User flows (registration, practice, mock test, dashboard)
   - Design system (colors, typography, components)
   - High-fidelity mockups (Figma)

5. **Technical Setup**
   - Initialize Git repositories (frontend, backend)
   - Setup development environment
   - Configure CI/CD pipelines
   - Setup cloud infrastructure (staging environment)

### Week 5-8

6. **Backend Development Sprint 1**
   - Database setup and migrations
   - User authentication (register, login, JWT)
   - Question CRUD APIs
   - Configuration management APIs

7. **Frontend Development Sprint 1**
   - Setup React project
   - Component library setup
   - Registration and login pages
   - Basic dashboard layout

### Week 9-12

8. **Backend Development Sprint 2**
   - Practice mode APIs
   - Mock test APIs
   - Test submission and result calculation
   - Leaderboard APIs

9. **Frontend Development Sprint 2**
   - Practice mode UI
   - Mock test UI (timer, question palette)
   - Result display
   - Dashboard charts and analytics

### Week 13-14

10. **Admin Panel Development**
    - Admin authentication
    - Question management UI
    - Configuration management UI
    - Analytics dashboard

### Week 15

11. **Integration & Testing**
    - Integration testing
    - End-to-end testing
    - Performance testing
    - Security audit

### Week 16

12. **Beta Launch**
    - Deploy to production
    - Invite beta users
    - Monitor usage
    - Collect feedback

### Post-Beta

13. **Iterate & Improve**
    - Fix bugs
    - Improve UX based on feedback
    - Optimize performance
    - Public launch (soft)

---

## 📞 CONTACT & SIGN-OFF

**Document Owner:** Product Owner  
**Stakeholders:** Development Team, Content Team, Beta Users, School Partners  

**Review & Approval:**
- [ ] Product Owner Review
- [ ] Technical Lead Review
- [ ] UI/UX Designer Review
- [ ] Content Team Review

**Sign-off Date:** _______________

**Next Review:** After Database Schema Design completion

---

**END OF REQUIREMENTS DOCUMENT v2.0**

*This document is a living document and will be updated as the project evolves. All changes should be versioned and approved by the Product Owner.*
