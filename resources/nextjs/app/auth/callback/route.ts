import { NextResponse } from 'next/server'
// The client you created from the Server-Side Auth instructions
import { createClient } from '@/utils/supabase/server'
import { initializeNewUser } from '@/utils/supabase/admin'

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  const next = searchParams.get('next') ?? '/upload'

  if (!code) {
    // Add error handling for missing code
    return NextResponse.redirect(`${origin}/auth/auth-code-error`)
  }

  try {
    const supabase = await createClient()
    const { error, data } = await supabase.auth.exchangeCodeForSession(code)
   
    if (error) {
      console.error('Auth error:', error)
      return NextResponse.redirect(`${origin}/auth/auth-code-error`)
    }

    if (!data.user) {
      console.error('No user data received')
      return NextResponse.redirect(`${origin}/auth/auth-code-error`)
    }

    // Initialize new user
    const initResult = await initializeNewUser(data.user.id, data.user.email ?? "")
    if (!initResult) {
      console.error('Failed to initialize user')
      // Consider whether to redirect to error page or continue
    }
    // Redirect handling
    const forwardedHost = request.headers.get('x-forwarded-host')
    const isLocalEnv = process.env.NODE_ENV === 'development'
    
    const redirectUrl = isLocalEnv 
      ? `${origin}${next}`
      : forwardedHost 
        ? `https://${forwardedHost}${next}`
        : `${origin}${next}`

    return NextResponse.redirect(redirectUrl)
    
  } catch (err) {
    console.error('Callback error:', err)
    return NextResponse.redirect(`${origin}/auth/auth-code-error`)
  }
}