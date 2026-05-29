'use client'
import { useEffect, useState } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import Cookies from 'js-cookie'
import api from '@/lib/api'
import {
  Users, UserCheck, Package, FileText,
  TrendingUp, TrendingDown, CloudRain, Thermometer,
  Wind, Droplets, Activity, AlertTriangle, RefreshCw,
  Leaf, BarChart3, Home, DollarSign, Truck, Cog,
  Settings, Tractor, BarChart2, Shield
} from 'lucide-react'

const getSaudacao = () => {
  const h = new Date().getHours()
  if (h < 12) return 'Bom dia'
  if (h < 18) return 'Boa tarde'
  return 'Boa noite'
}

const COMMODITIES = [
  { key: 'soja',      label: 'Soja',      unidade: 'R$/sc 60kg', cor: 'text-yellow-400', bg: 'border-yellow-500/20 bg-yellow-500/5' },
  { key: 'milho',     label: 'Milho',     unidade: 'R$/sc 60kg', cor: 'text-orange-400', bg: 'border-orange-500/20 bg-orange-500/5' },
  { key: 'boi_gordo', label: 'Boi Gordo', unidade: 'R$/@',       cor: 'text-red-400',    bg: 'border-red-500/20 bg-red-500/5' },
  { key: 'cafe',      label: 'Café',      unidade: 'R$/sc 60kg', cor: 'text-amber-400',  bg: 'border-amber-500/20 bg-amber-500/5' },
  { key: 'algodao',   label: 'Algodão',   unidade: 'R$/arroba',  cor: 'text-blue-400',   bg: 'border-blue-500/20 bg-blue-500/5' },
  { key: 'trigo',     label: 'Trigo',     unidade: 'R$/sc 60kg', cor: 'text-green-400',  bg: 'border-green-500/20 bg-green-500/5' },
  { key: 'sorgo',     label: 'Sorgo',     unidade: 'R$/sc 60kg', cor: 'text-purple-400', bg: 'border-purple-500/20 bg-purple-500/5' },
]

const gerarCotacoes = () => ({
  soja:      { preco: 125.40 + (Math.random() - 0.5) * 4,  variacao: (Math.random() - 0.5) * 3 },
  milho:     { preco: 58.20  + (Math.random() - 0.5) * 2,  variacao: (Math.random() - 0.5) * 2 },
  boi_gordo: { preco: 312.50 + (Math.random() - 0.5) * 8,  variacao: (Math.random() - 0.5) * 2 },
  cafe:      { preco: 1420.0 + (Math.random() - 0.5) * 30, variacao: (Math.random() - 0.5) * 3 },
  algodao:   { preco: 118.30 + (Math.random() - 0.5) * 4,  variacao: (Math.random() - 0.5) * 2 },
  trigo:     { preco: 72.80  + (Math.random() - 0.5) * 3,  variacao: (Math.random() - 0.5) * 2 },
  sorgo:     { preco: 48.60  + (Math.random() - 0.5) * 2,  variacao: (Math.random() - 0.5) * 2 },
})

const gerarClima = () => ({
  temperatura: (22 + Math.random() * 8).toFixed(1),
  umidade:     Math.floor(60 + Math.random() * 30),
  vento:       (Math.random() * 20).toFixed(1),
  chuva:       (Math.random() * 10).toFixed(1),
  condicao:    ['Ensolarado', 'Parcialmente nublado', 'Nublado', 'Chuva leve'][Math.floor(Math.random() * 4)],
})

const ALL_NAV = [
  { href: '/dashboard',             label: 'Início',          modulo: null,          perfis: ['admin','gestor','operador','agronomo','visitante','produtor'] },
  { href: '/clientes',              label: 'Clientes',        modulo: 'clientes',    perfis: ['admin','gestor','operador','agronomo','visitante'] },
  { href: '/financeiro',            label: 'Financeiro',      modulo: 'financeiro',  perfis: ['admin','gestor','operador','agronomo','visitante'] },
  { href: '/contratos',             label: 'Contratos',       modulo: 'contratos',   perfis: ['admin','gestor','operador','agronomo','visitante'] },
  { href: '/estoque',               label: 'Estoque',         modulo: 'estoque',     perfis: ['admin','gestor','operador','agronomo','visitante'] },
  { href: '/fornecedores',          label: 'Fornecedores',    modulo: 'fornecedores',perfis: ['admin','gestor','operador','agronomo','visitante'] },
  { href: '/maquinarios',           label: 'Maquinários',     modulo: 'maquinarios', perfis: ['admin','gestor','operador','agronomo','visitante'] },
  { href: '/documentos',            label: 'Documentos',      modulo: 'documentos',  perfis: ['admin','gestor','operador','agronomo','visitante'] },
  { href: '/produtor',              label: 'Painel Produtor', modulo: 'produtor',    perfis: ['admin','produtor','agronomo','visitante'] },
  { href: '/relatorios',            label: 'Relatórios',      modulo: 'relatorios',  perfis: ['admin','gestor','operador','agronomo','visitante'] },
  { href: '/users',                 label: 'Usuários',        modulo: null,          perfis: ['admin'] },
]

export default function DashboardPage() {
  const router   = useRouter()
  const pathname = usePathname()

  const [userName,   setUserName]   = useState('')
  const [perfil,     setPerfil]     = useState('')
  const [permissoes, setPermissoes] = useState<Record<string, any>>({})
  const [stats,      setStats]      = useState({ users: 0, clientes: 0, contratos: 0, estoque: 0 })
  const [cotacoes,   setCotacoes]   = useState<Record<string, { preco: number; variacao: number }>>(gerarCotacoes())
  const [clima,      setClima]      = useState(gerarClima())
  const [loadingCot, setLoadingCot] = useState(false)
  const [ultimaAtt,  setUltimaAtt]  = useState(new Date())

  const temPermissao = (modulo: string | null) => {
    if (!modulo) return perfil === 'admin'
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
    const load = async () => {
      try {
        const [users, clientes, contratos, estoque] = await Promise.allSettled([
          api.get('/users'), api.get('/clientes'), api.get('/contratos'), api.get('/estoque'),
        ])
        setStats({
          users:     users.status     === 'fulfilled' ? users.value.data.length     : 0,
          clientes:  clientes.status  === 'fulfilled' ? clientes.value.data.length  : 0,
          contratos: contratos.status === 'fulfilled' ? contratos.value.data.length : 0,
          estoque:   estoque.status   === 'fulfilled' ? estoque.value.data.length   : 0,
        })
      } catch {}
    }
    load()
  }, [])

  const atualizar = () => {
    setLoadingCot(true)
    setTimeout(() => {
      setCotacoes(gerarCotacoes())
      setClima(gerarClima())
      setUltimaAtt(new Date())
      setLoadingCot(false)
    }, 800)
  }

  const navVisivel = ALL_NAV.filter(item => {
    if (!item.perfis.includes(perfil)) return false
    return temPermissao(item.modulo)
  })

  return (
    <div className="space-y-5">

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

      {/* ── Barra de navegação horizontal estilo Aegro ── */}
      <div className="w-full overflow-x-auto scrollbar-none">
        <div className="flex items-center border-b border-white/8 min-w-max">
          {navVisivel.map(item => {
            const active = pathname === item.href
            return (
              <button
                key={item.href}
                onClick={() => router.push(item.href)}
                className={`
                  relative px-4 py-2.5 text-sm font-medium
                  transition-all duration-200 whitespace-nowrap select-none
                  ${active
                    ? 'text-white'
                    : 'text-gray-500 hover:text-gray-300'
                  }
                `}
              >
                {item.label}
                <span className={`
                  absolute bottom-0 left-0 right-0 h-0.5 rounded-full bg-green-500
                  transition-all duration-300
                  ${active ? 'opacity-100 scale-x-100' : 'opacity-0 scale-x-0'}
                `}/>
              </button>
            )
          })}
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
          .filter(s => temPermissao(s.modulo))
          .map(stat => (
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

      {/* ── CotaçãoFlow ── */}
      <div className="rounded-2xl border border-yellow-500/20 bg-yellow-500/3 p-5">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Activity className="w-5 h-5 text-yellow-400" />
            <h2 className="text-sm font-semibold text-yellow-300">CotaçãoFlow</h2>
            <span className="text-xs text-gray-500">Commodities Agrícolas</span>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-xs text-gray-600">
              Atualizado: {ultimaAtt.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
            </span>
            <button onClick={atualizar}
              className="w-7 h-7 bg-yellow-900/30 border border-yellow-800/40 rounded-lg flex items-center justify-center text-yellow-600 hover:text-yellow-400">
              <RefreshCw className={`w-3.5 h-3.5 ${loadingCot ? 'animate-spin' : ''}`} />
            </button>
          </div>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3">
          {COMMODITIES.map(c => {
            const cot = cotacoes[c.key]
            const subiu = cot.variacao >= 0
            return (
              <div key={c.key} className={`rounded-xl p-3 border ${c.bg} flex flex-col gap-1`}>
                <span className="text-xs text-gray-400 font-medium">{c.label}</span>
                <span className={`text-base font-bold ${c.cor}`}>R$ {cot.preco.toFixed(2)}</span>
                <span className={`text-xs font-medium flex items-center gap-0.5 ${subiu ? 'text-emerald-400' : 'text-red-400'}`}>
                  {subiu ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                  {subiu ? '+' : ''}{cot.variacao.toFixed(2)}%
                </span>
                <span className="text-[10px] text-gray-600">{c.unidade}</span>
              </div>
            )
          })}
        </div>
      </div>

      {/* ── Clima + Monitoramento ── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="rounded-2xl border border-blue-500/20 bg-blue-500/3 p-5">
          <div className="flex items-center gap-2 mb-4">
            <CloudRain className="w-5 h-5 text-blue-400" />
            <h2 className="text-sm font-semibold text-blue-300">Registros Climáticos</h2>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="rounded-xl p-3 border border-orange-500/20 bg-orange-500/5 flex items-center gap-3">
              <Thermometer className="w-6 h-6 text-orange-400 flex-shrink-0" />
              <div>
                <p className="text-xs text-gray-400">Temperatura</p>
                <p className="text-lg font-bold text-orange-400">{clima.temperatura}°C</p>
              </div>
            </div>
            <div className="rounded-xl p-3 border border-blue-500/20 bg-blue-500/5 flex items-center gap-3">
              <Droplets className="w-6 h-6 text-blue-400 flex-shrink-0" />
              <div>
                <p className="text-xs text-gray-400">Umidade</p>
                <p className="text-lg font-bold text-blue-400">{clima.umidade}%</p>
              </div>
            </div>
            <div className="rounded-xl p-3 border border-cyan-500/20 bg-cyan-500/5 flex items-center gap-3">
              <Wind className="w-6 h-6 text-cyan-400 flex-shrink-0" />
              <div>
                <p className="text-xs text-gray-400">Vento</p>
                <p className="text-lg font-bold text-cyan-400">{clima.vento} km/h</p>
              </div>
            </div>
            <div className="rounded-xl p-3 border border-indigo-500/20 bg-indigo-500/5 flex items-center gap-3">
              <CloudRain className="w-6 h-6 text-indigo-400 flex-shrink-0" />
              <div>
                <p className="text-xs text-gray-400">Chuva</p>
                <p className="text-lg font-bold text-indigo-400">{clima.chuva} mm</p>
              </div>
            </div>
          </div>
          <div className="mt-3 px-3 py-2 rounded-xl bg-white/5 border border-white/10">
            <p className="text-xs text-gray-400">Condição atual</p>
            <p className="text-sm text-white font-medium">{clima.condicao}</p>
          </div>
          <p className="text-xs text-gray-600 mt-2 text-center">🔒 Integração com estação meteorológica em breve</p>
        </div>

        <div className="rounded-2xl border border-emerald-500/20 bg-emerald-500/3 p-5">
          <div className="flex items-center gap-2 mb-4">
            <Activity className="w-5 h-5 text-emerald-400" />
            <h2 className="text-sm font-semibold text-emerald-300">Monitoramento</h2>
          </div>
          <div className="space-y-3">
            {[
              { icon: AlertTriangle, label: 'Pragas e Doenças',           color: 'text-yellow-400', bg: 'border-yellow-500/20 bg-yellow-500/5', badge: 'bg-yellow-900/40 text-yellow-400 border-yellow-800/40' },
              { icon: Droplets,      label: 'Irrigação',                   color: 'text-blue-400',   bg: 'border-blue-500/20 bg-blue-500/5',     badge: 'bg-blue-900/40 text-blue-400 border-blue-800/40' },
              { icon: Leaf,          label: 'Desenvolvimento das Culturas', color: 'text-green-400',  bg: 'border-green-500/20 bg-green-500/5',   badge: 'bg-green-900/40 text-green-400 border-green-800/40' },
              { icon: BarChart3,     label: 'Produtividade por Talhão',    color: 'text-purple-400', bg: 'border-purple-500/20 bg-purple-500/5', badge: 'bg-purple-900/40 text-purple-400 border-purple-800/40' },
            ].map(item => (
              <div key={item.label} className={`rounded-xl p-3 border ${item.bg} flex items-center justify-between`}>
                <div className="flex items-center gap-2">
                  <item.icon className={`w-4 h-4 ${item.color}`} />
                  <span className="text-sm text-gray-300">{item.label}</span>
                </div>
                <span className={`text-xs px-2 py-0.5 rounded-full border ${item.badge}`}>Em breve</span>
              </div>
            ))}
          </div>
          <p className="text-xs text-gray-600 mt-3 text-center">🔒 Módulo completo em desenvolvimento</p>
        </div>
      </div>

    </div>
  )
}
