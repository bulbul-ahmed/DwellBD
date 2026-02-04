import AWS from 'aws-sdk'

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

export async function uploadFileToS3(file: Express.Multer.File, folder: string): Promise<string> {
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

export async function deleteFileFromS3(fileUrl: string): Promise<void> {
  try {
    const url = new URL(fileUrl)
    const key = url.pathname.slice(1)

    const params = {
      Bucket: process.env.AWS_S3_BUCKET || 'bdflathub-prod',
      Key: key,
    }

    await s3.deleteObject(params).promise()
  } catch (error) {
    console.error('S3 delete error:', error)
    throw new Error('Failed to delete file from S3')
  }
}
