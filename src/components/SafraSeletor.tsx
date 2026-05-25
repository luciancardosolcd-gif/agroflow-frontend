'use client'
import { useState, useEffect } from 'react'
import { ChevronDown, MapPin, Sprout } from 'lucide-react'
import api from '@/lib/api'
import { useSafraContext } from '@/lib/SafraContext'

interface Propriedade {
  id: string
  nome: string
}

interface Safra {
  id: string
  nome: string
  propriedadeId?: string
}

export default function SafraSeletor() {
  const { setPropriedadeId, setSafraId } = useSafraContext()
  const [propriedades, setPropriedades] = useState<Propriedade[]>([])
  const [safras, setSafras] = useState<Safra[]>([])
  const [safrasFiltradas, setSafrasFiltradas] = useState<Safra[]>([])
  const [propriedadeSelecionada, setPropriedadeSelecionada] = useState('')
  const [safraSelecionada, setSafraSelecionada] = useState('')

  useEffect(() => {
    api.get('/propriedades').then(r => setPropriedades(r.data)).catch(() => {})
    api.get('/safras').then(r => setSafras(r.data)).catch(() => {})
  }, [])

  useEffect(() => {
    if (propriedadeSelecionada) {
      setSafrasFiltradas(safras.filter(s => s.propriedadeId === propriedadeSelecionada))
    } else {
      setSafrasFiltradas(safras)
    }
    setSafraSelecionada('')
    setSafraId('')
  }, [propriedadeSelecionada, safras])

  const handlePropriedade = (id: string) => {
    setPropriedadeSelecionada(id)
    setPropriedadeId(id)
  }

  const handleSafra = (id: string) => {
    setSafraSelecionada(id)
    setSafraId(id)
  }

  if (propriedades.length === 0 && safras.length === 0) return null

  return (
    <div className="flex items-center gap-2">
      <div className="relative">
        <div className="flex items-center gap-1.5 bg-[#1a251a] border border-[#243324] rounded-lg px-3 py-1.5 cursor-pointer hover:border-green-700 transition-colors">
          <MapPin className="w-3.5 h-3.5 text-green-600" />
          <select
            value={propriedadeSelecionada}
            onChange={e => handlePropriedade(e.target.value)}
            className="bg-transparent text-xs text-green-300 outline-none cursor-pointer pr-1"
          >
            <option value="">Todas propriedades</option>
            {propriedades.map(p => (
              <option key={p.id} value={p.id}>{p.nome}</option>
            ))}
          </select>
          <ChevronDown className="w-3 h-3 text-green-600" />
        </div>
      </div>
      <div className="relative">
        <div className="flex items-center gap-1.5 bg-[#1a251a] border border-[#243324] rounded-lg px-3 py-1.5 cursor-pointer hover:border-green-700 transition-colors">
          <Sprout className="w-3.5 h-3.5 text-green-600" />
          <select
            value={safraSelecionada}
            onChange={e => handleSafra(e.target.value)}
            className="bg-transparent text-xs text-green-300 outline-none cursor-pointer pr-1"
          >
            <option value="">Todas safras</option>
            {safrasFiltradas.map(s => (
              <option key={s.id} value={s.id}>{s.nome}</option>
            ))}
          </select>
          <ChevronDown className="w-3 h-3 text-green-600" />
        </div>
      </div>
    </div>
  )
}
