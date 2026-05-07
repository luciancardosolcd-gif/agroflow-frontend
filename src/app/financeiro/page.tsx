'use client'
import CrudPage from '@/components/ui/CrudPage'
import { DollarSign } from 'lucide-react'

const fields = [
  { key: 'descricao', label: 'Descrição', required: true },
  { key: 'valor', label: 'Valor', type: 'number' },
  { key: 'tipo', label: 'Tipo (receita/despesa)' },
  { key: 'categoria', label: 'Categoria' },
  { key: 'status', label: 'Status' },
  { key: 'dataVencimento', label: 'Data Vencimento', type: 'date' },
]

export default function FinanceiroPage() {
  return <CrudPage title="Financeiro" endpoint="/financeiro" fields={fields} icon={<DollarSign className="w-8 h-8 text-green-400" />} />
}
