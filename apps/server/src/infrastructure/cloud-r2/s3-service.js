import {
  DeleteObjectCommand,
  GetObjectCommand,
  ListObjectsV2Command,
  PutObjectCommand,
  S3Client
} from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

let client;

function getS3Client() {
  if (client) {
    return client;
  }
  client = new S3Client({
    region: process.env.AWS_REGION || 'auto',
    endpoint: process.env.S3_ENDPOINT,
    credentials: {
      accessKeyId: process.env.AWS_ACCESS_KEY_ID,
      secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
    },
    forcePathStyle: true
  });
  return client;
}

export function getDefaultBucket() {
  return process.env.BUCKET_NAME?.trim() || '';
}

export function isS3Configured() {
  return Boolean(
    getDefaultBucket() &&
      process.env.AWS_ACCESS_KEY_ID &&
      process.env.AWS_SECRET_ACCESS_KEY &&
      process.env.S3_ENDPOINT
  );
}

export async function uploadObject(bucket, key, body, contentType) {
  await getS3Client().send(
    new PutObjectCommand({
      Bucket: bucket,
      Key: key,
      Body: body,
      ContentType: contentType || undefined
    })
  );
}

export async function listObjects(bucket) {
  const data = await getS3Client().send(new ListObjectsV2Command({ Bucket: bucket }));
  return data.Contents || [];
}

export async function getDownloadUrl(bucket, key, expiresIn = 3600) {
  const command = new GetObjectCommand({ Bucket: bucket, Key: key });
  return getSignedUrl(getS3Client(), command, { expiresIn });
}

export async function getObject(bucket, key) {
  const data = await getS3Client().send(new GetObjectCommand({ Bucket: bucket, Key: key }));
  return { body: data.Body, contentType: data.ContentType };
}

export async function deleteObject(bucket, key) {
  await getS3Client().send(new DeleteObjectCommand({ Bucket: bucket, Key: key }));
}
