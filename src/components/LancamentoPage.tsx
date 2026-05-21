'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowLeft, Save, DollarSign, Calendar, Tag, FileText, TrendingUp, TrendingDown, CheckCircle, Clock, AlertCircle } from 'lucide-react'
import api from '@/lib/api'
import CategoriaSeletor from '@/components/CategoriaSeletor'
import Cookies from 'js-cookie'

interface LancamentoPageProps {
  id?: string // se vier id, é edição
}

const STATUS_OPTIONS = [
  { value: 'pago', label: 'Pago', icon: CheckCircle, color: 'text-green-400 bg-green-400/10 border-green-400/30' },
  { value: 'pendente', label: 'Pendente', icon: Clock, color: 'text-yellow-400 bg-yellow-400/10 border-yellow-400/30' },
  { value: 'Em Aberto', label: 'Em Aberto', icon: AlertCircle, color: 'text-blue-400 bg-blue-400/10 border-blue-400/30' },
]

export default function LancamentoPage({ id }: LancamentoPageProps) {
  const router = useRouter()
  const isEdit = !!id

  const [token, setToken] = useState('')
  const [saving, setSaving] = useState(false)
  const [loading, setLoading] = useState(isEdit)
  const [error, setError] = useState('')

  const [form, setForm] = useState({
    descricao: '',
    valor: '',
    tipo: 'DESPESA' as 'RECEITA' | 'DESPESA',
    data: new Date().toISOString().split('T')[0],
    dataVencimento: '',
    status: 'pendente',
    observacao: '',
    financial_category_id: '',
  })

  useEffect(() => {
    const t = Cookies.get('accessToken') || ''
    setToken(t)

    if (isEdit) {
      api.get(`/financeiro/${id}`)
        .then(r => {
          const d = r.data
          setForm({
            descricao: d.descricao || '',
            valor: String(d.valor || ''),
            tipo: d.tipo || 'DESPESA',
            data: d.data ? d.data.split('T')[0] : '',
            dataVencimento: d.dataVencimento ? d.dataVencimento.split('T')[0] : '',
            status: d.status || 'pendente',
            observacao: d.observacao || '',
            financial_category_id: d.financial_category_id || '',
          })
        })
        .catch(() => setError('Erro ao carregar lançamento'))
        .finally(() => setLoading(false))
    }
  }, [id, isEdit])

  const set = (key: string, value: string) =>
    setForm(prev => ({ ...prev, [key]: value }))

  const handleSave = async () => {
    if (!form.descricao || !form.valor) {
      setError('Preencha descrição e valor')
      return
    }
    setSaving(true)
    setError('')
    try {
      const payload = {
        ...form,
        valor: parseFloat(form.valor.replace(',', '.')),
        financial_category_id: form.financial_category_id || null,
      }
      if (isEdit) {
        await api.put(`/financeiro/${id}`, payload)
      } else {
        await api.post('/financeiro', payload)
      }
      router.push('/financeiro')
    } catch (e: unknown) {
      const err = e as { response?: { data?: { message?: string } } }
      setError(err.response?.data?.message || 'Erro ao salvar')
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="w-8 h-8 border-2 border-green-500 border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#0a0f0a]">
      {/* ── Header fixo ── */}
      <div className="sticky top-0 z-10 bg-[#0d120d]/95 backdrop-blur border-b border-[#1e2e1e] px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button
            onClick={() => router.push('/financeiro')}
            className="flex items-center gap-2 text-green-600 hover:text-green-400 transition-colors text-sm"
          >
            <ArrowLeft className="w-4 h-4" />
            Voltar
          </button>
          <div className="h-5 w-px bg-[#1e2e1e]" />
          <h1 className="text-white font-semibold text-lg">
            {isEdit ? 'Editar Lançamento' : 'Novo Lançamento'}
          </h1>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => router.push('/financeiro')}
            className="px-4 py-2 text-sm text-green-600 hover:text-green-400 transition-colors"
          >
            Cancelar
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            className="flex items-center gap-2 px-5 py-2 bg-green-600 hover:bg-green-500 text-white text-sm font-medium rounded-lg transition-colors disabled:opacity-50"
          >
            {saving
              ? <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              : <Save className="w-4 h-4" />
            }
            {isEdit ? 'Salvar alterações' : 'Criar lançamento'}
          </button>
        </div>
      </div>

      {/* ── Conteúdo ── */}
      <div className="max-w-3xl mx-auto px-6 py-8 space-y-6">

        {error && (
          <div className="bg-red-900/30 border border-red-800 text-red-400 rounded-xl px-4 py-3 text-sm">
            {error}
          </div>
        )}

        {/* ── Tipo de operação ── */}
        <div className="bg-[#111811] border border-[#1e2e1e] rounded-2xl p-6">
          <p className="text-xs text-green-700 uppercase tracking-widest mb-4">Tipo de operação financeira</p>
          <div className="grid grid-cols-2 gap-3">
            {(['RECEITA', 'DESPESA'] as const).map(t => (
              <button
                key={t}
                onClick={() => set('tipo', t)}
                className={`flex items-center gap-3 p-4 rounded-xl border-2 transition-all ${
                  form.tipo === t
                    ? t === 'RECEITA'
                      ? 'border-green-500 bg-green-500/10 text-green-400'
                      : 'border-red-500 bg-red-500/10 text-red-400'
                    : 'border-[#243324] text-green-700 hover:border-green-700'
                }`}
              >
                {t === 'RECEITA'
                  ? <TrendingUp className="w-5 h-5" />
                  : <TrendingDown className="w-5 h-5" />
                }
                <span className="font-medium">{t === 'RECEITA' ? 'Receita' : 'Despesa'}</span>
              </button>
            ))}
          </div>
        </div>

        {/* ── Informações gerais ── */}
        <div className="bg-[#111811] border border-[#1e2e1e] rounded-2xl p-6 space-y-5">
          <p className="text-xs text-green-700 uppercase tracking-widest">Informações gerais</p>

          {/* Descrição */}
          <div>
            <label className="text-green-400 text-sm font-medium block mb-2">
              <FileText className="w-3.5 h-3.5 inline mr-1.5" />
              Descrição <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={form.descricao}
              onChange={e => set('descricao', e.target.value)}
              placeholder="Ex: Compra de insumos agrícolas"
              className="w-full bg-[#1a251a] border border-[#243324] rounded-xl px-4 py-3 text-green-200 placeholder-green-800 text-sm outline-none focus:border-green-600 transition-colors"
            />
          </div>

          {/* Data + Valor lado a lado */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-green-400 text-sm font-medium block mb-2">
                <Calendar className="w-3.5 h-3.5 inline mr-1.5" />
                Data do lançamento <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                value={form.data}
                onChange={e => set('data', e.target.value)}
                className="w-full bg-[#1a251a] border border-[#243324] rounded-xl px-4 py-3 text-green-200 text-sm outline-none focus:border-green-600 transition-colors"
              />
            </div>
            <div>
              <label className="text-green-400 text-sm font-medium block mb-2">
                <Calendar className="w-3.5 h-3.5 inline mr-1.5" />
                Data de vencimento
              </label>
              <input
                type="date"
                value={form.dataVencimento}
                onChange={e => set('dataVencimento', e.target.value)}
                className="w-full bg-[#1a251a] border border-[#243324] rounded-xl px-4 py-3 text-green-200 text-sm outline-none focus:border-green-600 transition-colors"
              />
            </div>
          </div>

          {/* Observação */}
          <div>
            <label className="text-green-400 text-sm font-medium block mb-2">
              Observação
            </label>
            <textarea
              value={form.observacao}
              onChange={e => set('observacao', e.target.value)}
              placeholder="Observações adicionais..."
              rows={2}
              className="w-full bg-[#1a251a] border border-[#243324] rounded-xl px-4 py-3 text-green-200 placeholder-green-800 text-sm outline-none focus:border-green-600 transition-colors resize-none"
            />
          </div>
        </div>

        {/* ── Valores ── */}
        <div className="bg-[#111811] border border-[#1e2e1e] rounded-2xl p-6 space-y-5">
          <p className="text-xs text-green-700 uppercase tracking-widest">Valores</p>

          <div>
            <label className="text-green-400 text-sm font-medium block mb-2">
              <DollarSign className="w-3.5 h-3.5 inline mr-1.5" />
              Valor (R$) <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-green-600 text-sm font-medium">R$</span>
              <input
                type="number"
                step="0.01"
                min="0"
                value={form.valor}
                onChange={e => set('valor', e.target.value)}
                placeholder="0,00"
                className="w-full bg-[#1a251a] border border-[#243324] rounded-xl pl-10 pr-4 py-3 text-green-200 placeholder-green-800 text-sm outline-none focus:border-green-600 transition-colors"
              />
            </div>
          </div>

          {/* Status de pagamento */}
          <div>
            <label className="text-green-400 text-sm font-medium block mb-3">Status de pagamento</label>
            <div className="grid grid-cols-3 gap-3">
              {STATUS_OPTIONS.map(s => (
                <button
                  key={s.value}
                  onClick={() => set('status', s.value)}
                  className={`flex items-center gap-2 p-3 rounded-xl border transition-all text-sm font-medium ${
                    form.status === s.value ? s.color : 'border-[#243324] text-green-700 hover:border-green-700'
                  }`}
                >
                  <s.icon className="w-4 h-4" />
                  {s.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* ── Classificação ── */}
        <div className="bg-[#111811] border border-[#1e2e1e] rounded-2xl p-6 space-y-4">
          <p className="text-xs text-green-700 uppercase tracking-widest">Classificação</p>

          <div>
            <label className="text-green-400 text-sm font-medium block mb-2">
              <Tag className="w-3.5 h-3.5 inline mr-1.5" />
              Categoria financeira
            </label>
            {token && (
              <CategoriaSeletor
                token={token}
                value={form.financial_category_id}
                onChange={(id) => set('financial_category_id', id)}
                tipoFiltro={form.tipo === 'RECEITA' ? 'receita' : 'despesa'}
                placeholder="Selecione a categoria financeira"
              />
            )}
            {form.financial_category_id && (
              <p className="text-xs text-green-700 mt-2">
                ✓ Categoria vinculada — aparecerá no Painel de Custo Realizado
              </p>
            )}
          </div>
        </div>

        {/* Botão salvar inferior */}
        <div className="flex gap-3 pt-2 pb-8">
          <button
            onClick={() => router.push('/financeiro')}
            className="flex-1 py-3 border border-[#243324] text-green-600 hover:text-green-400 rounded-xl text-sm font-medium transition-colors"
          >
            Cancelar
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            className="flex-1 py-3 bg-green-600 hover:bg-green-500 text-white rounded-xl text-sm font-medium transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {saving
              ? <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              : <Save className="w-4 h-4" />
            }
            {isEdit ? 'Salvar alterações' : 'Criar lançamento'}
          </button>
        </div>
      </div>
    </div>
  )
}
