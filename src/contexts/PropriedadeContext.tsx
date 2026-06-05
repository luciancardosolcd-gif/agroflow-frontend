'use client'
import { createContext, useContext, useState, useEffect, ReactNode } from 'react'
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
  const [propriedades,    setPropriedades]    = useState<Propriedade[]>([])
  const [safras,          setSafras]          = useState<Safra[]>([])
  const [safrasFiltradas, setSafrasFiltradas] = useState<Safra[]>([])
  const [propriedadeId,   setPropriedadeIdRaw] = useState('')
  const [safraId,         setSafraId]          = useState('')

  // Carrega listas uma vez
  useEffect(() => {
    api.get('/propriedades').then(r => setPropriedades(r.data)).catch(() => {})
    api.get('/safras').then(r => setSafras(r.data)).catch(() => {})
  }, [])

  // Filtra safras quando propriedade muda
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
