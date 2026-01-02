'use client'

import { useState } from 'react'
import Image from 'next/image'
import { UnsplashPhoto } from '@/app/actions/unsplash'

interface UnsplashPhotoCardProps {
  photo: UnsplashPhoto
  onSave: (photo: UnsplashPhoto) => void
  isSaved?: boolean
}

export default function UnsplashPhotoCard({ photo, onSave, isSaved = false }: UnsplashPhotoCardProps) {
  const [isHovered, setIsHovered] = useState(false)
  const [imageLoaded, setImageLoaded] = useState(false)

  const handleSaveClick = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    onSave(photo)
  }

  return (
    <div className="break-inside-avoid mb-4">
      <div
        className="block group"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <div className="relative rounded-2xl overflow-hidden bg-gray-100 shadow-sm hover-lift">
          {/* Image Container */}
          <div className="relative w-full">
            {/* Placeholder while loading */}
            {!imageLoaded && (
              <div
                className="w-full bg-gradient-to-br from-gray-200 to-gray-300 animate-pulse"
                style={{ paddingBottom: `${(photo.height / photo.width) * 100}%` }}
              />
            )}

            {/* Actual Image */}
            <Image
              src={photo.thumbUrl}
              alt={photo.alt}
              width={photo.width}
              height={photo.height}
              className={`w-full h-auto transition-all duration-300 ${
                imageLoaded ? 'opacity-100 image-loaded' : 'opacity-0 absolute inset-0'
              } ${isHovered ? 'scale-105' : 'scale-100'}`}
              onLoad={() => setImageLoaded(true)}
              loading="lazy"
              unoptimized // For external Unsplash images
            />

            {/* Saved Badge - Always visible when saved */}
            {isSaved && (
              <div className="absolute top-3 right-3 z-10">
                <div className="flex items-center gap-1.5 px-3 py-1.5 bg-green-600 text-white font-semibold rounded-full text-sm shadow-lg">
                  <svg
                    className="w-4 h-4"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                      clipRule="evenodd"
                    />
                  </svg>
                  Saved
                </div>
              </div>
            )}

            {/* Hover Overlay with Save Button */}
            <div
              className={`absolute inset-0 bg-black/20 transition-opacity duration-200 ${
                isHovered ? 'opacity-100' : 'opacity-0'
              }`}
            >
              {!isSaved && (
                <div className="absolute top-3 right-3">
                  <button
                    onClick={handleSaveClick}
                    className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white font-semibold rounded-full text-sm shadow-lg transition-colors"
                  >
                    Save
                  </button>
                </div>
              )}

              {/* Bottom gradient for better attribution visibility */}
              <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-black/60 to-transparent" />

              {/* Attribution - Always visible on hover */}
              <div className="absolute bottom-0 left-0 right-0 p-3">
                <a
                  href={photo.photographerUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-white text-xs hover:underline"
                  onClick={(e) => e.stopPropagation()}
                >
                  Photo by {photo.photographer}
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
