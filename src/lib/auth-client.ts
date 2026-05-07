// Client-side auth utilities
// These call our API routes and NextAuth endpoints

interface SignInResult {
  ok?: boolean
  error?: string
  url?: string
}

interface SignUpResult {
  ok?: boolean
  error?: string
}

export async function signIn({ email, password }: { email: string; password: string }): Promise<SignInResult> {
  try {
    const res = await fetch('/api/auth/callback/credentials', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    })

    if (!res.ok) {
      return { error: 'Credenciales inválidas' }
    }

    return { ok: true, url: '/spaces' }
  } catch {
    return { error: 'Error de conexión' }
  }
}

export async function signUp({ name, email, password }: { name: string; email: string; password: string }): Promise<SignUpResult> {
  try {
    const res = await fetch('/api/auth/signup', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, email, password }),
    })

    const data = await res.json()

    if (!res.ok) {
      return { error: data.error || 'Error al crear la cuenta' }
    }

    return { ok: true }
  } catch {
    return { error: 'Error de conexión' }
  }
}

export async function getSession() {
  try {
    const res = await fetch('/api/auth/session')
    if (!res.ok) return null
    const data = await res.json()
    return data?.session || null
  } catch {
    return null
  }
}

export async function signOut() {
  try {
    await fetch('/api/auth/signout', { method: 'POST' })
    window.location.href = '/login'
  } catch {
    window.location.href = '/login'
  }
}
