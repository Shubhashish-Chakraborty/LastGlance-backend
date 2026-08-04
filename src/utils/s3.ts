import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { v4 as uuidv4 } from "uuid";
import {
  AWS_REGION,
  AWS_ACCESS_KEY_ID,
  AWS_SECRET_ACCESS_KEY,
  AWS_S3_BUCKET_NAME,
} from "../config";

export const s3Client = new S3Client({
  region: AWS_REGION,
  credentials: {
    accessKeyId: AWS_ACCESS_KEY_ID,
    secretAccessKey: AWS_SECRET_ACCESS_KEY,
  },
});

export const uploadFileToS3 = async (
  fileBuffer: Buffer,
  mimetype: string,
  originalName: string
) => {
  const parts = originalName.split(".");
  const ext = parts.length > 1 ? parts.pop() : "";
  const key = `${uuidv4()}${ext ? "." + ext : ""}`;

  const command = new PutObjectCommand({
    Bucket: AWS_S3_BUCKET_NAME,
    Key: key,
    Body: fileBuffer,
    ContentType: mimetype,
  });

  await s3Client.send(command);

  // returing the public URL and key
  return {
    url: `https://${AWS_S3_BUCKET_NAME}.s3.${AWS_REGION}.amazonaws.com/${key}`,
    key,
  };
};
