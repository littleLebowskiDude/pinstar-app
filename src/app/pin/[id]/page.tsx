import { notFound } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import { MOCK_PINS } from '@/lib/mock-data'

interface PinPageProps {
  params: Promise<{ id: string }>
}

export default async function PinPage({ params }: PinPageProps) {
  const { id } = await params
  const pin = MOCK_PINS.find((p) => p.id === id)

  if (!pin) {
    notFound()
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Back Button */}
      <div className="max-w-7xl mx-auto px-4 py-6">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
        >
          <svg
            className="w-5 h-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M15 19l-7-7 7-7"
            />
          </svg>
          Back to Home
        </Link>
      </div>

      {/* Pin Content */}
      <div className="max-w-5xl mx-auto px-4 pb-12">
        <div className="bg-white rounded-3xl shadow-xl overflow-hidden">
          <div className="flex flex-col md:flex-row">
            {/* Image Section */}
            <div className="md:w-1/2 lg:w-3/5 bg-gray-100 flex items-center justify-center p-8">
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
            <div className="md:w-1/2 lg:w-2/5 p-8">
              {/* Action Buttons */}
              <div className="mb-8 flex items-center gap-4">
                <button className="flex-1 px-6 py-3 bg-red-600 hover:bg-red-700 text-white font-semibold rounded-full transition-colors">
                  Save to Board
                </button>
                <button
                  className="w-12 h-12 bg-gray-100 hover:bg-gray-200 rounded-full flex items-center justify-center transition-colors"
                  aria-label="Share"
                  onClick={() => {
                    if (typeof window !== 'undefined') {
                      navigator.clipboard.writeText(window.location.href)
                      alert('Link copied to clipboard!')
                    }
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
              </div>

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

              {/* Source Link */}
              <div className="mb-6">
                <h3 className="text-sm font-semibold text-gray-500 uppercase mb-2">
                  Source
                </h3>
                <a
                  href={pin.imageUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:underline text-sm break-all"
                >
                  {pin.imageUrl}
                </a>
              </div>

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
          </div>

          {/* Comments Section */}
          <div className="border-t border-gray-200 p-8 bg-gray-50">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Comments
            </h3>
            <p className="text-sm text-gray-500 text-center py-4">
              No comments yet. Be the first to comment!
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

// Generate metadata for SEO
export async function generateMetadata({ params }: PinPageProps) {
  const { id } = await params
  const pin = MOCK_PINS.find((p) => p.id === id)

  if (!pin) {
    return {
      title: 'Pin Not Found',
    }
  }

  return {
    title: `${pin.title} | PinStar`,
    description: pin.description || pin.title,
  }
}
