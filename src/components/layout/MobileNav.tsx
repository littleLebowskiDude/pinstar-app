'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { User } from '@supabase/supabase-js'
import { useState } from 'react'
import CreatePinModal from '@/components/pins/CreatePinModal'

interface MobileNavProps {
  user: User | null
}

export default function MobileNav({ user }: MobileNavProps) {
  const pathname = usePathname()
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)

  const navItems = [
    {
      name: 'Home',
      href: '/',
      icon: (active: boolean) => (
        <svg
          className={`w-6 h-6 ${active ? 'text-red-600' : 'text-gray-600'}`}
          fill={active ? 'currentColor' : 'none'}
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={active ? 0 : 2}
            d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
          />
        </svg>
      ),
    },
    {
      name: 'Search',
      href: '/search',
      icon: (active: boolean) => (
        <svg
          className={`w-6 h-6 ${active ? 'text-red-600' : 'text-gray-600'}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
          />
        </svg>
      ),
    },
    {
      name: 'Create',
      href: '#',
      icon: () => (
        <div className="w-14 h-14 -mt-8 bg-red-600 rounded-full flex items-center justify-center shadow-lg">
          <svg
            className="w-7 h-7 text-white"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2.5}
              d="M12 4v16m8-8H4"
            />
          </svg>
        </div>
      ),
      onClick: () => setIsCreateModalOpen(true),
    },
    {
      name: 'Boards',
      href: '/boards',
      icon: (active: boolean) => (
        <svg
          className={`w-6 h-6 ${active ? 'text-red-600' : 'text-gray-600'}`}
          fill={active ? 'currentColor' : 'none'}
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={active ? 0 : 2}
            d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
          />
        </svg>
      ),
    },
    {
      name: 'Profile',
      href: user ? '/profile' : '/login',
      icon: (active: boolean) => (
        <svg
          className={`w-6 h-6 ${active ? 'text-red-600' : 'text-gray-600'}`}
          fill={active ? 'currentColor' : 'none'}
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={active ? 0 : 2}
            d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
          />
        </svg>
      ),
    },
  ]

  return (
    <>
      {/* Mobile Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 z-40 bg-white border-t border-gray-200 shadow-lg md:hidden">
        <div className="flex items-center justify-around h-16">
          {navItems.map((item) => {
            const isActive = pathname === item.href
            const isCreate = item.name === 'Create'

            if (item.onClick) {
              return (
                <button
                  key={item.name}
                  onClick={item.onClick}
                  className="flex flex-col items-center justify-center flex-1 h-full transition-colors"
                  aria-label={item.name}
                >
                  {item.icon()}
                </button>
              )
            }

            return (
              <Link
                key={item.name}
                href={item.href}
                className={`flex flex-col items-center justify-center flex-1 h-full transition-colors ${
                  isCreate ? 'relative' : ''
                }`}
                aria-label={item.name}
              >
                {item.icon(isActive)}
                {!isCreate && (
                  <span
                    className={`text-xs mt-1 font-medium ${
                      isActive ? 'text-red-600' : 'text-gray-600'
                    }`}
                  >
                    {item.name}
                  </span>
                )}
              </Link>
            )
          })}
        </div>
      </nav>

      {/* Spacer to prevent content from being hidden behind nav */}
      <div className="h-16 md:hidden" />

      {/* Create Pin Modal */}
      {user && (
        <CreatePinModal
          isOpen={isCreateModalOpen}
          onClose={() => setIsCreateModalOpen(false)}
        />
      )}
    </>
  )
}
