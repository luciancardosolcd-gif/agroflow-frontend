'use client'
import { useEffect, useState } from 'react'
import api from '@/lib/api'
import { Users, UserCheck, DollarSign, Package, FileText, Truck, Cog, TrendingUp } from 'lucide-react'

const modules = [
  { label: 'Clientes', icon: UserCheck, href: '/clientes', color: 'text-blue-400', bg: 'bg-blue-900/20 border-blue-800/40' },
  { label: 'Financeiro', icon: DollarSign, href: '/financeiro', color: 'text-green-400', bg: 'bg-green-900/20 border-green-800/40' },
  { label: 'Contratos', icon: FileText, href: '/contratos', color: 'text-yellow-400', bg: 'bg-yellow-900/20 border-yellow-800/40' },
  { label: 'Estoque', icon: Package, href: '/estoque', color: 'text-orange-400', bg: 'bg-orange-900/20 border-orange-800/40' },
  { label: 'Fornecedores', icon: Truck, href: '/fornecedores', color: 'text-purple-400', bg: 'bg-purple-900/20 border-purple-800/40' },
  { label: 'Maquinários', icon: Cog, href: '/maquinarios', color: 'text-red-400', bg: 'bg-red-900/20 border-red-800/40' },
  { label: 'Documentos', icon: FileText, href: '/documentos', color: 'text-cyan-400', bg: 'bg-cyan-900/20 border-cyan-800/40' },
  { label: 'Usuários', icon: Users, href: '/users', color: 'text-pink-400', bg: 'bg-pink-900/20 border-pink-800/40' },
]

export default function DashboardPage() {
  const [stats, setStats] = useState({ users: 0, clientes: 0, contratos: 0, estoque: 0 })

  useEffect(() => {
    const loadStats = async () => {
      try {
        const [users, clientes, contratos, estoque] = await Promise.allSettled([
          api.get('/users'), api.get('/clientes'), api.get('/contratos'), api.get('/estoque')
        ])
        setStats({
          users: users.status === 'fulfilled' ? users.value.data.length : 0,
          clientes: clientes.status === 'fulfilled' ? clientes.value.data.length : 0,
          contratos: contratos.status === 'fulfilled' ? contratos.value.data.length : 0,
          estoque: estoque.status === 'fulfilled' ? estoque.value.data.length : 0,
        })
      } catch {}
    }
    loadStats()
  }, [])

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-3xl text-green-100">Dashboard</h1>
        <p className="text-green-600 mt-1">Visão geral do sistema AgroFlow</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Usuários', value: stats.users, icon: Users, color: 'text-green-400' },
          { label: 'Clientes', value: stats.clientes, icon: UserCheck, color: 'text-blue-400' },
          { label: 'Contratos', value: stats.contratos, icon: FileText, color: 'text-yellow-400' },
          { label: 'Estoque', value: stats.estoque, icon: Package, color: 'text-orange-400' },
        ].map((stat) => (
          <div key={stat.label} className="card flex items-center gap-4">
            <div className="w-12 h-12 bg-[#1a251a] rounded-xl flex items-center justify-center flex-shrink-0">
              <stat.icon className={`w-6 h-6 ${stat.color}`} />
            </div>
            <div>
              <div className="font-display text-3xl text-green-100">{stat.value}</div>
              <div className="text-green-600 text-sm">{stat.label}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Modules grid */}
      <div>
        <h2 className="font-display text-xl text-green-200 mb-4 flex items-center gap-2">
          <TrendingUp className="w-5 h-5 text-green-500" />
          Módulos do sistema
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {modules.map((mod) => (
            <a key={mod.href} href={mod.href}
              className={`card border ${mod.bg} hover:scale-105 transition-transform duration-200 cursor-pointer group`}>
              <mod.icon className={`w-8 h-8 ${mod.color} mb-3`} />
              <div className="text-green-200 font-medium text-sm">{mod.label}</div>
              <div className="text-green-700 text-xs mt-1 group-hover:text-green-500 transition-colors">Acessar →</div>
            </a>
          ))}
        </div>
      </div>

      {/* Footer info */}
      <div className="card border-green-900/30">
        <div className="flex items-center gap-3">
          <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
          <span className="text-green-400 text-sm font-medium">Sistema operacional</span>
          <span className="text-green-700 text-sm">— API conectada em agroflow-backend-production-38be.up.railway.app</span>
        </div>
      </div>
    </div>
  )
}
