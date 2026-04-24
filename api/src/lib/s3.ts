import { S3Client, PutObjectCommand, GetObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

const enabled = (process.env.S3_ENABLED || 'false').toLowerCase() === 'true';

export const s3Enabled = enabled;

export const s3 = enabled
  ? new S3Client({
      region: process.env.AWS_REGION || 'us-east-1',
      credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID || '',
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || '',
      },
    })
  : null;

const BUCKET = process.env.AWS_S3_BUCKET || 'learnify-videos';

export async function getUploadUrl(key: string, contentType: string) {
  if (!s3) throw new Error('S3 not enabled');
  const cmd = new PutObjectCommand({ Bucket: BUCKET, Key: key, ContentType: contentType });
  return getSignedUrl(s3, cmd, { expiresIn: 900 });
}

export async function getStreamUrl(key: string) {
  if (!s3) throw new Error('S3 not enabled');
  const cmd = new GetObjectCommand({ Bucket: BUCKET, Key: key });
  return getSignedUrl(s3, cmd, { expiresIn: 3600 });
}
