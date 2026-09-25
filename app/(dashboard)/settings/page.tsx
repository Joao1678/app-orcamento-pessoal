'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useProfile } from '@/hooks/useProfile'
import { Card } from '@/components/ui/Card'
import { ProfileInfo } from '@/components/settings/ProfileInfo'
import { AvatarPicker } from '@/components/settings/AvatarPicker'
import { PrivacySection } from '@/components/settings/PrivacySection'
import { DangerZone } from '@/components/settings/DangerZone'
import styles from './page.module.css'

interface Counts {
  categories: number
  transactions: number
}

export default function SettingsPage() {
  const {
    profile,
    email,
    avatar,
    loading,
    error,
    updateName,
    updateEmail,
    setPresetAvatar,
    clearAvatar,
    exportData,
  } = useProfile()

  const [userId, setUserId] = useState('')
  const [counts, setCounts] = useState<Counts | null>(null)

  useEffect(() => {
    let active = true

    async function loadContext() {
      const supabase = createClient()
      const {
        data: { user },
      } = await supabase.auth.getUser()
      if (!user || !active) return

      setUserId(user.id)

      // Contagens só alimentam os textos de aviso; falha aqui não deve
      // impedir o resto da página de funcionar.
      const [categoriesRes, transactionsRes] = await Promise.all([
        supabase.from('categories').select('id', { count: 'exact', head: true }),
        supabase.from('transactions').select('id', { count: 'exact', head: true }),
      ])

      if (!active) return
      setCounts({
        categories: categoriesRes.count ?? 0,
        transactions: transactionsRes.count ?? 0,
      })
    }

    void loadContext()
    return () => {
      active = false
    }
  }, [])

  return (
    <div className={styles.page}>
      <header className={styles.pageHeader}>
        <div>
          <h1 className={styles.pageTitle}>Configurações da conta</h1>
          <p className={styles.pageSubtitle}>
            Gerencie seus dados, sua foto e sua privacidade
          </p>
        </div>
      </header>

      {error && (
        <div className={styles.errorBanner} role="alert">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="12" cy="12" r="10" />
            <line x1="12" y1="8" x2="12" y2="12" />
            <line x1="12" y1="16" x2="12.01" y2="16" />
          </svg>
          <span>{error}</span>
        </div>
      )}

      {loading ? (
        <Card padding="lg">
          <div className={styles.loading} role="status" aria-live="polite">
            <span className={styles.spinner} aria-hidden="true" />
            <span>Carregando suas configurações...</span>
          </div>
        </Card>
      ) : profile ? (
        <>
          <Card padding="lg">
            <h2 className={styles.sectionTitle}>Informações da conta</h2>
            <p className={styles.sectionHint}>
              Seu nome aparece no menu lateral. O e-mail é a identidade da sua
              conta e não pode ser duplicado.
            </p>
            <div className={styles.stack}>
              <ProfileInfo
                fullName={profile.full_name}
                email={email}
                createdAt={profile.created_at}
                currency={profile.currency}
                userId={userId}
                onUpdateName={updateName}
                onUpdateEmail={updateEmail}
              />
            </div>
          </Card>

          <Card padding="lg">
            <h2 className={styles.sectionTitle}>Avatar do perfil</h2>
            <p className={styles.sectionHint}>
              Escolha como você aparece no menu lateral.
            </p>
            <div className={styles.stack}>
              <AvatarPicker
                avatar={avatar}
                name={profile.full_name ?? undefined}
                email={email ?? undefined}
                onSelectPreset={setPresetAvatar}
                onClear={clearAvatar}
              />
            </div>
          </Card>

          <Card padding="lg">
            <h2 className={styles.sectionTitle}>Privacidade e dados</h2>
            <p className={styles.sectionHint}>
              O que guardamos, quem tem acesso e como levar uma cópia.
            </p>
            <div className={styles.stack}>
              <PrivacySection onExport={exportData} counts={counts} />
            </div>
          </Card>

          <Card padding="lg" className={styles.dangerCard}>
            <h2 className={styles.sectionTitle}>Zona de perigo</h2>
            <div className={styles.stack}>
              <DangerZone email={email} counts={counts} onExport={exportData} />
            </div>
          </Card>
        </>
      ) : null}
    </div>
  )
}
