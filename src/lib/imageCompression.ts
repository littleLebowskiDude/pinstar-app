import { MAX_IMAGE_WIDTH, MAX_IMAGE_HEIGHT, MAX_FILE_SIZE } from './cloudinary'

export interface CompressedImage {
  file: File
  width: number
  height: number
  preview: string
}

/**
 * Compress an image file to meet size and dimension requirements
 */
export async function compressImage(file: File): Promise<CompressedImage> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()

    reader.onload = (e) => {
      const img = new Image()

      img.onload = () => {
        const canvas = document.createElement('canvas')
        const ctx = canvas.getContext('2d')

        if (!ctx) {
          reject(new Error('Failed to get canvas context'))
          return
        }

        // Calculate new dimensions while maintaining aspect ratio
        let { width, height } = img
        const aspectRatio = width / height

        // Resize if exceeds max dimensions
        if (width > MAX_IMAGE_WIDTH || height > MAX_IMAGE_HEIGHT) {
          if (width > height) {
            width = MAX_IMAGE_WIDTH
            height = Math.round(width / aspectRatio)
          } else {
            height = MAX_IMAGE_HEIGHT
            width = Math.round(height * aspectRatio)
          }
        }

        canvas.width = width
        canvas.height = height

        // Draw image on canvas
        ctx.drawImage(img, 0, 0, width, height)

        // Start with quality 0.9 and reduce if file is too large
        let quality = 0.9
        const compressAndCheck = () => {
          canvas.toBlob(
            (blob) => {
              if (!blob) {
                reject(new Error('Failed to compress image'))
                return
              }

              // If file is still too large and quality can be reduced further
              if (blob.size > MAX_FILE_SIZE && quality > 0.5) {
                quality -= 0.1
                compressAndCheck()
                return
              }

              // Create new file from blob
              const compressedFile = new File([blob], file.name, {
                type: 'image/jpeg',
                lastModified: Date.now(),
              })

              // Create preview URL
              const preview = URL.createObjectURL(blob)

              resolve({
                file: compressedFile,
                width,
                height,
                preview,
              })
            },
            'image/jpeg',
            quality
          )
        }

        compressAndCheck()
      }

      img.onerror = () => {
        reject(new Error('Failed to load image'))
      }

      img.src = e.target?.result as string
    }

    reader.onerror = () => {
      reject(new Error('Failed to read file'))
    }

    reader.readAsDataURL(file)
  })
}

/**
 * Validate image file type
 */
export function isValidImageFile(file: File): boolean {
  const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif']
  return validTypes.includes(file.type)
}

/**
 * Format file size for display
 */
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes'

  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))

  return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i]
}
