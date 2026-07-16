'use client'
import { useEffect, useState } from 'react'
import Cookies from 'js-cookie'
import CrudPage from '@/components/ui/CrudPage'
import SemPermissao from '@/components/ui/SemPermissao'

const fields = [
  { key: 'nome',     label: 'Nome',     required: true },
  { key: 'email',    label: 'E-mail',   type: 'email' },
  { key: 'telefone', label: 'Telefone' },
  { key: 'cpfCnpj',  label: 'CPF/CNPJ' },
  { key: 'cidade',   label: 'Cidade' },
  { key: 'estado',   label: 'Estado' },
  { key: 'status',   label: 'Status' },
]

export default function ClientesPage() {
  const [autorizado, setAutorizado] = useState<boolean | null>(null)

  useEffect(() => {
    const u = Cookies.get('user')
    if (u) {
      const parsed = JSON.parse(u)
      if (parsed.perfil === 'admin') { setAutorizado(true); return }
      const perm = parsed.permissoes || {}
      setAutorizado(perm?.clientes?.ver === true)
    }
  }, [])

  if (autorizado === null) return null
  if (!autorizado) return <SemPermissao />

  return <CrudPage title="Clientes" endpoint="/clientes" fields={fields} />
}
  return (
    <div className="space-y-4">
      <div className="flex border-b border-[#1a251a]">
        {([
          { key: 'clientes', label: 'Clientes',      icon: UserCheck },
          { key: 'mapas',    label: 'Mapas & Áreas', icon: Map       },
        ] as { key: Tab; label: string; icon: any }[]).map(t => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={`flex items-center gap-2 px-5 py-2.5 text-sm font-medium border-b-2 transition-all duration-200 -mb-px ${
              tab === t.key
                ? 'text-white border-green-500'
                : 'text-gray-500 border-transparent hover:text-gray-300 hover:border-gray-700'
            }`}
          >
            <t.icon className="w-4 h-4" />
            {t.label}
          </button>
        ))}
      </div>

      {tab === 'clientes' && <CrudPage title="Clientes" endpoint="/clientes" fields={fields} />}
      {tab === 'mapas'    && <MapasPage />}
    </div>
  )
}
