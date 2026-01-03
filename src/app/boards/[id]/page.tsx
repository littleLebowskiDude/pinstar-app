import { createClient } from '@/lib/supabase/server'
import { notFound, redirect } from 'next/navigation'
import Link from 'next/link'
import BoardView from '@/components/boards/BoardView'

interface BoardPageProps {
  params: Promise<{ id: string }>
}

async function getBoard(id: string, userId?: string) {
  const supabase = await createClient()

  const { data: board, error } = await supabase
    .from('boards')
    .select(`
      *,
      profiles:owner_id (
        id,
        username,
        display_name,
        avatar_url
      ),
      board_pins (
        pin_id,
        position,
        added_at,
        pins (
          id,
          title,
          description,
          image_url,
          image_width,
          image_height,
          source_url,
          source,
          attribution
        )
      )
    `)
    .eq('id', id)
    .single()

  if (error || !board) {
    return null
  }

  // Check if user has access to this board
  if (board.is_private && board.owner_id !== userId) {
    return null
  }

  return board
}

export default async function BoardPage({ params }: BoardPageProps) {
  const { id } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const board = await getBoard(id, user?.id)

  if (!board) {
    notFound()
  }

  // Check if user is the owner
  const isOwner = user?.id === board.owner_id

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-[1260px] mx-auto px-4 py-8">
        {/* Back Button */}
        <Link
          href="/boards"
          className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors mb-6"
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
          Back to Boards
        </Link>

        <BoardView boardId={id} initialBoard={board} />
      </div>
    </div>
  )
}

// Generate metadata for SEO
export async function generateMetadata({ params }: BoardPageProps) {
  const { id } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const board = await getBoard(id, user?.id)

  if (!board) {
    return {
      title: 'Board Not Found',
    }
  }

  return {
    title: `${board.name} | PinStar`,
    description: board.description || `View pins in ${board.name}`,
  }
}
