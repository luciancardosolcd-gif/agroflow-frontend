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

// ─── LOGO SVG INLINE ─────────────────────────────────────────────────────────
// Paths extraídos diretamente da fonte Poppins Bold via fontTools.
// Zero dependência de fonte externa — idêntico em qualquer aparelho.
const Logo = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 464 208"
    width="172"
    height="68"
    role="img"
    aria-label="AgroFlow – Gestão Agrícola"
    style={{ display: 'block' }}
  >
    <defs>
      {/* Agro: verde limão topo → verde vivo → verde escuro base */}
      <linearGradient id="sb-ag" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%"   stopColor="#90e820"/>
        <stop offset="28%"  stopColor="#34c018"/>
        <stop offset="62%"  stopColor="#169010"/>
        <stop offset="100%" stopColor="#085008"/>
      </linearGradient>

      {/* Flow: azul médio topo → navy escuro base */}
      <linearGradient id="sb-fl" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%"   stopColor="#1e48c8"/>
        <stop offset="38%"  stopColor="#0e1e90"/>
        <stop offset="72%"  stopColor="#071268"/>
        <stop offset="100%" stopColor="#040a40"/>
      </linearGradient>

      {/* Folha: escuro esquerda → verde vivo → amarelo-verde brilhante → escuro direita */}
      <linearGradient id="sb-lf" x1="0" y1="0" x2="1" y2="0">
        <stop offset="0%"   stopColor="#1a6e0e"/>
        <stop offset="28%"  stopColor="#2ec018"/>
        <stop offset="46%"  stopColor="#56e022"/>
        <stop offset="55%"  stopColor="#b0ff28"/>
        <stop offset="65%"  stopColor="#6cd820"/>
        <stop offset="82%"  stopColor="#38b018"/>
        <stop offset="100%" stopColor="#1e7010"/>
      </linearGradient>

      {/* Folha sombreamento vertical */}
      <linearGradient id="sb-lfv" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%"   stopColor="rgba(190,255,90,0.18)"/>
        <stop offset="22%"  stopColor="rgba(255,255,255,0)"/>
        <stop offset="78%"  stopColor="rgba(0,30,0,0.08)"/>
        <stop offset="100%" stopColor="rgba(0,40,0,0.25)"/>
      </linearGradient>

      {/* Sombra folha */}
      <filter id="sb-ls" x="-40%" y="-40%" width="180%" height="180%">
        <feDropShadow dx="0" dy="2" stdDeviation="3" floodColor="#063008" floodOpacity="0.22"/>
      </filter>

      {/* Brilho nervura */}
      <filter id="sb-vg" x="-100%" y="-30%" width="300%" height="160%">
        <feGaussianBlur stdDeviation="1.2" result="b"/>
        <feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge>
      </filter>
    </defs>

    {/* ── FOLHA (cx≈224, entre o "o" e o "F") ── */}
    <g filter="url(#sb-ls)" transform="translate(224.1, 2)">
      <path fill="url(#sb-lf)"
        d="M 1,-1 C -5,0 -20,12 -21,38 C -22,62 -12,84 -4,92
           C -1,95 1,96 1,96 C 1,96 3,95 6,92
           C 14,84 24,62 23,38 C 22,12 7,0 1,-1 Z"/>
      <path fill="url(#sb-lfv)"
        d="M 1,-1 C -5,0 -20,12 -21,38 C -22,62 -12,84 -4,92
           C -1,95 1,96 1,96 C 1,96 3,95 6,92
           C 14,84 24,62 23,38 C 22,12 7,0 1,-1 Z"/>
      {/* Nervura central */}
      <path d="M 1,1 Q 0,48 1,94"
        stroke="rgba(255,255,255,0.96)" strokeWidth="3.2"
        strokeLinecap="round" fill="none" filter="url(#sb-vg)"/>
      {/* Nervuras esquerda */}
      <path d="M 0,22 Q -9,30 -16,33"   stroke="rgba(255,255,255,0.55)" strokeWidth="1.1" strokeLinecap="round" fill="none"/>
      <path d="M -1,38 Q -11,46 -18,49"  stroke="rgba(255,255,255,0.48)" strokeWidth="1.0" strokeLinecap="round" fill="none"/>
      <path d="M -1,54 Q -10,62 -16,66"  stroke="rgba(255,255,255,0.40)" strokeWidth="0.9" strokeLinecap="round" fill="none"/>
      <path d="M -1,70 Q -9,77 -14,80"   stroke="rgba(255,255,255,0.30)" strokeWidth="0.8" strokeLinecap="round" fill="none"/>
      {/* Nervuras direita */}
      <path d="M 2,26 Q 10,32 17,35"    stroke="rgba(255,255,255,0.32)" strokeWidth="0.9" strokeLinecap="round" fill="none"/>
      <path d="M 2,44 Q 11,50 17,53"    stroke="rgba(255,255,255,0.26)" strokeWidth="0.8" strokeLinecap="round" fill="none"/>
      <path d="M 2,62 Q 10,68 16,71"    stroke="rgba(255,255,255,0.20)" strokeWidth="0.7" strokeLinecap="round" fill="none"/>
      {/* Caule */}
      <path d="M 1,94 Q 0,108 -1,118"
        stroke="#1c7010" strokeWidth="2.8" strokeLinecap="round" fill="none"/>
    </g>

    {/* ── "Agro" — paths Poppins Bold ── */}
    <path fill="url(#sb-ag)" d="M67.908 143.592H43.804L39.94 155.0H23.472L46.84 90.416H65.056L88.42399999999999 155.0H71.77199999999999ZM63.86 131.448 55.856 107.804 47.944 131.448Z"/>
    <path fill="url(#sb-ag)" d="M129.336 110.932V103.664H145.06799999999998V154.908Q145.06799999999998 161.992 142.262 167.742Q139.45600000000002 173.492 133.70600000000002 176.89600000000002Q127.956 180.3 119.4 180.3Q107.992 180.3 100.908 174.918Q93.824 169.536 92.812 160.336H108.36Q109.096 163.28 111.856 164.982Q114.616 166.684 118.664 166.684Q123.53999999999999 166.684 126.438 163.878Q129.336 161.072 129.336 154.908V147.64Q127.036 151.228 122.988 153.482Q118.94 155.736 113.512 155.736Q107.164 155.736 102.012 152.47Q96.86 149.204 93.87 143.178Q90.88 137.152 90.88 129.24Q90.88 121.328 93.87 115.348Q96.86 109.368 102.012 106.148Q107.164 102.928 113.512 102.928Q118.94 102.928 123.03399999999999 105.136Q127.128 107.344 129.336 110.932ZM118.112 116.636Q113.42 116.636 110.154 119.994Q106.888 123.352 106.888 129.24Q106.888 135.128 110.154 138.57799999999997Q113.42 142.028 118.112 142.028Q122.804 142.028 126.07000000000001 138.624Q129.336 135.22 129.336 129.332Q129.336 123.444 126.07000000000001 120.03999999999999Q122.804 116.636 118.112 116.636Z"/>
    <path fill="url(#sb-ag)" d="M186.808 103.112V119.76400000000001H182.48399999999998Q176.596 119.76400000000001 173.652 122.29400000000001Q170.708 124.824 170.708 131.172V155.0H154.976V103.664H170.708V112.22Q173.468 107.988 177.608 105.55Q181.748 103.112 186.808 103.112Z"/>
    <path fill="url(#sb-ag)" d="M189.724 129.332Q189.724 121.42 193.22 115.394Q196.716 109.368 202.788 106.148Q208.85999999999999 102.928 216.404 102.928Q223.94799999999998 102.928 230.01999999999998 106.148Q236.09199999999998 109.368 239.588 115.394Q243.084 121.42 243.084 129.332Q243.084 137.244 239.542 143.26999999999998Q236.0 149.296 229.882 152.516Q223.764 155.736 216.22 155.736Q208.676 155.736 202.64999999999998 152.516Q196.624 149.296 193.17399999999998 143.316Q189.724 137.336 189.724 129.332ZM227.076 129.332Q227.076 123.168 223.994 119.85600000000001Q220.912 116.54400000000001 216.404 116.54400000000001Q211.804 116.54400000000001 208.768 119.81Q205.732 123.076 205.732 129.332Q205.732 135.496 208.72199999999998 138.808Q211.712 142.12 216.22 142.12Q220.728 142.12 223.902 138.808Q227.076 135.496 227.076 129.332Z"/>

    {/* ── "Flow" — paths Poppins Bold ── */}
    <path fill="url(#sb-fl)" d="M296.0 90.416V103.02000000000001H269.688V116.636H289.37600000000003V128.872H269.688V155.0H253.95600000000002V90.416Z"/>
    <path fill="url(#sb-fl)" d="M318.512 86.92V155.0H302.78000000000003V86.92Z"/>
    <path fill="url(#sb-fl)" d="M325.29200000000003 129.332Q325.29200000000003 121.42 328.788 115.394Q332.284 109.368 338.356 106.148Q344.428 102.928 351.972 102.928Q359.516 102.928 365.588 106.148Q371.66 109.368 375.156 115.394Q378.652 121.42 378.652 129.332Q378.652 137.244 375.11 143.26999999999998Q371.568 149.296 365.45 152.516Q359.332 155.736 351.788 155.736Q344.244 155.736 338.218 152.516Q332.192 149.296 328.742 143.316Q325.29200000000003 137.336 325.29200000000003 129.332ZM362.644 129.332Q362.644 123.168 359.562 119.85600000000001Q356.48 116.54400000000001 351.972 116.54400000000001Q347.372 116.54400000000001 344.336 119.81Q341.3 123.076 341.3 129.332Q341.3 135.496 344.29 138.808Q347.28000000000003 142.12 351.788 142.12Q356.296 142.12 359.47 138.808Q362.644 135.496 362.644 129.332Z"/>
    <path fill="url(#sb-fl)" d="M459.216 103.664 445.324 155.0H427.936L419.84 121.696L411.468 155.0H394.17199999999997L380.188 103.664H395.92L403.188 140.372L411.836 103.664H428.488L437.228 140.188L444.404 103.664Z"/>

    {/* ── "Gestão Agrícola" — paths Poppins Regular ── */}
    <path fill="#1c6e18" d="M158.46 180.12Q157.764 178.656 156.44400000000002 177.852Q155.124 177.048 153.37199999999999 177.048Q151.62 177.048 150.216 177.852Q148.812 178.656 148.008 180.156Q147.204 181.656 147.204 183.624Q147.204 185.592 148.008 187.08Q148.812 188.568 150.216 189.36Q151.62 190.152 153.37199999999999 190.152Q155.76 190.152 157.248 188.856Q158.736 187.56 158.976 185.352H152.34V182.784H162.192V185.136Q161.952 187.38 160.74 189.192Q159.528 191.004 157.548 192.036Q155.568 193.068 153.37199999999999 193.068Q150.9 193.068 148.884 191.988Q146.868 190.908 145.716 188.952Q144.564 186.996 144.564 184.5Q144.564 182.004 145.716 180.048Q146.868 178.092 148.884 177.024Q150.9 175.956 153.37199999999999 175.956Q156.24 175.956 158.364 177.3Q160.488 178.644 161.376 181.008ZM170.17 176.172V193.0H167.578V176.172ZM183.178 176.172V178.692H176.194V183.3H182.218V185.748H176.194V193.0H173.602V176.172ZM193.882 176.172V178.692H186.898V183.3H192.922V185.748H186.898V193.0H184.306V176.172ZM199.282 176.172V193.0H196.69V176.172ZM213.186 175.956Q215.634 175.956 217.614 177.024Q219.594 178.092 220.734 180.036Q221.874 181.98 221.874 184.5Q221.874 187.02 220.734 188.964Q219.594 190.908 217.614 191.976Q215.634 193.044 213.186 193.044Q210.738 193.044 208.758 191.976Q206.778 190.908 205.638 188.964Q204.498 187.02 204.498 184.5Q204.498 181.98 205.638 180.036Q206.778 178.092 208.758 177.024Q210.738 175.956 213.186 175.956ZM213.186 178.62Q211.458 178.62 210.09 179.424Q208.722 180.228 207.966 181.68Q207.21 183.132 207.21 184.5Q207.21 185.868 207.966 187.308Q208.722 188.748 210.09 189.564Q211.458 190.38 213.186 190.38Q214.914 190.38 216.27 189.564Q217.626 188.748 218.37 187.308Q219.114 185.868 219.114 184.5Q219.114 183.132 218.37 181.68Q217.626 180.228 216.27 179.424Q214.914 178.62 213.186 178.62ZM226.13 176.172L231.554 189.564L236.978 176.172H239.858V193.0H237.338V186.072L237.578 179.568L232.01 193.0H231.05L225.494 179.58L225.734 186.072V193.0H223.214V176.172ZM244.41 176.172V193.0H241.818V176.172Z"/>
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
