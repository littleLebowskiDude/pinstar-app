'use client'

import { useState, useRef, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { compressImage, isValidImageFile, formatFileSize } from '@/lib/imageCompression'
import { getCloudinaryUploadUrl } from '@/lib/cloudinary'
import { trpc } from '@/lib/trpc/client'
import { useToast } from '@/components/ui/ToastContext'

interface CreatePinModalProps {
  isOpen: boolean
  onClose: () => void
}

type Step = 'upload' | 'details' | 'board'

interface PinData {
  imageUrl: string
  imageWidth: number
  imageHeight: number
  title: string
  description: string
  sourceUrl: string
  boardId?: string
}

export default function CreatePinModal({ isOpen, onClose }: CreatePinModalProps) {
  const router = useRouter()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const { success, error: showError } = useToast()

  // tRPC hooks
  const { data: boards = [], refetch: refetchBoards } = trpc.boards.getMyBoards.useQuery(undefined, {
    enabled: isOpen, // Only fetch when modal is open
  })
  const createPin = trpc.pins.create.useMutation({
    onSuccess: () => {
      success('Pin created successfully!')
      router.refresh()
      onClose()
    },
    onError: (err) => {
      showError(err.message || 'Failed to create pin')
    },
  })
  const createBoard = trpc.boards.create.useMutation({
    onSuccess: (newBoard) => {
      success('Board created successfully!')
      refetchBoards()
      setPinData({ ...pinData, boardId: newBoard.id })
      setIsCreatingBoard(false)
      setNewBoardName('')
      setNewBoardDescription('')
    },
    onError: (err) => {
      showError(err.message || 'Failed to create board')
    },
  })

  const [step, setStep] = useState<Step>('upload')
  const [isDragging, setIsDragging] = useState(false)
  const [isUploading, setIsUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [error, setError] = useState<string | null>(null)

  // Image state
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [imageDimensions, setImageDimensions] = useState<{ width: number; height: number } | null>(null)

  // Pin data state
  const [pinData, setPinData] = useState<Partial<PinData>>({
    title: '',
    description: '',
    sourceUrl: '',
  })

  // Create board state
  const [isCreatingBoard, setIsCreatingBoard] = useState(false)
  const [newBoardName, setNewBoardName] = useState('')
  const [newBoardDescription, setNewBoardDescription] = useState('')

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = 'unset'
      // Reset state when closed
      setStep('upload')
      setSelectedFile(null)
      setPreviewUrl(null)
      setImageDimensions(null)
      setPinData({ title: '', description: '', sourceUrl: '' })
      setError(null)
      setIsCreatingBoard(false)
      setNewBoardName('')
      setNewBoardDescription('')
    }

    return () => {
      document.body.style.overflow = 'unset'
    }
  }, [isOpen])

  // Handle ESC key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen && !isUploading) {
        onClose()
      }
    }

    document.addEventListener('keydown', handleEscape)
    return () => document.removeEventListener('keydown', handleEscape)
  }, [isOpen, isUploading, onClose])

  const handleFileSelect = async (file: File) => {
    setError(null)

    if (!isValidImageFile(file)) {
      setError('Please select a valid image file (JPEG, PNG, WebP, or GIF)')
      return
    }

    try {
      const compressed = await compressImage(file)
      setSelectedFile(compressed.file)
      setPreviewUrl(compressed.preview)
      setImageDimensions({ width: compressed.width, height: compressed.height })
      setStep('details')
    } catch (err) {
      setError('Failed to process image. Please try another file.')
      console.error('Image compression error:', err)
    }
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)

    const file = e.dataTransfer.files[0]
    if (file) {
      handleFileSelect(file)
    }
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(true)
  }

  const handleDragLeave = () => {
    setIsDragging(false)
  }

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      handleFileSelect(file)
    }
  }

  const uploadToCloudinary = async (): Promise<{ url: string; width: number; height: number }> => {
    if (!selectedFile || !imageDimensions) {
      throw new Error('No file selected')
    }

    // Get upload signature from our API
    const signatureResponse = await fetch('/api/upload', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ folder: 'pins' }),
    })

    if (!signatureResponse.ok) {
      throw new Error('Failed to get upload signature')
    }

    const { signature, timestamp, apiKey, cloudName, folder } = await signatureResponse.json()

    // Upload to Cloudinary
    const formData = new FormData()
    formData.append('file', selectedFile)
    formData.append('signature', signature)
    formData.append('timestamp', timestamp.toString())
    formData.append('api_key', apiKey)
    formData.append('folder', folder)

    const uploadUrl = getCloudinaryUploadUrl()

    return new Promise((resolve, reject) => {
      const xhr = new XMLHttpRequest()

      xhr.upload.addEventListener('progress', (e) => {
        if (e.lengthComputable) {
          const progress = Math.round((e.loaded / e.total) * 100)
          setUploadProgress(progress)
        }
      })

      xhr.addEventListener('load', () => {
        if (xhr.status === 200) {
          const response = JSON.parse(xhr.responseText)
          resolve({
            url: response.secure_url,
            width: response.width,
            height: response.height,
          })
        } else {
          // Parse error response from Cloudinary
          let errorMessage = 'Upload failed'
          try {
            const errorResponse = JSON.parse(xhr.responseText)
            errorMessage = errorResponse.error?.message || errorResponse.message || `Upload failed with status ${xhr.status}`
          } catch (e) {
            errorMessage = `Upload failed with status ${xhr.status}: ${xhr.responseText}`
          }
          console.error('Cloudinary upload error:', errorMessage)
          reject(new Error(errorMessage))
        }
      })

      xhr.addEventListener('error', () => {
        console.error('Network error during upload')
        reject(new Error('Network error during upload. Please check your connection.'))
      })

      xhr.open('POST', uploadUrl)
      xhr.send(formData)
    })
  }

  const handleCreateBoard = async () => {
    if (!newBoardName.trim()) return

    await createBoard.mutateAsync({
      name: newBoardName.trim(),
      description: newBoardDescription.trim() || undefined,
      isPrivate: false,
    })
  }

  const handleSubmit = async () => {
    setIsUploading(true)
    setError(null)
    setUploadProgress(0)

    try {
      // Upload image to Cloudinary
      const { url, width, height } = await uploadToCloudinary()

      // Save pin to database via tRPC
      await createPin.mutateAsync({
        title: pinData.title!,
        description: pinData.description,
        imageUrl: url,
        imageWidth: width,
        imageHeight: height,
        sourceUrl: pinData.sourceUrl,
        boardId: pinData.boardId,
      })

      // Success! Modal will close via onSuccess callback
    } catch (err) {
      setError('Failed to create pin. Please try again.')
      console.error('Pin creation error:', err)
    } finally {
      setIsUploading(false)
      setUploadProgress(0)
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
      <div className="relative bg-white rounded-3xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-hidden flex flex-col animate-scaleIn">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-2xl font-bold text-gray-900">Create Pin</h2>
          <button
            onClick={onClose}
            disabled={isUploading}
            className="w-10 h-10 bg-gray-100 hover:bg-gray-200 rounded-full flex items-center justify-center transition-colors disabled:opacity-50"
            aria-label="Close"
          >
            <svg className="w-6 h-6 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Progress Steps */}
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="flex items-center justify-between max-w-md mx-auto">
            <div className="flex flex-col items-center gap-2">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold ${
                step === 'upload' ? 'bg-red-600 text-white' : 'bg-green-500 text-white'
              }`}>
                {step !== 'upload' ? '✓' : '1'}
              </div>
              <span className="text-xs font-medium text-gray-600">Upload</span>
            </div>

            <div className={`flex-1 h-1 mx-4 rounded ${
              step !== 'upload' ? 'bg-green-500' : 'bg-gray-200'
            }`} />

            <div className="flex flex-col items-center gap-2">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold ${
                step === 'details' ? 'bg-red-600 text-white' :
                step === 'board' ? 'bg-green-500 text-white' : 'bg-gray-200 text-gray-600'
              }`}>
                {step === 'board' ? '✓' : '2'}
              </div>
              <span className="text-xs font-medium text-gray-600">Details</span>
            </div>

            <div className={`flex-1 h-1 mx-4 rounded ${
              step === 'board' ? 'bg-green-500' : 'bg-gray-200'
            }`} />

            <div className="flex flex-col items-center gap-2">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold ${
                step === 'board' ? 'bg-red-600 text-white' : 'bg-gray-200 text-gray-600'
              }`}>
                3
              </div>
              <span className="text-xs font-medium text-gray-600">Board</span>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {error && (
            <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
              {error}
            </div>
          )}

          {/* Step 1: Upload */}
          {step === 'upload' && (
            <div className="space-y-4">
              <div
                onDrop={handleDrop}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onClick={() => fileInputRef.current?.click()}
                className={`border-2 border-dashed rounded-2xl p-12 text-center cursor-pointer transition-colors ${
                  isDragging
                    ? 'border-red-600 bg-red-50'
                    : 'border-gray-300 hover:border-gray-400 bg-gray-50'
                }`}
              >
                <svg
                  className="mx-auto w-16 h-16 text-gray-400 mb-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.5}
                    d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                  />
                </svg>
                <p className="text-lg font-semibold text-gray-700 mb-2">
                  Drop your image here, or click to select
                </p>
                <p className="text-sm text-gray-500">
                  JPG, PNG, WebP, or GIF (max 1MB after compression)
                </p>
              </div>

              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileInputChange}
                className="hidden"
              />
            </div>
          )}

          {/* Step 2: Details */}
          {step === 'details' && (
            <div className="space-y-6">
              {/* Image Preview */}
              {previewUrl && (
                <div className="flex justify-center">
                  <div className="relative max-w-md rounded-2xl overflow-hidden shadow-lg">
                    <img src={previewUrl} alt="Preview" className="w-full h-auto" />
                    <button
                      onClick={() => {
                        setStep('upload')
                        setSelectedFile(null)
                        setPreviewUrl(null)
                      }}
                      className="absolute top-3 right-3 w-8 h-8 bg-white/90 hover:bg-white rounded-full flex items-center justify-center shadow-lg transition-colors"
                    >
                      <svg className="w-5 h-5 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                </div>
              )}

              {/* Form Fields */}
              <div className="space-y-4">
                <div>
                  <label htmlFor="title" className="block text-sm font-semibold text-gray-700 mb-2">
                    Title *
                  </label>
                  <input
                    id="title"
                    type="text"
                    value={pinData.title}
                    onChange={(e) => setPinData({ ...pinData, title: e.target.value })}
                    placeholder="Add a title for your pin"
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-none transition-all"
                    required
                  />
                </div>

                <div>
                  <label htmlFor="description" className="block text-sm font-semibold text-gray-700 mb-2">
                    Description
                  </label>
                  <textarea
                    id="description"
                    value={pinData.description}
                    onChange={(e) => setPinData({ ...pinData, description: e.target.value })}
                    placeholder="Tell everyone what your pin is about"
                    rows={4}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-none transition-all resize-none"
                  />
                </div>

                <div>
                  <label htmlFor="sourceUrl" className="block text-sm font-semibold text-gray-700 mb-2">
                    Source URL
                  </label>
                  <input
                    id="sourceUrl"
                    type="url"
                    value={pinData.sourceUrl}
                    onChange={(e) => setPinData({ ...pinData, sourceUrl: e.target.value })}
                    placeholder="https://example.com"
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-none transition-all"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Step 3: Board Selection */}
          {step === 'board' && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Select a board</h3>

                {boards.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    <p className="mb-4">You don't have any boards yet!</p>
                    <p className="text-sm">Create your first board to save pins.</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-2 gap-4">
                    {boards.map((board: any) => (
                      <button
                        key={board.id}
                        onClick={() => setPinData({ ...pinData, boardId: board.id })}
                        className={`p-4 border-2 rounded-xl text-left transition-all ${
                          pinData.boardId === board.id
                            ? 'border-red-600 bg-red-50'
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        <div className="font-semibold text-gray-900 truncate">{board.name}</div>
                        <div className="text-sm text-gray-500 mt-1">
                          {board.board_pins?.[0]?.count || 0} pins
                        </div>
                      </button>
                    ))}

                    {!isCreatingBoard ? (
                      <button
                        className="p-4 border-2 border-dashed border-gray-300 rounded-xl hover:border-gray-400 transition-colors flex flex-col items-center justify-center gap-2"
                        onClick={() => setIsCreatingBoard(true)}
                      >
                        <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                        </svg>
                        <span className="text-sm font-semibold text-gray-600">Create Board</span>
                      </button>
                    ) : (
                      <div className="col-span-2 p-4 border-2 border-red-300 rounded-xl bg-red-50">
                        <h4 className="text-sm font-semibold text-gray-900 mb-3">Create New Board</h4>
                        <div className="space-y-3">
                          <div>
                            <input
                              type="text"
                              value={newBoardName}
                              onChange={(e) => setNewBoardName(e.target.value)}
                              placeholder="Board name"
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-none text-sm"
                              autoFocus
                            />
                          </div>
                          <div>
                            <textarea
                              value={newBoardDescription}
                              onChange={(e) => setNewBoardDescription(e.target.value)}
                              placeholder="Description (optional)"
                              rows={2}
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-none text-sm resize-none"
                            />
                          </div>
                          <div className="flex gap-2">
                            <button
                              onClick={handleCreateBoard}
                              disabled={!newBoardName.trim() || createBoard.isPending}
                              className="flex-1 px-4 py-2 bg-red-600 hover:bg-red-700 text-white text-sm font-semibold rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                              {createBoard.isPending ? 'Creating...' : 'Create'}
                            </button>
                            <button
                              onClick={() => {
                                setIsCreatingBoard(false)
                                setNewBoardName('')
                                setNewBoardDescription('')
                              }}
                              disabled={createBoard.isPending}
                              className="px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-700 text-sm font-semibold rounded-lg transition-colors disabled:opacity-50"
                            >
                              Cancel
                            </button>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Upload Progress */}
              {isUploading && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="font-medium text-gray-700">Uploading...</span>
                    <span className="text-gray-500">{uploadProgress}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
                    <div
                      className="bg-red-600 h-full transition-all duration-300"
                      style={{ width: `${uploadProgress}%` }}
                    />
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-gray-200 flex items-center justify-between gap-4">
          {step !== 'upload' && (
            <button
              onClick={() => {
                if (step === 'details') setStep('upload')
                else if (step === 'board') setStep('details')
              }}
              disabled={isUploading}
              className="px-6 py-2.5 text-gray-700 font-semibold hover:bg-gray-100 rounded-full transition-colors disabled:opacity-50"
            >
              Back
            </button>
          )}

          <div className="flex-1" />

          {step === 'upload' && (
            <button
              onClick={onClose}
              className="px-6 py-2.5 text-gray-700 font-semibold hover:bg-gray-100 rounded-full transition-colors"
            >
              Cancel
            </button>
          )}

          {step === 'details' && (
            <button
              onClick={() => setStep('board')}
              disabled={!pinData.title}
              className="px-6 py-2.5 bg-red-600 hover:bg-red-700 text-white font-semibold rounded-full transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Next
            </button>
          )}

          {step === 'board' && (
            <button
              onClick={handleSubmit}
              disabled={isUploading || !pinData.boardId}
              className="px-6 py-2.5 bg-red-600 hover:bg-red-700 text-white font-semibold rounded-full transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isUploading ? 'Creating...' : 'Create Pin'}
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
