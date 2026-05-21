'use client'
import { useEffect, useState } from 'react'
import api from '@/lib/api'
import Cookies from 'js-cookie'
import { Plus, Trash2, Edit, Search, RefreshCw, X } from 'lucide-react'
import CategoriaSeletor from '@/components/CategoriaSeletor'

interface FieldDef {
  key: string
  label: string
  type?: string
  required?: boolean
  options?: string[]
}

interface CrudPageProps {
  title: string
  endpoint: string
  fields: FieldDef[]
  icon: React.ReactNode
}

export default function CrudPage({ title, endpoint, fields, icon }: CrudPageProps) {
  const [items, setItems] = useState<Record<string, unknown>[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [showModal, setShowModal] = useState(false)
  const [editing, setEditing] = useState<Record<string, unknown> | null>(null)
  const [form, setForm] = useState<Record<string, string>>({})
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [perfil, setPerfil] = useState('')
  const [token, setToken] = useState('')

  // campo separado para categoria hierárquica
  const [categoriaId, setCategoriaId] = useState('')

  useEffect(() => {
    const u = Cookies.get('user')
    if (u) setPerfil(JSON.parse(u).perfil)
    const t = Cookies.get('token') || localStorage.getItem('accessToken') || ''
    setToken(t)
  }, [])

  const isAdmin = perfil === 'admin'
  const isGestor = perfil === 'gestor'
  const canCreate = isAdmin || isGestor || perfil === 'operador'
  const canEdit = isAdmin || isGestor
  const canDelete = isAdmin

  const load = async () => {
    setLoading(true)
    try {
      const { data } = await api.get(endpoint)
      setItems(Array.isArray(data) ? data : [])
    } catch { setItems([]) }
    finally { setLoading(false) }
  }

  useEffect(() => { load() }, [endpoint])

  const openCreate = () => {
    setEditing(null)
    setForm({})
    setCategoriaId('')
    setError('')
    setShowModal(true)
  }

  const openEdit = (item: Record<string, unknown>) => {
    setEditing(item)
    const f: Record<string, string> = {}
    fields.forEach(field => { f[field.key] = String(item[field.key] || '') })
    setForm(f)
    setCategoriaId(String(item['financial_category_id'] || ''))
    setError('')
    setShowModal(true)
  }

  const handleSave = async () => {
    setSaving(true)
    setError('')
    try {
      // É endpoint financeiro? inclui financial_category_id
      const isFinanceiro = endpoint.includes('financeiro')
      const payload = isFinanceiro
        ? { ...form, financial_category_id: categoriaId || null }
        : form

      if (editing) {
        await api.put(`${endpoint}/${editing.id}`, payload)
      } else {
        await api.post(endpoint, payload)
      }
      setShowModal(false)
      load()
    } catch (e: unknown) {
      const err = e as { response?: { data?: { message?: string } } }
      setError(err.response?.data?.message || 'Erro ao salvar')
    } finally { setSaving(false) }
  }

  const handleDelete = async (id: unknown) => {
    if (!confirm('Confirmar exclusão?')) return
    try {
      await api.delete(`${endpoint}/${id}`)
      load()
    } catch {}
  }

  const filtered = items.filter(item =>
    fields.some(f => String(item[f.key] || '').toLowerCase().includes(search.toLowerCase()))
  )

  const displayFields = fields.slice(0, 4)
  const isFinanceiro = endpoint.includes('financeiro')
  const tipoAtual = (form['tipo'] || '').toLowerCase() as 'receita' | 'despesa' | undefined

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-3xl text-green-100 flex items-center gap-3">{icon}{title}</h1>
          <p className="text-green-600 mt-1">{items.length} registro{items.length !== 1 ? 's' : ''} encontrado{items.length !== 1 ? 's' : ''}</p>
        </div>
        <div className="flex gap-3">
          <button onClick={load} className="btn-secondary"><RefreshCw className="w-4 h-4" /></button>
          {canCreate && (
            <button onClick={openCreate} className="btn-primary"><Plus className="w-4 h-4" />Novo</button>
          )}
        </div>
      </div>

      <div className="card">
        <div className="flex items-center gap-3 bg-[#1a251a] rounded-lg px-4 py-2.5 mb-6 border border-[#243324]">
          <Search className="w-4 h-4 text-green-600" />
          <input value={search} onChange={e => setSearch(e.target.value)}
            placeholder={`Buscar em ${title.toLowerCase()}...`}
            className="bg-transparent text-sm text-green-300 placeholder-green-700 outline-none flex-1" />
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-16">
            <div className="w-8 h-8 border-2 border-green-600 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-16 text-green-700">
            <div className="text-4xl mb-3">📋</div>
            <div>Nenhum registro encontrado</div>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-[#243324]">
                  {displayFields.map(f => (
                    <th key={f.key} className="text-left py-3 px-4 text-green-600 font-medium">{f.label}</th>
                  ))}
                  {(canEdit || canDelete) && (
                    <th className="text-right py-3 px-4 text-green-600 font-medium">Ações</th>
                  )}
                </tr>
              </thead>
              <tbody>
                {filtered.map((item, i) => (
                  <tr key={String(item.id || i)} className="border-b border-[#1a251a] hover:bg-[#1a251a]/50 transition-colors">
                    {displayFields.map(f => (
                      <td key={f.key} className="py-3 px-4 text-green-300">
                        {f.key === 'status' ? (
                          <span className={item[f.key] === 'ativo' ? 'badge-ativo' : 'badge-inativo'}>
                            {String(item[f.key] || '-')}
                          </span>
                        ) : (
                          <span className="truncate block max-w-[200px]">{String(item[f.key] || '-')}</span>
                        )}
                      </td>
                    ))}
                    {(canEdit || canDelete) && (
                      <td className="py-3 px-4">
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
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
          <div className="bg-[#111811] border border-[#243324] rounded-2xl w-full max-w-lg shadow-2xl max-h-[90vh] flex flex-col">
            <div className="flex items-center justify-between p-6 border-b border-[#243324]">
              <h2 className="font-display text-xl text-green-100">{editing ? 'Editar' : 'Novo'} {title.slice(0, -1)}</h2>
              <button onClick={() => setShowModal(false)} className="text-green-600 hover:text-green-400">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-4 overflow-y-auto flex-1">
              {error && (
                <div className="bg-red-900/30 border border-red-800 text-red-400 rounded-lg px-4 py-3 text-sm">{error}</div>
              )}

              {fields.map(field => (
                <div key={field.key}>
                  <label className="text-green-400 text-sm font-medium block mb-2">
                    {field.label}{field.required && <span className="text-red-500 ml-1">*</span>}
                  </label>

                  {field.type === 'select' && field.options ? (
                    <select
                      value={form[field.key] || ''}
                      onChange={e => setForm(prev => ({ ...prev, [field.key]: e.target.value }))}
                      className="input"
                    >
                      <option value="">Selecione...</option>
                      {field.options.map(opt => (
                        <option key={opt} value={opt} className="bg-gray-900">{opt}</option>
                      ))}
                    </select>
                  ) : (
                    <input
                      type={field.type || 'text'}
                      value={form[field.key] || ''}
                      onChange={e => setForm(prev => ({ ...prev, [field.key]: e.target.value }))}
                      className="input"
                      placeholder={field.label}
                    />
                  )}
                </div>
              ))}

              {/* Campo de categoria hierárquica — só aparece no módulo financeiro */}
              {isFinanceiro && token && (
                <div>
                  <label className="text-green-400 text-sm font-medium block mb-2">
                    Categoria Financeira
                  </label>
                  <CategoriaSeletor
                    token={token}
                    value={categoriaId}
                    onChange={(id) => setCategoriaId(id)}
                    tipoFiltro={
                      tipoAtual === 'receita' ? 'receita'
                      : tipoAtual === 'despesa' ? 'despesa'
                      : undefined
                    }
                    placeholder="Selecione a categoria financeira"
                  />
                </div>
              )}
            </div>

            <div className="flex gap-3 p-6 border-t border-[#243324]">
              <button onClick={() => setShowModal(false)} className="btn-secondary flex-1 justify-center">Cancelar</button>
              <button onClick={handleSave} disabled={saving} className="btn-primary flex-1 justify-center">
                {saving
                  ? <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  : 'Salvar'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

