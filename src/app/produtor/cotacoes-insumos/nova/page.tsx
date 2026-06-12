'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Save, Leaf, Calculator, Info } from 'lucide-react';
import Link from 'next/link';

const API = process.env.NEXT_PUBLIC_API_URL || '';

const SEGMENTOS = [
  'Herbicida','Fungicida','Inseticida','Fertilizante','Adjuvante',
  'Biológico','Semente','Regulador de Crescimento','Tratamento de Sementes','Outros',
];
const UNIDADES_CONC = ['g/L','g/Kg','SC','WG','EC','SL','OD','FS','Outros'];
const UNIDADES_VOL = ['Litro','Kg','mL','g'];
const PRAZOS = ['À Vista','30 dias','60 dias','90 dias','120 dias','Prazo Soja','Personalizado'];

const INITIAL = {
  empresa: '', representante: '', data_cotacao: '', validade_cotacao: '',
  segmento: '', produto_comercial: '', principio_ativo: '',
  concentracao: '', unidade_concentracao: 'g/L',
  volume_embalagem: '', unidade_volume: 'Litro',
  preco_unitario: '', moeda: 'BRL',
  prazo_pagamento: 'À Vista', condicao_pagamento: '', observacoes: '',
};

const inputCls = 'bg-gray-800/60 border border-gray-700 rounded-lg px-3 py-2.5 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-green-500 transition w-full';

function SpinIcon() {
  return (
    <svg className="animate-spin" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M21 12a9 9 0 11-6.219-8.56" />
    </svg>
  );
}

export default function NovaCotacaoPage() {
  const router = useRouter();
  const [form, setForm] = useState(INITIAL);
  const [loading, setLoading] = useState(false);
  const [erro, setErro] = useState('');

  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : '';

  const set = (k: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) =>
    setForm((p) => ({ ...p, [k]: e.target.value }));

  const preco = parseFloat(form.preco_unitario) || 0;
  const volume = parseFloat(form.volume_embalagem) || 0;
  const conc = parseFloat(form.concentracao) || 0;
  const precoPorLitroKg = volume > 0 ? preco / volume : 0;
  const precoPorGramaIA = volume > 0 && conc > 0 ? preco / (volume * conc) : 0;
  const simbolo = form.moeda === 'USD' ? 'US$' : 'R$';

  async function salvar(e: React.FormEvent) {
    e.preventDefault();
    if (!form.empresa || !form.segmento || !form.produto_comercial || !form.preco_unitario || !form.data_cotacao) {
      setErro('Preencha os campos obrigatórios.');
      return;
    }
    setLoading(true);
    setErro('');
    try {
      const body = {
        ...form,
        concentracao: form.concentracao ? parseFloat(form.concentracao) : undefined,
        volume_embalagem: form.volume_embalagem ? parseFloat(form.volume_embalagem) : undefined,
        preco_unitario: parseFloat(form.preco_unitario),
      };
      const res = await fetch(`${API}/cotacoes-insumos`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify(body),
      });
      if (!res.ok) throw new Error('Erro ao salvar');
      router.push('/produtor/cotacoes-insumos');
    } catch {
      setErro('Erro ao salvar cotação. Tente novamente.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-[#0a0f0a] text-white p-4 md:p-6">
      <div className="max-w-3xl mx-auto space-y-6">

        {/* Header */}
        <div className="flex items-center gap-3">
          <Link href="/produtor/cotacoes-insumos" className="p-2 rounded-lg bg-gray-800 hover:bg-gray-700 transition">
            <ArrowLeft size={16} />
          </Link>
          <div>
            <h1 className="text-xl font-bold flex items-center gap-2">
              <Leaf size={20} className="text-green-400" /> Nova Cotação de Insumo
            </h1>
            <p className="text-xs text-gray-400 mt-0.5">Cadastre preços de defensivos, fertilizantes e sementes</p>
          </div>
        </div>

        <form onSubmit={salvar} className="space-y-5">

          {/* Fornecedor */}
          <div className="rounded-xl bg-gray-900/60 border border-gray-700/40 p-5 space-y-4">
            <h2 className="text-sm font-semibold text-gray-300 border-b border-gray-700/40 pb-3">Dados do Fornecedor</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-xs text-gray-400 font-medium">Empresa <span className="text-red-400">*</span></label>
                <input className={inputCls} placeholder="Nome da empresa" value={form.empresa} onChange={set('empresa')} />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-xs text-gray-400 font-medium">Representante</label>
                <input className={inputCls} placeholder="Nome do representante" value={form.representante} onChange={set('representante')} />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-xs text-gray-400 font-medium">Data da Cotação <span className="text-red-400">*</span></label>
                <input type="date" className={inputCls} value={form.data_cotacao} onChange={set('data_cotacao')} />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-xs text-gray-400 font-medium">Validade da Cotação</label>
                <input type="date" className={inputCls} value={form.validade_cotacao} onChange={set('validade_cotacao')} />
              </div>
            </div>
          </div>

          {/* Produto */}
          <div className="rounded-xl bg-gray-900/60 border border-gray-700/40 p-5 space-y-4">
            <h2 className="text-sm font-semibold text-gray-300 border-b border-gray-700/40 pb-3">Dados do Produto</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-xs text-gray-400 font-medium">Segmento <span className="text-red-400">*</span></label>
                <select className={inputCls} value={form.segmento} onChange={set('segmento')}>
                  <option value="">Selecione o segmento</option>
                  {SEGMENTOS.map((s) => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-xs text-gray-400 font-medium">Produto Comercial <span className="text-red-400">*</span></label>
                <input className={inputCls} placeholder="Nome do produto" value={form.produto_comercial} onChange={set('produto_comercial')} />
              </div>
              <div className="flex flex-col gap-1.5 md:col-span-2">
                <label className="text-xs text-gray-400 font-medium">Princípio Ativo</label>
                <input className={inputCls} placeholder="Ex: Fluazinam, Fipronil..." value={form.principio_ativo} onChange={set('principio_ativo')} />
              </div>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-xs text-gray-400 font-medium">Concentração</label>
                <input type="number" step="0.001" min="0" className={inputCls} placeholder="500" value={form.concentracao} onChange={set('concentracao')} />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-xs text-gray-400 font-medium">Unidade Conc.</label>
                <select className={inputCls} value={form.unidade_concentracao} onChange={set('unidade_concentracao')}>
                  {UNIDADES_CONC.map((u) => <option key={u} value={u}>{u}</option>)}
                </select>
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-xs text-gray-400 font-medium">Volume Embalagem</label>
                <input type="number" step="0.001" min="0" className={inputCls} placeholder="20" value={form.volume_embalagem} onChange={set('volume_embalagem')} />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-xs text-gray-400 font-medium">Unidade Volume</label>
                <select className={inputCls} value={form.unidade_volume} onChange={set('unidade_volume')}>
                  {UNIDADES_VOL.map((u) => <option key={u} value={u}>{u}</option>)}
                </select>
              </div>
            </div>
          </div>

          {/* Preço */}
          <div className="rounded-xl bg-gray-900/60 border border-gray-700/40 p-5 space-y-4">
            <h2 className="text-sm font-semibold text-gray-300 border-b border-gray-700/40 pb-3">Preço e Pagamento</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-xs text-gray-400 font-medium">Preço Unitário <span className="text-red-400">*</span></label>
                <input type="number" step="0.01" min="0" className={inputCls} placeholder="0,00" value={form.preco_unitario} onChange={set('preco_unitario')} />
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
                <input className={inputCls} placeholder="Ex: 3x sem juros..." value={form.condicao_pagamento} onChange={set('condicao_pagamento')} />
              </div>
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-xs text-gray-400 font-medium">Observações</label>
              <textarea rows={3} className={`${inputCls} resize-none`} placeholder="Informações adicionais..." value={form.observacoes} onChange={set('observacoes')} />
            </div>
          </div>

          {/* Inteligência de preço */}
          {preco > 0 && (
            <div className="rounded-xl bg-blue-900/20 border border-blue-700/30 p-5">
              <div className="flex items-center gap-2 mb-3">
                <Calculator size={16} className="text-blue-400" />
                <h3 className="text-sm font-semibold text-blue-300">Inteligência de Preço</h3>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                <div className="bg-blue-900/20 rounded-lg p-3">
                  <div className="text-xs text-gray-400 mb-1">Preço por {form.unidade_volume || 'unidade'}</div>
                  <div className="text-blue-300 font-bold">
                    {volume > 0 ? `${simbolo} ${precoPorLitroKg.toFixed(4)}` : '—'}
                  </div>
                </div>
                <div className="bg-blue-900/20 rounded-lg p-3">
                  <div className="text-xs text-gray-400 mb-1">Preço por grama de IA</div>
                  <div className="text-blue-300 font-bold">
                    {precoPorGramaIA > 0 ? `${simbolo} ${precoPorGramaIA.toFixed(6)}` : '—'}
                  </div>
                </div>
                <div className="bg-blue-900/20 rounded-lg p-3">
                  <div className="text-xs text-gray-400 mb-1">Preço total embalagem</div>
                  <div className="text-blue-300 font-bold">
                    {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: form.moeda || 'BRL' }).format(preco)}
                  </div>
                </div>
              </div>
              {volume > 0 && conc > 0 && (
                <div className="mt-3 flex items-start gap-2 text-xs text-gray-400">
                  <Info size={12} className="mt-0.5 flex-shrink-0" />
                  <span>
                    {form.produto_comercial || 'Produto'} {conc} {form.unidade_concentracao} — {volume} {form.unidade_volume} — {simbolo} {preco.toFixed(2)}/embalagem
                  </span>
                </div>
              )}
            </div>
          )}

          {erro && (
            <div className="rounded-lg bg-red-900/20 border border-red-700/30 px-4 py-3 text-sm text-red-300">
              {erro}
            </div>
          )}

          <div className="flex gap-3 justify-end pb-6">
            <Link href="/produtor/cotacoes-insumos" className="px-5 py-2.5 rounded-lg bg-gray-800 hover:bg-gray-700 text-sm transition">
              Cancelar
            </Link>
            <button type="submit" disabled={loading} className="flex items-center gap-2 px-6 py-2.5 rounded-lg bg-green-600 hover:bg-green-500 disabled:opacity-50 disabled:cursor-not-allowed text-sm font-medium transition">
              {loading ? <SpinIcon /> : <Save size={14} />}
              {loading ? 'Salvando...' : 'Salvar Cotação'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
