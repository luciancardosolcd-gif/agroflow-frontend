'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  TrendingDown,
  TrendingUp,
  Building2,
  Package,
  Leaf,
  Clock,
  Plus,
  GitCompare,
  Filter,
  Search,
  RefreshCw,
  AlertTriangle,
  CheckCircle,
  Info,
  ChevronDown,
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  Legend,
} from 'recharts';

const API = process.env.NEXT_PUBLIC_API_URL || '';

const CORES_SEGMENTO = ['#22c55e', '#3b82f6', '#f97316', '#ef4444', '#a855f7', '#eab308', '#06b6d4', '#ec4899', '#14b8a6', '#64748b'];

const SEGMENTOS = [
  'Herbicida','Fungicida','Inseticida','Fertilizante','Adjuvante',
  'Biológico','Semente','Regulador de Crescimento','Tratamento de Sementes','Outros',
];

const MOEDAS = [
  { value: 'BRL', label: 'Real (R$)', simbolo: 'R$' },
  { value: 'USD', label: 'Dólar (US$)', simbolo: 'US$' },
];

function formatCurrency(valor: number, moeda = 'BRL') {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: moeda,
    minimumFractionDigits: 2,
  }).format(valor);
}

function formatDate(dateStr: string) {
  if (!dateStr) return '—';
  return new Date(dateStr).toLocaleDateString('pt-BR');
}

export default function CotacoesInsumosPage() {
  const [dashboard, setDashboard] = useState<any>(null);
  const [cotacoes, setCotacoes] = useState<any[]>([]);
  const [segmentos, setSegmentos] = useState<any[]>([]);
  const [ranking, setRanking] = useState<any[]>([]);
  const [evolucao, setEvolucao] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [periodoEvolucao, setPeriodoEvolucao] = useState(30);
  const [filtros, setFiltros] = useState({ empresa: '', segmento: '', produto: '', principio_ativo: '', moeda: '' });
  const [mostrarFiltros, setMostrarFiltros] = useState(false);
  const [compararIA, setComparar] = useState('');
  const [comparacao, setComparacao] = useState<any>(null);
  const [alertas, setAlertas] = useState<any[]>([]);

  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : '';
  const headers = { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' };

  async function carregar() {
    setLoading(true);
    try {
      const [dash, lista, segs, rank, evol] = await Promise.all([
        fetch(`${API}/cotacoes-insumos/dashboard`, { headers }).then((r) => r.json()),
        fetch(`${API}/cotacoes-insumos?${new URLSearchParams(Object.fromEntries(Object.entries(filtros).filter(([, v]) => v)))}`, { headers }).then((r) => r.json()),
        fetch(`${API}/cotacoes-insumos/graficos/segmentos`, { headers }).then((r) => r.json()),
        fetch(`${API}/cotacoes-insumos/graficos/ranking-empresas`, { headers }).then((r) => r.json()),
        fetch(`${API}/cotacoes-insumos/graficos/evolucao?dias=${periodoEvolucao}`, { headers }).then((r) => r.json()),
      ]);
      setDashboard(dash);
      setCotacoes(Array.isArray(lista) ? lista : []);
      setSegmentos(Array.isArray(segs) ? segs : []);
      setRanking(Array.isArray(rank) ? rank : []);
      setEvolucao(Array.isArray(evol) ? evol : []);

      // alertas automáticos
      const novosAlertas: any[] = [];
      if (Array.isArray(lista) && lista.length > 1) {
        const precos = lista.map((c: any) => Number(c.preco_unitario));
        const media = precos.reduce((a: number, b: number) => a + b, 0) / precos.length;
        lista.forEach((c: any) => {
          const p = Number(c.preco_unitario);
          if (p < media * 0.9)
            novosAlertas.push({ tipo: 'baixo', msg: `${c.produto_comercial} (${c.empresa}) — preço abaixo da média`, id: c.id });
          else if (p > media * 1.1)
            novosAlertas.push({ tipo: 'alto', msg: `${c.produto_comercial} (${c.empresa}) — preço acima da média`, id: c.id });
        });
      }
      setAlertas(novosAlertas.slice(0, 5));
    } finally {
      setLoading(false);
    }
  }

  async function executarComparacao() {
    if (!compararIA.trim()) return;
    const res = await fetch(`${API}/cotacoes-insumos/comparar?principio_ativo=${encodeURIComponent(compararIA)}`, { headers });
    const data = await res.json();
    setComparacao(data);
  }

  useEffect(() => { carregar(); }, [periodoEvolucao]);

  const cards = dashboard ? [
    { label: 'Menor Cotação', valor: formatCurrency(dashboard.menorCotacao), icon: TrendingDown, cor: 'text-green-400', bg: 'from-green-900/40 to-green-800/20', borda: 'border-green-700/30' },
    { label: 'Economia Potencial', valor: formatCurrency(dashboard.economiaPotencial), icon: TrendingUp, cor: 'text-blue-400', bg: 'from-blue-900/40 to-blue-800/20', borda: 'border-blue-700/30' },
    { label: 'Empresas Cadastradas', valor: dashboard.totalEmpresas, icon: Building2, cor: 'text-orange-400', bg: 'from-orange-900/40 to-orange-800/20', borda: 'border-orange-700/30' },
    { label: 'Produtos Cotados', valor: dashboard.totalProdutos, icon: Package, cor: 'text-purple-400', bg: 'from-purple-900/40 to-purple-800/20', borda: 'border-purple-700/30' },
    { label: 'Princípios Ativos', valor: dashboard.totalPrincipiosAtivos, icon: Leaf, cor: 'text-teal-400', bg: 'from-teal-900/40 to-teal-800/20', borda: 'border-teal-700/30' },
    { label: 'Última Atualização', valor: dashboard.ultimaAtualizacao ? formatDate(dashboard.ultimaAtualizacao) : '—', icon: Clock, cor: 'text-yellow-400', bg: 'from-yellow-900/40 to-yellow-800/20', borda: 'border-yellow-700/30' },
  ] : [];

  return (
    <div className="min-h-screen bg-[#0a0f0a] text-white p-4 md:p-6 space-y-6">

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-white flex items-center gap-2">
            <Leaf className="text-green-400" size={28} />
            Cotações de Insumos
          </h1>
          <p className="text-gray-400 mt-1 text-sm">Compare preços de defensivos, fertilizantes, sementes e biológicos</p>
        </div>
        <div className="flex gap-2 flex-wrap">
          <button onClick={carregar} className="flex items-center gap-2 px-3 py-2 rounded-lg bg-gray-800 border border-gray-700 hover:bg-gray-700 transition text-sm">
            <RefreshCw size={14} /> Atualizar
          </button>
          <Link href="/produtor/cotacoes-insumos/nova" className="flex items-center gap-2 px-4 py-2 rounded-lg bg-green-600 hover:bg-green-500 transition text-sm font-medium">
            <Plus size={14} /> Nova Cotação
          </Link>
          <button
            onClick={() => setMostrarFiltros(!mostrarFiltros)}
            className="flex items-center gap-2 px-3 py-2 rounded-lg bg-gray-800 border border-gray-700 hover:bg-gray-700 transition text-sm"
          >
            <Filter size={14} /> Filtros <ChevronDown size={12} className={`transition-transform ${mostrarFiltros ? 'rotate-180' : ''}`} />
          </button>
        </div>
      </div>

      {/* Alertas */}
      {alertas.length > 0 && (
        <div className="space-y-2">
          {alertas.map((a, i) => (
            <div key={i} className={`flex items-center gap-3 px-4 py-2 rounded-lg text-sm border ${a.tipo === 'baixo' ? 'bg-green-900/20 border-green-700/30 text-green-300' : 'bg-red-900/20 border-red-700/30 text-red-300'}`}>
              {a.tipo === 'baixo' ? <CheckCircle size={14} /> : <AlertTriangle size={14} />}
              {a.msg}
            </div>
          ))}
        </div>
      )}

      {/* Cards dashboard */}
      {loading ? (
        <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-4">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="h-24 rounded-xl bg-gray-800/50 animate-pulse" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-4">
          {cards.map((c, i) => (
            <div key={i} className={`rounded-xl border ${c.borda} bg-gradient-to-br ${c.bg} p-4 flex flex-col gap-2`}>
              <div className="flex items-center justify-between">
                <span className="text-xs text-gray-400">{c.label}</span>
                <c.icon size={16} className={c.cor} />
              </div>
              <span className={`text-lg font-bold ${c.cor}`}>{c.valor}</span>
            </div>
          ))}
        </div>
      )}

      {/* Filtros */}
      {mostrarFiltros && (
        <div className="rounded-xl bg-gray-900/60 border border-gray-700/40 p-4 grid grid-cols-2 md:grid-cols-5 gap-3">
          {[
            { key: 'empresa', placeholder: 'Empresa' },
            { key: 'produto', placeholder: 'Produto' },
            { key: 'principio_ativo', placeholder: 'Princípio Ativo' },
          ].map((f) => (
            <input
              key={f.key}
              placeholder={f.placeholder}
              value={(filtros as any)[f.key]}
              onChange={(e) => setFiltros((prev) => ({ ...prev, [f.key]: e.target.value }))}
              className="bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-green-500"
            />
          ))}
          <select
            value={filtros.segmento}
            onChange={(e) => setFiltros((prev) => ({ ...prev, segmento: e.target.value }))}
            className="bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-green-500"
          >
            <option value="">Todos segmentos</option>
            {SEGMENTOS.map((s) => <option key={s} value={s}>{s}</option>)}
          </select>
          <select
            value={filtros.moeda}
            onChange={(e) => setFiltros((prev) => ({ ...prev, moeda: e.target.value }))}
            className="bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-green-500"
          >
            <option value="">Todas moedas</option>
            {MOEDAS.map((m) => <option key={m.value} value={m.value}>{m.label}</option>)}
          </select>
          <button onClick={carregar} className="col-span-2 md:col-span-1 flex items-center justify-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-500 rounded-lg text-sm font-medium transition">
            <Search size={14} /> Buscar
          </button>
        </div>
      )}

      {/* Gráficos */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Gráfico 1 — Barras por empresa */}
        <div className="rounded-xl bg-gray-900/60 border border-gray-700/40 p-5">
          <h3 className="text-sm font-semibold text-gray-300 mb-4">Comparativo de Preços por Empresa</h3>
          {ranking.length === 0 ? (
            <div className="h-48 flex items-center justify-center text-gray-500 text-sm">Sem dados</div>
          ) : (
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={ranking} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" />
                <XAxis type="number" tick={{ fill: '#9ca3af', fontSize: 11 }} />
                <YAxis dataKey="empresa" type="category" tick={{ fill: '#9ca3af', fontSize: 11 }} width={100} />
                <Tooltip formatter={(v: any) => formatCurrency(v)} contentStyle={{ background: '#111827', border: '1px solid #374151', borderRadius: 8 }} />
                <Bar dataKey="mediaPreco" name="Preço Médio" fill="#22c55e" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* Gráfico 2 — Donut por segmento */}
        <div className="rounded-xl bg-gray-900/60 border border-gray-700/40 p-5">
          <h3 className="text-sm font-semibold text-gray-300 mb-4">Preço Médio por Segmento</h3>
          {segmentos.length === 0 ? (
            <div className="h-48 flex items-center justify-center text-gray-500 text-sm">Sem dados</div>
          ) : (
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie data={segmentos} dataKey="mediaPreco" nameKey="segmento" cx="50%" cy="50%" innerRadius={50} outerRadius={80} paddingAngle={3}>
                  {segmentos.map((_, i) => <Cell key={i} fill={CORES_SEGMENTO[i % CORES_SEGMENTO.length]} />)}
                </Pie>
                <Tooltip formatter={(v: any) => formatCurrency(v)} contentStyle={{ background: '#111827', border: '1px solid #374151', borderRadius: 8 }} />
                <Legend wrapperStyle={{ fontSize: 11, color: '#9ca3af' }} />
              </PieChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* Gráfico 3 — Evolução de preços */}
        <div className="rounded-xl bg-gray-900/60 border border-gray-700/40 p-5 md:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold text-gray-300">Evolução dos Preços</h3>
            <div className="flex gap-2">
              {[7, 30, 90].map((d) => (
                <button key={d} onClick={() => setPeriodoEvolucao(d)}
                  className={`px-3 py-1 rounded-lg text-xs transition ${periodoEvolucao === d ? 'bg-green-600 text-white' : 'bg-gray-800 text-gray-400 hover:bg-gray-700'}`}>
                  {d}d
                </button>
              ))}
            </div>
          </div>
          {evolucao.length === 0 ? (
            <div className="h-48 flex items-center justify-center text-gray-500 text-sm">Sem dados suficientes</div>
          ) : (
            <ResponsiveContainer width="100%" height={200}>
              <LineChart data={evolucao}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" />
                <XAxis dataKey="data" tick={{ fill: '#9ca3af', fontSize: 11 }} />
                <YAxis tick={{ fill: '#9ca3af', fontSize: 11 }} />
                <Tooltip formatter={(v: any) => formatCurrency(v)} contentStyle={{ background: '#111827', border: '1px solid #374151', borderRadius: 8 }} />
                <Line type="monotone" dataKey="mediaPreco" name="Preço Médio" stroke="#22c55e" strokeWidth={2} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      {/* Ranking empresas mais competitivas */}
      {ranking.length > 0 && (
        <div className="rounded-xl bg-gray-900/60 border border-gray-700/40 p-5">
          <h3 className="text-sm font-semibold text-gray-300 mb-4">Empresas Mais Competitivas</h3>
          <div className="space-y-3">
            {ranking.map((r, i) => (
              <div key={i} className="flex items-center gap-4">
                <span className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 ${i === 0 ? 'bg-yellow-500 text-black' : i === 1 ? 'bg-gray-400 text-black' : i === 2 ? 'bg-orange-600 text-white' : 'bg-gray-700 text-gray-300'}`}>
                  {i + 1}°
                </span>
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm text-white font-medium">{r.empresa}</span>
                    <span className="text-xs text-green-400 font-semibold">{formatCurrency(r.mediaPreco)}</span>
                  </div>
                  <div className="w-full bg-gray-800 rounded-full h-1.5">
                    <div className="bg-green-500 h-1.5 rounded-full transition-all" style={{ width: `${Math.max(10, 100 - i * 18)}%` }} />
                  </div>
                </div>
                <span className="text-xs text-gray-500">{r.totalCotacoes} cot.</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Comparador */}
      <div className="rounded-xl bg-gray-900/60 border border-gray-700/40 p-5">
        <div className="flex items-center gap-2 mb-4">
          <GitCompare size={16} className="text-blue-400" />
          <h3 className="text-sm font-semibold text-gray-300">Comparador de Cotações por Princípio Ativo</h3>
        </div>
        <div className="flex gap-3">
          <input
            placeholder="Digite o princípio ativo (ex: Fluazinam, Fipronil...)"
            value={compararIA}
            onChange={(e) => setComparar(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && executarComparacao()}
            className="flex-1 bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-blue-500"
          />
          <button onClick={executarComparacao} className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-500 rounded-lg text-sm font-medium transition">
            <GitCompare size={14} /> Comparar
          </button>
        </div>

        {comparacao?.resumo && (
          <div className="mt-4 space-y-3">
            <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
              {[
                { label: 'Menor Preço', valor: formatCurrency(comparacao.resumo.menorPreco), cor: 'text-green-400' },
                { label: 'Maior Preço', valor: formatCurrency(comparacao.resumo.maiorPreco), cor: 'text-red-400' },
                { label: 'Preço Médio', valor: formatCurrency(comparacao.resumo.precoMedio), cor: 'text-blue-400' },
                { label: 'Diferença', valor: `${comparacao.resumo.diferencaPercentual.toFixed(1)}%`, cor: 'text-orange-400' },
                { label: 'Empresas', valor: comparacao.resumo.totalEmpresas, cor: 'text-purple-400' },
              ].map((item, i) => (
                <div key={i} className="bg-gray-800/50 rounded-lg p-3 text-center">
                  <div className="text-xs text-gray-400 mb-1">{item.label}</div>
                  <div className={`font-bold text-sm ${item.cor}`}>{item.valor}</div>
                </div>
              ))}
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead>
                  <tr className="text-gray-400 border-b border-gray-700">
                    <th className="text-left py-2 px-3">Empresa</th>
                    <th className="text-left py-2 px-3">Produto</th>
                    <th className="text-right py-2 px-3">Preço</th>
                    <th className="text-left py-2 px-3">Prazo</th>
                  </tr>
                </thead>
                <tbody>
                  {comparacao.cotacoes.map((c: any, i: number) => (
                    <tr key={i} className="border-b border-gray-800 hover:bg-gray-800/30">
                      <td className="py-2 px-3 text-white">{c.empresa}</td>
                      <td className="py-2 px-3 text-gray-300">{c.produto_comercial}</td>
                      <td className={`py-2 px-3 text-right font-semibold ${i === 0 ? 'text-green-400' : 'text-white'}`}>
                        {formatCurrency(c.preco_unitario, c.moeda)}
                      </td>
                      <td className="py-2 px-3 text-gray-400">{c.prazo_pagamento}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
        {comparacao && !comparacao.resumo && (
          <div className="mt-4 flex items-center gap-2 text-gray-500 text-sm">
            <Info size={14} /> Nenhuma cotação encontrada para "{compararIA}"
          </div>
        )}
      </div>

      {/* Tabela de cotações */}
      <div className="rounded-xl bg-gray-900/60 border border-gray-700/40 overflow-hidden">
        <div className="px-5 py-4 border-b border-gray-700/40 flex items-center justify-between">
          <h3 className="text-sm font-semibold text-gray-300">
            Cotações Cadastradas <span className="text-gray-500 font-normal">({cotacoes.length})</span>
          </h3>
        </div>
        {cotacoes.length === 0 ? (
          <div className="py-16 flex flex-col items-center gap-3 text-gray-500">
            <Package size={32} className="opacity-30" />
            <p className="text-sm">Nenhuma cotação cadastrada ainda</p>
            <Link href="/produtor/cotacoes-insumos/nova" className="text-green-400 hover:text-green-300 text-sm underline">
              Cadastrar primeira cotação
            </Link>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-gray-400 text-xs bg-gray-800/30 border-b border-gray-700/40">
                  <th className="text-left py-3 px-4">Empresa</th>
                  <th className="text-left py-3 px-4">Segmento</th>
                  <th className="text-left py-3 px-4">Produto</th>
                  <th className="text-left py-3 px-4">Princípio Ativo</th>
                  <th className="text-left py-3 px-4">Concentração</th>
                  <th className="text-right py-3 px-4">Preço</th>
                  <th className="text-left py-3 px-4">Prazo</th>
                  <th className="text-left py-3 px-4">Data</th>
                  <th className="py-3 px-4" />
                </tr>
              </thead>
              <tbody>
                {cotacoes.map((c: any) => (
                  <tr key={c.id} className="border-b border-gray-800/60 hover:bg-gray-800/20 transition">
                    <td className="py-3 px-4 text-white font-medium">{c.empresa}</td>
                    <td className="py-3 px-4">
                      <span className="px-2 py-0.5 rounded-full bg-green-900/40 text-green-300 text-xs border border-green-700/30">{c.segmento}</span>
                    </td>
                    <td className="py-3 px-4 text-gray-300">{c.produto_comercial}</td>
                    <td className="py-3 px-4 text-gray-400">{c.principio_ativo || '—'}</td>
                    <td className="py-3 px-4 text-gray-400">{c.concentracao ? `${c.concentracao} ${c.unidade_concentracao}` : '—'}</td>
                    <td className="py-3 px-4 text-right font-semibold text-green-400">{formatCurrency(c.preco_unitario, c.moeda)}</td>
                    <td className="py-3 px-4 text-gray-400 text-xs">{c.prazo_pagamento}</td>
                    <td className="py-3 px-4 text-gray-500 text-xs">{formatDate(c.data_cotacao)}</td>
                    <td className="py-3 px-4">
                      <Link href={`/produtor/cotacoes-insumos/editar/${c.id}`} className="text-xs text-blue-400 hover:text-blue-300 transition">Editar</Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
