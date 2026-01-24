'use client'

import { useState, useEffect } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { trpc } from '@/lib/trpc/client'
import { searchGiphy, GiphyImage } from '@/app/actions/giphy'
import { searchPhotos, UnsplashPhoto } from '@/app/actions/unsplash'
import GiphyPhotoCard from '@/components/giphy/GiphyPhotoCard'
import UnsplashPhotoCard from '@/components/unsplash/UnsplashPhotoCard'
import PinCard from '@/components/pins/PinCard'
import BoardCard from '@/components/boards/BoardCard'
import Carousel from '@/components/ui/Carousel'
import SaveGiphyToBoardModal from '@/components/giphy/SaveGiphyToBoardModal'
import SaveUnsplashToBoardModal from '@/components/unsplash/SaveUnsplashToBoardModal'
import { useToast } from '@/components/ui/ToastContext'

export default function SearchPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const queryParam = searchParams.get('q') || ''
  const [query, setQuery] = useState(queryParam)
  const { error: showError } = useToast()

  // State for external API results
  const [gifs, setGifs] = useState<GiphyImage[]>([])
  const [photos, setPhotos] = useState<UnsplashPhoto[]>([])
  const [isLoadingExternal, setIsLoadingExternal] = useState(false)

  // State for save modals
  const [showGiphySaveModal, setShowGiphySaveModal] = useState(false)
  const [showUnsplashSaveModal, setShowUnsplashSaveModal] = useState(false)
  const [selectedGif, setSelectedGif] = useState<GiphyImage | null>(null)
  const [selectedPhoto, setSelectedPhoto] = useState<UnsplashPhoto | null>(null)
  const [savedGifIds, setSavedGifIds] = useState<Set<string>>(new Set())
  const [savedPhotoIds, setSavedPhotoIds] = useState<Set<string>>(new Set())

  // Update local query state when URL query changes
  useEffect(() => {
    setQuery(queryParam)
  }, [queryParam])

  // Fetch external API results when query changes
  useEffect(() => {
    if (queryParam.trim()) {
      fetchExternalResults(queryParam.trim())
    } else {
      setGifs([])
      setPhotos([])
    }
  }, [queryParam])

  // Fetch search results from internal database
  const { data: pinResults, isLoading: pinsLoading } = trpc.search.pins.useQuery(
    { query: queryParam, limit: 50 },
    { enabled: queryParam.length > 0 }
  )

  const { data: boardResults, isLoading: boardsLoading } =
    trpc.search.boards.useQuery(
      { query: queryParam, limit: 50 },
      { enabled: queryParam.length > 0 }
    )

  const pins = pinResults || []
  const boards = boardResults || []

  // Fetch external API results
  const fetchExternalResults = async (searchQuery: string) => {
    setIsLoadingExternal(true)
    try {
      const [giphyResults, unsplashResults] = await Promise.all([
        searchGiphy(searchQuery, 1, 30),
        searchPhotos(searchQuery, 1, 30),
      ])

      setGifs(giphyResults)
      setPhotos(unsplashResults)
    } catch (err) {
      console.error('Error fetching external results:', err)
      showError('Failed to fetch some search results')
    } finally {
      setIsLoadingExternal(false)
    }
  }

  // Handle search submission
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (query.trim()) {
      router.push(`/search?q=${encodeURIComponent(query.trim())}`)
    }
  }

  // Handle input change
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setQuery(e.target.value)
  }

  // Handle save GIF
  const handleSaveGif = (gif: GiphyImage) => {
    setSelectedGif(gif)
    setShowGiphySaveModal(true)
  }

  // Handle save photo
  const handleSavePhoto = (photo: UnsplashPhoto) => {
    setSelectedPhoto(photo)
    setShowUnsplashSaveModal(true)
  }

  // Handle close modals
  const handleCloseGiphyModal = () => {
    setShowGiphySaveModal(false)
    setSelectedGif(null)
  }

  const handleCloseUnsplashModal = () => {
    setShowUnsplashSaveModal(false)
    setSelectedPhoto(null)
  }

  // Handle successful saves
  const handleGifSaveSuccess = (gifId: string) => {
    setSavedGifIds((prev) => new Set(prev).add(gifId))
  }

  const handlePhotoSaveSuccess = (photoId: string) => {
    setSavedPhotoIds((prev) => new Set(prev).add(photoId))
  }

  const isLoading = pinsLoading || boardsLoading || isLoadingExternal
  const totalResults = gifs.length + photos.length + pins.length + boards.length

  return (
    <div className="max-w-[1260px] mx-auto px-4 py-8">
      {/* Search Input */}
      <div className="mb-8">
        <form onSubmit={handleSearch} className="relative max-w-2xl mx-auto">
          <input
            type="text"
            value={query}
            onChange={handleInputChange}
            placeholder="Search for GIFs, photos, pins, and boards..."
            className="w-full px-4 py-3 pl-12 pr-4 text-gray-900 placeholder-gray-500 bg-white border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all shadow-sm"
            autoFocus
          />
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
        </form>
      </div>

      {/* Results Header */}
      {queryParam && (
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Search results for &quot;{queryParam}&quot;
          </h1>
          <p className="text-gray-600">
            {isLoading ? 'Searching...' : `${totalResults} results found`}
          </p>
        </div>
      )}

      {/* Loading State */}
      {queryParam && isLoading && totalResults === 0 && (
        <div className="text-center py-20">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Searching...</p>
        </div>
      )}

      {/* Results - Grouped by Type in Carousels */}
      {queryParam && !isLoading && totalResults > 0 && (
        <div className="space-y-8">
          {/* GIFs Carousel */}
          <Carousel title="GIFs" count={gifs.length}>
            {gifs.map((gif) => (
              <div key={gif.id} className="flex-none w-64">
                <GiphyPhotoCard
                  gif={gif}
                  onSave={handleSaveGif}
                  isSaved={savedGifIds.has(gif.id)}
                />
              </div>
            ))}
          </Carousel>

          {/* Photos Carousel */}
          <Carousel title="Photos" count={photos.length}>
            {photos.map((photo) => (
              <div key={photo.id} className="flex-none w-64">
                <UnsplashPhotoCard
                  photo={photo}
                  onSave={handleSavePhoto}
                  isSaved={savedPhotoIds.has(photo.id)}
                />
              </div>
            ))}
          </Carousel>

          {/* Pins Carousel */}
          <Carousel title="Your Pins" count={pins.length}>
            {pins.map((pin) => (
              <div key={pin.id} className="flex-none w-64">
                <PinCard
                  pin={{
                    id: pin.id,
                    title: pin.title,
                    description: pin.description || undefined,
                    imageUrl: pin.image_url,
                    width: pin.image_width || 400,
                    height: pin.image_height || 600,
                    sourceUrl: pin.source_url || undefined,
                    source: pin.source || undefined,
                    attribution: pin.attribution || undefined,
                    userId: pin.created_by,
                    createdAt: new Date(pin.created_at),
                  }}
                />
              </div>
            ))}
          </Carousel>

          {/* Boards Carousel */}
          <Carousel title="Your Boards" count={boards.length}>
            {boards.map((board) => (
              <div key={board.id} className="flex-none w-64">
                <BoardCard
                  board={{
                    id: board.id,
                    name: board.name,
                    description: board.description || undefined,
                    cover_image_url: board.cover_image_url || undefined,
                    is_private: board.is_private,
                    board_pins: [],
                  }}
                />
              </div>
            ))}
          </Carousel>
        </div>
      )}

      {/* Empty State */}
      {queryParam && !isLoading && totalResults === 0 && (
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
          <h3 className="mt-4 text-lg font-medium text-gray-900">
            No results found
          </h3>
          <p className="mt-2 text-sm text-gray-500">
            Try searching with different keywords
          </p>
        </div>
      )}

      {/* Save to Board Modals */}
      <SaveGiphyToBoardModal
        isOpen={showGiphySaveModal}
        onClose={handleCloseGiphyModal}
        gif={selectedGif}
        onSuccess={handleGifSaveSuccess}
      />

      <SaveUnsplashToBoardModal
        isOpen={showUnsplashSaveModal}
        onClose={handleCloseUnsplashModal}
        photo={selectedPhoto}
        onSuccess={handlePhotoSaveSuccess}
      />
    </div>
  )
}
