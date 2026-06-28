'use client'
import { useEffect, useRef, useState, useCallback } from 'react'
import { usePropriedade } from '@/contexts/PropriedadeContext'
import axios from 'axios'
import Cookies from 'js-cookie'
import { Trash2, Plus, Save, Map, Layers, Satellite, Navigation, X, Upload } from 'lucide-react'

const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'

interface Coord { lat: number; lng: number }
interface Talhao {
  id: string; nome: string; coordenadas: Coord[]
  area_hectares: number; cor: string; observacoes?: string
}

const CORES = ['#22c55e', '#3b82f6', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4', '#f97316', '#ec4899']

const TILE_LAYERS = {
  normal: {
    url: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
    attribution: '© OpenStreetMap contributors',
    maxZoom: 19,
  },
  satellite: {
    url: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
    attribution: '© Esri, Maxar, Earthstar Geographics',
    maxZoom: 19,
  },
}

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

function parseKml(text: string): { nome: string; coords: Coord[] }[] {
  const parser = new DOMParser()
  const doc = parser.parseFromString(text, 'application/xml')
  const placemarks = Array.from(doc.querySelectorAll('Placemark'))
  const results: { nome: string; coords: Coord[] }[] = []
  for (const pm of placemarks) {
    const nomeEl = pm.querySelector('name')
    const nome = nomeEl?.textContent?.trim() || 'Talhão importado'
    const coordEls = pm.querySelectorAll('coordinates')
    for (const coordEl of coordEls) {
      const raw = coordEl.textContent?.trim() || ''
      const coords: Coord[] = []
      for (const token of raw.split(/\s+/)) {
        const parts = token.split(',')
        if (parts.length >= 2) {
          const lng = parseFloat(parts[0])
          const lat = parseFloat(parts[1])
          if (!isNaN(lat) && !isNaN(lng)) coords.push({ lat, lng })
        }
      }
      if (coords.length >= 3) results.push({ nome, coords })
    }
  }
  return results
}

export default function MapasPage() {
  const { propriedadeId, propriedades } = usePropriedade()
  const mapRef = useRef<HTMLDivElement>(null)
  const mapInst = useRef<any>(null)
  const drawnGroup = useRef<any>(null)
  const tempPoly = useRef<any>(null)
  const tempMarks = useRef<any[]>([])
  const tileLayerRef = useRef<any>(null)
  const drawingRef = useRef(false)
  const corRef = useRef(CORES[0])
  const ptsRef = useRef<Coord[]>([])
  const kmlInputRef = useRef<HTMLInputElement>(null)

  const [talhoes, setTalhoes] = useState<Talhao[]>([])
  const [drawing, setDrawing] = useState(false)
  const [pts, setPts] = useState<Coord[]>([])
  const [nome, setNome] = useState('')
  const [cor, setCor] = useState(CORES[0])
  const [obs, setObs] = useState('')
  const [salvando, setSalvando] = useState(false)
  const [mapReady, setMapReady] = useState(false)
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [satellite, setSatellite] = useState(false)
  const [manualLat, setManualLat] = useState('')
  const [manualLng, setManualLng] = useState('')
  const [manualError, setManualError] = useState('')
  const [kmlError, setKmlError] = useState('')
  const [kmlImporting, setKmlImporting] = useState(false)

  const fazenda = propriedades?.find((p: any) => String(p.id) === String(propriedadeId))?.nome

  useEffect(() => { drawingRef.current = drawing }, [drawing])
  useEffect(() => { corRef.current = cor }, [cor])
  useEffect(() => { ptsRef.current = pts }, [pts])

  const token = () => Cookies.get('accessToken') || ''
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
    const layer = L.tileLayer(TILE_LAYERS.normal.url, {
      attribution: TILE_LAYERS.normal.attribution,
      maxZoom: TILE_LAYERS.normal.maxZoom,
    }).addTo(map)
    tileLayerRef.current = layer
    drawnGroup.current = L.featureGroup().addTo(map)
    mapInst.current = map

    map.on('click', (e: any) => {
      if (!drawingRef.current) return
      addPoint({ lat: e.latlng.lat, lng: e.latlng.lng })
    })
  }, [mapReady])

  useEffect(() => {
    if (!mapReady || !mapInst.current || !tileLayerRef.current) return
    const L = (window as any).L
    mapInst.current.removeLayer(tileLayerRef.current)
    const cfg = satellite ? TILE_LAYERS.satellite : TILE_LAYERS.normal
    tileLayerRef.current = L.tileLayer(cfg.url, { attribution: cfg.attribution, maxZoom: cfg.maxZoom })
      .addTo(mapInst.current)
  }, [satellite, mapReady])

  const addPoint = (pt: Coord) => {
    const L = (window as any).L
    const map = mapInst.current
    const mk = L.circleMarker([pt.lat, pt.lng], {
      radius: 5, color: corRef.current, fillOpacity: 1, weight: 1,
    }).addTo(map)
    tempMarks.current.push(mk)
    ptsRef.current = [...ptsRef.current, pt]
    setPts([...ptsRef.current])
    if (tempPoly.current) map.removeLayer(tempPoly.current)
    if (ptsRef.current.length >= 2) {
      tempPoly.current = L.polygon(
        ptsRef.current.map((c) => [c.lat, c.lng]),
        { color: corRef.current, fillOpacity: 0.2, dashArray: '6,4', weight: 2 }
      ).addTo(map)
    }
  }

  const limparTemp = () => {
    tempMarks.current.forEach((m) => mapInst.current?.removeLayer(m))
    tempMarks.current = []
    if (tempPoly.current && mapInst.current) { mapInst.current.removeLayer(tempPoly.current); tempPoly.current = null }
  }

  const loadPointsBatch = (coords: Coord[]) => {
    const L = (window as any).L
    const map = mapInst.current
    if (!L || !map) return
    limparTemp()
    ptsRef.current = []
    const marks: any[] = []
    for (const pt of coords) {
      const mk = L.circleMarker([pt.lat, pt.lng], {
        radius: 4, color: corRef.current, fillOpacity: 1, weight: 1,
      }).addTo(map)
      marks.push(mk)
    }
    tempMarks.current = marks
    ptsRef.current = [...coords]
    setPts([...coords])
    if (coords.length >= 2) {
      tempPoly.current = L.polygon(
        coords.map((c) => [c.lat, c.lng]),
        { color: corRef.current, fillOpacity: 0.2, dashArray: '6,4', weight: 2 }
      ).addTo(map)
    }
    try {
      const bounds = L.latLngBounds(coords.map((c) => [c.lat, c.lng]))
      map.fitBounds(bounds, { padding: [40, 40] })
    } catch {}
  }

  const handleKmlFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setKmlError('')
    setKmlImporting(true)
    const reader = new FileReader()
    reader.onload = (ev) => {
      try {
        const text = ev.target?.result as string
        const parsed = parseKml(text)
        if (parsed.length === 0) {
          setKmlError('Nenhum polígono encontrado no arquivo KML.')
          setKmlImporting(false)
          return
        }
        const first = parsed[0]
        setNome((prev) => prev || first.nome)
        setDrawing(true)
        setTimeout(() => {
          loadPointsBatch(first.coords)
          if (parsed.length > 1) {
            setKmlError(`${parsed.length} polígonos encontrados. Carregado o 1º: "${first.nome}". Salve e repita para os demais.`)
          }
          setKmlImporting(false)
        }, 100)
      } catch {
        setKmlError('Erro ao processar o arquivo KML.')
        setKmlImporting(false)
      }
    }
    reader.readAsText(file)
    e.target.value = ''
  }

  const adicionarManual = () => {
    const lat = parseFloat(manualLat.replace(',', '.'))
    const lng = parseFloat(manualLng.replace(',', '.'))
    if (isNaN(lat) || lat < -90 || lat > 90) { setManualError('Latitude inválida (-90 a 90)'); return }
    if (isNaN(lng) || lng < -180 || lng > 180) { setManualError('Longitude inválida (-180 a 180)'); return }
    setManualError('')
    addPoint({ lat, lng })
    mapInst.current?.setView([lat, lng], Math.max(mapInst.current.getZoom(), 12))
    setManualLat('')
    setManualLng('')
  }

  const removerUltimoPonto = () => {
    if (ptsRef.current.length === 0) return
    const last = tempMarks.current.pop()
    if (last) mapInst.current?.removeLayer(last)
    ptsRef.current = ptsRef.current.slice(0, -1)
    setPts([...ptsRef.current])
    if (tempPoly.current) mapInst.current?.removeLayer(tempPoly.current)
    if (ptsRef.current.length >= 2) {
      const L = (window as any).L
      tempPoly.current = L.polygon(
        ptsRef.current.map((c) => [c.lat, c.lng]),
        { color: corRef.current, fillOpacity: 0.2, dashArray: '6,4', weight: 2 }
      ).addTo(mapInst.current)
    } else {
      tempPoly.current = null
    }
  }

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

  const iniciar = () => { setDrawing(true); setPts([]); ptsRef.current = []; limparTemp(); setManualLat(''); setManualLng(''); setManualError(''); setKmlError('') }
  const cancelar = () => { setDrawing(false); setPts([]); ptsRef.current = []; limparTemp(); setKmlError('') }

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
        <div className="flex items-center gap-3">
          <button
            onClick={() => setSatellite((s) => !s)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-medium transition-all ${
              satellite
                ? 'bg-blue-700 border-blue-500 text-white'
                : 'bg-[#0d1a0d] border-[#1a2e1a] text-gray-400 hover:text-white'
            }`}
          >
            <Satellite className="w-3.5 h-3.5" />
            {satellite ? 'Satélite' : 'Normal'}
          </button>
          <span className="text-xs text-gray-400 flex items-center gap-1">
            <Layers className="w-3.5 h-3.5" /> {talhoes.length} talhão(ões)
          </span>
        </div>
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

            <input
              ref={kmlInputRef}
              type="file"
              accept=".kml,.kmz"
              className="hidden"
              onChange={handleKmlFile}
            />
            <button
              onClick={() => kmlInputRef.current?.click()}
              disabled={kmlImporting}
              className="w-full flex items-center justify-center gap-2 bg-[#0a150a] hover:bg-[#112011] border border-[#2a3a2a] hover:border-green-700 text-gray-300 hover:text-white text-xs font-medium py-2 rounded-lg transition-colors disabled:opacity-50"
            >
              <Upload className="w-3.5 h-3.5" />
              {kmlImporting ? 'Importando...' : 'Importar KML'}
            </button>
            {kmlError && <p className="text-xs text-yellow-400">{kmlError}</p>}

            {!drawing ? (
              <button onClick={iniciar}
                className="w-full flex items-center justify-center gap-2 bg-green-700 hover:bg-green-600 text-white text-xs font-medium py-2 rounded-lg transition-colors">
                <Plus className="w-3.5 h-3.5" /> Desenhar no Mapa
              </button>
            ) : (
              <div className="space-y-2">
                <div className="bg-[#0a150a] border border-[#1a2e1a] rounded-lg p-2.5 space-y-2">
                  <p className="text-xs text-gray-400 flex items-center gap-1">
                    <Navigation className="w-3 h-3" /> Adicionar por coordenadas
                  </p>
                  <div className="flex gap-1.5">
                    <input
                      value={manualLat}
                      onChange={(e) => { setManualLat(e.target.value); setManualError('') }}
                      placeholder="Latitude"
                      onKeyDown={(e) => e.key === 'Enter' && adicionarManual()}
                      className="flex-1 bg-[#141e14] border border-[#1f2e1f] rounded px-2 py-1.5 text-xs text-white placeholder-gray-600 focus:outline-none focus:border-green-600"
                    />
                    <input
                      value={manualLng}
                      onChange={(e) => { setManualLng(e.target.value); setManualError('') }}
                      placeholder="Longitude"
                      onKeyDown={(e) => e.key === 'Enter' && adicionarManual()}
                      className="flex-1 bg-[#141e14] border border-[#1f2e1f] rounded px-2 py-1.5 text-xs text-white placeholder-gray-600 focus:outline-none focus:border-green-600"
                    />
                    <button
                      onClick={adicionarManual}
                      disabled={!manualLat || !manualLng}
                      className="px-2 py-1.5 bg-green-800 hover:bg-green-700 disabled:opacity-40 rounded text-xs text-white transition-colors"
                    >
                      <Plus className="w-3.5 h-3.5" />
                    </button>
                  </div>
                  {manualError && <p className="text-xs text-red-400">{manualError}</p>}
                  {pts.length > 0 && (
                    <div className="space-y-1 max-h-24 overflow-y-auto">
                      {pts.map((p, i) => (
                        <div key={i} className="flex items-center justify-between text-xs text-gray-400">
                          <span className="font-mono">{i + 1}. {p.lat.toFixed(5)}, {p.lng.toFixed(5)}</span>
                          {i === pts.length - 1 && (
                            <button onClick={removerUltimoPonto} className="text-red-500 hover:text-red-400 ml-1">
                              <X className="w-3 h-3" />
                            </button>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
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
