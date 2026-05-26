'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Cookies from 'js-cookie'
import CrudPage from '@/components/ui/CrudPage'
import { FileText } from 'lucide-react'

const fields = [
  { key: 'titulo', label: 'Título', required: true },
  { key: 'descricao', label: 'Descrição' },
  { key: 'tipo', label: 'Tipo' },
  { key: 'status', label: 'Status' },
]

export default function DocumentosPage() {
  const [autorizado, setAutorizado] = useState<boolean | null>(null)
  const router = useRouter()

  useEffect(() => {
    const u = Cookies.get('user')
    if (u) {
      const parsed = JSON.parse(u)
      if (parsed.perfil === 'admin') { setAutorizado(true); return }
      const perm = parsed.permissoes || {}
      if (perm?.documentos?.ver === true) {
        setAutorizado(true)
      } else {
        setAutorizado(false)
        router.replace('/dashboard')
      }
    }
  }, [])

  if (autorizado === null || !autorizado) return null

  return <CrudPage title="Documentos" endpoint="/documentos" fields={fields} icon={<FileText className="w-8 h-8 text-cyan-400" />} />
}
