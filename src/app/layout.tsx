import type { Metadata } from 'next'
import './globals.css'
import { SafraProvider } from '@/lib/SafraContext'

export const metadata: Metadata = {
  title: 'AgroFlow - Sistema de Gestão Agrícola',
  description: 'Plataforma completa de gestão para o agronegócio',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR">
      <body>
        <SafraProvider>
          {children}
        </SafraProvider>
      </body>
    </html>
  )
}
