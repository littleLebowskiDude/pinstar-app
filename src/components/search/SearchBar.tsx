'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { trpc } from '@/lib/trpc/client'
import SearchResults from './SearchResults'

export default function SearchBar() {
  const router = useRouter()
  const [query, setQuery] = useState('')
  const [debouncedQuery, setDebouncedQuery] = useState('')
  const [showResults, setShowResults] = useState(false)
  const searchRef = useRef<HTMLDivElement>(null)

  // Debounce search query (300ms)
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(query)
    }, 300)

    return () => clearTimeout(timer)
  }, [query])

  // Fetch search results
  const { data, isLoading } = trpc.search.all.useQuery(
    {
      query: debouncedQuery,
      pinLimit: 5,
      boardLimit: 3,
    },
    {
      enabled: debouncedQuery.length > 0,
    }
  )

  // Show results when we have a query and data
  useEffect(() => {
    if (debouncedQuery.length > 0 && data) {
      setShowResults(true)
    } else {
      setShowResults(false)
    }
  }, [debouncedQuery, data])

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        searchRef.current &&
        !searchRef.current.contains(event.target as Node)
      ) {
        setShowResults(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  // Handle keyboard events
  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === 'Enter' && query.trim()) {
        e.preventDefault()
        router.push(`/search?q=${encodeURIComponent(query.trim())}`)
        setShowResults(false)
        // Optional: blur the input
        if (e.currentTarget) {
          e.currentTarget.blur()
        }
      } else if (e.key === 'Escape') {
        setShowResults(false)
      }
    },
    [query, router]
  )

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setQuery(e.target.value)
  }

  const handleCloseResults = () => {
    setShowResults(false)
  }

  return (
    <div ref={searchRef} className="relative flex-1 max-w-2xl">
      <div className="relative">
        <input
          type="text"
          value={query}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          placeholder="Search pins and boards..."
          className="w-full px-4 py-2 pl-10 pr-4 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 bg-gray-100 dark:bg-gray-700 border border-transparent rounded-full focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent focus:bg-white dark:focus:bg-gray-600 transition-all"
        />
        <svg
          className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 dark:text-gray-500"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
          />
        </svg>
      </div>

      {/* Search Results Dropdown */}
      {showResults && (
        <SearchResults
          query={debouncedQuery}
          pins={data?.pins || []}
          boards={data?.boards || []}
          isLoading={isLoading}
          onClose={handleCloseResults}
        />
      )}
    </div>
  )
}
