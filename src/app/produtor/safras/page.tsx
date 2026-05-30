'use client'
import { useState, useEffect } from 'react'
import { Plus, Edit2, Trash2, Sprout, Calendar, TrendingUp, TrendingDown, DollarSign, BarChart3 } from 'lucide-react'
import api from '@/lib/api'
import Cookies from 'js-cookie'
import PainelCustoRealizado from '@/components/PainelCustoRealizado'
import { useSafraContext } from '@/lib/SafraContext'
import { useDashboardFinanceiro, PeriodoFiltro } from '../../financeiro/useDashboardFinanceiro'

const SUPER_ADMINS = ['luciancardoso@agroflow.com', 'admin01@agroflow.com']

const PERIODOS: { value: PeriodoFiltro; label: string }[] = [
  { value: 'MES_ATUAL', label: 'Mês Atual' },
  { value: 'MES_ANTERIOR', label: 'Mês Anterior' },
  { value: 'TRIMESTRE', label: 'Trimestre' },
  { value: 'ANO_ATUAL', label: 'Ano Atual' },
]

const formatCurrency = (value: number) =>
  new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value)

interface Propriedade {
  id: string
  nome: string
}

interface Safra {
  id: string
  nome: string
  cultura?: string
  ano?: string
  areaHectares?: number
  dataInicio?: string
  dataFim?: string
  status: string
  ativa: boolean
  propriedadeId?: string
  propriedade?: Propriedade
}

const STATUS_COLORS: Record<string, string> = {
  planejamento: 'text-yellow-400 bg-yellow-400/10 border-yellow-400/30',
  em_andamento: 'text-green-400 bg-green-400/10 border-green-400/30',
  finalizada: 'text-gray-400 bg-gray-400/10 border-gray-400/30',
}

const STATUS_LABELS: Record<string, string> = {
  planejamento: 'Planejamento',
  em_andamento: 'Em Andamento',
  finalizada: 'Finalizada',
}

function GraficoEvolucao({ dados }: { dados: { mes: string; receitas: number; despesas: number }[] }) {
  const max = Math.max(...dados.flatMap((d) => [d.receitas, d.despesas]), 1)
  return (
    <div className="flex items-end gap-3 h-32 mt-2">
      {dados.map((d) => (
        <div key={d.mes} className="flex-1 flex flex-col items-center gap-1">
          <div className="flex items-end gap-0.5 w-full h-24">
            <div title={`Receitas: ${formatCurrency(d.receitas)}`}
              className="flex-1 bg-emerald-500/70 rounded-t transition-all duration-700"
              style={{ height: `${(d.receitas / max) * 100}%` }} />
            <div title={`Despesas: ${formatCurrency(d.despesas)}`}
              className="flex-1 bg-red-500/70 rounded-t transition-all duration-700"
              style={{ height: `${(d.despesas / max) * 100}%` }} />
          </div>
          <span className="text-[10px] text-gray-500">{d.mes.slice(5)}</span>
        </div>
      ))}
      {dados.length === 0 && <p className="text-gray-500 text-sm w-full text-center">Sem dados no período</p>}
    </div>
  )
}

export default function SafrasPage() {
  const [safras, setSafras] = useState<Safra[]>([])
  const [propriedades, setPropriedades] = useState<Propriedade[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editing, setEditing] = useState<Safra | null>(null)
  const [periodo, setPeriodo] = useState<PeriodoFiltro>('MES_ATUAL')
  const [form, setForm] = useState({
    nome: '', cultura: '', ano: '', areaHectares: '',
    dataInicio: '', dataFim: '', status: 'planejamento', propriedadeId: ''
  })
  const [saving, setSaving] = useState(false)
  const [email, setEmail] = useState('')
  const [perfil, setPerfil] = useState('')
  const { propriedadeId, safraId } = useSafraContext()
  const { data, loading: loadingFin } = useDashboardFinanceiro(periodo, propriedadeId, safraId)
  const resumo = data?.resumo
  const evolucao = data?.evolucaoMensal ?? []

  useEffect(() => {
    const u = Cookies.get('user')
    if (u) {
      const parsed = JSON.parse(u)
      setEmail(parsed.email || '')
      setPerfil(parsed.perfil || '')
    }
  }, [])

  const isSuperAdmin = SUPER_ADMINS.includes(email)
  const isAdmin = perfil === 'admin'
  const canCreate = isAdmin || isSuperAdmin
  const canEdit = isAdmin || isSuperAdmin
  const canDelete = isSuperAdmin

  const load = async () => {
    setLoading(true)
    try {
      const [safrasRes, propsRes] = await Promise.all([
        api.get('/safras'),
        api.get('/propriedades'),
      ])
      setSafras(safrasRes.data)
      setPropriedades(propsRes.data)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, [])

  const openNew = () => {
    setEditing(null)
    setForm({ nome: '', cultura: '', ano: '', areaHectares: '', dataInicio: '', dataFim: '', status: 'planejamento', propriedadeId: '' })
    setShowForm(true)
  }

  const openEdit = (s: Safra) => {
    setEditing(s)
    setForm({
      nome: s.nome,
      cultura: s.cultura || '',
      ano: s.ano || '',
      areaHectares: s.areaHectares ? String(s.areaHectares) : '',
      dataInicio: s.dataInicio ? s.dataInicio.split('T')[0] : '',
      dataFim: s.dataFim ? s.dataFim.split('T')[0] : '',
      status: s.status || 'planejamento',
      propriedadeId: s.propriedadeId || '',
    })
    setShowForm(true)
  }

  const handleSave = async () => {
    if (!form.nome) return
    setSaving(true)
    try {
      const payload = {
        ...form,
        areaHectares: form.areaHectares ? parseFloat(form.areaHectares) : null,
        propriedadeId: form.propriedadeId || null,
      }
      if (editing) {
        await api.put(`/safras/${editing.id}`, payload)
      } else {
        await api.post('/safras', payload)
      }
      setShowForm(false)
      load()
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Excluir esta safra?')) return
    await api.delete(`/safras/${id}`)
    load()
  }

  return (
    <div className="space-y-6">

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-green-100 flex items-center gap-2">
            <Sprout className="w-6 h-6 text-green-400" />
            Safras & Custos
          </h1>
          <p className="text-green-600 text-sm mt-1">Gerencie suas safras e acompanhe custos realizados</p>
        </div>
        <div className="flex items-center gap-3">
          <select value={periodo} onChange={(e) => setPeriodo(e.target.value as PeriodoFiltro)}
            className="bg-white/5 border border-white/10 text-white text-sm rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500/50">
            {PERIODOS.map((p) => (
              <option key={p.value} value={p.value} className="bg-gray-900">{p.label}</option>
            ))}
          </select>
          {canCreate && (
            <button onClick={openNew} className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-500 text-white rounded-xl text-sm font-medium transition-colors">
              <Plus className="w-4 h-4" /> Nova Safra
            </button>
          )}
        </div>
      </div>

      {/* ── 1. KPIs — padding reduzido igual ao Financeiro ── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="rounded-2xl p-4 border border-emerald-500/20 bg-emerald-500/5 flex flex-col gap-2">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-gray-400">Receitas</span>
            <div className="p-1.5 rounded-xl bg-white/5"><TrendingUp className="w-4 h-4 text-emerald-400" /></div>
          </div>
          <p className="text-xl font-bold text-white">{loadingFin ? '...' : formatCurrency(resumo?.totalReceitas ?? 0)}</p>
        </div>
        <div className="rounded-2xl p-4 border border-red-500/20 bg-red-500/5 flex flex-col gap-2">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-gray-400">Despesas</span>
            <div className="p-1.5 rounded-xl bg-white/5"><TrendingDown className="w-4 h-4 text-red-400" /></div>
          </div>
          <p className="text-xl font-bold text-white">{loadingFin ? '...' : formatCurrency(resumo?.totalDespesas ?? 0)}</p>
        </div>
        <div className="rounded-2xl p-4 border border-blue-500/20 bg-blue-500/5 flex flex-col gap-2">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-gray-400">Saldo</span>
            <div className="p-1.5 rounded-xl bg-white/5"><DollarSign className="w-4 h-4 text-blue-400" /></div>
          </div>
          <p className="text-xl font-bold text-white">{loadingFin ? '...' : formatCurrency(resumo?.saldo ?? 0)}</p>
        </div>
        <div className="rounded-2xl p-4 border border-purple-500/20 bg-purple-500/5 flex flex-col gap-2">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-gray-400">Margem</span>
            <div className="p-1.5 rounded-xl bg-white/5"><BarChart3 className="w-4 h-4 text-purple-400" /></div>
          </div>
          <p className="text-xl font-bold text-white">{loadingFin ? '...' : `${resumo?.margemLucro ?? 0}%`}</p>
        </div>
      </div>

      {/* ── 2. Custo Realizado (subiu para antes da Evolução Mensal) ── */}
      <PainelCustoRealizado fazendaId={propriedadeId} safraId={safraId} />

      {/* ── 3. Evolução Mensal (desceu para depois do Custo Realizado) ── */}
      <div className="rounded-2xl border border-white/10 bg-white/3 p-5">
        <h3 className="text-sm font-semibold text-gray-300 mb-1">Evolução Mensal</h3>
        <div className="flex gap-4 mb-3">
          <span className="flex items-center gap-1 text-xs text-gray-400">
            <span className="w-2 h-2 rounded-sm bg-emerald-500 inline-block" /> Receitas
          </span>
          <span className="flex items-center gap-1 text-xs text-gray-400">
            <span className="w-2 h-2 rounded-sm bg-red-500 inline-block" /> Despesas
          </span>
        </div>
        {loadingFin ? (
          <div className="h-32 flex items-center justify-center text-gray-500 text-sm">Carregando...</div>
        ) : (
          <GraficoEvolucao dados={evolucao} />
        )}
      </div>

      {/* Formulário */}
      {showForm && (
        <div className="bg-[#111811] border border-[#1e2e1e] rounded-2xl p-6 space-y-4">
          <h2 className="text-green-200 font-semibold">{editing ? 'Editar Safra' : 'Nova Safra'}</h2>
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2">
              <label className="text-green-400 text-sm block mb-1">Nome *</label>
              <input value={form.nome} onChange={e => setForm(p => ({ ...p, nome: e.target.value }))}
                placeholder="Ex: Safra Soja 25/26"
                className="w-full bg-[#1a251a] border border-[#243324] rounded-xl px-4 py-2 text-green-200 text-sm outline-none focus:border-green-600" />
            </div>
            <div>
              <label className="text-green-400 text-sm block mb-1">Cultura</label>
              <input value={form.cultura} onChange={e => setForm(p => ({ ...p, cultura: e.target.value }))}
                placeholder="Ex: Soja, Milho, Sorgo"
                className="w-full bg-[#1a251a] border border-[#243324] rounded-xl px-4 py-2 text-green-200 text-sm outline-none focus:border-green-600" />
            </div>
            <div>
              <label className="text-green-400 text-sm block mb-1">Ano</label>
              <input value={form.ano} onChange={e => setForm(p => ({ ...p, ano: e.target.value }))}
                placeholder="Ex: 2025/2026"
                className="w-full bg-[#1a251a] border border-[#243324] rounded-xl px-4 py-2 text-green-200 text-sm outline-none focus:border-green-600" />
            </div>
            <div>
              <label className="text-green-400 text-sm block mb-1">Área (ha)</label>
              <input type="number" value={form.areaHectares} onChange={e => setForm(p => ({ ...p, areaHectares: e.target.value }))}
                className="w-full bg-[#1a251a] border border-[#243324] rounded-xl px-4 py-2 text-green-200 text-sm outline-none focus:border-green-600" />
            </div>
            <div>
              <label className="text-green-400 text-sm block mb-1">Status</label>
              <select value={form.status} onChange={e => setForm(p => ({ ...p, status: e.target.value }))}
                className="w-full bg-[#1a251a] border border-[#243324] rounded-xl px-4 py-2 text-green-200 text-sm outline-none focus:border-green-600">
                <option value="planejamento">Planejamento</option>
                <option value="em_andamento">Em Andamento</option>
                <option value="finalizada">Finalizada</option>
              </select>
            </div>
            <div>
              <label className="text-green-400 text-sm block mb-1">Propriedade</label>
              <select value={form.propriedadeId} onChange={e => setForm(p => ({ ...p, propriedadeId: e.target.value }))}
                className="w-full bg-[#1a251a] border border-[#243324] rounded-xl px-4 py-2 text-green-200 text-sm outline-none focus:border-green-600">
                <option value="">Selecione a propriedade</option>
                {propriedades.map(p => (
                  <option key={p.id} value={p.id}>{p.nome}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-green-400 text-sm block mb-1">Data Início</label>
              <input type="date" value={form.dataInicio} onChange={e => setForm(p => ({ ...p, dataInicio: e.target.value }))}
                className="w-full bg-[#1a251a] border border-[#243324] rounded-xl px-4 py-2 text-green-200 text-sm outline-none focus:border-green-600" />
            </div>
            <div>
              <label className="text-green-400 text-sm block mb-1">Data Fim</label>
              <input type="date" value={form.dataFim} onChange={e => setForm(p => ({ ...p, dataFim: e.target.value }))}
                className="w-full bg-[#1a251a] border border-[#243324] rounded-xl px-4 py-2 text-green-200 text-sm outline-none focus:border-green-600" />
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

      {/* Lista de safras */}
      <div>
        <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-widest mb-4">Safras Cadastradas</h2>
        {loading ? (
          <div className="flex justify-center py-12">
            <div className="w-8 h-8 border-2 border-green-500 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : safras.length === 0 ? (
          <div className="text-center py-12 text-green-700">
            <Sprout className="w-12 h-12 mx-auto mb-3 opacity-30" />
            <p>Nenhuma safra cadastrada</p>
            {canCreate && <p className="text-sm mt-1">Clique em "Nova Safra" para começar</p>}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {safras.map(s => (
              <div key={s.id} className="bg-[#111811] border border-[#1e2e1e] rounded-2xl p-5 space-y-3">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="text-green-100 font-semibold">{s.nome}</h3>
                    {s.propriedade && <p className="text-green-600 text-xs mt-0.5">{s.propriedade.nome}</p>}
                  </div>
                  <div className="flex gap-2">
                    {canEdit && (
                      <button onClick={() => openEdit(s)} className="p-1.5 text-green-600 hover:text-green-400">
                        <Edit2 className="w-4 h-4" />
                      </button>
                    )}
                    {canDelete && (
                      <button onClick={() => handleDelete(s.id)} className="p-1.5 text-red-600 hover:text-red-400">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-2 flex-wrap">
                  {s.cultura && <span className="text-xs px-2 py-0.5 bg-green-900/30 text-green-400 rounded-full border border-green-800/40">{s.cultura}</span>}
                  {s.ano && <span className="text-xs px-2 py-0.5 bg-blue-900/30 text-blue-400 rounded-full border border-blue-800/40">{s.ano}</span>}
                  <span className={`text-xs px-2 py-0.5 rounded-full border ${STATUS_COLORS[s.status] || STATUS_COLORS.planejamento}`}>
                    {STATUS_LABELS[s.status] || s.status}
                  </span>
                </div>
                {s.areaHectares && (
                  <p className="text-green-600 text-xs">{Number(s.areaHectares).toLocaleString('pt-BR')} ha</p>
                )}
                {(s.dataInicio || s.dataFim) && (
                  <div className="flex items-center gap-1 text-green-700 text-xs">
                    <Calendar className="w-3 h-3" />
                    {s.dataInicio ? new Date(s.dataInicio).toLocaleDateString('pt-BR') : '?'}
                    {' → '}
                    {s.dataFim ? new Date(s.dataFim).toLocaleDateString('pt-BR') : '?'}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
