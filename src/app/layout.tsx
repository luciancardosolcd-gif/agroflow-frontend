import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'AgroFlow - Sistema de Gestão Agrícola',
  description: 'Plataforma completa de gestão para o agronegócio',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR">
      <body>{children}</body>
    </html>
  )
}
