'use client'
import { useEffect, useState } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import Cookies from 'js-cookie'
import SafraSeletor from '@/components/SafraSeletor'
import { Bell, Search, MapPin, Sprout, ChevronDown } from 'lucide-react'
import { usePropriedade } from '@/contexts/PropriedadeContext'

const LOGO_SRC = "..." // ← mantenha aqui o valor base64 original do seu arquivo

const PERIODOS = [
  { value: 'MES_ATUAL',    label: 'Mês Atual'    },
  { value: 'MES_ANTERIOR', label: 'Mês Anterior' },
  { value: 'TRIMESTRE',    label: 'Trimestre'    },
  { value: 'ANO_ATUAL',    label: 'Ano Atual'    },
]

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const router   = useRouter()
  const pathname = usePathname()
  const [user, setUser] = useState<{ nome: string; perfil: string } | null>(null)

  const {
    propriedades, safrasFiltradas,
    propriedadeId, setPropriedadeId,
    safraId, setSafraId,
    periodo, setPeriodo,
  } = usePropriedade()

  const isFinanceiro = pathname.startsWith('/financeiro')

  useEffect(() => {
    const token = Cookies.get('accessToken')
    if (!token) { router.push('/login'); return }
    const u = Cookies.get('user')
    if (u) setUser(JSON.parse(u))
  }, [router])

  return (
    <div className="flex flex-col min-h-screen bg-[#0a0f0a]">

      {/* ── Header ── */}
      <header className="h-24 bg-[#0d160d] border-b border-[#1a251a] flex items-center justify-between px-8 flex-shrink-0 sticky top-0 z-30 w-full">

        {/* Logo */}
        <div className="flex items-center">
          <img
            src={LOGO_SRC}
            alt="AgroFlow"
            style={{ height: '78px', width: 'auto', objectFit: 'contain', display: 'block' }}
          />
        </div>

        {/* Centro: filtros do financeiro OU busca global */}
        <div className="flex items-center gap-3 mx-10 flex-1 max-w-2xl">
          {isFinanceiro ? (
            <>
              {propriedades.length > 0 && (
                <div className="flex items-center gap-1.5 bg-[#1a251a] border border-[#243324] rounded-xl px-3 py-2">
                  <MapPin className="w-3.5 h-3.5 text-green-600 flex-shrink-0" />
                  <select
                    value={propriedadeId}
                    onChange={e => setPropriedadeId(e.target.value)}
                    className="bg-transparent text-sm text-green-300 outline-none cursor-pointer max-w-[150px]"
                  >
                    <option value="">Todas propriedades</option>
                    {propriedades.map(p => (
                      <option key={p.id} value={p.id}>{p.nome}</option>
                    ))}
                  </select>
                  <ChevronDown className="w-3 h-3 text-green-600 flex-shrink-0" />
                </div>
              )}

              {safrasFiltradas.length > 0 && (
                <div className="flex items-center gap-1.5 bg-[#1a251a] border border-[#243324] rounded-xl px-3 py-2">
                  <Sprout className="w-3.5 h-3.5 text-green-600 flex-shrink-0" />
                  <select
                    value={safraId}
                    onChange={e => setSafraId(e.target.value)}
                    className="bg-transparent text-sm text-green-300 outline-none cursor-pointer max-w-[130px]"
                  >
                    <option value="">Todas safras</option>
                    {safrasFiltradas.map(s => (
                      <option key={s.id} value={s.id}>{s.nome}</option>
                    ))}
                  </select>
                  <ChevronDown className="w-3 h-3 text-green-600 flex-shrink-0" />
                </div>
              )}

              <div className="flex items-center gap-1.5 bg-[#1a251a] border border-[#243324] rounded-xl px-3 py-2">
                <select
                  value={periodo}
                  onChange={e => setPeriodo(e.target.value)}
                  className="bg-transparent text-sm text-green-300 outline-none cursor-pointer"
                >
                  {PERIODOS.map(p => (
                    <option key={p.value} value={p.value} className="bg-gray-900">{p.label}</option>
                  ))}
                </select>
                <ChevronDown className="w-3 h-3 text-green-600 flex-shrink-0" />
              </div>
            </>
          ) : (
            <>
              <div className="flex items-center gap-3 bg-[#1a251a] rounded-xl px-4 py-2.5 w-full border border-[#243324]">
                <Search className="w-4 h-4 text-green-600 flex-shrink-0" />
                <input
                  placeholder="Buscar..."
                  className="bg-transparent text-sm text-green-300 placeholder-green-700 outline-none w-full"
                />
              </div>
              <SafraSeletor />
            </>
          )}
        </div>

        {/* Direita: Sino + Usuário */}
        <div className="flex items-center gap-4">
          <button className="relative w-9 h-9 bg-[#1a251a] rounded-lg flex items-center justify-center text-green-600 hover:text-green-400 border border-[#243324]">
            <Bell className="w-4 h-4" />
            <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 bg-green-500 rounded-full" />
          </button>
          {user && (
            <div className="flex items-center gap-3">
              <div className="text-right">
                <div className="text-sm text-green-200 font-medium">{user.nome}</div>
                <div className="text-xs text-green-600 capitalize">{user.perfil}</div>
              </div>
              <div className="w-9 h-9 bg-green-800 rounded-lg flex items-center justify-center text-green-200 font-semibold text-sm">
                {user.nome.charAt(0).toUpperCase()}
              </div>
            </div>
          )}
        </div>
      </header>

      {/* ── Conteúdo ── */}
      <main className="flex-1 p-6 overflow-auto">
        {children}
      </main>

    </div>
  )
}
