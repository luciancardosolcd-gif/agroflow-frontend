'use client'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import Cookies from 'js-cookie'
import {
  LayoutDashboard, Users, DollarSign, FileText, Package,
  UserCheck, Truck, ChevronRight, Cog, LogOut, Settings
} from 'lucide-react'

const navItems = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/clientes', label: 'Clientes', icon: UserCheck },
  { href: '/financeiro', label: 'Financeiro', icon: DollarSign },
  { href: '/contratos', label: 'Contratos', icon: FileText },
  { href: '/estoque', label: 'Estoque', icon: Package },
  { href: '/fornecedores', label: 'Fornecedores', icon: Truck },
  { href: '/maquinarios', label: 'Maquinários', icon: Cog },
  { href: '/documentos', label: 'Documentos', icon: Settings },
  { href: '/users', label: 'Usuários', icon: Users },
]

export default function Sidebar() {
  const pathname = usePathname()
  const router = useRouter()

  const handleLogout = () => {
    Cookies.remove('accessToken')
    Cookies.remove('user')
    router.push('/login')
  }

  return (
    <aside className="w-64 min-h-screen bg-[#0d160d] border-r border-[#1a251a] flex flex-col">
      <div className="p-6 border-b border-[#1a251a]">
        <svg width="160" height="52" viewBox="0 0 600 200" xmlns="http://www.w3.org/2000/svg">
          <g transform="translate(300, 100)">
            <line x1="-18" y1="30" x2="-8" y2="-10" stroke="#3a7d3a" strokeWidth="2.5" strokeLinecap="round"/>
            <g transform="translate(-12, -42) rotate(-25)">
              <path d="M0,0 C8,-18 26,-22 28,-10 C30,2 18,18 0,20 C-8,12 -6,-2 0,0 Z" fill="#3a7d3a"/>
              <line x1="0" y1="0" x2="14" y2="10" stroke="#2d6b2d" strokeWidth="1" strokeLinecap="round"/>
              <line x1="4" y1="-6" x2="18" y2="2" stroke="#2d6b2d" strokeWidth="0.8" strokeLinecap="round"/>
              <line x1="8" y1="-12" x2="22" y2="-4" stroke="#2d6b2d" strokeWidth="0.8" strokeLinecap="round"/>
              <line x1="2" y1="4" x2="10" y2="16" stroke="#2d6b2d" strokeWidth="0.8" strokeLinecap="round"/>
            </g>
            <text x="-170" y="22" fontFamily="Arial Black, Arial, sans-serif" fontWeight="900" fontSize="72" fill="#3a7d3a" letterSpacing="-1">Agro</text>
            <text x="24" y="22" fontFamily="Arial Black, Arial, sans-serif" fontWeight="900" fontSize="72" fill="#1e3a5f" letterSpacing="-1">Flow</text>
            <text x="0" y="58" fontFamily="Arial, sans-serif" fontWeight="400" fontSize="18" fill="#5a8a5a" textAnchor="middle" letterSpacing="3">Gestão Agrícola</text>
          </g>
        </svg>
      </div>

      <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
        {navItems.map(({ href, label, icon: Icon }) => {
          const active = pathname === href
          return (
            <Link key={href} href={href}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-150 group ${
                active
                  ? 'bg-green-800/40 text-green-300 border border-green-800/50'
                  : 'text-green-600 hover:bg-[#1a251a] hover:text-green-300'
              }`}>
              <Icon className={`w-4 h-4 flex-shrink-0 ${active ? 'text-green-400' : 'text-green-700 group-hover:text-green-400'}`} />
              {label}
              {active && <ChevronRight className="w-3 h-3 ml-auto text-green-500" />}
            </Link>
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
