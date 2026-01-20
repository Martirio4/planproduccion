'use client'

import { useApp } from '@/context/AppContext'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { use, useState } from 'react'

export default function MaquinaOperarioPage({ params }: { params: Promise<{ maquinaId: string }> }) {
  const { state, updateState } = useApp()
  const router = useRouter()
  
  const { maquinaId } = use(params)
  
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
  
  const formatDateShort = (date: Date) => {
    return date.toLocaleDateString('es-AR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    })
  }
  
  const semanaActual = getWeekNumber(new Date())
  const [semanaSeleccionada, setSemanaSeleccionada] = useState<number>(state.semana || semanaActual)
  
  // Generar lista de semanas disponibles
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

  let maquina = state.maquinas[maquinaId]
  if (!maquina) {
    // Si no existe, crear una por defecto
    const primeraLinea = Object.values(state.lineas)[0]
    const primeraOrden = Object.values(state.ordenes).find(o => o.lineaId === primeraLinea?.id)
    if (!primeraLinea || !primeraOrden) {
      router.push('/operario')
      return null
    }
    maquina = {
      id: maquinaId,
      lineaId: primeraLinea.id,
      ordenId: primeraOrden.id,
      producto: primeraOrden.producto,
      turno: 'Mañana',
      objetivoTurno: 2000,
      producidoActual: 0
    }
  }

  const linea = state.lineas[maquina.lineaId]
  
  // Obtener órdenes de esta línea para la semana seleccionada
  const ordenesLinea = Object.values(state.ordenes).filter(o => 
    o.lineaId === maquina.lineaId && o.semana === semanaSeleccionada
  )
  
  const semanaStart = getWeekStart(semanaSeleccionada, new Date().getFullYear())
  const semanaEnd = getWeekEnd(semanaStart)

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
        <div className="flex justify-between items-start mb-4">
          <div className="flex-1">
            <h2 className="text-3xl font-bold mb-2">Máquina: {maquinaId}</h2>
            <p className="text-gray-600 mb-4">{linea?.nombre}</p>
            <Link href="/operario" className="btn btn-secondary">
              ← Volver a máquinas
            </Link>
          </div>
          <div className="ml-6">
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Semana
            </label>
            <div className="flex items-center gap-2">
              <button
                onClick={() => {
                  const semanaAnterior = semanaSeleccionada - 1
                  if (semanaAnterior >= semanaActual) {
                    handleCambiarSemana(semanaAnterior)
                  }
                }}
                disabled={semanaSeleccionada <= semanaActual}
                className={`p-2 rounded-lg transition-all ${
                  semanaSeleccionada <= semanaActual
                    ? 'text-gray-300 cursor-not-allowed'
                    : 'text-teal-600 hover:bg-teal-50 hover:text-teal-700'
                }`}
                title="Semana anterior"
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M15 18l-6-6 6-6"/>
                </svg>
              </button>
              <select
                value={semanaSeleccionada}
                onChange={(e) => handleCambiarSemana(parseInt(e.target.value))}
                className="px-3 py-2 border-2 border-gray-200 rounded-lg focus:border-teal-500 focus:outline-none text-sm"
              >
                {semanasDisponibles.map((sem) => (
                  <option key={sem.numero} value={sem.numero}>
                    Semana {sem.numero}
                  </option>
                ))}
              </select>
              <button
                onClick={() => {
                  const semanaSiguiente = semanaSeleccionada + 1
                  if (semanaSiguiente <= semanasDisponibles[semanasDisponibles.length - 1]?.numero) {
                    handleCambiarSemana(semanaSiguiente)
                  }
                }}
                disabled={semanaSeleccionada >= semanasDisponibles[semanasDisponibles.length - 1]?.numero}
                className={`p-2 rounded-lg transition-all ${
                  semanaSeleccionada >= semanasDisponibles[semanasDisponibles.length - 1]?.numero
                    ? 'text-gray-300 cursor-not-allowed'
                    : 'text-teal-600 hover:bg-teal-50 hover:text-teal-700'
                }`}
                title="Semana siguiente"
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M9 18l6-6-6-6"/>
                </svg>
              </button>
            </div>
            <p className="text-xs text-gray-500 mt-1">
              {formatDateShort(semanaStart)} - {formatDateShort(semanaEnd)}
            </p>
          </div>
        </div>
      </div>

      <div className="card mb-8">
        <h3 className="text-xl font-semibold mb-4">Información de la Máquina</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="p-3 bg-gray-50 rounded-lg">
            <label className="text-xs text-gray-500 block mb-1">Turno</label>
            <div className="text-lg font-semibold">{maquina.turno}</div>
          </div>
          <div className="p-3 bg-gray-50 rounded-lg">
            <label className="text-xs text-gray-500 block mb-1">Orden Actual</label>
            <div className="text-lg font-semibold">{maquina.ordenId || 'Sin orden'}</div>
          </div>
          <div className="p-3 bg-gray-50 rounded-lg">
            <label className="text-xs text-gray-500 block mb-1">Objetivo Turno</label>
            <div className="text-lg font-semibold">{formatNumber(maquina.objetivoTurno)} kg</div>
          </div>
          <div className="p-3 bg-gray-50 rounded-lg">
            <label className="text-xs text-gray-500 block mb-1">Producido Actual</label>
            <div className="text-lg font-semibold text-[#14B8A6]">{formatNumber(maquina.producidoActual)} kg</div>
          </div>
        </div>
      </div>

      <div className="card">
        <h3 className="text-xl font-semibold mb-6">Órdenes de esta Línea</h3>
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-gray-50">
                <th className="text-left p-4 border-b-2 border-gray-200 font-semibold">Orden</th>
                <th className="text-left p-4 border-b-2 border-gray-200 font-semibold">Producto</th>
                <th className="text-left p-4 border-b-2 border-gray-200 font-semibold">Semana</th>
                <th className="text-left p-4 border-b-2 border-gray-200 font-semibold">Plan (kg)</th>
                <th className="text-left p-4 border-b-2 border-gray-200 font-semibold">Real (kg)</th>
                <th className="text-left p-4 border-b-2 border-gray-200 font-semibold">Estado</th>
                <th className="text-left p-4 border-b-2 border-gray-200 font-semibold">Producción</th>
                <th className="text-left p-4 border-b-2 border-gray-200 font-semibold">Parada</th>
              </tr>
            </thead>
            <tbody>
              {ordenesLinea.map((orden) => {
                const progreso = Math.round((orden.real / orden.plan) * 100)
                return (
                  <tr key={orden.id} className="hover:bg-gray-50">
                    <td className="p-4 border-b border-gray-200"><strong>{orden.id}</strong></td>
                    <td className="p-4 border-b border-gray-200">{orden.producto}</td>
                    <td className="p-4 border-b border-gray-200">
                      <span className="font-semibold text-teal-600">Semana {orden.semana}</span>
                    </td>
                    <td className="p-4 border-b border-gray-200">{formatNumber(orden.plan)}</td>
                    <td className="p-4 border-b border-gray-200">{formatNumber(orden.real)}</td>
                    <td className="p-4 border-b border-gray-200">
                      <span className={`badge ${getEstadoBadgeClass(orden.estado)}`}>{orden.estado}</span>
                    </td>
                    <td className="p-4 border-b border-gray-200">
                      <Link
                        href={`/operario/maquina/${maquinaId}/orden/${orden.id}?accion=produccion`}
                        className="btn btn-primary text-sm px-3 py-1.5"
                      >
                        📊 Registrar
                      </Link>
                    </td>
                    <td className="p-4 border-b border-gray-200">
                      <Link
                        href={`/operario/maquina/${maquinaId}/orden/${orden.id}?accion=parada`}
                        className="btn btn-secondary text-sm px-3 py-1.5"
                      >
                        ⏸️ Registrar
                      </Link>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
