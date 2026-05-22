'use client'
import LancamentoPage from '@/components/LancamentoPage'

export default function EditarLancamentoPage({ params }: { params: { id: string } }) {
  return <LancamentoPage id={params.id} />
}
