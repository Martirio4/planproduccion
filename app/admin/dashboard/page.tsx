'use client'

import { useApp } from '@/context/AppContext'
import { useToast } from '@/components/Toast'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { Gauge } from '@/components/Gauge'
import CargarPlanModal from '@/components/CargarPlanModal'

export default function DashboardPage() {
  const { state, updateState } = useApp()
  const router = useRouter()
  const [viewMode, setViewMode] = useState<'gantt' | 'gauge'>('gantt')
  const [isModalOpen, setIsModalOpen] = useState(false)

  // Función para obtener el número de semana del año
  const getWeekNumber = (date: Date): number => {
    const d = new Date(date)
    d.setHours(0, 0, 0, 0)
    d.setDate(d.getDate() + 3 - (d.getDay() + 6) % 7)
    const yearStart = new Date(d.getFullYear(), 0, 1)
    return Math.ceil((((d.getTime() - yearStart.getTime()) / 86400000) + 1) / 7)
  }

  // Función para obtener la fecha de inicio de una semana (lunes)
  const getWeekStart = (weekNumber: number, year: number): Date => {
    const jan4 = new Date(year, 0, 4)
    const jan4Day = (jan4.getDay() + 6) % 7
    const weekStart = new Date(year, 0, 4 - jan4Day + (weekNumber - 1) * 7)
    weekStart.setHours(0, 0, 0, 0)
    return weekStart
  }

  // Función para obtener la fecha de fin de una semana (domingo)
  const getWeekEnd = (weekStart: Date): Date => {
    const weekEnd = new Date(weekStart)
    weekEnd.setDate(weekStart.getDate() + 6)
    return weekEnd
  }
  
  // Semana seleccionada (por defecto la semana actual)
  const semanaActual = getWeekNumber(new Date())
  const [semanaSeleccionada, setSemanaSeleccionada] = useState<number>(state.semana || semanaActual)

  const formatDate = (date: Date) => {
    return date.toLocaleString('es-AR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  // Obtener fechas de la semana seleccionada
  const semanaStart = getWeekStart(semanaSeleccionada, new Date().getFullYear())
  const semanaEnd = getWeekEnd(semanaStart)
  const formatDateShort = (date: Date) => {
    return date.toLocaleDateString('es-AR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    })
  }

  const formatNumber = (num: number) => {
    return new Intl.NumberFormat('es-AR').format(num)
  }

  // Filtrar órdenes por semana seleccionada
  const ordenesSemana = Object.values(state.ordenes).filter(orden => orden.semana === semanaSeleccionada)
  
  // Calcular KPIs solo para la semana seleccionada
  const planSemanal = ordenesSemana.reduce((sum, orden) => sum + (orden.plan / 1000), 0)
  const realAcumulado = ordenesSemana.reduce((sum, orden) => sum + (orden.real / 1000), 0)
  const cumplimiento = planSemanal > 0 ? Math.round((realAcumulado / planSemanal) * 100) : 0
  
  // Calcular líneas solo con órdenes de la semana seleccionada
  const lineasSemana = Object.values(state.lineas).map(linea => {
    const ordenesLinea = ordenesSemana.filter(o => o.lineaId === linea.id)
    const planLinea = ordenesLinea.reduce((sum, orden) => sum + (orden.plan / 1000), 0)
    const realLinea = ordenesLinea.reduce((sum, orden) => sum + (orden.real / 1000), 0)
    const cumplimientoLinea = planLinea > 0 ? Math.round((realLinea / planLinea) * 100) : 0
    
    return {
      ...linea,
      plan: planLinea,
      real: realLinea,
      cumplimiento: cumplimientoLinea
    }
  })
  
  // Generar lista de semanas disponibles (actual y próximas 12)
  const generarSemanas = () => {
    const semanas: Array<{ numero: number; inicio: Date; fin: Date }> = []
    const año = new Date().getFullYear()
    for (let i = 0; i < 13; i++) {
      const numSemana = semanaActual + i
      const inicio = getWeekStart(numSemana, año)
      const fin = getWeekEnd(inicio)
      semanas.push({ numero: numSemana, inicio, fin })
    }
    return semanas
  }
  
  const semanasDisponibles = generarSemanas()
  
  const handleCambiarSemana = (nuevaSemana: number) => {
    setSemanaSeleccionada(nuevaSemana)
    updateState((prev) => ({
      ...prev,
      semana: nuevaSemana
    }))
  }

  const cumplimientoColor = cumplimiento >= 80 ? 'success' : cumplimiento >= 60 ? 'warning' : 'danger'

  return (
    <div>
      <div className="mb-8">
        <div className="flex justify-between items-start mb-4">
          <div>
            <h2 className="text-3xl font-bold mb-2">
              Semana {semanaSeleccionada} · {state.planta}
            </h2>
            <p className="text-gray-600 mb-1">
              {formatDateShort(semanaStart)} - {formatDateShort(semanaEnd)}
            </p>
            <p className="text-gray-600 mb-4">Última actualización: {formatDate(state.ultimaActualizacion)}</p>
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Seleccionar Semana
            </label>
            <select
              value={semanaSeleccionada}
              onChange={(e) => handleCambiarSemana(parseInt(e.target.value))}
              className="px-4 py-2 border-2 border-gray-200 rounded-lg focus:border-teal-500 focus:outline-none"
            >
              {semanasDisponibles.map((sem) => (
                <option key={sem.numero} value={sem.numero}>
                  Semana {sem.numero} ({formatDateShort(sem.inicio)} - {formatDateShort(sem.fin)})
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="kpi-card">
          <h4 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-2">Plan Semanal</h4>
          <div className="text-3xl font-bold">{formatNumber(planSemanal)} t</div>
        </div>
        <div className="kpi-card">
          <h4 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-2">Real Acumulado</h4>
          <div className="text-3xl font-bold">{formatNumber(realAcumulado)} t</div>
        </div>
        <div className={`kpi-card ${cumplimiento >= 80 ? 'success' : cumplimiento >= 60 ? 'warning' : 'danger'}`}>
          <h4 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-2">% Cumplimiento</h4>
          <div className="text-3xl font-bold">{cumplimiento}%</div>
        </div>
        <div className={`kpi-card ${ordenesSemana.filter(o => o.estado === 'Atrasado').length > 0 ? 'danger' : 'success'}`}>
          <h4 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-2">Retrasos</h4>
          <div className="text-3xl font-bold">{ordenesSemana.filter(o => o.estado === 'Atrasado').length}</div>
        </div>
      </div>

      <div className="card mb-8">
        <div className="flex justify-between items-center mb-6 pb-4 border-b-2 border-gray-200">
          <h3 className="text-xl font-semibold">Programación Semanal por Línea</h3>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setViewMode('gantt')}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
                viewMode === 'gantt'
                  ? 'bg-gradient-to-r from-teal-500 to-teal-600 text-white shadow-md'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
              title="Vista de barras"
            >
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                <rect x="2" y="8" width="3" height="6" fill="currentColor"/>
                <rect x="6" y="5" width="3" height="9" fill="currentColor"/>
                <rect x="10" y="3" width="3" height="11" fill="currentColor"/>
              </svg>
              <span>Barras</span>
            </button>
            <button
              onClick={() => setViewMode('gauge')}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
                viewMode === 'gauge'
                  ? 'bg-gradient-to-r from-teal-500 to-teal-600 text-white shadow-md'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
              title="Vista de indicadores"
            >
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                <circle cx="8" cy="8" r="6" stroke="currentColor" strokeWidth="1.5" fill="none"/>
                <path d="M8 2 L8 8 L12 8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
              </svg>
              <span>Indicadores</span>
            </button>
          </div>
        </div>
        
        {viewMode === 'gantt' ? (
            // Vista Gantt
            <div>
              {/* Indicador de semana con chevrons */}
              <div className="mb-4 p-3 bg-gray-50 border border-gray-200 rounded-lg">
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center justify-center gap-3 flex-1">
                    <button
                      onClick={() => {
                        const semanaAnterior = semanaSeleccionada - 1
                        if (semanaAnterior >= semanaActual) {
                          handleCambiarSemana(semanaAnterior)
                        }
                      }}
                      disabled={semanaSeleccionada <= semanaActual}
                      className={`p-1.5 rounded-lg transition-all ${
                        semanaSeleccionada <= semanaActual
                          ? 'text-gray-300 cursor-not-allowed'
                          : 'text-teal-600 hover:bg-teal-100 hover:text-teal-700'
                      }`}
                      title="Semana anterior"
                    >
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M15 18l-6-6 6-6"/>
                      </svg>
                    </button>
                    <div className="text-sm text-gray-700">
                      <span className="font-semibold">Semana {semanaSeleccionada}</span>
                      <span className="mx-2">·</span>
                      <span>{formatDateShort(semanaStart)} - {formatDateShort(semanaEnd)}</span>
                    </div>
                    <button
                      onClick={() => {
                        const semanaSiguiente = semanaSeleccionada + 1
                        if (semanaSiguiente <= semanasDisponibles[semanasDisponibles.length - 1]?.numero) {
                          handleCambiarSemana(semanaSiguiente)
                        }
                      }}
                      disabled={semanaSeleccionada >= semanasDisponibles[semanasDisponibles.length - 1]?.numero}
                      className={`p-1.5 rounded-lg transition-all ${
                        semanaSeleccionada >= semanasDisponibles[semanasDisponibles.length - 1]?.numero
                          ? 'text-gray-300 cursor-not-allowed'
                          : 'text-teal-600 hover:bg-teal-100 hover:text-teal-700'
                      }`}
                      title="Semana siguiente"
                    >
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M9 18l6-6-6-6"/>
                      </svg>
                    </button>
                  </div>
                  <button
                    onClick={() => setIsModalOpen(true)}
                    className="btn btn-primary text-sm px-4 py-2"
                  >
                    Cargar Plan
                  </button>
                </div>
              </div>
              
              {/* Líneas del Gantt */}
              {lineasSemana.map((linea, index) => {
            const colores = [
              { from: '#8B5CF6', to: '#7C3AED' }, // Púrpura
              { from: '#3B82F6', to: '#2563EB' }, // Azul
              { from: '#F59E0B', to: '#D97706' }, // Ámbar/Naranja
            ]
            const color = colores[index % colores.length]
            
            return (
              <Link
                key={linea.id}
                href={`/admin/linea/${linea.id}`}
                className="block p-5 mb-4 border-2 border-gray-200 rounded-lg cursor-pointer transition-all hover:shadow-md hover:-translate-y-0.5"
                style={{ borderLeftColor: color.from, borderLeftWidth: '4px' }}
              >
                <div className="flex justify-between items-center mb-3">
                  <span className="text-lg font-semibold">{linea.nombre}</span>
                  <div className="text-right">
                    <div className="text-base font-bold" style={{ color: color.from }}>
                      {linea.cumplimiento}%
                    </div>
                    <div className="text-sm text-gray-600">
                      {formatNumber(linea.real)} / {formatNumber(linea.plan)} t
                    </div>
                  </div>
                </div>
                <div className="w-full h-8 bg-gray-100 rounded-lg overflow-hidden relative">
                  <div
                    className="h-full rounded-lg transition-all flex items-center justify-end pr-2 text-white text-sm font-semibold"
                    style={{ 
                      width: `${linea.cumplimiento}%`,
                      background: `linear-gradient(90deg, ${color.from} 0%, ${color.to} 100%)`
                    }}
                  >
                    {linea.cumplimiento >= 50 && `${linea.cumplimiento}%`}
                  </div>
                </div>
              </Link>
              )
            })}
            </div>
          ) : (
            // Vista Gauge
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {lineasSemana.map((linea, index) => {
                const colores = [
                  { from: '#14B8A6', to: '#0D9488' },
                  { from: '#3B82F6', to: '#2563EB' },
                  { from: '#10B981', to: '#059669' },
                ]
                const color = colores[index % colores.length]
                
                return (
                  <Link
                    key={linea.id}
                    href={`/admin/linea/${linea.id}`}
                    className="card cursor-pointer hover:border-teal-500 hover:shadow-lg transition-all text-center"
                    style={{ borderTopColor: color.from, borderTopWidth: '4px' }}
                  >
                    <h4 className="text-lg font-semibold mb-4">{linea.nombre}</h4>
                    <div className="flex justify-center mb-4">
                      <Gauge porcentaje={linea.cumplimiento} color={color.from} size={140} />
                    </div>
                    <div className="mt-4 space-y-1">
                      <div className="text-2xl font-bold" style={{ color: color.from }}>
                        {formatNumber(linea.real)} t
                      </div>
                      <div className="text-sm text-gray-600">
                        de {formatNumber(linea.plan)} t
                      </div>
                    </div>
                  </Link>
              )
            })}
          </div>
        )}
      </div>

      <div className="card">
        <div className="flex justify-between items-center mb-6 pb-4 border-b-2 border-gray-200">
          <h3 className="text-xl font-semibold">Alertas</h3>
        </div>
        {state.alertas.map((alerta, index) => (
          <div
            key={index}
            className={`flex gap-4 p-4 mb-3 border-l-4 rounded-lg ${
              alerta.tipo === 'danger' 
                ? 'bg-red-50 border-l-red-500' 
                : alerta.tipo === 'success'
                ? 'bg-green-50 border-l-green-500'
                : 'bg-yellow-50 border-l-yellow-500'
            }`}
          >
            <div className="text-2xl">{alerta.icono}</div>
            <div>
              <h5 className="font-semibold mb-1">{alerta.titulo}</h5>
              <p className="text-sm text-gray-600">{alerta.descripcion}</p>
            </div>
          </div>
        ))}
      </div>

      <CargarPlanModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
    </div>
  )
}
