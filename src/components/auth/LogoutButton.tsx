'use client'

import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { useState } from 'react'

interface LogoutButtonProps {
  className?: string
  variant?: 'default' | 'outline' | 'ghost'
}

export default function LogoutButton({ className = '', variant = 'default' }: LogoutButtonProps) {
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  const handleLogout = async () => {
    setLoading(true)
    try {
      await supabase.auth.signOut()
      router.push('/login')
      router.refresh()
    } catch (error) {
      console.error('Error logging out:', error)
    } finally {
      setLoading(false)
    }
  }

  const baseStyles = 'px-4 py-2 rounded-lg font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed'

  const variantStyles = {
    default: 'bg-red-600 hover:bg-red-700 text-white focus:ring-red-500',
    outline: 'border-2 border-red-600 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 focus:ring-red-500',
    ghost: 'text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 focus:ring-red-500',
  }

  return (
    <button
      onClick={handleLogout}
      disabled={loading}
      className={`${baseStyles} ${variantStyles[variant]} ${className}`}
    >
      {loading ? 'Logging out...' : 'Logout'}
    </button>
  )
}
