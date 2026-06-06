'use client';

import { useState, useEffect } from 'react';
import api from '@/lib/api';
import { PeriodoFiltro } from '@/app/financeiro/useDashboardFinanceiro';

interface CategoriaResumo {
  id: string;
  code: string;
  name: string;
  nature: 'receita' | 'despesa' | 'neutro';
  color?: string;
  total: number;
  qtd_lancamentos: number;
  percentual: string;
}

interface DashboardData {
  summary: {
    totalReceitas: number;
    totalDespesas: number;
    lucroLiquido: number;
    margemLiquida: number;
  };
  receitas: CategoriaResumo[];
  despesas: CategoriaResumo[];
}

interface PainelCustoRealizadoProps {
  safraId?: string;
  fazendaId?: string;
  periodo?: PeriodoFiltro;
}

const CORES_DESPESA = ['#ef4444', '#f97316', '#3b82f6', '#a855f7', '#06b6d4', '#84cc16'];
const CORES_RECEITA = ['#22c55e', '#16a34a', '#15803d', '#166534', '#14532d'];

function formatBRL(v: number) {
  return v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

// Converte PeriodoFiltro em {inicio, fim} no formato YYYY-MM-DD
function resolverDatas(periodo?: PeriodoFiltro): { inicio: string; fim: string } {
  const hoje = new Date();
  const fmt = (d: Date) => d.toISOString().split('T')[0];

  switch (periodo) {
    case 'MES_ATUAL':
      return {
        inicio: fmt(new Date(hoje.getFullYear(), hoje.getMonth(), 1)),
        fim:    fmt(new Date(hoje.getFullYear(), hoje.getMonth() + 1, 0)),
      };
    case 'MES_ANTERIOR':
      return {
        inicio: fmt(new Date(hoje.getFullYear(), hoje.getMonth() - 1, 1)),
        fim:    fmt(new Date(hoje.getFullYear(), hoje.getMonth(), 0)),
      };
    case 'TRIMESTRE':
      return {
        inicio: fmt(new Date(hoje.getFullYear(), hoje.getMonth() - 2, 1)),
        fim:    fmt(new Date(hoje.getFullYear(), hoje.getMonth() + 1, 0)),
      };
    case 'ANO_ATUAL':
      return {
        inicio: fmt(new Date(hoje.getFullYear(), 0, 1)),
        fim:    fmt(new Date(hoje.getFullYear(), 11, 31)),
      };
    default:
      return { inicio: '', fim: '' };
  }
}

function DonutChart({ dados, total, tipo }: { dados: CategoriaResumo[]; total: number; tipo: 'receita' | 'despesa' }) {
  const RAIO = 80;
  const ESPESSURA = 22;
  const CENTRO = 100;
  const circunferencia = 2 * Math.PI * RAIO;

  let offset = 0;
  const fatias = dados
    .filter((d) => d.total > 0)
    .map((d, i) => {
      const pct = total > 0 ? d.total / total : 0;
      const comprimento = pct * circunferencia;
      offset += comprimento;
      return {
        ...d,
        comprimento,
        dashoffset: circunferencia - (offset - comprimento),
        cor: d.color || (tipo === 'despesa' ? CORES_DESPESA[i % CORES_DESPESA.length] : CORES_RECEITA[i % CORES_RECEITA.length]),
        pct,
      };
    });

  return (
    <div className="relative flex items-center justify-center">
      <svg width="200" height="200" viewBox="0 0 200 200">
        <circle cx={CENTRO} cy={CENTRO} r={RAIO} fill="none" stroke="#374151" strokeWidth={ESPESSURA} />
        {fatias.map((f, i) => (
          <circle key={i} cx={CENTRO} cy={CENTRO} r={RAIO} fill="none"
            stroke={f.cor} strokeWidth={ESPESSURA}
            strokeDasharray={`${f.comprimento} ${circunferencia - f.comprimento}`}
            strokeDashoffset={f.dashoffset} strokeLinecap="butt"
            transform={`rotate(-90 ${CENTRO} ${CENTRO})`}
            style={{ transition: 'stroke-dasharray 0.5s ease' }} />
        ))}
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
        <span className="text-[10px] text-gray-500 uppercase tracking-widest">Total</span>
        <span className="text-sm font-bold text-gray-100 leading-tight text-center px-4">{formatBRL(total)}</span>
      </div>
    </div>
  );
}

function BarraCategoria({ cat, total, cor }: { cat: CategoriaResumo; total: number; cor: string }) {
  const pct = parseFloat(cat.percentual);
  return (
    <div className="group">
      <div className="flex items-center gap-2 mb-1">
        <span className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ backgroundColor: cor }} />
        <span className="text-sm text-gray-300 flex-1 truncate">{cat.code} {cat.name}</span>
        <span className="text-sm font-semibold text-gray-200 tabular-nums">{formatBRL(cat.total)}</span>
      </div>
      <div className="flex items-center gap-2" style={{ paddingLeft: '18px' }}>
        <div className="flex-1 bg-gray-700 rounded-full h-1.5 overflow-hidden">
          <div className="h-full rounded-full transition-all duration-700" style={{ width: `${pct}%`, backgroundColor: cor }} />
        </div>
        <span className="text-xs text-gray-500 tabular-nums w-10 text-right">{pct.toFixed(2)}%</span>
      </div>
    </div>
  );
}

export default function PainelCustoRealizado({ safraId, fazendaId, periodo }: PainelCustoRealizadoProps) {
  const [dados, setDados] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [erro, setErro] = useState('');
  const [aba, setAba] = useState<'despesa' | 'receita'>('despesa');

  // Se vier período global, usa ele; senão permite filtro manual
  const datasAutomaticas = periodo ? resolverDatas(periodo) : null;
  const [periodoManual, setPeriodoManual] = useState({ inicio: '', fim: '' });
  const datasAtivas = datasAutomaticas ?? periodoManual;

  useEffect(() => {
    setLoading(true);
    setErro('');
    setDados(null);

    const params = new URLSearchParams();
    if (datasAtivas.inicio) params.set('startDate', datasAtivas.inicio);
    if (datasAtivas.fim)    params.set('endDate',   datasAtivas.fim);
    if (safraId)   params.set('safraId',   safraId);
    if (fazendaId) params.set('fazendaId', fazendaId);

    api.get(`/categorias-financeiras/resumo-dashboard?${params}`)
      .then((r) => { setDados(r.data); setLoading(false); })
      .catch((e) => { setErro(e?.response?.data?.message || 'Erro ao carregar dashboard'); setLoading(false); });
  }, [datasAtivas.inicio, datasAtivas.fim, safraId, fazendaId]);

  if (loading) {
    return (
      <div className="bg-gray-800/60 rounded-xl border border-gray-700 p-8 flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-2 border-green-500 border-t-transparent rounded-full animate-spin" />
          <span className="text-gray-400 text-sm">Carregando custo realizado...</span>
        </div>
      </div>
    );
  }

  if (erro) {
    return (
      <div className="bg-gray-800/60 rounded-xl border border-red-500/30 p-6 text-center">
        <span className="text-red-400 text-sm">{erro}</span>
      </div>
    );
  }

  const lista = aba === 'despesa' ? (dados?.despesas ?? []) : (dados?.receitas ?? []);
  const total = aba === 'despesa' ? (dados?.summary.totalDespesas ?? 0) : (dados?.summary.totalReceitas ?? 0);
  const cores = aba === 'despesa' ? CORES_DESPESA : CORES_RECEITA;

  return (
    <div className="bg-gray-800/60 rounded-xl border border-gray-700 overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-4 border-b border-gray-700">
        <div className="flex items-center gap-2">
          <svg className="w-5 h-5 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
          </svg>
          <h2 className="text-gray-100 font-semibold text-sm">Custo Realizado</h2>
        </div>
        {/* Filtro manual só aparece quando não há período global */}
        {!periodo && (
          <div className="flex items-center gap-2 text-xs">
            <input type="date" value={periodoManual.inicio}
              onChange={(e) => setPeriodoManual((p) => ({ ...p, inicio: e.target.value }))}
              className="bg-gray-700 border border-gray-600 rounded-md px-2 py-1 text-gray-300 text-xs outline-none focus:border-green-500" />
            <span className="text-gray-500">até</span>
            <input type="date" value={periodoManual.fim}
              onChange={(e) => setPeriodoManual((p) => ({ ...p, fim: e.target.value }))}
              className="bg-gray-700 border border-gray-600 rounded-md px-2 py-1 text-gray-300 text-xs outline-none focus:border-green-500" />
          </div>
        )}
      </div>

      {/* Resumo geral */}
      {dados && (
        <div className="grid grid-cols-3 gap-0 border-b border-gray-700">
          <div className="px-5 py-3 border-r border-gray-700">
            <p className="text-xs text-gray-500 uppercase tracking-wide mb-0.5">Receitas</p>
            <p className="text-base font-bold text-green-400">{formatBRL(dados.summary.totalReceitas)}</p>
          </div>
          <div className="px-5 py-3 border-r border-gray-700">
            <p className="text-xs text-gray-500 uppercase tracking-wide mb-0.5">Despesas</p>
            <p className="text-base font-bold text-red-400">{formatBRL(dados.summary.totalDespesas)}</p>
          </div>
          <div className="px-5 py-3">
            <p className="text-xs text-gray-500 uppercase tracking-wide mb-0.5">Resultado</p>
            <p className={`text-base font-bold ${dados.summary.lucroLiquido >= 0 ? 'text-green-300' : 'text-red-300'}`}>
              {formatBRL(dados.summary.lucroLiquido)}
            </p>
          </div>
        </div>
      )}

      <div className="flex">
        <div className="flex flex-col items-center justify-center p-4 border-r border-gray-700 min-w-[200px]">
          {lista.length > 0 ? (
            <DonutChart dados={lista} total={total} tipo={aba} />
          ) : (
            <div className="w-48 h-48 rounded-full border-4 border-gray-700 flex items-center justify-center">
              <span className="text-gray-600 text-xs text-center">Sem dados<br/>no período</span>
            </div>
          )}
        </div>

        <div className="flex-1 flex flex-col min-w-0">
          <div className="flex border-b border-gray-700">
            {(['despesa', 'receita'] as const).map((t) => (
              <button key={t} onClick={() => setAba(t)}
                className={`flex-1 py-2.5 text-xs font-medium uppercase tracking-wide transition-colors border-b-2 -mb-px ${
                  aba === t
                    ? t === 'despesa' ? 'border-red-500 text-red-400' : 'border-green-500 text-green-400'
                    : 'border-transparent text-gray-500 hover:text-gray-400'
                }`}>
                {t === 'despesa' ? 'Despesas' : 'Receitas'}
              </button>
            ))}
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-3.5">
            {lista.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-32 gap-2">
                <p className="text-gray-600 text-sm">Nenhum lançamento com categoria</p>
                <p className="text-gray-700 text-xs text-center">Vincule categorias aos lançamentos<br/>para ver o custo realizado</p>
              </div>
            ) : (
              lista.map((cat, i) => (
                <BarraCategoria key={cat.id} cat={cat} total={total} cor={cat.color || cores[i % cores.length]} />
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
