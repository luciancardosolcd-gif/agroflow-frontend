'use client'
import { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { usePathname } from 'next/navigation'
import Cookies from 'js-cookie'
import api from '@/lib/api'

interface Propriedade { id: string; nome: string }
interface Safra       { id: string; nome: string; propriedadeId?: string }

interface PropriedadeContextType {
  propriedades:    Propriedade[]
  safras:          Safra[]
  safrasFiltradas: Safra[]
  propriedadeId:   string
  safraId:         string
  setPropriedadeId: (id: string) => void
  setSafraId:       (id: string) => void
}

const PropriedadeContext = createContext<PropriedadeContextType>({
  propriedades:    [],
  safras:          [],
  safrasFiltradas: [],
  propriedadeId:   '',
  safraId:         '',
  setPropriedadeId: () => {},
  setSafraId:       () => {},
})

export function PropriedadeProvider({ children }: { children: ReactNode }) {
  const pathname = usePathname()
  const [propriedades,    setPropriedades]     = useState<Propriedade[]>([])
  const [safras,          setSafras]           = useState<Safra[]>([])
  const [safrasFiltradas, setSafrasFiltradas]  = useState<Safra[]>([])
  const [propriedadeId,   setPropriedadeIdRaw] = useState('')
  const [safraId,         setSafraId]          = useState('')

  // ── Recarrega sempre que a rota muda (ex: após login) ──
  useEffect(() => {
    const token = Cookies.get('accessToken')
    if (!token) return

    // Só busca se ainda não tiver carregado
    if (propriedades.length === 0) {
      api.get('/propriedades').then(r => setPropriedades(r.data)).catch(() => {})
    }
    if (safras.length === 0) {
      api.get('/safras').then(r => setSafras(r.data)).catch(() => {})
    }
  }, [pathname]) // ← roda toda vez que navega para uma nova página

  const setPropriedadeId = (id: string) => {
    setPropriedadeIdRaw(id)
    setSafraId('')
  }

  useEffect(() => {
    if (propriedadeId) {
      setSafrasFiltradas(safras.filter(s => s.propriedadeId === propriedadeId))
    } else {
      setSafrasFiltradas(safras)
    }
  }, [propriedadeId, safras])

  return (
    <PropriedadeContext.Provider value={{
      propriedades, safras, safrasFiltradas,
      propriedadeId, safraId,
      setPropriedadeId, setSafraId,
    }}>
      {children}
    </PropriedadeContext.Provider>
  )
}

export const usePropriedade = () => useContext(PropriedadeContext)
