'use client'
import CrudPage from '@/components/ui/CrudPage'
import { FileText } from 'lucide-react'

const fields = [
  { key: 'titulo', label: 'Título', required: true },
  { key: 'descricao', label: 'Descrição' },
  { key: 'tipo', label: 'Tipo' },
  { key: 'status', label: 'Status' },
]

export default function DocumentosPage() {
  return <CrudPage title="Documentos" endpoint="/documentos" fields={fields} icon={<FileText className="w-8 h-8 text-cyan-400" />} />
}
