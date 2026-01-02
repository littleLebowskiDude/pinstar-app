'use server'

// =====================================================
// UNSPLASH API SERVER ACTIONS
// =====================================================
// Server actions for fetching photos from Unsplash API

// =====================================================
// TYPE DEFINITIONS
// =====================================================

export interface UnsplashPhoto {
  id: string
  url: string
  thumbUrl: string
  width: number
  height: number
  alt: string
  photographer: string
  photographerUrl: string
  unsplashUrl: string
}

interface UnsplashApiPhoto {
  id: string
  urls: {
    regular: string
    small: string
  }
  width: number
  height: number
  description: string | null
  alt_description: string | null
  user: {
    name: string
    links: {
      html: string
    }
  }
  links: {
    html: string
  }
}

interface UnsplashSearchResponse {
  results: UnsplashApiPhoto[]
  total: number
  total_pages: number
}

// =====================================================
// HELPER FUNCTIONS
// =====================================================

/**
 * Format Unsplash API photo to our UnsplashPhoto type
 */
function formatUnsplashPhoto(photo: UnsplashApiPhoto): UnsplashPhoto {
  return {
    id: photo.id,
    url: photo.urls.regular,
    thumbUrl: photo.urls.small,
    width: photo.width,
    height: photo.height,
    alt: photo.description || photo.alt_description || 'Unsplash photo',
    photographer: photo.user.name,
    photographerUrl: photo.user.links.html,
    unsplashUrl: photo.links.html,
  }
}

/**
 * Get Unsplash access key from environment
 */
function getUnsplashAccessKey(): string | undefined {
  return process.env.UNSPLASH_ACCESS_KEY
}

// =====================================================
// SERVER ACTIONS
// =====================================================

/**
 * Get popular photos from Unsplash
 * @param page - Page number (default: 1)
 * @param perPage - Number of photos per page (default: 20)
 * @returns Array of formatted Unsplash photos
 */
export async function getPopularPhotos(
  page: number = 1,
  perPage: number = 20
): Promise<UnsplashPhoto[]> {
  try {
    const accessKey = getUnsplashAccessKey()

    if (!accessKey) {
      console.error('Unsplash API: UNSPLASH_ACCESS_KEY is not configured')
      return []
    }

    const url = new URL('https://api.unsplash.com/photos')
    url.searchParams.set('order_by', 'popular')
    url.searchParams.set('page', page.toString())
    url.searchParams.set('per_page', perPage.toString())

    const response = await fetch(url.toString(), {
      headers: {
        'Authorization': `Client-ID ${accessKey}`,
        'Accept-Version': 'v1',
      },
      next: {
        revalidate: 3600, // Cache for 1 hour
      },
    })

    if (!response.ok) {
      const errorText = await response.text()

      // Handle rate limiting specifically
      if (response.status === 429) {
        console.error('Unsplash API rate limit exceeded. Demo tier allows 50 requests/hour.')
        console.error('Rate limit will reset in 1 hour. Consider upgrading for higher limits.')
      } else {
        console.error('Unsplash API error:', {
          status: response.status,
          statusText: response.statusText,
          body: errorText,
        })
      }

      return []
    }

    const photos: UnsplashApiPhoto[] = await response.json()
    return photos.map(formatUnsplashPhoto)
  } catch (error) {
    console.error('Failed to fetch popular photos from Unsplash:', error)
    return []
  }
}

/**
 * Search photos on Unsplash
 * @param query - Search query string
 * @param page - Page number (default: 1)
 * @param perPage - Number of photos per page (default: 20)
 * @returns Array of formatted Unsplash photos
 */
export async function searchPhotos(
  query: string,
  page: number = 1,
  perPage: number = 20
): Promise<UnsplashPhoto[]> {
  try {
    const accessKey = getUnsplashAccessKey()

    if (!accessKey) {
      console.error('Unsplash API: UNSPLASH_ACCESS_KEY is not configured')
      return []
    }

    if (!query || query.trim() === '') {
      console.error('Unsplash API: Search query is empty')
      return []
    }

    const url = new URL('https://api.unsplash.com/search/photos')
    url.searchParams.set('query', query.trim())
    url.searchParams.set('page', page.toString())
    url.searchParams.set('per_page', perPage.toString())

    const response = await fetch(url.toString(), {
      headers: {
        'Authorization': `Client-ID ${accessKey}`,
        'Accept-Version': 'v1',
      },
      next: {
        revalidate: 3600, // Cache for 1 hour
      },
    })

    if (!response.ok) {
      const errorText = await response.text()

      // Handle rate limiting specifically
      if (response.status === 429) {
        console.error('Unsplash API rate limit exceeded. Demo tier allows 50 requests/hour.')
        console.error('Rate limit will reset in 1 hour. Consider upgrading for higher limits.')
      } else {
        console.error('Unsplash API error:', {
          status: response.status,
          statusText: response.statusText,
          body: errorText,
        })
      }

      return []
    }

    const data: UnsplashSearchResponse = await response.json()
    return data.results.map(formatUnsplashPhoto)
  } catch (error) {
    console.error('Failed to search photos on Unsplash:', error)
    return []
  }
}
