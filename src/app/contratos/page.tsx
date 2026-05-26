'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Cookies from 'js-cookie'
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
  const [autorizado, setAutorizado] = useState<boolean | null>(null)
  const router = useRouter()

  useEffect(() => {
    const u = Cookies.get('user')
    if (u) {
      const parsed = JSON.parse(u)
      if (parsed.perfil === 'admin') { setAutorizado(true); return }
      const perm = parsed.permissoes || {}
      if (perm?.contratos?.ver === true) {
        setAutorizado(true)
      } else {
        setAutorizado(false)
        router.replace('/dashboard')
      }
    }
  }, [])

  if (autorizado === null || !autorizado) return null

  return <CrudPage title="Contratos" endpoint="/contratos" fields={fields} icon={<FileText className="w-8 h-8 text-yellow-400" />} />
}
