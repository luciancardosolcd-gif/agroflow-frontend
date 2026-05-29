'use client'
import { useState, useEffect, useCallback } from 'react'
import api from '@/lib/api'

export type PeriodoFiltro =
  | 'MES_ATUAL'
  | 'MES_ANTERIOR'
  | 'TRIMESTRE'
  | 'ANO_ATUAL'
  | 'SAFRA'
  | 'PERSONALIZADO'

export interface ResumoFinanceiro {
  totalReceitas: number
  totalDespesas: number
  saldo: number
  margemLucro: number
}

export interface DespesaCategoria {
  categoria: string
  total: number
}

export interface EvolucaoMensal {
  mes: string
  receitas: number
  despesas: number
}

export interface LancamentoRecente {
  id: string
  descricao: string
  valor: number
  tipo: string
  categoria: string
  data: string
  status: string
}

export interface DashboardData {
  resumo: ResumoFinanceiro
  despesasPorCategoria: DespesaCategoria[]
  evolucaoMensal: EvolucaoMensal[]
  lancamentosRecentes: LancamentoRecente[]
}

export function useDashboardFinanceiro(
  periodo: PeriodoFiltro = 'MES_ATUAL',
  propriedadeId?: string,  // ← vem do SafraContext
  safraId?: string,
) {
  const [data, setData]       = useState<DashboardData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError]     = useState<string | null>(null)

  const fetchDashboard = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)

      // ✅ FIX: usa propriedadeId como fazendaId no query param
      let url = `/fin-dashboard?periodo=${periodo}`
      if (propriedadeId && propriedadeId !== '') url += `&fazendaId=${propriedadeId}`
      if (safraId && safraId !== '')             url += `&safraId=${safraId}`

      const response = await api.get(url)
      setData(response.data)
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Erro ao carregar dashboard')
    } finally {
      setLoading(false)
    }
  }, [periodo, propriedadeId, safraId])

  useEffect(() => {
    fetchDashboard()
  }, [fetchDashboard])

  return { data, loading, error, refetch: fetchDashboard }
}
