'use client'
import CrudPage from '@/components/ui/CrudPage'
import { Users } from 'lucide-react'

const fields = [
  { key: 'nome', label: 'Nome', required: true },
  { key: 'email', label: 'E-mail', type: 'email', required: true },
  { key: 'perfil', label: 'Perfil (admin/operador/gestor)' },
  { key: 'status', label: 'Status' },
]

export default function UsersPage() {
  return <CrudPage title="Usuários" endpoint="/users" fields={fields} icon={<Users className="w-8 h-8 text-pink-400" />} />
}
