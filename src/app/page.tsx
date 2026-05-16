'use client'
import { useState } from 'react'
import { DollarSign, TrendingUp, TrendingDown, Wallet, BarChart2, RefreshCw } from 'lucide-react'
import CrudPage from '@/components/ui/CrudPage'
import { useDashboardFinanceiro, PeriodoFiltro } from './useDashboardFinanceiro'

// ─── Helpers ────────────────────────────────────────────────────────────────
const formatCurrency = (value: number) =>
  new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value)

const PERIODOS: { value: PeriodoFiltro; label: string }[] = [
  { value: 'MES_ATUAL', label: 'Mês Atual' },
  { value: 'MES_ANTERIOR', label: 'Mês Anterior' },
  { value: 'TRIMESTRE', label: 'Trimestre' },
  { value: 'ANO_ATUAL', label: 'Ano Atual' },
]

// ─── Card de KPI ─────────────────────────────────────────────────────────────
function KpiCard({
  title, value, icon, color, sub,
}: {
  title: string
  value: string
  icon: React.ReactNode
  color: string
  sub?: string
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

// ─── Barra de progresso simples ───────────────────────────────────────────────
function BarraCategoria({ label, total, max }: { label: string; total: number; max: number }) {
  const pct = max > 0 ? Math.round((total / max) * 100) : 0
  return (
    <div className="flex flex-col gap-1">
      <div className="flex justify-between text-xs text-gray-400">
        <span>{label}</span>
        <span>{formatCurrency(total)}</span>
      </div>
      <div className="h-2 bg-white/5 rounded-full overflow-hidden">
        <div
          className="h-full bg-gradient-to-r from-red-500 to-orange-400 rounded-full transition-all duration-700"
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  )
}

// ─── Gráfico de evolução mensal (barras simples em CSS) ───────────────────────
function GraficoEvolucao({ dados }: { dados: { mes: string; receitas: number; despesas: number }[] }) {
  const max = Math.max(...dados.flatMap((d) => [d.receitas, d.despesas]), 1)
  return (
    <div className="flex items-end gap-3 h-32 mt-2">
      {dados.map((d) => (
        <div key={d.mes} className="flex-1 flex flex-col items-center gap-1">
          <div className="flex items-end gap-0.5 w-full h-24">
            <div
              title={`Receitas: ${formatCurrency(d.receitas)}`}
              className="flex-1 bg-emerald-500/70 rounded-t transition-all duration-700"
              style={{ height: `${(d.receitas / max) * 100}%` }}
            />
            <div
              title={`Despesas: ${formatCurrency(d.despesas)}`}
              className="flex-1 bg-red-500/70 rounded-t transition-all duration-700"
              style={{ height: `${(d.despesas / max) * 100}%` }}
            />
          </div>
          <span className="text-[10px] text-gray-500">{d.mes.slice(5)}</span>
        </div>
      ))}
      {dados.length === 0 && (
        <p className="text-gray-500 text-sm w-full text-center">Sem dados no período</p>
      )}
    </div>
  )
}

// ─── Campos do CRUD ───────────────────────────────────────────────────────────
const fields = [
  { key: 'descricao', label: 'Descrição', required: true },
  { key: 'valor', label: 'Valor', type: 'number' },
  { key: 'tipo', label: 'Tipo', type: 'select', options: ['RECEITA', 'DESPESA'] },
  { key: 'categoria', label: 'Categoria' },
  { key: 'data', label: 'Data', type: 'date' },
  { key: 'status', label: 'Status' },
  { key: 'dataVencimento', label: 'Data Vencimento', type: 'date' },
]

// ─── Página principal ─────────────────────────────────────────────────────────
export default function FinanceiroPage() {
  const [periodo, setPeriodo] = useState<PeriodoFiltro>('MES_ATUAL')
  const { data, loading, error, refetch } = useDashboardFinanceiro(periodo)

  const resumo = data?.resumo
  const categorias = data?.despesasPorCategoria ?? []
  const evolucao = data?.evolucaoMensal ?? []
  const recentes = data?.lancamentosRecentes ?? []
  const maxCategoria = Math.max(...categorias.map((c) => c.total), 1)

  return (
    <div className="space-y-8">
      {/* ── Cabeçalho ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-green-500/10">
            <DollarSign className="w-7 h-7 text-green-400" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-white">Financeiro</h1>
            <p className="text-sm text-gray-400">Visão geral e lançamentos</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <select
            value={periodo}
            onChange={(e) => setPeriodo(e.target.value as PeriodoFiltro)}
            className="bg-white/5 border border-white/10 text-white text-sm rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500/50"
          >
            {PERIODOS.map((p) => (
              <option key={p.value} value={p.value} className="bg-gray-900">
                {p.label}
              </option>
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

      {/* ── Erro ── */}
      {error && (
        <div className="rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-red-400 text-sm">
          {error}
        </div>
      )}

      {/* ── Cards KPI ── */}
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

      {/* ── Gráficos ── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Evolução mensal */}
        <div className="rounded-2xl border border-white/10 bg-white/3 p-5">
          <h3 className="text-sm font-semibold text-gray-300 mb-1">Evolução Mensal</h3>
          <div className="flex gap-4 mb-3">
            <span className="flex items-center gap-1 text-xs text-gray-400">
              <span className="w-2 h-2 rounded-sm bg-emerald-500 inline-block" /> Receitas
            </span>
            <span className="flex items-center gap-1 text-xs text-gray-400">
              <span className="w-2 h-2 rounded-sm bg-red-500 inline-block" /> Despesas
            </span>
          </div>
          {loading ? (
            <div className="h-32 flex items-center justify-center text-gray-500 text-sm">Carregando...</div>
          ) : (
            <GraficoEvolucao dados={evolucao} />
          )}
        </div>

        {/* Despesas por categoria */}
        <div className="rounded-2xl border border-white/10 bg-white/3 p-5">
          <h3 className="text-sm font-semibold text-gray-300 mb-4">Despesas por Categoria</h3>
          {loading ? (
            <div className="h-32 flex items-center justify-center text-gray-500 text-sm">Carregando...</div>
          ) : categorias.length === 0 ? (
            <p className="text-gray-500 text-sm text-center py-8">Sem despesas no período</p>
          ) : (
            <div className="flex flex-col gap-3">
              {categorias.map((c) => (
                <BarraCategoria key={c.categoria} label={c.categoria} total={c.total} max={maxCategoria} />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* ── Lançamentos recentes ── */}
      {recentes.length > 0 && (
        <div className="rounded-2xl border border-white/10 bg-white/3 p-5">
          <h3 className="text-sm font-semibold text-gray-300 mb-4">Lançamentos Recentes</h3>
          <div className="flex flex-col divide-y divide-white/5">
            {recentes.map((l) => (
              <div key={l.id} className="flex items-center justify-between py-3">
                <div>
                  <p className="text-sm text-white">{l.descricao}</p>
                  <p className="text-xs text-gray-400">{l.categoria} · {new Date(l.data).toLocaleDateString('pt-BR')}</p>
                </div>
                <span className={`text-sm font-semibold ${l.tipo === 'RECEITA' ? 'text-emerald-400' : 'text-red-400'}`}>
                  {l.tipo === 'RECEITA' ? '+' : '-'}{formatCurrency(l.valor)}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── CRUD de lançamentos ── */}
      <CrudPage
        title="Lançamentos"
        endpoint="/financeiro"
        fields={fields}
        icon={<DollarSign className="w-8 h-8 text-green-400" />}
      />
    </div>
  )
}
