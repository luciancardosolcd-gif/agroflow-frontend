'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Cookies from 'js-cookie'
import Sidebar from '@/components/layout/Sidebar'
import { Bell, Search } from 'lucide-react'

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const [user, setUser] = useState<{ nome: string; perfil: string } | null>(null)

  useEffect(() => {
    const token = Cookies.get('accessToken')
    if (!token) { router.push('/login'); return }
    const u = Cookies.get('user')
    if (u) setUser(JSON.parse(u))
  }, [router])

  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0">
        <header className="h-16 bg-[#0d160d] border-b border-[#1a251a] flex items-center justify-between px-6 flex-shrink-0">
          <div className="flex items-center gap-3 bg-[#1a251a] rounded-lg px-4 py-2 w-72">
            <Search className="w-4 h-4 text-green-600" />
            <input placeholder="Buscar..." className="bg-transparent text-sm text-green-300 placeholder-green-700 outline-none w-full" />
          </div>
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
        <main className="flex-1 p-6 overflow-auto">
          {children}
        </main>
      </div>
    </div>
  )
}
