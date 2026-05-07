'use client'
import CrudPage from '@/components/ui/CrudPage'
import { Cog } from 'lucide-react'

const fields = [
  { key: 'nome', label: 'Nome', required: true },
  { key: 'modelo', label: 'Modelo' },
  { key: 'marca', label: 'Marca' },
  { key: 'ano', label: 'Ano', type: 'number' },
  { key: 'status', label: 'Status' },
  { key: 'proximaManutencao', label: 'Próxima Manutenção', type: 'date' },
]

export default function MaquinariosPage() {
  return <CrudPage title="Maquinários" endpoint="/maquinarios" fields={fields} icon={<Cog className="w-8 h-8 text-red-400" />} />
}
