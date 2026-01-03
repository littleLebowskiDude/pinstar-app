'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { trpc } from '@/lib/trpc/client'
import { UnsplashPhoto } from '@/app/actions/unsplash'
import { saveUnsplashPin } from '@/app/actions/pins'
import CreateBoardModal from '@/components/boards/CreateBoardModal'
import { useToast } from '@/components/ui/ToastContext'
import Image from 'next/image'

interface SaveUnsplashToBoardModalProps {
  isOpen: boolean
  onClose: () => void
  photo: UnsplashPhoto | null
  onSuccess?: (photoId: string) => void
}

export default function SaveUnsplashToBoardModal({
  isOpen,
  onClose,
  photo,
  onSuccess,
}: SaveUnsplashToBoardModalProps) {
  const router = useRouter()
  const { success: showSuccess, error: showError } = useToast()
  const [isCreateBoardOpen, setIsCreateBoardOpen] = useState(false)
  const [selectedBoardId, setSelectedBoardId] = useState<string | null>(null)
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [isSaving, setIsSaving] = useState(false)

  const { data: boards = [], isLoading } = trpc.boards.getMyBoards.useQuery(undefined, {
    enabled: isOpen,
  })

  // Pre-fill title when photo changes
  useEffect(() => {
    if (photo) {
      setTitle(photo.alt || 'Untitled')
      setDescription('')
    }
  }, [photo])

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden'
      setSelectedBoardId(null)
    } else {
      document.body.style.overflow = 'unset'
    }

    return () => {
      document.body.style.overflow = 'unset'
    }
  }, [isOpen])

  // Handle ESC key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen && !isSaving) {
        onClose()
      }
    }

    document.addEventListener('keydown', handleEscape)
    return () => document.removeEventListener('keydown', handleEscape)
  }, [isOpen, isSaving, onClose])

  const handleSaveToBoard = async (boardId: string) => {
    if (!photo) return

    setSelectedBoardId(boardId)
    setIsSaving(true)

    try {
      const result = await saveUnsplashPin({
        unsplashPhoto: photo,
        boardId,
        title: title.trim() || undefined,
        description: description.trim() || undefined,
      })

      if (result.success) {
        const board = boards.find((b: any) => b.id === boardId)
        showSuccess(`Saved to ${board?.name || 'board'}!`)
        router.refresh()
        if (onSuccess) {
          onSuccess(photo.id)
        }
        onClose()
      } else {
        showError(result.error || 'Failed to save photo')
      }
    } catch (error) {
      console.error('Error saving photo:', error)
      showError('Failed to save photo')
    } finally {
      setIsSaving(false)
      setSelectedBoardId(null)
    }
  }

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget && !isSaving) {
      onClose()
    }
  }

  const handleCreateBoardSuccess = async (boardId: string) => {
    setIsCreateBoardOpen(false)
    // Automatically save to the newly created board
    await handleSaveToBoard(boardId)
  }

  if (!isOpen || !photo) return null

  return (
    <>
      <div
        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn"
        onClick={handleBackdropClick}
      >
        <div className="relative bg-white dark:bg-gray-900 rounded-3xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden flex flex-col animate-scaleIn">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Save to Board</h2>
            <button
              onClick={onClose}
              disabled={isSaving}
              className="w-10 h-10 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-full flex items-center justify-center transition-colors disabled:opacity-50"
              aria-label="Close"
            >
              <svg className="w-6 h-6 text-gray-700 dark:text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto p-6">
            {/* Photo Preview */}
            <div className="mb-6">
              <div className="relative rounded-xl overflow-hidden bg-gray-100 dark:bg-gray-800">
                <Image
                  src={photo.thumbUrl}
                  alt={photo.alt}
                  width={photo.width}
                  height={photo.height}
                  className="w-full h-auto max-h-64 object-contain"
                  unoptimized
                />
              </div>
              {/* Attribution */}
              <div className="mt-2 text-xs text-gray-600 dark:text-gray-400">
                Photo by{' '}
                <a
                  href={photo.photographerUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-red-600 hover:underline"
                >
                  {photo.photographer}
                </a>{' '}
                on{' '}
                <a
                  href={photo.unsplashUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-red-600 hover:underline"
                >
                  Unsplash
                </a>
              </div>
            </div>

            {/* Title Input */}
            <div className="mb-4">
              <label htmlFor="pin-title" className="block text-sm font-semibold text-gray-700 dark:text-gray-200 mb-2">
                Title
              </label>
              <input
                id="pin-title"
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Add a title..."
                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-none transition-all dark:bg-gray-700 dark:text-white dark:placeholder-gray-400"
                maxLength={200}
              />
            </div>

            {/* Description Input */}
            <div className="mb-6">
              <label htmlFor="pin-description" className="block text-sm font-semibold text-gray-700 dark:text-gray-200 mb-2">
                Description (optional)
              </label>
              <textarea
                id="pin-description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Add a description..."
                rows={3}
                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-none transition-all resize-none dark:bg-gray-700 dark:text-white dark:placeholder-gray-400"
                maxLength={1000}
              />
            </div>

            {/* Boards List */}
            <div>
              <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-200 mb-3">Select a board</h3>
              {isLoading ? (
                <div className="flex items-center justify-center py-8">
                  <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-red-600 border-r-transparent"></div>
                </div>
              ) : boards.length === 0 ? (
                <div className="text-center py-8 bg-gray-50 dark:bg-gray-800 rounded-xl">
                  <svg
                    className="mx-auto w-12 h-12 text-gray-300 dark:text-gray-600 mb-3"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={1.5}
                      d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
                    />
                  </svg>
                  <p className="text-gray-600 dark:text-gray-300 text-sm">You don't have any boards yet</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Create a board to save this photo</p>
                </div>
              ) : (
                <div className="space-y-2 max-h-60 overflow-y-auto">
                  {boards.map((board: any) => (
                    <button
                      key={board.id}
                      onClick={() => handleSaveToBoard(board.id)}
                      disabled={isSaving}
                      className={`w-full flex items-center justify-between p-3 rounded-xl border-2 transition-all ${
                        selectedBoardId === board.id && isSaving
                          ? 'border-red-600 bg-red-50 dark:bg-red-900/20'
                          : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-800'
                      } disabled:opacity-50`}
                    >
                      <div className="flex items-center gap-3 flex-1 text-left">
                        <div className="w-10 h-10 rounded-lg bg-gray-200 dark:bg-gray-700 flex-shrink-0 overflow-hidden">
                          {board.board_pins?.[0]?.pins?.image_url ? (
                            <img
                              src={board.board_pins[0].pins.image_url}
                              alt=""
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center">
                              <svg
                                className="w-5 h-5 text-gray-400 dark:text-gray-500"
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
                            </div>
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-semibold text-gray-900 dark:text-white truncate text-sm">
                            {board.name}
                          </p>
                          <p className="text-xs text-gray-500 dark:text-gray-400">
                            {board.board_pins?.[0]?.count || 0} pins
                          </p>
                        </div>
                      </div>
                      {selectedBoardId === board.id && isSaving && (
                        <div className="w-5 h-5 animate-spin rounded-full border-2 border-solid border-red-600 border-r-transparent"></div>
                      )}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Create New Board Button */}
          <div className="p-6 border-t border-gray-200 dark:border-gray-700">
            <button
              onClick={() => setIsCreateBoardOpen(true)}
              disabled={isSaving}
              className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-200 font-semibold rounded-xl transition-colors disabled:opacity-50"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 4v16m8-8H4"
                />
              </svg>
              Create New Board
            </button>
          </div>
        </div>
      </div>

      {/* Create Board Modal */}
      <CreateBoardModal
        isOpen={isCreateBoardOpen}
        onClose={() => setIsCreateBoardOpen(false)}
        onSuccess={handleCreateBoardSuccess}
      />
    </>
  )
}
