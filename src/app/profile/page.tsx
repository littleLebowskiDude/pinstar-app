import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import ProfileContent from '@/components/profile/ProfileContent'

export const metadata = {
  title: 'My Profile',
}

export default async function ProfilePage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <ProfileContent user={user} />
    </div>
  )
}
