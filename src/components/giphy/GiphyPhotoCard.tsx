'use client'

import { useState } from 'react'
import Image from 'next/image'
import { GiphyImage } from '@/app/actions/giphy'

interface GiphyPhotoCardProps {
  gif: GiphyImage
  onSave: (gif: GiphyImage) => void
  isSaved?: boolean
}

export default function GiphyPhotoCard({ gif, onSave, isSaved = false }: GiphyPhotoCardProps) {
  const [isHovered, setIsHovered] = useState(false)
  const [imageLoaded, setImageLoaded] = useState(false)

  const handleSaveClick = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    onSave(gif)
  }

  const width = parseInt(gif.images.fixed_width.width)
  const height = parseInt(gif.images.fixed_width.height)

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
                className="w-full bg-gradient-to-br from-purple-200 to-pink-300 animate-pulse"
                style={{ paddingBottom: `${(height / width) * 100}%` }}
              />
            )}

            {/* Actual GIF */}
            <Image
              src={gif.images.fixed_width.url}
              alt={gif.title}
              width={width}
              height={height}
              className={`w-full h-auto transition-all duration-300 ${
                imageLoaded ? 'opacity-100 image-loaded' : 'opacity-0 absolute inset-0'
              } ${isHovered ? 'scale-105' : 'scale-100'}`}
              onLoad={() => setImageLoaded(true)}
              loading="lazy"
              unoptimized // For external Giphy GIFs
            />

            {/* Giphy Badge - Shows it's a GIF */}
            <div className="absolute top-3 left-3 z-10">
              <div className="flex items-center gap-1.5 px-2 py-1 bg-purple-600 text-white font-semibold rounded-full text-xs shadow-lg">
                GIF
              </div>
            </div>

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
                {gif.user ? (
                  <a
                    href={gif.user.profile_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-white text-xs hover:underline"
                    onClick={(e) => e.stopPropagation()}
                  >
                    By {gif.user.display_name}
                  </a>
                ) : (
                  <a
                    href="https://giphy.com"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-white text-xs hover:underline flex items-center gap-1"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <span>Powered by</span>
                    <span className="font-bold">GIPHY</span>
                  </a>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
