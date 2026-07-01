'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Cookies from 'js-cookie'
import {
  TrendingUp, TrendingDown,
  Wallet, BarChart2, ChevronDown
} from 'lucide-react'
import CrudPage from '@/components/ui/CrudPage'
import SemPermissao from '@/components/ui/SemPermissao'
import { useDashboardFinanceiro, PeriodoFiltro } from './useDashboardFinanceiro'
import FinanceiroTabs from '@/components/FinanceiroTabs'
import { usePropriedade } from '@/contexts/PropriedadeContext'

const formatCurrency = (value: number) =>
  new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value)

function KpiCard({ title, value, icon, color, sub }: {
  title: string; value: string; icon: React.ReactNode; color: string; sub?: string
}) {
  return (
    <div className={`rounded-xl px-3 py-2 border ${color} flex flex-col gap-1`}>
      <div className="flex items-center justify-between">
        <span className="text-[11px] font-medium text-gray-400">{title}</span>
        <div className="p-1 rounded-md bg-white/5">{icon}</div>
      </div>
      <div>
        <p className="text-sm font-bold text-white leading-tight">{value}</p>
        {sub && <p className="text-[10px] text-gray-500">{sub}</p>}
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
  const [tabsAbertas, setTabsAbertas] = useState(false)

  const {
    propriedades, safrasFiltradas,
    propriedadeId, setPropriedadeId,
    safraId, setSafraId,
    periodo: periodoCtx, setPeriodo: setPeriodoCtx,
  } = usePropriedade()
  const periodo    = (periodoCtx || 'ANO_ATUAL') as PeriodoFiltro
  const setPeriodo = (v: PeriodoFiltro) => setPeriodoCtx(v)

  const { data, loading, error } = useDashboardFinanceiro(periodo, propriedadeId, safraId)
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
    <div className="space-y-3">

      {error && (
        <div className="rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-red-400 text-sm">
          {error}
        </div>
      )}

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-2">
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

      <CrudPage
        key={`${propriedadeId || 'all'}-${safraId || 'all'}`}
        title="Lançamentos"
        endpoint="/financeiro"
        fields={fields}
        fazendaId={propriedadeId || ''}
        safraId={safraId || undefined}
      />

    </div>
  )
}
