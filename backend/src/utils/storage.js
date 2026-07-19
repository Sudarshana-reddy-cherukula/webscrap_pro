const { S3Client, PutObjectCommand, GetObjectCommand, DeleteObjectCommand } = require('@aws-sdk/client-s3');
const { getSignedUrl } = require('@aws-sdk/s3-request-presigner');
const path = require('path');
const fs = require('fs').promises;
const logger = require('../utils/logger');

let s3Client = null;
let bucket = null;

function isS3Configured() {
  return !!(process.env.S3_BUCKET && process.env.S3_REGION && process.env.S3_ACCESS_KEY && process.env.S3_SECRET_KEY);
}

function getS3Client() {
  if (!s3Client && isS3Configured()) {
    s3Client = new S3Client({
      region: process.env.S3_REGION,
      credentials: {
        accessKeyId: process.env.S3_ACCESS_KEY,
        secretAccessKey: process.env.S3_SECRET_KEY,
      },
    });
    bucket = process.env.S3_BUCKET;
  }
  return s3Client;
}

async function uploadFile(filePath, key, contentType) {
  const client = getS3Client();
  if (!client) {
    logger.debug('S3 not configured — skipping upload');
    return null;
  }

  try {
    const fileContent = await fs.readFile(filePath);
    await client.send(new PutObjectCommand({
      Bucket: bucket,
      Key: key,
      Body: fileContent,
      ContentType: contentType || 'application/octet-stream',
    }));

    logger.info({ key, bucket }, 'File uploaded to S3');
    return `s3://${bucket}/${key}`;
  } catch (err) {
    logger.error({ err: err.message, key }, 'S3 upload failed');
    throw err;
  }
}

async function getSignedDownloadUrl(key, expiresIn = 3600) {
  const client = getS3Client();
  if (!client) return null;

  try {
    const url = await getSignedUrl(client, new GetObjectCommand({
      Bucket: bucket,
      Key: key,
    }), { expiresIn });
    return url;
  } catch (err) {
    logger.error({ err: err.message, key }, 'S3 signed URL failed');
    throw err;
  }
}

async function deleteFile(key) {
  const client = getS3Client();
  if (!client) return;

  try {
    await client.send(new DeleteObjectCommand({
      Bucket: bucket,
      Key: key,
    }));
    logger.info({ key }, 'File deleted from S3');
  } catch (err) {
    logger.error({ err: err.message, key }, 'S3 delete failed');
  }
}

module.exports = { uploadFile, getSignedDownloadUrl, deleteFile, isS3Configured };
