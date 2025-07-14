const { Client } = require('minio');
const path = require('path');
const fs = require('fs');

// Initialize MinIO client for Linode Object Storage
const minioClient = new Client({
  endPoint: process.env.ENDPOINT,
  port: 443,
  useSSL: true,
  accessKey: process.env.ACCESS_KEY,
  secretKey: process.env.SECRET_ACCESS_KEY,
  region: process.env.CLUSTER
});

/**
 * Upload a file to Linode Object Storage
 * @param {string} filePath - Local path to the file
 * @param {string} objectName - Name for the object in the bucket
 * @returns {Promise<boolean>} - Success status
 */
async function uploadFile(filePath, objectName) {
  try {
    // Check if file exists
    if (!fs.existsSync(filePath)) {
      console.error('File not found for upload:', { filePath, objectName });
      return false;
    }

    // Upload the file
    await minioClient.fPutObject(
      process.env.BUCKET,
      objectName,
      filePath,
      {
        'Content-Type': 'text/plain',
        'Content-Encoding': 'utf-8'
      }
    );

    console.log('File uploaded to object storage:', {
      filePath,
      objectName,
      bucket: process.env.BUCKET,
      size: fs.statSync(filePath).size
    });

    return true;
  } catch (error) {
    console.error('Failed to upload file to object storage:', {
      filePath,
      objectName,
      error: error.message,
      bucket: process.env.BUCKET
    });
    return false;
  }
}

/**
 * Upload a rotated log file
 * @param {string} filePath - Path to the rotated log file
 * @returns {Promise<boolean>} - Success status
 */
async function uploadRotatedLog(filePath) {
  try {
    const fileName = path.basename(filePath);
    const objectName = `logs/${fileName}`;
    
    return await uploadFile(filePath, objectName);
  } catch (error) {
    console.error('Failed to upload rotated log:', {
      filePath,
      error: error.message
    });
    return false;
  }
}

/**
 * Test connection to Linode Object Storage
 * @returns {Promise<boolean>} - Connection status
 */
async function testConnection() {
  try {
    console.log('Testing Linode Object Storage connection...');
    console.log('Endpoint:', process.env.ENDPOINT);
    console.log('Bucket:', process.env.BUCKET);
    console.log('Region (Linode Object Storage cluster):', 'us-sea-1');
    
    // Try to list objects in the bucket instead of bucketExists
    // This is more reliable for S3-compatible services
    const objects = minioClient.listObjects(process.env.BUCKET, '', true);
    let hasObjects = false;
    
    for await (const obj of objects) {
      hasObjects = true;
      break; // Just check if we can access the bucket
    }
    
    console.log('Successfully connected to Linode Object Storage:', {
      bucket: process.env.BUCKET,
      endpoint: process.env.ENDPOINT,
      hasObjects: hasObjects
    });
    return true;
  } catch (error) {
    console.error('Failed to connect to Linode Object Storage:', {
      error: error.message,
      code: error.code,
      endpoint: process.env.ENDPOINT,
      stack: error.stack
    });
    return false;
  }
}

module.exports = {
  uploadFile,
  uploadRotatedLog,
  testConnection
}; 
