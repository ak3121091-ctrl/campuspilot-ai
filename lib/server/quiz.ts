import { ConverseCommand } from "@aws-sdk/client-bedrock-runtime";
import { PutCommand } from "@aws-sdk/lib-dynamodb";
import { randomUUID } from "node:crypto";
import { bedrockClient, dynamoClient, getRequiredEnv } from "@/lib/server/aws";
import type { Quiz, QuizQuestion, QuizDifficulty, QuizQuestionCount } from "@/types/quiz";
import type { DocumentContext } from "@/lib/server/documents";

function getQuizTableName(): string {
  return `${getRequiredEnv("DYNAMODB_TABLE_PREFIX")}-quizzes`;
}

async function generateQuestionsWithBedrock(
  subject: string,
  topic: string,
  sourceText: string,
  questionCount: QuizQuestionCount,
  difficulty: QuizDifficulty,
): Promise<QuizQuestion[]> {
  const prompt = `You are an educational assessment expert. Generate exactly ${questionCount} multiple-choice questions based on the provided source material.

SUBJECT: ${subject}
TOPIC: ${topic}
DIFFICULTY: ${difficulty}

SOURCE MATERIAL:
${sourceText}

Generate questions that are:
- Grounded in the source material provided
- Appropriate for ${difficulty} learners
- Clear and unambiguous
- Each with exactly 4 options

Return ONLY a valid JSON array (no markdown, no extra text) with this exact structure:
[
  {
    "question": "question text here?",
    "options": ["option A", "option B", "option C", "option D"],
    "correctOptionIndex": 0,
    "explanation": "why this answer is correct"
  },
  ...
]

Ensure the JSON is valid and each object has exactly these 4 fields.`;

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

    return parsed.slice(0, questionCount).map((item: unknown, idx: number) => {
      const q = item as {
        question: string;
        options: string[];
        correctOptionIndex: number;
        explanation: string;
      };

      if (!q.question || !Array.isArray(q.options) || q.options.length !== 4 || typeof q.correctOptionIndex !== "number" || !q.explanation) {
        throw new Error(`Question ${idx} is malformed`);
      }

      const correctIndex = Math.max(0, Math.min(3, q.correctOptionIndex));
      const options = q.options.map((text: string, i: number) => ({
        id: `opt-${idx}-${i}`,
        text: text.slice(0, 500),
      }));

      return {
        id: `q-${idx}`,
        question: q.question.slice(0, 1000),
        options,
        correctOptionId: options[correctIndex].id,
        explanation: q.explanation.slice(0, 1000),
        difficulty,
      };
    });
  } catch (error) {
    throw new Error(`Failed to parse Bedrock response: ${error instanceof Error ? error.message : "Unknown error"}`);
  }
}

export async function generateQuiz(
  userId: string,
  subject: string,
  topic: string,
  documentContexts: DocumentContext[],
  questionCount: QuizQuestionCount = 10,
  difficulty: QuizDifficulty = "medium",
): Promise<Quiz> {
  if (documentContexts.length === 0 || documentContexts.every(({ text }) => !text)) {
    throw new Error("No document content available. Please select documents before generating a quiz.");
  }

  const sourceText = documentContexts.map(({ text }) => text).join("\n\n").slice(0, 40000);

  const questions = await generateQuestionsWithBedrock(subject, topic, sourceText, questionCount, difficulty);

  if (questions.length === 0) {
    throw new Error("Failed to generate questions. Please try again.");
  }

  const quiz: Quiz = {
    id: randomUUID(),
    userId,
    subject: subject.slice(0, 80),
    topic: topic.slice(0, 200),
    documentIds: documentContexts.map((ctx) => ctx.document.id),
    questions,
    questionCount: Math.min(questionCount, questions.length) as QuizQuestionCount,
    generatedAt: new Date().toISOString(),
  };

  await dynamoClient.send(
    new PutCommand({
      TableName: getQuizTableName(),
      Item: quiz,
    }),
  );

  return quiz;
}
