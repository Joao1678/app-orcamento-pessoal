import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { Sidebar } from '@/components/layout/Sidebar'
import { resolveAvatarView } from '@/lib/avatar'
import styles from './layout.module.css'

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('full_name, avatar_url')
    .eq('id', user.id)
    .single()

  return (
    <div className={styles.layout}>
      <Sidebar
        userEmail={user.email}
        userName={profile?.full_name ?? undefined}
        avatar={resolveAvatarView(profile?.avatar_url)}
      />
      <main className={styles.main}>
        {children}
      </main>
    </div>
  )
}
