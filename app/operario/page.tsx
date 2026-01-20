'use client'

import { useApp } from '@/context/AppContext'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

export default function OperarioPage() {
  const { state } = useApp()
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
        <h2 className="text-3xl font-bold mb-2">Vista Operario</h2>
        <p className="text-gray-600 mb-4">Seleccione una máquina para ver sus órdenes</p>
        <Link href="/" className="btn btn-secondary">
          ← Volver al inicio
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {maquinasDisponibles.map((maquina) => {
          const linea = state.lineas[maquina.lineaId]
          const orden = state.ordenes[maquina.ordenId]
          
          return (
            <Link
              key={maquina.id}
              href={`/operario/maquina/${maquina.id}`}
              className="card cursor-pointer hover:border-[#14B8A6] hover:shadow-lg hover:-translate-y-1 transition-all"
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-2xl font-bold">{maquina.id}</h3>
                <div className="text-4xl">🔧</div>
              </div>
              <div className="space-y-2">
                <div>
                  <span className="text-sm text-gray-500">Línea:</span>
                  <div className="font-semibold">{linea?.nombre || 'Sin línea'}</div>
                </div>
                <div>
                  <span className="text-sm text-gray-500">Orden Actual:</span>
                  <div className="font-semibold">{orden ? orden.id : 'Sin orden'}</div>
                </div>
                {orden && (
                  <div>
                    <span className="text-sm text-gray-500">Producto:</span>
                    <div className="font-semibold">{orden.producto}</div>
                  </div>
                )}
                <div>
                  <span className="text-sm text-gray-500">Turno:</span>
                  <div className="font-semibold">{maquina.turno}</div>
                </div>
                <div>
                  <span className="text-sm text-gray-500">Producido:</span>
                  <div className="font-semibold text-[#14B8A6]">{formatNumber(maquina.producidoActual)} kg</div>
                </div>
              </div>
            </Link>
          )
        })}
      </div>
    </div>
  )
}
