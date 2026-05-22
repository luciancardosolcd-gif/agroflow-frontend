'use client'
import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Cookies from 'js-cookie'

export default function EditarLancamentoLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter()

  useEffect(() => {
    const token = Cookies.get('accessToken')
    if (!token) router.push('/login')
  }, [router])

  return <>{children}</>
}
