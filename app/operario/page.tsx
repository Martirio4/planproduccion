'use client'

import { useApp } from '@/context/AppContext'
import { useTheme } from '@/context/ThemeContext'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

export default function OperarioPage() {
  const { state } = useApp()
  const { theme } = useTheme()
  const router = useRouter()

  const formatNumber = (num: number) => {
    return new Intl.NumberFormat('es-AR').format(num)
  }

  // Obtener todas las máquinas únicas (agrupar por línea si hay múltiples)
  const maquinas = Object.values(state.maquinas)
  
  // Si no hay máquinas, crear algunas por defecto basadas en las líneas
  const maquinasDisponibles = maquinas.length > 0 
    ? maquinas 
    : Object.values(state.lineas).map((linea, index) => ({
        id: `${linea.id}_0${index + 1}`,
        lineaId: linea.id,
        ordenId: Object.values(state.ordenes).find(o => o.lineaId === linea.id)?.id || '',
        producto: '',
        turno: 'Mañana',
        objetivoTurno: 2000,
        producidoActual: 0
      }))

  return (
    <div>
      <div className="mb-8">
        <h2 
          className="text-3xl font-bold mb-1"
          style={{ color: theme === 'dark' ? '#f9fafb' : '#111827' }}
        >
          Vista Operario
        </h2>
        <p 
          className="mb-4 text-sm"
          style={{ color: theme === 'dark' ? '#9ca3af' : '#6b7280' }}
        >
          Haz clic en una máquina para ver sus órdenes de producción
        </p>
        <Link href="/" className="btn btn-secondary">
          ← Volver al inicio
        </Link>
      </div>

      <div>
        {maquinasDisponibles.map((maquina, index) => {
          const linea = state.lineas[maquina.lineaId]
          const orden = state.ordenes[maquina.ordenId]
          
          // Colores para las máquinas (similar a las líneas)
          const colores = [
            { from: '#8B5CF6', to: '#7C3AED' }, // Púrpura
            { from: '#3B82F6', to: '#2563EB' }, // Azul
            { from: '#F59E0B', to: '#D97706' }, // Ámbar
          ]
          const color = colores[index % colores.length]
          
          // Calcular progreso basado en producido vs objetivo
          const progreso = maquina.objetivoTurno > 0 
            ? Math.min(100, (maquina.producidoActual / maquina.objetivoTurno) * 100)
            : 0
          
          return (
            <Link
              key={maquina.id}
              href={`/operario/maquina/${maquina.id}`}
              className="block p-5 mb-4 rounded-lg cursor-pointer transition-all hover:shadow-md hover:-translate-y-0.5"
              style={{ 
                borderLeftColor: color.from, 
                borderLeftWidth: '6px',
                backgroundColor: theme === 'dark' ? '#1f2937' : '#ffffff',
                borderTop: theme === 'dark' ? '2px solid #4b5563' : '2px solid #e5e7eb',
                borderRight: theme === 'dark' ? '2px solid #4b5563' : '2px solid #e5e7eb',
                borderBottom: theme === 'dark' ? '2px solid #4b5563' : '2px solid #e5e7eb'
              }}
            >
              <div className="flex justify-between items-center">
                <div className="flex-1">
                  <div 
                    className="text-lg font-semibold mb-2"
                    style={{ color: theme === 'dark' ? '#f9fafb' : '#111827' }}
                  >
                    {linea?.nombre || maquina.id}
                  </div>
                  <div className="flex items-center gap-4 text-sm">
                    {orden && (
                      <span 
                        style={{ color: theme === 'dark' ? '#9ca3af' : '#6b7280' }}
                      >
                        {orden.producto}
                      </span>
                    )}
                    <span 
                      style={{ color: theme === 'dark' ? '#9ca3af' : '#6b7280' }}
                    >
                      Turno: {maquina.turno}
                    </span>
                    <span 
                      style={{ color: theme === 'dark' ? '#9ca3af' : '#6b7280' }}
                    >
                      {formatNumber(maquina.producidoActual)} kg
                    </span>
                  </div>
                </div>
                <div className="text-right ml-4">
                  <div className="text-base font-bold" style={{ color: color.from }}>
                    {orden ? orden.id : 'Sin orden'}
                  </div>
                  {orden && (
                    <div 
                      className="text-xs mt-1"
                      style={{ color: theme === 'dark' ? '#9ca3af' : '#6b7280' }}
                    >
                      Orden Actual
                    </div>
                  )}
                </div>
              </div>
            </Link>
          )
        })}
      </div>
    </div>
  )
}
