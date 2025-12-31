'use client'

import { useState, useRef, useEffect } from 'react'
import Link from 'next/link'
import { User } from '@supabase/supabase-js'
import LogoutButton from '@/components/auth/LogoutButton'

interface UserMenuProps {
  user: User
}

export default function UserMenu({ user }: UserMenuProps) {
  const [isOpen, setIsOpen] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)

  // Close menu when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside)
      return () => document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [isOpen])

  // Get user initials for avatar
  const initials = user.email
    ? user.email.substring(0, 2).toUpperCase()
    : 'U'

  return (
    <div className="relative" ref={menuRef}>
      {/* Avatar Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-10 h-10 rounded-full bg-gray-300 hover:bg-gray-400 flex items-center justify-center font-semibold text-gray-700 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500"
        aria-label="User menu"
      >
        {initials}
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-64 bg-white rounded-2xl shadow-xl border border-gray-200 py-2 overflow-hidden">
          {/* User Info */}
          <div className="px-4 py-3 border-b border-gray-100">
            <p className="text-sm font-semibold text-gray-900 truncate">
              {user.email}
            </p>
          </div>

          {/* Menu Items */}
          <div className="py-1">
            <Link
              href="/profile"
              className="block px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
              onClick={() => setIsOpen(false)}
            >
              Profile
            </Link>
            <Link
              href="/boards"
              className="block px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
              onClick={() => setIsOpen(false)}
            >
              Your Boards
            </Link>
            <Link
              href="/settings"
              className="block px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
              onClick={() => setIsOpen(false)}
            >
              Settings
            </Link>
          </div>

          {/* Logout */}
          <div className="border-t border-gray-100 pt-1">
            <div className="px-4 py-2">
              <LogoutButton variant="ghost" className="w-full text-left" />
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
