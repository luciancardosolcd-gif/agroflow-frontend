'use client'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import Cookies from 'js-cookie'
import {
  LayoutDashboard, Users, DollarSign, FileText, Package,
  UserCheck, Truck, Settings, Leaf, LogOut, ChevronRight, Cog
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
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 bg-green-700 rounded-lg flex items-center justify-center flex-shrink-0">
            <Leaf className="w-5 h-5 text-white" />
          </div>
          <div>
            <div className="font-display text-lg text-green-100">AgroFlow</div>
            <div className="text-green-700 text-xs">Gestão Agrícola</div>
          </div>
        </div>
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
