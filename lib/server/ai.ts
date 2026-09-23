import { ConverseCommand } from "@aws-sdk/client-bedrock-runtime";
import { bedrockClient, getRequiredEnv } from "@/lib/server/aws";
import type { DocumentContext } from "@/lib/server/documents";

export const UNSUPPORTED_CONTEXT_RESPONSE =
  "I couldn't find that in your uploaded documents. Try asking about a topic covered by the selected study material.";

export async function answerFromDocuments(question: string, contexts: DocumentContext[]): Promise<string> {
  if (contexts.length === 0 || contexts.every(({ text }) => !text)) {
    return UNSUPPORTED_CONTEXT_RESPONSE;
  }

  const sourceText = contexts
    .map(({ document, text }) => `SOURCE: ${document.fileName}\n${text}`)
    .join("\n\n");
  const response = await bedrockClient.send(
    new ConverseCommand({
      modelId: getRequiredEnv("BEDROCK_MODEL_ID"),
      system: [
        {
          text:
            "You are CampusPilot AI, a document-grounded study assistant. Answer only from the supplied source text. If the source text does not support an answer, respond exactly with: " +
            UNSUPPORTED_CONTEXT_RESPONSE,
        },
      ],
      messages: [
        {
          role: "user",
          content: [{ text: `SOURCE TEXT:\n${sourceText}\n\nQUESTION:\n${question}` }],
        },
      ],
      inferenceConfig: { maxTokens: 700, temperature: 0.2 },
    }),
  );

  const answer = response.output?.message?.content
    ?.map((content) => ("text" in content ? content.text : ""))
    .join("")
    .trim();
  return answer || UNSUPPORTED_CONTEXT_RESPONSE;
}
