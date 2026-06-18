'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { ArrowLeft, Save, Leaf, Trash2 } from 'lucide-react';
import Link from 'next/link';
import Cookies from 'js-cookie';

const API = process.env.NEXT_PUBLIC_API_URL || '';

const SEGMENTOS = [
  'Herbicida','Fungicida','Inseticida','Fertilizante','Adjuvante',
  'Biológico','Semente','Regulador de Crescimento','Tratamento de Sementes','Outros',
];
const UNIDADES_CONC = ['g/L','g/Kg','SC','WG','EC','SL','OD','FS','Outros'];
const UNIDADES_VOL = ['Litro','Kg','mL','g'];
const PRAZOS = ['À Vista','30 dias','60 dias','90 dias','120 dias','Prazo Soja','Personalizado'];

const inputCls = 'bg-gray-800/60 border border-gray-700 rounded-lg px-3 py-2.5 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-green-500 transition w-full';

export default function EditarCotacaoPage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;

  const [form, setForm] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [erro, setErro] = useState('');

  const token = Cookies.get('accessToken') || '';
  const headers = { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' };

  useEffect(() => {
    fetch(`${API}/cotacoes-insumos/${id}`, { headers })
      .then((r) => r.json())
      .then((data) => {
        setForm({
          empresa: data.empresa || '',
          representante: data.representante || '',
          data_cotacao: data.data_cotacao ? data.data_cotacao.split('T')[0] : '',
          validade_cotacao: data.validade_cotacao ? data.validade_cotacao.split('T')[0] : '',
          segmento: data.segmento || '',
          produto_comercial: data.produto_comercial || '',
          principio_ativo: data.principio_ativo || '',
          concentracao: data.concentracao ? String(data.concentracao) : '',
          unidade_concentracao: data.unidade_concentracao || 'g/L',
          volume_embalagem: data.volume_embalagem ? String(data.volume_embalagem) : '',
          unidade_volume: data.unidade_volume || 'Litro',
          preco_unitario: data.preco_unitario ? String(data.preco_unitario) : '',
          moeda: data.moeda || 'BRL',
          prazo_pagamento: data.prazo_pagamento || 'À Vista',
          condicao_pagamento: data.condicao_pagamento || '',
          observacoes: data.observacoes || '',
        });
        setLoading(false);
      })
      .catch(() => { setErro('Erro ao carregar cotação.'); setLoading(false); });
  }, [id]);

  const set = (k: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) =>
    setForm((p: any) => ({ ...p, [k]: e.target.value }));

  async function salvar(e: React.FormEvent) {
    e.preventDefault();
    if (!form.empresa || !form.segmento || !form.produto_comercial || !form.preco_unitario) {
      setErro('Preencha os campos obrigatórios.');
      return;
    }
    setSaving(true);
    setErro('');
    try {
      const body = {
        ...form,
        concentracao: form.concentracao ? parseFloat(form.concentracao) : undefined,
        volume_embalagem: form.volume_embalagem ? parseFloat(form.volume_embalagem) : undefined,
        preco_unitario: parseFloat(form.preco_unitario),
      };
      const res = await fetch(`${API}/cotacoes-insumos/${id}`, {
        method: 'PUT',
        headers,
        body: JSON.stringify(body),
      });
      if (!res.ok) throw new Error();
      router.push('/produtor/cotacoes-insumos');
    } catch {
      setErro('Erro ao salvar. Tente novamente.');
    } finally {
      setSaving(false);
    }
  }

  async function excluir() {
    if (!confirm('Excluir esta cotação? Esta ação não pode ser desfeita.')) return;
    setDeleting(true);
    try {
      const res = await fetch(`${API}/cotacoes-insumos/${id}`, { method: 'DELETE', headers });
      if (!res.ok) throw new Error();
      router.push('/produtor/cotacoes-insumos');
    } catch {
      setErro('Erro ao excluir. Tente novamente.');
    } finally {
      setDeleting(false);
    }
  }

  if (loading) return (
    <div className="min-h-screen bg-[#0a0f0a] flex items-center justify-center">
      <div className="w-8 h-8 border-2 border-green-500 border-t-transparent rounded-full animate-spin" />
    </div>
  );

  if (!form) return (
    <div className="min-h-screen bg-[#0a0f0a] flex items-center justify-center text-red-400">{erro || 'Cotação não encontrada.'}</div>
  );

  return (
    <div className="min-h-screen bg-[#0a0f0a] text-white p-4 md:p-6">
      <div className="max-w-3xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href="/produtor/cotacoes-insumos" className="p-2 rounded-lg bg-gray-800 hover:bg-gray-700 transition">
              <ArrowLeft size={16} />
            </Link>
            <div>
              <h1 className="text-xl font-bold flex items-center gap-2">
                <Leaf size={20} className="text-green-400" /> Editar Cotação
              </h1>
              <p className="text-xs text-gray-400 mt-0.5">Atualize os dados da cotação</p>
            </div>
          </div>
          <button onClick={excluir} disabled={deleting}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-red-900/30 border border-red-700/40 text-red-400 hover:bg-red-900/50 text-sm transition disabled:opacity-50">
            <Trash2 size={14} /> {deleting ? 'Excluindo...' : 'Excluir'}
          </button>
        </div>

        <form onSubmit={salvar} className="space-y-5">
          <div className="rounded-xl bg-gray-900/60 border border-gray-700/40 p-5 space-y-4">
            <h2 className="text-sm font-semibold text-gray-300 border-b border-gray-700/40 pb-3">Dados do Fornecedor</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-xs text-gray-400 font-medium">Empresa <span className="text-red-400">*</span></label>
                <input className={inputCls} value={form.empresa} onChange={set('empresa')} />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-xs text-gray-400 font-medium">Representante</label>
                <input className={inputCls} value={form.representante} onChange={set('representante')} />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-xs text-gray-400 font-medium">Data da Cotação</label>
                <input type="date" className={inputCls} value={form.data_cotacao} onChange={set('data_cotacao')} />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-xs text-gray-400 font-medium">Validade</label>
                <input type="date" className={inputCls} value={form.validade_cotacao} onChange={set('validade_cotacao')} />
              </div>
            </div>
          </div>

          <div className="rounded-xl bg-gray-900/60 border border-gray-700/40 p-5 space-y-4">
            <h2 className="text-sm font-semibold text-gray-300 border-b border-gray-700/40 pb-3">Dados do Produto</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-xs text-gray-400 font-medium">Segmento <span className="text-red-400">*</span></label>
                <select className={inputCls} value={form.segmento} onChange={set('segmento')}>
                  <option value="">Selecione</option>
                  {SEGMENTOS.map((s) => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-xs text-gray-400 font-medium">Produto Comercial <span className="text-red-400">*</span></label>
                <input className={inputCls} value={form.produto_comercial} onChange={set('produto_comercial')} />
              </div>
              <div className="flex flex-col gap-1.5 md:col-span-2">
                <label className="text-xs text-gray-400 font-medium">Princípio Ativo</label>
                <input className={inputCls} value={form.principio_ativo} onChange={set('principio_ativo')} />
              </div>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-xs text-gray-400 font-medium">Concentração</label>
                <input type="number" step="0.001" min="0" className={inputCls} value={form.concentracao} onChange={set('concentracao')} />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-xs text-gray-400 font-medium">Unidade Conc.</label>
                <select className={inputCls} value={form.unidade_concentracao} onChange={set('unidade_concentracao')}>
                  {UNIDADES_CONC.map((u) => <option key={u} value={u}>{u}</option>)}
                </select>
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-xs text-gray-400 font-medium">Volume Embalagem</label>
                <input type="number" step="0.001" min="0" className={inputCls} value={form.volume_embalagem} onChange={set('volume_embalagem')} />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-xs text-gray-400 font-medium">Unidade Volume</label>
                <select className={inputCls} value={form.unidade_volume} onChange={set('unidade_volume')}>
                  {UNIDADES_VOL.map((u) => <option key={u} value={u}>{u}</option>)}
                </select>
              </div>
            </div>
          </div>

          <div className="rounded-xl bg-gray-900/60 border border-gray-700/40 p-5 space-y-4">
            <h2 className="text-sm font-semibold text-gray-300 border-b border-gray-700/40 pb-3">Preço e Pagamento</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-xs text-gray-400 font-medium">Preço Unitário <span className="text-red-400">*</span></label>
                <input type="number" step="0.01" min="0" className={inputCls} value={form.preco_unitario} onChange={set('preco_unitario')} />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-xs text-gray-400 font-medium">Moeda</label>
                <select className={inputCls} value={form.moeda} onChange={set('moeda')}>
                  <option value="BRL">Real (R$)</option>
                  <option value="USD">Dólar (US$)</option>
                </select>
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-xs text-gray-400 font-medium">Prazo de Pagamento</label>
                <select className={inputCls} value={form.prazo_pagamento} onChange={set('prazo_pagamento')}>
                  {PRAZOS.map((p) => <option key={p} value={p}>{p}</option>)}
                </select>
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-xs text-gray-400 font-medium">Condição de Pagamento</label>
                <input className={inputCls} value={form.condicao_pagamento} onChange={set('condicao_pagamento')} />
              </div>
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-xs text-gray-400 font-medium">Observações</label>
              <textarea rows={3} className={`${inputCls} resize-none`} value={form.observacoes} onChange={set('observacoes')} />
            </div>
          </div>

          {erro && (
            <div className="rounded-lg bg-red-900/20 border border-red-700/30 px-4 py-3 text-sm text-red-300">{erro}</div>
          )}

          <div className="flex gap-3 justify-end pb-6">
            <Link href="/produtor/cotacoes-insumos" className="px-5 py-2.5 rounded-lg bg-gray-800 hover:bg-gray-700 text-sm transition">
              Cancelar
            </Link>
            <button type="submit" disabled={saving}
              className="flex items-center gap-2 px-6 py-2.5 rounded-lg bg-green-600 hover:bg-green-500 disabled:opacity-50 text-sm font-medium transition">
              <Save size={14} /> {saving ? 'Salvando...' : 'Salvar'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
