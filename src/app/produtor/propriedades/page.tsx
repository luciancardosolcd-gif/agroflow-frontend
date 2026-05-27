'use client'
import { useState, useEffect } from 'react'
import { Plus, Edit2, Trash2, MapPin, Ruler } from 'lucide-react'
import api from '@/lib/api'
import Cookies from 'js-cookie'

const SUPER_ADMINS = ['luciancardoso@agroflow.com', 'admin01@agroflow.com']

interface Propriedade {
  id: string
  nome: string
  descricao?: string
  areaTotal?: number
  cidade?: string
  estado?: string
  endereco?: string
  ativa: boolean
}

export default function PropriedadesPage() {
  const [propriedades, setPropriedades] = useState<Propriedade[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editing, setEditing] = useState<Propriedade | null>(null)
  const [form, setForm] = useState({
    nome: '', descricao: '', areaTotal: '', cidade: '', estado: '', endereco: ''
  })
  const [saving, setSaving] = useState(false)
  const [email, setEmail] = useState('')

  useEffect(() => {
    const u = Cookies.get('user')
    if (u) setEmail(JSON.parse(u).email || '')
  }, [])

  const isSuperAdmin = SUPER_ADMINS.includes(email)
  const canCreate = isSuperAdmin
  const canDelete = isSuperAdmin

  const load = async () => {
    setLoading(true)
    try {
      const r = await api.get('/propriedades')
      setPropriedades(r.data)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, [])

  const openNew = () => {
    setEditing(null)
    setForm({ nome: '', descricao: '', areaTotal: '', cidade: '', estado: '', endereco: '' })
    setShowForm(true)
  }

  const openEdit = (p: Propriedade) => {
    setEditing(p)
    setForm({
      nome: p.nome,
      descricao: p.descricao || '',
      areaTotal: p.areaTotal ? String(p.areaTotal) : '',
      cidade: p.cidade || '',
      estado: p.estado || '',
      endereco: p.endereco || '',
    })
    setShowForm(true)
  }

  const handleSave = async () => {
    if (!form.nome) return
    setSaving(true)
    try {
      const payload = { ...form, areaTotal: form.areaTotal ? parseFloat(form.areaTotal) : null }
      if (editing) {
        await api.put(`/propriedades/${editing.id}`, payload)
      } else {
        await api.post('/propriedades', payload)
      }
      setShowForm(false)
      load()
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Excluir esta propriedade?')) return
    await api.delete(`/propriedades/${id}`)
    load()
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-green-100 flex items-center gap-2">
            <MapPin className="w-6 h-6 text-green-400" />
            Propriedades
          </h1>
          <p className="text-green-600 text-sm mt-1">Gerencie suas fazendas e propriedades rurais</p>
        </div>
        {canCreate && (
          <button onClick={openNew} className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-500 text-white rounded-xl text-sm font-medium transition-colors">
            <Plus className="w-4 h-4" /> Nova Propriedade
          </button>
        )}
      </div>

      {showForm && (
        <div className="bg-[#111811] border border-[#1e2e1e] rounded-2xl p-6 space-y-4">
          <h2 className="text-green-200 font-semibold">{editing ? 'Editar Propriedade' : 'Nova Propriedade'}</h2>
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2">
              <label className="text-green-400 text-sm block mb-1">Nome *</label>
              <input value={form.nome} onChange={e => setForm(p => ({ ...p, nome: e.target.value }))}
                className="w-full bg-[#1a251a] border border-[#243324] rounded-xl px-4 py-2 text-green-200 text-sm outline-none focus:border-green-600" />
            </div>
            <div>
              <label className="text-green-400 text-sm block mb-1">Área Total (ha)</label>
              <input type="number" value={form.areaTotal} onChange={e => setForm(p => ({ ...p, areaTotal: e.target.value }))}
                className="w-full bg-[#1a251a] border border-[#243324] rounded-xl px-4 py-2 text-green-200 text-sm outline-none focus:border-green-600" />
            </div>
            <div>
              <label className="text-green-400 text-sm block mb-1">Estado</label>
              <input value={form.estado} onChange={e => setForm(p => ({ ...p, estado: e.target.value }))}
                className="w-full bg-[#1a251a] border border-[#243324] rounded-xl px-4 py-2 text-green-200 text-sm outline-none focus:border-green-600" />
            </div>
            <div>
              <label className="text-green-400 text-sm block mb-1">Cidade</label>
              <input value={form.cidade} onChange={e => setForm(p => ({ ...p, cidade: e.target.value }))}
                className="w-full bg-[#1a251a] border border-[#243324] rounded-xl px-4 py-2 text-green-200 text-sm outline-none focus:border-green-600" />
            </div>
            <div>
              <label className="text-green-400 text-sm block mb-1">Endereço</label>
              <input value={form.endereco} onChange={e => setForm(p => ({ ...p, endereco: e.target.value }))}
                className="w-full bg-[#1a251a] border border-[#243324] rounded-xl px-4 py-2 text-green-200 text-sm outline-none focus:border-green-600" />
            </div>
            <div className="col-span-2">
              <label className="text-green-400 text-sm block mb-1">Descrição</label>
              <textarea value={form.descricao} onChange={e => setForm(p => ({ ...p, descricao: e.target.value }))} rows={2}
                className="w-full bg-[#1a251a] border border-[#243324] rounded-xl px-4 py-2 text-green-200 text-sm outline-none focus:border-green-600 resize-none" />
            </div>
          </div>
          <div className="flex gap-3">
            <button onClick={() => setShowForm(false)} className="px-4 py-2 border border-[#243324] text-green-600 rounded-xl text-sm">Cancelar</button>
            <button onClick={handleSave} disabled={saving} className="px-6 py-2 bg-green-600 hover:bg-green-500 text-white rounded-xl text-sm font-medium disabled:opacity-50">
              {saving ? 'Salvando...' : 'Salvar'}
            </button>
          </div>
        </div>
      )}

      {loading ? (
        <div className="flex justify-center py-12">
          <div className="w-8 h-8 border-2 border-green-500 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : propriedades.length === 0 ? (
        <div className="text-center py-12 text-green-700">
          <MapPin className="w-12 h-12 mx-auto mb-3 opacity-30" />
          <p>Nenhuma propriedade cadastrada</p>
          {canCreate && <p className="text-sm mt-1">Clique em "Nova Propriedade" para começar</p>}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {propriedades.map(p => (
            <div key={p.id} className="bg-[#111811] border border-[#1e2e1e] rounded-2xl p-5 space-y-3">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="text-green-100 font-semibold">{p.nome}</h3>
                  {p.cidade && <p className="text-green-600 text-xs mt-0.5">{p.cidade}{p.estado ? `, ${p.estado}` : ''}</p>}
                </div>
                <div className="flex gap-2">
                  <button onClick={() => openEdit(p)} className="p-1.5 text-green-600 hover:text-green-400">
                    <Edit2 className="w-4 h-4" />
                  </button>
                  {canDelete && (
                    <button onClick={() => handleDelete(p.id)} className="p-1.5 text-red-600 hover:text-red-400">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>
              {p.areaTotal && (
                <div className="flex items-center gap-1.5 text-green-500 text-sm">
                  <Ruler className="w-3.5 h-3.5" />
                  {Number(p.areaTotal).toLocaleString('pt-BR')} ha
                </div>
              )}
              {p.descricao && <p className="text-green-700 text-xs">{p.descricao}</p>}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
