'use client'
import { createContext, useContext, useState, ReactNode } from 'react'

interface SafraContextType {
  propriedadeId: string
  safraId: string
  setPropriedadeId: (id: string) => void
  setSafraId: (id: string) => void
}

const SafraContext = createContext<SafraContextType>({
  propriedadeId: '',
  safraId: '',
  setPropriedadeId: () => {},
  setSafraId: () => {},
})

export function SafraProvider({ children }: { children: ReactNode }) {
  const [propriedadeId, setPropriedadeId] = useState('')
  const [safraId, setSafraId] = useState('')
  return (
    <SafraContext.Provider value={{ propriedadeId, safraId, setPropriedadeId, setSafraId }}>
      {children}
    </SafraContext.Provider>
  )
}

export function useSafraContext() {
  return useContext(SafraContext)
}
