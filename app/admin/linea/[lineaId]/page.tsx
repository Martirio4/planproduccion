'use client'

import { useApp } from '@/context/AppContext'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useState, useEffect, use } from 'react'
import { Gauge } from '@/components/Gauge'

export default function LineaPage({ params }: { params: Promise<{ lineaId: string }> }) {
  const { state } = useApp()
  const router = useRouter()
  const [filterEstado, setFilterEstado] = useState('todos')
  const [filterTipoEvento, setFilterTipoEvento] = useState<'todos' | 'produccion' | 'paradas'>('todos')
  const [filterFecha, setFilterFecha] = useState('')
  const [sortBy, setSortBy] = useState<'fecha' | 'progreso'>('fecha')
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc')
  
  const { lineaId } = use(params)

  const linea = state.lineas[lineaId]

  useEffect(() => {
    if (!linea && Object.keys(state.lineas).length > 0) {
      router.push('/admin/dashboard')
    }
  }, [linea, state.lineas, router])

  if (!linea) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-gray-500">Cargando...</div>
      </div>
    )
  }

  // Filtrar órdenes por línea y semana actual
  const semanaActual = state.semana || (() => {
    const d = new Date()
    d.setHours(0, 0, 0, 0)
    d.setDate(d.getDate() + 3 - (d.getDay() + 6) % 7)
    const yearStart = new Date(d.getFullYear(), 0, 1)
    return Math.ceil((((d.getTime() - yearStart.getTime()) / 86400000) + 1) / 7)
  })()
  
  const ordenesLinea = Object.values(state.ordenes).filter(o => 
    o.lineaId === lineaId && o.semana === semanaActual
  )
  const ordenesFiltradas = filterEstado === 'todos' 
    ? ordenesLinea 
    : ordenesLinea.filter(o => o.estado === filterEstado)

  // Ordenar órdenes
  const ordenesOrdenadas = [...ordenesFiltradas].sort((a, b) => {
    if (sortBy === 'fecha') {
      const fechaA = new Date(a.fechaCompromiso.split('/').reverse().join('-')).getTime()
      const fechaB = new Date(b.fechaCompromiso.split('/').reverse().join('-')).getTime()
      return sortOrder === 'asc' ? fechaA - fechaB : fechaB - fechaA
    } else if (sortBy === 'progreso') {
      const progresoA = (a.real / a.plan) * 100
      const progresoB = (b.real / b.plan) * 100
      return sortOrder === 'asc' ? progresoA - progresoB : progresoB - progresoA
    }
    return 0
  })

  const handleSort = (field: 'fecha' | 'progreso') => {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')
    } else {
      setSortBy(field)
      setSortOrder('asc')
    }
  }

  const cumplimientoColor = linea.cumplimiento >= 80 ? 'success' : 
                            linea.cumplimiento >= 60 ? 'warning' : 'danger'

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

  const handleOrdenClick = (ordenId: string) => {
    router.push(`/admin/orden/${ordenId}`)
  }

  // Timeline de eventos - combinar todos los eventos de todas las órdenes
  const timelineItems = ordenesLinea.flatMap(orden => {
    const items: Array<{
      fecha: string
      hora: string
      descripcion: string
      tipo: 'produccion' | 'parada'
      ordenId: string
    }> = []
    
    // Agregar eventos de producción
    orden.registrosProduccion.forEach(reg => {
      items.push({
        fecha: orden.fechaCompromiso, // Usar fecha de compromiso como referencia
        hora: reg.hora,
        descripcion: `[${orden.id}] Carga producción +${formatNumber(reg.kg)} kg (${reg.operador})`,
        tipo: 'produccion',
        ordenId: orden.id
      })
    })
    
    // Agregar eventos de paradas
    orden.registrosParadas.forEach(parada => {
      items.push({
        fecha: orden.fechaCompromiso,
        hora: parada.inicio,
        descripcion: `[${orden.id}] Parada: ${parada.motivo} (${parada.duracion} min)`,
        tipo: 'parada',
        ordenId: orden.id
      })
    })
    
    return items
  })
  
  // Ordenar por fecha y hora (más recientes primero)
  timelineItems.sort((a, b) => {
    const fechaHoraA = `${a.fecha} ${a.hora}`
    const fechaHoraB = `${b.fecha} ${b.hora}`
    return fechaHoraB.localeCompare(fechaHoraA)
  })
  
    // Aplicar filtros
  const timelineFiltrado = timelineItems.filter(item => {
    // Filtro por tipo
    if (filterTipoEvento !== 'todos') {
      if (filterTipoEvento === 'paradas' && item.tipo !== 'parada') {
        return false
      }
      if (filterTipoEvento === 'produccion' && item.tipo !== 'produccion') {
        return false
      }
    }
    
    // Filtro por fecha
    if (filterFecha && item.fecha !== filterFecha) {
      return false
    }
    
    return true
  })
  
  // Obtener fechas únicas para el selector
  const fechasUnicas = Array.from(new Set(ordenesLinea.map(o => o.fechaCompromiso))).sort()

  return (
    <div>
      <div className="mb-8">
        <h2 className="text-3xl font-bold mb-4">{linea.nombre}</h2>
        <Link href="/admin/dashboard" className="btn btn-secondary">
          Volver al dashboard
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {/* Tarjetas apiladas para Plan y Real */}
        <div className="md:col-span-2 space-y-4">
          {/* Plan */}
          <div className="kpi-card">
            <h4 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">Plan Línea</h4>
            <div className="flex items-end justify-between">
              <div className="text-3xl font-bold text-gray-800">{formatNumber(linea.plan)} t</div>
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
            <h4 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">Real Línea</h4>
            <div className="flex items-end justify-between">
              <div className="text-3xl font-bold text-gray-800">{formatNumber(linea.real)} t</div>
            </div>
            <div className="mt-4 w-full h-3 bg-gray-200 rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full transition-all ${
                  linea.cumplimiento >= 80 ? 'bg-green-500' : 
                  linea.cumplimiento >= 60 ? 'bg-yellow-500' : 'bg-red-500'
                }`}
                style={{ width: `${Math.min(100, (linea.real / linea.plan) * 100)}%` }}
              />
            </div>
          </div>
        </div>

        {/* Gauge de cumplimiento */}
        <div className="kpi-card flex flex-col items-center justify-center">
          <h4 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-4">% Cumplimiento</h4>
          <Gauge 
            porcentaje={linea.cumplimiento} 
            color={cumplimientoColor === 'success' ? '#10B981' : cumplimientoColor === 'warning' ? '#F59E0B' : '#EF4444'}
            size={160}
          />
        </div>
      </div>

      <div className="mb-6">
        <div className="flex gap-4 items-center">
          <label className="font-semibold">Estado:</label>
          <select
            value={filterEstado}
            onChange={(e) => setFilterEstado(e.target.value)}
            className="px-4 py-2 border-2 border-gray-200 rounded-lg"
          >
            <option value="todos">Todos</option>
            <option value="En proceso">En proceso</option>
            <option value="Atrasado">Atrasado</option>
            <option value="Terminado">Terminado</option>
          </select>
        </div>
      </div>

      <div className="card mb-8">
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-gray-50">
                <th className="text-left p-4 border-b-2 border-gray-200 font-semibold">Lote/Orden</th>
                <th className="text-left p-4 border-b-2 border-gray-200 font-semibold">Producto</th>
                <th className="text-left p-4 border-b-2 border-gray-200 font-semibold">Semana</th>
                <th className="text-left p-4 border-b-2 border-gray-200 font-semibold">Plan (kg)</th>
                <th className="text-left p-4 border-b-2 border-gray-200 font-semibold">Real (kg)</th>
                <th 
                  className="text-left p-4 border-b-2 border-gray-200 font-semibold cursor-pointer hover:bg-gray-100 transition-colors select-none"
                  onClick={() => handleSort('progreso')}
                >
                  <div className="flex items-center gap-2">
                    Progreso
                    {sortBy === 'progreso' && (
                      <span className="text-xs text-[#14B8A6]">
                        {sortOrder === 'asc' ? '↑' : '↓'}
                      </span>
                    )}
                  </div>
                </th>
                <th 
                  className="text-left p-4 border-b-2 border-gray-200 font-semibold cursor-pointer hover:bg-gray-100 transition-colors select-none"
                  onClick={() => handleSort('fecha')}
                >
                  <div className="flex items-center gap-2">
                    Fecha Compromiso
                    {sortBy === 'fecha' && (
                      <span className="text-xs text-[#14B8A6]">
                        {sortOrder === 'asc' ? '↑' : '↓'}
                      </span>
                    )}
                  </div>
                </th>
              </tr>
            </thead>
            <tbody>
              {ordenesOrdenadas.map((orden) => {
                const progreso = Math.round((orden.real / orden.plan) * 100)
                const progresoColor = progreso >= 80 ? 'bg-green-500' : progreso >= 60 ? 'bg-yellow-500' : 'bg-red-500'
                
                return (
                  <tr
                    key={orden.id}
                    onClick={() => handleOrdenClick(orden.id)}
                    className="cursor-pointer hover:bg-gray-50 transition-colors"
                  >
                    <td className="p-4 border-b border-gray-200"><strong>{orden.id}</strong></td>
                    <td className="p-4 border-b border-gray-200">{orden.producto}</td>
                    <td className="p-4 border-b border-gray-200">
                      <span className="font-semibold text-teal-600">Semana {orden.semana}</span>
                    </td>
                    <td className="p-4 border-b border-gray-200">{formatNumber(orden.plan)}</td>
                    <td className="p-4 border-b border-gray-200">{formatNumber(orden.real)}</td>
                    <td className="p-4 border-b border-gray-200">
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <span className={`badge ${getEstadoBadgeClass(orden.estado)}`}>{orden.estado}</span>
                          <span className="text-sm font-semibold text-gray-600">{progreso}%</span>
                        </div>
                        <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
                          <div
                            className={`h-full ${progresoColor} rounded-full transition-all`}
                            style={{ width: `${Math.min(100, progreso)}%` }}
                          />
                        </div>
                      </div>
                    </td>
                    <td className="p-4 border-b border-gray-200">{orden.fechaCompromiso}</td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>

      <div className="card">
        <div className="flex justify-between items-center mb-6 pb-4 border-b-2 border-gray-200">
          <h3 className="text-xl font-semibold">Timeline de Eventos</h3>
        </div>
        
        {/* Filtros */}
        <div className="mb-6 flex gap-4 flex-wrap">
          <div className="flex items-center gap-2">
            <label className="text-sm font-semibold">Tipo:</label>
            <select
              value={filterTipoEvento}
              onChange={(e) => setFilterTipoEvento(e.target.value as 'todos' | 'produccion' | 'paradas')}
              className="px-3 py-2 border-2 border-gray-200 rounded-lg text-sm"
            >
              <option value="todos">Todos</option>
              <option value="produccion">Producción</option>
              <option value="paradas">Paradas</option>
            </select>
          </div>
          <div className="flex items-center gap-2">
            <label className="text-sm font-semibold">Fecha:</label>
            <select
              value={filterFecha}
              onChange={(e) => setFilterFecha(e.target.value)}
              className="px-3 py-2 border-2 border-gray-200 rounded-lg text-sm"
            >
              <option value="">Todas</option>
              {fechasUnicas.map(fecha => (
                <option key={fecha} value={fecha}>{fecha}</option>
              ))}
            </select>
          </div>
        </div>
        
        <ul className="list-none p-0">
          {timelineFiltrado.length > 0 ? (
            timelineFiltrado.map((item, index) => (
              <li 
                key={index} 
                className={`p-4 mb-3 border-l-4 pl-6 rounded-lg ${
                  item.tipo === 'produccion' 
                    ? 'bg-blue-50 border-l-blue-500' 
                    : 'bg-orange-50 border-l-orange-500'
                }`}
              >
                <div className="flex items-start gap-3">
                  <div className="flex-shrink-0">
                    <div className="text-sm font-semibold text-gray-700">{item.fecha}</div>
                    <div className="text-lg font-bold text-[#14B8A6]">{item.hora}</div>
                  </div>
                  <div className="flex-1">
                    <span className="text-gray-800">{item.descripcion}</span>
                  </div>
                </div>
              </li>
            ))
          ) : (
            <li className="p-4 text-center text-gray-500">
              No hay eventos que coincidan con los filtros seleccionados
            </li>
          )}
        </ul>
      </div>
    </div>
  )
}
