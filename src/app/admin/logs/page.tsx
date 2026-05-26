'use client'
import { useEffect, useState } from 'react'
import { Shield, RefreshCw, Search } from 'lucide-react'
import api from '@/lib/api'

interface Log {
  id: string
  userEmail: string
  userName: string
  acao: string
  modulo: string
  detalhes: string
  ip: string
  createdAt: string
}

const ACAO_COLORS: Record<string, string> = {
  LOGIN: 'bg-green-900/40 text-green-400 border-green-800',
  LOGIN_FALHOU: 'bg-red-900/40 text-red-400 border-red-800',
  LOGOUT: 'bg-gray-900/40 text-gray-400 border-gray-800',
}

export default function LogsPage() {
  const [logs, setLogs] = useState<Log[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')

  const load = async () => {
    setLoading(true)
    try {
      const { data } = await api.get('/logs')
      setLogs(Array.isArray(data) ? data : [])
    } catch { setLogs([]) }
    finally { setLoading(false) }
  }

  useEffect(() => { load() }, [])

  const filtered = logs.filter(l =>
    l.userEmail?.toLowerCase().includes(search.toLowerCase()) ||
    l.userName?.toLowerCase().includes(search.toLowerCase()) ||
    l.acao?.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-green-100 flex items-center gap-3">
            <Shield className="w-7 h-7 text-blue-400" />
            Log de Acessos
          </h1>
          <p className="text-green-600 mt-1">{logs.length} registro{logs.length !== 1 ? 's' : ''}</p>
        </div>
        <button onClick={load} className="w-9 h-9 bg-[#1a251a] border border-[#243324] rounded-xl flex items-center justify-center text-green-600 hover:text-green-400">
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
        </button>
      </div>

      <div className="bg-[#111811] border border-[#1e2e1e] rounded-2xl p-4">
        <div className="flex items-center gap-2 bg-[#1a251a] rounded-lg px-3 py-2 border border-[#243324]">
          <Search className="w-4 h-4 text-green-600" />
          <input value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Buscar por email, nome ou ação..."
            className="bg-transparent text-sm text-green-300 placeholder-green-700 outline-none flex-1" />
        </div>
      </div>

      <div className="bg-[#111811] border border-[#1e2e1e] rounded-2xl overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-16">
            <div className="w-8 h-8 border-2 border-green-600 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-16 text-green-700">
            <Shield className="w-12 h-12 mx-auto mb-3 opacity-30" />
            <p>Nenhum log encontrado</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-[#243324] bg-[#0d160d]">
                  <th className="text-left py-3 px-4 text-green-600 font-medium">Data/Hora</th>
                  <th className="text-left py-3 px-4 text-green-600 font-medium">Usuário</th>
                  <th className="text-left py-3 px-4 text-green-600 font-medium">Ação</th>
                  <th className="text-left py-3 px-4 text-green-600 font-medium">Módulo</th>
                  <th className="text-left py-3 px-4 text-green-600 font-medium">Detalhes</th>
                  <th className="text-left py-3 px-4 text-green-600 font-medium">IP</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map(log => (
                  <tr key={log.id} className="border-b border-[#1a251a] hover:bg-[#1a251a]/50">
                    <td className="py-3 px-4 text-green-600 text-xs">
                      {new Date(log.createdAt).toLocaleString('pt-BR')}
                    </td>
                    <td className="py-3 px-4">
                      <div className="text-green-200 text-xs font-medium">{log.userName || '—'}</div>
                      <div className="text-green-600 text-xs">{log.userEmail}</div>
                    </td>
                    <td className="py-3 px-4">
                      <span className={`px-2 py-0.5 rounded-full text-xs font-medium border ${ACAO_COLORS[log.acao] || 'bg-blue-900/40 text-blue-400 border-blue-800'}`}>
                        {log.acao}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-green-400 text-xs">{log.modulo || '—'}</td>
                    <td className="py-3 px-4 text-green-600 text-xs">{log.detalhes || '—'}</td>
                    <td className="py-3 px-4 text-green-700 text-xs">{log.ip || '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
