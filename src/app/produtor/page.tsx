'use client'
import { useEffect, useState } from 'react'
import Cookies from 'js-cookie'
import { Tractor } from 'lucide-react'
import SemPermissao from '@/components/ui/SemPermissao'

export default function PainelProdutorPage() {
  const [autorizado, setAutorizado] = useState<boolean | null>(null)

  useEffect(() => {
    const u = Cookies.get('user')
    if (u) {
      const parsed = JSON.parse(u)
      if (parsed.perfil === 'admin') { setAutorizado(true); return }
      const perm = parsed.permissoes || {}
      if (perm?.produtor?.ver === true) { setAutorizado(true) } else { setAutorizado(false) }
    }
  }, [])

  if (autorizado === null) return null
  if (!autorizado) return <SemPermissao />

  return (
    <div className="space-y-6">

      {/* ── Header ── */}
      <div>
        <h1 className="font-display text-3xl text-green-100 flex items-center gap-3">
          <Tractor className="w-8 h-8 text-yellow-400" />
          Painel do Produtor
        </h1>
        <p className="text-green-600 mt-1">Visão consolidada da produção agrícola</p>
      </div>

      {/* ── Espaço livre para futuras funcionalidades ── */}
      <div className="rounded-2xl border border-white/8 bg-white/[0.02] p-10 flex flex-col items-center justify-center gap-3 min-h-[300px]">
        <Tractor className="w-12 h-12 text-yellow-400/40" />
        <p className="text-gray-500 text-sm font-medium">Novas funcionalidades em breve</p>
        <p className="text-gray-600 text-xs text-center max-w-xs">
          Este painel está disponível para você adicionar módulos agrícolas personalizados
        </p>
      </div>

    </div>
  )
}
