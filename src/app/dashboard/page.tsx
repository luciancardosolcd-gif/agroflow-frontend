'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Cookies from 'js-cookie'
import api from '@/lib/api'
import { Users, UserCheck, DollarSign, Package, FileText, Truck, Cog, TrendingUp, TrendingDown, Wallet, BarChart3, ArrowRight, Activity } from 'lucide-react'
import { useSafraContext } from '@/lib/SafraContext'

const formatCurrency = (v: number) =>
  new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(v)

const getSaudacao = () => {
  const h = new Date().getHours()
  if (h < 12) return 'Bom dia'
  if (h < 18) return 'Boa tarde'
  return 'Boa noite'
}

export default function DashboardPage() {
  const router = useRouter()
  const { propriedadeId, safraId } = useSafraContext()
  const [userName, setUserName] = useState('')
  const [perfil, setPerfil] = useState('')
  const [permissoes, setPermissoes] = useState<Record<string, any>>({})
  const [stats, setStats] = useState({ users: 0, clientes: 0, contratos: 0, estoque: 0 })
  const [resumo, setResumo] = useState({ totalReceitas: 0, totalDespesas: 0, saldo: 0, margemLucro: 0 })
  const [evolucao, setEvolucao] = useState<{ mes: string; receitas: number; despesas: number }[]>([])
  const [recentes, setRecentes] = useState<any[]>([])
  const [loadingFin, setLoadingFin] = useState(true)

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

  useEffect(() => {
    if (!temPermissao('financeiro')) { setLoadingFin(false); return }
    const loadFin = async () => {
      setLoadingFin(true)
      try {
        let url = '/fin-dashboard?periodo=ANO_ATUAL'
        if (propriedadeId) url += `&fazendaId=${propriedadeId}`
        if (safraId) url += `&safraId=${safraId}`
        const { data } = await api.get(url)
        setResumo(data.resumo)
        setEvolucao(data.evolucaoMensal || [])
        setRecentes(data.lancamentosRecentes || [])
      } catch {}
      finally { setLoadingFin(false) }
    }
    loadFin()
  }, [propriedadeId, safraId, perfil, permissoes])

  const maxEvolucao = Math.max(...evolucao.flatMap(d => [d.receitas, d.despesas]), 1)

  const modules = [
    { label: 'Clientes', icon: UserCheck, href: '/clientes', color: 'text-blue-400', bg: 'bg-blue-900/20 border-blue-800/40', modulo: 'clientes' },
    { label: 'Financeiro', icon: DollarSign, href: '/financeiro', color: 'text-green-400', bg: 'bg-green-900/20 border-green-800/40', modulo: 'financeiro' },
    { label: 'Contratos', icon: FileText, href: '/contratos', color: 'text-yellow-400', bg: 'bg-yellow-900/20 border-yellow-800/40', modulo: 'contratos' },
    { label: 'Estoque', icon: Package, href: '/estoque', color: 'text-orange-400', bg: 'bg-orange-900/20 border-orange-800/40', modulo: 'estoque' },
    { label: 'Fornecedores', icon: Truck, href: '/fornecedores', color: 'text-purple-400', bg: 'bg-purple-900/20 border-purple-800/40', modulo: 'fornecedores' },
    { label: 'Maquinários', icon: Cog, href: '/maquinarios', color: 'text-red-400', bg: 'bg-red-900/20 border-red-800/40', modulo: 'maquinarios' },
    { label: 'Documentos', icon: FileText, href: '/documentos', color: 'text-cyan-400', bg: 'bg-cyan-900/20 border-cyan-800/40', modulo: 'documentos' },
    { label: 'Usuários', icon: Users, href: '/users', color: 'text-pink-400', bg: 'bg-pink-900/20 border-pink-800/40', modulo: null },
  ].filter(m => m.modulo === null ? perfil === 'admin' : temPermissao(m.modulo))

  return (
    <div className="space-y-6">
      {/* Saudação */}
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

      {/* KPIs financeiros — só aparece se tiver permissão */}
      {temPermissao('financeiro') && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="rounded-2xl p-5 border border-emerald-500/20 bg-emerald-500/5 flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-400">Receitas (ano)</span>
              <div className="p-2 rounded-xl bg-white/5"><TrendingUp className="w-4 h-4 text-emerald-400" /></div>
            </div>
            <p className="text-xl font-bold text-white">{loadingFin ? '...' : formatCurrency(resumo.totalReceitas)}</p>
          </div>
          <div className="rounded-2xl p-5 border border-red-500/20 bg-red-500/5 flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-400">Despesas (ano)</span>
              <div className="p-2 rounded-xl bg-white/5"><TrendingDown className="w-4 h-4 text-red-400" /></div>
            </div>
            <p className="text-xl font-bold text-white">{loadingFin ? '...' : formatCurrency(resumo.totalDespesas)}</p>
          </div>
          <div className="rounded-2xl p-5 border border-blue-500/20 bg-blue-500/5 flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-400">Saldo</span>
              <div className="p-2 rounded-xl bg-white/5"><Wallet className="w-4 h-4 text-blue-400" /></div>
            </div>
            <p className={`text-xl font-bold ${resumo.saldo >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
              {loadingFin ? '...' : formatCurrency(resumo.saldo)}
            </p>
          </div>
          <div className="rounded-2xl p-5 border border-purple-500/20 bg-purple-500/5 flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-400">Margem</span>
              <div className="p-2 rounded-xl bg-white/5"><BarChart3 className="w-4 h-4 text-purple-400" /></div>
            </div>
            <p className="text-xl font-bold text-white">{loadingFin ? '...' : `${resumo.margemLucro}%`}</p>
          </div>
        </div>
      )}

      {/* Stats + Evolução */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Stats */}
        <div className="grid grid-cols-2 gap-3">
          {[
            { label: 'Usuários', value: stats.users, icon: Users, color: 'text-pink-400', modulo: null },
            { label: 'Clientes', value: stats.clientes, icon: UserCheck, color: 'text-blue-400', modulo: 'clientes' },
            { label: 'Contratos', value: stats.contratos, icon: FileText, color: 'text-yellow-400', modulo: 'contratos' },
            { label: 'Estoque', value: stats.estoque, icon: Package, color: 'text-orange-400', modulo: 'estoque' },
          ].filter(s => s.modulo === null ? perfil === 'admin' : temPermissao(s.modulo)).map((stat) => (
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

        {/* Evolução mensal — só aparece se tiver permissão financeiro */}
        {temPermissao('financeiro') && (
          <div className="lg:col-span-2 rounded-2xl border border-white/10 bg-white/3 p-5">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-semibold text-gray-300 flex items-center gap-2">
                <Activity className="w-4 h-4 text-green-400" />
                Evolução Mensal (Ano Atual)
              </h3>
              <div className="flex gap-3">
                <span className="flex items-center gap-1 text-xs text-gray-400">
                  <span className="w-2 h-2 rounded-sm bg-emerald-500 inline-block" /> Receitas
                </span>
                <span className="flex items-center gap-1 text-xs text-gray-400">
                  <span className="w-2 h-2 rounded-sm bg-red-500 inline-block" /> Despesas
                </span>
              </div>
            </div>
            {loadingFin ? (
              <div className="h-32 flex items-center justify-center text-gray-500 text-sm">Carregando...</div>
            ) : evolucao.length === 0 ? (
              <div className="h-32 flex items-center justify-center text-gray-500 text-sm">Sem dados no período</div>
            ) : (
              <div className="flex items-end gap-2 h-32">
                {evolucao.map(d => (
                  <div key={d.mes} className="flex-1 flex flex-col items-center gap-1">
                    <div className="flex items-end gap-0.5 w-full h-24">
                      <div title={`Receitas: ${formatCurrency(d.receitas)}`}
                        className="flex-1 bg-emerald-500/70 rounded-t transition-all duration-700"
                        style={{ height: `${(d.receitas / maxEvolucao) * 100}%` }} />
                      <div title={`Despesas: ${formatCurrency(d.despesas)}`}
                        className="flex-1 bg-red-500/70 rounded-t transition-all duration-700"
                        style={{ height: `${(d.despesas / maxEvolucao) * 100}%` }} />
                    </div>
                    <span className="text-[9px] text-gray-500">{d.mes.slice(5)}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Últimos lançamentos — só aparece se tiver permissão financeiro */}
      {temPermissao('financeiro') && recentes.length > 0 && (
        <div className="rounded-2xl border border-white/10 bg-white/3 p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold text-gray-300">Últimos Lançamentos</h3>
            <button onClick={() => router.push('/financeiro')}
              className="flex items-center gap-1 text-xs text-green-500 hover:text-green-400">
              Ver todos <ArrowRight className="w-3 h-3" />
            </button>
          </div>
          <div className="space-y-2">
            {recentes.slice(0, 5).map((l: any) => (
              <div key={l.id} className="flex items-center justify-between py-2 border-b border-white/5">
                <div>
                  <p className="text-sm text-green-200">{l.descricao}</p>
                  <p className="text-xs text-gray-500">{l.data ? new Date(l.data).toLocaleDateString('pt-BR') : '—'}</p>
                </div>
                <span className={`text-sm font-semibold ${l.tipo === 'RECEITA' ? 'text-emerald-400' : 'text-red-400'}`}>
                  {l.tipo === 'RECEITA' ? '+' : '-'}{formatCurrency(l.valor)}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

     {/* Módulos */}
<div>
  <h2 className="font-display text-xl text-green-200 mb-4 flex items-center gap-2">
    <TrendingUp className="w-5 h-5 text-green-500" />
    Módulos do sistema
  </h2>
  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
    {modules.map((mod) => (
      ...
    ))}
  </div>
</div>
