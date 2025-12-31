'use client'

import { useState } from 'react'
import { useRouter, usePathname, useSearchParams } from 'next/navigation'
import Image from 'next/image'
import { Pin } from '@/lib/mock-data'

interface PinCardProps {
  pin: Pin
}

export default function PinCard({ pin }: PinCardProps) {
  const [isHovered, setIsHovered] = useState(false)
  const [imageLoaded, setImageLoaded] = useState(false)
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault()
    // Update URL with pin query parameter
    const params = new URLSearchParams(searchParams)
    params.set('pin', pin.id.toString())
    router.push(`${pathname}?${params.toString()}`, { scroll: false })
  }

  return (
    <div className="break-inside-avoid mb-4">
      <div
        onClick={handleClick}
        className="block group cursor-zoom-in"
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
                style={{ paddingBottom: `${(pin.height / pin.width) * 100}%` }}
              />
            )}

            {/* Actual Image */}
            <Image
              src={pin.imageUrl}
              alt={pin.title}
              width={pin.width}
              height={pin.height}
              className={`w-full h-auto transition-all duration-300 ${
                imageLoaded ? 'opacity-100 image-loaded' : 'opacity-0 absolute inset-0'
              } ${isHovered ? 'scale-105' : 'scale-100'}`}
              onLoad={() => setImageLoaded(true)}
              loading="lazy"
              unoptimized // For external images
            />

            {/* Hover Overlay with Save Button */}
            <div
              className={`absolute inset-0 bg-black/20 transition-opacity duration-200 ${
                isHovered ? 'opacity-100' : 'opacity-0'
              }`}
            >
              <div className="absolute top-3 right-3">
                <button
                  onClick={(e) => {
                    e.preventDefault()
                    // TODO: Implement save functionality
                    console.log('Save pin:', pin.id)
                  }}
                  className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white font-semibold rounded-full text-sm shadow-lg transition-colors"
                >
                  Save
                </button>
              </div>

              {/* Bottom gradient for better title visibility */}
              <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-black/60 to-transparent" />
            </div>
          </div>

          {/* Pin Title */}
          <div className="p-3">
            <h3
              className="text-sm font-semibold text-gray-900 line-clamp-2"
              title={pin.title}
            >
              {pin.title}
            </h3>
            {pin.description && (
              <p
                className="text-xs text-gray-600 mt-1 line-clamp-1"
                title={pin.description}
              >
                {pin.description}
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
