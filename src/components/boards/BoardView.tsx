'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { trpc } from '@/lib/trpc/client'
import PinGridWithModal from '@/components/pins/PinGridWithModal'
import { Pin } from '@/lib/mock-data'

interface BoardViewProps {
  boardId: string
  initialBoard: any
}

export default function BoardView({ boardId, initialBoard }: BoardViewProps) {
  const router = useRouter()
  const [isEditing, setIsEditing] = useState(false)
  const [editData, setEditData] = useState({
    name: initialBoard.name,
    description: initialBoard.description || '',
    isPrivate: initialBoard.is_private,
  })

  const { data: board } = trpc.boards.getById.useQuery(
    { id: boardId },
    { initialData: initialBoard }
  )

  const updateBoard = trpc.boards.update.useMutation({
    onSuccess: () => {
      setIsEditing(false)
      router.refresh()
    },
  })

  const deleteBoard = trpc.boards.delete.useMutation({
    onSuccess: () => {
      router.push('/boards')
      router.refresh()
    },
  })

  const handleUpdate = async () => {
    await updateBoard.mutateAsync({
      id: boardId,
      name: editData.name,
      description: editData.description,
      isPrivate: editData.isPrivate,
    })
  }

  const handleDelete = () => {
    if (confirm(`Are you sure you want to delete "${board.name}"? This action cannot be undone.`)) {
      deleteBoard.mutate({ id: boardId })
    }
  }

  // Transform board pins to Pin format
  const pins: Pin[] = board?.board_pins?.map((bp: any) => ({
    id: bp.pins?.id || '',  // Keep UUID as string
    title: bp.pins?.title || '',
    description: bp.pins?.description,
    imageUrl: bp.pins?.image_url || '',
    width: bp.pins?.image_width || 400,
    height: bp.pins?.image_height || 400,
    sourceUrl: bp.pins?.source_url,
    source: bp.pins?.source,
    attribution: bp.pins?.attribution,
  })).filter((pin: Pin) => pin.imageUrl && pin.id) || []

  return (
    <div>
      {/* Board Header */}
      <div className="mb-8">
        <div className="flex items-start justify-between gap-4 mb-4">
          <div className="flex-1">
            {isEditing ? (
              <div className="space-y-4">
                <input
                  type="text"
                  value={editData.name}
                  onChange={(e) => setEditData({ ...editData, name: e.target.value })}
                  className="text-3xl font-bold text-gray-900 dark:text-white border-b-2 border-red-600 focus:outline-none w-full dark:bg-transparent"
                  maxLength={100}
                />
                <textarea
                  value={editData.description}
                  onChange={(e) => setEditData({ ...editData, description: e.target.value })}
                  placeholder="Board description..."
                  className="text-gray-600 dark:text-gray-300 border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-red-500 w-full dark:bg-gray-800 dark:placeholder-gray-500"
                  rows={2}
                  maxLength={500}
                />
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={editData.isPrivate}
                    onChange={(e) => setEditData({ ...editData, isPrivate: e.target.checked })}
                    className="w-4 h-4 text-red-600 border-gray-300 dark:border-gray-600 rounded focus:ring-red-500"
                  />
                  <span className="text-sm text-gray-700 dark:text-gray-300">Private board</span>
                </label>
              </div>
            ) : (
              <>
                <div className="flex items-center gap-3 mb-2">
                  <h1 className="text-3xl font-bold text-gray-900">
                    {board.name}
                  </h1>
                  {board.is_private && (
                    <svg
                      className="w-6 h-6 text-gray-500"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                      />
                    </svg>
                  )}
                </div>
                {board.description && (
                  <p className="text-gray-600 mb-2">{board.description}</p>
                )}
                <p className="text-sm text-gray-500">
                  {pins.length} {pins.length === 1 ? 'pin' : 'pins'}
                </p>
              </>
            )}
          </div>

          <div className="flex items-center gap-2">
            {isEditing ? (
              <>
                <button
                  onClick={() => {
                    setIsEditing(false)
                    setEditData({
                      name: board.name,
                      description: board.description || '',
                      isPrivate: board.is_private,
                    })
                  }}
                  className="px-4 py-2 text-gray-700 font-semibold hover:bg-gray-100 rounded-full transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleUpdate}
                  disabled={updateBoard.isPending || !editData.name.trim()}
                  className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white font-semibold rounded-full transition-colors disabled:opacity-50"
                >
                  {updateBoard.isPending ? 'Saving...' : 'Save'}
                </button>
              </>
            ) : (
              <>
                <button
                  onClick={() => setIsEditing(true)}
                  className="px-4 py-2 text-gray-700 font-semibold hover:bg-gray-100 rounded-full transition-colors"
                >
                  Edit
                </button>
                <button
                  onClick={handleDelete}
                  disabled={deleteBoard.isPending}
                  className="px-4 py-2 text-red-600 font-semibold hover:bg-red-50 rounded-full transition-colors disabled:opacity-50"
                >
                  {deleteBoard.isPending ? 'Deleting...' : 'Delete'}
                </button>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Pins Grid */}
      {pins.length > 0 ? (
        <PinGridWithModal pins={pins} />
      ) : (
        <div className="text-center py-20">
          <svg
            className="mx-auto w-16 h-16 text-gray-300 mb-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
            />
          </svg>
          <h3 className="text-lg font-semibold text-gray-700 mb-2">No pins yet</h3>
          <p className="text-sm text-gray-500">
            Start adding pins to this board
          </p>
        </div>
      )}
    </div>
  )
}
