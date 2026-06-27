'use client'
import { useEffect, useRef, useState, useCallback } from 'react'
import { usePropriedade } from '@/contexts/PropriedadeContext'   
import axios from 'axios'
import Cookies from 'js-cookie'
import { Trash2, Plus, Save, Map, Layers } from 'lucide-react'

const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'

interface Coord { lat: number; lng: number }
interface Talhao {
  id: string; nome: string; coordenadas: Coord[]
  area_hectares: number; cor: string; observacoes?: string
}

const CORES = ['#22c55e', '#3b82f6', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4', '#f97316', '#ec4899']

function calcArea(coords: Coord[]): number {
  if (coords.length < 3) return 0
  const R = 6371000
  const toRad = (d: number) => (d * Math.PI) / 180
  let area = 0
  const n = coords.length
  for (let i = 0; i < n; i++) {
    const j = (i + 1) % n
    const xi = toRad(coords[i].lng) * Math.cos(toRad(coords[i].lat))
    const xj = toRad(coords[j].lng) * Math.cos(toRad(coords[j].lat))
    area += xi * toRad(coords[j].lat) - xj * toRad(coords[i].lat)
  }
  return Math.abs((area * R * R) / 2) / 10000
}

export default function MapasPage() {
  const { propriedadeId, propriedades } = usePropriedade()
  const mapRef = useRef<HTMLDivElement>(null)
  const mapInst = useRef<any>(null)
  const drawnGroup = useRef<any>(null)
  const tempPoly = useRef<any>(null)
  const tempMarks = useRef<any[]>([])
  const drawingRef = useRef(false)
  const corRef = useRef(CORES[0])
  const ptsRef = useRef<Coord[]>([])

  const [talhoes, setTalhoes] = useState<Talhao[]>([])
  const [drawing, setDrawing] = useState(false)
  const [pts, setPts] = useState<Coord[]>([])
  const [nome, setNome] = useState('')
  const [cor, setCor] = useState(CORES[0])
  const [obs, setObs] = useState('')
  const [salvando, setSalvando] = useState(false)
  const [mapReady, setMapReady] = useState(false)
  const [selectedId, setSelectedId] = useState<string | null>(null)

  const fazenda = propriedades?.find((p: any) => String(p.id) === String(propriedadeId))?.nome

  useEffect(() => { drawingRef.current = drawing }, [drawing])
  useEffect(() => { corRef.current = cor }, [cor])
  useEffect(() => { ptsRef.current = pts }, [pts])

  const token = () => { try { return JSON.parse(Cookies.get('user') || '{}').token } catch { return '' } }
  const hdrs = () => ({ Authorization: `Bearer ${token()}` })

  useEffect(() => {
    if (typeof window === 'undefined') return
    if ((window as any).L) { setMapReady(true); return }
    const css = document.createElement('link')
    css.rel = 'stylesheet'
    css.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css'
    document.head.appendChild(css)
    const js = document.createElement('script')
    js.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js'
    js.onload = () => setMapReady(true)
    document.head.appendChild(js)
  }, [])

  useEffect(() => {
    if (!mapReady || !mapRef.current || mapInst.current) return
    const L = (window as any).L
    const map = L.map(mapRef.current).setView([-15.78, -47.93], 5)
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap contributors', maxZoom: 19,
    }).addTo(map)
    drawnGroup.current = L.featureGroup().addTo(map)
    mapInst.current = map

    map.on('click', (e: any) => {
      if (!drawingRef.current) return
      const L2 = (window as any).L
      const pt = { lat: e.latlng.lat, lng: e.latlng.lng }
      const mk = L2.circleMarker([pt.lat, pt.lng], {
        radius: 5, color: corRef.current, fillOpacity: 1, weight: 1,
      }).addTo(map)
      tempMarks.current.push(mk)
      ptsRef.current = [...ptsRef.current, pt]
      setPts([...ptsRef.current])
      if (tempPoly.current) map.removeLayer(tempPoly.current)
      if (ptsRef.current.length >= 2) {
        tempPoly.current = L2.polygon(
          ptsRef.current.map((c) => [c.lat, c.lng]),
          { color: corRef.current, fillOpacity: 0.2, dashArray: '6,4', weight: 2 }
        ).addTo(map)
      }
    })
  }, [mapReady])

  const carregar = useCallback(async () => {
    try {
      const params: any = {}
      if (propriedadeId) params.propriedadeId = propriedadeId
      const { data } = await axios.get(`${API}/talhoes`, { params, headers: hdrs() })
      setTalhoes(data)
    } catch {}
  }, [propriedadeId])

  useEffect(() => { carregar() }, [carregar])

  useEffect(() => {
    if (!mapReady || !drawnGroup.current) return
    const L = (window as any).L
    drawnGroup.current.clearLayers()
    talhoes.forEach((t) => {
      if (!t.coordenadas?.length) return
      const poly = L.polygon(t.coordenadas.map((c) => [c.lat, c.lng]), {
        color: t.cor || '#22c55e', fillOpacity: 0.3, weight: 2,
      })
      poly.bindTooltip(
        `<b>${t.nome}</b>${t.area_hectares ? '<br/>' + Number(t.area_hectares).toFixed(2) + ' ha' : ''}`,
        { permanent: false, direction: 'center' }
      )
      poly.on('click', () => setSelectedId(t.id))
      drawnGroup.current.addLayer(poly)
    })
    if (talhoes.length > 0 && drawnGroup.current.getLayers().length > 0) {
      try { mapInst.current?.fitBounds(drawnGroup.current.getBounds(), { padding: [20, 20] }) } catch {}
    }
  }, [talhoes, mapReady])

  const limparTemp = () => {
    tempMarks.current.forEach((m) => mapInst.current?.removeLayer(m))
    tempMarks.current = []
    if (tempPoly.current && mapInst.current) { mapInst.current.removeLayer(tempPoly.current); tempPoly.current = null }
  }

  const iniciar = () => { setDrawing(true); setPts([]); ptsRef.current = []; limparTemp() }
  const cancelar = () => { setDrawing(false); setPts([]); ptsRef.current = []; limparTemp() }

  const salvar = async () => {
    if (!nome.trim()) { alert('Informe o nome do talhão'); return }
    if (pts.length < 3) { alert('Marque pelo menos 3 pontos no mapa'); return }
    setSalvando(true)
    try {
      const body: any = { nome: nome.trim(), coordenadas: pts, area_hectares: calcArea(pts), cor, observacoes: obs.trim() || undefined }
      if (propriedadeId) body.propriedade_id = String(propriedadeId)
      await axios.post(`${API}/talhoes`, body, { headers: hdrs() })
      setNome(''); setObs(''); setCor(CORES[0]); cancelar(); await carregar()
    } catch { alert('Erro ao salvar talhão') } finally { setSalvando(false) }
  }

  const excluir = async (id: string) => {
    if (!confirm('Excluir este talhão?')) return
    try { await axios.delete(`${API}/talhoes/${id}`, { headers: hdrs() }); setSelectedId(null); await carregar() }
    catch { alert('Erro ao excluir') }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-white flex items-center gap-2">
            <Map className="w-5 h-5 text-green-400" /> Mapas & Talhões
          </h1>
          {fazenda
            ? <p className="text-xs text-green-400 mt-0.5">Propriedade: {fazenda}</p>
            : <p className="text-xs text-yellow-400 mt-0.5">Selecione uma propriedade no menu superior para filtrar talhões</p>
          }
        </div>
        <span className="text-xs text-gray-400 flex items-center gap-1">
          <Layers className="w-3.5 h-3.5" /> {talhoes.length} talhão(ões)
        </span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4" style={{ height: '72vh' }}>
        <div className="lg:col-span-2 relative rounded-xl overflow-hidden border border-[#1a2e1a]" style={{ minHeight: 400 }}>
          {!mapReady && (
            <div className="absolute inset-0 flex items-center justify-center bg-[#0d1a0d] z-10">
              <p className="text-gray-400 text-sm">Carregando mapa...</p>
            </div>
          )}
          <div ref={mapRef} style={{ height: '100%', width: '100%' }} />
          {drawing && (
            <div className="absolute top-3 left-1/2 -translate-x-1/2 z-[1000] bg-green-900/90 border border-green-600 rounded-lg px-3 py-1.5 text-xs text-green-200 pointer-events-none">
              Clique no mapa para marcar pontos ({pts.length} ponto{pts.length !== 1 ? 's' : ''}) — mín. 3
            </div>
          )}
        </div>

        <div className="flex flex-col gap-3 overflow-y-auto">
          <div className="bg-[#0d1a0d] border border-[#1a2e1a] rounded-xl p-4 space-y-3">
            <h2 className="text-sm font-semibold text-white">Novo Talhão</h2>
            <div>
              <label className="text-xs text-gray-400">Nome *</label>
              <input value={nome} onChange={(e) => setNome(e.target.value)} placeholder="Ex: Talhão A"
                className="mt-1 w-full bg-[#141e14] border border-[#1f2e1f] rounded-lg px-3 py-2 text-xs text-white placeholder-gray-600 focus:outline-none focus:border-green-600" />
            </div>
            <div>
              <label className="text-xs text-gray-400">Cor</label>
              <div className="flex gap-1.5 mt-1 flex-wrap">
                {CORES.map((c) => (
                  <button key={c} onClick={() => setCor(c)} style={{ background: c }}
                    className={`w-6 h-6 rounded-full border-2 transition-all ${cor === c ? 'border-white scale-110' : 'border-transparent'}`} />
                ))}
              </div>
            </div>
            <div>
              <label className="text-xs text-gray-400">Observações</label>
              <textarea value={obs} onChange={(e) => setObs(e.target.value)} rows={2} placeholder="Opcional..."
                className="mt-1 w-full bg-[#141e14] border border-[#1f2e1f] rounded-lg px-3 py-2 text-xs text-white placeholder-gray-600 focus:outline-none focus:border-green-600 resize-none" />
            </div>
            {pts.length >= 3 && <p className="text-xs text-green-400">Área estimada: {calcArea(pts).toFixed(2)} ha</p>}
            {!drawing ? (
              <button onClick={iniciar}
                className="w-full flex items-center justify-center gap-2 bg-green-700 hover:bg-green-600 text-white text-xs font-medium py-2 rounded-lg transition-colors">
                <Plus className="w-3.5 h-3.5" /> Desenhar no Mapa
              </button>
            ) : (
              <div className="flex gap-2">
                <button onClick={cancelar}
                  className="flex-1 text-xs py-2 rounded-lg border border-[#2a3a2a] text-gray-400 hover:text-white transition-colors">
                  Cancelar
                </button>
                <button onClick={salvar} disabled={salvando || pts.length < 3}
                  className="flex-1 flex items-center justify-center gap-1.5 bg-green-700 hover:bg-green-600 disabled:opacity-50 text-white text-xs font-medium py-2 rounded-lg transition-colors">
                  <Save className="w-3 h-3" /> {salvando ? 'Salvando...' : 'Salvar'}
                </button>
              </div>
            )}
          </div>

          <div className="bg-[#0d1a0d] border border-[#1a2e1a] rounded-xl p-4 flex-1 overflow-y-auto">
            <h2 className="text-sm font-semibold text-white mb-3">Talhões Cadastrados</h2>
            {talhoes.length === 0 ? (
              <p className="text-xs text-gray-500 text-center py-6">Nenhum talhão cadastrado.<br />Clique em "Desenhar no Mapa" para começar.</p>
            ) : (
              <div className="space-y-2">
                {talhoes.map((t) => (
                  <div key={t.id} onClick={() => setSelectedId(selectedId === t.id ? null : t.id)}
                    className={`flex items-center gap-2.5 p-2.5 rounded-lg border cursor-pointer transition-all ${
                      selectedId === t.id ? 'border-green-600 bg-green-900/20' : 'border-[#1f2e1f] hover:border-[#2a3e2a]'
                    }`}>
                    <div className="w-3 h-3 rounded-full flex-shrink-0" style={{ background: t.cor || '#22c55e' }} />
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-medium text-white truncate">{t.nome}</p>
                      {t.area_hectares && <p className="text-xs text-gray-500">{Number(t.area_hectares).toFixed(2)} ha</p>}
                    </div>
                    <button onClick={(e) => { e.stopPropagation(); excluir(t.id) }}
                      className="p-1 rounded text-gray-600 hover:text-red-400 transition-colors flex-shrink-0">
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
