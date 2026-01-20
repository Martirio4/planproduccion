'use client'

import { useApp } from '@/context/AppContext'
import { useRouter } from 'next/navigation'
import { use } from 'react'

export default function MaquinaPage({ params }: { params: Promise<{ maquinaId: string }> }) {
  const { state } = useApp()
  const router = useRouter()
  
  const { maquinaId } = use(params)

  let maquina = state.maquinas[maquinaId]
  if (!maquina) {
    // Crear máquina por defecto si no existe
    maquina = {
      id: maquinaId,
      lineaId: 'LINEA_A',
      ordenId: 'FR-342',
      producto: 'Pulpa Manzana',
      turno: 'Mañana',
      objetivoTurno: 2000,
      producidoActual: 7200
    }
  }

  const orden = state.ordenes[maquina.ordenId]

  const formatNumber = (num: number) => {
    return new Intl.NumberFormat('es-AR').format(num)
  }

  const getEstadoBadgeClass = (estado: string) => {
    const map: Record<string, string> = {
      'Planificado': 'badge-planned',
      'En proceso': 'badge-process',
      'En espera calidad': 'badge-quality',
      'Terminado': 'badge-finished',
      'Atrasado': 'badge-delayed'
    }
    return map[estado] || 'badge-planned'
  }

  const handleAction = (action: 'produccion' | 'parada') => {
    router.push(`/maquina/${maquinaId}/${action}`)
  }

  return (
    <div>
      <div className="mb-8">
        <h2 className="text-3xl font-bold">Máquina: {maquinaId}</h2>
      </div>

      <div className="card mb-8">
        <h3 className="text-xl font-semibold mb-4">Contexto Actual</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          <div className="p-3 bg-gray-50 rounded-lg">
            <label className="text-xs text-gray-500 block mb-1">Turno</label>
            <div className="text-lg font-semibold">{maquina.turno}</div>
          </div>
          <div className="p-3 bg-gray-50 rounded-lg">
            <label className="text-xs text-gray-500 block mb-1">Producto</label>
            <div className="text-lg font-semibold">{orden ? orden.producto : maquina.producto}</div>
          </div>
          <div className="p-3 bg-gray-50 rounded-lg">
            <label className="text-xs text-gray-500 block mb-1">Lote Actual</label>
            <div className="text-lg font-semibold">{maquina.ordenId}</div>
          </div>
          <div className="p-3 bg-gray-50 rounded-lg">
            <label className="text-xs text-gray-500 block mb-1">Objetivo Turno</label>
            <div className="text-lg font-semibold">{formatNumber(maquina.objetivoTurno)} kg</div>
          </div>
          <div className="p-3 bg-gray-50 rounded-lg">
            <label className="text-xs text-gray-500 block mb-1">Producido Actual</label>
            <div className="text-lg font-semibold">{formatNumber(maquina.producidoActual)} kg</div>
          </div>
        </div>
      </div>

      {orden && (
        <div className="card mb-8 cursor-pointer hover:border-[#14B8A6] hover:shadow-lg transition-all" onClick={() => router.push(`/maquina/${maquinaId}/orden`)}>
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-xl font-bold mb-2">Orden Actual: {orden.id}</h3>
              <p className="text-gray-600">{orden.producto}</p>
              <div className="mt-2">
                <span className={`badge ${getEstadoBadgeClass(orden.estado)}`}>{orden.estado}</span>
              </div>
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold text-[#14B8A6]">{Math.round((orden.real / orden.plan) * 100)}%</div>
              <div className="text-sm text-gray-600">{formatNumber(orden.real)} / {formatNumber(orden.plan)} kg</div>
            </div>
          </div>
          <div className="mt-4 text-sm text-blue-600 font-semibold">→ Ver orden completa y cargar producción</div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div
          onClick={() => handleAction('produccion')}
          className="card cursor-pointer hover:border-[#14B8A6] hover:shadow-lg hover:-translate-y-1 transition-all text-center"
        >
          <div className="text-6xl mb-4">📊</div>
          <h3 className="text-2xl font-bold mb-2">Reportar Producción</h3>
          <p className="text-gray-600">Registrar producción realizada</p>
        </div>
        <div
          onClick={() => handleAction('parada')}
          className="card cursor-pointer hover:border-[#14B8A6] hover:shadow-lg hover:-translate-y-1 transition-all text-center"
        >
          <div className="text-6xl mb-4">⏸️</div>
          <h3 className="text-2xl font-bold mb-2">Reportar Parada</h3>
          <p className="text-gray-600">Registrar parada de máquina</p>
        </div>
      </div>
    </div>
  )
}
