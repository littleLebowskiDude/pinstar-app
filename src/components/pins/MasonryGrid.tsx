'use client'

import { Pin } from '@/lib/mock-data'
import PinCard from './PinCard'

interface MasonryGridProps {
  pins: Pin[]
}

export default function MasonryGrid({ pins }: MasonryGridProps) {
  if (pins.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <svg
          className="w-16 h-16 text-gray-300 mb-4"
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
          Start saving pins to see them here
        </p>
      </div>
    )
  }

  return (
    <div className="w-full">
      {/* CSS Columns Masonry Layout */}
      <div className="columns-2 sm:columns-3 md:columns-4 lg:columns-5 gap-4">
        {pins.map((pin) => (
          <PinCard key={pin.id} pin={pin} />
        ))}
      </div>
    </div>
  )
}
