'use client'
import CrudPage from '@/components/ui/CrudPage'
import { Package } from 'lucide-react'

const fields = [
  { key: 'nome', label: 'Nome do Produto', required: true },
  { key: 'descricao', label: 'Descrição' },
  { key: 'quantidade', label: 'Quantidade', type: 'number' },
  { key: 'unidade', label: 'Unidade (kg, L, un)' },
  { key: 'valorUnitario', label: 'Valor Unitário', type: 'number' },
  { key: 'categoria', label: 'Categoria' },
  { key: 'status', label: 'Status' },
]

export default function EstoquePage() {
  return <CrudPage title="Estoque" endpoint="/estoque" fields={fields} icon={<Package className="w-8 h-8 text-orange-400" />} />
}
