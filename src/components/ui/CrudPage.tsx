'use client'
import { useEffect, useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import api from '@/lib/api'
import Cookies from 'js-cookie'
import { Plus, Trash2, Edit, Search, RefreshCw } from 'lucide-react'

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
  fazendaId?: string
  safraId?: string
}

export default function CrudPage({
  title, endpoint, fields, icon, fazendaId, safraId
}: CrudPageProps) {
  const router = useRouter()
  const [items, setItems] = useState<Record<string, unknown>[]>([])
  const [loading, setLoading] = useState(false)
  const [search, setSearch] = useState('')

  const [perfil, setPerfil] = useState<string>(() => {
    try { const u = Cookies.get('user'); return u ? JSON.parse(u).perfil || '' : '' }
    catch { return '' }
  })
  const [permissoes, setPermissoes] = useState<Record<string, any>>(() => {
    try { const u = Cookies.get('user'); return u ? JSON.parse(u).permissoes || {} : {} }
    catch { return {} }
  })

  useEffect(() => {
    try {
      const u = Cookies.get('user')
      if (u) {
        const parsed = JSON.parse(u)
        setPerfil(parsed.perfil || '')
        setPermissoes(parsed.permissoes || {})
      }
    } catch {}
  }, [])

  const getModulo = () => {
    if (endpoint.includes('financeiro'))   return 'financeiro'
    if (endpoint.includes('clientes'))     return 'clientes'
    if (endpoint.includes('contratos'))    return 'contratos'
    if (endpoint.includes('estoque'))      return 'estoque'
    if (endpoint.includes('fornecedores')) return 'fornecedores'
    if (endpoint.includes('maquinarios'))  return 'maquinarios'
    if (endpoint.includes('documentos'))   return 'documentos'
    if (endpoint.includes('produtor'))     return 'produtor'
    return null
  }

  const modulo  = getModulo()
  const isAdmin = perfil === 'admin'
  const perm    = modulo ? (permissoes[modulo] || {}) : {}

  const canCreate = isAdmin || perm.criar   === true
  const canEdit   = isAdmin || perm.editar  === true
  const canDelete = isAdmin || perm.deletar === true

  const isFinanceiro = endpoint.includes('financeiro')

  // Usa refs para sempre ter os valores mais recentes
  const fazendaRef  = useRef(fazendaId)
  const safraRef    = useRef(safraId)
  const endpointRef = useRef(endpoint)
  fazendaRef.current  = fazendaId
  safraRef.current    = safraId
  endpointRef.current = endpoint

  const load = async () => {
    const fId = fazendaRef.current
    const sId = safraRef.current
    const ep  = endpointRef.current

    let url = ep
    const params: string[] = []
    if (fId && fId !== '') params.push(`fazendaId=${fId}`)
    if (sId && sId !== '') params.push(`safraId=${sId}`)
    if (params.length > 0) url += `?${params.join('&')}`

    console.log('📡 CrudPage load URL:', url)

    setLoading(true)
    try {
      const { data } = await api.get(url)
      setItems(Array.isArray(data) ? data : [])
    } catch (e) {
      console.error('❌ CrudPage load error:', e)
      setItems([])
    } finally {
      setLoading(false)
    }
  }

  // ── CORREÇÃO: dispara load SEMPRE que fazendaId ou safraId mudam
  // Inclusive na montagem inicial (sem fazenda = busca todos)
  useEffect(() => {
    load()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fazendaId, safraId, endpoint])

  const handleNew = () => {
    if (isFinanceiro) router.push('/financeiro/novo')
  }

  const handleEdit = (item: Record<string, unknown>) => {
    if (isFinanceiro) router.push(`/financeiro/editar/${item.id}`)
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

  const renderCell = (item: Record<string, unknown>, f: FieldDef) => {
    const val = String(item[f.key] || '-')

    if (f.key === 'tipo') {
      return (
        <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
          val === 'RECEITA' ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'
        }`}>{val}</span>
      )
    }

    if (f.key === 'status') {
      const colors: Record<string, string> = {
        pago:        'bg-green-500/20 text-green-400',
        pendente:    'bg-yellow-500/20 text-yellow-400',
        'Em Aberto': 'bg-blue-500/20 text-blue-400',
      }
      return (
        <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${colors[val] || 'bg-gray-500/20 text-gray-400'}`}>
          {val}
        </span>
      )
    }

    if (f.key === 'valor') {
      const num = parseFloat(val)
      if (!isNaN(num)) {
        return (
          <span className={item['tipo'] === 'RECEITA' ? 'text-green-400 font-medium' : 'text-red-400 font-medium'}>
            {item['tipo'] === 'RECEITA' ? '+' : '-'}
            {num.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
          </span>
        )
      }
    }

    if ((f.type === 'date' || f.key === 'data' || f.key === 'dataVencimento') && val && val !== '-') {
      const date = new Date(val)
      if (!isNaN(date.getTime())) {
        return <span className="truncate block max-w-[200px]">{date.toLocaleDateString('pt-BR')}</span>
      }
    }

    return <span className="truncate block max-w-[200px]">{val}</span>
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-3xl text-green-100 flex items-center gap-3">{icon}{title}</h1>
          <p className="text-green-600 mt-1">
            {items.length} registro{items.length !== 1 ? 's' : ''} encontrado{items.length !== 1 ? 's' : ''}
          </p>
        </div>
        <div className="flex gap-3">
          <button onClick={load} className="btn-secondary"><RefreshCw className="w-4 h-4" /></button>
          {canCreate && (
            <button onClick={handleNew} className="btn-primary">
              <Plus className="w-4 h-4" />Novo
            </button>
          )}
        </div>
      </div>

      <div className="card">
        <div className="flex items-center gap-3 bg-[#1a251a] rounded-lg px-4 py-2.5 mb-6 border border-[#243324]">
          <Search className="w-4 h-4 text-green-600" />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder={`Buscar em ${title.toLowerCase()}...`}
            className="bg-transparent text-sm text-green-300 placeholder-green-700 outline-none flex-1"
          />
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
                  <tr
                    key={String(item.id || i)}
                    className="border-b border-[#1a251a] hover:bg-[#1a251a]/50 transition-colors cursor-pointer"
                    onClick={() => canEdit && handleEdit(item)}
                  >
                    {displayFields.map(f => (
                      <td key={f.key} className="py-3 px-4 text-green-300">
                        {renderCell(item, f)}
                      </td>
                    ))}
                    {(canEdit || canDelete) && (
                      <td className="py-3 px-4" onClick={e => e.stopPropagation()}>
                        <div className="flex items-center justify-end gap-2">
                          {canEdit && (
                            <button
                              onClick={() => handleEdit(item)}
                              className="w-8 h-8 bg-[#1a251a] hover:bg-green-900/40 rounded-lg flex items-center justify-center text-green-600 hover:text-green-400 transition-colors border border-[#243324]"
                            >
                              <Edit className="w-3.5 h-3.5" />
                            </button>
                          )}
                          {canDelete && (
                            <button
                              onClick={() => handleDelete(item.id)}
                              className="w-8 h-8 bg-[#1a251a] hover:bg-red-900/40 rounded-lg flex items-center justify-center text-green-600 hover:text-red-400 transition-colors border border-[#243324]"
                            >
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
    </div>
  )
}
