import AWS from 'aws-sdk'
import fs from 'fs'
import path from 'path'

// Check if AWS credentials are configured (not placeholders)
const isS3Configured = (): boolean => {
  const accessKey = process.env.AWS_ACCESS_KEY_ID
  const secretKey = process.env.AWS_SECRET_ACCESS_KEY

  return !!(
    accessKey &&
    secretKey &&
    accessKey !== 'your-aws-access-key' &&
    secretKey !== 'your-aws-secret-key'
  )
}

const s3Config: AWS.S3.ClientConfiguration = {
  region: process.env.AWS_REGION || 'us-east-1',
}

if (process.env.AWS_ACCESS_KEY_ID) {
  s3Config.accessKeyId = process.env.AWS_ACCESS_KEY_ID
}

if (process.env.AWS_SECRET_ACCESS_KEY) {
  s3Config.secretAccessKey = process.env.AWS_SECRET_ACCESS_KEY
}

const s3 = new AWS.S3(s3Config)

// Local file storage for development
async function uploadFileLocally(file: Express.Multer.File, folder: string): Promise<string> {
  try {
    // Create uploads directory if it doesn't exist
    const uploadsDir = path.join(process.cwd(), 'uploads', folder)
    if (!fs.existsSync(uploadsDir)) {
      fs.mkdirSync(uploadsDir, { recursive: true })
    }

    // Generate unique filename
    const filename = `${Date.now()}-${file.originalname.replace(/\s+/g, '-')}`
    const filePath = path.join(uploadsDir, filename)

    // Write file to disk
    fs.writeFileSync(filePath, file.buffer)

    // Return URL accessible from frontend
    const baseUrl = process.env.BACKEND_URL || 'http://localhost:3001'
    return `${baseUrl}/uploads/${folder}/${filename}`
  } catch (error) {
    console.error('Local upload error:', error)
    throw new Error('Failed to save file locally')
  }
}

export async function uploadFileToS3(file: Express.Multer.File, folder: string): Promise<string> {
  // Use local storage if S3 is not configured
  if (!isS3Configured()) {
    console.log('S3 not configured, using local file storage')
    return uploadFileLocally(file, folder)
  }

  const key = `${folder}/${Date.now()}-${file.originalname}`

  const params = {
    Bucket: process.env.AWS_S3_BUCKET || 'bdflathub-prod',
    Key: key,
    Body: file.buffer,
    ContentType: file.mimetype,
    ACL: 'public-read' as const,
  }

  try {
    const result = await s3.upload(params).promise()
    return result.Location
  } catch (error) {
    console.error('S3 upload error:', error)
    throw new Error('Failed to upload file to S3')
  }
}
