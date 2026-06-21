'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Cookies from 'js-cookie'
import {
  DollarSign, TrendingUp, TrendingDown,
  Wallet, BarChart2, RefreshCw, Plus,
  MapPin, Sprout, ChevronDown
} from 'lucide-react'
import CrudPage from '@/components/ui/CrudPage'
import SemPermissao from '@/components/ui/SemPermissao'
import { useDashboardFinanceiro, PeriodoFiltro } from './useDashboardFinanceiro'
import FinanceiroTabs from '@/components/FinanceiroTabs'
import { usePropriedade } from '@/contexts/PropriedadeContext'

const formatCurrency = (value: number) =>
  new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value)

const PERIODOS: { value: PeriodoFiltro; label: string }[] = [
  { value: 'MES_ATUAL',    label: 'Mês Atual'    },
  { value: 'MES_ANTERIOR', label: 'Mês Anterior' },
  { value: 'TRIMESTRE',    label: 'Trimestre'    },
  { value: 'ANO_ATUAL',    label: 'Ano Atual'    },
]

function KpiCard({ title, value, icon, color, sub }: {
  title: string; value: string; icon: React.ReactNode; color: string; sub?: string
}) {
  return (
    <div className={`rounded-xl px-4 py-3 border ${color} flex flex-col gap-1.5`}>
      <div className="flex items-center justify-between">
        <span className="text-xs font-medium text-gray-400">{title}</span>
        <div className="p-1.5 rounded-lg bg-white/5">{icon}</div>
      </div>
      <div>
        <p className="text-base font-bold text-white leading-tight">{value}</p>
        {sub && <p className="text-xs text-gray-500 mt-0.5">{sub}</p>}
      </div>
    </div>
  )
}

const fields = [
  { key: 'descricao',      label: 'Descrição',      required: true },
  { key: 'valor',          label: 'Valor',           type: 'number' },
  { key: 'tipo',           label: 'Tipo',            type: 'select', options: ['RECEITA', 'DESPESA'] },
  { key: 'data',           label: 'Data',            type: 'date' },
  { key: 'status',         label: 'Status',          type: 'select', options: ['pendente', 'pago', 'Em Aberto'] },
  { key: 'dataVencimento', label: 'Data Vencimento', type: 'date' },
  { key: 'observacao',     label: 'Observação' },
]

export default function FinanceiroPage() {
  const router = useRouter()

  const [autorizado, setAutorizado] = useState<boolean | null>(null)
  const [canCreate,  setCanCreate]  = useState(false)
  const [periodo,    setPeriodo]    = useState<PeriodoFiltro>('ANO_ATUAL')
  const [tabsAbertas, setTabsAbertas] = useState(false)

  const {
    propriedades, safrasFiltradas,
    propriedadeId, setPropriedadeId,
    safraId, setSafraId,
  } = usePropriedade()

  const { data, loading, error, refetch } = useDashboardFinanceiro(
    periodo, propriedadeId, safraId
  )
  const resumo      = data?.resumo
  const lancamentos = data?.lancamentosRecentes ?? []

  useEffect(() => {
    const u = Cookies.get('user')
    if (u) {
      const parsed = JSON.parse(u)
      const isAdmin = parsed.perfil === 'admin'
      const perm    = parsed.permissoes || {}
      setCanCreate(isAdmin || perm?.financeiro?.criar === true)
      setAutorizado(isAdmin || perm?.financeiro?.ver === true ? true : false)
    }
  }, [])

  const handleNovo = () => {
    const params = new URLSearchParams()
    if (propriedadeId) params.set('fazendaId', propriedadeId)
    if (safraId)       params.set('safraId', safraId)
    const query = params.toString()
    router.push(query ? `/financeiro/novo?${query}` : '/financeiro/novo')
  }

  if (autorizado === null) return null
  if (!autorizado)         return <SemPermissao />

  return (
    <div className="space-y-5">

      {/* ── Barra de filtros no topo (acima do cabeçalho) ── */}
      <div className="flex items-center gap-2 flex-wrap justify-end">
        {propriedades.length > 0 && (
          <div className="flex items-center gap-1.5 bg-[#111811] border border-[#1e2e1e] rounded-lg px-3 py-1.5 hover:border-[#2a3e2a] transition-colors">
            <MapPin className="w-3.5 h-3.5 text-gray-500 flex-shrink-0" />
            <select
              value={propriedadeId}
              onChange={e => setPropriedadeId(e.target.value)}
              className="bg-transparent text-xs text-gray-300 outline-none cursor-pointer max-w-[140px]"
            >
              <option value="">Todas propriedades</option>
              {propriedades.map(p => (
                <option key={p.id} value={p.id}>{p.nome}</option>
              ))}
            </select>
            <ChevronDown className="w-3 h-3 text-gray-500 flex-shrink-0" />
          </div>
        )}

        {safrasFiltradas.length > 0 && (
          <div className="flex items-center gap-1.5 bg-[#111811] border border-[#1e2e1e] rounded-lg px-3 py-1.5 hover:border-[#2a3e2a] transition-colors">
            <Sprout className="w-3.5 h-3.5 text-gray-500 flex-shrink-0" />
            <select
              value={safraId}
              onChange={e => setSafraId(e.target.value)}
              className="bg-transparent text-xs text-gray-300 outline-none cursor-pointer max-w-[120px]"
            >
              <option value="">Todas safras</option>
              {safrasFiltradas.map(s => (
                <option key={s.id} value={s.id}>{s.nome}</option>
              ))}
            </select>
            <ChevronDown className="w-3 h-3 text-gray-500 flex-shrink-0" />
          </div>
        )}

        <select
          value={periodo}
          onChange={(e) => setPeriodo(e.target.value as PeriodoFiltro)}
          className="bg-white/5 border border-white/10 text-white text-xs rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500/50"
        >
          {PERIODOS.map((p) => (
            <option key={p.value} value={p.value} className="bg-gray-900">{p.label}</option>
          ))}
        </select>

        <button
          onClick={refetch}
          className="p-2 rounded-xl bg-white/5 border border-white/10 text-gray-400 hover:text-white transition-colors"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
        </button>
      </div>

      {/* ── Header (só o título) ── */}
      <div className="flex items-center gap-3">
        <div className="p-2 rounded-xl bg-green-500/10">
          <DollarSign className="w-6 h-6 text-green-400" />
        </div>
        <div>
          <h1 className="text-lg font-bold text-white">Financeiro</h1>
          <p className="text-xs text-gray-400">
            {propriedadeId
              ? `Exibindo: ${propriedades.find(p => p.id === propriedadeId)?.nome ?? 'Propriedade selecionada'}`
              : 'Lançamentos de receitas e despesas.'}
          </p>
        </div>
      </div>

      {error && (
        <div className="rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-red-400 text-sm">
          {error}
        </div>
      )}

      {/* ── KPI cards ── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <KpiCard title="Receitas"
          value={loading ? '...' : formatCurrency(resumo?.totalReceitas ?? 0)}
          icon={<TrendingUp className="w-4 h-4 text-emerald-400" />}
          color="border-emerald-500/20 bg-emerald-500/5" />
        <KpiCard title="Despesas"
          value={loading ? '...' : formatCurrency(resumo?.totalDespesas ?? 0)}
          icon={<TrendingDown className="w-4 h-4 text-red-400" />}
          color="border-red-500/20 bg-red-500/5" />
        <KpiCard title="Saldo"
          value={loading ? '...' : formatCurrency(resumo?.saldo ?? 0)}
          icon={<Wallet className="w-4 h-4 text-blue-400" />}
          color={`border-blue-500/20 ${(resumo?.saldo ?? 0) >= 0 ? 'bg-blue-500/5' : 'bg-red-500/5'}`} />
        <KpiCard title="Margem"
          value={loading ? '...' : `${resumo?.margemLucro ?? 0}%`}
          icon={<BarChart2 className="w-4 h-4 text-purple-400" />}
          color="border-purple-500/20 bg-purple-500/5"
          sub="Margem de lucro" />
      </div>

      {/* ── Tabs — Contas a Pagar / Receber (colapsável) ── */}
      <div className="rounded-2xl border border-white/8 bg-white/[0.02] overflow-hidden">
        <button
          onClick={() => setTabsAbertas(prev => !prev)}
          className="w-full flex items-center justify-between px-4 py-3 hover:bg-white/5 transition-colors"
        >
          <span className="text-sm font-medium text-gray-300">Contas a Pagar / Contas a Receber</span>
          <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform duration-200 ${tabsAbertas ? 'rotate-180' : ''}`} />
        </button>
        {tabsAbertas && (
          <div className="px-4 pb-4">
            <FinanceiroTabs lancamentos={lancamentos} loading={loading} />
          </div>
        )}
      </div>

      {/* ── Lista completa da fazenda ── */}
      <CrudPage
        key={`${propriedadeId || 'all'}-${safraId || 'all'}`}
        title="Lançamentos"
        endpoint="/financeiro"
        fields={fields}
        icon={<DollarSign className="w-8 h-8 text-green-400" />}
        fazendaId={propriedadeId || ''}
        safraId={safraId || undefined}
      />

    </div>
  )
}
