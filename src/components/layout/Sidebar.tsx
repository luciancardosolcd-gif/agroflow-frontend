'use client'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import Cookies from 'js-cookie'
import { useEffect, useState } from 'react'
import {
  LayoutDashboard, Users, DollarSign, FileText, Package,
  UserCheck, Truck, ChevronRight, Cog, LogOut, Settings, Shield, Tractor, MapPin, Sprout
} from 'lucide-react'

const navItems = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard, perfis: ['admin', 'gestor', 'operador', 'agronomo', 'visitante', 'produtor'] },
  { href: '/clientes', label: 'Clientes', icon: UserCheck, perfis: ['admin', 'gestor', 'operador', 'agronomo', 'visitante'] },
  { href: '/financeiro', label: 'Financeiro', icon: DollarSign, perfis: ['admin', 'gestor', 'operador'] },
  { href: '/contratos', label: 'Contratos', icon: FileText, perfis: ['admin', 'gestor', 'operador'] },
  { href: '/estoque', label: 'Estoque', icon: Package, perfis: ['admin', 'gestor', 'operador', 'visitante'] },
  { href: '/fornecedores', label: 'Fornecedores', icon: Truck, perfis: ['admin', 'gestor', 'operador'] },
  { href: '/maquinarios', label: 'Maquinários', icon: Cog, perfis: ['admin', 'gestor', 'operador'] },
  { href: '/documentos', label: 'Documentos', icon: Settings, perfis: ['admin', 'gestor', 'operador'] },
  { href: '/produtor', label: 'Painel Produtor', icon: Tractor, perfis: ['admin', 'produtor'], children: [
    { href: '/produtor/propriedades', label: 'Propriedades', icon: MapPin },
    { href: '/produtor/safras', label: 'Safras', icon: Sprout },
  ]},
  { href: '/users', label: 'Usuários', icon: Users, perfis: ['admin'] },
  { href: '/admin', label: 'Admin Panel', icon: Shield, perfis: ['admin'] },
{ href: '/admin/logs', label: 'Log de Acessos', icon: Shield, perfis: ['admin'] },
]

const Logo = () => (
  <svg width="200" height="80" viewBox="0 0 680 240" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <linearGradient id="lg" x1="0%" y1="100%" x2="60%" y2="0%">
        <stop offset="0%" stopColor="#7cc442"/>
        <stop offset="100%" stopColor="#a8d96a"/>
      </linearGradient>
    </defs>
    <g transform="translate(340, 145)">
      <g transform="translate(-14, -65) scale(0.65)">
        <path d="M 0 105 C 2 88 4 72 6 58" stroke="#5a9e2e" strokeWidth="7" fill="none" strokeLinecap="round"/>
        <path d="M 6 58 C -5 45 -38 18 -42 -18 C -46 -52 -18 -82 8 -90 C 34 -82 52 -52 48 -18 C 44 18 18 45 6 58 Z" fill="url(#lg)"/>
        <path d="M 6 55 C 2 25 -6 -15 4 -85" stroke="white" strokeWidth="8" fill="none" strokeLinecap="round"/>
      </g>
      <text x="-242" y="28" fontFamily="Arial Black, sans-serif" fontWeight="900" fontSize="88" fill="#3a6e30" letterSpacing="-2">Agro</text>
      <text x="2" y="28" fontFamily="Arial Black, sans-serif" fontWeight="900" fontSize="88" fill="#1a3260" letterSpacing="-2">Flow</text>
      <text x="0" y="88" fontFamily="Arial, sans-serif" fontWeight="400" fontSize="26" fill="#5a8a5a" textAnchor="middle" letterSpacing="5">Gestão Agrícola</text>
    </g>
  </svg>
)

export default function Sidebar() {
  const pathname = usePathname()
  const router = useRouter()
  const [perfil, setPerfil] = useState('')

  useEffect(() => {
    const u = Cookies.get('user')
    if (u) setPerfil(JSON.parse(u).perfil)
  }, [])

  const handleLogout = () => {
    Cookies.remove('accessToken')
    Cookies.remove('user')
    router.push('/login')
  }

  const itemsFiltrados = navItems.filter(item => item.perfis.includes(perfil))

  return (
    <aside className="w-64 min-h-screen bg-[#0d160d] border-r border-[#1a251a] flex flex-col">
      <div className="px-4 py-4 border-b border-[#1a251a]">
        <Logo />
      </div>

      <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
        {itemsFiltrados.map(({ href, label, icon: Icon, children }) => {
          const active = pathname === href
          const childActive = children?.some(c => pathname.startsWith(c.href))
          return (
            <div key={href}>
              <Link href={href}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-150 group ${
                  active || childActive
                    ? 'bg-green-800/40 text-green-300 border border-green-800/50'
                    : 'text-green-600 hover:bg-[#1a251a] hover:text-green-300'
                }`}>
                <Icon className={`w-4 h-4 flex-shrink-0 ${active || childActive ? 'text-green-400' : 'text-green-700 group-hover:text-green-400'}`} />
                {label}
                {(active || childActive) && <ChevronRight className="w-3 h-3 ml-auto text-green-500" />}
              </Link>
              {children && (active || childActive) && (
                <div className="ml-6 mt-1 space-y-1">
                  {children.map(child => {
                    const childIsActive = pathname === child.href
                    return (
                      <Link key={child.href} href={child.href}
                        className={`flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-medium transition-all ${
                          childIsActive
                            ? 'bg-green-800/30 text-green-300'
                            : 'text-green-700 hover:bg-[#1a251a] hover:text-green-400'
                        }`}>
                        <child.icon className="w-3.5 h-3.5" />
                        {child.label}
                      </Link>
                    )
                  })}
                </div>
              )}
            </div>
          )
        })}
      </nav>

      <div className="p-4 border-t border-[#1a251a]">
        <button onClick={handleLogout}
          className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-red-500 hover:bg-red-900/20 w-full transition-all">
          <LogOut className="w-4 h-4" />
          Sair do sistema
        </button>
      </div>
    </aside>
  )
}
