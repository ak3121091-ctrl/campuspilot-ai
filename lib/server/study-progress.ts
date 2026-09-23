import { GetCommand, PutCommand, QueryCommand } from "@aws-sdk/lib-dynamodb";
import { dynamoClient, getRequiredEnv } from "@/lib/server/aws";
import type { QuizAttempt } from "@/types/quiz";
import type { SubjectProgress, ProgressSnapshot } from "@/types/study";

function getProgressTableName(): string {
  return `${getRequiredEnv("DYNAMODB_TABLE_PREFIX")}-progress`;
}

function getQuizTableName(): string {
  return `${getRequiredEnv("DYNAMODB_TABLE_PREFIX")}-quizzes`;
}

function getAttemptTableName(): string {
  return `${getRequiredEnv("DYNAMODB_TABLE_PREFIX")}-quiz-attempts`;
}

export async function updateProgressTracking(userId: string): Promise<ProgressSnapshot> {
  const attemptsResponse = await dynamoClient.send(
    new QueryCommand({
      TableName: getAttemptTableName(),
      KeyConditionExpression: "userId = :userId",
      ExpressionAttributeValues: { ":userId": userId },
    }),
  );

  const attempts = (attemptsResponse.Items ?? []) as QuizAttempt[];

  if (attempts.length === 0) {
    const emptyProgress: ProgressSnapshot = {
      userId,
      totalQuizzesAttempted: 0,
      averageScore: 0,
      subjectProgress: {},
      lastUpdated: new Date().toISOString(),
    };

    await dynamoClient.send(
      new PutCommand({
        TableName: getProgressTableName(),
        Item: emptyProgress,
      }),
    );

    return emptyProgress;
  }

  const subjectMap = new Map<string, SubjectProgress>();
  let totalScore = 0;

  for (const attempt of attempts) {
    const quizResponse = await dynamoClient.send(
      new GetCommand({
        TableName: getQuizTableName(),
        Key: { userId, id: attempt.quizId },
      }),
    );

    if (!quizResponse.Item) continue;

    const quiz = quizResponse.Item as { subject: string; topic: string };
    const subject = quiz.subject;

    if (!subjectMap.has(subject)) {
      subjectMap.set(subject, {
        subject,
        topicsAttempted: 0,
        correctAnswers: 0,
        totalAttempts: 0,
        averageScore: 0,
        weakTopics: [],
      });
    }

    const progress = subjectMap.get(subject)!;
    const topicKey = quiz.topic;

    progress.totalAttempts += 1;
    progress.correctAnswers += Math.round((attempt.score / 100) * attempt.totalQuestions);
    progress.topicsAttempted = Math.min(Math.max(progress.topicsAttempted, Object.keys([topicKey]).length), 50);

    totalScore += attempt.score;
  }

  const subjectProgress: Record<string, SubjectProgress> = {};
  for (const [subject, progress] of subjectMap.entries()) {
    progress.averageScore = Math.round((progress.correctAnswers / progress.totalAttempts) * 100);

    if (progress.averageScore < 60) {
      progress.weakTopics = ["Check recent quiz performance"];
    }

    subjectProgress[subject] = progress;
  }

  const snapshot: ProgressSnapshot = {
    userId,
    totalQuizzesAttempted: attempts.length,
    averageScore: Math.round(totalScore / attempts.length),
    subjectProgress,
    lastUpdated: new Date().toISOString(),
  };

  await dynamoClient.send(
    new PutCommand({
      TableName: getProgressTableName(),
      Item: snapshot,
    }),
  );

  return snapshot;
}

export async function getProgressSnapshot(userId: string): Promise<ProgressSnapshot> {
  const response = await dynamoClient.send(
    new GetCommand({
      TableName: getProgressTableName(),
      Key: { userId, id: "latest" },
    }),
  );

  if (!response.Item) {
    return updateProgressTracking(userId);
  }

  return response.Item as ProgressSnapshot;
}

export async function generateStudyRecommendations(userId: string): Promise<Array<{ topic: string; subject: string; reason: string; priority: string }>> {
  const progress = await getProgressSnapshot(userId);
  const recommendations: Array<{ topic: string; subject: string; reason: string; priority: string }> = [];

  for (const [subject, subjectProgress] of Object.entries(progress.subjectProgress)) {
    if (subjectProgress.averageScore < 60) {
      recommendations.push({
        topic: subjectProgress.weakTopics[0] || "General review",
        subject,
        reason: `Your average score in ${subject} is ${subjectProgress.averageScore}%. Consider revision.`,
        priority: "high",
      });
    } else if (subjectProgress.averageScore < 75) {
      recommendations.push({
        topic: "Practice problems",
        subject,
        reason: `Solidify your ${subject} knowledge with more practice.`,
        priority: "medium",
      });
    }
  }

  return recommendations;
}
