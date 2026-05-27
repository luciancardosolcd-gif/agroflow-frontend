'use client'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import Cookies from 'js-cookie'
import { useEffect, useState } from 'react'
import {
  LayoutDashboard, Users, DollarSign, FileText, Package,
  UserCheck, Truck, ChevronRight, Cog, LogOut, Settings, Shield, Tractor, MapPin, Sprout, BarChart2
} from 'lucide-react'

const SUPER_ADMINS = ['luciancardoso@agroflow.com', 'admin01@agroflow.com']

const navItems = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard, perfis: ['admin', 'gestor', 'operador', 'agronomo', 'visitante', 'produtor'], modulo: null },
  { href: '/clientes', label: 'Clientes', icon: UserCheck, perfis: ['admin', 'gestor', 'operador', 'agronomo', 'visitante'], modulo: 'clientes' },
  { href: '/financeiro', label: 'Financeiro', icon: DollarSign, perfis: ['admin', 'gestor', 'operador', 'agronomo', 'visitante'], modulo: 'financeiro' },
  { href: '/contratos', label: 'Contratos', icon: FileText, perfis: ['admin', 'gestor', 'operador', 'agronomo', 'visitante'], modulo: 'contratos' },
  { href: '/estoque', label: 'Estoque', icon: Package, perfis: ['admin', 'gestor', 'operador', 'agronomo', 'visitante'], modulo: 'estoque' },
  { href: '/fornecedores', label: 'Fornecedores', icon: Truck, perfis: ['admin', 'gestor', 'operador', 'agronomo', 'visitante'], modulo: 'fornecedores' },
  { href: '/maquinarios', label: 'Maquinários', icon: Cog, perfis: ['admin', 'gestor', 'operador', 'agronomo', 'visitante'], modulo: 'maquinarios' },
  { href: '/documentos', label: 'Documentos', icon: Settings, perfis: ['admin', 'gestor', 'operador', 'agronomo', 'visitante'], modulo: 'documentos' },
  { href: '/produtor', label: 'Painel Produtor', icon: Tractor, perfis: ['admin', 'produtor', 'agronomo', 'visitante'], modulo: 'produtor', children: [
    { href: '/produtor/propriedades', label: 'Propriedades', icon: MapPin },
    { href: '/produtor/safras', label: 'Safras & Custos', icon: Sprout },
  ]},
  { href: '/relatorios', label: 'Relatórios', icon: BarChart2, perfis: ['admin', 'gestor', 'operador', 'agronomo', 'visitante'], modulo: 'relatorios' },
  { href: '/users', label: 'Usuários', icon: Users, perfis: ['admin'], modulo: null },
  { href: '/admin', label: 'Admin Panel', icon: Shield, perfis: ['admin'], modulo: null, superAdminOnly: true },
  { href: '/admin/logs', label: 'Log de Acessos', icon: Shield, perfis: ['admin'], modulo: null, superAdminOnly: true },
]

const Logo = () => (
  <svg width="180" height="72" viewBox="0 0 680 240" xmlns="http://www.w3.org/2000/svg">
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
  const [nome, setNome] = useState('')
  const [email, setEmail] = useState('')
  const [permissoes, setPermissoes] = useState<Record<string, any>>({})

  useEffect(() => {
    const u = Cookies.get('user')
    if (u) {
      const parsed = JSON.parse(u)
      setPerfil(parsed.perfil)
      setEmail(parsed.email)
      setNome(parsed.nome?.split(' ')[0] || '')
      setPermissoes(parsed.permissoes || {})

      const token = Cookies.get('accessToken')
      if (parsed.id && token) {
        fetch(`${process.env.NEXT_PUBLIC_API_URL}/users/${parsed.id}`, {
          headers: { Authorization: `Bearer ${token}` }
        })
          .then(r => r.json())
          .then(data => {
            if (data.permissoes) {
              setPermissoes(data.permissoes)
              Cookies.set('user', JSON.stringify({ ...parsed, permissoes: data.permissoes }))
            }
          })
          .catch(() => {})
      }
    }
  }, [])

  const handleLogout = () => {
    Cookies.remove('accessToken')
    Cookies.remove('user')
    router.push('/login')
  }

  const isSuperAdmin = SUPER_ADMINS.includes(email)

  const itemsFiltrados = navItems.filter(item => {
    if (!item.perfis.includes(perfil)) return false
    if ((item as any).superAdminOnly && !isSuperAdmin) return false
    if (item.modulo && Object.keys(permissoes).length > 0) {
      return permissoes[item.modulo]?.ver === true
    }
    return true
  })

  return (
    <aside className="w-56 min-h-screen bg-[#090f09] border-r border-[#141e14] flex flex-col">
      {/* Logo */}
      <div className="px-3 py-3 border-b border-[#141e14]">
        <Logo />
      </div>

      {/* User info */}
      <div className="px-3 py-2.5 border-b border-[#141e14]">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-full bg-green-800/50 flex items-center justify-center flex-shrink-0">
            <span className="text-xs font-semibold text-green-300">{nome?.[0]?.toUpperCase() || 'U'}</span>
          </div>
          <div className="min-w-0">
            <p className="text-xs font-medium text-gray-200 truncate">{nome || 'Usuário'}</p>
            <p className="text-[10px] text-gray-500 capitalize">{perfil}</p>
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-2 py-2 space-y-0.5 overflow-y-auto">
        {itemsFiltrados.map(({ href, label, icon: Icon, children }) => {
          const active = pathname === href
          const childActive = children?.some(c => pathname.startsWith(c.href))
          return (
            <div key={href}>
              <Link href={href}
                className={`flex items-center gap-2.5 px-2.5 py-2 rounded-md text-xs font-medium transition-all duration-150 group ${
                  active || childActive
                    ? 'bg-green-900/30 text-green-300 border-l-2 border-green-500'
                    : 'text-gray-400 hover:bg-[#141e14] hover:text-gray-200'
                }`}>
                <Icon className={`w-3.5 h-3.5 flex-shrink-0 ${active || childActive ? 'text-green-400' : 'text-gray-500 group-hover:text-gray-300'}`} />
                <span className="truncate">{label}</span>
                {(active || childActive) && children && <ChevronRight className="w-3 h-3 ml-auto text-green-600" />}
              </Link>
              {children && (active || childActive) && (
                <div className="ml-4 mt-0.5 space-y-0.5 border-l border-[#1e2e1e] pl-2">
                  {children.map(child => {
                    const childIsActive = pathname === child.href
                    return (
                      <Link key={child.href} href={child.href}
                        className={`flex items-center gap-2 px-2 py-1.5 rounded-md text-xs transition-all ${
                          childIsActive
                            ? 'text-green-300 bg-green-900/20'
                            : 'text-gray-500 hover:text-gray-300 hover:bg-[#141e14]'
                        }`}>
                        <child.icon className="w-3 h-3 flex-shrink-0" />
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

      {/* Logout */}
      <div className="px-2 py-2 border-t border-[#141e14]">
        <button onClick={handleLogout}
          className="flex items-center gap-2.5 px-2.5 py-2 rounded-md text-xs font-medium text-gray-500 hover:text-red-400 hover:bg-red-900/10 w-full transition-all">
          <LogOut className="w-3.5 h-3.5" />
          Sair do sistema
        </button>
      </div>
    </aside>
  )
}
