'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Cookies from 'js-cookie'
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
  const [autorizado, setAutorizado] = useState<boolean | null>(null)
  const router = useRouter()

  useEffect(() => {
    const u = Cookies.get('user')
    if (u) {
      const parsed = JSON.parse(u)
      if (parsed.perfil === 'admin') { setAutorizado(true); return }
      const perm = parsed.permissoes || {}
      if (perm?.fornecedores?.ver === true) {
        setAutorizado(true)
      } else {
        setAutorizado(false)
        router.replace('/dashboard')
      }
    }
  }, [])

  if (autorizado === null || !autorizado) return null

  return <CrudPage title="Fornecedores" endpoint="/fornecedores" fields={fields} icon={<Truck className="w-8 h-8 text-purple-400" />} />
}
