'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Cookies from 'js-cookie'
import api from '@/lib/api'
import { Leaf, Eye, EyeOff, AlertCircle } from 'lucide-react'

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
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 bg-green-700 rounded-xl flex items-center justify-center">
              <Leaf className="w-6 h-6 text-white" />
            </div>
            <span className="font-display text-2xl text-green-100">AgroFlow</span>
          </div>
          <p className="text-green-600 text-sm">Sistema de Gestão Agrícola</p>
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
          <div className="lg:hidden flex items-center gap-3 mb-10 justify-center">
            <div className="w-10 h-10 bg-green-700 rounded-xl flex items-center justify-center">
              <Leaf className="w-6 h-6 text-white" />
            </div>
            <span className="font-display text-2xl text-green-100">AgroFlow</span>
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
                <input
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="seu@email.com"
                  className="input"
                  required
                />
              </div>
              <div>
                <label className="text-green-400 text-sm font-medium block mb-2">Senha</label>
                <div className="relative">
                  <input
                    type={showPass ? 'text' : 'password'}
                    value={senha}
                    onChange={e => setSenha(e.target.value)}
                    placeholder="••••••••"
                    className="input pr-12"
                    required
                  />
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
