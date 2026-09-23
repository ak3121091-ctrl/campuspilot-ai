import { BedrockRuntimeClient } from "@aws-sdk/client-bedrock-runtime";
import { S3Client } from "@aws-sdk/client-s3";
import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient } from "@aws-sdk/lib-dynamodb";

const region = process.env.AWS_REGION;

export function getAwsRegion(): string {
  if (!region) {
    throw new Error("AWS_REGION is not configured");
  }

  return region;
}

export const s3Client = new S3Client({ region: region ?? "us-east-1" });
export const dynamoClient = DynamoDBDocumentClient.from(
  new DynamoDBClient({ region: region ?? "us-east-1" }),
);
export const bedrockClient = new BedrockRuntimeClient({
  region: region ?? "us-east-1",
});

export function getRequiredEnv(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(`${name} is not configured`);
  }

  return value;
}

export function getDocumentsTableName(): string {
  return `${getRequiredEnv("DYNAMODB_TABLE_PREFIX")}-documents`;
}
