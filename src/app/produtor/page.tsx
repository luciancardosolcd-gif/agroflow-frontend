'use client'
import { useEffect, useState } from 'react'
import Cookies from 'js-cookie'
import { Tractor, Leaf, BarChart3, FileText, Package, TrendingUp, TrendingDown, CloudRain, Thermometer, Wind, Droplets, Activity, AlertTriangle, RefreshCw } from 'lucide-react'
import SemPermissao from '@/components/ui/SemPermissao'

const SUPER_ADMINS = ['luciancardoso@agroflow.com', 'admin01@agroflow.com']

const COMMODITIES = [
  { key: 'soja', label: 'Soja', unidade: 'R$/sc 60kg', cor: 'text-yellow-400', bg: 'border-yellow-500/20 bg-yellow-500/5' },
  { key: 'milho', label: 'Milho', unidade: 'R$/sc 60kg', cor: 'text-orange-400', bg: 'border-orange-500/20 bg-orange-500/5' },
  { key: 'boi_gordo', label: 'Boi Gordo', unidade: 'R$/@', cor: 'text-red-400', bg: 'border-red-500/20 bg-red-500/5' },
  { key: 'cafe', label: 'Café', unidade: 'R$/sc 60kg', cor: 'text-amber-400', bg: 'border-amber-500/20 bg-amber-500/5' },
  { key: 'algodao', label: 'Algodão', unidade: 'R$/arroba', cor: 'text-blue-400', bg: 'border-blue-500/20 bg-blue-500/5' },
  { key: 'trigo', label: 'Trigo', unidade: 'R$/sc 60kg', cor: 'text-green-400', bg: 'border-green-500/20 bg-green-500/5' },
  { key: 'sorgo', label: 'Sorgo', unidade: 'R$/sc 60kg', cor: 'text-purple-400', bg: 'border-purple-500/20 bg-purple-500/5' },
]

const gerarCotacoes = () => ({
  soja: { preco: 125.40 + (Math.random() - 0.5) * 4, variacao: (Math.random() - 0.5) * 3 },
  milho: { preco: 58.20 + (Math.random() - 0.5) * 2, variacao: (Math.random() - 0.5) * 2 },
  boi_gordo: { preco: 312.50 + (Math.random() - 0.5) * 8, variacao: (Math.random() - 0.5) * 2 },
  cafe: { preco: 1420.00 + (Math.random() - 0.5) * 30, variacao: (Math.random() - 0.5) * 3 },
  algodao: { preco: 118.30 + (Math.random() - 0.5) * 4, variacao: (Math.random() - 0.5) * 2 },
  trigo: { preco: 72.80 + (Math.random() - 0.5) * 3, variacao: (Math.random() - 0.5) * 2 },
  sorgo: { preco: 48.60 + (Math.random() - 0.5) * 2, variacao: (Math.random() - 0.5) * 2 },
})

const gerarClima = () => ({
  temperatura: (22 + Math.random() * 8).toFixed(1),
  umidade: Math.floor(60 + Math.random() * 30),
  vento: (Math.random() * 20).toFixed(1),
  chuva: (Math.random() * 10).toFixed(1),
  condicao: ['Ensolarado', 'Parcialmente nublado', 'Nublado', 'Chuva leve'][Math.floor(Math.random() * 4)],
})

export default function PainelProdutorPage() {
  const [autorizado, setAutorizado] = useState<boolean | null>(null)
  const [email, setEmail] = useState('')
  const [cotacoes, setCotacoes] = useState<Record<string, { preco: number; variacao: number }>>(gerarCotacoes())
  const [clima, setClima] = useState(gerarClima())
  const [loadingCotacoes, setLoadingCotacoes] = useState(false)
  const [ultimaAtualizacao, setUltimaAtualizacao] = useState(new Date())

  useEffect(() => {
    const u = Cookies.get('user')
    if (u) {
      const parsed = JSON.parse(u)
      setEmail(parsed.email || '')
      if (parsed.perfil === 'admin') { setAutorizado(true); return }
      const perm = parsed.permissoes || {}
      if (perm?.produtor?.ver === true) { setAutorizado(true) } else { setAutorizado(false) }
    }
  }, [])

  const atualizarCotacoes = () => {
    setLoadingCotacoes(true)
    setTimeout(() => {
      setCotacoes(gerarCotacoes())
      setClima(gerarClima())
      setUltimaAtualizacao(new Date())
      setLoadingCotacoes(false)
    }, 800)
  }

  if (autorizado === null) return null
  if (!autorizado) return <SemPermissao />

  const isSuperAdmin = SUPER_ADMINS.includes(email)

  const modulos = [
    { icon: Tractor, label: 'Maquinários', desc: 'Gestão de equipamentos', color: 'text-yellow-400', bg: 'bg-yellow-900/20 border-yellow-800/40' },
    { icon: Leaf, label: 'Culturas', desc: 'Plantio e colheita', color: 'text-green-400', bg: 'bg-green-900/20 border-green-800/40' },
    { icon: BarChart3, label: 'Produção', desc: 'Relatórios de produção', color: 'text-blue-400', bg: 'bg-blue-900/20 border-blue-800/40' },
    { icon: Package, label: 'Insumos', desc: 'Controle de insumos', color: 'text-orange-400', bg: 'bg-orange-900/20 border-orange-800/40' },
    { icon: FileText, label: 'Relatórios', desc: 'Relatórios do produtor', color: 'text-purple-400', bg: 'bg-purple-900/20 border-purple-800/40' },
  ]

  return (
    <div className="space-y-6">

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl text-green-100 flex items-center gap-3">
            <Tractor className="w-8 h-8 text-yellow-400" />
            Painel do Produtor
          </h1>
          <p className="text-green-600 mt-1">Visão consolidada da produção agrícola</p>
        </div>
      </div>

      {/* CotaçãoFlow */}
      <div className="rounded-2xl border border-yellow-500/20 bg-yellow-500/3 p-5">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Activity className="w-5 h-5 text-yellow-400" />
            <h2 className="text-sm font-semibold text-yellow-300">CotaçãoFlow</h2>
            <span className="text-xs text-gray-500">Commodities Agrícolas</span>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-xs text-gray-600">
              Atualizado: {ultimaAtualizacao.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
            </span>
            <button onClick={atualizarCotacoes}
              className="w-7 h-7 bg-yellow-900/30 border border-yellow-800/40 rounded-lg flex items-center justify-center text-yellow-600 hover:text-yellow-400">
              <RefreshCw className={`w-3.5 h-3.5 ${loadingCotacoes ? 'animate-spin' : ''}`} />
            </button>
          </div>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3">
          {COMMODITIES.map(c => {
            const cotacao = cotacoes[c.key]
            const subiu = cotacao.variacao >= 0
            return (
              <div key={c.key} className={`rounded-xl p-3 border ${c.bg} flex flex-col gap-1`}>
                <span className="text-xs text-gray-400 font-medium">{c.label}</span>
                <span className={`text-base font-bold ${c.cor}`}>
                  R$ {cotacao.preco.toFixed(2)}
                </span>
                <span className={`text-xs font-medium flex items-center gap-0.5 ${subiu ? 'text-emerald-400' : 'text-red-400'}`}>
                  {subiu ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                  {subiu ? '+' : ''}{cotacao.variacao.toFixed(2)}%
                </span>
                <span className="text-[10px] text-gray-600">{c.unidade}</span>
              </div>
            )
          })}
        </div>
      </div>

      {/* Registros Climáticos + Monitoramento */}
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
            <div className="rounded-xl p-3 border border-yellow-500/20 bg-yellow-500/5 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-yellow-400" />
                <span className="text-sm text-gray-300">Pragas e Doenças</span>
              </div>
              <span className="text-xs px-2 py-0.5 rounded-full bg-yellow-900/40 text-yellow-400 border border-yellow-800/40">Em breve</span>
            </div>
            <div className="rounded-xl p-3 border border-blue-500/20 bg-blue-500/5 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Droplets className="w-4 h-4 text-blue-400" />
                <span className="text-sm text-gray-300">Irrigação</span>
              </div>
              <span className="text-xs px-2 py-0.5 rounded-full bg-blue-900/40 text-blue-400 border border-blue-800/40">Em breve</span>
            </div>
            <div className="rounded-xl p-3 border border-green-500/20 bg-green-500/5 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Leaf className="w-4 h-4 text-green-400" />
                <span className="text-sm text-gray-300">Desenvolvimento das Culturas</span>
              </div>
              <span className="text-xs px-2 py-0.5 rounded-full bg-green-900/40 text-green-400 border border-green-800/40">Em breve</span>
            </div>
            <div className="rounded-xl p-3 border border-purple-500/20 bg-purple-500/5 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <BarChart3 className="w-4 h-4 text-purple-400" />
                <span className="text-sm text-gray-300">Produtividade por Talhão</span>
              </div>
              <span className="text-xs px-2 py-0.5 rounded-full bg-purple-900/40 text-purple-400 border border-purple-800/40">Em breve</span>
            </div>
          </div>
          <p className="text-xs text-gray-600 mt-3 text-center">🔒 Módulo completo em desenvolvimento</p>
        </div>
      </div>

      {/* Módulos — apenas super admins */}
      {isSuperAdmin && (
        <div>
          <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-widest mb-4">Módulos Agrícolas</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {modulos.map((mod) => (
              <div key={mod.label} className={`card border ${mod.bg} opacity-60 cursor-not-allowed`}>
                <mod.icon className={`w-8 h-8 ${mod.color} mb-3`} />
                <div className="text-green-200 font-medium text-sm">{mod.label}</div>
                <div className="text-green-700 text-xs mt-1">{mod.desc}</div>
                <div className="mt-2 text-xs text-yellow-600">🔒 Em breve</div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
