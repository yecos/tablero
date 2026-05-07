'use client'

import { useState } from 'react'
import { signIn, signUp } from '@/lib/auth-client'
import { Sparkles, Mail, Lock, User, ArrowRight, Eye, EyeOff } from 'lucide-react'
import { cn } from '@/lib/utils'
import Link from 'next/link'

export default function LoginPage() {
  const [isLogin, setIsLogin] = useState(true)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [name, setName] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setSuccess('')
    setLoading(true)

    try {
      if (isLogin) {
        const result = await signIn({ email, password })
        if (result?.error) {
          setError(result.error)
        } else {
          window.location.href = '/spaces'
        }
      } else {
        if (!name.trim()) {
          setError('El nombre es requerido')
          setLoading(false)
          return
        }
        if (password.length < 6) {
          setError('La contraseña debe tener al menos 6 caracteres')
          setLoading(false)
          return
        }
        const result = await signUp({ name, email, password })
        if (result?.error) {
          setError(result.error)
        } else {
          setSuccess('Cuenta creada exitosamente. Ahora puedes iniciar sesión.')
          setIsLogin(true)
          setPassword('')
        }
      }
    } catch (err) {
      setError('Ocurrió un error inesperado. Intenta de nuevo.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0a0a0f] relative overflow-hidden">
      {/* Background effects */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(139,92,246,0.15),transparent_50%)]" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_right,rgba(6,182,212,0.1),transparent_50%)]" />
      <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:64px_64px]" />

      <div className="relative w-full max-w-md mx-4">
        {/* Logo */}
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 to-cyan-400 flex items-center justify-center shadow-lg shadow-purple-500/20">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <span className="text-2xl font-bold bg-gradient-to-r from-purple-400 via-pink-400 to-cyan-400 bg-clip-text text-transparent">
              Tablero
            </span>
          </Link>
        </div>

        {/* Card */}
        <div className="rounded-2xl border border-white/10 bg-[#12121a]/80 backdrop-blur-2xl p-8 shadow-2xl shadow-black/40">
          {/* Tabs */}
          <div className="flex gap-1 bg-white/5 rounded-xl p-1 mb-8">
            <button
              onClick={() => { setIsLogin(true); setError(''); setSuccess('') }}
              className={cn(
                'flex-1 py-2.5 text-sm font-medium rounded-lg transition-all',
                isLogin
                  ? 'bg-gradient-to-r from-purple-600 to-cyan-500 text-white shadow-lg'
                  : 'text-white/40 hover:text-white/60'
              )}
            >
              Iniciar sesión
            </button>
            <button
              onClick={() => { setIsLogin(false); setError(''); setSuccess('') }}
              className={cn(
                'flex-1 py-2.5 text-sm font-medium rounded-lg transition-all',
                !isLogin
                  ? 'bg-gradient-to-r from-purple-600 to-cyan-500 text-white shadow-lg'
                  : 'text-white/40 hover:text-white/60'
              )}
            >
              Crear cuenta
            </button>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {!isLogin && (
              <div>
                <label className="block text-xs text-white/40 mb-1.5 ml-1">Nombre</label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/20" />
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Tu nombre"
                    className="w-full bg-white/5 border border-white/10 rounded-xl py-3 pl-10 pr-4 text-sm text-white placeholder:text-white/20 focus:outline-none focus:border-purple-500/50 focus:ring-1 focus:ring-purple-500/20 transition-all"
                  />
                </div>
              </div>
            )}

            <div>
              <label className="block text-xs text-white/40 mb-1.5 ml-1">Email</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/20" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="tu@email.com"
                  required
                  className="w-full bg-white/5 border border-white/10 rounded-xl py-3 pl-10 pr-4 text-sm text-white placeholder:text-white/20 focus:outline-none focus:border-purple-500/50 focus:ring-1 focus:ring-purple-500/20 transition-all"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs text-white/40 mb-1.5 ml-1">Contraseña</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/20" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  className="w-full bg-white/5 border border-white/10 rounded-xl py-3 pl-10 pr-10 text-sm text-white placeholder:text-white/20 focus:outline-none focus:border-purple-500/50 focus:ring-1 focus:ring-purple-500/20 transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-white/20 hover:text-white/40 transition-colors"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {error && (
              <div className="bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3 text-sm text-red-400">
                {error}
              </div>
            )}

            {success && (
              <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-xl px-4 py-3 text-sm text-emerald-400">
                {success}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-purple-600 to-cyan-500 hover:from-purple-500 hover:to-cyan-400 text-white font-medium py-3 rounded-xl shadow-lg shadow-purple-500/20 hover:shadow-purple-500/40 transition-all duration-300 hover:scale-[1.01] disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  {isLogin ? 'Iniciar sesión' : 'Crear cuenta'}
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Divider */}
          <div className="flex items-center gap-4 my-6">
            <div className="flex-1 h-px bg-white/5" />
            <span className="text-[10px] text-white/20 uppercase tracking-wider">o</span>
            <div className="flex-1 h-px bg-white/5" />
          </div>

          {/* Quick access */}
          <Link
            href="/tools/image"
            className="w-full flex items-center justify-center gap-2 bg-white/5 hover:bg-white/10 text-white/50 hover:text-white text-sm font-medium py-3 rounded-xl border border-white/5 hover:border-white/10 transition-all"
          >
            <Sparkles className="w-4 h-4" />
            Probar sin cuenta
          </Link>
        </div>

        {/* Footer */}
        <p className="text-center text-[10px] text-white/20 mt-6">
          Al continuar, aceptas los Términos de Servicio y la Política de Privacidad
        </p>
      </div>
    </div>
  )
}
