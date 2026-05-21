'use client'
import { use } from 'react'
import LancamentoPage from '@/components/LancamentoPage'

export default function EditarLancamentoPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  return <LancamentoPage id={id} />
}

