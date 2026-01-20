import type { Metadata } from 'next'
import './globals.css'
import { AppProvider } from '@/context/AppContext'
import { ToastProvider } from '@/components/Toast'
import { Navbar } from '@/components/Navbar'

export const metadata: Metadata = {
  title: 'Plan Semanal de Producción - AGRANA Fruit',
  description: 'Sistema de gestión de plan semanal de producción',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="es">
      <body>
        <AppProvider>
          <ToastProvider>
            <Navbar />
            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
              {children}
            </main>
          </ToastProvider>
        </AppProvider>
      </body>
    </html>
  )
}
