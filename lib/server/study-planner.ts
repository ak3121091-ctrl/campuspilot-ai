import { ConverseCommand } from "@aws-sdk/client-bedrock-runtime";
import { GetCommand, PutCommand } from "@aws-sdk/lib-dynamodb";
import { randomUUID } from "node:crypto";
import { bedrockClient, dynamoClient, getRequiredEnv } from "@/lib/server/aws";
import type { StudyPlan, StudyPlanTask } from "@/types/study";

function getPlanTableName(): string {
  return `${getRequiredEnv("DYNAMODB_TABLE_PREFIX")}-study-plans`;
}

async function generatePlanWithBedrock(
  examDate: string,
  subjects: string[],
  currentLevel: "beginner" | "intermediate" | "advanced",
  dailyStudyHours: number,
  topics: string[],
): Promise<StudyPlanTask[]> {
  const daysUntilExam = Math.ceil((new Date(examDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));

  const prompt = `You are an expert study planner. Create a realistic, day-by-day study plan.

EXAM DATE: ${examDate} (${daysUntilExam} days from today)
SUBJECTS: ${subjects.join(", ")}
TOPICS TO COVER: ${topics.join(", ")}
STUDENT LEVEL: ${currentLevel}
DAILY STUDY TIME: ${dailyStudyHours} hours

Create a JSON array of study tasks for the next ${Math.min(daysUntilExam, 30)} days. Each task should:
- Respect the ${dailyStudyHours} daily hour constraint
- Distribute topics evenly across days
- Prioritize weak areas for this student level
- Be realistic and achievable

Return ONLY a valid JSON array (no markdown, no extra text) with this structure:
[
  {
    "date": "YYYY-MM-DD",
    "topic": "topic name",
    "subject": "subject name",
    "estimatedHours": 1.5,
    "priority": "high|medium|low"
  },
  ...
]

Dates must be in ascending order starting from today.`;

  const response = await bedrockClient.send(
    new ConverseCommand({
      modelId: getRequiredEnv("BEDROCK_MODEL_ID"),
      messages: [
        {
          role: "user",
          content: [{ text: prompt }],
        },
      ],
      inferenceConfig: { maxTokens: 4000, temperature: 0.3 },
    }),
  );

  const responseText = response.output?.message?.content
    ?.map((content) => ("text" in content ? content.text : ""))
    .join("")
    .trim() || "";

  try {
    const parsed = JSON.parse(responseText);
    if (!Array.isArray(parsed)) {
      throw new Error("Response is not an array");
    }

    return parsed.map((item: unknown, idx: number) => {
      const task = item as {
        date: string;
        topic: string;
        subject: string;
        estimatedHours: number;
        priority: string;
      };

      if (!task.date || !task.topic || !task.subject || typeof task.estimatedHours !== "number") {
        throw new Error(`Task ${idx} is malformed`);
      }

      return {
        id: `task-${idx}`,
        date: task.date.slice(0, 10),
        topic: task.topic.slice(0, 200),
        subject: task.subject.slice(0, 80),
        estimatedHours: Math.max(0.5, Math.min(24, task.estimatedHours)),
        completed: false,
        priority: (["high", "medium", "low"].includes(task.priority) ? task.priority : "medium") as "high" | "medium" | "low",
      };
    });
  } catch (error) {
    throw new Error(`Failed to parse Bedrock response: ${error instanceof Error ? error.message : "Unknown error"}`);
  }
}

export async function createStudyPlan(
  userId: string,
  examDate: string,
  subjects: string[],
  currentLevel: "beginner" | "intermediate" | "advanced",
  dailyStudyHours: number,
  topics: string[],
): Promise<StudyPlan> {
  if (subjects.length === 0 || topics.length === 0) {
    throw new Error("Subjects and topics are required.");
  }

  if (dailyStudyHours <= 0 || dailyStudyHours > 24) {
    throw new Error("Daily study hours must be between 1 and 24.");
  }

  const tasks = await generatePlanWithBedrock(examDate, subjects, currentLevel, dailyStudyHours, topics);

  if (tasks.length === 0) {
    throw new Error("Failed to generate study plan. Please try again.");
  }

  const plan: StudyPlan = {
    id: randomUUID(),
    userId,
    examDate,
    subjects: subjects.map((s) => s.slice(0, 80)),
    currentLevel,
    dailyStudyHours,
    topics: topics.map((t) => t.slice(0, 200)),
    tasks,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  await dynamoClient.send(
    new PutCommand({
      TableName: getPlanTableName(),
      Item: plan,
    }),
  );

  return plan;
}

export async function getStudyPlan(userId: string): Promise<StudyPlan | null> {
  const response = await dynamoClient.send(
    new GetCommand({
      TableName: getPlanTableName(),
      Key: { userId, id: "latest" },
    }),
  );

  return (response.Item as StudyPlan) || null;
}

export async function markTaskComplete(userId: string, taskId: string): Promise<void> {
  const plan = await getStudyPlan(userId);
  if (!plan) {
    throw new Error("Study plan not found.");
  }

  const taskIndex = plan.tasks.findIndex((t) => t.id === taskId);
  if (taskIndex === -1) {
    throw new Error("Task not found in study plan.");
  }

  plan.tasks[taskIndex].completed = true;
  plan.updatedAt = new Date().toISOString();

  await dynamoClient.send(
    new PutCommand({
      TableName: getPlanTableName(),
      Item: plan,
    }),
  );
}
