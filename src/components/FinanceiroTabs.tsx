'use client'
import { useState, useMemo } from 'react'
import { TrendingDown, TrendingUp, CheckCircle, AlertCircle, Calendar } from 'lucide-react'

const formatCurrency = (value: number) =>
  new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value)

// ✅ tipo: string (compatível com LancamentoRecente do hook)
interface Lancamento {
  id: string
  descricao: string
  valor: number
  tipo: string
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
  prefix: string
}

export default function FinanceiroTabs({ lancamentos = [], loading = false }: FinanceiroTabsProps) {
  const [tab, setTab] = useState<TabType>('pagar')

  const hoje = new Date()
  hoje.setHours(0, 0, 0, 0)

  const sum = (arr: Lancamento[]) =>
    arr.reduce((acc, l) => acc + Number(l.valor), 0)

  const isPago = (l: Lancamento) =>
    l.status === 'pago' || l.status === 'recebido'

  const isAtrasado = (l: Lancamento) => {
    if (isPago(l)) return false
    const ref = l.dataVencimento || l.data
    if (!ref) return false
    return new Date(ref) < hoje
  }

  const isFuturo = (l: Lancamento) => {
    if (isPago(l)) return false
    const ref = l.dataVencimento || l.data
    if (!ref) return false
    return new Date(ref) >= hoje
  }

  // ── Contas a Pagar (DESPESA) ──
  const pagar = useMemo(() => {
    const list = lancamentos.filter(l =>
      l.tipo?.toUpperCase() === 'DESPESA'
    )
    return {
      emAtraso: { value: sum(list.filter(isAtrasado)), count: list.filter(isAtrasado).length },
      pago:     { value: sum(list.filter(isPago)),     count: list.filter(isPago).length },
      futuro:   { value: sum(list.filter(isFuturo)),   count: list.filter(isFuturo).length },
      total:    { value: sum(list),                    count: list.length },
    }
  }, [lancamentos])

  // ── Contas a Receber (RECEITA) ──
  const receber = useMemo(() => {
    const list = lancamentos.filter(l =>
      l.tipo?.toUpperCase() === 'RECEITA'
    )
    return {
      emAtraso: { value: sum(list.filter(isAtrasado)), count: list.filter(isAtrasado).length },
      recebido: { value: sum(list.filter(isPago)),     count: list.filter(isPago).length },
      futuro:   { value: sum(list.filter(isFuturo)),   count: list.filter(isFuturo).length },
      total:    { value: sum(list),                    count: list.length },
    }
  }, [lancamentos])

  const pagarItems: SubItem[] = [
    { label: 'Em atraso', value: pagar.emAtraso.value, count: pagar.emAtraso.count, color: 'text-red-400',     bg: 'border-red-500/20 bg-red-500/5',         icon: <AlertCircle className="w-4 h-4 text-red-400" />,     prefix: '-' },
    { label: 'Pago',      value: pagar.pago.value,     count: pagar.pago.count,     color: 'text-emerald-400', bg: 'border-emerald-500/20 bg-emerald-500/5', icon: <CheckCircle className="w-4 h-4 text-emerald-400" />, prefix: '-' },
    { label: 'Futuro',    value: pagar.futuro.value,   count: pagar.futuro.count,   color: 'text-blue-400',    bg: 'border-blue-500/20 bg-blue-500/5',       icon: <Calendar    className="w-4 h-4 text-blue-400" />,    prefix: '-' },
    { label: 'Total',     value: pagar.total.value,    count: pagar.total.count,    color: 'text-gray-200',    bg: 'border-white/10 bg-white/5',             icon: <TrendingDown className="w-4 h-4 text-gray-400" />,   prefix: '-' },
  ]

  const receberItems: SubItem[] = [
    { label: 'Em atraso', value: receber.emAtraso.value, count: receber.emAtraso.count, color: 'text-red-400',     bg: 'border-red-500/20 bg-red-500/5',         icon: <AlertCircle className="w-4 h-4 text-red-400" />,     prefix: '+' },
    { label: 'Recebido',  value: receber.recebido.value, count: receber.recebido.count, color: 'text-emerald-400', bg: 'border-emerald-500/20 bg-emerald-500/5', icon: <CheckCircle className="w-4 h-4 text-emerald-400" />, prefix: '+' },
    { label: 'Futuro',    value: receber.futuro.value,   count: receber.futuro.count,   color: 'text-blue-400',    bg: 'border-blue-500/20 bg-blue-500/5',       icon: <Calendar    className="w-4 h-4 text-blue-400" />,    prefix: '+' },
    { label: 'Total',     value: receber.total.value,    count: receber.total.count,    color: 'text-gray-200',    bg: 'border-white/10 bg-white/5',             icon: <TrendingUp  className="w-4 h-4 text-gray-400" />,    prefix: '+' },
  ]

  const items = tab === 'pagar' ? pagarItems : receberItems

  return (
    <div className="w-full">

      {/* ── Tabs ── */}
      <div className="flex items-center border-b border-white/8 mb-6">
        {([
          { key: 'pagar'   as TabType, label: 'Contas a Pagar',   Icon: TrendingDown },
          { key: 'receber' as TabType, label: 'Contas a Receber', Icon: TrendingUp },
        ] as const).map(({ key, label, Icon }) => (
          <button
            key={key}
            onClick={() => setTab(key)}
            className={`
              relative flex items-center gap-2 px-5 py-3
              text-sm font-semibold transition-all duration-200 select-none
              ${tab === key ? 'text-white' : 'text-gray-500 hover:text-gray-300'}
            `}
          >
            <Icon className="w-4 h-4" />
            {label}
            <span className={`
              absolute bottom-0 left-0 right-0 h-0.5 rounded-full bg-green-500
              transition-all duration-300
              ${tab === key ? 'opacity-100' : 'opacity-0'}
            `}/>
          </button>
        ))}
      </div>

      {/* ── Cards ── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {items.map((item) => (
          <div
            key={item.label}
            className={`rounded-2xl border p-4 flex flex-col gap-2 transition-transform duration-200 hover:scale-[1.015] ${item.bg}`}
          >
            <div className="flex items-center justify-between">
              <span className="text-xs text-gray-400 font-medium">{item.label}</span>
              {item.icon}
            </div>
            <div>
              {loading ? (
                <div className="h-6 w-28 bg-white/10 rounded-lg animate-pulse" />
              ) : (
                <p className={`text-base font-bold leading-tight ${item.color}`}>
                  {item.prefix}{formatCurrency(item.value)}
                </p>
              )}
              <p className="text-xs text-gray-500 mt-1">
                {item.count} {item.count === 1 ? 'lançamento' : 'lançamentos'}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
