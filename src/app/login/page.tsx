'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Cookies from 'js-cookie'
import api from '@/lib/api'
import { Eye, EyeOff, AlertCircle } from 'lucide-react'

const Logo = () => (
  <svg width="200" height="80" viewBox="0 0 680 240" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <linearGradient id="lg" x1="0%" y1="100%" x2="60%" y2="0%">
        <stop offset="0%" stopColor="#7cc442"/>
        <stop offset="100%" stopColor="#a8d96a"/>
      </linearGradient>
    </defs>
    <g transform="translate(340, 145)">
      <g transform="translate(-14, -65) scale(0.65)">
        <path d="M 0 105 C 2 88 4 72 6 58" stroke="#5a9e2e" strokeWidth="7" fill="none" strokeLinecap="round"/>
        <path d="M 6 58 C -5 45 -38 18 -42 -18 C -46 -52 -18 -82 8 -90 C 34 -82 52 -52 48 -18 C 44 18 18 45 6 58 Z" fill="url(#lg)"/>
        <path d="M 6 55 C 2 25 -6 -15 4 -85" stroke="white" strokeWidth="8" fill="none" strokeLinecap="round"/>
      </g>
      <text x="-242" y="28" fontFamily="Arial Black, sans-serif" fontWeight="900" fontSize="88" fill="#3a6e30" letterSpacing="-2">Agro</text>
      <text x="2" y="28" fontFamily="Arial Black, sans-serif" fontWeight="900" fontSize="88" fill="#1a3260" letterSpacing="-2">Flow</text>
      <text x="0" y="88" fontFamily="Arial, sans-serif" fontWeight="400" fontSize="26" fill="#5a8a5a" textAnchor="middle" letterSpacing="5">Gestão Agrícola</text>
    </g>
  </svg>
)

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [senha, setSenha] = useState('')
  const [showPass, setShowPass] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    try {
      const { data } = await api.post('/auth/login', { email, senha })
      Cookies.set('accessToken', data.accessToken, { expires: 1 })
      Cookies.set('user', JSON.stringify(data.user), { expires: 1 })
      router.push('/dashboard')
    } catch {
      setError('E-mail ou senha incorretos')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex" style={{background: 'linear-gradient(135deg, #0a0f0a 0%, #0f1f0f 50%, #0a0f0a 100%)'}}>
      {/* Left panel */}
      <div className="hidden lg:flex lg:w-1/2 flex-col justify-between p-16 relative overflow-hidden">
        <div className="absolute inset-0 opacity-5" style={{backgroundImage: 'repeating-linear-gradient(45deg, #16a34a 0, #16a34a 1px, transparent 0, transparent 50%)', backgroundSize: '20px 20px'}} />
        <div className="relative">
          <Logo />
        </div>
        <div className="relative space-y-8">
          <h1 className="font-display text-5xl text-green-100 leading-tight">
            Gestão inteligente<br />
            <span className="text-green-500">para o campo</span>
          </h1>
          <p className="text-green-600 text-lg leading-relaxed max-w-md">
            Controle financeiro, contratos, estoque e muito mais em uma única plataforma desenvolvida para o agronegócio brasileiro.
          </p>
          <div className="grid grid-cols-3 gap-4">
            {[
              { label: 'Módulos', value: '8+' },
              { label: 'Relatórios', value: '100%' },
              { label: 'Segurança', value: 'JWT' },
            ].map((stat) => (
              <div key={stat.label} className="bg-green-900/20 border border-green-900/40 rounded-xl p-4">
                <div className="font-display text-2xl text-green-400">{stat.value}</div>
                <div className="text-green-600 text-sm">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
        <div className="relative text-green-700 text-sm">© 2026 AgroFlow</div>
      </div>

      {/* Right panel */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8">
        <div className="w-full max-w-md">
          <div className="lg:hidden flex justify-center mb-10">
            <Logo />
          </div>
          <div className="card">
            <h2 className="font-display text-2xl text-green-100 mb-2">Bem-vindo de volta</h2>
            <p className="text-green-600 mb-8 text-sm">Entre com suas credenciais para acessar o sistema</p>
            {error && (
              <div className="flex items-center gap-2 bg-red-900/30 border border-red-800 text-red-400 rounded-lg px-4 py-3 mb-6 text-sm">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                {error}
              </div>
            )}
            <form onSubmit={handleLogin} className="space-y-5">
              <div>
                <label className="text-green-400 text-sm font-medium block mb-2">E-mail</label>
                <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="seu@email.com" className="input" required />
              </div>
              <div>
                <label className="text-green-400 text-sm font-medium block mb-2">Senha</label>
                <div className="relative">
                  <input type={showPass ? 'text' : 'password'} value={senha} onChange={e => setSenha(e.target.value)} placeholder="••••••••" className="input pr-12" required />
                  <button type="button" onClick={() => setShowPass(!showPass)} className="absolute right-3 top-1/2 -translate-y-1/2 text-green-600 hover:text-green-400">
                    {showPass ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>
              <button type="submit" disabled={loading} className="btn-primary w-full justify-center py-3 text-base">
                {loading ? (
                  <span className="flex items-center gap-2">
                    <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Entrando...
                  </span>
                ) : 'Entrar no sistema'}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  )
}
