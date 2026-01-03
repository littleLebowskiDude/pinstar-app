'use client'

import { useState, useEffect } from 'react'
import { getPopularPhotos, searchPhotos, UnsplashPhoto } from '@/app/actions/unsplash'
import UnsplashPhotoCard from '@/components/unsplash/UnsplashPhotoCard'
import SaveUnsplashToBoardModal from '@/components/unsplash/SaveUnsplashToBoardModal'
import { MasonryGridSkeleton } from '@/components/ui/Skeleton'
import { useToast } from '@/components/ui/ToastContext'

export default function DiscoverPage() {
  const [photos, setPhotos] = useState<UnsplashPhoto[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isSearching, setIsSearching] = useState(false)
  const [query, setQuery] = useState('')
  const [searchQuery, setSearchQuery] = useState('')
  const [page, setPage] = useState(1)
  const [isLoadingMore, setIsLoadingMore] = useState(false)
  const [showSaveModal, setShowSaveModal] = useState(false)
  const [selectedPhoto, setSelectedPhoto] = useState<UnsplashPhoto | null>(null)
  const [savedPhotoIds, setSavedPhotoIds] = useState<Set<string>>(new Set())

  const { error: showError } = useToast()

  // Load initial popular photos
  useEffect(() => {
    loadPhotos()
  }, [])

  // Debounced search effect
  useEffect(() => {
    // Skip on initial load
    if (isLoading && photos.length === 0) return

    const debounceTimer = setTimeout(() => {
      performSearch()
    }, 300)

    return () => clearTimeout(debounceTimer)
  }, [query])

  const loadPhotos = async () => {
    setIsLoading(true)
    try {
      const results = await getPopularPhotos(1, 20)
      setPhotos(results)
      setPage(1)
      setSearchQuery('')
    } catch (err) {
      console.error('Error loading photos:', err)
      showError('Failed to load photos')
    } finally {
      setIsLoading(false)
    }
  }

  // Perform search (called by debounced effect)
  const performSearch = async () => {
    if (!query.trim()) {
      // Empty query - load popular photos
      setIsSearching(true)
      try {
        const results = await getPopularPhotos(1, 20)
        setPhotos(results)
        setPage(1)
        setSearchQuery('')
      } catch (err) {
        console.error('Error loading photos:', err)
        showError('Failed to load photos')
      } finally {
        setIsSearching(false)
      }
      return
    }

    // Search with query
    setIsSearching(true)
    try {
      const results = await searchPhotos(query.trim(), 1, 20)
      setPhotos(results)
      setPage(1)
      setSearchQuery(query.trim())
    } catch (err) {
      console.error('Error searching photos:', err)
      showError('Failed to search photos')
    } finally {
      setIsSearching(false)
    }
  }

  // Handle search form submit (immediate search)
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    performSearch()
  }

  // Handle clear search
  const handleClearSearch = () => {
    setQuery('')
    // performSearch will be called by the useEffect
  }

  // Handle load more
  const handleLoadMore = async () => {
    setIsLoadingMore(true)
    try {
      const nextPage = page + 1
      const results = searchQuery
        ? await searchPhotos(searchQuery, nextPage, 20)
        : await getPopularPhotos(nextPage, 20)

      setPhotos([...photos, ...results])
      setPage(nextPage)
    } catch (err) {
      console.error('Error loading more photos:', err)
      showError('Failed to load more photos')
    } finally {
      setIsLoadingMore(false)
    }
  }

  // Handle save photo
  const handleSavePhoto = (photo: UnsplashPhoto) => {
    setSelectedPhoto(photo)
    setShowSaveModal(true)
  }

  // Handle close modal
  const handleCloseModal = () => {
    setShowSaveModal(false)
    setSelectedPhoto(null)
  }

  // Handle successful save
  const handleSaveSuccess = (photoId: string) => {
    setSavedPhotoIds((prev) => new Set(prev).add(photoId))
  }

  return (
    <div className="max-w-[1260px] mx-auto px-4 py-8">
      {/* Search Bar */}
      <div className="mb-8">
        <form onSubmit={handleSearch} className="relative max-w-2xl mx-auto">
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search for images..."
            className="w-full px-4 py-3 pl-12 pr-12 text-gray-900 placeholder-gray-500 bg-white border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all shadow-sm"
          />

          {/* Search Icon */}
          <svg
            className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            />
          </svg>

          {/* Loading Spinner or Clear Button */}
          <div className="absolute right-4 top-1/2 transform -translate-y-1/2">
            {isSearching ? (
              <div className="animate-spin rounded-full h-5 w-5 border-2 border-gray-300 border-t-red-600" />
            ) : query.trim() ? (
              <button
                type="button"
                onClick={handleClearSearch}
                className="text-gray-400 hover:text-gray-600 transition-colors"
                aria-label="Clear search"
              >
                <svg
                  className="w-5 h-5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            ) : null}
          </div>
        </form>
      </div>

      {/* Page Title */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          {searchQuery ? `Search results for "${searchQuery}"` : 'Discover'}
        </h1>
        <p className="text-gray-600">
          {searchQuery
            ? `${photos.length} photos found`
            : 'Popular photos from Unsplash'}
        </p>
      </div>

      {/* Loading State */}
      {(isLoading || (isSearching && photos.length === 0)) && (
        <MasonryGridSkeleton count={12} />
      )}

      {/* Photos Grid */}
      {!isLoading && photos.length > 0 && (
        <>
          <div className="columns-2 sm:columns-3 md:columns-4 lg:columns-5 gap-4">
            {photos.map((photo) => (
              <UnsplashPhotoCard
                key={photo.id}
                photo={photo}
                onSave={handleSavePhoto}
                isSaved={savedPhotoIds.has(photo.id)}
              />
            ))}
          </div>

          {/* Load More Button */}
          <div className="mt-8 text-center">
            <button
              onClick={handleLoadMore}
              disabled={isLoadingMore}
              className="px-6 py-3 bg-red-600 hover:bg-red-700 text-white font-semibold rounded-full shadow-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoadingMore ? 'Loading...' : 'Load More'}
            </button>
          </div>
        </>
      )}

      {/* Empty State */}
      {!isLoading && !isSearching && photos.length === 0 && (
        <div className="text-center py-20">
          <svg
            className="mx-auto h-12 w-12 text-gray-400"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
          <h3 className="mt-4 text-lg font-medium text-gray-900">No results found</h3>
          <p className="mt-2 text-sm text-gray-500">
            {searchQuery
              ? 'Try searching with different keywords'
              : 'Unable to load photos at this time'}
          </p>
        </div>
      )}

      {/* Save to Board Modal */}
      <SaveUnsplashToBoardModal
        isOpen={showSaveModal}
        onClose={handleCloseModal}
        photo={selectedPhoto}
        onSuccess={handleSaveSuccess}
      />
    </div>
  )
}
