'use client'
import { Construction, Tractor, Leaf, BarChart3, FileText, Package } from 'lucide-react'

export default function PainelProdutorPage() {
  const modulos = [
    { icon: Tractor, label: 'Maquinários', desc: 'Gestão de equipamentos', color: 'text-yellow-400', bg: 'bg-yellow-900/20 border-yellow-800/40', disponivel: false },
    { icon: Leaf, label: 'Culturas', desc: 'Plantio e colheita', color: 'text-green-400', bg: 'bg-green-900/20 border-green-800/40', disponivel: false },
    { icon: BarChart3, label: 'Produção', desc: 'Relatórios de produção', color: 'text-blue-400', bg: 'bg-blue-900/20 border-blue-800/40', disponivel: false },
    { icon: Package, label: 'Insumos', desc: 'Controle de insumos', color: 'text-orange-400', bg: 'bg-orange-900/20 border-orange-800/40', disponivel: false },
    { icon: FileText, label: 'Relatórios', desc: 'Relatórios do produtor', color: 'text-purple-400', bg: 'bg-purple-900/20 border-purple-800/40', disponivel: false },
  ]

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-3xl text-green-100 flex items-center gap-3">
          <Tractor className="w-8 h-8 text-yellow-400" />
          Painel do Produtor
        </h1>
        <p className="text-green-600 mt-1">Módulos exclusivos para gestão da produção agrícola</p>
      </div>

      <div className="card border-yellow-900/30 bg-yellow-900/10">
        <div className="flex items-center gap-4">
          <Construction className="w-10 h-10 text-yellow-400 flex-shrink-0" />
          <div>
            <h2 className="text-yellow-300 font-semibold text-lg">Em desenvolvimento</h2>
            <p className="text-yellow-600 text-sm">Este painel está sendo preparado com funcionalidades exclusivas para produtores rurais. Em breve estará disponível!</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        {modulos.map((mod) => (
          <div key={mod.label} className={`card border ${mod.bg} opacity-60 cursor-not-allowed`}>
            <mod.icon className={`w-8 h-8 ${mod.color} mb-3`} />
            <div className="text-green-200 font-medium text-sm">{mod.label}</div>
            <div className="text-green-700 text-xs mt-1">{mod.desc}</div>
            <div className="mt-2 text-xs text-yellow-600">🔒 Em breve</div>
          </div>
        ))}
      </div>
    </div>
  )
}
