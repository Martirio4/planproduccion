'use client'

import { useApp } from '@/context/AppContext'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useState, useEffect, use } from 'react'
import { useToast } from '@/components/Toast'
import { Gauge } from '@/components/Gauge'

export default function OrdenPage({ params }: { params: Promise<{ ordenId: string }> }) {
  const { state } = useApp()
  const router = useRouter()
  const { showToast } = useToast()
  const [activeTab, setActiveTab] = useState<'produccion' | 'paradas'>('produccion')

  const { ordenId } = use(params)

  const orden = state.ordenes[ordenId]

  useEffect(() => {
    if (!orden && Object.keys(state.ordenes).length > 0) {
      router.push('/admin/dashboard')
    }
  }, [orden, state.ordenes, router])

  if (!orden) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-gray-500">Cargando...</div>
      </div>
    )
  }

  const linea = state.lineas[orden.lineaId]
  const progreso = Math.round((orden.real / orden.plan) * 100)
  const progresoColor = progreso >= 80 ? 'bg-green-500' : progreso >= 60 ? 'bg-yellow-500' : 'bg-red-500'

  // Buscar máquinas asociadas a esta orden
  const maquinasAsociadas = Object.values(state.maquinas).filter(m => m.ordenId === ordenId)

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

  const handleExportar = () => {
    showToast('Export simulado (CSV/XLS)', 'info')
  }

  return (
    <div>
      <div className="mb-8">
        <h2 className="text-3xl font-bold mb-4">Orden/Lote: {orden.id}</h2>
        <Link href={`/admin/linea/${orden.lineaId}`} className="btn btn-secondary">
          Volver a detalle de línea
        </Link>
      </div>

      {/* 3 cards superiores: Producto, Línea, Estado */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="card">
          <label className="text-sm font-semibold text-gray-500 mb-2 block">Producto</label>
          <div className="text-xl font-semibold">{orden.producto}</div>
        </div>
        <div className="card">
          <label className="text-sm font-semibold text-gray-500 mb-2 block">Línea</label>
          <div className="text-xl font-semibold">{linea.nombre}</div>
        </div>
        <div className="card">
          <label className="text-sm font-semibold text-gray-500 mb-2 block">Estado</label>
          <div>
            <span className={`badge ${getEstadoBadgeClass(orden.estado)}`}>{orden.estado}</span>
          </div>
        </div>
      </div>

      {/* Layout con 2 cards apiladas y gauge */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {/* Tarjetas apiladas para Plan y Real */}
        <div className="md:col-span-2 space-y-4">
          {/* Plan/Objetivo */}
          <div className="kpi-card">
            <h4 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">Objetivo</h4>
            <div className="flex items-end justify-between">
              <div className="text-3xl font-bold text-gray-800">{formatNumber(orden.plan)} kg</div>
            </div>
            <div className="mt-4 w-full h-3 bg-gray-200 rounded-full overflow-hidden">
              <div
                className="h-full bg-blue-500 rounded-full transition-all"
                style={{ width: '100%' }}
              />
            </div>
          </div>
          
          {/* Real */}
          <div className="kpi-card">
            <h4 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">Real Acumulado</h4>
            <div className="flex items-end justify-between">
              <div className="text-3xl font-bold text-gray-800">{formatNumber(orden.real)} kg</div>
            </div>
            <div className="mt-4 w-full h-3 bg-gray-200 rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full transition-all ${progresoColor}`}
                style={{ width: `${Math.min(100, progreso)}%` }}
              />
            </div>
          </div>
        </div>

        {/* Gauge de cumplimiento */}
        <div className="kpi-card flex flex-col items-center justify-center">
          <h4 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-4">% Progreso</h4>
          <Gauge 
            porcentaje={progreso} 
            color={progreso >= 80 ? '#10B981' : progreso >= 60 ? '#F59E0B' : '#EF4444'}
            size={160}
          />
        </div>
      </div>

      <div className="card">
        <div className="flex justify-between items-center mb-6 pb-4 border-b-2 border-gray-200">
          <h3 className="text-xl font-semibold">Registros</h3>
        </div>
        <div className="flex gap-2 mb-6 border-b-2 border-gray-200">
          <button
            onClick={() => setActiveTab('produccion')}
            className={`tab ${activeTab === 'produccion' ? 'active' : ''}`}
          >
            Producción
          </button>
          <button
            onClick={() => setActiveTab('paradas')}
            className={`tab ${activeTab === 'paradas' ? 'active' : ''}`}
          >
            Paradas
          </button>
        </div>
        <div className={activeTab === 'produccion' ? 'block' : 'hidden'}>
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-gray-50">
                  <th className="text-left p-4 border-b-2 border-gray-200 font-semibold">Hora</th>
                  <th className="text-left p-4 border-b-2 border-gray-200 font-semibold">Kg</th>
                  <th className="text-left p-4 border-b-2 border-gray-200 font-semibold">Operador</th>
                  <th className="text-left p-4 border-b-2 border-gray-200 font-semibold">Comentarios</th>
                </tr>
              </thead>
              <tbody>
                {orden.registrosProduccion.map((reg, index) => (
                  <tr key={index} className="hover:bg-gray-50">
                    <td className="p-4 border-b border-gray-200">{reg.hora}</td>
                    <td className="p-4 border-b border-gray-200">+{formatNumber(reg.kg)}</td>
                    <td className="p-4 border-b border-gray-200">{reg.operador}</td>
                    <td className="p-4 border-b border-gray-200">{reg.comentarios || '-'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
        <div className={activeTab === 'paradas' ? 'block' : 'hidden'}>
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-gray-50">
                  <th className="text-left p-4 border-b-2 border-gray-200 font-semibold">Motivo</th>
                  <th className="text-left p-4 border-b-2 border-gray-200 font-semibold">Inicio</th>
                  <th className="text-left p-4 border-b-2 border-gray-200 font-semibold">Fin</th>
                  <th className="text-left p-4 border-b-2 border-gray-200 font-semibold">Duración (min)</th>
                  <th className="text-left p-4 border-b-2 border-gray-200 font-semibold">Comentarios</th>
                </tr>
              </thead>
              <tbody>
                {orden.registrosParadas.map((parada, index) => (
                  <tr key={index} className="hover:bg-gray-50">
                    <td className="p-4 border-b border-gray-200">{parada.motivo}</td>
                    <td className="p-4 border-b border-gray-200">{parada.inicio}</td>
                    <td className="p-4 border-b border-gray-200">{parada.fin}</td>
                    <td className="p-4 border-b border-gray-200">{parada.duracion}</td>
                    <td className="p-4 border-b border-gray-200">{parada.comentarios || '-'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <div className="mt-8">
        <button onClick={handleExportar} className="btn btn-primary">
          Exportar (mock)
        </button>
      </div>
    </div>
  )
}
