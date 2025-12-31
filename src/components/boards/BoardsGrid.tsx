'use client'

import { useState } from 'react'
import { trpc } from '@/lib/trpc/client'
import BoardCard from './BoardCard'
import CreateBoardModal from './CreateBoardModal'
import { BoardsGridSkeleton } from '@/components/ui/Skeleton'
import { NoBoardsEmptyState } from '@/components/ui/EmptyState'

export default function BoardsGrid() {
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)

  const { data: boards = [], isLoading } = trpc.boards.getMyBoards.useQuery()

  if (isLoading) {
    return <BoardsGridSkeleton count={9} />
  }

  return (
    <>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
        {/* Create Board Card */}
        <button
          onClick={() => setIsCreateModalOpen(true)}
          className="group block"
        >
          <div className="relative rounded-2xl overflow-hidden bg-gray-50 hover:bg-gray-100 border-2 border-dashed border-gray-300 hover:border-gray-400 shadow-sm hover:shadow-xl transition-all duration-300">
            <div className="relative w-full aspect-[4/3] flex flex-col items-center justify-center gap-2">
              <svg
                className="w-12 h-12 text-gray-400 group-hover:text-gray-500 transition-colors"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 4v16m8-8H4"
                />
              </svg>
              <span className="text-sm font-semibold text-gray-600 group-hover:text-gray-700 transition-colors">
                Create Board
              </span>
            </div>
          </div>
        </button>

        {/* Board Cards */}
        {boards.map((board: any) => (
          <BoardCard key={board.id} board={board} />
        ))}
      </div>

      {boards.length === 0 && (
        <div className="col-span-full">
          <NoBoardsEmptyState onCreateClick={() => setIsCreateModalOpen(true)} />
        </div>
      )}

      <CreateBoardModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
      />
    </>
  )
}
