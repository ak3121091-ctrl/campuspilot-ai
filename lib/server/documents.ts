import { GetObjectCommand, PutObjectCommand } from "@aws-sdk/client-s3";
import { GetCommand, PutCommand, QueryCommand } from "@aws-sdk/lib-dynamodb";
import { PDFParse } from "pdf-parse";
import { randomUUID } from "node:crypto";
import { getUserIdFromRequest } from "@/lib/server/auth";
import {
  dynamoClient,
  getDocumentsTableName,
  getRequiredEnv,
  s3Client,
} from "@/lib/server/aws";

export const MAX_DOCUMENT_SIZE_BYTES = 10 * 1024 * 1024;
const MAX_CONTEXT_CHARACTERS = 60_000;

export type DocumentStatus = "uploaded" | "processing" | "ready" | "failed";

export type DocumentRecord = {
  id: string;
  userId: string;
  fileName: string;
  subject: string;
  contentType: "application/pdf";
  size: number;
  s3Key: string;
  status: DocumentStatus;
  createdAt: string;
};

export type DocumentContext = {
  document: DocumentRecord;
  text: string;
};

export function validatePdf(file: File): string | null {
  if (file.size === 0) return "The PDF is empty.";
  if (file.size > MAX_DOCUMENT_SIZE_BYTES) {
    return "PDF files must be 10 MB or smaller.";
  }
  if (file.type && file.type !== "application/pdf") {
    return "Only PDF files are supported.";
  }

  return null;
}

function isPdf(buffer: Buffer): boolean {
  return buffer.subarray(0, 5).toString("ascii") === "%PDF-";
}

async function extractText(buffer: Buffer): Promise<string> {
  const parser = new PDFParse({ data: buffer });
  try {
    const result = await parser.getText();
    return normalizeText(result.text);
  } finally {
    await parser.destroy();
  }
}

function normalizeText(value: string): string {
  return value.replace(/\s+/g, " ").trim();
}

function getUserId(request: Request): string {
  const userId = getUserIdFromRequest(request);
  if (userId) return userId;
  if (process.env.APP_ENV === "development") return "local-development-user";
  throw new Error("Authentication is required before using document features.");
}

export async function listDocuments(request: Request): Promise<DocumentRecord[]> {
  const userId = getUserId(request);
  const response = await dynamoClient.send(
    new QueryCommand({
      TableName: getDocumentsTableName(),
      KeyConditionExpression: "userId = :userId",
      ExpressionAttributeValues: { ":userId": userId },
      ScanIndexForward: false,
    }),
  );

  return (response.Items ?? []) as DocumentRecord[];
}

export async function uploadDocument(request: Request, file: File, subject: string): Promise<DocumentRecord> {
  const validationError = validatePdf(file);
  if (validationError) throw new Error(validationError);

  const userId = getUserId(request);
  const buffer = Buffer.from(await file.arrayBuffer());
  if (!isPdf(buffer)) throw new Error("The uploaded file is not a valid PDF.");

  const text = await extractText(buffer);
  if (!text) throw new Error("The PDF does not contain extractable text.");

  const id = randomUUID();
  const s3Key = `${userId}/${id}.pdf`;
  const record: DocumentRecord = {
    id,
    userId,
    fileName: file.name.replace(/[^\w.-]+/g, "_").slice(0, 160) || `${id}.pdf`,
    subject: subject.trim().slice(0, 80) || "Uncategorized",
    contentType: "application/pdf",
    size: buffer.byteLength,
    s3Key,
    status: "ready",
    createdAt: new Date().toISOString(),
  };

  await s3Client.send(
    new PutObjectCommand({
      Bucket: getRequiredEnv("S3_BUCKET_NAME"),
      Key: s3Key,
      Body: buffer,
      ContentType: "application/pdf",
      ServerSideEncryption: "AES256",
      Metadata: { documentId: id, userId },
    }),
  );
  await dynamoClient.send(
    new PutCommand({
      TableName: getDocumentsTableName(),
      Item: record,
    }),
  );

  return record;
}

async function bodyToBuffer(body: unknown): Promise<Buffer> {
  if (!body || typeof body !== "object" || !("transformToByteArray" in body)) {
    throw new Error("The stored document could not be read.");
  }

  const bytes = await (body as { transformToByteArray: () => Promise<Uint8Array> }).transformToByteArray();
  return Buffer.from(bytes);
}

export async function getDocumentContext(request: Request, documentId?: string): Promise<DocumentContext[]> {
  const documents = await listDocuments(request);
  const selected = documentId ? documents.filter((document) => document.id === documentId) : documents;
  if (selected.length === 0) return [];

  const contexts: DocumentContext[] = [];
  let totalCharacters = 0;
  for (const document of selected) {
    const metadata = await dynamoClient.send(
      new GetCommand({
        TableName: getDocumentsTableName(),
        Key: { userId: document.userId, id: document.id },
      }),
    );
    if (!metadata.Item) continue;

    const response = await s3Client.send(
      new GetObjectCommand({
        Bucket: getRequiredEnv("S3_BUCKET_NAME"),
        Key: document.s3Key,
      }),
    );
    const text = await extractText(await bodyToBuffer(response.Body));
    const remaining = MAX_CONTEXT_CHARACTERS - totalCharacters;
    if (remaining <= 0) break;
    contexts.push({ document, text: text.slice(0, remaining) });
    totalCharacters += text.length;
  }

  return contexts;
}
