'use client'

import { useState, useEffect, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { Profile } from '@/types/database'
import { friendlyErrorMessage } from '@/lib/supabase/errors'
import { buildPresetRef, resolveAvatarView, EMPTY_AVATAR, type AvatarView } from '@/lib/avatar'

export type { AvatarView }

export function useProfile() {
  const [profile, setProfile] = useState<Profile | null>(null)
  const [email, setEmail] = useState<string | null>(null)
  const [avatar, setAvatar] = useState<AvatarView>(EMPTY_AVATAR)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetch = useCallback(async () => {
    setLoading(true)
    setError(null)

    const supabase = createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      setLoading(false)
      setError('Sessão expirada. Entre novamente.')
      return
    }

    const { data, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single()

    if (profileError) {
      setLoading(false)
      setError(
        friendlyErrorMessage(
          profileError,
          'Não foi possível carregar seu perfil. Verifique se as migrations foram aplicadas no Supabase.'
        )
      )
      return
    }

    const row = data as Profile
    setProfile(row)
    setEmail(user.email ?? null)
    setAvatar(resolveAvatarView(row.avatar_url))
    setLoading(false)
  }, [])

  useEffect(() => { fetch() }, [fetch])

  /**
   * Mantém `profiles` e os metadados do Auth alinhados. O app lê o nome de
   * `profiles`, mas o registro original do Auth também guarda `full_name`;
   * deixar os dois em sincronia evita nomes divergentes em e-mails futuros.
   */
  async function updateName(fullName: string) {
    const supabase = createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (!user) throw new Error('Sessão expirada. Entre novamente.')

    const { error: metaError } = await supabase.auth.updateUser({
      data: { full_name: fullName },
    })
    if (metaError) throw new Error(metaError.message)

    const { error: profileError } = await supabase
      .from('profiles')
      .update({ full_name: fullName })
      .eq('id', user.id)

    if (profileError) throw new Error(profileError.message)

    setProfile((current) => (current ? { ...current, full_name: fullName } : current))
    return fullName
  }

  /**
   * Trocar o e-mail não cria uma conta nova: o usuário mantém o mesmo id,
   * então transações, categorias e perfil seguem intactos. Se a confirmação
   * por e-mail estiver ativa no projeto, a troca só vale depois do clique no
   * link enviado — por isso devolvemos o e-mail atualmente válido.
   */
  async function updateEmail(newEmail: string) {
    const supabase = createClient()
    const { data, error: updateError } = await supabase.auth.updateUser({
      email: newEmail,
    })
    if (updateError) throw new Error(updateError.message)

    const currentEmail = data.user?.email ?? null
    setEmail(currentEmail)
    return { email: currentEmail, pendingConfirmation: currentEmail !== newEmail }
  }

  async function setPresetAvatar(presetId: string, emoji: string, color: string) {
    const supabase = createClient()
    await writeAvatarRef(supabase, buildPresetRef(presetId))
    setAvatar({ emoji, color })
  }

  async function clearAvatar() {
    const supabase = createClient()
    await writeAvatarRef(supabase, null)
    setAvatar(EMPTY_AVATAR)
  }

  /**
   * Portabilidade dos dados (acesso do titular, p.ex. LGPD art. 18 / GDPR
   * art. 20). Lê com o JWT do próprio usuário, então a RLS já garante que
   * só sai o que pertence a ele.
   */
  async function exportData() {
    const supabase = createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (!user) throw new Error('Sessão expirada. Entre novamente.')

    const [profileRes, categoriesRes, transactionsRes] = await Promise.all([
      supabase.from('profiles').select('*').eq('id', user.id).single(),
      supabase.from('categories').select('*').order('name'),
      supabase.from('transactions').select('*').order('date', { ascending: false }),
    ])

    const firstError =
      profileRes.error ?? categoriesRes.error ?? transactionsRes.error
    if (firstError) throw new Error(firstError.message)

    const payload = {
      exportedAt: new Date().toISOString(),
      account: {
        id: user.id,
        email: user.email,
        createdAt: user.created_at,
        lastSignInAt: user.last_sign_in_at,
      },
      profile: profileRes.data,
      categories: categoriesRes.data ?? [],
      transactions: transactionsRes.data ?? [],
    }

    const blob = new Blob([JSON.stringify(payload, null, 2)], {
      type: 'application/json',
    })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `financeflow-dados-${new Date().toISOString().slice(0, 10)}.json`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
  }

  return {
    profile,
    email,
    avatar,
    loading,
    error,
    refetch: fetch,
    updateName,
    updateEmail,
    setPresetAvatar,
    clearAvatar,
    exportData,
  }
}

async function writeAvatarRef(
  supabase: ReturnType<typeof createClient>,
  value: string | null
) {
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) throw new Error('Sessão expirada. Entre novamente.')

  const { error } = await supabase
    .from('profiles')
    .update({ avatar_url: value })
    .eq('id', user.id)

  if (error) throw new Error(error.message)
}
