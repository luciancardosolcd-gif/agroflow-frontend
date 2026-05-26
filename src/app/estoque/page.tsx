'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import api from '@/lib/api'
import Cookies from 'js-cookie'
import { Plus, Trash2, Edit, Search, RefreshCw, X, Package, AlertTriangle, CheckCircle, XCircle, Clock } from 'lucide-react'

function getVencimentoStatus(vencimento: string) {
  if (!vencimento) return { label: 'Sem data', color: 'text-gray-400', bg: 'bg-gray-900/30 border-gray-700', icon: null }
  const hoje = new Date()
  const venc = new Date(vencimento)
  const dias = Math.floor((venc.getTime() - hoje.getTime()) / (1000 * 60 * 60 * 24))
  if (dias < 0) return { label: 'Vencido', color: 'text-red-400', bg: 'bg-red-900/40 border-red-700', icon: 'vencido' }
  if (dias <= 30) return { label: `Vence em ${dias}d`, color: 'text-red-300', bg: 'bg-red-900/30 border-red-800', icon: 'critico' }
  if (dias <= 90) return { label: `Vence em ${dias}d`, color: 'text-yellow-400', bg: 'bg-yellow-900/30 border-yellow-800', icon: 'atencao' }
  if (dias <= 180) return { label: `Vence em ${dias}d`, color: 'text-orange-400', bg: 'bg-orange-900/30 border-orange-800', icon: 'moderado' }
  if (dias <= 365) return { label: `Vence em ${dias}d`, color: 'text-blue-400', bg: 'bg-blue-900/30 border-blue-800', icon: 'ok' }
  return { label: 'Mais de 1 ano', color: 'text-green-400', bg: 'bg-green-900/30 border-green-800', icon: 'bom' }
}

export default function EstoquePage() {
  const [items, setItems] = useState<Record<string, string>[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [filtroVenc, setFiltroVenc] = useState('todos')
  const [showModal, setShowModal] = useState(false)
  const [editing, setEditing] = useState<Record<string, string> | null>(null)
  const [form, setForm] = useState<Record<string, string>>({})
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [perfil, setPerfil] = useState('')
  const [autorizado, setAutorizado] = useState<boolean | null>(null)
  const router = useRouter()

  useEffect(() => {
    const u = Cookies.get('user')
    if (u) {
      const parsed = JSON.parse(u)
      setPerfil(parsed.perfil)
      if (parsed.perfil === 'admin') { setAutorizado(true); return }
      const perm = parsed.permissoes || {}
      if (perm?.estoque?.ver === true) {
        setAutorizado(true)
      } else {
        setAutorizado(false)
        router.replace('/dashboard')
      }
    }
  }, [])

  const canEdit = ['admin', 'gestor'].includes(perfil)
  const canDelete = perfil === 'admin'

  const load = async () => {
    setLoading(true)
    try {
      const { data } = await api.get('/estoque')
      setItems(Array.isArray(data) ? data : [])
    } catch { setItems([]) }
    finally { setLoading(false) }
  }

  useEffect(() => { if (autorizado) load() }, [autorizado])

  const openCreate = () => {
    setEditing(null)
    setForm({ unidade: 'LT', status: 'ativo' })
    setError('')
    setShowModal(true)
  }

  const openEdit = (item: Record<string, string>) => {
    setEditing(item)
    setForm({
      nome: item.nome, descricao: item.descricao || '',
      quantidade: item.quantidade, unidade: item.unidade || 'LT',
      lote: item.lote || '',
      vencimento: item.vencimento ? item.vencimento.split('T')[0] : '',
      valorUnitario: item.valorUnitario || '', categoria: item.categoria || '',
      status: item.status
    })
    setError('')
    setShowModal(true)
  }

  const handleSave = async () => {
    setSaving(true)
    setError('')
    try {
      const payload: Record<string, string> = {}
      const allowed = ['nome','descricao','quantidade','unidade','lote','vencimento','valorUnitario','categoria','status']
      Object.entries(form).forEach(([key, value]) => {
        if (allowed.includes(key) && value !== '' && value !== undefined) payload[key] = value
      })
      if (editing) {
        await api.put(`/estoque/${editing.id}`, payload)
      } else {
        await api.post('/estoque', payload)
      }
      setShowModal(false)
      load()
    } catch (e: unknown) {
      const err = e as { response?: { data?: { message?: string } } }
      setError(err.response?.data?.message || 'Erro ao salvar')
    } finally { setSaving(false) }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Confirmar exclusão?')) return
    try { await api.delete(`/estoque/${id}`); load() } catch {}
  }

  const filtered = items.filter(item => {
    const matchSearch = item.nome?.toLowerCase().includes(search.toLowerCase()) ||
      item.lote?.toLowerCase().includes(search.toLowerCase())
    if (!matchSearch) return false
    if (filtroVenc === 'todos') return true
    const status = getVencimentoStatus(item.vencimento)
    if (filtroVenc === 'vencido') return status.icon === 'vencido'
    if (filtroVenc === 'critico') return status.icon === 'critico'
    if (filtroVenc === 'atencao') return status.icon === 'atencao'
    if (filtroVenc === 'ok') return ['ok', 'bom', 'moderado'].includes(status.icon || '')
    return true
  })

  const vencidos = items.filter(i => getVencimentoStatus(i.vencimento).icon === 'vencido').length
  const criticos = items.filter(i => getVencimentoStatus(i.vencimento).icon === 'critico').length
  const atencao = items.filter(i => getVencimentoStatus(i.vencimento).icon === 'atencao').length

  if (autorizado === null || !autorizado) return null

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-3xl text-green-100 flex items-center gap-3">
            <Package className="w-8 h-8 text-orange-400" />
            Estoque de Defensivos
          </h1>
          <p className="text-green-600 mt-1">{items.length} produtos cadastrados</p>
        </div>
        <div className="flex gap-3">
          <button onClick={load} className="btn-secondary"><RefreshCw className="w-4 h-4" /></button>
          <button onClick={openCreate} className="btn-primary"><Plus className="w-4 h-4" />Novo Produto</button>
        </div>
      </div>

      {(vencidos > 0 || criticos > 0 || atencao > 0) && (
        <div className="grid grid-cols-3 gap-4">
          {vencidos > 0 && (
            <div className="card border-red-800/50 bg-red-900/20 flex items-center gap-3 cursor-pointer" onClick={() => setFiltroVenc('vencido')}>
              <XCircle className="w-8 h-8 text-red-400 flex-shrink-0" />
              <div>
                <div className="font-display text-2xl text-red-400">{vencidos}</div>
                <div className="text-red-600 text-sm">Produto{vencidos !== 1 ? 's' : ''} vencido{vencidos !== 1 ? 's' : ''}</div>
              </div>
            </div>
          )}
          {criticos > 0 && (
            <div className="card border-red-800/50 bg-red-900/10 flex items-center gap-3 cursor-pointer" onClick={() => setFiltroVenc('critico')}>
              <AlertTriangle className="w-8 h-8 text-red-300 flex-shrink-0" />
              <div>
                <div className="font-display text-2xl text-red-300">{criticos}</div>
                <div className="text-red-600 text-sm">Vence em até 30 dias</div>
              </div>
            </div>
          )}
          {atencao > 0 && (
            <div className="card border-yellow-800/50 bg-yellow-900/10 flex items-center gap-3 cursor-pointer" onClick={() => setFiltroVenc('atencao')}>
              <Clock className="w-8 h-8 text-yellow-400 flex-shrink-0" />
              <div>
                <div className="font-display text-2xl text-yellow-400">{atencao}</div>
                <div className="text-yellow-600 text-sm">Vence em até 90 dias</div>
              </div>
            </div>
          )}
        </div>
      )}

      <div className="card">
        <div className="flex gap-3 mb-6">
          <div className="flex items-center gap-3 bg-[#1a251a] rounded-lg px-4 py-2.5 border border-[#243324] flex-1">
            <Search className="w-4 h-4 text-green-600" />
            <input value={search} onChange={e => setSearch(e.target.value)}
              placeholder="Buscar por nome ou lote..."
              className="bg-transparent text-sm text-green-300 placeholder-green-700 outline-none flex-1" />
          </div>
          <select value={filtroVenc} onChange={e => setFiltroVenc(e.target.value)} className="input w-48">
            <option value="todos">Todos</option>
            <option value="vencido">Vencidos</option>
            <option value="critico">Crítico (30d)</option>
            <option value="atencao">Atenção (90d)</option>
            <option value="ok">Em dia</option>
          </select>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-16">
            <div className="w-8 h-8 border-2 border-green-600 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-16 text-green-700">
            <div className="text-4xl mb-3">📦</div>
            <div>Nenhum produto encontrado</div>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-[#243324]">
                  <th className="text-left py-3 px-3 text-green-600 font-medium">Produto</th>
                  <th className="text-left py-3 px-3 text-green-600 font-medium">Qtd</th>
                  <th className="text-left py-3 px-3 text-green-600 font-medium">Un</th>
                  <th className="text-left py-3 px-3 text-green-600 font-medium">Lote</th>
                  <th className="text-left py-3 px-3 text-green-600 font-medium">Vencimento</th>
                  <th className="text-left py-3 px-3 text-green-600 font-medium">Status</th>
                  {(canEdit || canDelete) && <th className="text-right py-3 px-3 text-green-600 font-medium">Ações</th>}
                </tr>
              </thead>
              <tbody>
                {filtered.map((item) => {
                  const venc = getVencimentoStatus(item.vencimento)
                  return (
                    <tr key={item.id} className="border-b border-[#1a251a] hover:bg-[#1a251a]/50 transition-colors">
                      <td className="py-3 px-3 text-green-200 font-medium">{item.nome}</td>
                      <td className="py-3 px-3 text-green-300">{item.quantidade}</td>
                      <td className="py-3 px-3 text-green-500">{item.unidade}</td>
                      <td className="py-3 px-3 text-green-500 text-xs">{item.lote || '-'}</td>
                      <td className="py-3 px-3 text-green-400 text-xs">
                        {item.vencimento ? new Date(item.vencimento).toLocaleDateString('pt-BR') : '-'}
                      </td>
                      <td className="py-3 px-3">
                        <span className={`px-2 py-0.5 rounded-full text-xs font-medium border ${venc.bg} ${venc.color}`}>
                          {venc.label}
                        </span>
                      </td>
                      {(canEdit || canDelete) && (
                        <td className="py-3 px-3">
                          <div className="flex items-center justify-end gap-2">
                            {canEdit && (
                              <button onClick={() => openEdit(item)}
                                className="w-8 h-8 bg-[#1a251a] hover:bg-green-900/40 rounded-lg flex items-center justify-center text-green-600 hover:text-green-400 transition-colors border border-[#243324]">
                                <Edit className="w-3.5 h-3.5" />
                              </button>
                            )}
                            {canDelete && (
                              <button onClick={() => handleDelete(item.id)}
                                className="w-8 h-8 bg-[#1a251a] hover:bg-red-900/40 rounded-lg flex items-center justify-center text-green-600 hover:text-red-400 transition-colors border border-[#243324]">
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            )}
                          </div>
                        </td>
                      )}
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
          <div className="bg-[#111811] border border-[#243324] rounded-2xl w-full max-w-lg shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b border-[#243324]">
              <h2 className="font-display text-xl text-green-100">{editing ? 'Editar Produto' : 'Novo Produto'}</h2>
              <button onClick={() => setShowModal(false)} className="text-green-600 hover:text-green-400">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6 space-y-4">
              {error && <div className="bg-red-900/30 border border-red-800 text-red-400 rounded-lg px-4 py-3 text-sm">{error}</div>}
              <div>
                <label className="text-green-400 text-sm font-medium block mb-2">Nome do produto <span className="text-red-500">*</span></label>
                <input value={form.nome || ''} onChange={e => setForm({...form, nome: e.target.value})} className="input" placeholder="Ex: ALMADA" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-green-400 text-sm font-medium block mb-2">Quantidade <span className="text-red-500">*</span></label>
                  <input type="number" value={form.quantidade || ''} onChange={e => setForm({...form, quantidade: e.target.value})} className="input" placeholder="0" />
                </div>
                <div>
                  <label className="text-green-400 text-sm font-medium block mb-2">Unidade</label>
                  <select value={form.unidade || 'LT'} onChange={e => setForm({...form, unidade: e.target.value})} className="input">
                    <option value="LT">LT (Litros)</option>
                    <option value="KG">KG (Quilos)</option>
                    <option value="UN">UN (Unidade)</option>
                    <option value="SC">SC (Saco)</option>
                    <option value="CX">CX (Caixa)</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="text-green-400 text-sm font-medium block mb-2">Lote</label>
                <input value={form.lote || ''} onChange={e => setForm({...form, lote: e.target.value})} className="input" placeholder="Ex: 017-25-19600" />
              </div>
              <div>
                <label className="text-green-400 text-sm font-medium block mb-2">Data de vencimento</label>
                <input type="date" value={form.vencimento || ''} onChange={e => setForm({...form, vencimento: e.target.value})} className="input" />
              </div>
              <div>
                <label className="text-green-400 text-sm font-medium block mb-2">Categoria</label>
                <select value={form.categoria || ''} onChange={e => setForm({...form, categoria: e.target.value})} className="input">
                  <option value="">Selecione...</option>
                  <option value="Herbicida">Herbicida</option>
                  <option value="Fungicida">Fungicida</option>
                  <option value="Inseticida">Inseticida</option>
                  <option value="Acaricida">Acaricida</option>
                  <option value="Adjuvante">Adjuvante</option>
                  <option value="Fertilizante">Fertilizante</option>
                  <option value="Inoculante">Inoculante</option>
                  <option value="Outros">Outros</option>
                </select>
              </div>
              <div>
                <label className="text-green-400 text-sm font-medium block mb-2">Valor unitário</label>
                <input type="number" step="0.01" value={form.valorUnitario || ''} onChange={e => setForm({...form, valorUnitario: e.target.value})} className="input" placeholder="0.00" />
              </div>
              <div>
                <label className="text-green-400 text-sm font-medium block mb-2">Observação</label>
                <input value={form.descricao || ''} onChange={e => setForm({...form, descricao: e.target.value})} className="input" placeholder="Observações..." />
              </div>
            </div>
            <div className="flex gap-3 p-6 border-t border-[#243324]">
              <button onClick={() => setShowModal(false)} className="btn-secondary flex-1 justify-center">Cancelar</button>
              <button onClick={handleSave} disabled={saving} className="btn-primary flex-1 justify-center">
                {saving ? <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> : 'Salvar'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
