import { createClient } from '@supabase/supabase-js'

/**
 * Cliente Supabase com privilégio de service role.
 *
 * ATENÇÃO: esta chave contorna RLS e não pode ser usada no
 * navegador. É seguro porque a variável NÃO é `NEXT_PUBLIC_`:
 * o Next.js a substitui por `undefined` em qualquer bundle do
 * cliente. Mesmo assim, este módulo só deve ser importado por
 * Route Handlers e Server Components (app/api/**).
 */
export function createAdminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!url || !serviceRoleKey) {
    throw new Error(
      'SUPABASE_SERVICE_ROLE_KEY não configurada. Adicione a chave em .env.local.'
    )
  }

  return createClient(url, serviceRoleKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  })
}
