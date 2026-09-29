import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  const rawNext = searchParams.get('next') ?? '/'

  // Proteção contra open redirect: garante que 'next' seja um caminho relativo seguro
  const next = rawNext.startsWith('/') && !rawNext.startsWith('//') ? rawNext : '/'

  const forwardedHost = request.headers.get('x-forwarded-host')
  const isLocalEnv = process.env.NODE_ENV === 'development'
  const redirectBase = !isLocalEnv && forwardedHost ? `https://${forwardedHost}` : origin

  if (code) {
    const supabase = await createClient()
    const { error } = await supabase.auth.exchangeCodeForSession(code)
    if (!error) {
      return NextResponse.redirect(`${redirectBase}${next}`)
    }
  }

  return NextResponse.redirect(`${redirectBase}/login?error=auth_callback_failed`)
}
