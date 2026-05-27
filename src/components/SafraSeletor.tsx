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
      <div className="flex items-center gap-1.5 bg-[#111811] border border-[#1e2e1e] rounded-lg px-3 py-1.5 hover:border-[#2a3e2a] transition-colors">
        <MapPin className="w-3.5 h-3.5 text-gray-500 flex-shrink-0" />
        <select
          value={propriedadeSelecionada}
          onChange={e => handlePropriedade(e.target.value)}
          className="bg-transparent text-xs text-gray-300 outline-none cursor-pointer max-w-[140px]"
        >
          <option value="">Todas propriedades</option>
          {propriedades.map(p => (
            <option key={p.id} value={p.id}>{p.nome}</option>
          ))}
        </select>
        <ChevronDown className="w-3 h-3 text-gray-500 flex-shrink-0" />
      </div>

      <div className="flex items-center gap-1.5 bg-[#111811] border border-[#1e2e1e] rounded-lg px-3 py-1.5 hover:border-[#2a3e2a] transition-colors">
        <Sprout className="w-3.5 h-3.5 text-gray-500 flex-shrink-0" />
        <select
          value={safraSelecionada}
          onChange={e => handleSafra(e.target.value)}
          className="bg-transparent text-xs text-gray-300 outline-none cursor-pointer max-w-[120px]"
        >
          <option value="">Todas safras</option>
          {safrasFiltradas.map(s => (
            <option key={s.id} value={s.id}>{s.nome}</option>
          ))}
        </select>
        <ChevronDown className="w-3 h-3 text-gray-500 flex-shrink-0" />
      </div>
    </div>
  )
}
