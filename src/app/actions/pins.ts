'use server'

import { createClient } from '@/lib/supabase/server'
import { cloudinaryConfig } from '@/lib/cloudinary'
import { redirect } from 'next/navigation'
import { UnsplashPhoto } from './unsplash'
import { GiphyImage } from './giphy'

// =====================================================
// TYPE DEFINITIONS
// =====================================================

export interface SaveUnsplashPinParams {
  unsplashPhoto: UnsplashPhoto
  boardId: string
  title?: string
  description?: string
}

export interface SaveGiphyPinParams {
  giphyImage: GiphyImage
  boardId: string
  title?: string
  description?: string
}

export interface SavePinResult {
  success: boolean
  pin?: {
    id: string
    title: string
    image_url: string
    created_by: string
  }
  error?: string
}

interface CloudinaryUploadResponse {
  secure_url: string
  width: number
  height: number
  public_id: string
  format: string
}

// =====================================================
// HELPER FUNCTIONS
// =====================================================

/**
 * Upload an image URL to Cloudinary
 */
async function uploadUrlToCloudinary(imageUrl: string): Promise<CloudinaryUploadResponse> {
  const timestamp = Math.round(Date.now() / 1000)
  const folder = 'pins'

  // Generate signature for upload
  const crypto = await import('crypto')
  const paramsToSign = `folder=${folder}&timestamp=${timestamp}${cloudinaryConfig.apiSecret}`
  const signature = crypto
    .createHash('sha1')
    .update(paramsToSign)
    .digest('hex')

  // Upload to Cloudinary
  const formData = new FormData()
  formData.append('file', imageUrl)
  formData.append('timestamp', timestamp.toString())
  formData.append('signature', signature)
  formData.append('api_key', cloudinaryConfig.apiKey)
  formData.append('folder', folder)

  const uploadUrl = `https://api.cloudinary.com/v1_1/${cloudinaryConfig.cloudName}/image/upload`

  const response = await fetch(uploadUrl, {
    method: 'POST',
    body: formData,
  })

  if (!response.ok) {
    const errorText = await response.text()
    console.error('Cloudinary upload failed:', {
      status: response.status,
      statusText: response.statusText,
      body: errorText,
    })
    throw new Error('Failed to upload image to Cloudinary')
  }

  return await response.json()
}

/**
 * Trigger download tracking on Unsplash (required by their API guidelines)
 */
async function triggerUnsplashDownload(photoId: string): Promise<void> {
  const accessKey = process.env.UNSPLASH_ACCESS_KEY

  if (!accessKey) {
    console.warn('UNSPLASH_ACCESS_KEY not configured, skipping download trigger')
    return
  }

  try {
    const url = `https://api.unsplash.com/photos/${photoId}/download`
    const response = await fetch(url, {
      headers: {
        'Authorization': `Client-ID ${accessKey}`,
      },
    })

    if (!response.ok) {
      console.warn('Failed to trigger Unsplash download tracking:', response.statusText)
    }
  } catch (error) {
    console.warn('Error triggering Unsplash download:', error)
  }
}

// =====================================================
// SERVER ACTIONS
// =====================================================

/**
 * Save an Unsplash photo as a pin
 * @param params - Parameters for saving the Unsplash pin
 * @returns Result indicating success or error
 */
export async function saveUnsplashPin(params: SaveUnsplashPinParams): Promise<SavePinResult> {
  try {
    // 1. Authenticate user
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      redirect('/login')
    }

    const { unsplashPhoto, boardId, title, description } = params

    // 2. Upload Unsplash image URL to Cloudinary
    console.log('Uploading Unsplash image to Cloudinary:', unsplashPhoto.url)
    const cloudinaryResult = await uploadUrlToCloudinary(unsplashPhoto.url)

    // 3. Trigger Unsplash download tracking (required by API guidelines)
    await triggerUnsplashDownload(unsplashPhoto.id)

    // 4. Create pin record in database
    const pinTitle = title || unsplashPhoto.alt || 'Untitled'
    const attribution = {
      photographer: unsplashPhoto.photographer,
      photographerUrl: unsplashPhoto.photographerUrl,
      unsplashUrl: unsplashPhoto.unsplashUrl,
    }

    const { data: pin, error: pinError } = await supabase
      .from('pins')
      .insert({
        title: pinTitle,
        description: description || null,
        image_url: cloudinaryResult.secure_url,
        image_width: cloudinaryResult.width,
        image_height: cloudinaryResult.height,
        source_url: unsplashPhoto.unsplashUrl,
        created_by: user.id,
        source: 'unsplash',
        attribution: attribution,
      })
      .select()
      .single()

    if (pinError) {
      console.error('Failed to create pin in database:', pinError)
      throw new Error(pinError.message)
    }

    if (!pin) {
      throw new Error('Failed to create pin')
    }

    // 5. Add pin to board
    const { error: boardPinError } = await supabase
      .from('board_pins')
      .insert({
        board_id: boardId,
        pin_id: pin.id,
      })

    if (boardPinError) {
      console.error('Failed to add pin to board:', boardPinError)
      // Rollback: delete the pin
      await supabase.from('pins').delete().eq('id', pin.id)
      throw new Error(`Failed to add pin to board: ${boardPinError.message}`)
    }

    console.log('Successfully saved Unsplash pin:', pin.id)

    return {
      success: true,
      pin: {
        id: pin.id,
        title: pin.title,
        image_url: pin.image_url,
        created_by: pin.created_by,
      },
    }
  } catch (error) {
    console.error('Error saving Unsplash pin:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to save pin',
    }
  }
}

/**
 * Save a Giphy GIF as a pin
 * @param params - Parameters for saving the Giphy pin
 * @returns Result indicating success or error
 */
export async function saveGiphyPin(params: SaveGiphyPinParams): Promise<SavePinResult> {
  try {
    // 1. Authenticate user
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      redirect('/login')
    }

    const { giphyImage, boardId, title, description } = params

    // 2. Upload Giphy GIF URL to Cloudinary
    console.log('Uploading Giphy GIF to Cloudinary:', giphyImage.images.original.url)
    const cloudinaryResult = await uploadUrlToCloudinary(giphyImage.images.original.url)

    // 3. Create pin record in database
    const pinTitle = title || giphyImage.title || 'Untitled GIF'
    const attribution = giphyImage.user
      ? {
          creator: giphyImage.user.display_name,
          creatorUrl: giphyImage.user.profile_url,
          giphyUrl: giphyImage.url,
        }
      : {
          giphyUrl: giphyImage.url,
        }

    const { data: pin, error: pinError } = await supabase
      .from('pins')
      .insert({
        title: pinTitle,
        description: description || null,
        image_url: cloudinaryResult.secure_url,
        image_width: cloudinaryResult.width,
        image_height: cloudinaryResult.height,
        source_url: giphyImage.url,
        created_by: user.id,
        source: 'giphy',
        attribution: attribution,
      })
      .select()
      .single()

    if (pinError) {
      console.error('Failed to create pin in database:', pinError)
      throw new Error(pinError.message)
    }

    if (!pin) {
      throw new Error('Failed to create pin')
    }

    // 4. Add pin to board
    const { error: boardPinError } = await supabase
      .from('board_pins')
      .insert({
        board_id: boardId,
        pin_id: pin.id,
      })

    if (boardPinError) {
      console.error('Failed to add pin to board:', boardPinError)
      // Rollback: delete the pin
      await supabase.from('pins').delete().eq('id', pin.id)
      throw new Error(`Failed to add pin to board: ${boardPinError.message}`)
    }

    console.log('Successfully saved Giphy pin:', pin.id)

    return {
      success: true,
      pin: {
        id: pin.id,
        title: pin.title,
        image_url: pin.image_url,
        created_by: pin.created_by,
      },
    }
  } catch (error) {
    console.error('Error saving Giphy pin:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to save pin',
    }
  }
}
