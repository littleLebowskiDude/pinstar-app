import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import UserMenu from './UserMenu'
import SearchBar from '@/components/search/SearchBar'

export default async function Header() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  return (
    <header className="sticky top-0 z-50 bg-white border-b border-gray-200 shadow-sm">
      <div className="max-w-[1260px] mx-auto px-4 py-3">
        <div className="flex items-center justify-between gap-2 md:gap-4">
          {/* Logo */}
          <Link
            href="/"
            className="text-xl md:text-2xl font-bold text-red-600 hover:text-red-700 transition-colors flex-shrink-0"
          >
            PinStar
          </Link>

          {/* Search Bar - Hidden on mobile */}
          <div className="hidden md:block flex-1">
            <SearchBar />
          </div>

          {/* User Menu / Login */}
          <div className="flex items-center gap-2 flex-shrink-0">
            {user ? (
              <UserMenu user={user} />
            ) : (
              <Link
                href="/login"
                className="px-3 md:px-4 py-2 bg-red-600 hover:bg-red-700 text-white font-semibold rounded-full text-xs md:text-sm transition-colors"
              >
                Log in
              </Link>
            )}
          </div>
        </div>
      </div>
    </header>
  )
}
