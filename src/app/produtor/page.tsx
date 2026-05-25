'use client'
import { useState } from 'react'
import { useSafraContext } from '@/lib/SafraContext'
import { Tractor, Leaf, BarChart3, FileText, Package, DollarSign, TrendingUp, TrendingDown } from 'lucide-react'
import PainelCustoRealizado from '@/components/PainelCustoRealizado'
import { useDashboardFinanceiro, PeriodoFiltro } from '../financeiro/useDashboardFinanceiro'

const formatCurrency = (value: number) =>
  new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value)

const PERIODOS: { value: PeriodoFiltro; label: string }[] = [
  { value: 'MES_ATUAL', label: 'Mês Atual' },
  { value: 'MES_ANTERIOR', label: 'Mês Anterior' },
  { value: 'TRIMESTRE', label: 'Trimestre' },
  { value: 'ANO_ATUAL', label: 'Ano Atual' },
]

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

export default function PainelProdutorPage() {
  const [periodo, setPeriodo] = useState<PeriodoFiltro>('MES_ATUAL')
  const { propriedadeId, safraId } = useSafraContext()
  const { data, loading } = useDashboardFinanceiro(periodo, propriedadeId, safraId)
  const resumo = data?.resumo
  const evolucao = data?.evolucaoMensal ?? []

  const modulos = [
    { icon: Tractor, label: 'Maquinários', desc: 'Gestão de equipamentos', color: 'text-yellow-400', bg: 'bg-yellow-900/20 border-yellow-800/40' },
    { icon: Leaf, label: 'Culturas', desc: 'Plantio e colheita', color: 'text-green-400', bg: 'bg-green-900/20 border-green-800/40' },
    { icon: BarChart3, label: 'Produção', desc: 'Relatórios de produção', color: 'text-blue-400', bg: 'bg-blue-900/20 border-blue-800/40' },
    { icon: Package, label: 'Insumos', desc: 'Controle de insumos', color: 'text-orange-400', bg: 'bg-orange-900/20 border-orange-800/40' },
    { icon: FileText, label: 'Relatórios', desc: 'Relatórios do produtor', color: 'text-purple-400', bg: 'bg-purple-900/20 border-purple-800/40' },
  ]

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl text-green-100 flex items-center gap-3">
            <Tractor className="w-8 h-8 text-yellow-400" />
            Painel do Produtor
          </h1>
          <p className="text-green-600 mt-1">Visão consolidada da produção agrícola</p>
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
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="rounded-2xl p-5 border border-emerald-500/20 bg-emerald-500/5 flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-gray-400">Receitas</span>
            <div className="p-2 rounded-xl bg-white/5"><TrendingUp className="w-5 h-5 text-emerald-400" /></div>
          </div>
          <p className="text-2xl font-bold text-white">{loading ? '...' : formatCurrency(resumo?.totalReceitas ?? 0)}</p>
        </div>
        <div className="rounded-2xl p-5 border border-red-500/20 bg-red-500/5 flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-gray-400">Despesas</span>
            <div className="p-2 rounded-xl bg-white/5"><TrendingDown className="w-5 h-5 text-red-400" /></div>
          </div>
          <p className="text-2xl font-bold text-white">{loading ? '...' : formatCurrency(resumo?.totalDespesas ?? 0)}</p>
        </div>
        <div className="rounded-2xl p-5 border border-blue-500/20 bg-blue-500/5 flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-gray-400">Saldo</span>
            <div className="p-2 rounded-xl bg-white/5"><DollarSign className="w-5 h-5 text-blue-400" /></div>
          </div>
          <p className="text-2xl font-bold text-white">{loading ? '...' : formatCurrency(resumo?.saldo ?? 0)}</p>
        </div>
        <div className="rounded-2xl p-5 border border-purple-500/20 bg-purple-500/5 flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-gray-400">Margem</span>
            <div className="p-2 rounded-xl bg-white/5"><BarChart3 className="w-5 h-5 text-purple-400" /></div>
          </div>
          <p className="text-2xl font-bold text-white">{loading ? '...' : `${resumo?.margemLucro ?? 0}%`}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
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

        <PainelCustoRealizado fazendaId={propriedadeId} safraId={safraId} />
      </div>

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
    </div>
  )
}
