'use client'

import { useState } from 'react'
import type { AvatarView } from '@/hooks/useProfile'
import { AVATAR_PRESETS } from '@/lib/avatar'
import { Avatar } from '@/components/ui/Avatar'
import { Button } from '@/components/ui/Button'
import styles from './AvatarPicker.module.css'

interface AvatarPickerProps {
  avatar: AvatarView
  name?: string
  email?: string
  onSelectPreset: (presetId: string, emoji: string, color: string) => Promise<unknown>
  onClear: () => Promise<unknown>
}

export function AvatarPicker({ avatar, name, email, onSelectPreset, onClear }: AvatarPickerProps) {
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')

  async function run(action: () => Promise<unknown>) {
    setBusy(true)
    setError('')
    try {
      await action()
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Não foi possível atualizar o avatar.')
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className={styles.picker}>
      <div className={styles.preview}>
        <Avatar
          emoji={avatar.emoji}
          color={avatar.color ?? undefined}
          name={name}
          email={email}
          size={80}
        />
        <div className={styles.previewText}>
          <p className={styles.previewTitle}>Avatar do perfil</p>
          <p className={styles.previewHint}>
            Escolha um dos avatares abaixo. Ele aparece no menu lateral, ao lado do seu nome.
          </p>
        </div>
      </div>

      <div className={styles.section}>
        <p className={styles.sectionLabel} id="avatar-presets-label">
          Avatares
        </p>
        <div className={styles.presetGrid} role="radiogroup" aria-labelledby="avatar-presets-label">
          {AVATAR_PRESETS.map((preset) => {
            const selected = avatar.emoji === preset.emoji
            return (
              <button
                key={preset.id}
                type="button"
                role="radio"
                aria-checked={selected}
                aria-label={preset.label}
                title={preset.label}
                disabled={busy}
                className={`${styles.preset} ${selected ? styles.presetSelected : ''}`}
                style={{ background: preset.color }}
                onClick={() =>
                  void run(() => onSelectPreset(preset.id, preset.emoji, preset.color))
                }
              >
                <span className={styles.presetEmoji}>{preset.emoji}</span>
              </button>
            )
          })}
        </div>
      </div>

      {avatar.emoji && (
        <div>
          <Button type="button" variant="ghost" loading={busy} onClick={() => void run(onClear)}>
            Usar iniciais do nome
          </Button>
        </div>
      )}

      {error && (
        <p className={styles.error} role="alert">
          {error}
        </p>
      )}
    </div>
  )
}
