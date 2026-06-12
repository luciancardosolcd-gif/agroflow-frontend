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

export default function NovaCotacaoPage() {
  const router = useRouter();
  const [form, setForm] = useState(INITIAL);
  const [loading, setLoading] = useState(false);
  const [erro, setErro] = useState('');

  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : '';

  const set = (k: string, v: string) => setForm((p) => ({ ...p, [k]: v }));

  // cálculo inteligência
  const preco = parseFloat(form.preco_unitario) || 0;
  const volume = parseFloat(form.volume_embalagem) || 0;
  const conc = parseFloat(form.concentracao) || 0;
  const precoPorLitroKg = volume > 0 ? preco / volume : 0;
  const precoPorGramaIA = volume > 0 && conc > 0 ? preco / (volume * conc) : 0;

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

  const Field = ({ label, required, children }: { label: string; required?: boolean; children: React.ReactNode }) => (
    <div className="flex flex-col gap-1.5">
      <label className="text-xs text-gray-400 font-medium">{label}{required && <span className="text-red-400 ml-0.5">*</span>}</label>
      {children}
    </div>
  );

  const input = 'bg-gray-800/60 border border-gray-700 rounded-lg px-3 py-2.5 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-green-500 transition w-full';

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

          {/* Empresa */}
          <div className="rounded-xl bg-gray-900/60 border border-gray-700/40 p-5 space-y-4">
            <h2 className="text-sm font-semibold text-gray-300 border-b border-gray-700/40 pb-3">Dados do Fornecedor</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Field label="Empresa" required>
                <input placeholder="Nome da empresa" value={form.empresa} onChange={(e) => set('empresa', e.target.value)} className={input} />
              </Field>
              <Field label="Representante">
                <input placeholder="Nome do representante" value={form.representante} onChange={(e) => set('representante', e.target.value)} className={input} />
              </Field>
              <Field label="Data da Cotação" required>
                <input type="date" value={form.data_cotacao} onChange={(e) => set('data_cotacao', e.target.value)} className={input} />
              </Field>
              <Field label="Validade da Cotação">
                <input type="date" value={form.validade_cotacao} onChange={(e) => set('validade_cotacao', e.target.value)} className={input} />
              </Field>
            </div>
          </div>

          {/* Produto */}
          <div className="rounded-xl bg-gray-900/60 border border-gray-700/40 p-5 space-y-4">
            <h2 className="text-sm font-semibold text-gray-300 border-b border-gray-700/40 pb-3">Dados do Produto</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Field label="Segmento" required>
                <select value={form.segmento} onChange={(e) => set('segmento', e.target.value)} className={input}>
                  <option value="">Selecione o segmento</option>
                  {SEGMENTOS.map((s) => <option key={s} value={s}>{s}</option>)}
                </select>
              </Field>
              <Field label="Produto Comercial" required>
                <input placeholder="Nome do produto" value={form.produto_comercial} onChange={(e) => set('produto_comercial', e.target.value)} className={input} />
              </Field>
              <Field label="Princípio Ativo">
                <input placeholder="Ex: Fluazinam, Fipronil..." value={form.principio_ativo} onChange={(e) => set('principio_ativo', e.target.value)} className={input} />
              </Field>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Field label="Concentração">
                <input type="number" step="0.001" min="0" placeholder="500" value={form.concentracao} onChange={(e) => set('concentracao', e.target.value)} className={input} />
              </Field>
              <Field label="Unidade Conc.">
                <select value={form.unidade_concentracao} onChange={(e) => set('unidade_concentracao', e.target.value)} className={input}>
                  {UNIDADES_CONC.map((u) => <option key={u} value={u}>{u}</option>)}
                </select>
              </Field>
              <Field label="Volume Embalagem">
                <input type="number" step="0.001" min="0" placeholder="20" value={form.volume_embalagem} onChange={(e) => set('volume_embalagem', e.target.value)} className={input} />
              </Field>
              <Field label="Unidade Volume">
                <select value={form.unidade_volume} onChange={(e) => set('unidade_volume', e.target.value)} className={input}>
                  {UNIDADES_VOL.map((u) => <option key={u} value={u}>{u}</option>)}
                </select>
              </Field>
            </div>
          </div>

          {/* Preço */}
          <div className="rounded-xl bg-gray-900/60 border border-gray-700/40 p-5 space-y-4">
            <h2 className="text-sm font-semibold text-gray-300 border-b border-gray-700/40 pb-3">Preço e Pagamento</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Field label="Preço Unitário" required>
                <input type="number" step="0.01" min="0" placeholder="0,00" value={form.preco_unitario} onChange={(e) => set('preco_unitario', e.target.value)} className={input} />
              </Field>
              <Field label="Moeda">
                <select value={form.moeda} onChange={(e) => set('moeda', e.target.value)} className={input}>
                  <option value="BRL">Real (R$)</option>
                  <option value="USD">Dólar (US$)</option>
                </select>
              </Field>
              <Field label="Prazo de Pagamento">
                <select value={form.prazo_pagamento} onChange={(e) => set('prazo_pagamento', e.target.value)} className={input}>
                  {PRAZOS.map((p) => <option key={p} value={p}>{p}</option>)}
                </select>
              </Field>
              <Field label="Condição de Pagamento">
                <input placeholder="Ex: 3x sem juros, negociável..." value={form.condicao_pagamento} onChange={(e) => set('condicao_pagamento', e.target.value)} className={input} />
              </Field>
            </div>
            <Field label="Observações">
              <textarea rows={3} placeholder="Informações adicionais sobre a cotação..." value={form.observacoes} onChange={(e) => set('observacoes', e.target.value)} className={`${input} resize-none`} />
            </Field>
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
                  <div className="text-xs text-gray-400 mb-1">Preço por {form.unidade_volume || 'L/Kg'}</div>
                  <div className="text-blue-300 font-bold">
                    {volume > 0 ? `${form.moeda === 'BRL' ? 'R$' : 'US$'} ${precoPorLitroKg.toFixed(4)}` : '—'}
                  </div>
                </div>
                <div className="bg-blue-900/20 rounded-lg p-3">
                  <div className="text-xs text-gray-400 mb-1">Preço por grama de IA</div>
                  <div className="text-blue-300 font-bold">
                    {precoPorGramaIA > 0 ? `${form.moeda === 'BRL' ? 'R$' : 'US$'} ${precoPorGramaIA.toFixed(6)}` : '—'}
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
                    {form.produto_comercial || 'Produto'} {conc} {form.unidade_concentracao} — Embalagem {volume} {form.unidade_volume} —{' '}
                    {form.moeda === 'BRL' ? 'R$' : 'US$'} {preco.toFixed(2)} por embalagem
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

          <div className="flex gap-3 justify-end">
            <Link href="/produtor/cotacoes-insumos" className="px-5 py-2.5 rounded-lg bg-gray-800 hover:bg-gray-700 text-sm transition">
              Cancelar
            </Link>
            <button type="submit" disabled={loading} className="flex items-center gap-2 px-6 py-2.5 rounded-lg bg-green-600 hover:bg-green-500 disabled:opacity-50 disabled:cursor-not-allowed text-sm font-medium transition">
              {loading ? <RefreshCwIcon /> : <Save size={14} />}
              {loading ? 'Salvando...' : 'Salvar Cotação'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function RefreshCwIcon() {
  return (
    <svg className="animate-spin" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M21 12a9 9 0 11-6.219-8.56" />
    </svg>
  );
}
