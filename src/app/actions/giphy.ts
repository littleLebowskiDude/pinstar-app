'use server';

/**
 * Giphy API integration for searching GIFs with age-appropriate content filtering
 * Uses 'g' and 'pg' ratings to ensure content is safe for users under 16
 */

export interface GiphyImage {
  id: string;
  title: string;
  url: string; // Giphy page URL
  images: {
    original: {
      url: string;
      width: string;
      height: string;
    };
    fixed_width: {
      url: string;
      width: string;
      height: string;
    };
  };
  user?: {
    display_name: string;
    profile_url: string;
  };
  rating: string;
}

interface GiphyApiResponse {
  data: Array<{
    id: string;
    title: string;
    url: string;
    images: {
      original: {
        url: string;
        width: string;
        height: string;
      };
      fixed_width: {
        url: string;
        width: string;
        height: string;
      };
    };
    user?: {
      display_name: string;
      profile_url: string;
    };
    rating: string;
  }>;
  pagination: {
    total_count: number;
    count: number;
    offset: number;
  };
}

const GIPHY_API_KEY = process.env.GIPHY_API_KEY;
const GIPHY_BASE_URL = 'https://api.giphy.com/v1/gifs';

/**
 * Search for GIFs on Giphy with content filtering for under-16 users
 * @param query - Search term
 * @param page - Page number (1-indexed)
 * @param perPage - Number of results per page (default: 20)
 * @returns Array of GiphyImage objects
 */
export async function searchGiphy(
  query: string,
  page: number = 1,
  perPage: number = 20
): Promise<GiphyImage[]> {
  if (!GIPHY_API_KEY) {
    console.error('GIPHY_API_KEY is not configured');
    return [];
  }

  if (!query || query.trim() === '') {
    console.error('Search query cannot be empty');
    return [];
  }

  try {
    const offset = (page - 1) * perPage;

    // Using 'g' and 'pg' ratings for age-appropriate content (under 16)
    // g: General Audiences
    // pg: Parental Guidance Suggested
    const url = new URL(`${GIPHY_BASE_URL}/search`);
    url.searchParams.set('api_key', GIPHY_API_KEY);
    url.searchParams.set('q', query.trim());
    url.searchParams.set('limit', perPage.toString());
    url.searchParams.set('offset', offset.toString());
    url.searchParams.set('rating', 'g'); // Only G-rated content for under 16
    url.searchParams.set('lang', 'en');

    const response = await fetch(url.toString(), {
      next: { revalidate: 3600 }, // Cache for 1 hour
    });

    if (!response.ok) {
      throw new Error(`Giphy API error: ${response.statusText}`);
    }

    const data: GiphyApiResponse = await response.json();

    return data.data.map((gif) => ({
      id: gif.id,
      title: gif.title || 'Untitled GIF',
      url: gif.url,
      images: gif.images,
      user: gif.user,
      rating: gif.rating,
    }));
  } catch (error) {
    console.error('Error fetching from Giphy:', error);
    return [];
  }
}

/**
 * Get trending GIFs from Giphy with content filtering
 * @param page - Page number (1-indexed)
 * @param perPage - Number of results per page (default: 20)
 * @returns Array of GiphyImage objects
 */
export async function getTrendingGiphy(
  page: number = 1,
  perPage: number = 20
): Promise<GiphyImage[]> {
  if (!GIPHY_API_KEY) {
    console.error('GIPHY_API_KEY is not configured');
    return [];
  }

  try {
    const offset = (page - 1) * perPage;

    const url = new URL(`${GIPHY_BASE_URL}/trending`);
    url.searchParams.set('api_key', GIPHY_API_KEY);
    url.searchParams.set('limit', perPage.toString());
    url.searchParams.set('offset', offset.toString());
    url.searchParams.set('rating', 'g'); // Only G-rated content for under 16

    const response = await fetch(url.toString(), {
      next: { revalidate: 3600 }, // Cache for 1 hour
    });

    if (!response.ok) {
      throw new Error(`Giphy API error: ${response.statusText}`);
    }

    const data: GiphyApiResponse = await response.json();

    return data.data.map((gif) => ({
      id: gif.id,
      title: gif.title || 'Untitled GIF',
      url: gif.url,
      images: gif.images,
      user: gif.user,
      rating: gif.rating,
    }));
  } catch (error) {
    console.error('Error fetching trending from Giphy:', error);
    return [];
  }
}
