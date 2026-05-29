'use client'
import { useEffect, useState } from 'react'
import Cookies from 'js-cookie'
import api from '@/lib/api'
import {
  Users, UserCheck, Package, FileText
} from 'lucide-react'

const getSaudacao = () => {
  const h = new Date().getHours()
  if (h < 12) return 'Bom dia'
  if (h < 18) return 'Boa tarde'
  return 'Boa noite'
}

export default function DashboardPage() {
  const [userName, setUserName] = useState('')
  const [perfil, setPerfil] = useState('')
  const [permissoes, setPermissoes] = useState<Record<string, any>>({})
  const [stats, setStats] = useState({ users: 0, clientes: 0, contratos: 0, estoque: 0 })

  const temPermissao = (modulo: string) => {
    if (perfil === 'admin') return true
    return permissoes[modulo]?.ver === true
  }

  useEffect(() => {
    const u = Cookies.get('user')
    if (u) {
      const parsed = JSON.parse(u)
      setUserName(parsed.nome?.split(' ')[0] || '')
      setPerfil(parsed.perfil || '')
      setPermissoes(parsed.permissoes || {})
    }
  }, [])

  useEffect(() => {
    const loadStats = async () => {
      try {
        const [users, clientes, contratos, estoque] = await Promise.allSettled([
          api.get('/users'),
          api.get('/clientes'),
          api.get('/contratos'),
          api.get('/estoque'),
        ])
        setStats({
          users:     users.status     === 'fulfilled' ? users.value.data.length     : 0,
          clientes:  clientes.status  === 'fulfilled' ? clientes.value.data.length  : 0,
          contratos: contratos.status === 'fulfilled' ? contratos.value.data.length : 0,
          estoque:   estoque.status   === 'fulfilled' ? estoque.value.data.length   : 0,
        })
      } catch {}
    }
    loadStats()
  }, [])

  return (
    <div className="space-y-6">

      {/* ── Saudação ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div>
          <h1 className="font-display text-3xl text-green-100">
            {getSaudacao()}{userName ? `, ${userName}` : ''}! 👋
          </h1>
          <p className="text-green-600 mt-1">Visão geral do sistema AgroFlow</p>
        </div>
        <div className="flex items-center gap-2 px-3 py-1.5 bg-green-900/20 border border-green-900/40 rounded-full">
          <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
          <span className="text-green-400 text-xs font-medium">Sistema operacional</span>
        </div>
      </div>

      {/* ── Stats ── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {[
          { label: 'Usuários',  value: stats.users,     icon: Users,     color: 'text-pink-400',   modulo: null },
          { label: 'Clientes',  value: stats.clientes,  icon: UserCheck, color: 'text-blue-400',   modulo: 'clientes' },
          { label: 'Contratos', value: stats.contratos, icon: FileText,  color: 'text-yellow-400', modulo: 'contratos' },
          { label: 'Estoque',   value: stats.estoque,   icon: Package,   color: 'text-orange-400', modulo: 'estoque' },
        ]
          .filter(s => s.modulo === null ? perfil === 'admin' : temPermissao(s.modulo))
          .map((stat) => (
            <div key={stat.label} className="card flex items-center gap-3 p-4">
              <div className="w-10 h-10 bg-[#1a251a] rounded-xl flex items-center justify-center flex-shrink-0">
                <stat.icon className={`w-5 h-5 ${stat.color}`} />
              </div>
              <div>
                <div className="font-display text-2xl text-green-100">{stat.value}</div>
                <div className="text-green-600 text-xs">{stat.label}</div>
              </div>
            </div>
          ))}
      </div>

    </div>
  )
}
