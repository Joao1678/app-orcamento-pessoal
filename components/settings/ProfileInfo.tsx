'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import styles from './ProfileInfo.module.css'

interface ProfileInfoProps {
  fullName: string | null
  email: string | null
  createdAt: string | null
  currency: string | null
  userId: string
  onUpdateName: (fullName: string) => Promise<unknown>
  onUpdateEmail: (email: string) => Promise<{ pendingConfirmation: boolean }>
}

function formatMemberSince(createdAt: string | null) {
  if (!createdAt) return '—'
  return new Intl.DateTimeFormat('pt-BR', {
    month: 'long',
    year: 'numeric',
  }).format(new Date(createdAt))
}

export function ProfileInfo({
  fullName,
  email,
  createdAt,
  currency,
  userId,
  onUpdateName,
  onUpdateEmail,
}: ProfileInfoProps) {
  const [name, setName] = useState(fullName ?? '')
  const [newEmail, setNewEmail] = useState('')

  const [nameStatus, setNameStatus] = useState<{ kind: 'ok' | 'error'; text: string } | null>(null)
  const [emailStatus, setEmailStatus] = useState<{ kind: 'ok' | 'error'; text: string } | null>(
    null,
  )
  const [savingName, setSavingName] = useState(false)
  const [savingEmail, setSavingEmail] = useState(false)

  const nameChanged = name.trim() !== (fullName ?? '')
  const emailChanged =
    newEmail.trim() !== '' && newEmail.trim().toLowerCase() !== (email ?? '').toLowerCase()

  async function handleSaveName(e: React.FormEvent) {
    e.preventDefault()
    const trimmed = name.trim()
    if (!trimmed) {
      setNameStatus({ kind: 'error', text: 'O nome não pode ficar vazio.' })
      return
    }

    setSavingName(true)
    setNameStatus(null)
    try {
      await onUpdateName(trimmed)
      setNameStatus({ kind: 'ok', text: 'Nome atualizado.' })
    } catch (err: unknown) {
      setNameStatus({
        kind: 'error',
        text: err instanceof Error ? err.message : 'Não foi possível atualizar o nome.',
      })
    } finally {
      setSavingName(false)
    }
  }

  async function handleSaveEmail(e: React.FormEvent) {
    e.preventDefault()
    const normalized = newEmail.trim().toLowerCase()
    if (!normalized) {
      setEmailStatus({ kind: 'error', text: 'Informe um e-mail.' })
      return
    }
    if (normalized === (email ?? '').toLowerCase()) {
      setEmailStatus({ kind: 'error', text: 'Este já é o seu e-mail atual.' })
      return
    }

    setSavingEmail(true)
    setEmailStatus(null)
    try {
      const { pendingConfirmation } = await onUpdateEmail(normalized)
      setNewEmail('')
      setEmailStatus(
        pendingConfirmation
          ? {
              kind: 'ok',
              text: 'Enviamos um link de confirmação para o novo e-mail. A troca vale depois de você abri-lo.',
            }
          : { kind: 'ok', text: 'E-mail atualizado.' },
      )
    } catch (err: unknown) {
      setEmailStatus({
        kind: 'error',
        text: err instanceof Error ? err.message : 'Não foi possível atualizar o e-mail.',
      })
    } finally {
      setSavingEmail(false)
    }
  }

  return (
    <>
      <form className={styles.form} onSubmit={handleSaveName} noValidate>
        <Input
          label="Nome completo"
          type="text"
          id="settings-name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          autoComplete="name"
          required
        />
        {nameStatus && (
          <p className={nameStatus.kind === 'ok' ? styles.ok : styles.error} role="status">
            {nameStatus.text}
          </p>
        )}
        <div className={styles.actions}>
          <Button type="submit" loading={savingName} disabled={!nameChanged}>
            Salvar nome
          </Button>
        </div>
      </form>

      <form className={styles.form} onSubmit={handleSaveEmail} noValidate>
        <div className={styles.field}>
          <Input
            label="E-mail atual"
            type="email"
            id="settings-email-current"
            value={email ?? ''}
            readOnly
            disabled
          />
          <p className={styles.hint}>
            O e-mail faz parte da sua conta. Trocá-lo não cria uma conta nova: seu id, transações,
            categorias e perfil permanecem os mesmos.
          </p>
        </div>

        <Input
          label="Novo e-mail"
          type="email"
          id="settings-email-new"
          value={newEmail}
          onChange={(e) => setNewEmail(e.target.value)}
          placeholder="novo@email.com"
          autoComplete="email"
        />

        {emailStatus && (
          <p className={emailStatus.kind === 'ok' ? styles.ok : styles.error} role="status">
            {emailStatus.text}
          </p>
        )}

        <div className={styles.actions}>
          <Button type="submit" loading={savingEmail} disabled={!emailChanged}>
            Alterar e-mail
          </Button>
        </div>
      </form>

      <dl className={styles.meta}>
        <div className={styles.metaRow}>
          <dt>Membro desde</dt>
          <dd>{formatMemberSince(createdAt)}</dd>
        </div>
        <div className={styles.metaRow}>
          <dt>Moeda</dt>
          <dd>{currency ?? 'BRL'}</dd>
        </div>
        <div className={styles.metaRow}>
          <dt>Identificador da conta</dt>
          <dd className={styles.mono}>{userId}</dd>
        </div>
      </dl>
    </>
  )
}
