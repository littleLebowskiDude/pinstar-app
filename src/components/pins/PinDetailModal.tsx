'use client'

import { useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Image from 'next/image'
import { Pin } from '@/lib/mock-data'
import SaveToBoardModal from '@/components/boards/SaveToBoardModal'

interface PinDetailModalProps {
  pin: Pin
  isOpen: boolean
  onClose: () => void
}

export default function PinDetailModal({ pin, isOpen, onClose }: PinDetailModalProps) {
  const router = useRouter()
  const [isAnimating, setIsAnimating] = useState(false)
  const [isSaveToBoardOpen, setIsSaveToBoardOpen] = useState(false)

  useEffect(() => {
    if (isOpen) {
      setIsAnimating(true)
      // Prevent body scroll when modal is open
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = 'unset'
    }

    return () => {
      document.body.style.overflow = 'unset'
    }
  }, [isOpen])

  useEffect(() => {
    // Handle ESC key to close modal
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        handleClose()
      }
    }

    document.addEventListener('keydown', handleEscape)
    return () => document.removeEventListener('keydown', handleEscape)
  }, [isOpen])

  const handleClose = () => {
    setIsAnimating(false)
    setTimeout(() => {
      onClose()
      router.back()
    }, 200) // Match animation duration
  }

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      handleClose()
    }
  }

  const handleSavePin = () => {
    setIsSaveToBoardOpen(true)
  }

  if (!isOpen) return null

  return (
    <div
      className={`fixed inset-0 z-50 flex items-center justify-center p-4 transition-all duration-200 ${
        isAnimating ? 'opacity-100' : 'opacity-0'
      }`}
      onClick={handleBackdropClick}
    >
      {/* Backdrop with blur */}
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />

      {/* Modal Content */}
      <div
        className={`relative bg-white rounded-3xl shadow-2xl max-w-5xl w-full max-h-[90vh] overflow-hidden flex flex-col md:flex-row transition-all duration-200 ${
          isAnimating ? 'scale-100 opacity-100' : 'scale-95 opacity-0'
        }`}
      >
        {/* Close Button */}
        <button
          onClick={handleClose}
          className="absolute top-4 right-4 z-10 w-10 h-10 bg-white hover:bg-gray-100 rounded-full shadow-lg flex items-center justify-center transition-colors"
          aria-label="Close"
        >
          <svg
            className="w-6 h-6 text-gray-700"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </button>

        {/* Image Section */}
        <div className="md:w-1/2 lg:w-3/5 bg-gray-50 flex items-center justify-center p-8 overflow-y-auto">
          <div className="relative w-full">
            <Image
              src={pin.imageUrl}
              alt={pin.title}
              width={pin.width}
              height={pin.height}
              className="w-full h-auto rounded-2xl shadow-lg"
              priority
              unoptimized
            />
          </div>
        </div>

        {/* Details Section */}
        <div className="md:w-1/2 lg:w-2/5 flex flex-col overflow-y-auto">
          {/* Action Buttons */}
          <div className="p-6 border-b border-gray-200 flex items-center justify-between gap-4">
            <button
              onClick={handleSavePin}
              className="flex-1 px-6 py-3 bg-red-600 hover:bg-red-700 text-white font-semibold rounded-full transition-colors"
            >
              Save to Board
            </button>
            <button
              className="w-12 h-12 bg-gray-100 hover:bg-gray-200 rounded-full flex items-center justify-center transition-colors"
              aria-label="Share"
              onClick={() => {
                // Copy URL to clipboard
                const url = `${window.location.origin}/pin/${pin.id}`
                navigator.clipboard.writeText(url)
                alert('Link copied to clipboard!')
              }}
            >
              <svg
                className="w-5 h-5 text-gray-700"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z"
                />
              </svg>
            </button>
            <button
              className="w-12 h-12 bg-gray-100 hover:bg-gray-200 rounded-full flex items-center justify-center transition-colors"
              aria-label="More options"
            >
              <svg
                className="w-5 h-5 text-gray-700"
                fill="currentColor"
                viewBox="0 0 24 24"
              >
                <path d="M12 8c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2zm0 2c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm0 6c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2z" />
              </svg>
            </button>
          </div>

          {/* Pin Details */}
          <div className="p-6 flex-1">
            {/* Title */}
            <h1 className="text-3xl font-bold text-gray-900 mb-4">
              {pin.title}
            </h1>

            {/* Description */}
            {pin.description && (
              <p className="text-base text-gray-700 mb-6 leading-relaxed">
                {pin.description}
              </p>
            )}

            {/* Creator Info */}
            <div className="mb-6">
              <h3 className="text-sm font-semibold text-gray-500 uppercase mb-3">
                Created by
              </h3>
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-red-400 to-pink-500 flex items-center justify-center text-white font-bold text-lg">
                  U
                </div>
                <div>
                  <p className="font-semibold text-gray-900">User Name</p>
                  <p className="text-sm text-gray-500">123 followers</p>
                </div>
              </div>
            </div>

            {/* Unsplash Attribution (if applicable) */}
            {pin.source === 'unsplash' && pin.attribution && (
              <div className="mb-6 p-3 bg-gray-50 rounded-lg border border-gray-200">
                <p className="text-xs text-gray-600">
                  Photo by{' '}
                  <a
                    href={pin.attribution.photographerUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-gray-900 hover:underline font-medium"
                  >
                    {pin.attribution.photographer}
                  </a>{' '}
                  on{' '}
                  <a
                    href={pin.attribution.unsplashUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-gray-900 hover:underline font-medium"
                  >
                    Unsplash
                  </a>
                </p>
              </div>
            )}

            {/* Source Link (if available) */}
            {pin.sourceUrl && (
              <div className="mb-6">
                <h3 className="text-sm font-semibold text-gray-500 uppercase mb-2">
                  Source
                </h3>
                <a
                  href={pin.sourceUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:underline text-sm break-all"
                >
                  {pin.sourceUrl}
                </a>
              </div>
            )}

            {/* Additional Info */}
            <div className="border-t border-gray-200 pt-6">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-gray-500 mb-1">Dimensions</p>
                  <p className="font-semibold text-gray-900">
                    {pin.width} × {pin.height}
                  </p>
                </div>
                <div>
                  <p className="text-gray-500 mb-1">Pin ID</p>
                  <p className="font-semibold text-gray-900">#{pin.id}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Comments Section (Placeholder) */}
          <div className="p-6 border-t border-gray-200 bg-gray-50">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Comments
            </h3>
            <p className="text-sm text-gray-500 text-center py-4">
              No comments yet. Be the first to comment!
            </p>
          </div>
        </div>
      </div>

      {/* Save to Board Modal */}
      <SaveToBoardModal
        isOpen={isSaveToBoardOpen}
        onClose={() => setIsSaveToBoardOpen(false)}
        pinId={pin.id.toString()}
      />
    </div>
  )
}
