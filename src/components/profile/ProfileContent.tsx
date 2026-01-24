'use client'

import { useState } from 'react'
import { User } from '@supabase/supabase-js'
import { trpc } from '@/lib/trpc/client'
import PinGridWithModal from '@/components/pins/PinGridWithModal'
import BoardCard from '@/components/boards/BoardCard'
import { MasonryGridSkeleton, BoardsGridSkeleton } from '@/components/ui/Skeleton'
import { NoPinsEmptyState, NoBoardsEmptyState } from '@/components/ui/EmptyState'

interface ProfileContentProps {
  user: User
}

type Tab = 'pins' | 'boards'

export default function ProfileContent({ user }: ProfileContentProps) {
  const [activeTab, setActiveTab] = useState<Tab>('pins')

  const { data: pins = [], isLoading: pinsLoading } = trpc.pins.getAll.useQuery(
    { limit: 100 },
    { enabled: activeTab === 'pins' }
  )

  const { data: boards = [], isLoading: boardsLoading } = trpc.boards.getMyBoards.useQuery(
    undefined,
    { enabled: activeTab === 'boards' }
  )

  // Transform pins for display
  const transformedPins = pins.map((pin: any) => ({
    id: pin.id,
    title: pin.title,
    description: pin.description,
    imageUrl: pin.image_url,
    width: pin.image_width,
    height: pin.image_height,
    userId: pin.created_by,
    sourceUrl: pin.source_url,
    createdAt: new Date(pin.created_at),
  }))

  return (
    <div className="max-w-[1260px] mx-auto px-4 py-8">
      {/* Profile Header */}
      <div className="bg-white rounded-3xl shadow-sm border border-gray-200 p-8 mb-8">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-6">
            {/* Avatar */}
            <div className="w-24 h-24 rounded-full bg-gradient-to-br from-red-500 to-red-600 flex items-center justify-center text-white text-3xl font-bold shadow-lg">
              {user.email?.[0].toUpperCase() || 'U'}
            </div>

            {/* User Info */}
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                {user.user_metadata?.full_name || user.email?.split('@')[0] || 'User'}
              </h1>
              <p className="text-gray-600 mb-4">{user.email}</p>
              <div className="flex items-center gap-6 text-sm text-gray-600">
                <div>
                  <span className="font-semibold text-gray-900">{pins.length}</span> Pins
                </div>
                <div>
                  <span className="font-semibold text-gray-900">{boards.length}</span> Boards
                </div>
              </div>
            </div>
          </div>

          {/* Edit Profile Button */}
          <button className="px-6 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold rounded-full transition-colors">
            Edit Profile
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 mb-8 border-b border-gray-200">
        <button
          onClick={() => setActiveTab('pins')}
          className={`px-6 py-3 font-semibold transition-colors relative ${
            activeTab === 'pins'
              ? 'text-red-600'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          Pins
          {activeTab === 'pins' && (
            <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-red-600" />
          )}
        </button>
        <button
          onClick={() => setActiveTab('boards')}
          className={`px-6 py-3 font-semibold transition-colors relative ${
            activeTab === 'boards'
              ? 'text-red-600'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          Boards
          {activeTab === 'boards' && (
            <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-red-600" />
          )}
        </button>
      </div>

      {/* Content */}
      {activeTab === 'pins' && (
        <>
          {pinsLoading ? (
            <MasonryGridSkeleton count={12} />
          ) : transformedPins.length === 0 ? (
            <NoPinsEmptyState />
          ) : (
            <PinGridWithModal pins={transformedPins} />
          )}
        </>
      )}

      {activeTab === 'boards' && (
        <>
          {boardsLoading ? (
            <BoardsGridSkeleton count={9} />
          ) : boards.length === 0 ? (
            <NoBoardsEmptyState />
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {boards.map((board: any) => (
                <BoardCard key={board.id} board={board} />
              ))}
            </div>
          )}
        </>
      )}
    </div>
  )
}
