import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import BoardsGrid from '@/components/boards/BoardsGrid'

export const metadata = {
  title: 'Your Boards | PinStar',
  description: 'Organize your pins into boards',
}

export default async function BoardsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-[1260px] mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Your Boards
          </h1>
          <p className="text-gray-600">
            Organize and manage your pin collections
          </p>
        </div>

        {/* Boards Grid */}
        <BoardsGrid />
      </div>
    </div>
  )
}
