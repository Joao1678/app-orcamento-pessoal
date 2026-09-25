'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import styles from './DangerZone.module.css'

const CONFIRM_WORD = 'EXCLUIR'

interface DangerZoneProps {
  email: string | null
  counts: { categories: number; transactions: number } | null
}

export function DangerZone({ email, counts }: DangerZoneProps) {
  const router = useRouter()
  const [revealed, setRevealed] = useState(false)
  const [password, setPassword] = useState('')
  const [confirmation, setConfirmation] = useState('')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')

  const confirmMatches = confirmation.trim().toUpperCase() === CONFIRM_WORD
  const canDelete = confirmMatches && password.length > 0 && !busy

  async function handleDelete() {
    setBusy(true)
    setError('')

    const supabase = createClient()

    try {
      // Reautenticar antes de apagar: a sessão pode estar antiga e o
      // usuário pode não estar diante da própria tela.
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: email ?? '',
        password,
      })

      if (signInError) {
        setError('Senha incorreta. Confira e tente novamente.')
        return
      }

      const response = await fetch('/api/account/delete', { method: 'DELETE' })

      if (!response.ok) {
        const body = (await response.json().catch(() => null)) as { error?: string } | null
        setError(body?.error ?? 'Não foi possível excluir a conta. Tente novamente.')
        return
      }

      // A conta foi removida; encerra a sessão local e leva para o login.
      await supabase.auth.signOut()
      router.push('/login')
      router.refresh()
    } catch {
      setError('Não foi possível excluir a conta. Tente novamente.')
    } finally {
      setBusy(false)
    }
  }

  if (!revealed) {
    return (
      <div className={styles.collapsed}>
        <div>
          <h3 className={styles.title}>Excluir conta</h3>
          <p className={styles.text}>
            Apaga a conta e todos os dados associados. Esta ação não pode ser desfeita.
          </p>
        </div>
        <Button type="button" variant="danger" onClick={() => setRevealed(true)}>
          Excluir minha conta
        </Button>
      </div>
    )
  }

  return (
    <div className={styles.panel}>
      <div className={styles.warning} role="alert">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/>
          <line x1="12" y1="9" x2="12" y2="13"/>
          <line x1="12" y1="17" x2="12.01" y2="17"/>
        </svg>
        <div>
          <p className={styles.warningTitle}>Isto apagará seus dados definitivamente</p>
          <p className={styles.warningText}>
            Sem cópia de segurança, sem como reverter. A exclusão é imediata e
            permanente.
          </p>
        </div>
      </div>

      <p className={styles.text}>Serão removidos:</p>
      <ul className={styles.list}>
        <li>Sua conta e o acesso ao aplicativo.</li>
        <li>
          {counts
            ? `Suas ${counts.transactions} transação(ões) e ${counts.categories} categoria(s).`
            : 'Suas transações e categorias.'}
        </li>
        <li>Seu avatar, nome e e-mail cadastrados.</li>
      </ul>

      <div className={styles.confirmBlock}>
        <Input
          label="Digite sua senha para confirmar"
          type="password"
          id="delete-password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          showPasswordToggle
          autoComplete="current-password"
        />

        <Input
          label={`Digite ${CONFIRM_WORD} para confirmar`}
          type="text"
          id="delete-confirm-word"
          value={confirmation}
          onChange={(e) => setConfirmation(e.target.value)}
          placeholder={CONFIRM_WORD}
          autoComplete="off"
        />
      </div>

      {error && (
        <p className={styles.error} role="alert">{error}</p>
      )}

      <div className={styles.actions}>
        <Button
          type="button"
          variant="ghost"
          onClick={() => {
            setRevealed(false)
            setConfirmation('')
            setPassword('')
            setError('')
          }}
          disabled={busy}
        >
          Cancelar
        </Button>
        <Button
          type="button"
          variant="danger"
          loading={busy}
          disabled={!canDelete}
          onClick={handleDelete}
        >
          Excluir conta e todos os dados
        </Button>
      </div>
    </div>
  )
}
