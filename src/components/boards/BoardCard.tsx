import Link from 'next/link'
import Image from 'next/image'

interface BoardCardProps {
  board: {
    id: string
    name: string
    description?: string
    cover_image_url?: string
    is_private: boolean
    board_pins?: Array<{
      pins?: {
        image_url?: string
        image_width?: number
        image_height?: number
      }
    }>
    _count?: {
      board_pins: number
    }
  }
  pinCount?: number
}

export default function BoardCard({ board, pinCount }: BoardCardProps) {
  // Get pin count from either _count or board_pins array
  const count = pinCount ?? board._count?.board_pins ?? board.board_pins?.length ?? 0

  // Get first 3 pins for collage
  const pins = board.board_pins?.slice(0, 3).map(bp => bp.pins).filter(Boolean) ?? []

  return (
    <Link
      href={`/boards/${board.id}`}
      className="group block"
    >
      <div className="relative rounded-2xl overflow-hidden bg-gray-100 shadow-sm hover-lift">
        {/* Cover Image or Collage */}
        <div className="relative w-full aspect-[4/3] bg-gradient-to-br from-gray-200 to-gray-300">
          {board.cover_image_url ? (
            /* Single Cover Image */
            <Image
              src={board.cover_image_url}
              alt={board.name}
              fill
              className="object-cover group-hover:scale-105 transition-transform duration-300"
              loading="lazy"
              unoptimized
            />
          ) : pins.length > 0 ? (
            /* Collage of First 3 Pins */
            <div className="grid grid-cols-3 gap-1 h-full p-1">
              {pins.map((pin, index) => (
                <div
                  key={index}
                  className="relative bg-gray-200 rounded-lg overflow-hidden"
                >
                  {pin?.image_url && (
                    <Image
                      src={pin.image_url}
                      alt=""
                      fill
                      className="object-cover"
                      loading="lazy"
                      unoptimized
                    />
                  )}
                </div>
              ))}
              {/* Fill remaining slots with placeholders */}
              {Array.from({ length: Math.max(0, 3 - pins.length) }).map((_, index) => (
                <div
                  key={`placeholder-${index}`}
                  className="relative bg-gray-200 rounded-lg flex items-center justify-center"
                >
                  <svg
                    className="w-8 h-8 text-gray-400"
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
              ))}
            </div>
          ) : (
            /* Empty Board Placeholder */
            <div className="flex items-center justify-center h-full">
              <svg
                className="w-16 h-16 text-gray-400"
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

        {/* Board Info */}
        <div className="p-4">
          <div className="flex items-start justify-between gap-2 mb-1">
            <h3 className="text-base font-bold text-gray-900 line-clamp-1 flex-1">
              {board.name}
            </h3>
            {board.is_private && (
              <svg
                className="w-5 h-5 text-gray-500 flex-shrink-0"
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
            <p className="text-sm text-gray-600 line-clamp-2 mb-2">
              {board.description}
            </p>
          )}
          <p className="text-sm text-gray-500">
            {count} {count === 1 ? 'pin' : 'pins'}
          </p>
        </div>
      </div>
    </Link>
  )
}
