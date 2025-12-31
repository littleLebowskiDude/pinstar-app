// Cloudinary configuration and utilities

export const cloudinaryConfig = {
  cloudName: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME!,
  apiKey: process.env.CLOUDINARY_API_KEY!,
  apiSecret: process.env.CLOUDINARY_API_SECRET!,
}

// Upload preset configuration (you'll need to create this in Cloudinary dashboard)
export const UPLOAD_PRESET = 'pinstar-pins' // Create this preset in Cloudinary

// Maximum image dimensions and file size
export const MAX_IMAGE_WIDTH = 1920
export const MAX_IMAGE_HEIGHT = 1920
export const MAX_FILE_SIZE = 1024 * 1024 // 1MB

// Generate upload signature for secure uploads
export async function generateUploadSignature(paramsToSign: Record<string, string | number>) {
  const crypto = await import('crypto')

  // Sort params alphabetically
  const sortedParams = Object.keys(paramsToSign)
    .sort()
    .map((key) => `${key}=${paramsToSign[key]}`)
    .join('&')

  const signatureString = `${sortedParams}${cloudinaryConfig.apiSecret}`

  // Create SHA-1 hash
  const signature = crypto
    .createHash('sha1')
    .update(signatureString)
    .digest('hex')

  return signature
}

// Get Cloudinary upload URL
export function getCloudinaryUploadUrl() {
  return `https://api.cloudinary.com/v1_1/${cloudinaryConfig.cloudName}/image/upload`
}

// Transform Cloudinary URL to get optimized version
export function getOptimizedImageUrl(publicId: string, options?: {
  width?: number
  height?: number
  quality?: number
  format?: string
}) {
  const { width, height, quality = 80, format = 'auto' } = options || {}

  let transformation = `f_${format},q_${quality}`
  if (width) transformation += `,w_${width}`
  if (height) transformation += `,h_${height}`

  return `https://res.cloudinary.com/${cloudinaryConfig.cloudName}/image/upload/${transformation}/${publicId}`
}
