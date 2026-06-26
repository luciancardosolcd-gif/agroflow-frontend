'use client'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import Cookies from 'js-cookie'
import { MapPin, Sprout, Tractor, ChevronLeft, Leaf, Map } from 'lucide-react'

export default function ProdutorLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const router   = useRouter()
  const [nome, setNome] = useState('')

  useEffect(() => {
    const u = Cookies.get('user')
    if (u) {
      const parsed = JSON.parse(u)
      setNome(parsed.nome?.split(' ')[0] || '')
    }
  }, [])

  const subItems = [
    { href: '/produtor',                        label: 'Painel Produtor',     icon: Tractor, exact: true },
    { href: '/produtor/propriedades',           label: 'Propriedades',        icon: MapPin,  exact: false },
    { href: '/produtor/safras',                 label: 'Safras & Custos',     icon: Sprout,  exact: false },
    { href: '/produtor/cotacoes-insumos',       label: 'Cotações de Insumos', icon: Leaf,    exact: false },
    { href: '/produtor/mapas', label: 'Mapas & Talhões', icon: Map, exact: false },
  ]

  return (
    <div className="flex flex-1 min-h-0">

      {/* ── Mini sidebar Produtor ── */}
      <aside className="w-52 min-h-full bg-[#090f09] border-r border-[#141e14] flex flex-col flex-shrink-0">

        {/* Voltar */}
        <div className="px-3 py-3 border-b border-[#141e14]">
          <button
            onClick={() => router.push('/dashboard')}
            className="flex items-center gap-2 text-xs text-gray-500 hover:text-green-400 transition-colors"
          >
            <ChevronLeft className="w-3.5 h-3.5" />
            Voltar ao Início
          </button>
        </div>

        {/* Info usuário */}
        {nome && (
          <div className="px-3 py-2.5 border-b border-[#141e14]">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-full bg-green-800/50 flex items-center justify-center flex-shrink-0">
                <span className="text-xs font-semibold text-green-300">{nome[0]?.toUpperCase()}</span>
              </div>
              <p className="text-xs font-medium text-gray-200 truncate">{nome}</p>
            </div>
          </div>
        )}

        {/* Nav items */}
        <nav className="flex-1 px-2 py-2 space-y-0.5">
          {subItems.map(({ href, label, icon: Icon, exact }) => {
            const active = exact ? pathname === href : pathname.startsWith(href)
            return (
              <Link
                key={href}
                href={href}
                className={`flex items-center gap-2.5 px-2.5 py-2 rounded-md text-xs font-medium transition-all duration-150 group ${
                  active
                    ? 'bg-green-900/30 text-green-300 border-l-2 border-green-500'
                    : 'text-gray-400 hover:bg-[#141e14] hover:text-gray-200'
                }`}
              >
                <Icon className={`w-3.5 h-3.5 flex-shrink-0 ${active ? 'text-green-400' : 'text-gray-500 group-hover:text-gray-300'}`} />
                <span className="truncate">{label}</span>
              </Link>
            )
          })}
        </nav>
      </aside>

      {/* ── Conteúdo do Produtor ── */}
      <div className="flex-1 p-6 overflow-auto">
        {children}
      </div>

    </div>
  )
}
