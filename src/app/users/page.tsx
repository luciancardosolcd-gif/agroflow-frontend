'use client'
import { useEffect, useState } from 'react'
import api from '@/lib/api'
import { Plus, Trash2, Edit, Search, RefreshCw, X, Shield, UserCheck, UserX, Key, Calendar } from 'lucide-react'

const perfis = ['admin', 'gestor', 'operador', 'agronomo', 'visitante', 'produtor']

const perfilColor: Record<string, string> = {
  admin: 'bg-red-900/40 text-red-400 border-red-800',
  gestor: 'bg-blue-900/40 text-blue-400 border-blue-800',
  operador: 'bg-green-900/40 text-green-400 border-green-800',
  agronomo: 'bg-yellow-900/40 text-yellow-400 border-yellow-800',
  visitante: 'bg-gray-900/40 text-gray-400 border-gray-800',
  produtor: 'bg-orange-900/40 text-orange-400 border-orange-800',
}

export default function UsersPage() {
  const [items, setItems] = useState<Record<string, string>[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [filtroPerfil, setFiltroPerfil] = useState('')
  const [filtroStatus, setFiltroStatus] = useState('')
  const [showModal, setShowModal] = useState(false)
  const [editing, setEditing] = useState<Record<string, string> | null>(null)
  const [form, setForm] = useState<Record<string, string>>({})
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [showSenha, setShowSenha] = useState(false)

  const load = async () => {
    setLoading(true)
    try {
      const { data } = await api.get('/users')
      setItems(Array.isArray(data) ? data : [])
    } catch { setItems([]) }
    finally { setLoading(false) }
  }

  useEffect(() => { load() }, [])

  const openCreate = () => {
    setEditing(null)
    setForm({ perfil: 'operador', status: 'ativo', senha: '' })
    setShowSenha(false)
    setError('')
    setShowModal(true)
  }

  const openEdit = (item: Record<string, string>) => {
    setEditing(item)
    setForm({
      nome: item.nome,
      email: item.email,
      perfil: item.perfil,
      status: item.status,
      dataExpiracao: item.dataExpiracao ? item.dataExpiracao.split('T')[0] : '',
      novaSenha: '',
    })
    setShowSenha(false)
    setError('')
    setShowModal(true)
  }

  const handleSave = async () => {
  setSaving(true)
  setError('')
  try {
    if (editing) {
      const payload: Record<string, string> = {
        nome: form.nome,
        email: form.email,
        perfil: form.perfil,
        status: form.status,
      }
      if (form.dataExpiracao) payload.dataExpiracao = form.dataExpiracao
      if (form.novaSenha) payload.novaSenha = form.novaSenha
      await api.put(`/users/${editing.id}`, payload)
    } else {
      await api.post('/users', { ...form, senha: form.senha })
    }
    setShowModal(false)
    load()
  } catch (e: unknown) {
    const err = e as { response?: { data?: { message?: string } } }
    setError(err.response?.data?.message || 'Erro ao salvar')
  } finally { setSaving(false) }
}

  const handleDelete = async (id: string) => {
    if (!confirm('Confirmar exclusão do usuário?')) return
    try { await api.delete(`/users/${id}`); load() } catch {}
  }

  const handleToggleStatus = async (item: Record<string, string>) => {
    const novoStatus = item.status === 'ativo' ? 'inativo' : 'ativo'
    try { await api.put(`/users/${item.id}`, { status: novoStatus }); load() } catch {}
  }

  const filtered = items.filter(i => {
    const matchSearch = i.nome?.toLowerCase().includes(search.toLowerCase()) || i.email?.toLowerCase().includes(search.toLowerCase())
    const matchPerfil = filtroPerfil ? i.perfil === filtroPerfil : true
    const matchStatus = filtroStatus ? i.status === filtroStatus : true
    return matchSearch && matchPerfil && matchStatus
  })

  const contadores = perfis.reduce((acc, p) => {
    acc[p] = items.filter(i => i.perfil === p).length
    return acc
  }, {} as Record<string, number>)

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-green-100 flex items-center gap-3">
            <Shield className="w-7 h-7 text-pink-400" />
            Gerenciamento de Usuários
          </h1>
          <p className="text-green-600 mt-1">{items.length} usuário{items.length !== 1 ? 's' : ''} cadastrado{items.length !== 1 ? 's' : ''}</p>
        </div>
        <div className="flex gap-3">
          <button onClick={load} className="w-9 h-9 bg-[#1a251a] border border-[#243324] rounded-xl flex items-center justify-center text-green-600 hover:text-green-400">
            <RefreshCw className="w-4 h-4" />
          </button>
          <button onClick={openCreate} className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-500 text-white rounded-xl text-sm font-medium">
            <Plus className="w-4 h-4" /> Novo Usuário
          </button>
        </div>
      </div>

      {/* Contadores por perfil */}
      <div className="grid grid-cols-3 md:grid-cols-6 gap-3">
        {perfis.map(p => (
          <button key={p} onClick={() => setFiltroPerfil(filtroPerfil === p ? '' : p)}
            className={`p-3 rounded-xl border text-center transition-all ${filtroPerfil === p ? 'border-green-500 bg-green-900/20' : 'border-[#1e2e1e] bg-[#111811]'}`}>
            <div className={`text-xl font-bold ${perfilColor[p].split(' ')[1]}`}>{contadores[p] || 0}</div>
            <div className="text-xs text-green-600 capitalize mt-0.5">{p}</div>
          </button>
        ))}
      </div>

      {/* Filtros */}
      <div className="bg-[#111811] border border-[#1e2e1e] rounded-2xl p-4">
        <div className="flex items-center gap-3 flex-wrap">
          <div className="flex items-center gap-2 bg-[#1a251a] rounded-lg px-3 py-2 flex-1 min-w-48 border border-[#243324]">
            <Search className="w-4 h-4 text-green-600" />
            <input value={search} onChange={e => setSearch(e.target.value)}
              placeholder="Buscar por nome ou email..."
              className="bg-transparent text-sm text-green-300 placeholder-green-700 outline-none flex-1" />
          </div>
          <select value={filtroPerfil} onChange={e => setFiltroPerfil(e.target.value)}
            className="bg-[#1a251a] border border-[#243324] rounded-lg px-3 py-2 text-green-300 text-sm outline-none">
            <option value="">Todos os perfis</option>
            {perfis.map(p => <option key={p} value={p}>{p}</option>)}
          </select>
          <select value={filtroStatus} onChange={e => setFiltroStatus(e.target.value)}
            className="bg-[#1a251a] border border-[#243324] rounded-lg px-3 py-2 text-green-300 text-sm outline-none">
            <option value="">Todos os status</option>
            <option value="ativo">Ativo</option>
            <option value="inativo">Inativo</option>
          </select>
        </div>
      </div>

      {/* Tabela */}
      <div className="bg-[#111811] border border-[#1e2e1e] rounded-2xl overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-16">
            <div className="w-8 h-8 border-2 border-green-600 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-16 text-green-700">
            <div className="text-4xl mb-3">👥</div>
            <div>Nenhum usuário encontrado</div>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-[#243324] bg-[#0d160d]">
                  <th className="text-left py-3 px-4 text-green-600 font-medium">Nome</th>
                  <th className="text-left py-3 px-4 text-green-600 font-medium">Email</th>
                  <th className="text-left py-3 px-4 text-green-600 font-medium">Perfil</th>
                  <th className="text-left py-3 px-4 text-green-600 font-medium">Status</th>
                  <th className="text-left py-3 px-4 text-green-600 font-medium">Expiração</th>
                  <th className="text-left py-3 px-4 text-green-600 font-medium">Último acesso</th>
                  <th className="text-right py-3 px-4 text-green-600 font-medium">Ações</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((item) => (
                  <tr key={item.id} className="border-b border-[#1a251a] hover:bg-[#1a251a]/50 transition-colors">
                    <td className="py-3 px-4 text-green-200 font-medium">{item.nome}</td>
                    <td className="py-3 px-4 text-green-400 text-xs">{item.email}</td>
                    <td className="py-3 px-4">
                      <span className={`px-2 py-0.5 rounded-full text-xs font-medium border ${perfilColor[item.perfil] || 'bg-gray-900/40 text-gray-400 border-gray-800'}`}>
                        {item.perfil}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <span className={`px-2 py-0.5 rounded-full text-xs font-medium border ${item.status === 'ativo' ? 'bg-green-900/40 text-green-400 border-green-800' : 'bg-red-900/40 text-red-400 border-red-800'}`}>
                        {item.status}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-green-600 text-xs">
                      {item.dataExpiracao ? new Date(item.dataExpiracao).toLocaleDateString('pt-BR') : '—'}
                    </td>
                    <td className="py-3 px-4 text-green-600 text-xs">
                      {item.ultimoAcesso ? new Date(item.ultimoAcesso).toLocaleString('pt-BR') : 'Nunca'}
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center justify-end gap-2">
                        <button onClick={() => handleToggleStatus(item)}
                          title={item.status === 'ativo' ? 'Bloquear' : 'Ativar'}
                          className={`w-8 h-8 rounded-lg flex items-center justify-center transition-colors border ${item.status === 'ativo' ? 'bg-[#1a251a] hover:bg-red-900/40 text-green-600 hover:text-red-400 border-[#243324]' : 'bg-[#1a251a] hover:bg-green-900/40 text-red-500 hover:text-green-400 border-[#243324]'}`}>
                          {item.status === 'ativo' ? <UserX className="w-3.5 h-3.5" /> : <UserCheck className="w-3.5 h-3.5" />}
                        </button>
                        <button onClick={() => openEdit(item)}
                          className="w-8 h-8 bg-[#1a251a] hover:bg-green-900/40 rounded-lg flex items-center justify-center text-green-600 hover:text-green-400 transition-colors border border-[#243324]">
                          <Edit className="w-3.5 h-3.5" />
                        </button>
                        <button onClick={() => handleDelete(item.id)}
                          className="w-8 h-8 bg-[#1a251a] hover:bg-red-900/40 rounded-lg flex items-center justify-center text-green-600 hover:text-red-400 transition-colors border border-[#243324]">
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
          <div className="bg-[#111811] border border-[#243324] rounded-2xl w-full max-w-lg shadow-2xl">
            <div className="flex items-center justify-between p-6 border-b border-[#243324]">
              <h2 className="text-xl font-bold text-green-100">{editing ? 'Editar Usuário' : 'Novo Usuário'}</h2>
              <button onClick={() => setShowModal(false)} className="text-green-600 hover:text-green-400">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6 space-y-4 max-h-[70vh] overflow-y-auto">
              {error && <div className="bg-red-900/30 border border-red-800 text-red-400 rounded-lg px-4 py-3 text-sm">{error}</div>}
              <div>
                <label className="text-green-400 text-sm font-medium block mb-2">Nome *</label>
                <input value={form.nome || ''} onChange={e => setForm({...form, nome: e.target.value})}
                  className="w-full bg-[#1a251a] border border-[#243324] rounded-xl px-4 py-2 text-green-200 text-sm outline-none focus:border-green-600"
                  placeholder="Nome completo" />
              </div>
              <div>
                <label className="text-green-400 text-sm font-medium block mb-2">Email *</label>
                <input type="email" value={form.email || ''} onChange={e => setForm({...form, email: e.target.value})}
                  className="w-full bg-[#1a251a] border border-[#243324] rounded-xl px-4 py-2 text-green-200 text-sm outline-none focus:border-green-600"
                  placeholder="email@exemplo.com" />
              </div>
              {!editing && (
                <div>
                  <label className="text-green-400 text-sm font-medium block mb-2">Senha *</label>
                  <input type="password" value={form.senha || ''} onChange={e => setForm({...form, senha: e.target.value})}
                    className="w-full bg-[#1a251a] border border-[#243324] rounded-xl px-4 py-2 text-green-200 text-sm outline-none focus:border-green-600"
                    placeholder="Mínimo 6 caracteres" />
                </div>
              )}
              {editing && (
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="text-green-400 text-sm font-medium">Trocar Senha</label>
                    <button onClick={() => setShowSenha(!showSenha)}
                      className="flex items-center gap-1 text-xs text-green-600 hover:text-green-400">
                      <Key className="w-3 h-3" />
                      {showSenha ? 'Cancelar' : 'Alterar senha'}
                    </button>
                  </div>
                  {showSenha && (
                    <input type="password" value={form.novaSenha || ''} onChange={e => setForm({...form, novaSenha: e.target.value})}
                      className="w-full bg-[#1a251a] border border-[#243324] rounded-xl px-4 py-2 text-green-200 text-sm outline-none focus:border-green-600"
                      placeholder="Nova senha" />
                  )}
                </div>
              )}
              <div>
                <label className="text-green-400 text-sm font-medium block mb-2">Perfil</label>
                <select value={form.perfil || 'operador'} onChange={e => setForm({...form, perfil: e.target.value})}
                  className="w-full bg-[#1a251a] border border-[#243324] rounded-xl px-4 py-2 text-green-200 text-sm outline-none focus:border-green-600">
                  {perfis.map(p => <option key={p} value={p}>{p}</option>)}
                </select>
              </div>
              <div>
                <label className="text-green-400 text-sm font-medium block mb-2">Status</label>
                <select value={form.status || 'ativo'} onChange={e => setForm({...form, status: e.target.value})}
                  className="w-full bg-[#1a251a] border border-[#243324] rounded-xl px-4 py-2 text-green-200 text-sm outline-none focus:border-green-600">
                  <option value="ativo">Ativo</option>
                  <option value="inativo">Inativo</option>
                </select>
              </div>
              <div>
                <label className="text-green-400 text-sm font-medium block mb-2 flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5" /> Data de Expiração
                </label>
                <input type="date" value={form.dataExpiracao || ''} onChange={e => setForm({...form, dataExpiracao: e.target.value})}
                  className="w-full bg-[#1a251a] border border-[#243324] rounded-xl px-4 py-2 text-green-200 text-sm outline-none focus:border-green-600" />
                <p className="text-green-700 text-xs mt-1">Deixe em branco para acesso sem expiração</p>
              </div>
            </div>
            <div className="flex gap-3 p-6 border-t border-[#243324]">
              <button onClick={() => setShowModal(false)}
                className="flex-1 px-4 py-2 border border-[#243324] text-green-600 rounded-xl text-sm">
                Cancelar
              </button>
              <button onClick={handleSave} disabled={saving}
                className="flex-1 px-4 py-2 bg-green-600 hover:bg-green-500 text-white rounded-xl text-sm font-medium disabled:opacity-50 flex items-center justify-center gap-2">
                {saving ? <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> : 'Salvar'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
