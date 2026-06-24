'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Cookies from 'js-cookie';
import {
  TrendingDown, TrendingUp, Building2, Package, Leaf, Clock,
  Plus, GitCompare, Filter, Search, RefreshCw,
  Info, ChevronDown,
} from 'lucide-react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, LineChart, Line, Legend,
} from 'recharts';
import { usePropriedade } from '@/contexts/PropriedadeContext';

const API = process.env.NEXT_PUBLIC_API_URL || '';
const CORES_SEGMENTO = ['#22c55e','#3b82f6','#f97316','#ef4444','#a855f7','#eab308','#06b6d4','#ec4899','#14b8a6','#64748b'];
const SEGMENTOS = ['Herbicida','Fungicida','Inseticida','Fertilizante','Adjuvante','Biológico','Semente','Regulador de Crescimento','Tratamento de Sementes','Outros'];
const MOEDAS = [{ value: 'BRL', label: 'Real (R$)', simbolo: 'R$' },{ value: 'USD', label: 'Dólar (US$)', simbolo: 'US$' }];

function formatCurrency(valor: number, moeda = 'BRL') {
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: moeda, minimumFractionDigits: 2 }).format(valor);
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

  const { propriedadeId, propriedades } = usePropriedade();

  const token = Cookies.get('accessToken') || '';
  const headers = { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' };

  async function carregar() {
    setLoading(true);
    try {
      const params: Record<string, string> = {
        ...Object.fromEntries(Object.entries(filtros).filter(([, v]) => v)),
      };
      if (propriedadeId) params.fazendaId = propriedadeId;

      const queryString = new URLSearchParams(params).toString();
      const graficosQuery = propriedadeId ? `?fazendaId=${propriedadeId}` : '';
      const evolucaoQuery = `?dias=${periodoEvolucao}${propriedadeId ? `&fazendaId=${propriedadeId}` : ''}`;

      const [dash, lista, segs, rank, evol] = await Promise.all([
        fetch(`${API}/cotacoes-insumos/dashboard${graficosQuery}`, { headers }).then((r) => r.json()),
        fetch(`${API}/cotacoes-insumos?${queryString}`, { headers }).then((r) => r.json()),
        fetch(`${API}/cotacoes-insumos/graficos/segmentos${graficosQuery}`, { headers }).then((r) => r.json()),
        fetch(`${API}/cotacoes-insumos/graficos/ranking-empresas${graficosQuery}`, { headers }).then((r) => r.json()),
        fetch(`${API}/cotacoes-insumos/graficos/evolucao${evolucaoQuery}`, { headers }).then((r) => r.json()),
      ]);
      setDashboard(dash);
      setCotacoes(Array.isArray(lista) ? lista : []);
      setSegmentos(Array.isArray(segs) ? segs : []);
      setRanking(Array.isArray(rank) ? rank : []);
      setEvolucao(Array.isArray(evol) ? evol : []);
    } finally {
      setLoading(false);
    }
  }

  async function executarComparacao() {
    if (!compararIA.trim()) return;
    const params = new URLSearchParams({ principio_ativo: compararIA });
    if (propriedadeId) params.set('fazendaId', propriedadeId);
    const res = await fetch(`${API}/cotacoes-insumos/comparar?${params}`, { headers });
    const data = await res.json();
    setComparacao(data);
  }

  useEffect(() => { carregar(); }, [periodoEvolucao, propriedadeId]);

  const propriedadeNome = propriedades.find(p => p.id === propriedadeId)?.nome;

  const cards = dashboard ? [
    { label: 'Menor Cotação',       valor: formatCurrency(dashboard.menorCotacao),       icon: TrendingDown, cor: 'text-green-400',  bg: 'from-green-900/40 to-green-800/20',   borda: 'border-green-700/30'  },
    { label: 'Economia Potencial',  valor: formatCurrency(dashboard.economiaPotencial),  icon: TrendingUp,   cor: 'text-blue-400',   bg: 'from-blue-900/40 to-blue-800/20',    borda: 'border-blue-700/30'   },
    { label: 'Empresas Cadastradas',valor: dashboard.totalEmpresas,                      icon: Building2,    cor: 'text-orange-400', bg: 'from-orange-900/40 to-orange-800/20', borda: 'border-orange-700/30' },
    { label: 'Produtos Cotados',    valor: dashboard.totalProdutos,                      icon: Package,      cor: 'text-purple-400', bg: 'from-purple-900/40 to-purple-800/20', borda: 'border-purple-700/30' },
    { label: 'Princípios Ativos',   valor: dashboard.totalPrincipiosAtivos,              icon: Leaf,         cor: 'text-teal-400',   bg: 'from-teal-900/40 to-teal-800/20',    borda: 'border-teal-700/30'   },
    { label: 'Última Atualização',  valor: dashboard.ultimaAtualizacao ? formatDate(dashboard.ultimaAtualizacao) : '—', icon: Clock, cor: 'text-yellow-400', bg: 'from-yellow-900/40 to-yellow-800/20', borda: 'border-yellow-700/30' },
  ] : [];

  return (
    <div className="min-h-screen bg-[#0a0f0a] text-white p-4 md:p-6 space-y-4">

      {/* Cabeçalho */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-white flex items-center gap-2">
            <Leaf className="text-green-400" size={28} /> Cotações de Insumos
          </h1>
          <p className="text-gray-400 mt-1 text-sm">
            {propriedadeNome
              ? `Exibindo cotações de: ${propriedadeNome}`
              : 'Compare preços de defensivos, fertilizantes, sementes e biológicos'}
          </p>
        </div>
        <div className="flex gap-2 flex-wrap">
          <button onClick={carregar} className="flex items-center gap-2 px-3 py-2 rounded-lg bg-gray-800 border border-gray-700 hover:bg-gray-700 transition text-sm">
            <RefreshCw size={14} /> Atualizar
          </button>
          <Link href="/produtor/cotacoes-insumos/nova" className="flex items-center gap-2 px-4 py-2 rounded-lg bg-green-600 hover:bg-green-500 transition text-sm font-medium">
            <Plus size={14} /> Nova Cotação
          </Link>
          <button onClick={() => setMostrarFiltros(!mostrarFiltros)} className="flex items-center gap-2 px-3 py-2 rounded-lg bg-gray-800 border border-gray-700 hover:bg-gray-700 transition text-sm">
            <Filter size={14} /> Filtros <ChevronDown size={12} className={`transition-transform ${mostrarFiltros ? 'rotate-180' : ''}`} />
          </button>
        </div>
      </div>

      {/* Filtros */}
      {mostrarFiltros && (
        <div className="rounded-xl bg-gray-900/60 border border-gray-700/40 p-4 grid grid-cols-2 md:grid-cols-5 gap-3">
          {[{ key: 'empresa', placeholder: 'Empresa' },{ key: 'produto', placeholder: 'Produto' },{ key: 'principio_ativo', placeholder: 'Princípio Ativo' }].map((f) => (
            <input key={f.key} placeholder={f.placeholder} value={(filtros as any)[f.key]}
              onChange={(e) => setFiltros((prev) => ({ ...prev, [f.key]: e.target.value }))}
              className="bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-green-500" />
          ))}
          <select value={filtros.segmento} onChange={(e) => setFiltros((prev) => ({ ...prev, segmento: e.target.value }))}
            className="bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-green-500">
            <option value="">Todos segmentos</option>
            {SEGMENTOS.map((s) => <option key={s} value={s}>{s}</option>)}
          </select>
          <select value={filtros.moeda} onChange={(e) => setFiltros((prev) => ({ ...prev, moeda: e.target.value }))}
            className="bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-green-500">
            <option value="">Todas moedas</option>
            {MOEDAS.map((m) => <option key={m.value} value={m.value}>{m.label}</option>)}
          </select>
          <button onClick={carregar} className="col-span-2 md:col-span-1 flex items-center justify-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-500 rounded-lg text-sm font-medium transition">
            <Search size={14} /> Buscar
          </button>
        </div>
      )}

      {/* Layout principal: 2 colunas */}
      <div className="flex gap-4 items-start">

        {/* ── Coluna esquerda (~28%) ── */}
        <div className="w-[28%] flex-shrink-0 space-y-3">

          {/* Comparador */}
          <div className="rounded-xl bg-gray-900/60 border border-gray-700/40 overflow-hidden">
            <div className="px-3 py-3 border-b border-gray-700/40">
              <div className="flex items-center gap-2">
                <GitCompare size={13} className="text-blue-400" />
                <h3 className="text-xs font-semibold text-gray-300">Comparador por Princípio Ativo</h3>
              </div>
            </div>
            <div className="p-3 space-y-2">
              <div className="flex gap-1.5">
                <input
                  placeholder="Ex: Fluazinam, Fipronil..."
                  value={compararIA}
                  onChange={(e) => setComparar(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && executarComparacao()}
                  className="flex-1 bg-gray-800 border border-gray-700 rounded-lg px-2.5 py-1.5 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-blue-500"
                />
                <button onClick={executarComparacao} className="flex items-center gap-1 px-2.5 py-1.5 bg-blue-600 hover:bg-blue-500 rounded-lg text-xs font-medium transition">
                  <GitCompare size={11} /> Buscar
                </button>
              </div>
              {comparacao?.resumo && (
                <div className="space-y-2">
                  <div className="grid grid-cols-2 gap-1.5">
                    {[
                      { label: 'Menor',     valor: formatCurrency(comparacao.resumo.menorPreco),                    cor: 'text-green-400'  },
                      { label: 'Maior',     valor: formatCurrency(comparacao.resumo.maiorPreco),                    cor: 'text-red-400'    },
                      { label: 'Médio',     valor: formatCurrency(comparacao.resumo.precoMedio),                    cor: 'text-blue-400'   },
                      { label: 'Diferença', valor: `${comparacao.resumo.diferencaPercentual.toFixed(1)}%`,          cor: 'text-orange-400' },
                    ].map((item, i) => (
                      <div key={i} className="bg-gray-800/50 rounded-lg p-1.5 text-center">
                        <div className="text-[9px] text-gray-400">{item.label}</div>
                        <div className={`font-bold text-[10px] ${item.cor}`}>{item.valor}</div>
                      </div>
                    ))}
                  </div>
                  <div className="space-y-1">
                    {comparacao.cotacoes.map((c: any, i: number) => (
                      <div key={i} className={`flex items-center justify-between px-2 py-1.5 rounded-lg text-[10px] ${i === 0 ? 'bg-green-900/30 border border-green-700/30' : 'bg-gray-800/40'}`}>
                        <span className="text-gray-300 truncate flex-1">{c.empresa}</span>
                        <span className={`font-bold flex-shrink-0 ml-1 ${i === 0 ? 'text-green-400' : 'text-white'}`}>{formatCurrency(c.preco_unitario, c.moeda)}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              {comparacao && !comparacao.resumo && (
                <div className="flex items-center gap-1.5 text-gray-500 text-[10px] py-1">
                  <Info size={11} /> Nenhuma cotação encontrada
                </div>
              )}
            </div>
          </div>

          {/* Cotações Cadastradas */}
          <div className="rounded-xl bg-gray-900/60 border border-gray-700/40 overflow-hidden">
            <div className="px-3 py-3 border-b border-gray-700/40">
              <h3 className="text-xs font-semibold text-gray-300">
                Cotações Cadastradas <span className="text-gray-500 font-normal">({cotacoes.length})</span>
              </h3>
            </div>
            {loading ? (
              <div className="p-3 space-y-2">
                {[...Array(5)].map((_, i) => <div key={i} className="h-16 rounded-lg bg-gray-800/50 animate-pulse" />)}
              </div>
            ) : cotacoes.length === 0 ? (
              <div className="py-10 flex flex-col items-center gap-2 text-gray-500 px-3">
                <Package size={24} className="opacity-30" />
                <p className="text-xs text-center">Nenhuma cotação cadastrada ainda</p>
                <Link href="/produtor/cotacoes-insumos/nova" className="text-green-400 hover:text-green-300 text-xs underline">Cadastrar primeira cotação</Link>
              </div>
            ) : (
              <div className="overflow-y-auto max-h-56 divide-y divide-gray-800/60">
                {cotacoes.map((c: any) => (
                  <div key={c.id} className="px-3 py-2.5 hover:bg-gray-800/30 transition group">
                    <div className="flex items-start justify-between gap-1 mb-1">
                      <span className="text-xs font-semibold text-white leading-tight truncate">{c.empresa}</span>
                      <span className="text-xs font-bold text-green-400 flex-shrink-0">{formatCurrency(c.preco_unitario, c.moeda)}</span>
                    </div>
                    <div className="text-[11px] text-gray-400 truncate mb-1">{c.produto_comercial}</div>
                    <div className="flex items-center justify-between gap-1">
                      <span className="px-1.5 py-0.5 rounded-full bg-green-900/40 text-green-300 text-[10px] border border-green-700/30 truncate max-w-[60%]">{c.segmento}</span>
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] text-gray-500">{formatDate(c.data_cotacao)}</span>
                        <Link href={`/produtor/cotacoes-insumos/editar/${c.id}`} className="text-[10px] text-blue-400 hover:text-blue-300 opacity-0 group-hover:opacity-100 transition">Editar</Link>
                      </div>
                    </div>
                    {c.principio_ativo && (
                      <div className="text-[10px] text-gray-500 mt-0.5 truncate">{c.principio_ativo}{c.concentracao ? ` · ${c.concentracao} ${c.unidade_concentracao}` : ''}</div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Empresas Mais Competitivas */}
          {ranking.length > 0 && (
            <div className="rounded-xl bg-gray-900/60 border border-gray-700/40 p-3">
              <h3 className="text-xs font-semibold text-gray-300 mb-2.5">Empresas Mais Competitivas</h3>
              <div className="space-y-2">
                {ranking.map((r, i) => (
                  <div key={i} className="flex items-center gap-2">
                    <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[9px] font-bold flex-shrink-0 ${i === 0 ? 'bg-yellow-500 text-black' : i === 1 ? 'bg-gray-400 text-black' : i === 2 ? 'bg-orange-600 text-white' : 'bg-gray-700 text-gray-300'}`}>{i + 1}°</span>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-0.5">
                        <span className="text-[11px] text-white font-medium truncate">{r.empresa}</span>
                        <span className="text-[10px] text-green-400 font-semibold flex-shrink-0 ml-1">{formatCurrency(r.mediaPreco)}</span>
                      </div>
                      <div className="w-full bg-gray-800 rounded-full h-1">
                        <div className="bg-green-500 h-1 rounded-full transition-all" style={{ width: `${Math.max(10, 100 - i * 18)}%` }} />
                      </div>
                    </div>
                    <span className="text-[9px] text-gray-500 flex-shrink-0">{r.totalCotacoes} cot.</span>
                  </div>
                ))}
              </div>
            </div>
          )}

        </div>

        {/* ── Coluna direita — dashboard único (~72%) ── */}
        <div className="flex-1 min-w-0 rounded-xl bg-gray-900/60 border border-gray-700/40 p-4 space-y-4">

          {/* Cards compactos */}
          {loading ? (
            <div className="grid grid-cols-3 gap-2">
              {[...Array(6)].map((_, i) => <div key={i} className="h-14 rounded-lg bg-gray-800/50 animate-pulse" />)}
            </div>
          ) : (
            <div className="grid grid-cols-3 gap-2">
              {cards.map((c, i) => (
                <div key={i} className={`rounded-lg border ${c.borda} bg-gradient-to-br ${c.bg} px-3 py-2 flex items-center justify-between gap-2`}>
                  <div>
                    <div className="text-[10px] text-gray-400 leading-tight">{c.label}</div>
                    <div className={`text-sm font-bold ${c.cor} mt-0.5`}>{c.valor}</div>
                  </div>
                  <c.icon size={14} className={`${c.cor} flex-shrink-0 opacity-70`} />
                </div>
              ))}
            </div>
          )}

          {/* Gráficos */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="rounded-xl bg-gray-800/40 border border-gray-700/30 p-4">
              <h3 className="text-xs font-semibold text-gray-300 mb-3">Comparativo de Preços por Empresa</h3>
              {ranking.length === 0 ? (
                <div className="h-40 flex items-center justify-center text-gray-500 text-xs">Sem dados</div>
              ) : (
                <ResponsiveContainer width="100%" height={180}>
                  <BarChart data={ranking} layout="vertical">
                    <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" />
                    <XAxis type="number" tick={{ fill: '#9ca3af', fontSize: 10 }} />
                    <YAxis dataKey="empresa" type="category" tick={{ fill: '#9ca3af', fontSize: 10 }} width={90} />
                    <Tooltip formatter={(v: any) => formatCurrency(v)} contentStyle={{ background: '#111827', border: '1px solid #374151', borderRadius: 8, fontSize: 11 }} />
                    <Bar dataKey="mediaPreco" name="Preço Médio" fill="#22c55e" radius={[0, 4, 4, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </div>
            <div className="rounded-xl bg-gray-800/40 border border-gray-700/30 p-4">
              <h3 className="text-xs font-semibold text-gray-300 mb-3">Preço Médio por Segmento</h3>
              {segmentos.length === 0 ? (
                <div className="h-40 flex items-center justify-center text-gray-500 text-xs">Sem dados</div>
              ) : (
                <ResponsiveContainer width="100%" height={180}>
                  <PieChart>
                    <Pie data={segmentos} dataKey="mediaPreco" nameKey="segmento" cx="50%" cy="50%" innerRadius={40} outerRadius={70} paddingAngle={3}>
                      {segmentos.map((_, i) => <Cell key={i} fill={CORES_SEGMENTO[i % CORES_SEGMENTO.length]} />)}
                    </Pie>
                    <Tooltip formatter={(v: any) => formatCurrency(v)} contentStyle={{ background: '#111827', border: '1px solid #374151', borderRadius: 8, fontSize: 11 }} />
                    <Legend wrapperStyle={{ fontSize: 10, color: '#9ca3af' }} />
                  </PieChart>
                </ResponsiveContainer>
              )}
            </div>
            <div className="rounded-xl bg-gray-800/40 border border-gray-700/30 p-4 md:col-span-2">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-xs font-semibold text-gray-300">Evolução dos Preços</h3>
                <div className="flex gap-1">
                  {[7, 30, 90].map((d) => (
                    <button key={d} onClick={() => setPeriodoEvolucao(d)}
                      className={`px-2.5 py-1 rounded-lg text-xs transition ${periodoEvolucao === d ? 'bg-green-600 text-white' : 'bg-gray-800 text-gray-400 hover:bg-gray-700'}`}>{d}d</button>
                  ))}
                </div>
              </div>
              {evolucao.length === 0 ? (
                <div className="h-40 flex items-center justify-center text-gray-500 text-xs">Sem dados suficientes</div>
              ) : (
                <ResponsiveContainer width="100%" height={180}>
                  <LineChart data={evolucao}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" />
                    <XAxis dataKey="data" tick={{ fill: '#9ca3af', fontSize: 10 }} />
                    <YAxis tick={{ fill: '#9ca3af', fontSize: 10 }} />
                    <Tooltip formatter={(v: any) => formatCurrency(v)} contentStyle={{ background: '#111827', border: '1px solid #374151', borderRadius: 8, fontSize: 11 }} />
                    <Line type="monotone" dataKey="mediaPreco" name="Preço Médio" stroke="#22c55e" strokeWidth={2} dot={false} />
                  </LineChart>
                </ResponsiveContainer>
              )}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
