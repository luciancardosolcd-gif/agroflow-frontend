'use client'
import CrudPage from '@/components/ui/CrudPage'
import { Truck } from 'lucide-react'

const fields = [
  { key: 'nome', label: 'Nome', required: true },
  { key: 'email', label: 'E-mail', type: 'email' },
  { key: 'telefone', label: 'Telefone' },
  { key: 'cpfCnpj', label: 'CPF/CNPJ' },
  { key: 'categoria', label: 'Categoria' },
  { key: 'status', label: 'Status' },
]

export default function FornecedoresPage() {
  return <CrudPage title="Fornecedores" endpoint="/fornecedores" fields={fields} icon={<Truck className="w-8 h-8 text-purple-400" />} />
}
