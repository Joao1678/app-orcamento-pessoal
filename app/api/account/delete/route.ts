import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'

/**
 * Exclui a conta do usuário autenticado e todos os dados ligados a ela.
 *
 * Por que um Route Handler? Porque `auth.admin.deleteUser` só existe no
 * escopo admin (service role). Não há self-service no GoTrue.
 *
 * Os dados no Postgres caem sozinhos: public.profiles referencia
 * auth.users com ON DELETE CASCADE, e categorias/transações referenciam
 * profiles com o mesmo cascade. Não é preciso apagar tabela por tabela.
 */
export async function DELETE() {
  // Identidade vem da sessão do cookie, nunca do corpo da requisição,
  // para que o usuário só consiga apagar a própria conta.
  const supabase = await createClient()
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser()

  if (authError || !user) {
    return NextResponse.json(
      { error: 'Sessão inválida ou expirada. Entre novamente e tente de novo.' },
      { status: 401 }
    )
  }

  let admin
  try {
    admin = createAdminClient()
  } catch {
    // Falha de configuração, não do usuário: 500 é apropriado.
    return NextResponse.json(
      { error: 'Exclusão de conta indisponível neste ambiente (falta configuração no servidor).' },
      { status: 500 }
    )
  }

  const { error: deleteError } = await admin.auth.admin.deleteUser(user.id)

  if (deleteError) {
    return NextResponse.json(
      { error: `Não foi possível excluir a conta: ${deleteError.message}` },
      { status: 500 }
    )
  }

  return NextResponse.json({ ok: true })
}
