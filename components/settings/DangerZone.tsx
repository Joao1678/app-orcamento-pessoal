'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import styles from './DangerZone.module.css'

const CONFIRM_WORD = 'EXCLUIR'

/**
 * Quantas confirmações explícitas o usuário precisa dar antes da conta ser
 * removida. A regra de segurança do projeto exige três etapas: primeiro o
 * usuário pide ver a área de perigo, depois confirma a intenção, e só então
 * destrava o botão destrutivo. Vale notar que a remoção é irreversível —
 * não há como desfazer, e o botão some depois.
 */
const CONFIRMATION_STEPS = 3

interface DangerZoneProps {
  email: string | null
  counts: { categories: number; transactions: number } | null
  /** Usado para sugerir a alternativa não destrutiva antes da exclusão. */
  onExport: () => Promise<void>
}

type Step = 'idle' | 'review' | 'confirm' | 'armed'

export function DangerZone({ email, counts, onExport }: DangerZoneProps) {
  const router = useRouter()
  const [step, setStep] = useState<Step>('idle')
  const [password, setPassword] = useState('')
  const [confirmation, setConfirmation] = useState('')
  const [busy, setBusy] = useState(false)
  const [exported, setExported] = useState(false)
  const [exporting, setExporting] = useState(false)
  const [error, setError] = useState('')

  const confirmMatches = confirmation.trim().toUpperCase() === CONFIRM_WORD
  const canDelete = step === 'armed' && confirmMatches && password.length > 0 && !busy

  function reset() {
    setStep('idle')
    setConfirmation('')
    setPassword('')
    setError('')
  }

  async function handleExport() {
    setExporting(true)
    try {
      await onExport()
      setExported(true)
    } catch (err: unknown) {
      setError(
        err instanceof Error ? err.message : 'Não foi possível exportar seus dados.'
      )
    } finally {
      setExporting(false)
    }
  }

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

  const stepNumber =
    step === 'review' ? 1 : step === 'confirm' ? 2 : step === 'armed' ? 3 : 0

  if (step === 'idle') {
    return (
      <div className={styles.collapsed}>
        <div>
          <h3 className={styles.title}>Excluir conta</h3>
          <p className={styles.text}>
            Apaga a conta e todos os dados associados. Esta ação não pode ser desfeita.
          </p>
        </div>
        <Button type="button" variant="danger" onClick={() => setStep('review')}>
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

      {/* Indicador das três etapas */}
      <ol className={styles.steps} aria-label={`Etapa ${stepNumber} de ${CONFIRMATION_STEPS}`}>
        {Array.from({ length: CONFIRMATION_STEPS }, (_, i) => {
          const current = stepNumber
          const state = i + 1 < current ? 'done' : i + 1 === current ? 'current' : 'pending'
          return (
            <li
              key={i}
              className={styles.stepItem}
              data-state={state}
              aria-current={state === 'current' ? 'step' : undefined}
            >
              <span className={styles.stepDot}>{i + 1}</span>
              <span className={styles.stepLabel}>
                {i === 0
                  ? 'Entender o impacto'
                  : i === 1
                    ? 'Confirmar a intenção'
                    : 'Desbloquear exclusão'}
              </span>
            </li>
          )
        })}
      </ol>

      {/* Etapa 1 — impacto + alternativa não destrutiva */}
      {step === 'review' && (
        <>
          <div>
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
          </div>

          <div className={styles.alternative}>
            <p className={styles.alternativeTitle}>
              Antes de continuar, considere manter uma cópia
            </p>
            <p className={styles.alternativeText}>
              A exclusão não tem como ser desfeita. Se você só quer uma cópia
              do que registrou, baixar os dados resolve e não afeta nada na
              sua conta.
            </p>
            <div className={styles.alternativeActions}>
              <Button
                type="button"
                variant="secondary"
                loading={exporting}
                onClick={handleExport}
              >
                {exported ? 'Baixar novamente' : 'Baixar meus dados (JSON)'}
              </Button>
              {exported && (
                <span className={styles.alternativeDone} role="status">
                  Cópia gerada neste dispositivo.
                </span>
              )}
            </div>
          </div>
        </>
      )}

      {/* Etapa 2 — intenção */}
      {step === 'confirm' && (
        <div className={styles.confirmBlock}>
          <p className={styles.text}>
            Confirme que entende: a conta será removida e o acesso perdido.
          </p>
          <Button
            type="button"
            variant="danger"
            fullWidth
            onClick={() => setStep('armed')}
          >
            Entendo, quero excluir mesmo assim
          </Button>
        </div>
      )}

      {/* Etapa 3 — credenciais */}
      {step === 'armed' && (
        <div className={styles.confirmBlock}>
          <p className={styles.text}>
            Última etapa: informe sua senha e digite <strong>{CONFIRM_WORD}</strong> para
            concluir.
          </p>
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
      )}

      {error && (
        <p className={styles.error} role="alert">{error}</p>
      )}

      <div className={styles.actions}>
        {step === 'review' && (
          <Button type="button" variant="ghost" onClick={reset} disabled={busy}>
            Cancelar
          </Button>
        )}

        {step === 'confirm' && (
          <Button
            type="button"
            variant="ghost"
            onClick={() => setStep('review')}
            disabled={busy}
          >
            Voltar
          </Button>
        )}

        {step === 'armed' && (
          <>
            <Button
              type="button"
              variant="ghost"
              onClick={() => setStep('confirm')}
              disabled={busy}
            >
              Voltar
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
          </>
        )}
      </div>
    </div>
  )
}
