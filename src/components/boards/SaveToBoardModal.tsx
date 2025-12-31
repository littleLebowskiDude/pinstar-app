'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { trpc } from '@/lib/trpc/client'
import CreateBoardModal from './CreateBoardModal'
import { useToast } from '@/components/ui/ToastContext'

interface SaveToBoardModalProps {
  isOpen: boolean
  onClose: () => void
  pinId: string
}

export default function SaveToBoardModal({ isOpen, onClose, pinId }: SaveToBoardModalProps) {
  const router = useRouter()
  const { success, error: showError, info } = useToast()
  const [isCreateBoardOpen, setIsCreateBoardOpen] = useState(false)
  const [selectedBoardId, setSelectedBoardId] = useState<string | null>(null)

  const { data: boards = [], isLoading } = trpc.boards.getMyBoards.useQuery(undefined, {
    enabled: isOpen,
  })

  const addPinToBoard = trpc.boards.addPin.useMutation({
    onSuccess: () => {
      success('Pin saved to board!')
      router.refresh()
      onClose()
    },
    onError: (error) => {
      if (error.message.includes('already exists')) {
        info('This pin is already in that board')
      } else {
        showError('Failed to save pin. Please try again.')
      }
    },
  })

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
      if (e.key === 'Escape' && isOpen && !addPinToBoard.isPending) {
        onClose()
      }
    }

    document.addEventListener('keydown', handleEscape)
    return () => document.removeEventListener('keydown', handleEscape)
  }, [isOpen, addPinToBoard.isPending, onClose])

  const handleSaveToBoard = async (boardId: string) => {
    setSelectedBoardId(boardId)
    await addPinToBoard.mutateAsync({
      boardId,
      pinId,
    })
  }

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget && !addPinToBoard.isPending) {
      onClose()
    }
  }

  const handleCreateBoardSuccess = async (boardId: string) => {
    setIsCreateBoardOpen(false)
    // Automatically save to the newly created board
    await handleSaveToBoard(boardId)
  }

  if (!isOpen) return null

  return (
    <>
      <div
        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn"
        onClick={handleBackdropClick}
      >
        <div className="relative bg-white rounded-3xl shadow-2xl max-w-lg w-full max-h-[80vh] overflow-hidden flex flex-col animate-scaleIn">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200">
            <h2 className="text-2xl font-bold text-gray-900">Save to Board</h2>
            <button
              onClick={onClose}
              disabled={addPinToBoard.isPending}
              className="w-10 h-10 bg-gray-100 hover:bg-gray-200 rounded-full flex items-center justify-center transition-colors disabled:opacity-50"
              aria-label="Close"
            >
              <svg className="w-6 h-6 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Boards List */}
          <div className="flex-1 overflow-y-auto p-6">
            {isLoading ? (
              <div className="flex items-center justify-center py-12">
                <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-red-600 border-r-transparent"></div>
              </div>
            ) : boards.length === 0 ? (
              <div className="text-center py-12">
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
                    d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
                  />
                </svg>
                <p className="text-gray-600 mb-4">You don't have any boards yet</p>
                <p className="text-sm text-gray-500">Create a board to save this pin</p>
              </div>
            ) : (
              <div className="space-y-2">
                {boards.map((board: any) => (
                  <button
                    key={board.id}
                    onClick={() => handleSaveToBoard(board.id)}
                    disabled={addPinToBoard.isPending}
                    className={`w-full flex items-center justify-between p-4 rounded-xl border-2 transition-all ${
                      selectedBoardId === board.id && addPinToBoard.isPending
                        ? 'border-red-600 bg-red-50'
                        : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                    } disabled:opacity-50`}
                  >
                    <div className="flex items-center gap-3 flex-1 text-left">
                      <div className="w-12 h-12 rounded-lg bg-gray-200 flex-shrink-0 overflow-hidden">
                        {board.board_pins?.[0]?.pins?.image_url ? (
                          <img
                            src={board.board_pins[0].pins.image_url}
                            alt=""
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <svg
                              className="w-6 h-6 text-gray-400"
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
                        <p className="font-semibold text-gray-900 truncate">
                          {board.name}
                        </p>
                        <p className="text-sm text-gray-500">
                          {board.board_pins?.[0]?.count || 0} pins
                        </p>
                      </div>
                    </div>
                    {selectedBoardId === board.id && addPinToBoard.isPending && (
                      <div className="w-5 h-5 animate-spin rounded-full border-2 border-solid border-red-600 border-r-transparent"></div>
                    )}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Create New Board Button */}
          <div className="p-6 border-t border-gray-200">
            <button
              onClick={() => setIsCreateBoardOpen(true)}
              disabled={addPinToBoard.isPending}
              className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold rounded-xl transition-colors disabled:opacity-50"
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
