'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Cookies from 'js-cookie'
import api from '@/lib/api'
import { Shield, Users, Database, Activity, Trash2, Download, RefreshCw, AlertTriangle } from 'lucide-react'

export default function AdminPage() {
  const router = useRouter()
  const [stats, setStats] = useState<any>({})
  const [loading, setLoading] = useState(true)
  const [logs, setLogs] = useState<any[]>([])

  useEffect(() => {
    const u = Cookies.get('user')
    if (!u) { router.push('/login'); return }
    const user = JSON.parse(u)
    if (user.perfil !== 'admin') { router.push('/dashboard'); return }
    loadStats()
  }, [])

  const loadStats = async () => {
    setLoading(true)
    try {
      const [users, clientes, contratos, estoque, financeiro, fornecedores, maquinarios, documentos] = await Promise.allSettled([
        api.get('/users'),
        api.get('/clientes'),
        api.get('/contratos'),
        api.get('/estoque'),
        api.get('/financeiro'),
        api.get('/fornecedores'),
        api.get('/maquinarios'),
        api.get('/documentos'),
      ])
      setStats({
        users: users.status === 'fulfilled' ? users.value.data.length : 0,
        clientes: clientes.status === 'fulfilled' ? clientes.value.data.length : 0,
        contratos: contratos.status === 'fulfilled' ? contratos.value.data.length : 0,
        estoque: estoque.status === 'fulfilled' ? estoque.value.data.length : 0,
        financeiro: financeiro.status === 'fulfilled' ? financeiro.value.data.length : 0,
        fornecedores: fornecedores.status === 'fulfilled' ? fornecedores.value.data.length : 0,
        maquinarios: maquinarios.status === 'fulfilled' ? maquinarios.value.data.length : 0,
        documentos: documentos.status === 'fulfilled' ? documentos.value.data.length : 0,
      })
    } catch {}
    finally { setLoading(false) }
  }

  const exportarDados = async (endpoint: string, nome: string) => {
    try {
      const { data } = await api.get(endpoint)
      const json = JSON.stringify(data, null, 2)
      const blob = new Blob([json], { type: 'application/json' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `${nome}-${new Date().toISOString().split('T')[0]}.json`
      a.click()
    } catch {}
  }

  const tabelas = [
    { label: 'Usuários', endpoint: '/users', key: 'users', color: 'text-pink-400' },
    { label: 'Clientes', endpoint: '/clientes', key: 'clientes', color: 'text-blue-400' },
    { label: 'Financeiro', endpoint: '/financeiro', key: 'financeiro', color: 'text-green-400' },
    { label: 'Contratos', endpoint: '/contratos', key: 'contratos', color: 'text-yellow-400' },
    { label: 'Estoque', endpoint: '/estoque', key: 'estoque', color: 'text-orange-400' },
    { label: 'Fornecedores', endpoint: '/fornecedores', key: 'fornecedores', color: 'text-purple-400' },
    { label: 'Maquinários', endpoint: '/maquinarios', key: 'maquinarios', color: 'text-red-400' },
    { label: 'Documentos', endpoint: '/documentos', key: 'documentos', color: 'text-cyan-400' },
  ]

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-3xl text-green-100 flex items-center gap-3">
            <Shield className="w-8 h-8 text-red-400" />
            Painel Administrativo
          </h1>
          <p className="text-green-600 mt-1">Acesso restrito — somente administradores</p>
        </div>
        <button onClick={loadStats} className="btn-secondary">
          <RefreshCw className="w-4 h-4" />
          Atualizar
        </button>
      </div>

      {/* Aviso admin */}
      <div className="card border-red-900/30 bg-red-900/10 flex items-center gap-4">
        <AlertTriangle className="w-8 h-8 text-red-400 flex-shrink-0" />
        <div>
          <h2 className="text-red-300 font-semibold">Área restrita</h2>
          <p className="text-red-600 text-sm">Você está acessando o painel de administração do banco de dados. Ações aqui afetam todo o sistema.</p>
        </div>
      </div>

      {/* Stats do banco */}
      <div>
        <h2 className="font-display text-xl text-green-200 mb-4 flex items-center gap-2">
          <Database className="w-5 h-5 text-green-500" />
          Estatísticas do banco de dados
        </h2>
        {loading ? (
          <div className="flex items-center justify-center py-10">
            <div className="w-8 h-8 border-2 border-green-600 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {tabelas.map((t) => (
              <div key={t.key} className="card flex flex-col gap-2">
                <div className={`font-display text-3xl ${t.color}`}>{stats[t.key] || 0}</div>
                <div className="text-green-400 text-sm font-medium">{t.label}</div>
                <div className="text-green-700 text-xs">registros no banco</div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Exportar dados */}
      <div>
        <h2 className="font-display text-xl text-green-200 mb-4 flex items-center gap-2">
          <Download className="w-5 h-5 text-green-500" />
          Exportar dados
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {tabelas.map((t) => (
            <button key={t.key} onClick={() => exportarDados(t.endpoint, t.label.toLowerCase())}
              className="card hover:bg-[#1a251a] transition-colors text-left cursor-pointer border border-[#243324] hover:border-green-800">
              <Download className={`w-6 h-6 ${t.color} mb-2`} />
              <div className="text-green-300 text-sm font-medium">{t.label}</div>
              <div className="text-green-700 text-xs mt-1">Exportar JSON</div>
            </button>
          ))}
        </div>
      </div>

      {/* Info sistema */}
      <div>
        <h2 className="font-display text-xl text-green-200 mb-4 flex items-center gap-2">
          <Activity className="w-5 h-5 text-green-500" />
          Informações do sistema
        </h2>
        <div className="card space-y-3">
          <div className="flex items-center justify-between border-b border-[#243324] pb-3">
            <span className="text-green-600 text-sm">Backend</span>
            <span className="text-green-300 text-sm">Railway — NestJS</span>
          </div>
          <div className="flex items-center justify-between border-b border-[#243324] pb-3">
            <span className="text-green-600 text-sm">Banco de dados</span>
            <span className="text-green-300 text-sm">Supabase — PostgreSQL</span>
          </div>
          <div className="flex items-center justify-between border-b border-[#243324] pb-3">
            <span className="text-green-600 text-sm">Frontend</span>
            <span className="text-green-300 text-sm">Vercel — Next.js</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-green-600 text-sm">Versão</span>
            <span className="text-green-300 text-sm">AgroFlow v1.0</span>
          </div>
        </div>
      </div>
    </div>
  )
}
