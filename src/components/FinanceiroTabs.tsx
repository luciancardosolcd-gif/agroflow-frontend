'use client'
import { useState, useMemo } from 'react'
import { TrendingDown, TrendingUp, Clock, CheckCircle, AlertCircle, Calendar } from 'lucide-react'

const formatCurrency = (value: number) =>
  new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value)

interface Lancamento {
  id: string
  descricao: string
  valor: number
  tipo: 'RECEITA' | 'DESPESA'
  data: string
  dataVencimento?: string
  status?: string
}

interface FinanceiroTabsProps {
  lancamentos: Lancamento[]
  loading?: boolean
}

type TabType = 'pagar' | 'receber'

interface SubItem {
  label: string
  value: number
  count: number
  color: string
  icon: React.ReactNode
  bg: string
}

export default function FinanceiroTabs({ lancamentos = [], loading = false }: FinanceiroTabsProps) {
  const [tab, setTab] = useState<TabType>('pagar')

  const hoje = new Date()
  hoje.setHours(0, 0, 0, 0)

  // ── Contas a Pagar (DESPESA) ──
  const pagar = useMemo(() => {
    const despesas = lancamentos.filter(l => l.tipo === 'DESPESA')

    const emAtraso = despesas.filter(l => {
      const venc = l.dataVencimento ? new Date(l.dataVencimento) : new Date(l.data)
      return venc < hoje && l.status !== 'pago'
    })

    const pago = despesas.filter(l => l.status === 'pago')

    const futuro = despesas.filter(l => {
      const venc = l.dataVencimento ? new Date(l.dataVencimento) : new Date(l.data)
      return venc >= hoje && l.status !== 'pago'
    })

    const sum = (arr: Lancamento[]) => arr.reduce((acc, l) => acc + Number(l.valor), 0)

    return {
      emAtraso: { value: sum(emAtraso), count: emAtraso.length },
      pago:     { value: sum(pago),     count: pago.length },
      futuro:   { value: sum(futuro),   count: futuro.length },
      total:    { value: sum(despesas), count: despesas.length },
    }
  }, [lancamentos])

  // ── Contas a Receber (RECEITA) ──
  const receber = useMemo(() => {
    const receitas = lancamentos.filter(l => l.tipo === 'RECEITA')

    const emAtraso = receitas.filter(l => {
      const venc = l.dataVencimento ? new Date(l.dataVencimento) : new Date(l.data)
      return venc < hoje && l.status !== 'pago' && l.status !== 'recebido'
    })

    const recebido = receitas.filter(l =>
      l.status === 'pago' || l.status === 'recebido'
    )

    const futuro = receitas.filter(l => {
      const venc = l.dataVencimento ? new Date(l.dataVencimento) : new Date(l.data)
      return venc >= hoje && l.status !== 'pago' && l.status !== 'recebido'
    })

    const sum = (arr: Lancamento[]) => arr.reduce((acc, l) => acc + Number(l.valor), 0)

    return {
      emAtraso: { value: sum(emAtraso), count: emAtraso.length },
      recebido: { value: sum(recebido), count: recebido.length },
      futuro:   { value: sum(futuro),   count: futuro.length },
      total:    { value: sum(receitas), count: receitas.length },
    }
  }, [lancamentos])

  const pagarItems: SubItem[] = [
    {
      label: 'Em atraso',
      value: pagar.emAtraso.value,
      count: pagar.emAtraso.count,
      color: 'text-red-400',
      bg: 'bg-red-500/8 border-red-500/20',
      icon: <AlertCircle className="w-4 h-4 text-red-400" />,
    },
    {
      label: 'Pago',
      value: pagar.pago.value,
      count: pagar.pago.count,
      color: 'text-emerald-400',
      bg: 'bg-emerald-500/8 border-emerald-500/20',
      icon: <CheckCircle className="w-4 h-4 text-emerald-400" />,
    },
    {
      label: 'Futuro',
      value: pagar.futuro.value,
      count: pagar.futuro.count,
      color: 'text-blue-400',
      bg: 'bg-blue-500/8 border-blue-500/20',
      icon: <Calendar className="w-4 h-4 text-blue-400" />,
    },
    {
      label: 'Total',
      value: pagar.total.value,
      count: pagar.total.count,
      color: 'text-gray-200',
      bg: 'bg-white/5 border-white/10',
      icon: <TrendingDown className="w-4 h-4 text-gray-400" />,
    },
  ]

  const receberItems: SubItem[] = [
    {
      label: 'Em atraso',
      value: receber.emAtraso.value,
      count: receber.emAtraso.count,
      color: 'text-red-400',
      bg: 'bg-red-500/8 border-red-500/20',
      icon: <AlertCircle className="w-4 h-4 text-red-400" />,
    },
    {
      label: 'Recebido',
      value: receber.recebido.value,
      count: receber.recebido.count,
      color: 'text-emerald-400',
      bg: 'bg-emerald-500/8 border-emerald-500/20',
      icon: <CheckCircle className="w-4 h-4 text-emerald-400" />,
    },
    {
      label: 'Futuro',
      value: receber.futuro.value,
      count: receber.futuro.count,
      color: 'text-blue-400',
      bg: 'bg-blue-500/8 border-blue-500/20',
      icon: <Calendar className="w-4 h-4 text-blue-400" />,
    },
    {
      label: 'Total',
      value: receber.total.value,
      count: receber.total.count,
      color: 'text-gray-200',
      bg: 'bg-white/5 border-white/10',
      icon: <TrendingUp className="w-4 h-4 text-gray-400" />,
    },
  ]

  const items = tab === 'pagar' ? pagarItems : receberItems

  return (
    <div className="w-full">

      {/* ── Tabs ── */}
      <div className="flex items-center gap-0 border-b border-white/8 mb-6">
        {[
          { key: 'pagar' as TabType,   label: 'Contas a Pagar',   icon: <TrendingDown className="w-4 h-4" /> },
          { key: 'receber' as TabType, label: 'Contas a Receber', icon: <TrendingUp   className="w-4 h-4" /> },
        ].map(t => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={`
              relative flex items-center gap-2 px-5 py-3 text-sm font-semibold
              transition-all duration-200 select-none
              ${tab === t.key
                ? 'text-white'
                : 'text-gray-500 hover:text-gray-300'
              }
            `}
          >
            {t.icon}
            {t.label}

            {/* Underline animado */}
            <span
              className={`
                absolute bottom-0 left-0 right-0 h-0.5 rounded-full
                transition-all duration-300 ease-out
                ${tab === t.key ? 'bg-green-500 opacity-100' : 'bg-transparent opacity-0'}
              `}
            />
          </button>
        ))}
      </div>

      {/* ── Cards de resumo ── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {items.map((item) => (
          <div
            key={item.label}
            className={`
              rounded-2xl border p-4 flex flex-col gap-2
              transition-all duration-200 hover:scale-[1.01]
              ${item.bg}
            `}
          >
            <div className="flex items-center justify-between">
              <span className="text-xs text-gray-400 font-medium">{item.label}</span>
              {item.icon}
            </div>
            <div>
              {loading ? (
                <div className="h-6 w-24 bg-white/10 rounded animate-pulse" />
              ) : (
                <p className={`text-lg font-bold ${item.color}`}>
                  {tab === 'pagar' ? '-' : '+'}{formatCurrency(item.value)}
                </p>
              )}
              <p className="text-xs text-gray-500 mt-0.5">
                {item.count} {item.count === 1 ? 'lançamento' : 'lançamentos'}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
