# CampusPilot AI architecture

## Overview

CampusPilot AI is a student-first learning platform built to turn a student's scattered academic resources into a single, AI-powered study workspace. The product starts with a grounded document workflow: upload academic PDFs, store them securely, process them, and answer questions using only the approved sources provided by the student and college.

## High-level flow

User → Next.js app → AWS Cognito → S3 → AI processing → Bedrock → grounded response

## Core architecture decisions

### Frontend
- Next.js 14+ App Router
- TypeScript and Tailwind CSS
- Student dashboard, document management, AI assistant, quiz, planner, progress, and profile modules
- Responsive layout designed for mobile and laptop workflows

### Backend and integration layer
- Server-side logic lives in Next.js route handlers and service modules
- AWS SDK calls remain server-side only
- Credentials and secrets are read from environment variables and never hardcoded

### Data and storage
- S3 stores uploaded PDFs and approved college resources
- DynamoDB holds user, document, study-plan, quiz, and progress metadata
- Structured relationships preserve subject mapping, upload status, and completion tracking

### AI processing
- Text extraction from PDFs or uploaded notes
- Chunking and metadata attribution
- Retrieval step for relevant documents
- Bedrock grounded response generation
- Explicit fallback when source material does not contain an answer

## Unique product requirement

The app does not behave like a generic chatbot. Each answer should trace back to a student-uploaded or approved college document, and the system should say when the knowledge is not available in the provided sources.

## Planned future enhancements

- Vector search and semantic retrieval
- Lambda-based job processing for document ingestion
- Real Time AI answer citations with page-level references
- Analytics for progress and quiz performance
- College resource approval workflow and moderation
