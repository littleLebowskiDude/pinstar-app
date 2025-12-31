'use client'

import { useState } from 'react'
import { useSearchParams } from 'next/navigation'
import { trpc } from '@/lib/trpc/client'
import MasonryGrid from '@/components/pins/MasonryGrid'
import PinCard from '@/components/pins/PinCard'
import BoardCard from '@/components/boards/BoardCard'

export default function SearchPage() {
  const searchParams = useSearchParams()
  const query = searchParams.get('q') || ''
  const [activeTab, setActiveTab] = useState<'pins' | 'boards'>('pins')

  // Fetch search results
  const { data: pinResults, isLoading: pinsLoading } = trpc.search.pins.useQuery(
    { query, limit: 50 },
    { enabled: query.length > 0 }
  )

  const { data: boardResults, isLoading: boardsLoading } =
    trpc.search.boards.useQuery(
      { query, limit: 50 },
      { enabled: query.length > 0 }
    )

  const isLoading = activeTab === 'pins' ? pinsLoading : boardsLoading
  const pins = pinResults || []
  const boards = boardResults || []

  if (!query) {
    return (
      <div className="max-w-[1260px] mx-auto px-4 py-12">
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
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            />
          </svg>
          <h3 className="mt-4 text-lg font-medium text-gray-900">
            Enter a search query
          </h3>
          <p className="mt-2 text-sm text-gray-500">
            Use the search bar above to find pins and boards
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-[1260px] mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Search results for &quot;{query}&quot;
        </h1>
        <p className="text-gray-600">
          {activeTab === 'pins'
            ? `${pins.length} pins found`
            : `${boards.length} boards found`}
        </p>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200 mb-8">
        <nav className="-mb-px flex space-x-8">
          <button
            onClick={() => setActiveTab('pins')}
            className={`
              py-4 px-1 border-b-2 font-medium text-sm transition-colors
              ${
                activeTab === 'pins'
                  ? 'border-red-600 text-red-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }
            `}
          >
            Pins
            <span className="ml-2 py-0.5 px-2 rounded-full text-xs bg-gray-100 text-gray-600">
              {pins.length}
            </span>
          </button>
          <button
            onClick={() => setActiveTab('boards')}
            className={`
              py-4 px-1 border-b-2 font-medium text-sm transition-colors
              ${
                activeTab === 'boards'
                  ? 'border-red-600 text-red-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }
            `}
          >
            Boards
            <span className="ml-2 py-0.5 px-2 rounded-full text-xs bg-gray-100 text-gray-600">
              {boards.length}
            </span>
          </button>
        </nav>
      </div>

      {/* Loading State */}
      {isLoading && (
        <div className="text-center py-20">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Searching...</p>
        </div>
      )}

      {/* Pins Tab */}
      {!isLoading && activeTab === 'pins' && (
        <>
          {pins.length > 0 ? (
            <MasonryGrid
              pins={pins.map((pin) => ({
                id: parseInt(pin.id) || 0,
                title: pin.title,
                description: pin.description || undefined,
                imageUrl: pin.image_url,
                width: pin.image_width || 400,
                height: pin.image_height || 600,
                sourceUrl: pin.source_url || undefined,
                userId: pin.created_by,
                createdAt: new Date(pin.created_at),
              }))}
            />
          ) : (
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
                No pins found
              </h3>
              <p className="mt-2 text-sm text-gray-500">
                Try searching with different keywords
              </p>
            </div>
          )}
        </>
      )}

      {/* Boards Tab */}
      {!isLoading && activeTab === 'boards' && (
        <>
          {boards.length > 0 ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
              {boards.map((board) => (
                <BoardCard
                  key={board.id}
                  board={{
                    id: board.id,
                    name: board.name,
                    description: board.description || undefined,
                    cover_image_url: board.cover_image_url || undefined,
                    is_private: board.is_private,
                    board_pins: [],
                  }}
                />
              ))}
            </div>
          ) : (
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
                No boards found
              </h3>
              <p className="mt-2 text-sm text-gray-500">
                Try searching with different keywords
              </p>
            </div>
          )}
        </>
      )}
    </div>
  )
}
