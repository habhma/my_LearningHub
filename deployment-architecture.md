# Deployment Architecture and Infrastructure
## Student Assessment Platform

**Version:** 1.0  
**Last Updated:** July 19, 2026  
**Target Scale:** 5000 concurrent users  
**Initial Scope:** MVP - Single class (Class 8), 100+ questions

---

## Table of Contents

1. [Infrastructure Architecture](#1-infrastructure-architecture)
2. [Deployment Environments](#2-deployment-environments)
3. [CI/CD Pipeline](#3-cicd-pipeline)
4. [Infrastructure as Code](#4-infrastructure-as-code)
5. [Monitoring & Observability](#5-monitoring--observability)
6. [Backup & Disaster Recovery](#6-backup--disaster-recovery)
7. [Cost Optimization](#7-cost-optimization)
8. [Security Infrastructure](#8-security-infrastructure)

---

## 1. Infrastructure Architecture

### 1.1 AWS Services Mapping

#### Compute Layer
- **Amazon EC2** (Elastic Compute Cloud)
  - Application servers for Node.js backend (t3.medium instances)
  - Auto Scaling Group for horizontal scaling
  - Capacity: Start with 2 instances, scale up to 8 for peak loads

#### Storage Layer
- **Amazon RDS** (Relational Database Service)
  - PostgreSQL 15.x engine
  - db.t3.medium instance (2 vCPU, 4 GB RAM)
  - Multi-AZ deployment for high availability
  - 100 GB General Purpose SSD (gp3)
  - Automated backups with 7-day retention

- **Amazon ElastiCache**
  - Redis 7.x engine
  - cache.t3.micro instance (0.5 GB memory)
  - Single node for MVP, cluster mode for production scale
  - Session management and query result caching

- **Amazon S3** (Simple Storage Service)
  - Static asset storage (images, PDFs, question media)
  - Frontend build artifacts
  - Database backups and logs
  - Buckets:
    - `sap-assets-prod` - User-uploaded content
    - `sap-static-prod` - Application static files
    - `sap-backups-prod` - Backup storage
    - `sap-logs-prod` - Application logs

#### Content Delivery
- **Amazon CloudFront**
  - Global CDN for static assets and React frontend
  - Edge caching with 24-hour TTL
  - Custom SSL certificate
  - Origin: S3 bucket and ALB for dynamic content

#### Load Balancing
- **Application Load Balancer (ALB)**
  - Layer 7 load balancing
  - Health checks on `/health` endpoint
  - SSL/TLS termination
  - Path-based routing:
    - `/api/*` → Backend EC2 instances
    - `/` → React frontend (via S3/CloudFront)

#### DNS & Domain Management
- **Amazon Route 53**
  - Domain registration and DNS hosting
  - Hosted zones for `studentassessment.com`
  - Health checks and failover routing policies
  - Records:
    - `api.studentassessment.com` → ALB
    - `www.studentassessment.com` → CloudFront
    - `admin.studentassessment.com` → Admin portal

### 1.2 VPC Design

#### Network Architecture

```
┌─────────────────────────────────────────────────────────────────────┐
│                          AWS CLOUD (VPC)                             │
│                        CIDR: 10.0.0.0/16                            │
│                                                                       │
│  ┌────────────────────────────────────────────────────────────────┐ │
│  │                  Availability Zone 1 (us-east-1a)               │ │
│  │                                                                  │ │
│  │  ┌──────────────────────┐  ┌──────────────────────┐           │ │
│  │  │ Public Subnet 1      │  │ Private Subnet 1     │           │ │
│  │  │ CIDR: 10.0.1.0/24   │  │ CIDR: 10.0.10.0/24  │           │ │
│  │  │                      │  │                      │           │ │
│  │  │ - NAT Gateway        │  │ - EC2 (Backend)     │           │ │
│  │  │ - ALB                │  │ - RDS Primary       │           │ │
│  │  │ - Bastion Host       │  │ - ElastiCache       │           │ │
│  │  └──────────────────────┘  └──────────────────────┘           │ │
│  └────────────────────────────────────────────────────────────────┘ │
│                                                                       │
│  ┌────────────────────────────────────────────────────────────────┐ │
│  │                  Availability Zone 2 (us-east-1b)               │ │
│  │                                                                  │ │
│  │  ┌──────────────────────┐  ┌──────────────────────┐           │ │
│  │  │ Public Subnet 2      │  │ Private Subnet 2     │           │ │
│  │  │ CIDR: 10.0.2.0/24   │  │ CIDR: 10.0.20.0/24  │           │ │
│  │  │                      │  │                      │           │ │
│  │  │ - NAT Gateway        │  │ - EC2 (Backend)     │           │ │
│  │  │ - ALB                │  │ - RDS Standby       │           │ │
│  │  │                      │  │ - ElastiCache       │           │ │
│  │  └──────────────────────┘  └──────────────────────┘           │ │
│  └────────────────────────────────────────────────────────────────┘ │
│                                                                       │
│  ┌────────────────────────────────────────────────────────────────┐ │
│  │                     Internet Gateway                             │ │
│  └────────────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────────┘
                                  │
                                  ▼
                        ┌──────────────────┐
                        │   CloudFront     │
                        │      (CDN)       │
                        └──────────────────┘
                                  │
                                  ▼
                            End Users
```

#### Subnet Configuration

**Public Subnets** (Internet-facing)
- Public Subnet 1: `10.0.1.0/24` (AZ 1)
- Public Subnet 2: `10.0.2.0/24` (AZ 2)
- Resources: ALB, NAT Gateways, Bastion Host
- Internet Gateway attached for inbound/outbound traffic

**Private Subnets** (Isolated)
- Private Subnet 1: `10.0.10.0/24` (AZ 1)
- Private Subnet 2: `10.0.20.0/24` (AZ 2)
- Resources: EC2 instances, RDS, ElastiCache
- Outbound internet via NAT Gateway
- No direct inbound access from internet

#### Security Groups

**ALB Security Group** (`sg-alb`)
- Inbound:
  - Port 443 (HTTPS) from 0.0.0.0/0
  - Port 80 (HTTP) from 0.0.0.0/0 (redirect to 443)
- Outbound:
  - All traffic to Backend Security Group

**Backend Security Group** (`sg-backend`)
- Inbound:
  - Port 3000 from ALB Security Group
  - Port 22 from Bastion Security Group (SSH)
- Outbound:
  - Port 5432 to RDS Security Group
  - Port 6379 to ElastiCache Security Group
  - Port 443 to 0.0.0.0/0 (external API calls)

**RDS Security Group** (`sg-rds`)
- Inbound:
  - Port 5432 from Backend Security Group
  - Port 5432 from Bastion Security Group (admin access)
- Outbound: None required

**ElastiCache Security Group** (`sg-redis`)
- Inbound:
  - Port 6379 from Backend Security Group
- Outbound: None required

**Bastion Security Group** (`sg-bastion`)
- Inbound:
  - Port 22 from corporate VPN IP range
- Outbound:
  - Port 22 to all private subnets

### 1.3 High Availability Setup

#### Multi-AZ Architecture
- **Application Layer**: EC2 instances distributed across 2 AZs
- **Database Layer**: RDS Multi-AZ with automatic failover (< 2 minutes)
- **Cache Layer**: ElastiCache with read replicas in separate AZ
- **Load Balancer**: ALB spans multiple AZs with cross-zone load balancing

#### Failure Scenarios
1. **AZ Failure**: Traffic automatically routes to healthy AZ
2. **Instance Failure**: Auto Scaling replaces unhealthy instances within 5 minutes
3. **Database Failure**: RDS automatically fails over to standby instance
4. **Region Failure**: Manual failover to backup region (not implemented in MVP)

#### Health Checks
- ALB health check interval: 30 seconds
- Unhealthy threshold: 2 consecutive failures
- Healthy threshold: 2 consecutive successes
- Timeout: 5 seconds

---

## 2. Deployment Environments

### 2.1 Development Environment

**Local Development**
- Docker Compose setup for full stack
- Services:
  - React frontend (port 3001)
  - Node.js backend (port 3000)
  - PostgreSQL (port 5432)
  - Redis (port 6379)
- Hot reload enabled for both frontend and backend
- Mock AWS services using LocalStack

**Staging Server** (Optional for MVP)
- Single EC2 t3.small instance
- Shared PostgreSQL and Redis
- Domain: `staging.studentassessment.com`
- Auto-deployed from `develop` branch

### 2.2 Staging Environment

**Infrastructure**
- Scaled-down version of production
- Single AZ deployment
- EC2: 1 x t3.small
- RDS: db.t3.micro (Single-AZ)
- ElastiCache: cache.t3.micro (Single node)
- S3 buckets with `-staging` suffix

**Purpose**
- Pre-production testing
- QA validation
- Performance testing under load
- Integration testing with real AWS services

**Access**
- Domain: `staging.studentassessment.com`
- Restricted to internal team via IP whitelist
- Same authentication as production

### 2.3 Production Environment

**Infrastructure** (as described in Section 1.1)
- Multi-AZ deployment across 2 availability zones
- EC2: 2-8 x t3.medium (Auto Scaling)
- RDS: db.t3.medium (Multi-AZ)
- ElastiCache: cache.t3.small (Cluster mode)
- Full monitoring and alerting
- Automated backups and disaster recovery

**Access**
- Domain: `studentassessment.com`, `www.studentassessment.com`
- Public access for students and teachers
- Admin portal: `admin.studentassessment.com`

### 2.4 Environment Configuration Management

**Environment Variables**
```
# Application Configuration
NODE_ENV=production
PORT=3000
API_BASE_URL=https://api.studentassessment.com

# Database
DB_HOST=sap-prod-db.abc123.us-east-1.rds.amazonaws.com
DB_PORT=5432
DB_NAME=student_assessment
DB_USER=sap_app_user
DB_PASSWORD={{secrets-manager:prod/db/password}}

# Redis Cache
REDIS_HOST=sap-prod-redis.abc123.cache.amazonaws.com
REDIS_PORT=6379

# AWS Services
AWS_REGION=us-east-1
S3_BUCKET_ASSETS=sap-assets-prod
S3_BUCKET_BACKUPS=sap-backups-prod

# Authentication
JWT_SECRET={{secrets-manager:prod/jwt/secret}}
JWT_EXPIRY=24h
SESSION_SECRET={{secrets-manager:prod/session/secret}}

# External Services
SMTP_HOST={{secrets-manager:prod/smtp/host}}
SMTP_USER={{secrets-manager:prod/smtp/user}}
SMTP_PASSWORD={{secrets-manager:prod/smtp/password}}

# Feature Flags
ENABLE_ANALYTICS=true
ENABLE_NOTIFICATIONS=true
MAX_UPLOAD_SIZE=10485760
```

**Configuration Storage**
- AWS Systems Manager Parameter Store for non-sensitive config
- AWS Secrets Manager for sensitive credentials
- Environment-specific `.env` files NOT committed to Git
- CI/CD injects environment variables during deployment

---

## 3. CI/CD Pipeline

### 3.1 Git Workflow

**Branch Strategy** (GitHub Flow with environments)

```
main (production)
  │
  ├── develop (staging)
  │     │
  │     ├── feature/auth-system
  │     ├── feature/question-bank
  │     └── feature/student-dashboard
  │
  └── hotfix/critical-bug-fix
```

**Branch Policies**
- `main`: Protected, requires 2 approvals, all tests must pass
- `develop`: Protected, requires 1 approval, all tests must pass
- `feature/*`: Developer branches, no restrictions
- `hotfix/*`: Fast-tracked for critical production issues

### 3.2 Automated Testing

**Test Stages**

1. **Unit Tests**
   - Backend: Jest + Supertest
   - Frontend: Jest + React Testing Library
   - Coverage threshold: 80%
   - Run time: ~2 minutes

2. **Integration Tests**
   - API endpoint testing
   - Database integration tests
   - Redis cache tests
   - Run time: ~5 minutes

3. **End-to-End Tests**
   - Cypress for critical user flows
   - Scenarios:
     - Student login and take test
     - Teacher create and publish test
     - Admin view reports
   - Run time: ~10 minutes

4. **Security Scans**
   - npm audit for dependency vulnerabilities
   - OWASP ZAP for security testing
   - Snyk for container scanning
   - Run time: ~3 minutes

**Test Execution Matrix**
```
┌──────────────────┬───────┬─────────────┬──────────┬──────────┐
│ Test Type        │ Local │ Pull Request│ Staging  │ Production│
├──────────────────┼───────┼─────────────┼──────────┼──────────┤
│ Unit Tests       │  ✓    │      ✓      │    ✓     │    ✓     │
│ Integration      │  ✓    │      ✓      │    ✓     │    ✓     │
│ E2E Tests        │  ✗    │      ✓      │    ✓     │    ✓     │
│ Security Scans   │  ✗    │      ✓      │    ✓     │    ✓     │
│ Performance      │  ✗    │      ✗      │    ✓     │    ✗     │
│ Load Testing     │  ✗    │      ✗      │    ✓     │    ✗     │
└──────────────────┴───────┴─────────────┴──────────┴──────────┘
```

### 3.3 Build Process

**Docker Containerization**

**Backend Dockerfile**
```dockerfile
FROM node:18-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
RUN npm run build

FROM node:18-alpine
WORKDIR /app
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules ./node_modules
COPY package.json ./
EXPOSE 3000
CMD ["node", "dist/server.js"]
```

**Frontend Dockerfile**
```dockerfile
FROM node:18-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM nginx:alpine
COPY --from=builder /app/build /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

**Build Artifacts**
- Docker images pushed to Amazon ECR (Elastic Container Registry)
- Image tagging strategy:
  - `latest` - Most recent build from main
  - `develop` - Most recent build from develop
  - `v1.2.3` - Semantic version tags
  - `git-abc1234` - Git commit SHA

### 3.4 Deployment Strategy

**Rolling Deployment** (Default for MVP)
- Deploy new version to one instance at a time
- Health check before moving to next instance
- Automatic rollback on failure
- Zero downtime during deployment
- Deployment time: ~10 minutes for 2 instances

**Blue-Green Deployment** (Future enhancement)
- Maintain two identical environments (Blue = current, Green = new)
- Deploy to Green environment
- Run smoke tests on Green
- Switch traffic from Blue to Green via ALB target group
- Keep Blue running for quick rollback
- Deployment time: ~15 minutes

**Canary Deployment** (Future enhancement)
- Deploy to 10% of traffic initially
- Monitor metrics for 30 minutes
- Gradually increase to 50%, then 100%
- Automatic rollback if error rate exceeds threshold
- Deployment time: ~2 hours

### 3.5 Rollback Procedure

**Automatic Rollback Triggers**
- Health check failures > 50%
- Error rate > 5% for 5 minutes
- Response time > 2 seconds for 5 minutes
- CPU usage > 90% for 10 minutes

**Manual Rollback Steps**
1. Identify the previous stable version from ECR
2. Update Auto Scaling launch template with previous image
3. Terminate current instances (Auto Scaling creates new ones)
4. Verify health checks pass
5. Monitor application metrics
6. Time to rollback: ~5 minutes

**Database Rollback Considerations**
- Schema migrations should be backward compatible
- Use database migration tools (e.g., Flyway, Liquibase)
- Test rollback in staging before production deployment
- For breaking changes, use feature flags to disable new features

### 3.6 CI/CD Pipeline Workflow

**GitHub Actions Pipeline** (`.github/workflows/deploy.yml`)

```yaml
name: Deploy Pipeline

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main, develop]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
      - name: Install dependencies
        run: npm ci
      - name: Run unit tests
        run: npm run test:unit
      - name: Run integration tests
        run: npm run test:integration
      - name: Security scan
        run: npm audit

  build:
    needs: test
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Configure AWS credentials
        uses: aws-actions/configure-aws-credentials@v2
        with:
          aws-access-key-id: ${{ secrets.AWS_ACCESS_KEY_ID }}
          aws-secret-access-key: ${{ secrets.AWS_SECRET_ACCESS_KEY }}
          aws-region: us-east-1
      - name: Login to Amazon ECR
        run: aws ecr get-login-password | docker login --username AWS --password-stdin
      - name: Build and push Docker images
        run: |
          docker build -t sap-backend:${{ github.sha }} ./backend
          docker push sap-backend:${{ github.sha }}

  deploy-staging:
    needs: build
    if: github.ref == 'refs/heads/develop'
    runs-on: ubuntu-latest
    steps:
      - name: Deploy to staging
        run: |
          aws ecs update-service --cluster sap-staging --service backend --force-new-deployment

  deploy-production:
    needs: build
    if: github.ref == 'refs/heads/main'
    runs-on: ubuntu-latest
    environment: production
    steps:
      - name: Deploy to production
        run: |
          aws ecs update-service --cluster sap-prod --service backend --force-new-deployment
      - name: Run smoke tests
        run: npm run test:smoke
      - name: Notify team
        run: |
          curl -X POST ${{ secrets.SLACK_WEBHOOK }} -d '{"text":"Production deployment completed"}'
```

---

## 4. Infrastructure as Code

### 4.1 Terraform Approach

**Project Structure**
```
terraform/
├── modules/
│   ├── vpc/
│   ├── ec2/
│   ├── rds/
│   ├── elasticache/
│   ├── s3/
│   ├── alb/
│   └── cloudfront/
├── environments/
│   ├── dev/
│   ├── staging/
│   └── production/
├── main.tf
├── variables.tf
├── outputs.tf
└── terraform.tfvars
```

**Example: RDS Module** (`modules/rds/main.tf`)
```hcl
resource "aws_db_instance" "postgres" {
  identifier             = var.db_identifier
  engine                 = "postgres"
  engine_version         = "15.3"
  instance_class         = var.instance_class
  allocated_storage      = var.allocated_storage
  storage_type           = "gp3"
  
  db_name                = var.db_name
  username               = var.db_username
  password               = var.db_password
  
  multi_az               = var.multi_az
  publicly_accessible    = false
  
  vpc_security_group_ids = [var.security_group_id]
  db_subnet_group_name   = aws_db_subnet_group.main.name
  
  backup_retention_period = var.backup_retention_days
  backup_window          = "03:00-04:00"
  maintenance_window     = "sun:04:00-sun:05:00"
  
  enabled_cloudwatch_logs_exports = ["postgresql", "upgrade"]
  
  skip_final_snapshot    = var.environment != "production"
  final_snapshot_identifier = "${var.db_identifier}-final-snapshot"
  
  tags = {
    Name        = var.db_identifier
    Environment = var.environment
    Project     = "student-assessment-platform"
  }
}
```

**Production Environment Configuration** (`environments/production/main.tf`)
```hcl
module "vpc" {
  source = "../../modules/vpc"
  
  vpc_cidr = "10.0.0.0/16"
  environment = "production"
  availability_zones = ["us-east-1a", "us-east-1b"]
}

module "rds" {
  source = "../../modules/rds"
  
  db_identifier       = "sap-prod-db"
  instance_class      = "db.t3.medium"
  allocated_storage   = 100
  multi_az            = true
  backup_retention_days = 7
  
  db_name     = "student_assessment"
  db_username = "sap_admin"
  db_password = data.aws_secretsmanager_secret_version.db_password.secret_string
  
  vpc_id            = module.vpc.vpc_id
  security_group_id = module.vpc.rds_security_group_id
  environment       = "production"
}

module "ec2_autoscaling" {
  source = "../../modules/ec2"
  
  instance_type     = "t3.medium"
  min_size          = 2
  max_size          = 8
  desired_capacity  = 2
  
  ami_id            = data.aws_ami.amazon_linux_2.id
  key_name          = "sap-prod-key"
  
  vpc_id            = module.vpc.vpc_id
  subnet_ids        = module.vpc.private_subnet_ids
  security_group_id = module.vpc.backend_security_group_id
  
  user_data         = file("user-data.sh")
  environment       = "production"
}
```

### 4.2 Configuration Management

**State Management**
- Terraform state stored in S3 bucket: `sap-terraform-state`
- State locking via DynamoDB table: `sap-terraform-locks`
- Separate state files per environment
- Backend configuration:

```hcl
terraform {
  backend "s3" {
    bucket         = "sap-terraform-state"
    key            = "production/terraform.tfstate"
    region         = "us-east-1"
    encrypt        = true
    dynamodb_table = "sap-terraform-locks"
  }
}
```

**Environment Variables**
- Use Terraform workspaces for environment separation
- Environment-specific `.tfvars` files
- Sensitive values from AWS Secrets Manager
- CI/CD pipeline passes variables during `terraform apply`

### 4.3 Secret Management

**AWS Secrets Manager**

**Secret Categories**
1. **Database Credentials**
   - Secret name: `prod/db/credentials`
   - Auto-rotation enabled (30 days)
   - Fields: username, password, host, port, database

2. **Application Secrets**
   - Secret name: `prod/app/secrets`
   - Fields: JWT secret, session secret, encryption key

3. **Third-party API Keys**
   - Secret name: `prod/integrations/keys`
   - Fields: SMTP credentials, payment gateway, analytics

**Secret Access Pattern**
```javascript
// backend/src/config/secrets.js
const AWS = require('aws-sdk');
const secretsManager = new AWS.SecretsManager({ region: 'us-east-1' });

async function getSecret(secretName) {
  try {
    const data = await secretsManager.getSecretValue({ SecretId: secretName }).promise();
    return JSON.parse(data.SecretString);
  } catch (error) {
    console.error(`Error retrieving secret ${secretName}:`, error);
    throw error;
  }
}

module.exports = { getSecret };
```

**IAM Permissions**
- EC2 instances have IAM role with `secretsmanager:GetSecretValue` permission
- Secrets tagged with environment for access control
- Audit logging enabled for all secret access

---

## 5. Monitoring & Observability

### 5.1 Application Performance Monitoring (APM)

**New Relic / DataDog Integration**
- Application-level metrics
- Transaction tracing
- Error tracking and aggregation
- Database query performance
- API endpoint response times

**Key Metrics**
- Request rate (requests/second)
- Response time (p50, p95, p99)
- Error rate (%)
- Apdex score (Application Performance Index)
- Throughput (MB/s)

### 5.2 Log Aggregation

**Amazon CloudWatch Logs**

**Log Groups**
- `/aws/ec2/backend` - Application logs
- `/aws/rds/postgresql` - Database logs
- `/aws/elasticache/redis` - Cache logs
- `/aws/lambda/functions` - Serverless function logs
- `/aws/alb/access-logs` - Load balancer access logs

**Log Retention**
- Development: 7 days
- Staging: 30 days
- Production: 90 days

**Log Format** (Structured JSON)
```json
{
  "timestamp": "2026-07-19T10:30:45.123Z",
  "level": "info",
  "service": "backend",
  "environment": "production",
  "requestId": "abc123-def456",
  "userId": "user_12345",
  "method": "POST",
  "path": "/api/v1/assessments/submit",
  "statusCode": 200,
  "responseTime": 234,
  "message": "Assessment submitted successfully"
}
```

**ELK Stack** (Optional for advanced analysis)
- Elasticsearch for log storage and indexing
- Logstash for log processing and transformation
- Kibana for visualization and dashboards
- Cost consideration: Use CloudWatch Insights for MVP

### 5.3 Metrics Collection

**CloudWatch Metrics**

**Infrastructure Metrics**
- EC2 Instances:
  - CPU Utilization (%)
  - Memory Utilization (%)
  - Disk I/O (IOPS)
  - Network In/Out (GB)

- RDS Database:
  - CPU Utilization (%)
  - Database Connections (count)
  - Read/Write Latency (ms)
  - Free Storage Space (GB)
  - Replication Lag (ms)

- ElastiCache Redis:
  - CPU Utilization (%)
  - Memory Usage (%)
  - Cache Hit Rate (%)
  - Evictions (count)
  - Network Bytes In/Out

- Application Load Balancer:
  - Request Count
  - Target Response Time
  - Healthy/Unhealthy Host Count
  - HTTP 4xx/5xx Errors

**Application Metrics** (Custom CloudWatch Metrics)
- Active concurrent users
- Test submissions per minute
- Question load time (ms)
- Assessment completion rate (%)
- API error rate by endpoint
- Database query execution time

**Business Metrics**
- Daily active users (DAU)
- Monthly active users (MAU)
- Tests completed per day
- Average test duration
- Student engagement rate

### 5.4 Alerting Strategy

**Alert Severity Levels**

**Critical (P1)** - Immediate action required
- Production system down (all health checks failing)
- Database connection failure
- Error rate > 10% for 5 minutes
- Response time > 5 seconds for 5 minutes
- CPU > 95% for 10 minutes
- Disk space < 10%

**High (P2)** - Action required within 30 minutes
- Single AZ failure
- Cache cluster failure
- Error rate > 5% for 10 minutes
- Response time > 3 seconds for 10 minutes
- CPU > 85% for 15 minutes
- Database replication lag > 5 minutes

**Medium (P3)** - Action required within 4 hours
- High memory usage (> 80%)
- Elevated error rate (> 2%)
- Slow database queries (> 2 seconds)
- Cache hit rate < 70%

**Low (P4)** - Informational
- Deployment completed
- Auto-scaling event triggered
- Backup completed
- Certificate expiration warning (30 days)

**Notification Channels**
- **PagerDuty**: Critical and High alerts (on-call rotation)
- **Slack**: All alert levels to #alerts channel
- **Email**: Summary digest of Medium/Low alerts
- **SMS**: Critical alerts only (backup to PagerDuty)

**Example Alert Configuration**
```json
{
  "alertName": "HighErrorRate",
  "metric": "ErrorRate",
  "threshold": 5,
  "evaluationPeriods": 2,
  "datapointsToAlarm": 2,
  "comparisonOperator": "GreaterThanThreshold",
  "treatMissingData": "notBreaching",
  "actions": [
    "arn:aws:sns:us-east-1:123456789:pagerduty-critical",
    "arn:aws:sns:us-east-1:123456789:slack-alerts"
  ]
}
```

### 5.5 Health Checks & Uptime Monitoring

**Application Health Check Endpoint** (`/health`)
```json
{
  "status": "healthy",
  "timestamp": "2026-07-19T10:30:45.123Z",
  "version": "1.2.3",
  "checks": {
    "database": {
      "status": "healthy",
      "responseTime": 12
    },
    "redis": {
      "status": "healthy",
      "responseTime": 5
    },
    "s3": {
      "status": "healthy",
      "responseTime": 45
    }
  },
  "uptime": 864532,
  "memoryUsage": {
    "total": 4096,
    "used": 2048,
    "free": 2048
  }
}
```

**External Uptime Monitoring**
- UptimeRobot or Pingdom
- Check frequency: 1 minute
- Monitor endpoints:
  - https://www.studentassessment.com (frontend)
  - https://api.studentassessment.com/health (backend)
- Alert on downtime > 2 minutes

**Synthetic Monitoring**
- Scheduled Lambda functions to simulate user journeys
- Test critical paths every 5 minutes:
  - Student login flow
  - Load assessment page
  - Submit assessment
- Alert if any step fails

---

## 6. Backup & Disaster Recovery

### 6.1 Database Backup Strategy

**Automated Backups**
- **Frequency**: Daily at 3:00 AM UTC
- **Retention**: 7 days for automated backups
- **Backup Window**: 3:00 AM - 4:00 AM UTC (low-traffic period)
- **Method**: RDS automated backups with continuous transaction log backups
- **Storage**: Stored in S3 with cross-region replication

**Manual Snapshots**
- Before major deployments
- Before schema migrations
- Monthly full snapshots retained for 3 months
- Quarterly snapshots retained for 1 year

**Point-in-Time Recovery (PITR)**
- Enabled on RDS instance
- Recover to any second within retention period (7 days)
- Transaction logs backed up every 5 minutes
- Recovery time: ~10-30 minutes depending on data size

### 6.2 S3 Backup Strategy

**Asset Backup**
- S3 bucket: `sap-assets-prod`
- Versioning enabled (retain last 5 versions)
- Lifecycle policy:
  - Transition to S3 Infrequent Access after 90 days
  - Transition to Glacier after 1 year
  - Delete after 3 years

**Cross-Region Replication**
- Primary region: us-east-1
- Backup region: us-west-2
- Automatic replication of all objects
- Encryption in transit and at rest

**Application Logs Backup**
- CloudWatch Logs exported to S3 daily
- Compressed and archived for cost efficiency
- Retention: 1 year

### 6.3 Recovery Time Objective (RTO) and Recovery Point Objective (RPO)

**Production Environment**

| Component          | RTO (Recovery Time) | RPO (Data Loss)    |
|--------------------|---------------------|--------------------|
| Application Server | 15 minutes          | 0 (stateless)      |
| Database (RDS)     | 30 minutes          | < 5 minutes        |
| Cache (Redis)      | 10 minutes          | Acceptable         |
| Static Assets (S3) | 5 minutes           | 0 (versioned)      |
| Overall System     | 30 minutes          | < 5 minutes        |

**MVP Considerations**
- RTO: Target 30 minutes for full system recovery
- RPO: Maximum 5 minutes of data loss acceptable
- Cost-conscious approach: No active-active multi-region setup
- Manual failover procedures documented

### 6.4 Disaster Recovery Plan

**Scenario 1: Single EC2 Instance Failure**
- **Detection**: ALB health check failure
- **Action**: Auto Scaling automatically replaces instance
- **Recovery Time**: 5-10 minutes
- **Manual Intervention**: None required

**Scenario 2: Database Failure**
- **Detection**: RDS CloudWatch alarm, application unable to connect
- **Action**: RDS automatically fails over to standby instance in second AZ
- **Recovery Time**: 1-2 minutes
- **Manual Intervention**: Verify failover completed, update DNS if needed

**Scenario 3: Availability Zone Failure**
- **Detection**: Multiple service failures in single AZ
- **Action**:
  1. ALB routes traffic to healthy AZ
  2. Auto Scaling launches new instances in healthy AZ
  3. RDS fails over to standby in healthy AZ
- **Recovery Time**: 10-15 minutes
- **Manual Intervention**: Monitor recovery, scale up if needed

**Scenario 4: Region Failure** (Manual failover required)
- **Detection**: All services in us-east-1 unavailable
- **Action**:
  1. Update Route 53 to point to backup region (us-west-2)
  2. Restore latest RDS snapshot in us-west-2
  3. Launch EC2 instances from AMI in us-west-2
  4. Restore Redis cache from backup
  5. Verify all services operational
- **Recovery Time**: 2-4 hours
- **Manual Intervention**: Full manual execution of DR runbook

**DR Testing**
- Quarterly DR drill to test recovery procedures
- Document lessons learned and update runbook
- Test database restore monthly
- Verify backup integrity weekly

---

## 7. Cost Optimization

### 7.1 Instance Sizing for MVP

**Compute (EC2)**
- Instance type: t3.medium (2 vCPU, 4 GB RAM)
- Quantity: 2 instances (base) + Auto Scaling up to 8
- Cost: $0.0416/hour × 2 = $60/month (base)
- Peak cost: $240/month (8 instances)

**Database (RDS)**
- Instance type: db.t3.medium (2 vCPU, 4 GB RAM)
- Multi-AZ: Yes
- Storage: 100 GB gp3
- Cost: $0.136/hour × 2 (Multi-AZ) = $200/month
- Storage: $0.115/GB × 100 = $11.50/month

**Cache (ElastiCache)**
- Instance type: cache.t3.micro (0.5 GB)
- Quantity: 1 node
- Cost: $0.017/hour = $12.50/month

**Storage (S3)**
- Standard storage: 50 GB
- Requests: 100,000 PUT, 1,000,000 GET per month
- Cost: $1.15 (storage) + $0.50 (PUT) + $0.40 (GET) = $2.05/month

**Data Transfer**
- CloudFront: 100 GB/month
- Cost: $8.50/month

**Load Balancer (ALB)**
- Cost: $16.20/month + $0.008/LCU-hour
- Estimated: $25/month

**Route 53**
- Hosted zones: 1
- Queries: 10 million/month
- Cost: $0.50 (hosted zone) + $4.00 (queries) = $4.50/month

**Total Estimated Monthly Cost (MVP Baseline)**
```
EC2 Instances:           $60
RDS Database:            $211.50
ElastiCache:             $12.50
S3 Storage:              $2.05
CloudFront:              $8.50
Load Balancer:           $25
Route 53:                $4.50
CloudWatch Logs:         $5
Secrets Manager:         $1
Backups (S3):            $3
Misc (NAT Gateway, etc): $45
─────────────────────────────
Total:                   ~$378/month
```

**Peak Load Cost** (5000 concurrent users)
- Auto Scaling to 8 EC2 instances: +$180/month
- Increased data transfer: +$20/month
- **Total Peak Cost**: ~$578/month

### 7.2 Reserved Instances vs On-Demand

**Recommendation for Bootstrapped Startup**

**Year 1 (MVP Phase)**: Use On-Demand Instances
- Flexibility to change instance types
- No upfront commitment
- Test and validate architecture
- Expected cost: $378-578/month

**Year 2 (Growth Phase)**: Purchase Reserved Instances
- 1-year Reserved Instances for baseline capacity
  - 2 × t3.medium EC2 (Save 40%): $36/month instead of $60
  - 1 × db.t3.medium RDS (Save 45%): $116/month instead of $211
- On-Demand for Auto Scaling burst capacity
- Expected savings: ~$100/month = $1,200/year

**Year 3 (Mature Phase)**: 3-Year Reserved Instances
- 3-year Reserved Instances for all baseline (Save 60%)
- Savings Plans for flexible compute usage
- Expected savings: ~$200/month = $2,400/year

### 7.3 Auto-Scaling Configuration

**Target Tracking Scaling Policy**

**Scale Up Trigger**
- CPU Utilization > 70% for 3 minutes
- OR Memory Utilization > 80% for 3 minutes
- OR Request Count > 1000 req/min per instance
- Action: Add 1 instance (max 8)
- Cooldown: 300 seconds

**Scale Down Trigger**
- CPU Utilization < 30% for 10 minutes
- AND Memory Utilization < 50% for 10 minutes
- Action: Remove 1 instance (min 2)
- Cooldown: 600 seconds (conservative for cost)

**Predictive Scaling** (Future enhancement)
- Use historical data to predict traffic patterns
- Scale up before peak hours (e.g., school hours 8 AM - 4 PM)
- Scale down during off-peak (nights, weekends)

### 7.4 Cost Monitoring and Budgets

**AWS Budgets**
- Monthly budget: $500 (130% of expected baseline)
- Alert at 80% ($400): Email to team
- Alert at 100% ($500): Email + Slack notification
- Alert at 120% ($600): Critical alert, investigate immediately

**Cost Allocation Tags**
- Environment: production, staging, dev
- Service: backend, frontend, database, cache
- Project: student-assessment-platform
- CostCenter: engineering

**Cost Optimization Review**
- Weekly review of CloudWatch metrics
- Monthly cost report and trend analysis
- Quarterly architecture review for optimization opportunities
- Identify and terminate unused resources (old snapshots, unattached EBS volumes)

**Cost-Saving Tactics**
1. Use S3 Intelligent-Tiering for infrequently accessed data
2. Enable RDS Performance Insights only when needed
3. Use CloudFront caching aggressively to reduce origin requests
4. Compress and optimize images before upload
5. Clean up old CloudWatch logs and RDS snapshots
6. Use Spot Instances for non-critical workloads (staging, testing)

---

## 8. Security Infrastructure

### 8.1 SSL/TLS Certificates

**AWS Certificate Manager (ACM)**
- Free SSL certificates for AWS resources
- Automatic renewal (no manual intervention)
- Certificates:
  - `*.studentassessment.com` (wildcard)
  - `studentassessment.com` (apex domain)
- Certificate validation: DNS validation via Route 53
- Applied to: ALB, CloudFront distributions

**TLS Configuration**
- TLS 1.2 minimum (deprecate TLS 1.0, 1.1)
- Strong cipher suites only
- HTTP Strict Transport Security (HSTS) enabled
  - `Strict-Transport-Security: max-age=31536000; includeSubDomains`
- Redirect all HTTP traffic to HTTPS

### 8.2 Web Application Firewall (WAF)

**AWS WAF**
- Protect against common web exploits
- Applied to: ALB, CloudFront

**WAF Rules**
1. **SQL Injection Protection**
   - Inspect query strings, POST body, headers
   - Block requests with SQL injection patterns

2. **Cross-Site Scripting (XSS) Protection**
   - Block requests with script tags and event handlers

3. **Rate Limiting**
   - 2000 requests per 5 minutes per IP
   - Prevent DDoS and brute-force attacks

4. **Geographic Restrictions** (Optional)
   - Allow access only from expected countries (e.g., India)
   - Block traffic from high-risk regions

5. **IP Reputation List**
   - Block known malicious IPs
   - AWS Managed Rules: Anonymous IP list, Known Bad Inputs

6. **Bot Control** (Optional for MVP)
   - Challenge suspicious bot traffic
   - Allow legitimate bots (Google, Bing crawlers)

**Cost**: ~$10-20/month for MVP usage

### 8.3 DDoS Protection

**AWS Shield Standard** (Free)
- Automatic protection against common Layer 3/4 DDoS attacks
- Protects: EC2, ELB, CloudFront, Route 53
- No additional cost

**AWS Shield Advanced** (Optional for high-value targets)
- Cost: $3,000/month + data transfer fees
- 24/7 DDoS Response Team (DRT)
- Advanced attack mitigation
- Cost protection for scaling during attacks
- Recommendation: NOT for MVP, evaluate after product-market fit

**CloudFlare** (Alternative for bootstrapped startup)
- Free tier with basic DDoS protection
- Place CloudFlare in front of CloudFront
- Provides additional caching and WAF rules
- Cost: $0-20/month depending on plan

### 8.4 VPN for Admin Access

**AWS Client VPN**
- Secure access to private resources (RDS, ElastiCache, Bastion)
- Certificate-based authentication
- MFA required for production access
- Split-tunnel configuration (only private subnet traffic through VPN)

**Bastion Host** (Alternative for MVP)
- Single t3.micro instance in public subnet
- SSH access only (port 22)
- Security group restricted to corporate IP addresses
- Key-based authentication only (no passwords)
- Session logging via CloudWatch Logs
- Cost: ~$7.50/month

**Access Control**
- Production access limited to DevOps team
- Require MFA for all production SSH access
- Audit logs for all admin actions
- Rotate SSH keys quarterly

### 8.5 Security Scanning

**Dependency Vulnerability Scanning**
- **npm audit**: Run in CI/CD pipeline
- **Snyk**: Continuous monitoring of dependencies
- **Dependabot**: Automated pull requests for security updates
- Fail build if high/critical vulnerabilities found

**Container Scanning**
- **Amazon ECR Image Scanning**
  - Scan on push enabled
  - Alert on vulnerabilities (high/critical)
- **Trivy**: Open-source vulnerability scanner
  - Scan Docker images before deployment

**Infrastructure Scanning**
- **AWS Security Hub**: Centralized security findings
- **AWS Config**: Compliance monitoring
- **Prowler**: AWS security best practices audit
  - Run monthly, generate compliance report

**Application Security Testing**
- **Static Analysis (SAST)**: SonarQube for code quality
- **Dynamic Analysis (DAST)**: OWASP ZAP for running application
- **Penetration Testing**: Annual third-party pentest (post-MVP)

**Compliance Checks**
- CIS AWS Foundations Benchmark
- OWASP Top 10 vulnerabilities
- PCI-DSS (if payment processing added)
- GDPR compliance (if European users)

### 8.6 Secrets and Key Management

**AWS Key Management Service (KMS)**
- Encryption keys for data at rest
- Automatic key rotation (annual)
- Keys:
  - `alias/sap-prod-db` - RDS encryption
  - `alias/sap-prod-s3` - S3 bucket encryption
  - `alias/sap-prod-app` - Application-level encryption

**Encryption at Rest**
- RDS: Encrypted with KMS key
- S3: Server-side encryption (SSE-S3 or SSE-KMS)
- EBS Volumes: Encrypted by default
- ElastiCache: Encryption at rest and in transit

**Encryption in Transit**
- TLS 1.2+ for all external communication
- VPC internal traffic encrypted where possible
- Database connections use SSL/TLS

**Secret Rotation**
- Database passwords: 90 days
- JWT secrets: 180 days
- API keys: As per vendor recommendations
- SSH keys: 90 days

### 8.7 Security Incident Response

**Incident Response Plan**

**Phase 1: Detection**
- Security alerts via CloudWatch, Security Hub, WAF
- Unusual traffic patterns detected by monitoring
- User-reported security issues

**Phase 2: Containment**
- Isolate affected resources (security group changes)
- Block malicious IPs at WAF/CloudFlare level
- Revoke compromised credentials immediately
- Take snapshots before making changes

**Phase 3: Investigation**
- Review CloudWatch logs and CloudTrail events
- Identify scope of breach
- Document timeline of events
- Preserve evidence for forensics

**Phase 4: Remediation**
- Patch vulnerabilities
- Rotate all credentials
- Deploy security updates
- Restore from clean backups if needed

**Phase 5: Post-Incident**
- Conduct post-mortem review
- Update security policies and procedures
- Notify affected users if data breach
- File reports to regulatory bodies if required

**Incident Response Team**
- Lead: CTO or DevOps Lead
- Developers: Backend and Frontend leads
- External: Security consultant (on retainer)

---

## Conclusion

This deployment architecture provides a scalable, secure, and cost-effective foundation for the Student Assessment Platform. The design balances the needs of a bootstrapped MVP with the requirements for future growth.

**Key Highlights**
- Multi-AZ architecture for 99.9% uptime
- Estimated monthly cost: $378-578 for MVP
- Automated CI/CD pipeline for rapid deployments
- Comprehensive monitoring and alerting
- Disaster recovery with RTO < 30 minutes
- Security-first approach with WAF, encryption, and access controls

**Next Steps**
1. Set up AWS account and billing alerts
2. Implement Terraform infrastructure
3. Configure CI/CD pipeline in GitHub Actions
4. Deploy staging environment for testing
5. Conduct load testing to validate sizing
6. Document runbooks for common operations
7. Schedule DR drill for team readiness

**Future Enhancements** (Post-MVP)
- Multi-region active-active deployment
- Kubernetes (EKS) for container orchestration
- Serverless functions (Lambda) for event-driven tasks
- Advanced analytics with Redshift or Athena
- ML-powered auto-scaling and anomaly detection

---

**Document Version:** 1.0  
**Author:** DevOps Team  
**Review Cycle:** Quarterly  
**Last Reviewed:** July 19, 2026