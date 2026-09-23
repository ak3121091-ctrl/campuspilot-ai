# CampusPilot AI

## Project overview

CampusPilot AI is a student-focused learning platform designed to consolidate scattered academic resources into a single AI-powered workspace. The product helps students organize study material, ask grounded questions about uploaded documents, generate quiz sets, create study plans, and track learning progress without depending on generic chatbot behavior.

## Problem

College students often collect notes, PDFs, notices, lab work, and assignment material across multiple locations. This fragmentation makes learning less efficient, reduces resource discoverability, and makes revision more difficult.

## Solution

CampusPilot AI brings uploaded documents and approved college resources together in one workflow. The student can ask questions, generate practice content, track study plans, and review their progress in a single dashboard grounded in the materials they trust.

## Key features

- Student authentication and protected dashboard routes
- Document upload and subject organization
- Grounded AI Q&A over uploaded study content
- **AI Quiz Generator**: Generate 5/10/20 MCQs from documents with difficulty levels
- **Quiz Attempt System**: Track quiz attempts, score calculation, and performance analysis
- **Adaptive Study Recommendations**: Personalized suggestions based on weak areas
- **AI Study Planner**: Generate realistic multi-week plans respecting daily study hours
- **Progress Tracking**: Subject-wise mastery, attempt statistics, and trend analysis
- College knowledge using approved resources
- Impact metrics based on real product activity

## Architecture

The system is designed around a grounded education workflow with the following flow:

1. Student uploads study documents or approved college resources
2. Files are stored in Amazon S3
3. Application metadata is tracked in DynamoDB
4. AI processing reads the material and grounds responses in the uploaded sources
5. Amazon Bedrock generates student-friendly quiz questions, study plans, and recommendations
6. The frontend surfaces the result in a dashboard workflow

See ARCHITECTURE.md for the detailed design.

## Phase 3/4 AWS services

- Amazon S3 stores validated PDF documents with server-side encryption.
- Amazon DynamoDB stores document metadata in `${DYNAMODB_TABLE_PREFIX}-documents`, quiz metadata in `${DYNAMODB_TABLE_PREFIX}-quizzes`, quiz attempts in `${DYNAMODB_TABLE_PREFIX}-quiz-attempts`, study plans in `${DYNAMODB_TABLE_PREFIX}-study-plans`, and progress snapshots in `${DYNAMODB_TABLE_PREFIX}-progress`.
- Amazon Bedrock Converse generates quizzes grounded in uploaded documents, creates study plans based on student level and exam date, and produces adaptive study recommendations.
- Cognito is planned for authentication; the current API accepts `x-user-id` from an authenticated server integration and uses `local-development-user` only when `APP_ENV=development`.

The Q&A, quiz generation, planner, and recommendation routes return explicit error or unsupported-context responses instead of inventing answers when appropriate source material or context is unavailable.

## Features implemented (Phase 5)

### (1) AI Quiz Generator
- **Endpoint**: `POST /api/quiz`
- **Inputs**: subject, topic, documentIds, questionCount (5/10/20), difficulty (easy/medium/hard)
- **Output**: Quiz with questions, options, correct answers, explanations
- **Bedrock integration**: Generates MCQs grounded in document content with difficulty-aware prompting
- **Storage**: Persists quizzes in DynamoDB with document references

### (2) Quiz Attempt System
- **Endpoint**: `POST /api/quiz-attempts` (submit), `GET /api/quiz-attempts` (list), `GET /api/quiz-attempts?attemptId=...` (details)
- **Functionality**: Stores attempts with answers, calculates scores, retrieves attempt history with detailed results
- **Score calculation**: (correct answers / total questions) × 100
- **Results tracking**: Question-by-question feedback with correct/incorrect marking

### (3) Adaptive Study Recommendations
- **Endpoint**: `GET /api/progress?action=recommendations`
- **Logic**: Analyzes weak topics (score < 60%), recommends revision with priority levels
- **Data source**: Quiz attempt history and subject progress snapshots
- **Recommendations include**: topic, subject, reason, priority (high/medium/low)

### (4) AI Study Planner
- **Endpoint**: `POST /api/study-planner` (create), `GET /api/study-planner` (retrieve), `PATCH /api/study-planner` (mark task complete)
- **Inputs**: examDate, subjects, currentLevel (beginner/intermediate/advanced), dailyStudyHours, topics
- **Bedrock integration**: Generates realistic day-by-day tasks respecting daily hour constraints
- **Output**: Study plan with tasks (date, topic, subject, estimatedHours, priority, completed flag)
- **Persistence**: Stores full plan in DynamoDB, allowing task completion tracking

### (5) Study Progress Tracking
- **Endpoint**: `GET /api/progress` (snapshot), `GET /api/progress?action=refresh` (update), `GET /api/progress?action=recommendations`
- **Metrics**: Total quizzes, average score, subject-wise performance (score, attempts, topics covered)
- **Weak topic detection**: Identifies topics with < 60% average score
- **Automatic refresh**: Recalculates from quiz attempt history on demand
- **UI integration**: Progress page shows subject mastery bars, attempt counts, and adaptive recommendations

## Data schema (DynamoDB tables)

### Documents table: `${PREFIX}-documents`
- Partition key: `userId` (String)
- Sort key: `id` (String)
- Fields: fileName, subject, size, s3Key, status (uploaded/processing/ready/failed), createdAt

### Quizzes table: `${PREFIX}-quizzes`
- Partition key: `userId` (String)
- Sort key: `id` (String)
- Fields: subject, topic, documentIds, questions (with id, question, options, correctOptionId, explanation, difficulty), questionCount, generatedAt

### Quiz Attempts table: `${PREFIX}-quiz-attempts`
- Partition key: `userId` (String)
- Sort key: `id` (String)
- Fields: quizId, answers (map of questionId → optionId), score, totalQuestions, attemptedAt

### Study Plans table: `${PREFIX}-study-plans`
- Partition key: `userId` (String)
- Sort key: `id` (String)
- Fields: examDate, subjects, currentLevel, dailyStudyHours, topics, tasks (with id, date, topic, subject, estimatedHours, priority, completed), createdAt, updatedAt

### Progress table: `${PREFIX}-progress`
- Partition key: `userId` (String)
- Sort key: `id` (String)
- Fields: totalQuizzesAttempted, averageScore, subjectProgress (map of subject → {averageScore, attempts, topicsAttempted, weakTopics}), lastUpdated

## Local setup

```bash
npm install
npm run dev
```

Open http://localhost:3000 to view the app.

## Environment variables

Copy `.env.example` to a local `.env` file and replace the placeholder values before running AWS-backed features.

Required variables for all features include:
- `APP_ENV` (development or production)
- `AWS_REGION`
- `S3_BUCKET_NAME`
- `DYNAMODB_TABLE_PREFIX`
- `BEDROCK_MODEL_ID` (e.g., `anthropic.claude-3-5-sonnet-20241022-v2:0`)

`AWS_ACCESS_KEY_ID`, `AWS_SECRET_ACCESS_KEY`, and `AWS_SESSION_TOKEN` are optional local-only overrides. Prefer the AWS SDK default credential chain (AWS CLI profile, IAM role, or workload identity) and never expose these values through `NEXT_PUBLIC_*` variables or browser code.

## AWS resources and IAM

1. Create an S3 bucket with Block Public Access enabled and default SSE-S3 or SSE-KMS encryption.
2. Create DynamoDB tables:
   - `${DYNAMODB_TABLE_PREFIX}-documents` with partition key `userId` (String) and sort key `id` (String)
   - `${DYNAMODB_TABLE_PREFIX}-quizzes` with partition key `userId` (String) and sort key `id` (String)
   - `${DYNAMODB_TABLE_PREFIX}-quiz-attempts` with partition key `userId` (String) and sort key `id` (String)
   - `${DYNAMODB_TABLE_PREFIX}-study-plans` with partition key `userId` (String) and sort key `id` (String)
   - `${DYNAMODB_TABLE_PREFIX}-progress` with partition key `userId` (String) and sort key `id` (String)
3. Enable access to the model in `BEDROCK_MODEL_ID` in the selected AWS Region.
4. Give the server runtime role only:
   - `s3:PutObject`, `s3:GetObject` on the document bucket
   - `dynamodb:PutItem`, `dynamodb:GetItem`, `dynamodb:Query` on all tables
   - `bedrock:InvokeModel` for the selected model (for quiz generation and study planning)
5. Add CloudWatch logging and alarms for denied AWS calls, upload failures, Bedrock throttling, and DynamoDB capacity issues.

## Local development

For UI-only development without AWS, the document, quiz, planner, and progress pages show helpful unavailable states. To exercise the full workflow locally, configure the variables above and authenticate the AWS SDK with an AWS CLI profile or temporary credentials. Local development uses the fixed non-production user id `local-development-user` when `APP_ENV=development`; production requests without an authenticated `x-user-id` are rejected.

Development flow:
1. Upload documents via the Documents page
2. Generate quizzes via the Quiz page (select documents, subject, topic, difficulty)
3. Attempt quizzes and track scores
4. Create study plans via the Planner page
5. View progress and recommendations on the Progress page

## Deployment instructions

1. Provision the S3 bucket, all DynamoDB tables, Bedrock model access, and least-privilege runtime role.
2. Configure the variables in the hosting platform's server environment, not as public browser variables.
3. Deploy the Next.js production build to Amplify, a container runtime, or another Node.js-compatible host.
4. Add Cognito-backed server authentication and pass the verified subject as the user identity before enabling production traffic.
5. Verify PDF upload, metadata reads, document-grounded Q&A, quiz generation, study planner, progress tracking, CloudWatch logs, and throttling/error alarms.

The repository includes end-to-end AWS service integration for all Phase 5 features but does not include infrastructure-as-code templates, Cognito middleware, asynchronous OCR/chunking, vector retrieval, or a production deployment target yet. Scanned/image-only PDFs are rejected because Phase 3 extracts text synchronously; the 10 MB limit and context-size cap are enforced in the server module.

## Validation

All code has been validated with:
- **TypeScript (`npx tsc --noEmit`)**: All type errors resolved; strict mode active
- **ESLint (`npm run lint`)**: No errors or warnings
- **Next.js build (`npm run build`)**: Successful compilation; all routes and API endpoints available

## Security notes

- No AWS credentials should be committed to source control.
- Server-side operations are kept on the backend and not exposed to the browser.
- Secrets stay in environment variables only.
- File validation, size limits, and safe access policies should be enforced before production deployment.
- Bedrock API calls use temperature 0.2-0.3 for deterministic educational outputs.

## Future improvements

- Async PDF extraction and chunking pipeline for larger or scanned files
- Semantic retrieval and vector-based search over quiz results
- Better citations and document lineage for AI-generated quiz questions
- Advanced quiz analytics with learning curve analysis
- Spaced repetition recommendations
- More robust college resource moderation workflow
- Full AWS production deployment with secure monitoring and incident logging

