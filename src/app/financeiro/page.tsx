'use client'
import { useSafraContext } from '@/lib/SafraContext'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Cookies from 'js-cookie'
import {
  DollarSign, TrendingUp, TrendingDown,
  Wallet, BarChart2, RefreshCw, Plus
} from 'lucide-react'
import CrudPage from '@/components/ui/CrudPage'
import SemPermissao from '@/components/ui/SemPermissao'
import { useDashboardFinanceiro, PeriodoFiltro } from './useDashboardFinanceiro'
import FinanceiroTabs from '@/components/FinanceiroTabs'

const formatCurrency = (value: number) =>
  new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value)

const PERIODOS: { value: PeriodoFiltro; label: string }[] = [
  { value: 'MES_ATUAL',    label: 'Mês Atual' },
  { value: 'MES_ANTERIOR', label: 'Mês Anterior' },
  { value: 'TRIMESTRE',    label: 'Trimestre' },
  { value: 'ANO_ATUAL',    label: 'Ano Atual' },
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
  const [periodo, setPeriodo] = useState<PeriodoFiltro>('MES_ATUAL')
  const [autorizado, setAutorizado] = useState<boolean | null>(null)
  const [canCreate, setCanCreate] = useState(false)

  const { propriedadeId, safraId } = useSafraContext()

  const { data, loading, error, refetch } = useDashboardFinanceiro(
    periodo, propriedadeId, safraId
  )
  const resumo = data?.resumo
  const lancamentos = data?.lancamentosRecentes ?? []

  useEffect(() => {
    const u = Cookies.get('user')
    if (u) {
      const parsed = JSON.parse(u)
      const isAdmin = parsed.perfil === 'admin'
      const perm = parsed.permissoes || {}
      const podeCriar = isAdmin || perm?.financeiro?.criar === true
      const podeVer   = isAdmin || perm?.financeiro?.ver   === true

      setCanCreate(podeCriar)

      if (isAdmin || podeVer) { setAutorizado(true) }
      else { setAutorizado(false) }
    }
  }, [])

  if (autorizado === null) return null
  if (!autorizado) return <SemPermissao />

  return (
    <div className="space-y-5">

      {/* ── Header ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-green-500/10">
            <DollarSign className="w-6 h-6 text-green-400" />
          </div>
          <div>
            <h1 className="text-lg font-bold text-white">Financeiro</h1>
            <p className="text-xs text-gray-400">Lançamentos de receitas e despesas.</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <select
            value={periodo}
            onChange={(e) => setPeriodo(e.target.value as PeriodoFiltro)}
            className="bg-white/5 border border-white/10 text-white text-xs rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500/50"
          >
            {PERIODOS.map((p) => (
              <option key={p.value} value={p.value} className="bg-gray-900">{p.label}</option>
            ))}
          </select>
          <button onClick={refetch}
            className="p-2 rounded-xl bg-white/5 border border-white/10 text-gray-400 hover:text-white transition-colors">
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          </button>
          {canCreate && (
            <button
              onClick={() => router.push('/financeiro/novo')}
              className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-500 text-white text-sm font-medium rounded-xl transition-colors"
            >
              <Plus className="w-4 h-4" />
              Novo
            </button>
          )}
        </div>
      </div>

      {error && (
        <div className="rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-red-400 text-sm">{error}</div>
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

      {/* ── Tabs ── */}
      <div className="rounded-2xl border border-white/8 bg-white/[0.02] p-4">
        <FinanceiroTabs lancamentos={lancamentos} loading={loading} />
      </div>

      {/* ── Lançamentos ── */}
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
