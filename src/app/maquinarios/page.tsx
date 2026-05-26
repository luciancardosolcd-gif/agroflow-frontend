'use client'
import { useEffect, useState } from 'react'
import Cookies from 'js-cookie'
import CrudPage from '@/components/ui/CrudPage'
import SemPermissao from '@/components/ui/SemPermissao'
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
  const [autorizado, setAutorizado] = useState<boolean | null>(null)

  useEffect(() => {
    const u = Cookies.get('user')
    if (u) {
      const parsed = JSON.parse(u)
      if (parsed.perfil === 'admin') { setAutorizado(true); return }
      const perm = parsed.permissoes || {}
      if (perm?.maquinarios?.ver === true) { setAutorizado(true) } else { setAutorizado(false) }
    }
  }, [])

  if (autorizado === null) return null
  if (!autorizado) return <SemPermissao />

  return <CrudPage title="Maquinários" endpoint="/maquinarios" fields={fields} icon={<Cog className="w-8 h-8 text-red-400" />} />
}
