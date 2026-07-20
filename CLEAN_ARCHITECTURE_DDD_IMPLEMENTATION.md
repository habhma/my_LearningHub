# Clean Architecture + Domain-Driven Design (DDD) Implementation Guide
## Student Assessment Platform

**Version:** 1.0  
**Date:** 2026-07-19  
**Pattern:** Clean Architecture + DDD + Hexagonal Architecture

---

## 📐 Table of Contents

1. [Architecture Overview](#architecture-overview)
2. [Project Structure](#project-structure)
3. [Domain Layer Implementation](#domain-layer-implementation)
4. [Application Layer Implementation](#application-layer-implementation)
5. [Infrastructure Layer Implementation](#infrastructure-layer-implementation)
6. [Presentation Layer Implementation](#presentation-layer-implementation)
7. [Dependency Injection Setup](#dependency-injection-setup)
8. [Testing Strategy](#testing-strategy)
9. [Migration Path](#migration-path)

---

## 🏗️ Architecture Overview

### The Four Layers

```
┌─────────────────────────────────────────────────────────────┐
│                    PRESENTATION LAYER                        │
│  (Controllers, Routes, Middleware, DTOs, Validators)        │
│  Dependencies: Application Layer                             │
└──────────────────────────┬──────────────────────────────────┘
                           │
┌──────────────────────────▼──────────────────────────────────┐
│                    APPLICATION LAYER                         │
│  (Use Cases, Application Services, DTOs, Interfaces)        │
│  Dependencies: Domain Layer                                  │
└──────────────────────────┬──────────────────────────────────┘
                           │
┌──────────────────────────▼──────────────────────────────────┐
│                      DOMAIN LAYER                            │
│  (Entities, Value Objects, Domain Services, Interfaces)     │
│  Dependencies: NONE (Pure business logic)                   │
└─────────────────────────────────────────────────────────────┘
                           ▲
┌──────────────────────────┴──────────────────────────────────┐
│                  INFRASTRUCTURE LAYER                        │
│  (DB, Cache, External APIs, File Storage, Email, etc.)      │
│  Dependencies: Domain Layer (implements interfaces)          │
└─────────────────────────────────────────────────────────────┘
```

### Key Principles

1. **Dependency Rule**: Dependencies point inward (toward domain)
2. **Domain Independence**: Core business logic has zero external dependencies
3. **Interface Segregation**: Small, focused interfaces
4. **Testability**: Each layer independently testable
5. **Flexibility**: Easy to swap implementations (e.g., PostgreSQL → MongoDB)

---

## 📁 Project Structure

```
backend/src/
├── domain/                           # Core Business Logic (No dependencies)
│   ├── entities/                     # Business entities
│   │   ├── User.ts
│   │   ├── Test.ts
│   │   ├── TestAttempt.ts
│   │   ├── Question.ts
│   │   ├── Answer.ts
│   │   └── Subscription.ts
│   │
│   ├── value-objects/                # Immutable value types
│   │   ├── Email.ts
│   │   ├── Password.ts
│   │   ├── Score.ts
│   │   ├── Difficulty.ts
│   │   ├── Money.ts
│   │   └── DateRange.ts
│   │
│   ├── aggregates/                   # Aggregate roots
│   │   ├── TestAggregate.ts
│   │   └── UserAggregate.ts
│   │
│   ├── repositories/                 # Repository interfaces (NOT implementations)
│   │   ├── IUserRepository.ts
│   │   ├── ITestRepository.ts
│   │   ├── IQuestionRepository.ts
│   │   └── ISubscriptionRepository.ts
│   │
│   ├── services/                     # Domain services (business logic)
│   │   ├── TestScoringService.ts
│   │   ├── BadgeAwardService.ts
│   │   ├── LeaderboardService.ts
│   │   └── SubscriptionValidator.ts
│   │
│   ├── events/                       # Domain events
│   │   ├── TestSubmittedEvent.ts
│   │   ├── UserRegisteredEvent.ts
│   │   ├── BadgeEarnedEvent.ts
│   │   └── SubscriptionCreatedEvent.ts
│   │
│   ├── exceptions/                   # Domain-specific exceptions
│   │   ├── DomainException.ts
│   │   ├── InvalidTestStateException.ts
│   │   └── InsufficientAccessException.ts
│   │
│   └── specifications/               # Business rules as specifications
│       ├── ISpecification.ts
│       ├── TestEligibilitySpecification.ts
│       └── SubscriptionActiveSpecification.ts
│
├── application/                      # Application Business Logic
│   ├── use-cases/                    # Use cases (one per action)
│   │   ├── auth/
│   │   │   ├── RegisterUser.ts
│   │   │   ├── LoginUser.ts
│   │   │   ├── RefreshToken.ts
│   │   │   └── ResetPassword.ts
│   │   │
│   │   ├── test/
│   │   │   ├── CreatePracticeTest.ts
│   │   │   ├── StartTest.ts
│   │   │   ├── SubmitAnswer.ts
│   │   │   ├── SubmitTest.ts
│   │   │   ├── GetTestResults.ts
│   │   │   └── GetTestHistory.ts
│   │   │
│   │   ├── question/
│   │   │   ├── CreateQuestion.ts
│   │   │   ├── UpdateQuestion.ts
│   │   │   ├── SearchQuestions.ts
│   │   │   └── ReportQuestion.ts
│   │   │
│   │   └── subscription/
│   │       ├── CreateSubscription.ts
│   │       ├── ProcessPayment.ts
│   │       └── CheckAccess.ts
│   │
│   ├── dto/                          # Data Transfer Objects
│   │   ├── auth/
│   │   │   ├── RegisterUserDto.ts
│   │   │   └── LoginResponseDto.ts
│   │   ├── test/
│   │   │   ├── CreateTestDto.ts
│   │   │   ├── TestResultDto.ts
│   │   │   └── SubmitAnswerDto.ts
│   │   └── common/
│   │       ├── PaginationDto.ts
│   │       └── ResponseDto.ts
│   │
│   ├── mappers/                      # Entity <-> DTO mappers
│   │   ├── UserMapper.ts
│   │   ├── TestMapper.ts
│   │   └── QuestionMapper.ts
│   │
│   ├── services/                     # Application services
│   │   ├── IEmailService.ts         # Interface
│   │   ├── IStorageService.ts       # Interface
│   │   └── IPaymentService.ts       # Interface
│   │
│   └── ports/                        # Hexagonal architecture ports
│       ├── IEventBus.ts
│       ├── ICache.ts
│       └── ILogger.ts
│
├── infrastructure/                   # External Dependencies Implementation
│   ├── database/
│   │   ├── prisma/
│   │   │   ├── schema.prisma
│   │   │   └── migrations/
│   │   │
│   │   ├── repositories/            # Repository implementations
│   │   │   ├── PrismaUserRepository.ts
│   │   │   ├── PrismaTestRepository.ts
│   │   │   ├── PrismaQuestionRepository.ts
│   │   │   └── PrismaSubscriptionRepository.ts
│   │   │
│   │   └── UnitOfWork.ts            # Transaction management
│   │
│   ├── cache/
│   │   ├── RedisCache.ts            # Redis implementation
│   │   └── InMemoryCache.ts         # For testing
│   │
│   ├── storage/
│   │   ├── S3StorageService.ts
│   │   └── LocalStorageService.ts   # For development
│   │
│   ├── messaging/
│   │   ├── EventBus.ts
│   │   └── event-handlers/
│   │       ├── SendEmailOnTestSubmission.ts
│   │       ├── AwardBadgesOnTestCompletion.ts
│   │       └── UpdateLeaderboardOnScoreChange.ts
│   │
│   ├── external-services/
│   │   ├── email/
│   │   │   ├── SESEmailService.ts
│   │   │   └── SendGridEmailService.ts
│   │   │
│   │   ├── payment/
│   │   │   ├── RazorpayPaymentService.ts
│   │   │   └── StripePaymentService.ts
│   │   │
│   │   └── sms/
│   │       └── TwilioSmsService.ts
│   │
│   ├── logging/
│   │   └── WinstonLogger.ts
│   │
│   └── config/
│       ├── database.config.ts
│       ├── redis.config.ts
│       └── aws.config.ts
│
├── presentation/                     # API/HTTP Layer
│   ├── http/
│   │   ├── controllers/
│   │   │   ├── AuthController.ts
│   │   │   ├── TestController.ts
│   │   │   ├── QuestionController.ts
│   │   │   └── UserController.ts
│   │   │
│   │   ├── routes/
│   │   │   ├── auth.routes.ts
│   │   │   ├── test.routes.ts
│   │   │   ├── question.routes.ts
│   │   │   └── index.ts
│   │   │
│   │   ├── middleware/
│   │   │   ├── authentication.ts
│   │   │   ├── authorization.ts
│   │   │   ├── validation.ts
│   │   │   ├── rate-limiter.ts
│   │   │   └── error-handler.ts
│   │   │
│   │   └── validators/
│   │       ├── auth.validator.ts
│   │       ├── test.validator.ts
│   │       └── question.validator.ts
│   │
│   └── di/                          # Dependency Injection container
│       └── container.ts
│
├── shared/                          # Shared utilities (used by all layers)
│   ├── types/
│   │   └── common.types.ts
│   ├── utils/
│   │   ├── date.utils.ts
│   │   └── string.utils.ts
│   └── constants/
│       └── app.constants.ts
│
└── server.ts                        # Application entry point
```

---

## 🎯 Domain Layer Implementation

### 1. Entities

**Entities** have identity and lifecycle. They are mutable but identity remains constant.

#### `domain/entities/User.ts`

```typescript
import { Email } from '../value-objects/Email';
import { Password } from '../value-objects/Password';
import { DomainException } from '../exceptions/DomainException';

export enum UserRole {
  STUDENT = 'student',
  ADMIN = 'admin',
  TEACHER = 'teacher',
  PARENT = 'parent'
}

export enum UserStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  SUSPENDED = 'suspended'
}

export interface UserProps {
  userId: string;
  email: Email;
  passwordHash: string;
  role: UserRole;
  status: UserStatus;
  emailVerified: boolean;
  lastLoginAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export class User {
  private props: UserProps;

  private constructor(props: UserProps) {
    this.props = props;
  }

  // Factory method for creating new user
  static create(
    email: Email,
    password: Password,
    role: UserRole = UserRole.STUDENT
  ): User {
    return new User({
      userId: this.generateId(),
      email,
      passwordHash: password.hash(),
      role,
      status: UserStatus.ACTIVE,
      emailVerified: false,
      createdAt: new Date(),
      updatedAt: new Date()
    });
  }

  // Factory method for reconstituting from database
  static fromPersistence(props: UserProps): User {
    return new User(props);
  }

  // Getters
  get userId(): string {
    return this.props.userId;
  }

  get email(): Email {
    return this.props.email;
  }

  get role(): UserRole {
    return this.props.role;
  }

  get status(): UserStatus {
    return this.props.status;
  }

  get isEmailVerified(): boolean {
    return this.props.emailVerified;
  }

  get passwordHash(): string {
    return this.props.passwordHash;
  }

  // Business methods
  verifyEmail(): void {
    if (this.props.emailVerified) {
      throw new DomainException('Email already verified');
    }
    this.props.emailVerified = true;
    this.props.updatedAt = new Date();
  }

  changePassword(oldPassword: Password, newPassword: Password): void {
    if (!oldPassword.verify(this.props.passwordHash)) {
      throw new DomainException('Invalid current password');
    }
    this.props.passwordHash = newPassword.hash();
    this.props.updatedAt = new Date();
  }

  suspend(): void {
    if (this.props.status === UserStatus.SUSPENDED) {
      throw new DomainException('User already suspended');
    }
    this.props.status = UserStatus.SUSPENDED;
    this.props.updatedAt = new Date();
  }

  activate(): void {
    if (this.props.status === UserStatus.ACTIVE) {
      throw new DomainException('User already active');
    }
    this.props.status = UserStatus.ACTIVE;
    this.props.updatedAt = new Date();
  }

  updateLastLogin(): void {
    this.props.lastLoginAt = new Date();
    this.props.updatedAt = new Date();
  }

  canAccessFeature(feature: string): boolean {
    // Business logic for feature access based on role
    const permissions: Record<UserRole, string[]> = {
      [UserRole.STUDENT]: ['take_test', 'view_results', 'browse_questions'],
      [UserRole.ADMIN]: ['manage_users', 'manage_questions', 'view_analytics'],
      [UserRole.TEACHER]: ['create_questions', 'view_submissions'],
      [UserRole.PARENT]: ['view_child_results']
    };

    return permissions[this.props.role]?.includes(feature) ?? false;
  }

  // Convert to plain object for persistence
  toPersistence(): UserProps {
    return { ...this.props };
  }

  private static generateId(): string {
    // Use UUID or other ID generation strategy
    return `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
}
```

#### `domain/entities/Test.ts`

```typescript
import { DomainException } from '../exceptions/DomainException';
import { TestConfiguration } from '../value-objects/TestConfiguration';

export enum TestType {
  PRACTICE = 'practice',
  MOCK = 'mock',
  DAILY_CHALLENGE = 'daily_challenge'
}

export enum TestStatus {
  DRAFT = 'draft',
  PUBLISHED = 'published',
  ARCHIVED = 'archived'
}

export interface TestProps {
  testId: string;
  title: string;
  description?: string;
  type: TestType;
  status: TestStatus;
  subjectId: string;
  boardId: string;
  classLevel: number;
  configuration: TestConfiguration;
  totalMarks: number;
  passingMarks: number;
  totalQuestions: number;
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
}

export class Test {
  private props: TestProps;

  private constructor(props: TestProps) {
    this.props = props;
    this.validate();
  }

  static create(
    title: string,
    type: TestType,
    configuration: TestConfiguration,
    createdBy: string
  ): Test {
    return new Test({
      testId: this.generateId(),
      title,
      type,
      status: TestStatus.DRAFT,
      subjectId: configuration.subjectId,
      boardId: configuration.boardId,
      classLevel: configuration.classLevel,
      configuration,
      totalMarks: 0, // Will be calculated
      passingMarks: 0,
      totalQuestions: 0,
      createdBy,
      createdAt: new Date(),
      updatedAt: new Date()
    });
  }

  static fromPersistence(props: TestProps): Test {
    return new Test(props);
  }

  // Getters
  get testId(): string {
    return this.props.testId;
  }

  get title(): string {
    return this.props.title;
  }

  get type(): TestType {
    return this.props.type;
  }

  get status(): TestStatus {
    return this.props.status;
  }

  get configuration(): TestConfiguration {
    return this.props.configuration;
  }

  get totalMarks(): number {
    return this.props.totalMarks;
  }

  get totalQuestions(): number {
    return this.props.totalQuestions;
  }

  // Business methods
  publish(): void {
    if (this.props.status === TestStatus.PUBLISHED) {
      throw new DomainException('Test is already published');
    }

    if (this.props.totalQuestions === 0) {
      throw new DomainException('Cannot publish test with no questions');
    }

    this.props.status = TestStatus.PUBLISHED;
    this.props.updatedAt = new Date();
  }

  archive(): void {
    if (this.props.status === TestStatus.ARCHIVED) {
      throw new DomainException('Test is already archived');
    }

    this.props.status = TestStatus.ARCHIVED;
    this.props.updatedAt = new Date();
  }

  updateConfiguration(config: TestConfiguration): void {
    if (this.props.status === TestStatus.PUBLISHED) {
      throw new DomainException('Cannot modify published test');
    }

    this.props.configuration = config;
    this.props.updatedAt = new Date();
  }

  setTotalMarks(marks: number): void {
    if (marks < 0) {
      throw new DomainException('Total marks cannot be negative');
    }
    this.props.totalMarks = marks;
    this.props.passingMarks = Math.ceil(marks * 0.4); // 40% passing
    this.props.updatedAt = new Date();
  }

  setTotalQuestions(count: number): void {
    if (count < 1) {
      throw new DomainException('Test must have at least one question');
    }
    this.props.totalQuestions = count;
    this.props.updatedAt = new Date();
  }

  canBeAttemptedBy(userId: string, subscriptionStatus: string): boolean {
    // Business logic for access control
    if (this.props.status !== TestStatus.PUBLISHED) {
      return false;
    }

    if (this.props.type === TestType.MOCK) {
      return subscriptionStatus === 'active';
    }

    return true; // Practice tests are free
  }

  private validate(): void {
    if (!this.props.title || this.props.title.trim().length === 0) {
      throw new DomainException('Test title cannot be empty');
    }

    if (this.props.classLevel < 1 || this.props.classLevel > 10) {
      throw new DomainException('Class level must be between 1 and 10');
    }
  }

  toPersistence(): TestProps {
    return { ...this.props };
  }

  private static generateId(): string {
    return `test_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
}
```

#### `domain/entities/TestAttempt.ts`

```typescript
import { DomainException } from '../exceptions/DomainException';
import { Score } from '../value-objects/Score';
import { Answer } from './Answer';

export enum AttemptStatus {
  NOT_STARTED = 'not_started',
  IN_PROGRESS = 'in_progress',
  COMPLETED = 'completed',
  ABANDONED = 'abandoned',
  TIME_EXPIRED = 'time_expired'
}

export interface TestAttemptProps {
  attemptId: string;
  testId: string;
  userId: string;
  status: AttemptStatus;
  startedAt?: Date;
  completedAt?: Date;
  expiresAt?: Date;
  answers: Map<string, Answer>;
  score?: Score;
  timeSpentSeconds: number;
  createdAt: Date;
  updatedAt: Date;
}

export class TestAttempt {
  private props: TestAttemptProps;

  private constructor(props: TestAttemptProps) {
    this.props = props;
  }

  static create(testId: string, userId: string, timeLimitMinutes: number): TestAttempt {
    const now = new Date();
    const expiresAt = new Date(now.getTime() + timeLimitMinutes * 60 * 1000);

    return new TestAttempt({
      attemptId: this.generateId(),
      testId,
      userId,
      status: AttemptStatus.NOT_STARTED,
      answers: new Map(),
      timeSpentSeconds: 0,
      expiresAt,
      createdAt: now,
      updatedAt: now
    });
  }

  static fromPersistence(props: TestAttemptProps): TestAttempt {
    return new TestAttempt(props);
  }

  // Getters
  get attemptId(): string {
    return this.props.attemptId;
  }

  get testId(): string {
    return this.props.testId;
  }

  get userId(): string {
    return this.props.userId;
  }

  get status(): AttemptStatus {
    return this.props.status;
  }

  get answers(): Map<string, Answer> {
    return new Map(this.props.answers); // Return copy
  }

  get score(): Score | undefined {
    return this.props.score;
  }

  get timeSpentSeconds(): number {
    return this.props.timeSpentSeconds;
  }

  // Business methods
  start(): void {
    if (this.props.status !== AttemptStatus.NOT_STARTED) {
      throw new DomainException('Test attempt already started');
    }

    this.props.status = AttemptStatus.IN_PROGRESS;
    this.props.startedAt = new Date();
    this.props.updatedAt = new Date();
  }

  submitAnswer(questionId: string, answer: Answer): void {
    if (this.props.status !== AttemptStatus.IN_PROGRESS) {
      throw new DomainException('Cannot submit answer - test not in progress');
    }

    if (this.isExpired()) {
      this.expire();
      throw new DomainException('Test time has expired');
    }

    this.props.answers.set(questionId, answer);
    this.props.updatedAt = new Date();
  }

  complete(score: Score): void {
    if (this.props.status !== AttemptStatus.IN_PROGRESS) {
      throw new DomainException('Cannot complete - test not in progress');
    }

    this.props.status = AttemptStatus.COMPLETED;
    this.props.completedAt = new Date();
    this.props.score = score;
    this.calculateTimeSpent();
    this.props.updatedAt = new Date();
  }

  abandon(): void {
    if (this.props.status === AttemptStatus.COMPLETED) {
      throw new DomainException('Cannot abandon completed test');
    }

    this.props.status = AttemptStatus.ABANDONED;
    this.props.updatedAt = new Date();
  }

  isExpired(): boolean {
    if (!this.props.expiresAt) {
      return false;
    }
    return new Date() > this.props.expiresAt;
  }

  expire(): void {
    this.props.status = AttemptStatus.TIME_EXPIRED;
    this.props.completedAt = new Date();
    this.calculateTimeSpent();
    this.props.updatedAt = new Date();
  }

  getAnsweredQuestionCount(): number {
    return this.props.answers.size;
  }

  hasAnsweredQuestion(questionId: string): boolean {
    return this.props.answers.has(questionId);
  }

  private calculateTimeSpent(): void {
    if (this.props.startedAt) {
      const endTime = this.props.completedAt || new Date();
      this.props.timeSpentSeconds = Math.floor(
        (endTime.getTime() - this.props.startedAt.getTime()) / 1000
      );
    }
  }

  toPersistence(): TestAttemptProps {
    return {
      ...this.props,
      answers: new Map(this.props.answers)
    };
  }

  private static generateId(): string {
    return `attempt_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
}
```

---

### 2. Value Objects

**Value Objects** are immutable and defined by their attributes, not identity.

#### `domain/value-objects/Email.ts`

```typescript
import { DomainException } from '../exceptions/DomainException';

export class Email {
  private readonly value: string;

  private constructor(value: string) {
    this.value = value;
    this.validate();
  }

  static create(email: string): Email {
    return new Email(email.toLowerCase().trim());
  }

  getValue(): string {
    return this.value;
  }

  equals(other: Email): boolean {
    return this.value === other.value;
  }

  private validate(): void {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(this.value)) {
      throw new DomainException('Invalid email format');
    }

    if (this.value.length > 255) {
      throw new DomainException('Email too long');
    }
  }

  toString(): string {
    return this.value;
  }
}
```

#### `domain/value-objects/Password.ts`

```typescript
import * as bcrypt from 'bcryptjs';
import { DomainException } from '../exceptions/DomainException';

export class Password {
  private readonly value: string;
  private readonly isHashed: boolean;

  private constructor(value: string, isHashed: boolean = false) {
    this.value = value;
    this.isHashed = isHashed;
    
    if (!isHashed) {
      this.validate();
    }
  }

  static create(plainPassword: string): Password {
    return new Password(plainPassword, false);
  }

  static fromHash(hashedPassword: string): Password {
    return new Password(hashedPassword, true);
  }

  hash(): string {
    if (this.isHashed) {
      return this.value;
    }
    return bcrypt.hashSync(this.value, 12);
  }

  verify(hashedPassword: string): boolean {
    if (this.isHashed) {
      throw new DomainException('Cannot verify from a hashed password');
    }
    return bcrypt.compareSync(this.value, hashedPassword);
  }

  private validate(): void {
    if (this.value.length < 8) {
      throw new DomainException('Password must be at least 8 characters');
    }

    if (this.value.length > 128) {
      throw new DomainException('Password too long');
    }

    const hasUpperCase = /[A-Z]/.test(this.value);
    const hasLowerCase = /[a-z]/.test(this.value);
    const hasNumber = /[0-9]/.test(this.value);
    const hasSpecial = /[!@#$%^&*(),.?":{}|<>]/.test(this.value);

    if (!(hasUpperCase && hasLowerCase && hasNumber && hasSpecial)) {
      throw new DomainException(
        'Password must contain uppercase, lowercase, number, and special character'
      );
    }
  }
}
```

#### `domain/value-objects/Score.ts`

```typescript
import { DomainException } from '../exceptions/DomainException';

export class Score {
  private readonly obtainedMarks: number;
  private readonly totalMarks: number;
  private readonly percentage: number;

  private constructor(obtainedMarks: number, totalMarks: number) {
    this.obtainedMarks = obtainedMarks;
    this.totalMarks = totalMarks;
    this.percentage = this.calculatePercentage();
    this.validate();
  }

  static create(obtainedMarks: number, totalMarks: number): Score {
    return new Score(obtainedMarks, totalMarks);
  }

  getObtainedMarks(): number {
    return this.obtainedMarks;
  }

  getTotalMarks(): number {
    return this.totalMarks;
  }

  getPercentage(): number {
    return this.percentage;
  }

  isPassing(passingPercentage: number = 40): boolean {
    return this.percentage >= passingPercentage;
  }

  getGrade(): string {
    if (this.percentage >= 90) return 'A+';
    if (this.percentage >= 80) return 'A';
    if (this.percentage >= 70) return 'B';
    if (this.percentage >= 60) return 'C';
    if (this.percentage >= 40) return 'D';
    return 'F';
  }

  equals(other: Score): boolean {
    return (
      this.obtainedMarks === other.obtainedMarks &&
      this.totalMarks === other.totalMarks
    );
  }

  private calculatePercentage(): number {
    if (this.totalMarks === 0) {
      return 0;
    }
    return parseFloat(((this.obtainedMarks / this.totalMarks) * 100).toFixed(2));
  }

  private validate(): void {
    if (this.totalMarks < 0) {
      throw new DomainException('Total marks cannot be negative');
    }

    if (this.obtainedMarks < 0) {
      throw new DomainException('Obtained marks cannot be negative');
    }

    if (this.obtainedMarks > this.totalMarks) {
      throw new DomainException('Obtained marks cannot exceed total marks');
    }
  }
}
```

#### `domain/value-objects/Money.ts`

```typescript
import { DomainException } from '../exceptions/DomainException';

export class Money {
  private readonly amount: number;
  private readonly currency: string;

  private constructor(amount: number, currency: string) {
    this.amount = amount;
    this.currency = currency.toUpperCase();
    this.validate();
  }

  static create(amount: number, currency: string = 'USD'): Money {
    return new Money(amount, currency);
  }

  static zero(currency: string = 'USD'): Money {
    return new Money(0, currency);
  }

  getAmount(): number {
    return this.amount;
  }

  getCurrency(): string {
    return this.currency;
  }

  add(other: Money): Money {
    this.ensureSameCurrency(other);
    return new Money(this.amount + other.amount, this.currency);
  }

  subtract(other: Money): Money {
    this.ensureSameCurrency(other);
    return new Money(this.amount - other.amount, this.currency);
  }

  multiply(factor: number): Money {
    return new Money(this.amount * factor, this.currency);
  }

  isGreaterThan(other: Money): boolean {
    this.ensureSameCurrency(other);
    return this.amount > other.amount;
  }

  isZero(): boolean {
    return this.amount === 0;
  }

  equals(other: Money): boolean {
    return this.amount === other.amount && this.currency === other.currency;
  }

  format(): string {
    const symbols: Record<string, string> = {
      USD: '$',
      EUR: '€',
      GBP: '£',
      INR: '₹'
    };

    const symbol = symbols[this.currency] || this.currency;
    return `${symbol}${this.amount.toFixed(2)}`;
  }

  private ensureSameCurrency(other: Money): void {
    if (this.currency !== other.currency) {
      throw new DomainException(
        `Cannot perform operation on different currencies: ${this.currency} and ${other.currency}`
      );
    }
  }

  private validate(): void {
    if (this.amount < 0) {
      throw new DomainException('Money amount cannot be negative');
    }

    const validCurrencies = ['USD', 'EUR', 'GBP', 'INR'];
    if (!validCurrencies.includes(this.currency)) {
      throw new DomainException(`Invalid currency: ${this.currency}`);
    }
  }
}
```

---

### 3. Domain Services

**Domain Services** contain business logic that doesn't naturally fit in entities.

#### `domain/services/TestScoringService.ts`

```typescript
import { TestAttempt } from '../entities/TestAttempt';
import { Question } from '../entities/Question';
import { Score } from '../value-objects/Score';
import { Answer } from '../entities/Answer';

export interface IQuestionEvaluator {
  evaluate(question: Question, answer: Answer): EvaluationResult;
}

export interface EvaluationResult {
  isCorrect: boolean;
  marksAwarded: number;
  feedback?: string;
}

export class TestScoringService {
  constructor(private readonly evaluators: Map<string, IQuestionEvaluator>) {}

  calculateScore(
    attempt: TestAttempt,
    questions: Question[],
    negativeMarkingEnabled: boolean = false
  ): Score {
    let totalMarks = 0;
    let obtainedMarks = 0;

    for (const question of questions) {
      totalMarks += question.marks;

      const answer = attempt.answers.get(question.questionId);
      if (!answer) {
        continue; // Question not attempted
      }

      const evaluator = this.evaluators.get(question.type);
      if (!evaluator) {
        throw new Error(`No evaluator found for question type: ${question.type}`);
      }

      const result = evaluator.evaluate(question, answer);
      
      if (result.isCorrect) {
        obtainedMarks += result.marksAwarded;
      } else if (negativeMarkingEnabled) {
        obtainedMarks -= question.marks * 0.25; // 25% negative marking
      }
    }

    // Ensure obtained marks don't go below zero
    obtainedMarks = Math.max(0, obtainedMarks);

    return Score.create(obtainedMarks, totalMarks);
  }

  calculateSectionWiseScore(
    attempt: TestAttempt,
    questions: Question[]
  ): Map<string, Score> {
    const sectionScores = new Map<string, Score>();
    const sectionData = new Map<string, { total: number; obtained: number }>();

    for (const question of questions) {
      const section = question.section || 'general';
      
      if (!sectionData.has(section)) {
        sectionData.set(section, { total: 0, obtained: 0 });
      }

      const data = sectionData.get(section)!;
      data.total += question.marks;

      const answer = attempt.answers.get(question.questionId);
      if (answer) {
        const evaluator = this.evaluators.get(question.type);
        if (evaluator) {
          const result = evaluator.evaluate(question, answer);
          if (result.isCorrect) {
            data.obtained += result.marksAwarded;
          }
        }
      }
    }

    for (const [section, data] of sectionData) {
      sectionScores.set(section, Score.create(data.obtained, data.total));
    }

    return sectionScores;
  }
}
```

#### `domain/services/BadgeAwardService.ts`

```typescript
import { TestAttempt } from '../entities/TestAttempt';
import { Score } from '../value-objects/Score';
import { Badge } from '../entities/Badge';

export interface BadgeCriteria {
  badgeId: string;
  name: string;
  description: string;
  checkEligibility(context: BadgeContext): boolean;
}

export interface BadgeContext {
  userId: string;
  testAttempt?: TestAttempt;
  score?: Score;
  totalTestsCompleted?: number;
  consecutiveLogins?: number;
  averageScore?: number;
}

export class BadgeAwardService {
  private readonly badgeCriteria: BadgeCriteria[] = [];

  registerBadge(criteria: BadgeCriteria): void {
    this.badgeCriteria.push(criteria);
  }

  determineEarnedBadges(context: BadgeContext): string[] {
    const earnedBadges: string[] = [];

    for (const criteria of this.badgeCriteria) {
      if (criteria.checkEligibility(context)) {
        earnedBadges.push(criteria.badgeId);
      }
    }

    return earnedBadges;
  }
}

// Example badge criteria implementations
export class FirstTestBadgeCriteria implements BadgeCriteria {
  badgeId = 'first-test';
  name = 'First Steps';
  description = 'Complete your first test';

  checkEligibility(context: BadgeContext): boolean {
    return context.totalTestsCompleted === 1;
  }
}

export class PerfectScoreBadgeCriteria implements BadgeCriteria {
  badgeId = 'perfect-score';
  name = 'Perfect Score';
  description = 'Score 100% in any test';

  checkEligibility(context: BadgeContext): boolean {
    return context.score?.getPercentage() === 100;
  }
}

export class ConsistentLearnerBadgeCriteria implements BadgeCriteria {
  badgeId = 'consistent-learner';
  name = 'Consistent Learner';
  description = 'Login for 7 consecutive days';

  checkEligibility(context: BadgeContext): boolean {
    return (context.consecutiveLogins ?? 0) >= 7;
  }
}

export class HighAchieverBadgeCriteria implements BadgeCriteria {
  badgeId = 'high-achiever';
  name = 'High Achiever';
  description = 'Maintain 85% average score over 10 tests';

  checkEligibility(context: BadgeContext): boolean {
    return (
      (context.totalTestsCompleted ?? 0) >= 10 &&
      (context.averageScore ?? 0) >= 85
    );
  }
}
```

---

### 4. Repository Interfaces

**Repositories** define how to persist and retrieve aggregates (interfaces only, no implementation).

#### `domain/repositories/IUserRepository.ts`

```typescript
import { User } from '../entities/User';
import { Email } from '../value-objects/Email';

export interface IUserRepository {
  // Create
  save(user: User): Promise<void>;

  // Read
  findById(userId: string): Promise<User | null>;
  findByEmail(email: Email): Promise<User | null>;
  findMany(filters: UserFilters): Promise<User[]>;
  exists(userId: string): Promise<boolean>;

  // Update
  update(user: User): Promise<void>;

  // Delete
  delete(userId: string): Promise<void>;

  // Queries
  count(filters?: UserFilters): Promise<number>;
}

export interface UserFilters {
  role?: string;
  status?: string;
  emailVerified?: boolean;
  createdAfter?: Date;
  createdBefore?: Date;
  search?: string;
  page?: number;
  limit?: number;
}
```

#### `domain/repositories/ITestRepository.ts`

```typescript
import { Test } from '../entities/Test';

export interface ITestRepository {
  save(test: Test): Promise<void>;
  findById(testId: string): Promise<Test | null>;
  findMany(filters: TestFilters): Promise<Test[]>;
  update(test: Test): Promise<void>;
  delete(testId: string): Promise<void>;
  count(filters?: TestFilters): Promise<number>;
  findPublishedTests(filters: TestFilters): Promise<Test[]>;
}

export interface TestFilters {
  type?: string;
  status?: string;
  subjectId?: string;
  boardId?: string;
  classLevel?: number;
  createdBy?: string;
  search?: string;
  page?: number;
  limit?: number;
}
```

#### `domain/repositories/ITestAttemptRepository.ts`

```typescript
import { TestAttempt } from '../entities/TestAttempt';

export interface ITestAttemptRepository {
  save(attempt: TestAttempt): Promise<void>;
  findById(attemptId: string): Promise<TestAttempt | null>;
  findByTestAndUser(testId: string, userId: string): Promise<TestAttempt[]>;
  findInProgressAttempt(testId: string, userId: string): Promise<TestAttempt | null>;
  update(attempt: TestAttempt): Promise<void>;
  getUserAttempts(userId: string, filters: AttemptFilters): Promise<TestAttempt[]>;
  count(filters?: AttemptFilters): Promise<number>;
}

export interface AttemptFilters {
  userId?: string;
  testId?: string;
  status?: string;
  completedAfter?: Date;
  completedBefore?: Date;
  page?: number;
  limit?: number;
}
```

---

### 5. Domain Events

**Domain Events** represent something significant that happened in the domain.

#### `domain/events/DomainEvent.ts`

```typescript
export interface DomainEvent {
  eventId: string;
  occurredAt: Date;
  aggregateId: string;
  eventType: string;
}

export abstract class BaseDomainEvent implements DomainEvent {
  public readonly eventId: string;
  public readonly occurredAt: Date;
  public readonly eventType: string;

  constructor(
    public readonly aggregateId: string
  ) {
    this.eventId = this.generateId();
    this.occurredAt = new Date();
    this.eventType = this.constructor.name;
  }

  private generateId(): string {
    return `evt_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
}
```

#### `domain/events/TestSubmittedEvent.ts`

```typescript
import { BaseDomainEvent } from './DomainEvent';
import { Score } from '../value-objects/Score';

export class TestSubmittedEvent extends BaseDomainEvent {
  constructor(
    public readonly testAttemptId: string,
    public readonly testId: string,
    public readonly userId: string,
    public readonly score: Score,
    public readonly timeSpentSeconds: number
  ) {
    super(testAttemptId);
  }
}
```

#### `domain/events/UserRegisteredEvent.ts`

```typescript
import { BaseDomainEvent } from './DomainEvent';

export class UserRegisteredEvent extends BaseDomainEvent {
  constructor(
    public readonly userId: string,
    public readonly email: string,
    public readonly role: string
  ) {
    super(userId);
  }
}
```

---

## 📋 Continued in Next Section...

This is Part 1 of the implementation guide. The next sections will cover:
- Application Layer (Use Cases)
- Infrastructure Layer (Repositories, External Services)
- Presentation Layer (Controllers)
- Dependency Injection
- Testing Strategy
- Migration Path

Would you like me to continue with the remaining sections?
