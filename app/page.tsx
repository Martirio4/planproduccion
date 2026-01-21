'use client'

import Link from 'next/link'
import { useTheme } from '@/context/ThemeContext'

export default function Home() {
  const { theme } = useTheme()

  return (
    <div 
      className="min-h-screen flex items-center justify-center"
      style={{
        backgroundColor: theme === 'dark' ? '#111827' : '#f5f7fb'
      }}
    >
      <div className="max-w-4xl w-full px-4">
        <div className="text-center mb-12">
          <h1 
            className="text-4xl font-bold mb-4"
            style={{ color: theme === 'dark' ? '#f9fafb' : '#111827' }}
          >
            Plan Semanal de Producción
          </h1>
          <p 
            className="text-xl"
            style={{ color: theme === 'dark' ? '#9ca3af' : '#374151' }}
          >
            AGRANA Fruit
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <Link
            href="/admin/dashboard"
            className="card cursor-pointer hover:border-[#14B8A6] hover:shadow-lg hover:-translate-y-1 transition-all text-center p-12"
          >
            <div className="text-7xl mb-6">👔</div>
            <h2 
              className="text-3xl font-bold mb-4"
              style={{ color: theme === 'dark' ? '#f9fafb' : '#111827' }}
            >
              Vista Administrador
            </h2>
            <p 
              className="text-lg"
              style={{ color: theme === 'dark' ? '#9ca3af' : '#374151' }}
            >
              Dashboard, KPIs, Gantt semanal, detalle de líneas y órdenes
            </p>
          </Link>

          <Link
            href="/operario"
            className="card cursor-pointer hover:border-[#14B8A6] hover:shadow-lg hover:-translate-y-1 transition-all text-center p-12"
          >
            <div className="text-7xl mb-6">🔧</div>
            <h2 
              className="text-3xl font-bold mb-4"
              style={{ color: theme === 'dark' ? '#f9fafb' : '#111827' }}
            >
              Vista Operario
            </h2>
            <p 
              className="text-lg"
              style={{ color: theme === 'dark' ? '#9ca3af' : '#374151' }}
            >
              Listado de máquinas, órdenes y registro de producción y paradas
            </p>
          </Link>
        </div>
      </div>
    </div>
  )
}
