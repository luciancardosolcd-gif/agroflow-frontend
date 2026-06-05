'use client'
import { ChevronDown, MapPin, Sprout } from 'lucide-react'
import { usePropriedade } from '@/contexts/PropriedadeContext'

export default function SafraSeletor() {
  const {
    propriedades,
    safrasFiltradas,
    propriedadeId,
    safraId,
    setPropriedadeId,
    setSafraId,
  } = usePropriedade()

  if (propriedades.length === 0) return null

  return (
    <div className="flex items-center gap-2">
      {/* Seletor de propriedade */}
      <div className="flex items-center gap-1.5 bg-[#111811] border border-[#1e2e1e] rounded-lg px-3 py-1.5 hover:border-[#2a3e2a] transition-colors">
        <MapPin className="w-3.5 h-3.5 text-gray-500 flex-shrink-0" />
        <select
          value={propriedadeId}
          onChange={e => setPropriedadeId(e.target.value)}
          className="bg-transparent text-xs text-gray-300 outline-none cursor-pointer max-w-[140px]"
        >
          <option value="">Todas propriedades</option>
          {propriedades.map(p => (
            <option key={p.id} value={p.id}>{p.nome}</option>
          ))}
        </select>
        <ChevronDown className="w-3 h-3 text-gray-500 flex-shrink-0" />
      </div>

      {/* Seletor de safra */}
      <div className="flex items-center gap-1.5 bg-[#111811] border border-[#1e2e1e] rounded-lg px-3 py-1.5 hover:border-[#2a3e2a] transition-colors">
        <Sprout className="w-3.5 h-3.5 text-gray-500 flex-shrink-0" />
        <select
          value={safraId}
          onChange={e => setSafraId(e.target.value)}
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
