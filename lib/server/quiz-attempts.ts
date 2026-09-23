import { GetCommand, PutCommand, QueryCommand } from "@aws-sdk/lib-dynamodb";
import { randomUUID } from "node:crypto";
import { dynamoClient, getRequiredEnv } from "@/lib/server/aws";
import type { Quiz, QuizAttempt, QuizAttemptDetail } from "@/types/quiz";

function getAttemptTableName(): string {
  return `${getRequiredEnv("DYNAMODB_TABLE_PREFIX")}-quiz-attempts`;
}

function getQuizTableName(): string {
  return `${getRequiredEnv("DYNAMODB_TABLE_PREFIX")}-quizzes`;
}

export async function submitQuizAttempt(userId: string, quizId: string, answers: Record<string, string>): Promise<QuizAttemptDetail> {
  const quizResponse = await dynamoClient.send(
    new GetCommand({
      TableName: getQuizTableName(),
      Key: { userId, id: quizId },
    }),
  );

  if (!quizResponse.Item) {
    throw new Error("Quiz not found.");
  }

  const quiz = quizResponse.Item as Quiz;
  let correctCount = 0;

  const results = quiz.questions.map((question) => {
    const selectedOptionId = answers[question.id];
    const isCorrect = selectedOptionId === question.correctOptionId;
    if (isCorrect) correctCount++;

    return {
      question,
      selectedOptionId: selectedOptionId || "",
      isCorrect,
    };
  });

  const score = Math.round((correctCount / quiz.questions.length) * 100);

  const attempt: QuizAttempt = {
    id: randomUUID(),
    userId,
    quizId,
    answers,
    score,
    totalQuestions: quiz.questions.length,
    attemptedAt: new Date().toISOString(),
  };

  await dynamoClient.send(
    new PutCommand({
      TableName: getAttemptTableName(),
      Item: attempt,
    }),
  );

  return {
    ...attempt,
    quiz,
    results,
  };
}

export async function getQuizAttempts(userId: string): Promise<QuizAttempt[]> {
  const response = await dynamoClient.send(
    new QueryCommand({
      TableName: getAttemptTableName(),
      KeyConditionExpression: "userId = :userId",
      ExpressionAttributeValues: { ":userId": userId },
      ScanIndexForward: false,
    }),
  );

  return (response.Items ?? []) as QuizAttempt[];
}

export async function getQuizAttemptDetail(userId: string, attemptId: string): Promise<QuizAttemptDetail> {
  const attemptResponse = await dynamoClient.send(
    new GetCommand({
      TableName: getAttemptTableName(),
      Key: { userId, id: attemptId },
    }),
  );

  if (!attemptResponse.Item) {
    throw new Error("Attempt not found.");
  }

  const attempt = attemptResponse.Item as QuizAttempt;

  const quizResponse = await dynamoClient.send(
    new GetCommand({
      TableName: getQuizTableName(),
      Key: { userId, id: attempt.quizId },
    }),
  );

  if (!quizResponse.Item) {
    throw new Error("Associated quiz not found.");
  }

  const quiz = quizResponse.Item as Quiz;

  const results = quiz.questions.map((question) => {
    const selectedOptionId = attempt.answers[question.id];
    const isCorrect = selectedOptionId === question.correctOptionId;

    return {
      question,
      selectedOptionId: selectedOptionId || "",
      isCorrect,
    };
  });

  return {
    ...attempt,
    quiz,
    results,
  };
}
