'use client'

import { useRouter } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'

interface Pin {
  id: string
  title: string
  description: string | null
  image_url: string
  image_width: number | null
  image_height: number | null
  source_url: string | null
  created_by: string
  created_at: string
  rank: number
}

interface Board {
  id: string
  name: string
  description: string | null
  cover_image_url: string | null
  owner_id: string
  is_private: boolean
  created_at: string
  updated_at: string
  rank: number
}

interface SearchResultsProps {
  query: string
  pins: Pin[]
  boards: Board[]
  isLoading: boolean
  onClose: () => void
}

export default function SearchResults({
  query,
  pins,
  boards,
  isLoading,
  onClose,
}: SearchResultsProps) {
  const router = useRouter()

  const handleSeeAll = () => {
    router.push(`/search?q=${encodeURIComponent(query)}`)
    onClose()
  }

  const hasResults = pins.length > 0 || boards.length > 0

  if (isLoading) {
    return (
      <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-lg shadow-xl border border-gray-200 max-h-[500px] overflow-y-auto z-50">
        <div className="p-8 text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Searching...</p>
        </div>
      </div>
    )
  }

  if (!hasResults) {
    return (
      <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-lg shadow-xl border border-gray-200 max-h-[500px] overflow-y-auto z-50">
        <div className="p-8 text-center">
          <p className="text-gray-600">No results found for &quot;{query}&quot;</p>
        </div>
      </div>
    )
  }

  return (
    <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-lg shadow-xl border border-gray-200 max-h-[500px] overflow-y-auto z-50">
      {/* Pins Section */}
      {pins.length > 0 && (
        <div className="border-b border-gray-200">
          <div className="px-4 py-3 bg-gray-50">
            <h3 className="text-sm font-semibold text-gray-700">Pins</h3>
          </div>
          <div className="py-2">
            {pins.map((pin) => (
              <Link
                key={pin.id}
                href={`/?pin=${pin.id}`}
                onClick={onClose}
                className="flex items-center gap-3 px-4 py-2 hover:bg-gray-50 transition-colors"
              >
                <div className="relative w-12 h-12 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0">
                  <Image
                    src={pin.image_url}
                    alt={pin.title}
                    fill
                    className="object-cover"
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">
                    {pin.title}
                  </p>
                  {pin.description && (
                    <p className="text-xs text-gray-500 truncate">
                      {pin.description}
                    </p>
                  )}
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* Boards Section */}
      {boards.length > 0 && (
        <div className="border-b border-gray-200">
          <div className="px-4 py-3 bg-gray-50">
            <h3 className="text-sm font-semibold text-gray-700">Boards</h3>
          </div>
          <div className="py-2">
            {boards.map((board) => (
              <Link
                key={board.id}
                href={`/boards/${board.id}`}
                onClick={onClose}
                className="flex items-center gap-3 px-4 py-2 hover:bg-gray-50 transition-colors"
              >
                <div className="relative w-12 h-12 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0">
                  {board.cover_image_url ? (
                    <Image
                      src={board.cover_image_url}
                      alt={board.name}
                      fill
                      className="object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-red-400 to-red-600">
                      <svg
                        className="w-6 h-6 text-white"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
                        />
                      </svg>
                    </div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">
                    {board.name}
                  </p>
                  {board.description && (
                    <p className="text-xs text-gray-500 truncate">
                      {board.description}
                    </p>
                  )}
                </div>
                {board.is_private && (
                  <svg
                    className="w-4 h-4 text-gray-400 flex-shrink-0"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                    />
                  </svg>
                )}
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* See All Results */}
      <div className="px-4 py-3">
        <button
          onClick={handleSeeAll}
          className="w-full text-center text-sm font-medium text-red-600 hover:text-red-700 transition-colors"
        >
          See all results for &quot;{query}&quot;
        </button>
      </div>
    </div>
  )
}
