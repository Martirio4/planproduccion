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
            <div className="mb-6 flex justify-center">
              <svg 
                width="80" 
                height="80" 
                viewBox="0 0 24 24" 
                fill="none" 
                stroke="currentColor" 
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                style={{ color: theme === 'dark' ? '#14B8A6' : '#14B8A6' }}
              >
                <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
              </svg>
            </div>
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
            <div className="mb-6 flex justify-center">
              <svg 
                width="80" 
                height="80" 
                viewBox="0 0 24 24" 
                fill="none" 
                stroke="currentColor" 
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                style={{ color: theme === 'dark' ? '#14B8A6' : '#14B8A6' }}
              >
                <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"/>
              </svg>
            </div>
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
