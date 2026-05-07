'use client'
import CrudPage from '@/components/ui/CrudPage'
import { UserCheck } from 'lucide-react'

const fields = [
  { key: 'nome', label: 'Nome', required: true },
  { key: 'email', label: 'E-mail', type: 'email' },
  { key: 'telefone', label: 'Telefone' },
  { key: 'cpfCnpj', label: 'CPF/CNPJ' },
  { key: 'cidade', label: 'Cidade' },
  { key: 'estado', label: 'Estado' },
  { key: 'status', label: 'Status' },
]

export default function ClientesPage() {
  return <CrudPage title="Clientes" endpoint="/clientes" fields={fields} icon={<UserCheck className="w-8 h-8 text-blue-400" />} />
}
