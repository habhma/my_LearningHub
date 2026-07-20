# Clean Architecture + DDD Implementation - Part 2
## Application & Infrastructure Layers

---

## 🔄 Application Layer Implementation

The Application Layer orchestrates the flow of data between external layers and the domain layer. It contains **Use Cases** (business workflows) and defines interfaces for external services.

---

### 1. Use Cases

Each use case represents a single application action/workflow.

#### `application/use-cases/auth/RegisterUser.ts`

```typescript
import { IUserRepository } from '../../../domain/repositories/IUserRepository';
import { User, UserRole } from '../../../domain/entities/User';
import { Email } from '../../../domain/value-objects/Email';
import { Password } from '../../../domain/value-objects/Password';
import { IEventBus } from '../../ports/IEventBus';
import { UserRegisteredEvent } from '../../../domain/events/UserRegisteredEvent';
import { RegisterUserDto } from '../../dto/auth/RegisterUserDto';
import { UserResponseDto } from '../../dto/auth/UserResponseDto';
import { UserMapper } from '../../mappers/UserMapper';
import { ApplicationException } from '../../exceptions/ApplicationException';

export class RegisterUserUseCase {
  constructor(
    private readonly userRepository: IUserRepository,
    private readonly eventBus: IEventBus
  ) {}

  async execute(dto: RegisterUserDto): Promise<UserResponseDto> {
    // 1. Create value objects
    const email = Email.create(dto.email);
    const password = Password.create(dto.password);

    // 2. Check if user already exists
    const existingUser = await this.userRepository.findByEmail(email);
    if (existingUser) {
      throw new ApplicationException('User with this email already exists', 409);
    }

    // 3. Create user entity
    const user = User.create(email, password, dto.role || UserRole.STUDENT);

    // 4. Persist user
    await this.userRepository.save(user);

    // 5. Publish domain event
    const event = new UserRegisteredEvent(
      user.userId,
      email.getValue(),
      user.role
    );
    await this.eventBus.publish(event);

    // 6. Return DTO
    return UserMapper.toDto(user);
  }
}
```

#### `application/use-cases/auth/LoginUser.ts`

```typescript
import { IUserRepository } from '../../../domain/repositories/IUserRepository';
import { Email } from '../../../domain/value-objects/Email';
import { Password } from '../../../domain/value-objects/Password';
import { ITokenService } from '../../services/ITokenService';
import { LoginDto } from '../../dto/auth/LoginDto';
import { LoginResponseDto } from '../../dto/auth/LoginResponseDto';
import { UserMapper } from '../../mappers/UserMapper';
import { ApplicationException } from '../../exceptions/ApplicationException';

export class LoginUserUseCase {
  constructor(
    private readonly userRepository: IUserRepository,
    private readonly tokenService: ITokenService
  ) {}

  async execute(dto: LoginDto): Promise<LoginResponseDto> {
    // 1. Find user by email
    const email = Email.create(dto.email);
    const user = await this.userRepository.findByEmail(email);

    if (!user) {
      throw new ApplicationException('Invalid credentials', 401);
    }

    // 2. Verify password
    const password = Password.create(dto.password);
    if (!password.verify(user.passwordHash)) {
      throw new ApplicationException('Invalid credentials', 401);
    }

    // 3. Check user status
    if (user.status !== 'active') {
      throw new ApplicationException('Account is not active', 403);
    }

    // 4. Update last login
    user.updateLastLogin();
    await this.userRepository.update(user);

    // 5. Generate tokens
    const accessToken = await this.tokenService.generateAccessToken({
      userId: user.userId,
      email: email.getValue(),
      role: user.role
    });

    const refreshToken = await this.tokenService.generateRefreshToken({
      userId: user.userId
    });

    // 6. Return response
    return {
      user: UserMapper.toDto(user),
      accessToken,
      refreshToken,
      expiresIn: 3600 // 1 hour
    };
  }
}
```

#### `application/use-cases/test/SubmitTest.ts`

```typescript
import { ITestAttemptRepository } from '../../../domain/repositories/ITestAttemptRepository';
import { IQuestionRepository } from '../../../domain/repositories/IQuestionRepository';
import { IUnitOfWork } from '../../ports/IUnitOfWork';
import { TestScoringService } from '../../../domain/services/TestScoringService';
import { BadgeAwardService } from '../../../domain/services/BadgeAwardService';
import { IEventBus } from '../../ports/IEventBus';
import { TestSubmittedEvent } from '../../../domain/events/TestSubmittedEvent';
import { SubmitTestDto } from '../../dto/test/SubmitTestDto';
import { TestResultDto } from '../../dto/test/TestResultDto';
import { TestAttemptMapper } from '../../mappers/TestAttemptMapper';
import { ApplicationException } from '../../exceptions/ApplicationException';
import { AttemptStatus } from '../../../domain/entities/TestAttempt';

export class SubmitTestUseCase {
  constructor(
    private readonly attemptRepository: ITestAttemptRepository,
    private readonly questionRepository: IQuestionRepository,
    private readonly unitOfWork: IUnitOfWork,
    private readonly scoringService: TestScoringService,
    private readonly badgeService: BadgeAwardService,
    private readonly eventBus: IEventBus
  ) {}

  async execute(dto: SubmitTestDto): Promise<TestResultDto> {
    // 1. Validate attempt exists and is in progress
    const attempt = await this.attemptRepository.findById(dto.attemptId);
    if (!attempt) {
      throw new ApplicationException('Test attempt not found', 404);
    }

    if (attempt.status !== AttemptStatus.IN_PROGRESS) {
      throw new ApplicationException('Test is not in progress', 400);
    }

    // 2. Check if user owns this attempt
    if (attempt.userId !== dto.userId) {
      throw new ApplicationException('Unauthorized', 403);
    }

    // 3. Get all questions for the test
    const questions = await this.questionRepository.findByTestId(attempt.testId);

    // 4. Calculate score
    const score = this.scoringService.calculateScore(
      attempt,
      questions,
      dto.enableNegativeMarking ?? false
    );

    // 5. Complete attempt
    attempt.complete(score);

    // Begin transaction
    await this.unitOfWork.begin();

    try {
      // 6. Update attempt in database
      await this.attemptRepository.update(attempt);

      // 7. Determine and award badges
      const earnedBadges = this.badgeService.determineEarnedBadges({
        userId: attempt.userId,
        testAttempt: attempt,
        score
      });

      // Award badges (this would interact with gamification repository)
      // ... badge awarding logic

      // 8. Commit transaction
      await this.unitOfWork.commit();

      // 9. Publish event (after commit)
      const event = new TestSubmittedEvent(
        attempt.attemptId,
        attempt.testId,
        attempt.userId,
        score,
        attempt.timeSpentSeconds
      );
      await this.eventBus.publish(event);

      // 10. Return result
      return TestAttemptMapper.toResultDto(attempt, score, questions);
    } catch (error) {
      await this.unitOfWork.rollback();
      throw error;
    }
  }
}
```

#### `application/use-cases/test/CreatePracticeTest.ts`

```typescript
import { ITestRepository } from '../../../domain/repositories/ITestRepository';
import { IQuestionRepository } from '../../../domain/repositories/IQuestionRepository';
import { Test, TestType } from '../../../domain/entities/Test';
import { TestConfiguration } from '../../../domain/value-objects/TestConfiguration';
import { CreateTestDto } from '../../dto/test/CreateTestDto';
import { TestResponseDto } from '../../dto/test/TestResponseDto';
import { TestMapper } from '../../mappers/TestMapper';
import { ApplicationException } from '../../exceptions/ApplicationException';

export class CreatePracticeTestUseCase {
  constructor(
    private readonly testRepository: ITestRepository,
    private readonly questionRepository: IQuestionRepository
  ) {}

  async execute(dto: CreateTestDto, userId: string): Promise<TestResponseDto> {
    // 1. Validate configuration
    const config = TestConfiguration.create({
      subjectId: dto.subjectId,
      boardId: dto.boardId,
      classLevel: dto.classLevel,
      categoryIds: dto.categoryIds,
      difficulty: dto.difficulty,
      timeLimitMinutes: dto.timeLimitMinutes,
      questionCount: dto.questionCount
    });

    // 2. Find questions matching criteria
    const questions = await this.questionRepository.findRandom({
      subjectId: dto.subjectId,
      categoryIds: dto.categoryIds,
      difficulty: dto.difficulty,
      limit: dto.questionCount
    });

    if (questions.length < dto.questionCount) {
      throw new ApplicationException(
        `Not enough questions found. Found ${questions.length}, required ${dto.questionCount}`,
        400
      );
    }

    // 3. Create test entity
    const test = Test.create(
      dto.testName,
      TestType.PRACTICE,
      config,
      userId
    );

    // 4. Calculate total marks
    const totalMarks = questions.reduce((sum, q) => sum + q.marks, 0);
    test.setTotalMarks(totalMarks);
    test.setTotalQuestions(questions.length);

    // 5. Publish test
    test.publish();

    // 6. Save test
    await this.testRepository.save(test);

    // 7. Associate questions with test
    await this.questionRepository.linkQuestionsToTest(
      test.testId,
      questions.map(q => q.questionId)
    );

    // 8. Return DTO
    return TestMapper.toDto(test);
  }
}
```

---

### 2. Data Transfer Objects (DTOs)

DTOs carry data between layers without domain logic.

#### `application/dto/auth/RegisterUserDto.ts`

```typescript
export interface RegisterUserDto {
  email: string;
  password: string;
  fullName: string;
  role?: string;
  classLevel?: number;
  boardId?: string;
}
```

#### `application/dto/auth/LoginResponseDto.ts`

```typescript
import { UserResponseDto } from './UserResponseDto';

export interface LoginResponseDto {
  user: UserResponseDto;
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
}
```

#### `application/dto/test/CreateTestDto.ts`

```typescript
export interface CreateTestDto {
  testName: string;
  subjectId: string;
  boardId: string;
  classLevel: number;
  categoryIds?: string[];
  difficulty?: 'easy' | 'medium' | 'hard';
  questionCount: number;
  timeLimitMinutes: number;
}
```

#### `application/dto/test/TestResultDto.ts`

```typescript
export interface TestResultDto {
  attemptId: string;
  testId: string;
  testName: string;
  summary: {
    totalQuestions: number;
    attemptedQuestions: number;
    correctAnswers: number;
    incorrectAnswers: number;
    skippedQuestions: number;
    totalMarks: number;
    obtainedMarks: number;
    percentage: number;
    grade: string;
    timeSpentSeconds: number;
  };
  sectionWisePerformance?: SectionPerformance[];
  detailedAnswers?: DetailedAnswer[];
  completedAt: Date;
}

export interface SectionPerformance {
  sectionName: string;
  totalQuestions: number;
  correct: number;
  incorrect: number;
  percentage: number;
}

export interface DetailedAnswer {
  questionId: string;
  questionNumber: number;
  questionText: string;
  yourAnswer: string;
  correctAnswer: string;
  isCorrect: boolean;
  marksAwarded: number;
  timeSpentSeconds: number;
  explanation?: string;
}
```

---

### 3. Mappers

Mappers convert between domain entities and DTOs.

#### `application/mappers/UserMapper.ts`

```typescript
import { User } from '../../domain/entities/User';
import { UserResponseDto } from '../dto/auth/UserResponseDto';

export class UserMapper {
  static toDto(user: User): UserResponseDto {
    return {
      userId: user.userId,
      email: user.email.getValue(),
      role: user.role,
      status: user.status,
      isEmailVerified: user.isEmailVerified,
      createdAt: user.createdAt
    };
  }

  // Don't expose password hash or sensitive data
  static toPublicDto(user: User): Partial<UserResponseDto> {
    return {
      userId: user.userId,
      role: user.role
    };
  }
}
```

#### `application/mappers/TestAttemptMapper.ts`

```typescript
import { TestAttempt } from '../../domain/entities/TestAttempt';
import { Score } from '../../domain/value-objects/Score';
import { Question } from '../../domain/entities/Question';
import { TestResultDto, DetailedAnswer } from '../dto/test/TestResultDto';

export class TestAttemptMapper {
  static toResultDto(
    attempt: TestAttempt,
    score: Score,
    questions: Question[]
  ): TestResultDto {
    const answeredCount = attempt.getAnsweredQuestionCount();
    const correctCount = this.countCorrectAnswers(attempt, questions);
    const incorrectCount = answeredCount - correctCount;
    const skippedCount = questions.length - answeredCount;

    return {
      attemptId: attempt.attemptId,
      testId: attempt.testId,
      testName: 'Test Name', // Would be fetched from test entity
      summary: {
        totalQuestions: questions.length,
        attemptedQuestions: answeredCount,
        correctAnswers: correctCount,
        incorrectAnswers: incorrectCount,
        skippedQuestions: skippedCount,
        totalMarks: score.getTotalMarks(),
        obtainedMarks: score.getObtainedMarks(),
        percentage: score.getPercentage(),
        grade: score.getGrade(),
        timeSpentSeconds: attempt.timeSpentSeconds
      },
      detailedAnswers: this.buildDetailedAnswers(attempt, questions),
      completedAt: attempt.completedAt!
    };
  }

  private static countCorrectAnswers(
    attempt: TestAttempt,
    questions: Question[]
  ): number {
    let correct = 0;
    for (const question of questions) {
      const answer = attempt.answers.get(question.questionId);
      if (answer && question.isCorrectAnswer(answer)) {
        correct++;
      }
    }
    return correct;
  }

  private static buildDetailedAnswers(
    attempt: TestAttempt,
    questions: Question[]
  ): DetailedAnswer[] {
    return questions.map((question, index) => {
      const answer = attempt.answers.get(question.questionId);
      const isCorrect = answer ? question.isCorrectAnswer(answer) : false;

      return {
        questionId: question.questionId,
        questionNumber: index + 1,
        questionText: question.text,
        yourAnswer: answer ? answer.value : 'Not attempted',
        correctAnswer: question.correctAnswer,
        isCorrect,
        marksAwarded: isCorrect ? question.marks : 0,
        timeSpentSeconds: answer?.timeSpent || 0,
        explanation: question.explanation
      };
    });
  }
}
```

---

### 4. Application Service Interfaces

Define interfaces for external services that the application needs.

#### `application/services/ITokenService.ts`

```typescript
export interface TokenPayload {
  userId: string;
  email?: string;
  role?: string;
}

export interface ITokenService {
  generateAccessToken(payload: TokenPayload): Promise<string>;
  generateRefreshToken(payload: TokenPayload): Promise<string>;
  verifyAccessToken(token: string): Promise<TokenPayload>;
  verifyRefreshToken(token: string): Promise<TokenPayload>;
}
```

#### `application/services/IEmailService.ts`

```typescript
export interface EmailOptions {
  to: string | string[];
  subject: string;
  html?: string;
  text?: string;
  template?: string;
  context?: Record<string, any>;
  attachments?: EmailAttachment[];
}

export interface EmailAttachment {
  filename: string;
  content: Buffer | string;
  contentType?: string;
}

export interface IEmailService {
  send(options: EmailOptions): Promise<void>;
  sendVerificationEmail(email: string, token: string): Promise<void>;
  sendPasswordResetEmail(email: string, token: string): Promise<void>;
  sendTestResultEmail(email: string, result: any): Promise<void>;
}
```

#### `application/services/IStorageService.ts`

```typescript
export interface UploadOptions {
  fileName: string;
  content: Buffer;
  contentType: string;
  folder?: string;
  isPublic?: boolean;
}

export interface IStorageService {
  upload(options: UploadOptions): Promise<string>; // Returns URL
  delete(fileUrl: string): Promise<void>;
  getSignedUrl(fileUrl: string, expiresIn: number): Promise<string>;
  exists(fileUrl: string): Promise<boolean>;
}
```

---

### 5. Application Ports (Hexagonal Architecture)

#### `application/ports/IEventBus.ts`

```typescript
import { DomainEvent } from '../../domain/events/DomainEvent';

export interface IEventHandler<T extends DomainEvent> {
  handle(event: T): Promise<void>;
}

export interface IEventBus {
  publish(event: DomainEvent): Promise<void>;
  subscribe<T extends DomainEvent>(
    eventType: string,
    handler: IEventHandler<T>
  ): void;
}
```

#### `application/ports/ICache.ts`

```typescript
export interface ICache {
  get<T>(key: string): Promise<T | null>;
  set(key: string, value: any, ttl?: number): Promise<void>;
  delete(key: string): Promise<void>;
  exists(key: string): Promise<boolean>;
  flush(): Promise<void>;
}
```

#### `application/ports/IUnitOfWork.ts`

```typescript
import { IUserRepository } from '../../domain/repositories/IUserRepository';
import { ITestRepository } from '../../domain/repositories/ITestRepository';
import { ITestAttemptRepository } from '../../domain/repositories/ITestAttemptRepository';
import { IQuestionRepository } from '../../domain/repositories/IQuestionRepository';

export interface IUnitOfWork {
  userRepository: IUserRepository;
  testRepository: ITestRepository;
  attemptRepository: ITestAttemptRepository;
  questionRepository: IQuestionRepository;

  begin(): Promise<void>;
  commit(): Promise<void>;
  rollback(): Promise<void>;
}
```

---

## 🏗️ Infrastructure Layer Implementation

The Infrastructure Layer implements the interfaces defined in the Domain and Application layers.

---

### 1. Repository Implementations

#### `infrastructure/database/repositories/PrismaUserRepository.ts`

```typescript
import { PrismaClient } from '@prisma/client';
import { IUserRepository, UserFilters } from '../../../domain/repositories/IUserRepository';
import { User } from '../../../domain/entities/User';
import { Email } from '../../../domain/value-objects/Email';

export class PrismaUserRepository implements IUserRepository {
  constructor(private readonly prisma: PrismaClient) {}

  async save(user: User): Promise<void> {
    const data = user.toPersistence();
    
    await this.prisma.users.create({
      data: {
        user_id: data.userId,
        email: data.email.getValue(),
        password_hash: data.passwordHash,
        role: data.role,
        status: data.status,
        email_verified: data.emailVerified,
        last_login_at: data.lastLoginAt,
        created_at: data.createdAt,
        updated_at: data.updatedAt
      }
    });
  }

  async findById(userId: string): Promise<User | null> {
    const row = await this.prisma.users.findUnique({
      where: { user_id: userId, deleted_at: null }
    });

    if (!row) {
      return null;
    }

    return this.toDomain(row);
  }

  async findByEmail(email: Email): Promise<User | null> {
    const row = await this.prisma.users.findUnique({
      where: { email: email.getValue(), deleted_at: null }
    });

    if (!row) {
      return null;
    }

    return this.toDomain(row);
  }

  async findMany(filters: UserFilters): Promise<User[]> {
    const where: any = { deleted_at: null };

    if (filters.role) {
      where.role = filters.role;
    }

    if (filters.status) {
      where.status = filters.status;
    }

    if (filters.emailVerified !== undefined) {
      where.email_verified = filters.emailVerified;
    }

    if (filters.search) {
      where.OR = [
        { email: { contains: filters.search, mode: 'insensitive' } },
        { user_profiles: { full_name: { contains: filters.search, mode: 'insensitive' } } }
      ];
    }

    const rows = await this.prisma.users.findMany({
      where,
      skip: filters.page && filters.limit ? (filters.page - 1) * filters.limit : undefined,
      take: filters.limit,
      orderBy: { created_at: 'desc' }
    });

    return rows.map(row => this.toDomain(row));
  }

  async exists(userId: string): Promise<boolean> {
    const count = await this.prisma.users.count({
      where: { user_id: userId, deleted_at: null }
    });
    return count > 0;
  }

  async update(user: User): Promise<void> {
    const data = user.toPersistence();
    
    await this.prisma.users.update({
      where: { user_id: data.userId },
      data: {
        email: data.email.getValue(),
        password_hash: data.passwordHash,
        role: data.role,
        status: data.status,
        email_verified: data.emailVerified,
        last_login_at: data.lastLoginAt,
        updated_at: new Date()
      }
    });
  }

  async delete(userId: string): Promise<void> {
    // Soft delete
    await this.prisma.users.update({
      where: { user_id: userId },
      data: { deleted_at: new Date() }
    });
  }

  async count(filters?: UserFilters): Promise<number> {
    const where: any = { deleted_at: null };

    if (filters?.role) {
      where.role = filters.role;
    }

    if (filters?.status) {
      where.status = filters.status;
    }

    return this.prisma.users.count({ where });
  }

  private toDomain(row: any): User {
    return User.fromPersistence({
      userId: row.user_id,
      email: Email.create(row.email),
      passwordHash: row.password_hash,
      role: row.role,
      status: row.status,
      emailVerified: row.email_verified,
      lastLoginAt: row.last_login_at,
      createdAt: row.created_at,
      updatedAt: row.updated_at
    });
  }
}
```

#### `infrastructure/database/UnitOfWork.ts`

```typescript
import { PrismaClient } from '@prisma/client';
import { IUnitOfWork } from '../../application/ports/IUnitOfWork';
import { PrismaUserRepository } from './repositories/PrismaUserRepository';
import { PrismaTestRepository } from './repositories/PrismaTestRepository';
import { PrismaTestAttemptRepository } from './repositories/PrismaTestAttemptRepository';
import { PrismaQuestionRepository } from './repositories/PrismaQuestionRepository';

export class PrismaUnitOfWork implements IUnitOfWork {
  public readonly userRepository: PrismaUserRepository;
  public readonly testRepository: PrismaTestRepository;
  public readonly attemptRepository: PrismaTestAttemptRepository;
  public readonly questionRepository: PrismaQuestionRepository;

  private transaction: any = null;

  constructor(private readonly prisma: PrismaClient) {
    // Create repositories with prisma client
    this.userRepository = new PrismaUserRepository(prisma);
    this.testRepository = new PrismaTestRepository(prisma);
    this.attemptRepository = new PrismaTestAttemptRepository(prisma);
    this.questionRepository = new PrismaQuestionRepository(prisma);
  }

  async begin(): Promise<void> {
    this.transaction = await this.prisma.$transaction(async (tx) => {
      // Transaction will be handled by commit/rollback
      return tx;
    });
  }

  async commit(): Promise<void> {
    // Prisma auto-commits when transaction callback completes
    this.transaction = null;
  }

  async rollback(): Promise<void> {
    // Throw error to trigger rollback
    if (this.transaction) {
      throw new Error('Transaction rolled back');
    }
  }
}
```

---

### 2. External Service Implementations

#### `infrastructure/external-services/email/SESEmailService.ts`

```typescript
import { SES } from '@aws-sdk/client-ses';
import { IEmailService, EmailOptions } from '../../../application/services/IEmailService';

export class SESEmailService implements IEmailService {
  private readonly ses: SES;
  private readonly fromEmail: string;

  constructor(config: { region: string; fromEmail: string }) {
    this.ses = new SES({ region: config.region });
    this.fromEmail = config.fromEmail;
  }

  async send(options: EmailOptions): Promise<void> {
    const params = {
      Source: this.fromEmail,
      Destination: {
        ToAddresses: Array.isArray(options.to) ? options.to : [options.to]
      },
      Message: {
        Subject: {
          Data: options.subject,
          Charset: 'UTF-8'
        },
        Body: {
          Html: options.html ? {
            Data: options.html,
            Charset: 'UTF-8'
          } : undefined,
          Text: options.text ? {
            Data: options.text,
            Charset: 'UTF-8'
          } : undefined
        }
      }
    };

    await this.ses.sendEmail(params);
  }

  async sendVerificationEmail(email: string, token: string): Promise<void> {
    const verificationUrl = `${process.env.APP_URL}/verify-email?token=${token}`;
    
    await this.send({
      to: email,
      subject: 'Verify Your Email',
      html: `
        <h1>Email Verification</h1>
        <p>Click the link below to verify your email:</p>
        <a href="${verificationUrl}">Verify Email</a>
      `
    });
  }

  async sendPasswordResetEmail(email: string, token: string): Promise<void> {
    const resetUrl = `${process.env.APP_URL}/reset-password?token=${token}`;
    
    await this.send({
      to: email,
      subject: 'Password Reset',
      html: `
        <h1>Password Reset</h1>
        <p>Click the link below to reset your password:</p>
        <a href="${resetUrl}">Reset Password</a>
      `
    });
  }

  async sendTestResultEmail(email: string, result: any): Promise<void> {
    await this.send({
      to: email,
      subject: 'Test Results Available',
      html: `
        <h1>Your Test Results</h1>
        <p>Score: ${result.score}%</p>
        <p>View detailed results in your dashboard.</p>
      `
    });
  }
}
```

#### `infrastructure/external-services/storage/S3StorageService.ts`

```typescript
import { S3 } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { IStorageService, UploadOptions } from '../../../application/services/IStorageService';

export class S3StorageService implements IStorageService {
  private readonly s3: S3;
  private readonly bucketName: string;

  constructor(config: { region: string; bucketName: string }) {
    this.s3 = new S3({ region: config.region });
    this.bucketName = config.bucketName;
  }

  async upload(options: UploadOptions): Promise<string> {
    const key = options.folder 
      ? `${options.folder}/${options.fileName}`
      : options.fileName;

    await this.s3.putObject({
      Bucket: this.bucketName,
      Key: key,
      Body: options.content,
      ContentType: options.contentType,
      ACL: options.isPublic ? 'public-read' : 'private'
    });

    return `https://${this.bucketName}.s3.amazonaws.com/${key}`;
  }

  async delete(fileUrl: string): Promise<void> {
    const key = this.extractKeyFromUrl(fileUrl);
    
    await this.s3.deleteObject({
      Bucket: this.bucketName,
      Key: key
    });
  }

  async getSignedUrl(fileUrl: string, expiresIn: number): Promise<string> {
    const key = this.extractKeyFromUrl(fileUrl);
    
    const command = {
      Bucket: this.bucketName,
      Key: key
    };

    return await getSignedUrl(this.s3, command as any, { expiresIn });
  }

  async exists(fileUrl: string): Promise<boolean> {
    const key = this.extractKeyFromUrl(fileUrl);
    
    try {
      await this.s3.headObject({
        Bucket: this.bucketName,
        Key: key
      });
      return true;
    } catch {
      return false;
    }
  }

  private extractKeyFromUrl(url: string): string {
    const urlObj = new URL(url);
    return urlObj.pathname.substring(1); // Remove leading slash
  }
}
```

#### `infrastructure/cache/RedisCache.ts`

```typescript
import Redis from 'ioredis';
import { ICache } from '../../application/ports/ICache';

export class RedisCache implements ICache {
  private readonly redis: Redis;

  constructor(config: { host: string; port: number; password?: string }) {
    this.redis = new Redis(config);
  }

  async get<T>(key: string): Promise<T | null> {
    const value = await this.redis.get(key);
    if (!value) {
      return null;
    }
    return JSON.parse(value) as T;
  }

  async set(key: string, value: any, ttl?: number): Promise<void> {
    const serialized = JSON.stringify(value);
    
    if (ttl) {
      await this.redis.setex(key, ttl, serialized);
    } else {
      await this.redis.set(key, serialized);
    }
  }

  async delete(key: string): Promise<void> {
    await this.redis.del(key);
  }

  async exists(key: string): Promise<boolean> {
    const result = await this.redis.exists(key);
    return result === 1;
  }

  async flush(): Promise<void> {
    await this.redis.flushdb();
  }

  async disconnect(): Promise<void> {
    await this.redis.quit();
  }
}
```

---

### 3. Event Bus Implementation

#### `infrastructure/messaging/EventBus.ts`

```typescript
import { IEventBus, IEventHandler } from '../../application/ports/IEventBus';
import { DomainEvent } from '../../domain/events/DomainEvent';

export class InMemoryEventBus implements IEventBus {
  private handlers: Map<string, IEventHandler<any>[]> = new Map();

  subscribe<T extends DomainEvent>(
    eventType: string,
    handler: IEventHandler<T>
  ): void {
    if (!this.handlers.has(eventType)) {
      this.handlers.set(eventType, []);
    }
    this.handlers.get(eventType)!.push(handler);
  }

  async publish(event: DomainEvent): Promise<void> {
    const eventType = event.eventType;
    const handlers = this.handlers.get(eventType) || [];

    // Execute all handlers in parallel
    await Promise.all(
      handlers.map(handler => handler.handle(event))
    );
  }
}
```

#### Event Handlers Example

```typescript
// infrastructure/messaging/event-handlers/SendEmailOnTestSubmission.ts
import { IEventHandler } from '../../../application/ports/IEventBus';
import { TestSubmittedEvent } from '../../../domain/events/TestSubmittedEvent';
import { IEmailService } from '../../../application/services/IEmailService';
import { IUserRepository } from '../../../domain/repositories/IUserRepository';

export class SendEmailOnTestSubmission implements IEventHandler<TestSubmittedEvent> {
  constructor(
    private readonly emailService: IEmailService,
    private readonly userRepository: IUserRepository
  ) {}

  async handle(event: TestSubmittedEvent): Promise<void> {
    // Get user email
    const user = await this.userRepository.findById(event.userId);
    if (!user) {
      return;
    }

    // Send result email
    await this.emailService.sendTestResultEmail(
      user.email.getValue(),
      {
        score: event.score.getPercentage(),
        obtainedMarks: event.score.getObtainedMarks(),
        totalMarks: event.score.getTotalMarks()
      }
    );
  }
}
```

---

## 📋 Part 3 Coming Next...

The next part will cover:
- Presentation Layer (Controllers, Routes, Middleware)
- Dependency Injection Container
- Testing Strategy
- Migration Path from current architecture
- Real-world example flows

Would you like me to continue with Part 3?
