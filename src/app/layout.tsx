import type { Metadata } from 'next'
import './globals.css'
import { SafraProvider } from '@/lib/SafraContext'
import { PropriedadeProvider } from '@/contexts/PropriedadeContext'

export const metadata: Metadata = {
  title: 'AgroFlow',
  description: 'Sistema de gestão agrícola',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR">
      <body>
        <SafraProvider>
          <PropriedadeProvider>
            {children}
          </PropriedadeProvider>
        </SafraProvider>
      </body>
    </html>
  )
}
