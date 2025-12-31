import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import PinFeed from '@/components/pins/PinFeed'
import CreatePinButton from '@/components/pins/CreatePinButton'

export default async function Home() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  return (
    <div className="min-h-screen bg-white">
      {/* Create Pin Button - Fixed Position */}
      {user && <CreatePinButton />}

      {/* Main Content */}
      <div className="max-w-[1260px] mx-auto px-4 py-8">
        {!user ? (
          /* Welcome Screen for Non-Authenticated Users */
          <div className="flex flex-col items-center justify-center min-h-[calc(100vh-200px)] text-center">
            <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-4">
              Get your next
            </h1>
            <h2 className="text-4xl md:text-5xl font-bold text-red-600 mb-6">
              idea
            </h2>
            <p className="text-lg text-gray-600 mb-8 max-w-md">
              Discover recipes, home ideas, style inspiration and other ideas to try
            </p>
            <Link
              href="/login"
              className="px-6 py-3 bg-red-600 hover:bg-red-700 text-white font-semibold rounded-full text-base transition-colors"
            >
              Get Started
            </Link>
          </div>
        ) : (
          /* Pin Grid for Authenticated Users */
          <div>
            <h2 className="text-2xl font-semibold text-gray-900 mb-6">
              Discover inspiration
            </h2>

            {/* Pin Feed from Database */}
            <PinFeed />
          </div>
        )}
      </div>
    </div>
  )
}
