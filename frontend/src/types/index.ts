// User roles
export enum UserRole {
  STUDENT = 'STUDENT',
  TEACHER = 'TEACHER',
  ADMIN = 'ADMIN',
  PARENT = 'PARENT',
}

// User types
export interface User {
  id: string;
  email: string;
  role: string;
  profile?: {
    fullName: string;
    classLevel: number;
    schoolName?: string | null;
    dateOfBirth?: string | null;
    bio?: string | null;
  };
  createdAt?: string;
  updatedAt?: string;
}

// Authentication types
export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  success: boolean;
  data: {
    user: User;
    accessToken: string;
    refreshToken: string;
  };
}

export interface RegisterRequest {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  role: UserRole;
}

export interface AuthState {
  user: User | null;
  accessToken: string | null;
  refreshToken: string | null;
  isAuthenticated: boolean;
}

// Assessment types
export enum AssessmentStatus {
  DRAFT = 'draft',
  PUBLISHED = 'published',
  ARCHIVED = 'archived',
}

export enum TestType {
  PRACTICE = 'PRACTICE',
  MOCK = 'MOCK',
  DIAGNOSTIC = 'DIAGNOSTIC',
}

export enum QuestionType {
  MULTIPLE_CHOICE = 'multiple_choice',
  TRUE_FALSE = 'true_false',
  SHORT_ANSWER = 'short_answer',
  ESSAY = 'essay',
}

export interface Question {
  id: string;
  type: QuestionType;
  question: string;
  options?: string[];
  correctAnswer?: string | string[];
  points: number;
  order: number;
}

// Question Bank types (admin question management)
export const QuestionBankStatus = {
  DRAFT: 'DRAFT',
  ACTIVE: 'ACTIVE',
  FLAGGED: 'FLAGGED',
  RETIRED: 'RETIRED',
} as const;
export type QuestionBankStatus = (typeof QuestionBankStatus)[keyof typeof QuestionBankStatus];

export interface QuestionBankOption {
  id?: string;
  optionText: string;
  optionOrder: number;
  isCorrect: boolean;
}

export interface QuestionBankExplanation {
  id?: string;
  explanationType?: 'WRONG_ANSWER' | 'CORRECT_ANSWER' | 'HINT';
  explanationText: string;
  displayOrder?: number;
}

export interface QuestionBankItem {
  id: string;
  questionText: string;
  questionHtml?: string;
  questionImageUrl?: string;
  typeId: number;
  difficultyId: number;
  subjectId: number;
  topicId?: number;
  classLevel: number;
  examCategoryId: number;
  correctAnswer?: string;
  timeLimitSeconds: number;
  marks: number | string;
  negativeMarks: number | string;
  tags: string[];
  status: QuestionBankStatus;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  type: { id: number; typeName: string; typeCode: string };
  difficulty: { id: number; difficultyName: string; difficultyCode: string; colorHex?: string };
  subject: { id: number; subjectName: string; subjectCode: string };
  topic?: { id: number; topicName: string } | null;
  examCategory: { id: number; categoryName: string; categoryCode: string };
  options: QuestionBankOption[];
  explanations: QuestionBankExplanation[];
}

export interface QuestionBankFormData {
  questionText: string;
  typeId: number;
  typeCode: string;
  difficultyId: number;
  subjectId: number;
  topicId?: number;
  classLevel: number;
  examCategoryId: number;
  correctAnswer?: string;
  marks: number;
  negativeMarks: number;
  timeLimitSeconds?: number;
  status: QuestionBankStatus;
  options?: QuestionBankOption[];
  explanations?: QuestionBankExplanation[];
}

export interface QuestionMetaSubject {
  id: number;
  subjectName: string;
  subjectCode: string;
}

export interface QuestionMetaTopic {
  id: number;
  subjectId: number;
  topicName: string;
}

export interface QuestionMetaExamCategory {
  id: number;
  categoryName: string;
  categoryCode: string;
}

export interface QuestionMetaDifficultyLevel {
  id: number;
  difficultyName: string;
  difficultyCode: string;
}

export interface QuestionMetaQuestionType {
  id: number;
  typeName: string;
  typeCode: string;
}

export interface QuestionBankMeta {
  subjects: QuestionMetaSubject[];
  examCategories: QuestionMetaExamCategory[];
  topics: QuestionMetaTopic[];
  difficultyLevels: QuestionMetaDifficultyLevel[];
  questionTypes: QuestionMetaQuestionType[];
}

export interface Assessment {
  id: string;
  title: string;
  description: string;
  testType?: TestType;
  status: AssessmentStatus;
  duration: number; // in minutes
  totalPoints: number;
  passingScore: number;
  questions: Question[];
  createdBy: string;
  createdAt: string;
  updatedAt: string;
  scheduledAt?: string;
  dueDate?: string;
  isActive?: boolean;
  classLevel?: number;
  _count?: {
    testQuestions?: number;
    testAttempts?: number;
  };
}

// Submission types
export enum SubmissionStatus {
  NOT_STARTED = 'not_started',
  IN_PROGRESS = 'in_progress',
  SUBMITTED = 'submitted',
  GRADED = 'graded',
}

export interface Answer {
  questionId: string;
  answer: string | string[];
}

export interface Submission {
  id: string;
  assessmentId: string;
  studentId: string;
  status: SubmissionStatus;
  answers: Answer[];
  score?: number;
  maxScore: number;
  feedback?: string;
  startedAt?: string;
  submittedAt?: string;
  gradedAt?: string;
  timeSpent?: number; // in seconds
}

// Assessment Statistics types
export interface AssessmentStatistics {
  assessmentId: string;
  totalSubmissions: number;
  completedSubmissions: number;
  averageScore: number;
  highestScore: number;
  lowestScore: number;
  passRate: number; // percentage
  averageTimeSpent?: number; // in seconds
  submissionsByStatus: Record<SubmissionStatus, number>;
}

// Real test-attempt (submission) types, matching the backend TestAttempt model
export const AttemptStatus = {
  IN_PROGRESS: 'IN_PROGRESS',
  COMPLETED: 'COMPLETED',
  ABANDONED: 'ABANDONED',
  AUTO_SUBMITTED: 'AUTO_SUBMITTED',
} as const;
export type AttemptStatus = (typeof AttemptStatus)[keyof typeof AttemptStatus];

export interface TestAttemptOption {
  id: string;
  optionText: string;
  optionOrder: number;
}

export interface TestAttemptQuestion {
  testQuestionId: string;
  questionId: string;
  questionOrder: number;
  marks: number;
  negativeMarks: number;
  questionText: string;
  questionImageUrl?: string | null;
  type: { typeCode: string; typeName: string };
  options: TestAttemptOption[];
}

export interface TestAttempt {
  id: string;
  testId: string;
  userId: string;
  status: AttemptStatus;
  startedAt: string;
  submittedAt?: string | null;
  timeTakenSeconds?: number | null;
  totalQuestions: number;
  attemptedQuestions: number;
  correctAnswers: number;
  wrongAnswers: number;
  unattempted: number;
  score: number | string;
  maxScore: number | string;
  percentage: number | string;
}

export interface TestAttemptSummary extends TestAttempt {
  test: {
    id: string;
    testName: string | null;
    testType: string;
    testConfig?: { duration?: number; totalMarks?: number };
    subject?: { id: number; subjectName: string } | null;
  };
  user: {
    id: string;
    email: string;
    profile?: { fullName: string } | null;
  };
}

export interface StartAttemptResponse {
  attempt: TestAttempt;
  questions: TestAttemptQuestion[];
}


// API Response types
export interface ApiResponse<T> {
  data: T;
  message?: string;
  success: boolean;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export interface ApiError {
  message: string;
  errors?: Record<string, string[]>;
  statusCode: number;
}

// Filter and Sort types
export interface FilterParams {
  search?: string;
  status?: string;
  startDate?: string;
  endDate?: string;
  role?: UserRole;
}

export interface SortParams {
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface PaginationParams {
  page?: number;
  pageSize?: number;
}

export type QueryParams = FilterParams & SortParams & PaginationParams;
