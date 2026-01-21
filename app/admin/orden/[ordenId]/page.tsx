'use client'

import { useApp } from '@/context/AppContext'
import { useTheme } from '@/context/ThemeContext'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useState, useEffect, use } from 'react'
import { useToast } from '@/components/Toast'
import { Gauge } from '@/components/Gauge'

export default function OrdenPage({ params }: { params: Promise<{ ordenId: string }> }) {
  const { state } = useApp()
  const { theme } = useTheme()
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
        <div style={{ color: theme === 'dark' ? '#9ca3af' : '#6b7280' }}>Cargando...</div>
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

  return (
    <div>
      <div className="mb-8">
        <h2 
          className="text-3xl font-bold mb-4"
          style={{ color: theme === 'dark' ? '#f9fafb' : '#111827' }}
        >
          Orden/Lote: {orden.id}
        </h2>
        <Link href={`/admin/linea/${orden.lineaId}`} className="btn btn-secondary">
          Volver a detalle de línea
        </Link>
      </div>

      {/* 3 cards superiores: Producto, Línea, Estado */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="card">
          <label 
            className="text-sm font-semibold mb-2 block"
            style={{ color: theme === 'dark' ? '#9ca3af' : '#374151' }}
          >
            Producto
          </label>
          <div 
            className="text-xl font-semibold"
            style={{ color: theme === 'dark' ? '#f9fafb' : '#111827' }}
          >
            {orden.producto}
          </div>
        </div>
        <div className="card">
          <label 
            className="text-sm font-semibold mb-2 block"
            style={{ color: theme === 'dark' ? '#9ca3af' : '#374151' }}
          >
            Línea
          </label>
          <div 
            className="text-xl font-semibold"
            style={{ color: theme === 'dark' ? '#f9fafb' : '#111827' }}
          >
            {linea.nombre}
          </div>
        </div>
        <div className="card">
          <label 
            className="text-sm font-semibold mb-2 block"
            style={{ color: theme === 'dark' ? '#9ca3af' : '#374151' }}
          >
            Estado
          </label>
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
            <h4 
              className="text-sm font-semibold uppercase tracking-wide mb-3"
              style={{ color: theme === 'dark' ? '#9ca3af' : '#374151' }}
            >
              Objetivo
            </h4>
            <div className="flex items-end justify-between">
              <div 
                className="text-3xl font-bold"
                style={{ color: theme === 'dark' ? '#f9fafb' : '#111827' }}
              >
                {formatNumber(orden.plan)} kg
              </div>
            </div>
            <div 
              className="mt-4 w-full h-3 rounded-full overflow-hidden"
              style={{ backgroundColor: theme === 'dark' ? '#374151' : '#e5e7eb' }}
            >
              <div
                className="h-full bg-blue-500 rounded-full transition-all"
                style={{ width: '100%' }}
              />
            </div>
          </div>
          
          {/* Real */}
          <div className="kpi-card">
            <h4 
              className="text-sm font-semibold uppercase tracking-wide mb-3"
              style={{ color: theme === 'dark' ? '#9ca3af' : '#374151' }}
            >
              Real Acumulado
            </h4>
            <div className="flex items-end justify-between">
              <div 
                className="text-3xl font-bold"
                style={{ color: theme === 'dark' ? '#f9fafb' : '#111827' }}
              >
                {formatNumber(orden.real)} kg
              </div>
            </div>
            <div 
              className="mt-4 w-full h-3 rounded-full overflow-hidden"
              style={{ backgroundColor: theme === 'dark' ? '#374151' : '#e5e7eb' }}
            >
              <div
                className={`h-full rounded-full transition-all ${progresoColor}`}
                style={{ width: `${Math.min(100, progreso)}%` }}
              />
            </div>
          </div>
        </div>

        {/* Gauge de cumplimiento */}
        <div className="kpi-card flex flex-col items-center justify-center">
          <h4 
            className="text-sm font-semibold uppercase tracking-wide mb-4"
            style={{ color: theme === 'dark' ? '#9ca3af' : '#374151' }}
          >
            % Progreso
          </h4>
          <Gauge 
            porcentaje={progreso} 
            color={progreso >= 80 ? '#10B981' : progreso >= 60 ? '#F59E0B' : '#EF4444'}
            size={160}
          />
        </div>
      </div>

      <div className="card">
        <div 
          className="flex justify-between items-center mb-6 pb-4 border-b-2"
          style={{ borderColor: theme === 'dark' ? '#374151' : '#e5e7eb' }}
        >
          <h3 
            className="text-xl font-semibold"
            style={{ color: theme === 'dark' ? '#f9fafb' : '#111827' }}
          >
            Registros de Producción y Paradas
          </h3>
        </div>
        <div 
          className="flex gap-2 mb-6 border-b-2"
          style={{ borderColor: theme === 'dark' ? '#374151' : '#e5e7eb' }}
        >
          <button
            onClick={() => setActiveTab('produccion')}
            className={`tab ${activeTab === 'produccion' ? 'active' : ''}`}
            style={{
              color: activeTab === 'produccion' 
                ? '#14B8A6' 
                : (theme === 'dark' ? '#9ca3af' : '#374151'),
              borderBottomColor: activeTab === 'produccion' ? '#14B8A6' : 'transparent'
            }}
          >
            Producción
          </button>
          <button
            onClick={() => setActiveTab('paradas')}
            className={`tab ${activeTab === 'paradas' ? 'active' : ''}`}
            style={{
              color: activeTab === 'paradas' 
                ? '#14B8A6' 
                : (theme === 'dark' ? '#9ca3af' : '#374151'),
              borderBottomColor: activeTab === 'paradas' ? '#14B8A6' : 'transparent'
            }}
          >
            Paradas
          </button>
        </div>
        <div className={activeTab === 'produccion' ? 'block' : 'hidden'}>
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr style={{ backgroundColor: theme === 'dark' ? '#1f2937' : '#f3f4f6' }}>
                  <th 
                    className="text-left p-4 border-b-2 font-semibold"
                    style={{ 
                      borderColor: theme === 'dark' ? '#374151' : '#d1d5db',
                      color: theme === 'dark' ? '#e5e7eb' : '#111827'
                    }}
                  >
                    Hora
                  </th>
                  <th 
                    className="text-left p-4 border-b-2 font-semibold"
                    style={{ 
                      borderColor: theme === 'dark' ? '#374151' : '#d1d5db',
                      color: theme === 'dark' ? '#e5e7eb' : '#111827'
                    }}
                  >
                    Kg
                  </th>
                  <th 
                    className="text-left p-4 border-b-2 font-semibold"
                    style={{ 
                      borderColor: theme === 'dark' ? '#374151' : '#d1d5db',
                      color: theme === 'dark' ? '#e5e7eb' : '#111827'
                    }}
                  >
                    Operador
                  </th>
                  <th 
                    className="text-left p-4 border-b-2 font-semibold"
                    style={{ 
                      borderColor: theme === 'dark' ? '#374151' : '#d1d5db',
                      color: theme === 'dark' ? '#e5e7eb' : '#111827'
                    }}
                  >
                    Comentarios
                  </th>
                </tr>
              </thead>
              <tbody>
                {orden.registrosProduccion.map((reg, index) => (
                  <tr 
                    key={index}
                    style={{ 
                      backgroundColor: theme === 'dark' ? 'transparent' : 'white'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor = theme === 'dark' ? '#1f2937' : '#f9fafb'
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = theme === 'dark' ? 'transparent' : 'white'
                    }}
                  >
                    <td 
                      className="p-4 border-b"
                      style={{ 
                        borderColor: theme === 'dark' ? '#374151' : '#e5e7eb',
                        color: theme === 'dark' ? '#d1d5db' : '#111827'
                      }}
                    >
                      {reg.hora}
                    </td>
                    <td 
                      className="p-4 border-b"
                      style={{ 
                        borderColor: theme === 'dark' ? '#374151' : '#e5e7eb',
                        color: theme === 'dark' ? '#d1d5db' : '#111827'
                      }}
                    >
                      +{formatNumber(reg.kg)}
                    </td>
                    <td 
                      className="p-4 border-b"
                      style={{ 
                        borderColor: theme === 'dark' ? '#374151' : '#e5e7eb',
                        color: theme === 'dark' ? '#d1d5db' : '#111827'
                      }}
                    >
                      {reg.operador}
                    </td>
                    <td 
                      className="p-4 border-b"
                      style={{ 
                        borderColor: theme === 'dark' ? '#374151' : '#e5e7eb',
                        color: theme === 'dark' ? '#d1d5db' : '#111827'
                      }}
                    >
                      {reg.comentarios || '-'}
                    </td>
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
                <tr style={{ backgroundColor: theme === 'dark' ? '#1f2937' : '#f3f4f6' }}>
                  <th 
                    className="text-left p-4 border-b-2 font-semibold"
                    style={{ 
                      borderColor: theme === 'dark' ? '#374151' : '#d1d5db',
                      color: theme === 'dark' ? '#e5e7eb' : '#111827'
                    }}
                  >
                    Motivo
                  </th>
                  <th 
                    className="text-left p-4 border-b-2 font-semibold"
                    style={{ 
                      borderColor: theme === 'dark' ? '#374151' : '#d1d5db',
                      color: theme === 'dark' ? '#e5e7eb' : '#111827'
                    }}
                  >
                    Inicio
                  </th>
                  <th 
                    className="text-left p-4 border-b-2 font-semibold"
                    style={{ 
                      borderColor: theme === 'dark' ? '#374151' : '#d1d5db',
                      color: theme === 'dark' ? '#e5e7eb' : '#111827'
                    }}
                  >
                    Fin
                  </th>
                  <th 
                    className="text-left p-4 border-b-2 font-semibold"
                    style={{ 
                      borderColor: theme === 'dark' ? '#374151' : '#d1d5db',
                      color: theme === 'dark' ? '#e5e7eb' : '#111827'
                    }}
                  >
                    Duración (min)
                  </th>
                  <th 
                    className="text-left p-4 border-b-2 font-semibold"
                    style={{ 
                      borderColor: theme === 'dark' ? '#374151' : '#d1d5db',
                      color: theme === 'dark' ? '#e5e7eb' : '#111827'
                    }}
                  >
                    Comentarios
                  </th>
                </tr>
              </thead>
              <tbody>
                {orden.registrosParadas.map((parada, index) => (
                  <tr 
                    key={index}
                    style={{ 
                      backgroundColor: theme === 'dark' ? 'transparent' : 'white'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor = theme === 'dark' ? '#1f2937' : '#f9fafb'
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = theme === 'dark' ? 'transparent' : 'white'
                    }}
                  >
                    <td 
                      className="p-4 border-b"
                      style={{ 
                        borderColor: theme === 'dark' ? '#374151' : '#e5e7eb',
                        color: theme === 'dark' ? '#d1d5db' : '#111827'
                      }}
                    >
                      {parada.motivo}
                    </td>
                    <td 
                      className="p-4 border-b"
                      style={{ 
                        borderColor: theme === 'dark' ? '#374151' : '#e5e7eb',
                        color: theme === 'dark' ? '#d1d5db' : '#111827'
                      }}
                    >
                      {parada.inicio}
                    </td>
                    <td 
                      className="p-4 border-b"
                      style={{ 
                        borderColor: theme === 'dark' ? '#374151' : '#e5e7eb',
                        color: theme === 'dark' ? '#d1d5db' : '#111827'
                      }}
                    >
                      {parada.fin}
                    </td>
                    <td 
                      className="p-4 border-b"
                      style={{ 
                        borderColor: theme === 'dark' ? '#374151' : '#e5e7eb',
                        color: theme === 'dark' ? '#d1d5db' : '#111827'
                      }}
                    >
                      {parada.duracion}
                    </td>
                    <td 
                      className="p-4 border-b"
                      style={{ 
                        borderColor: theme === 'dark' ? '#374151' : '#e5e7eb',
                        color: theme === 'dark' ? '#d1d5db' : '#111827'
                      }}
                    >
                      {parada.comentarios || '-'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  )
}
