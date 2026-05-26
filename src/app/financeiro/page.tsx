'use client'
import { useSafraContext } from '@/lib/SafraContext'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Cookies from 'js-cookie'
import { DollarSign, TrendingUp, TrendingDown, Wallet, BarChart2, RefreshCw } from 'lucide-react'
import CrudPage from '@/components/ui/CrudPage'
import { useDashboardFinanceiro, PeriodoFiltro } from './useDashboardFinanceiro'

const formatCurrency = (value: number) =>
  new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value)

const PERIODOS: { value: PeriodoFiltro; label: string }[] = [
  { value: 'MES_ATUAL', label: 'Mês Atual' },
  { value: 'MES_ANTERIOR', label: 'Mês Anterior' },
  { value: 'TRIMESTRE', label: 'Trimestre' },
  { value: 'ANO_ATUAL', label: 'Ano Atual' },
]

function KpiCard({ title, value, icon, color, sub }: {
  title: string; value: string; icon: React.ReactNode; color: string; sub?: string
}) {
  return (
    <div className={`rounded-2xl p-5 border ${color} flex flex-col gap-3`}>
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium text-gray-400">{title}</span>
        <div className="p-2 rounded-xl bg-white/5">{icon}</div>
      </div>
      <div>
        <p className="text-2xl font-bold text-white">{value}</p>
        {sub && <p className="text-xs text-gray-400 mt-1">{sub}</p>}
      </div>
    </div>
  )
}

const fields = [
  { key: 'descricao', label: 'Descrição', required: true },
  { key: 'valor', label: 'Valor', type: 'number' },
  { key: 'tipo', label: 'Tipo', type: 'select', options: ['RECEITA', 'DESPESA'] },
  { key: 'data', label: 'Data', type: 'date' },
  { key: 'status', label: 'Status', type: 'select', options: ['pendente', 'pago', 'Em Aberto'] },
  { key: 'dataVencimento', label: 'Data Vencimento', type: 'date' },
  { key: 'observacao', label: 'Observação' },
]

export default function FinanceiroPage() {
  const [periodo, setPeriodo] = useState<PeriodoFiltro>('MES_ATUAL')
  const [autorizado, setAutorizado] = useState<boolean | null>(null)
  const { propriedadeId, safraId } = useSafraContext()
  const { data, loading, error, refetch } = useDashboardFinanceiro(periodo, propriedadeId, safraId)
  const resumo = data?.resumo
  const router = useRouter()

  useEffect(() => {
    const u = Cookies.get('user')
    if (u) {
      const parsed = JSON.parse(u)
      if (parsed.perfil === 'admin') {
        setAutorizado(true)
        return
      }
      const perm = parsed.permissoes || {}
      if (perm?.financeiro?.ver === true) {
        setAutorizado(true)
      } else {
        setAutorizado(false)
        router.replace('/dashboard')
      }
    }
  }, [])

  if (autorizado === null) return null
  if (!autorizado) return null

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-green-500/10">
            <DollarSign className="w-7 h-7 text-green-400" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-white">Financeiro</h1>
            <p className="text-sm text-gray-400">Lançamentos de receitas e despesas</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <select
            value={periodo}
            onChange={(e) => setPeriodo(e.target.value as PeriodoFiltro)}
            className="bg-white/5 border border-white/10 text-white text-sm rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500/50"
          >
            {PERIODOS.map((p) => (
              <option key={p.value} value={p.value} className="bg-gray-900">{p.label}</option>
            ))}
          </select>
          <button
            onClick={refetch}
            className="p-2 rounded-xl bg-white/5 border border-white/10 text-gray-400 hover:text-white transition-colors"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {error && (
        <div className="rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-red-400 text-sm">{error}</div>
      )}

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiCard
          title="Receitas"
          value={loading ? '...' : formatCurrency(resumo?.totalReceitas ?? 0)}
          icon={<TrendingUp className="w-5 h-5 text-emerald-400" />}
          color="border-emerald-500/20 bg-emerald-500/5"
        />
        <KpiCard
          title="Despesas"
          value={loading ? '...' : formatCurrency(resumo?.totalDespesas ?? 0)}
          icon={<TrendingDown className="w-5 h-5 text-red-400" />}
          color="border-red-500/20 bg-red-500/5"
        />
        <KpiCard
          title="Saldo"
          value={loading ? '...' : formatCurrency(resumo?.saldo ?? 0)}
          icon={<Wallet className="w-5 h-5 text-blue-400" />}
          color={`border-blue-500/20 ${(resumo?.saldo ?? 0) >= 0 ? 'bg-blue-500/5' : 'bg-red-500/5'}`}
        />
        <KpiCard
          title="Margem"
          value={loading ? '...' : `${resumo?.margemLucro ?? 0}%`}
          icon={<BarChart2 className="w-5 h-5 text-purple-400" />}
          color="border-purple-500/20 bg-purple-500/5"
          sub="Margem de lucro"
        />
      </div>

      <CrudPage
        title="Lançamentos"
        endpoint="/financeiro"
        fields={fields}
        icon={<DollarSign className="w-8 h-8 text-green-400" />}
      />
    </div>
  )
}
