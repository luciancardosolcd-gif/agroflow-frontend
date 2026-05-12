'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import api from '@/lib/api'
import { Eye, EyeOff, AlertCircle, CheckCircle } from 'lucide-react'

const Logo = () => (
  <svg width="240" height="95" viewBox="0 0 680 240" xmlns="http://www.w3.org/2000/svg">
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

export default function CadastroPage() {
  const router = useRouter()
  const [form, setForm] = useState({ nome: '', email: '', senha: '', confirmarSenha: '' })
  const [showPass, setShowPass] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [sucesso, setSucesso] = useState(false)

  const handleCadastro = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    if (form.senha !== form.confirmarSenha) {
      setError('As senhas não coincidem')
      return
    }
    if (form.senha.length < 6) {
      setError('A senha deve ter pelo menos 6 caracteres')
      return
    }
    setLoading(true)
    try {
      await api.post('/auth/cadastro-visitante', {
        nome: form.nome,
        email: form.email,
        senha: form.senha,
      })
      setSucesso(true)
      setTimeout(() => router.push('/login'), 3000)
    } catch (e: any) {
      setError(e.response?.data?.message || 'Erro ao criar conta. Tente novamente.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-8" style={{background: 'linear-gradient(135deg, #0a0f0a 0%, #0f1f0f 50%, #0a0f0a 100%)'}}>
      <div className="w-full max-w-md">
        <div className="flex justify-center mb-8">
          <Logo />
        </div>

        {sucesso ? (
          <div className="card text-center space-y-4">
            <CheckCircle className="w-16 h-16 text-green-500 mx-auto" />
            <h2 className="font-display text-2xl text-green-100">Cadastro realizado!</h2>
            <p className="text-green-400">Sua conta foi criada com sucesso. Você tem <strong className="text-green-300">30 dias</strong> de acesso gratuito.</p>
            <p className="text-green-600 text-sm">Redirecionando para o login...</p>
          </div>
        ) : (
          <div className="card">
            <h2 className="font-display text-2xl text-green-100 mb-1">Criar conta gratuita</h2>
            <p className="text-green-600 mb-6 text-sm">30 dias de acesso gratuito ao AgroFlow</p>

            <div className="bg-green-900/20 border border-green-800/40 rounded-lg px-4 py-3 mb-6">
              <p className="text-green-400 text-sm">✅ Acesso gratuito por <strong>30 dias</strong></p>
              <p className="text-green-400 text-sm">✅ Lance dados no sistema</p>
              <p className="text-green-400 text-sm">✅ Sem necessidade de cartão</p>
            </div>

            {error && (
              <div className="flex items-center gap-2 bg-red-900/30 border border-red-800 text-red-400 rounded-lg px-4 py-3 mb-6 text-sm">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                {error}
              </div>
            )}

            <form onSubmit={handleCadastro} className="space-y-4">
              <div>
                <label className="text-green-400 text-sm font-medium block mb-2">Nome completo</label>
                <input
                  type="text"
                  value={form.nome}
                  onChange={e => setForm({...form, nome: e.target.value})}
                  placeholder="Seu nome completo"
                  className="input"
                  required
                />
              </div>
              <div>
                <label className="text-green-400 text-sm font-medium block mb-2">E-mail</label>
                <input
                  type="email"
                  value={form.email}
                  onChange={e => setForm({...form, email: e.target.value})}
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
                    value={form.senha}
                    onChange={e => setForm({...form, senha: e.target.value})}
                    placeholder="Mínimo 6 caracteres"
                    className="input pr-12"
                    required
                  />
                  <button type="button" onClick={() => setShowPass(!showPass)} className="absolute right-3 top-1/2 -translate-y-1/2 text-green-600 hover:text-green-400">
                    {showPass ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>
              <div>
                <label className="text-green-400 text-sm font-medium block mb-2">Confirmar senha</label>
                <input
                  type="password"
                  value={form.confirmarSenha}
                  onChange={e => setForm({...form, confirmarSenha: e.target.value})}
                  placeholder="Repita a senha"
                  className="input"
                  required
                />
              </div>
              <button type="submit" disabled={loading} className="btn-primary w-full justify-center py-3 text-base mt-2">
                {loading ? (
                  <span className="flex items-center gap-2">
                    <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Criando conta...
                  </span>
                ) : 'Criar conta gratuita'}
              </button>
            </form>

            <p className="text-center text-green-700 text-sm mt-6">
              Já tem conta?{' '}
              <a href="/login" className="text-green-500 hover:text-green-400">Fazer login</a>
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
