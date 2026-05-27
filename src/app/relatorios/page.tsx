'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Cookies from 'js-cookie'
import api from '@/lib/api'
import { BarChart2, FileText, Package, Cog, Sprout, Download, FileSpreadsheet, Eye, RefreshCw } from 'lucide-react'
import SemPermissao from '@/components/ui/SemPermissao'

const SUPER_ADMINS = ['luciancardoso@agroflow.com', 'admin01@agroflow.com']

const formatCurrency = (v: any) =>
  new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(parseFloat(v) || 0)

const formatDate = (d: string) =>
  d ? new Date(d).toLocaleDateString('pt-BR') : '—'

type AbaType = 'financeiro' | 'estoque' | 'safras' | 'maquinarios'

export default function RelatoriosPage() {
  const router = useRouter()
  const [autorizado, setAutorizado] = useState<boolean | null>(null)
  const [aba, setAba] = useState<AbaType>('financeiro')
  const [dados, setDados] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [periodo, setPeriodo] = useState('ANO_ATUAL')

  useEffect(() => {
    const u = Cookies.get('user')
    if (u) {
      const parsed = JSON.parse(u)
      const isSuperAdmin = SUPER_ADMINS.includes(parsed.email)
      if (parsed.perfil === 'admin' || isSuperAdmin) { setAutorizado(true); return }
      const perm = parsed.permissoes || {}
      if (perm?.relatorios?.ver === true) { setAutorizado(true) } else { setAutorizado(false) }
    }
  }, [])

  useEffect(() => {
    if (autorizado) carregarDados()
  }, [aba, autorizado, periodo])

  const carregarDados = async () => {
    setLoading(true)
    setDados([])
    try {
      let url = ''
      if (aba === 'financeiro') url = `/financeiro`
      if (aba === 'estoque') url = `/estoque`
      if (aba === 'safras') url = `/safras`
      if (aba === 'maquinarios') url = `/maquinarios`
      const { data } = await api.get(url)
      setDados(Array.isArray(data) ? data : [])
    } catch { setDados([]) }
    finally { setLoading(false) }
  }

  const exportarPDF = async () => {
    const { default: jsPDF } = await import('jspdf')
    const { default: autoTable } = await import('jspdf-autotable')
    const doc = new jsPDF()

    doc.setFontSize(16)
    doc.text(`Relatório — ${abas.find(a => a.key === aba)?.label}`, 14, 20)
    doc.setFontSize(10)
    doc.text(`Gerado em: ${new Date().toLocaleString('pt-BR')}`, 14, 28)

    const { colunas, linhas } = getColunasLinhas()
    autoTable(doc, {
      head: [colunas],
      body: linhas,
      startY: 35,
      styles: { fontSize: 9 },
      headStyles: { fillColor: [22, 101, 52] },
    })

    doc.save(`relatorio-${aba}-${new Date().toISOString().split('T')[0]}.pdf`)
  }

  const exportarExcel = async () => {
    const XLSX = await import('xlsx')
    const { colunas, linhas } = getColunasLinhas()
    const ws = XLSX.utils.aoa_to_sheet([colunas, ...linhas])
    const wb = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(wb, ws, abas.find(a => a.key === aba)?.label || 'Relatório')
    XLSX.writeFile(wb, `relatorio-${aba}-${new Date().toISOString().split('T')[0]}.xlsx`)
  }

  const getColunasLinhas = () => {
    if (aba === 'financeiro') {
      return {
        colunas: ['Descrição', 'Tipo', 'Valor', 'Data', 'Status'],
        linhas: dados.map(d => [
          d.descricao || '—',
          d.tipo || '—',
          formatCurrency(d.valor || 0),
          formatDate(d.data),
          d.status || '—',
        ])
      }
    }
    if (aba === 'estoque') {
      return {
        colunas: ['Produto', 'Quantidade', 'Unidade', 'Categoria', 'Vencimento'],
        linhas: dados.map(d => [
          d.nome || '—',
          d.quantidade || '—',
          d.unidade || '—',
          d.categoria || '—',
          formatDate(d.vencimento),
        ])
      }
    }
    if (aba === 'safras') {
      return {
        colunas: ['Nome', 'Cultura', 'Ano', 'Área (ha)', 'Status', 'Início', 'Fim'],
        linhas: dados.map(d => [
          d.nome || '—',
          d.cultura || '—',
          d.ano || '—',
          d.areaHectares || '—',
          d.status || '—',
          formatDate(d.dataInicio),
          formatDate(d.dataFim),
        ])
      }
    }
    if (aba === 'maquinarios') {
      return {
        colunas: ['Nome', 'Modelo', 'Marca', 'Ano', 'Status', 'Próx. Manutenção'],
        linhas: dados.map(d => [
          d.nome || '—',
          d.modelo || '—',
          d.marca || '—',
          d.ano || '—',
          d.status || '—',
          formatDate(d.proximaManutencao),
        ])
      }
    }
    return { colunas: [], linhas: [] }
  }

  const abas: { key: AbaType; label: string; icon: any; color: string }[] = [
    { key: 'financeiro', label: 'Financeiro', icon: FileText, color: 'text-green-400' },
    { key: 'estoque', label: 'Estoque', icon: Package, color: 'text-orange-400' },
    { key: 'safras', label: 'Safras', icon: Sprout, color: 'text-emerald-400' },
    { key: 'maquinarios', label: 'Maquinários', icon: Cog, color: 'text-red-400' },
  ]

  if (autorizado === null) return null
  if (!autorizado) return <SemPermissao />

  const { colunas, linhas } = getColunasLinhas()

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-green-100 flex items-center gap-3">
            <BarChart2 className="w-7 h-7 text-green-400" />
            Relatórios
          </h1>
          <p className="text-green-600 mt-1">Visualize e exporte dados do sistema</p>
        </div>
        <div className="flex gap-2">
          <button onClick={carregarDados}
            className="w-9 h-9 bg-[#1a251a] border border-[#243324] rounded-xl flex items-center justify-center text-green-600 hover:text-green-400">
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
          <button onClick={exportarPDF}
            className="flex items-center gap-2 px-4 py-2 bg-red-700 hover:bg-red-600 text-white rounded-xl text-sm font-medium transition-colors">
            <Download className="w-4 h-4" /> PDF
          </button>
          <button onClick={exportarExcel}
            className="flex items-center gap-2 px-4 py-2 bg-emerald-700 hover:bg-emerald-600 text-white rounded-xl text-sm font-medium transition-colors">
            <FileSpreadsheet className="w-4 h-4" /> Excel
          </button>
        </div>
      </div>

      {/* Abas */}
      <div className="flex gap-2 flex-wrap">
        {abas.map(a => (
          <button key={a.key} onClick={() => setAba(a.key)}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all border ${
              aba === a.key
                ? 'bg-green-900/40 border-green-700 text-green-300'
                : 'bg-[#111811] border-[#1e2e1e] text-green-600 hover:text-green-400'
            }`}>
            <a.icon className={`w-4 h-4 ${a.color}`} />
            {a.label}
          </button>
        ))}
      </div>

      {/* Totais financeiro */}
{aba === 'financeiro' && dados.length > 0 && (
  <div className="grid grid-cols-3 gap-4">
    <div className="rounded-2xl p-4 border border-emerald-500/20 bg-emerald-500/5">
      <p className="text-xs text-gray-400 mb-1">Total Receitas</p>
      <p className="text-xl font-bold text-emerald-400">
        {formatCurrency(dados.filter(d => d.tipo === 'RECEITA').reduce((s, d) => s + (parseFloat(d.valor) || 0), 0))}
      </p>
    </div>
    <div className="rounded-2xl p-4 border border-red-500/20 bg-red-500/5">
      <p className="text-xs text-gray-400 mb-1">Total Despesas</p>
      <p className="text-xl font-bold text-red-400">
        {formatCurrency(dados.filter(d => d.tipo === 'DESPESA').reduce((s, d) => s + (parseFloat(d.valor) || 0), 0))}
      </p>
    </div>
    <div className="rounded-2xl p-4 border border-blue-500/20 bg-blue-500/5">
      <p className="text-xs text-gray-400 mb-1">Saldo</p>
      <p className="text-xl font-bold text-blue-400">
        {formatCurrency(
          dados.filter(d => d.tipo === 'RECEITA').reduce((s, d) => s + (parseFloat(d.valor) || 0), 0) -
          dados.filter(d => d.tipo === 'DESPESA').reduce((s, d) => s + (parseFloat(d.valor) || 0), 0)
        )}
      </p>
    </div>
  </div>
)}

      {/* Tabela */}
      <div className="bg-[#111811] border border-[#1e2e1e] rounded-2xl overflow-hidden">
        <div className="flex items-center justify-between px-4 py-3 border-b border-[#1e2e1e]">
          <div className="flex items-center gap-2">
            <Eye className="w-4 h-4 text-green-600" />
            <span className="text-green-400 text-sm font-medium">
              {dados.length} registro{dados.length !== 1 ? 's' : ''}
            </span>
          </div>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-16">
            <div className="w-8 h-8 border-2 border-green-600 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : dados.length === 0 ? (
          <div className="text-center py-16 text-green-700">
            <BarChart2 className="w-12 h-12 mx-auto mb-3 opacity-30" />
            <p>Nenhum dado encontrado</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-[#243324] bg-[#0d160d]">
                  {colunas.map(c => (
                    <th key={c} className="text-left py-3 px-4 text-green-600 font-medium">{c}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {linhas.map((linha, i) => (
                  <tr key={i} className="border-b border-[#1a251a] hover:bg-[#1a251a]/50 transition-colors">
                    {linha.map((cel, j) => (
                      <td key={j} className="py-3 px-4 text-green-300 text-xs">
                        {aba === 'financeiro' && j === 1 ? (
                          <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                            cel === 'RECEITA' ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'
                          }`}>{cel}</span>
                        ) : aba === 'financeiro' && j === 2 ? (
                          <span className={dados[i]?.tipo === 'RECEITA' ? 'text-green-400 font-medium' : 'text-red-400 font-medium'}>
                            {cel}
                          </span>
                        ) : (
                          cel
                        )}
                      </td>
                    ))}
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
