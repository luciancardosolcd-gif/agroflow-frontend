'use client';

import { useState, useEffect, useRef } from 'react';

interface Categoria {
  id: string;
  code: string;
  name: string;
  type: 'sintetica' | 'analitica';
  nature: 'receita' | 'despesa' | 'neutro';
  level: number;
  allowEntries: boolean;
  active: boolean;
  color?: string;
  children?: Categoria[];
}

interface CategoriaSeletorProps {
  token: string;
  value?: string; // id da categoria selecionada
  onChange: (id: string, categoria: Categoria) => void;
  placeholder?: string;
  tipoFiltro?: 'receita' | 'despesa'; // filtrar por natureza
}

const API_URL = process.env.NEXT_PUBLIC_API_URL;

export default function CategoriaSeletor({
  token,
  value,
  onChange,
  placeholder = 'Selecione a categoria financeira',
  tipoFiltro,
}: CategoriaSeletorProps) {
  const [open, setOpen] = useState(false);
  const [busca, setBusca] = useState('');
  const [arvore, setArvore] = useState<Categoria[]>([]);
  const [expandidos, setExpandidos] = useState<Set<string>>(new Set());
  const [selecionada, setSelecionada] = useState<Categoria | null>(null);
  const [loading, setLoading] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  // Fechar ao clicar fora
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  // Carregar árvore de categorias
  useEffect(() => {
    if (!token) return;
    setLoading(true);
    fetch(`${API_URL}/categorias-financeiras/arvore`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((r) => r.json())
      .then((data) => {
        setArvore(Array.isArray(data) ? data : []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [token]);

  // Resolver categoria pelo id quando value muda externamente
  useEffect(() => {
    if (!value || !arvore.length) return;
    const encontrar = (cats: Categoria[]): Categoria | null => {
      for (const c of cats) {
        if (c.id === value) return c;
        if (c.children) {
          const r = encontrar(c.children);
          if (r) return r;
        }
      }
      return null;
    };
    const cat = encontrar(arvore);
    if (cat) setSelecionada(cat);
  }, [value, arvore]);

  function toggleExpand(id: string) {
    setExpandidos((prev) => {
      const novo = new Set(prev);
      novo.has(id) ? novo.delete(id) : novo.add(id);
      return novo;
    });
  }

  function selecionar(cat: Categoria) {
    if (!cat.allowEntries) return; // só analíticas aceitam lançamento
    setSelecionada(cat);
    onChange(cat.id, cat);
    setOpen(false);
    setBusca('');
  }

  // Achatar para busca
  function achatar(cats: Categoria[]): Categoria[] {
    return cats.flatMap((c) => [c, ...(c.children ? achatar(c.children) : [])]);
  }

  const todas = achatar(arvore);
  const filtradas = busca
    ? todas.filter(
        (c) =>
          (c.allowEntries) &&
          (!tipoFiltro || c.nature === tipoFiltro) &&
          (c.name.toLowerCase().includes(busca.toLowerCase()) ||
            c.code.includes(busca))
      )
    : [];

  function renderNo(cat: Categoria, depth = 0): React.ReactNode {
    if (tipoFiltro && cat.nature !== tipoFiltro && cat.nature !== 'neutro') return null;
    const temFilhos = cat.children && cat.children.length > 0;
    const expandido = expandidos.has(cat.id);
    const ehAnalitica = cat.allowEntries;
    const isSelecionada = selecionada?.id === cat.id;

    return (
      <div key={cat.id}>
        <div
          onClick={() => {
            if (temFilhos) toggleExpand(cat.id);
            else selecionar(cat);
          }}
          className={`
            flex items-center gap-2 px-3 py-2 cursor-pointer select-none transition-colors
            ${isSelecionada ? 'bg-green-900/40 text-green-300' : 'hover:bg-gray-700/60'}
            ${!ehAnalitica ? 'opacity-80' : ''}
          `}
          style={{ paddingLeft: `${12 + depth * 16}px` }}
        >
          {/* Seta de expandir */}
          {temFilhos ? (
            <span
              className="text-gray-400 text-xs transition-transform duration-150"
              style={{ transform: expandido ? 'rotate(90deg)' : 'rotate(0deg)', display: 'inline-block' }}
            >
              ▶
            </span>
          ) : (
            <span className="w-3 inline-block" />
          )}

          {/* Bolinha de cor para sintéticas, ícone para analíticas */}
          {cat.color ? (
            <span
              className="w-2.5 h-2.5 rounded-full flex-shrink-0"
              style={{ backgroundColor: cat.color }}
            />
          ) : ehAnalitica ? (
            <span className="text-gray-500 text-xs">◈</span>
          ) : (
            <span className="w-2.5 h-2.5" />
          )}

          <span
            className={`flex-1 text-sm ${
              ehAnalitica ? 'text-gray-200' : 'text-gray-400 font-medium'
            }`}
          >
            {cat.name}
          </span>
          <span className="text-xs text-gray-500 font-mono">{cat.code}</span>
        </div>

        {temFilhos && expandido && (
          <div>
            {cat.children!.map((filho) => renderNo(filho, depth + 1))}
          </div>
        )}
      </div>
    );
  }

  return (
    <div ref={ref} className="relative w-full">
      {/* Botão principal */}
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className={`
          w-full flex items-center justify-between gap-2 px-3 py-2.5 rounded-lg border text-sm transition-all
          ${open
            ? 'border-green-500 bg-gray-800 ring-1 ring-green-500/30'
            : 'border-gray-600 bg-gray-800 hover:border-gray-500'
          }
        `}
      >
        <div className="flex items-center gap-2 min-w-0">
          <svg className="w-4 h-4 text-gray-400 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
          </svg>
          {selecionada ? (
            <span className="text-gray-200 truncate">
              {selecionada.name}{' '}
              <span className="text-gray-500 font-mono text-xs">({selecionada.code})</span>
            </span>
          ) : (
            <span className="text-gray-500">{placeholder}</span>
          )}
        </div>
        <svg
          className={`w-4 h-4 text-gray-400 flex-shrink-0 transition-transform ${open ? 'rotate-180' : ''}`}
          fill="none" viewBox="0 0 24 24" stroke="currentColor"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {/* Dropdown */}
      {open && (
        <div className="absolute z-50 mt-1 w-full bg-gray-800 border border-gray-600 rounded-lg shadow-2xl overflow-hidden">
          {/* Busca */}
          <div className="p-2 border-b border-gray-700">
            <div className="flex items-center gap-2 bg-gray-700/60 rounded-md px-3 py-1.5">
              <svg className="w-3.5 h-3.5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <input
                autoFocus
                type="text"
                value={busca}
                onChange={(e) => setBusca(e.target.value)}
                placeholder="Buscar categoria..."
                className="bg-transparent text-sm text-gray-200 placeholder-gray-500 outline-none w-full"
              />
              {busca && (
                <button onClick={() => setBusca('')} className="text-gray-500 hover:text-gray-300">×</button>
              )}
            </div>
          </div>

          {/* Lista */}
          <div className="max-h-72 overflow-y-auto">
            {loading ? (
              <div className="flex items-center justify-center py-6 text-gray-500 text-sm">
                Carregando categorias...
              </div>
            ) : busca ? (
              filtradas.length > 0 ? (
                filtradas.map((cat) => (
                  <div
                    key={cat.id}
                    onClick={() => selecionar(cat)}
                    className={`flex items-center gap-2 px-3 py-2 cursor-pointer text-sm hover:bg-gray-700/60 transition-colors
                      ${selecionada?.id === cat.id ? 'bg-green-900/40 text-green-300' : 'text-gray-200'}
                    `}
                  >
                    <span className="text-gray-500 font-mono text-xs w-14 flex-shrink-0">{cat.code}</span>
                    <span className="flex-1">{cat.name}</span>
                  </div>
                ))
              ) : (
                <div className="py-6 text-center text-gray-500 text-sm">
                  Nenhuma categoria encontrada
                </div>
              )
            ) : (
              arvore.map((cat) => renderNo(cat))
            )}
          </div>

          {/* Rodapé informativo */}
          {!busca && (
            <div className="px-3 py-1.5 border-t border-gray-700 text-xs text-gray-600">
              Apenas categorias analíticas aceitam lançamentos
            </div>
          )}
        </div>
      )}
    </div>
  );
}

