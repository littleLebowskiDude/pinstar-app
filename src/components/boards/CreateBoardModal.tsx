'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { trpc } from '@/lib/trpc/client'
import { useToast } from '@/components/ui/ToastContext'

interface CreateBoardModalProps {
  isOpen: boolean
  onClose: () => void
  onSuccess?: (boardId: string) => void
}

export default function CreateBoardModal({ isOpen, onClose, onSuccess }: CreateBoardModalProps) {
  const router = useRouter()
  const { success: showSuccess, error: showError } = useToast()
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    isPrivate: false,
  })
  const [error, setError] = useState<string | null>(null)

  const createBoard = trpc.boards.create.useMutation({
    onSuccess: (board) => {
      showSuccess('Board created successfully!')
      router.refresh()
      if (onSuccess) {
        onSuccess(board.id)
      }
      onClose()
    },
    onError: (err) => {
      const errorMessage = err.message || 'Failed to create board'
      setError(errorMessage)
      showError(errorMessage)
    },
  })

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = 'unset'
      // Reset form when closed
      setFormData({ name: '', description: '', isPrivate: false })
      setError(null)
    }

    return () => {
      document.body.style.overflow = 'unset'
    }
  }, [isOpen])

  // Handle ESC key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen && !createBoard.isPending) {
        onClose()
      }
    }

    document.addEventListener('keydown', handleEscape)
    return () => document.removeEventListener('keydown', handleEscape)
  }, [isOpen, createBoard.isPending, onClose])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    if (!formData.name.trim()) {
      setError('Board name is required')
      return
    }

    if (formData.name.length > 100) {
      setError('Board name must be 100 characters or less')
      return
    }

    await createBoard.mutateAsync(formData)
  }

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget && !createBoard.isPending) {
      onClose()
    }
  }

  if (!isOpen) return null

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn"
      onClick={handleBackdropClick}
    >
      <div className="relative bg-white rounded-3xl shadow-2xl max-w-lg w-full animate-scaleIn">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-2xl font-bold text-gray-900">Create Board</h2>
          <button
            onClick={onClose}
            disabled={createBoard.isPending}
            className="w-10 h-10 bg-gray-100 hover:bg-gray-200 rounded-full flex items-center justify-center transition-colors disabled:opacity-50"
            aria-label="Close"
          >
            <svg className="w-6 h-6 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6">
          {error && (
            <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
              {error}
            </div>
          )}

          <div className="space-y-4">
            {/* Name Input */}
            <div>
              <label htmlFor="board-name" className="block text-sm font-semibold text-gray-700 mb-2">
                Name *
              </label>
              <input
                id="board-name"
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="e.g., Home Decor Ideas"
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-none transition-all"
                maxLength={100}
                required
                autoFocus
              />
              <p className="text-xs text-gray-500 mt-1">
                {formData.name.length}/100 characters
              </p>
            </div>

            {/* Description Input */}
            <div>
              <label htmlFor="board-description" className="block text-sm font-semibold text-gray-700 mb-2">
                Description (optional)
              </label>
              <textarea
                id="board-description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="What's your board about?"
                rows={4}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-none transition-all resize-none"
                maxLength={500}
              />
              {formData.description && (
                <p className="text-xs text-gray-500 mt-1">
                  {formData.description.length}/500 characters
                </p>
              )}
            </div>

            {/* Privacy Toggle */}
            <div>
              <label className="flex items-center gap-3 cursor-pointer group">
                <div className="relative">
                  <input
                    type="checkbox"
                    checked={formData.isPrivate}
                    onChange={(e) => setFormData({ ...formData, isPrivate: e.target.checked })}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-red-500 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-red-600"></div>
                </div>
                <div>
                  <div className="text-sm font-semibold text-gray-900">
                    Keep this board private
                  </div>
                  <div className="text-xs text-gray-500">
                    Only you can see this board
                  </div>
                </div>
              </label>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-end gap-3 mt-6 pt-6 border-t border-gray-200">
            <button
              type="button"
              onClick={onClose}
              disabled={createBoard.isPending}
              className="px-6 py-2.5 text-gray-700 font-semibold hover:bg-gray-100 rounded-full transition-colors disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={createBoard.isPending || !formData.name.trim()}
              className="px-6 py-2.5 bg-red-600 hover:bg-red-700 text-white font-semibold rounded-full transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {createBoard.isPending ? 'Creating...' : 'Create Board'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
