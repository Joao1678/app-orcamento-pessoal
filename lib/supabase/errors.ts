/**
 * Tradução de erros do Supabase para mensagens que fazem sentido na interface.
 *
 * A regra de segurança do projeto exige tratamento explícito de 401/403 em
 * qualquer comunicação com API externa. Sem isso, uma sessão expirada ou uma
 * negativa da RLS apareceria como "Failed to fetch" ou como a mensagem crua
 * do PostgREST, sem dizer ao usuário o que fazer.
 */

export type AuthErrorKind = 'unauthenticated' | 'forbidden' | 'unknown'

interface SupabaseLikeError {
  message: string
  status?: number
  code?: string
}

/** códigos que o GoTrue/PostgREST usam para sessão e permissão. */
const UNAUTHENTICATED_CODES = new Set([
  'PGRST301', // token expirou / ausente no header
  '42501',    // sem privilégio (RLS)
])

const FORBIDDEN_CODES = new Set([
  '42501',
  'PGRST301',
])

function statusOf(error: SupabaseLikeError | null | undefined): number | null {
  if (!error) return null
  if (typeof error.status === 'number') return error.status

  const match = error.message?.match(/\b(4\d{2})\b/)
  return match ? Number(match[1]) : null
}

export function classifyError(
  error: SupabaseLikeError | null | undefined
): AuthErrorKind {
  if (!error) return 'unknown'

  const status = statusOf(error)
  const code = error.code

  if (status === 401 || (code && UNAUTHENTICATED_CODES.has(code))) {
    return 'unauthenticated'
  }
  if (status === 403 || (code && FORBIDDEN_CODES.has(code))) {
    return 'forbidden'
  }
  return 'unknown'
}

/** Mensagem pronta para exibir, conforme a causa. */
export function friendlyErrorMessage(
  error: SupabaseLikeError | null | undefined,
  fallback = 'Não foi possível concluir a operação. Tente novamente.'
): string {
  switch (classifyError(error)) {
    case 'unauthenticated':
      return 'Sua sessão expirou. Entre novamente para continuar.'
    case 'forbidden':
      return 'Você não tem permissão para acessar estes dados.'
    default:
      return error?.message || fallback
  }
}
