import { ShieldX } from 'lucide-react'

export default function SemPermissao() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4">
      <div className="p-5 rounded-full bg-red-900/20 border border-red-800/40 mb-6">
        <ShieldX className="w-12 h-12 text-red-400" />
      </div>
      <h2 className="text-xl font-bold text-green-100 mb-2">Acesso não autorizado</h2>
      <p className="text-green-600 text-sm max-w-sm">
        Você não tem permissão para acessar este módulo. Entre em contato com o administrador do sistema para solicitar acesso.
      </p>
    </div>
  )
}
