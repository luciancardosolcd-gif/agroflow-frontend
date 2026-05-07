'use client'
import CrudPage from '@/components/ui/CrudPage'
import { FileText } from 'lucide-react'

const fields = [
  { key: 'titulo', label: 'Título', required: true },
  { key: 'descricao', label: 'Descrição' },
  { key: 'valor', label: 'Valor', type: 'number' },
  { key: 'status', label: 'Status' },
  { key: 'dataInicio', label: 'Data Início', type: 'date' },
  { key: 'dataFim', label: 'Data Fim', type: 'date' },
]

export default function ContratosPage() {
  return <CrudPage title="Contratos" endpoint="/contratos" fields={fields} icon={<FileText className="w-8 h-8 text-yellow-400" />} />
}
