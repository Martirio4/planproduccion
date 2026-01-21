'use client'

import { useState, useEffect } from 'react'
import { useApp } from '@/context/AppContext'
import { useToast } from '@/components/Toast'
import { Orden } from '@/context/AppContext'

interface CargarPlanModalProps {
  isOpen: boolean
  onClose: () => void
}

interface SemanaInfo {
  numero: number
  inicio: Date
  fin: Date
}

// Función para obtener el número de semana del año (ISO 8601)
function getWeekNumber(date: Date): number {
  const d = new Date(date)
  d.setHours(0, 0, 0, 0)
  // Establecer al jueves de esta semana para calcular correctamente
  d.setDate(d.getDate() + 3 - (d.getDay() + 6) % 7)
  // Obtener el primer día del año
  const yearStart = new Date(d.getFullYear(), 0, 1)
  // Calcular el número de semana
  return Math.ceil((((d.getTime() - yearStart.getTime()) / 86400000) + 1) / 7)
}

// Función para obtener la fecha de inicio de una semana (lunes)
function getWeekStart(weekNumber: number, year: number): Date {
  const jan4 = new Date(year, 0, 4)
  const jan4Day = (jan4.getDay() + 6) % 7 // Convertir domingo (0) a 6
  const weekStart = new Date(year, 0, 4 - jan4Day + (weekNumber - 1) * 7)
  weekStart.setHours(0, 0, 0, 0)
  return weekStart
}

// Función para obtener la fecha de fin de una semana (domingo)
function getWeekEnd(weekStart: Date): Date {
  const weekEnd = new Date(weekStart)
  weekEnd.setDate(weekStart.getDate() + 6)
  weekEnd.setHours(23, 59, 59, 999)
  return weekEnd
}

// Generar lista de semanas (actual y próximas 12 semanas)
function generarSemanas(): SemanaInfo[] {
  const hoy = new Date()
  const añoActual = hoy.getFullYear()
  const semanaActual = getWeekNumber(hoy)
  const semanas: SemanaInfo[] = []

  for (let i = 0; i < 13; i++) {
    const numSemana = semanaActual + i
    const inicio = getWeekStart(numSemana, añoActual)
    const fin = getWeekEnd(inicio)
    semanas.push({ numero: numSemana, inicio, fin })
  }

  return semanas
}

// Mapeo de productos por línea basado en los datos default
const productosPorLinea: Record<string, string[]> = {
  'LINEA_A': ['Pulpa Manzana', 'Pulpa Pera', 'Pulpa Durazno'],
  'LINEA_B': ['Concentrado Manzana', 'Concentrado Pera'],
  'LINEA_C': ['Envasado Pulpa 1L', 'Envasado Pulpa 500ml']
}

export default function CargarPlanModal({ isOpen, onClose }: CargarPlanModalProps) {
  const { state, updateState } = useApp()
  const { showToast } = useToast()
  const [semanaSeleccionada, setSemanaSeleccionada] = useState<number>(0)
  const [lineaId, setLineaId] = useState<string>('')
  const [producto, setProducto] = useState<string>('')
  const [cantidad, setCantidad] = useState<string>('')
  const [fechaCompromiso, setFechaCompromiso] = useState<string>('')
  const [semanas, setSemanas] = useState<SemanaInfo[]>([])

  useEffect(() => {
    if (isOpen) {
      const semanasList = generarSemanas()
      setSemanas(semanasList)
      // Usar la semana del estado (la semana seleccionada en el dashboard)
      setSemanaSeleccionada(state.semana || semanasList[0]?.numero || 0)
    }
  }, [isOpen, state.semana])

  // Limpiar producto cuando cambia la línea
  useEffect(() => {
    setProducto('')
  }, [lineaId])

  // Obtener productos disponibles para la línea seleccionada
  const productosDisponibles = lineaId ? (productosPorLinea[lineaId] || []) : []

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('es-AR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    })
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (!lineaId || !producto || !cantidad || !fechaCompromiso) {
      showToast('Por favor complete todos los campos', 'warning')
      return
    }

    const cantidadNum = parseFloat(cantidad)
    if (isNaN(cantidadNum) || cantidadNum <= 0) {
      showToast('La cantidad debe ser un número positivo', 'warning')
      return
    }

    // Generar ID único para la orden
    const ordenId = `FR-${Date.now().toString().slice(-3)}`

    // Crear nueva orden
    const nuevaOrden: Orden = {
      id: ordenId,
      lineaId,
      producto,
      plan: cantidadNum,
      real: 0,
      estado: 'Planificado',
      fechaCompromiso,
      semana: semanaSeleccionada,
      registrosProduccion: [],
      registrosParadas: []
    }

    // Actualizar estado
    updateState((prev) => {
      const linea = prev.lineas[lineaId]
      if (!linea) return prev

      // Actualizar plan de la línea (convertir kg a toneladas)
      const cantidadToneladas = cantidadNum / 1000
      const nuevaLinea = {
        ...linea,
        plan: linea.plan + cantidadToneladas
      }

      // Actualizar KPIs globales
      const nuevoPlanSemanal = prev.kpis.planSemanal + cantidadToneladas
      const nuevoCumplimiento = prev.kpis.realAcumulado > 0
        ? Math.round((prev.kpis.realAcumulado / nuevoPlanSemanal) * 100)
        : prev.kpis.cumplimiento

      return {
        ...prev,
        ordenes: {
          ...prev.ordenes,
          [ordenId]: nuevaOrden
        },
        lineas: {
          ...prev.lineas,
          [lineaId]: nuevaLinea
        },
        kpis: {
          ...prev.kpis,
          planSemanal: nuevoPlanSemanal,
          cumplimiento: nuevoCumplimiento
        },
        semana: semanaSeleccionada,
        ultimaActualizacion: new Date()
      }
    })

    showToast(`Plan cargado: ${producto} (${cantidadNum} kg)`, 'success')
    
    // Resetear formulario
    setLineaId('')
    setProducto('')
    setCantidad('')
    setFechaCompromiso('')
    onClose()
  }

  if (!isOpen) return null

  const semanaInfo = semanas.find(s => s.numero === semanaSeleccionada)

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b-2 border-gray-200 dark:border-gray-700">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-bold dark:text-gray-100">Cargar Plan de Producción</h2>
            <button
              onClick={onClose}
              className="text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 text-2xl font-bold"
            >
              ×
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Semana */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
              Semana del Año *
            </label>
            <select
              value={semanaSeleccionada}
              onChange={(e) => setSemanaSeleccionada(parseInt(e.target.value))}
              className="w-full px-4 py-3 border-2 border-gray-200 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 rounded-lg focus:border-teal-500 focus:outline-none"
              required
            >
              {semanas.map((sem) => (
                <option key={sem.numero} value={sem.numero}>
                  Semana {sem.numero} ({formatDate(sem.inicio)} - {formatDate(sem.fin)})
                </option>
              ))}
            </select>
            {semanaInfo && (
              <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                Del {formatDate(semanaInfo.inicio)} al {formatDate(semanaInfo.fin)}
              </p>
            )}
          </div>

          {/* Línea */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
              Línea *
            </label>
            <select
              value={lineaId}
              onChange={(e) => setLineaId(e.target.value)}
              className="w-full px-4 py-3 border-2 border-gray-200 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 rounded-lg focus:border-teal-500 focus:outline-none"
              required
            >
              <option value="">Seleccione una línea</option>
              {Object.values(state.lineas).map((linea) => (
                <option key={linea.id} value={linea.id}>
                  {linea.nombre}
                </option>
              ))}
            </select>
          </div>

          {/* Producto */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
              Producto *
            </label>
            {lineaId ? (
              <select
                value={producto}
                onChange={(e) => setProducto(e.target.value)}
                className="w-full px-4 py-3 border-2 border-gray-200 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 rounded-lg focus:border-teal-500 focus:outline-none"
                required
              >
                <option value="">Seleccione un producto</option>
                {productosDisponibles.map((prod) => (
                  <option key={prod} value={prod}>
                    {prod}
                  </option>
                ))}
              </select>
            ) : (
              <input
                type="text"
                value=""
                disabled
                className="w-full px-4 py-3 border-2 border-gray-200 dark:border-gray-600 rounded-lg bg-gray-100 dark:bg-gray-700 dark:text-gray-300 cursor-not-allowed"
                placeholder="Primero seleccione una línea"
              />
            )}
          </div>

          {/* Cantidad */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
              Cantidad (kg) *
            </label>
            <input
              type="number"
              value={cantidad}
              onChange={(e) => setCantidad(e.target.value)}
              className="w-full px-4 py-3 border-2 border-gray-200 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 rounded-lg focus:border-teal-500 focus:outline-none"
              placeholder="Ej: 8500"
              min="0"
              step="0.01"
              required
            />
          </div>

          {/* Fecha Compromiso */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
              Fecha Compromiso *
            </label>
            <input
              type="date"
              value={fechaCompromiso}
              onChange={(e) => setFechaCompromiso(e.target.value)}
              className="w-full px-4 py-3 border-2 border-gray-200 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 rounded-lg focus:border-teal-500 focus:outline-none"
              required
            />
          </div>

          {/* Botones */}
          <div className="flex gap-4 pt-4">
            <button
              type="submit"
              className="btn btn-primary flex-1"
            >
              Guardar Plan
            </button>
            <button
              type="button"
              onClick={onClose}
              className="btn btn-secondary flex-1"
            >
              Cancelar
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
