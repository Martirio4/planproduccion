'use client'

import { useApp } from '@/context/AppContext'
import { useRouter, useSearchParams } from 'next/navigation'
import { useToast } from '@/components/Toast'
import { useState, use, useEffect } from 'react'
import Link from 'next/link'

export default function OrdenOperarioPage({ params }: { params: Promise<{ maquinaId: string; ordenId: string }> }) {
  const { state, updateState } = useApp()
  const router = useRouter()
  const searchParams = useSearchParams()
  const { showToast } = useToast()
  
  const { maquinaId, ordenId } = use(params)
  
  // Determinar qué acción mostrar desde la URL
  const accionInicial = searchParams.get('accion') || 'produccion'
  const [activeTab, setActiveTab] = useState<'produccion' | 'parada'>(accionInicial as 'produccion' | 'parada')
  
  useEffect(() => {
    const accion = searchParams.get('accion')
    if (accion === 'produccion' || accion === 'parada') {
      setActiveTab(accion)
    }
  }, [searchParams])

  let maquina = state.maquinas[maquinaId]
  if (!maquina) {
    router.push(`/operario/maquina/${maquinaId}`)
    return null
  }

  const orden = state.ordenes[ordenId]
  if (!orden) {
    router.push(`/operario/maquina/${maquinaId}`)
    return null
  }

  const linea = state.lineas[orden.lineaId]
  const progreso = Math.round((orden.real / orden.plan) * 100)
  const progresoColor = progreso >= 80 ? 'bg-green-500' : progreso >= 60 ? 'bg-yellow-500' : 'bg-red-500'

  // Estados para formularios
  const [kg, setKg] = useState('')
  const [estado, setEstado] = useState('Produciendo')
  const [observaciones, setObservaciones] = useState('')
  const [motivo, setMotivo] = useState('')
  const [horaInicio, setHoraInicio] = useState('')
  const [horaFin, setHoraFin] = useState('')
  const [comentariosParada, setComentariosParada] = useState('')
  const [error, setError] = useState('')

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

  const handleProduccionSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const kgNum = parseFloat(kg)

    if (kgNum <= 0) {
      showToast('La producción debe ser mayor a 0', 'danger')
      return
    }

    // Verificar que no supere el 100%
    const maxReal = orden.plan
    const realActual = orden.real
    const disponible = maxReal - realActual
    
    if (kgNum > disponible) {
      showToast(`Solo puede cargar hasta ${formatNumber(disponible)} kg (máximo ${formatNumber(maxReal)} kg)`, 'warning')
      return
    }

    updateState((prev) => {
      const nuevaMaquina = { ...prev.maquinas[maquinaId] }
      nuevaMaquina.producidoActual += kgNum

      const nuevaOrden = { ...prev.ordenes[ordenId] }
      nuevaOrden.real += kgNum
      const ahora = new Date()
      const hora = ahora.getHours().toString().padStart(2, '0') + ':' + ahora.getMinutes().toString().padStart(2, '0')
      nuevaOrden.registrosProduccion.push({
        hora: hora,
        kg: kgNum,
        operador: maquinaId,
        comentarios: observaciones
      })

      const nuevaLinea = { ...prev.lineas[orden.lineaId] }
      nuevaLinea.real += kgNum / 1000
      nuevaLinea.cumplimiento = Math.round((nuevaLinea.real / nuevaLinea.plan) * 100)

      const nuevoReal = prev.kpis.realAcumulado + kgNum / 1000
      const nuevoCumplimiento = Math.round((nuevoReal / prev.kpis.planSemanal) * 100)

      return {
        ...prev,
        kpis: {
          ...prev.kpis,
          realAcumulado: Math.min(nuevoReal, prev.kpis.planSemanal),
          cumplimiento: Math.min(100, nuevoCumplimiento)
        },
        maquinas: {
          ...prev.maquinas,
          [maquinaId]: nuevaMaquina
        },
        ordenes: {
          ...prev.ordenes,
          [ordenId]: nuevaOrden
        },
        lineas: {
          ...prev.lineas,
          [orden.lineaId]: nuevaLinea
        },
        ultimaActualizacion: new Date()
      }
    })

    showToast(`Guardado: +${formatNumber(kgNum)} kg`, 'success')
    setKg('')
    setObservaciones('')
  }

  const handleParadaSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (horaInicio && horaFin) {
      const inicio = new Date(`2000-01-01T${horaInicio}`)
      const fin = new Date(`2000-01-01T${horaFin}`)
      if (fin < inicio) {
        setError('La hora fin debe ser mayor o igual a la hora inicio')
        return
      }
    }

    const inicio = new Date(`2000-01-01T${horaInicio}`)
    const fin = new Date(`2000-01-01T${horaFin}`)
    const duracion = Math.round((fin.getTime() - inicio.getTime()) / (1000 * 60))

    updateState((prev) => {
      const nuevaOrden = { ...prev.ordenes[ordenId] }
      nuevaOrden.registrosParadas.push({
        motivo: motivo,
        inicio: horaInicio,
        fin: horaFin,
        duracion: duracion,
        comentarios: comentariosParada
      })

      const nuevasAlertas = [...prev.alertas]
      if (motivo === 'Falta de insumos' || motivo === 'Mantenimiento') {
        nuevasAlertas.unshift({
          tipo: motivo === 'Falta de insumos' ? 'danger' : 'warning',
          icono: motivo === 'Falta de insumos' ? '🔴' : '⚠️',
          titulo: `Parada: ${motivo}`,
          descripcion: `${maquinaId} - ${orden.producto} desde ${horaInicio}`
        })
      }

      return {
        ...prev,
        ordenes: {
          ...prev.ordenes,
          [ordenId]: nuevaOrden
        },
        alertas: nuevasAlertas
      }
    })

    showToast('Parada registrada', 'success')
    setMotivo('')
    setHoraInicio('')
    setHoraFin('')
    setComentariosParada('')
  }

  return (
    <div>
      <div className="mb-8">
        <h2 className="text-3xl font-bold mb-2">Orden: {orden.id}</h2>
        <p className="text-gray-600 mb-4">Máquina: {maquinaId} · {linea.nombre}</p>
        <Link href={`/operario/maquina/${maquinaId}`} className="btn btn-secondary">
          ← Volver a órdenes
        </Link>
      </div>

      {/* Resumen de la orden */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="card">
          <label className="text-sm font-semibold text-gray-500 mb-2 block">Producto</label>
          <div className="text-xl font-semibold">{orden.producto}</div>
        </div>
        <div className="card">
          <label className="text-sm font-semibold text-gray-500 mb-2 block">Objetivo</label>
          <div className="text-xl font-semibold">{formatNumber(orden.plan)} kg</div>
        </div>
        <div className="card">
          <label className="text-sm font-semibold text-gray-500 mb-2 block">Real Acumulado</label>
          <div className="text-xl font-semibold">{formatNumber(orden.real)} kg</div>
        </div>
        <div className="card">
          <label className="text-sm font-semibold text-gray-500 mb-2 block">Estado</label>
          <div>
            <span className={`badge ${getEstadoBadgeClass(orden.estado)}`}>{orden.estado}</span>
          </div>
        </div>
      </div>

      {/* Barra de progreso */}
      <div className="card mb-8">
        <label className="text-sm font-semibold text-gray-500 mb-2 block">% Progreso</label>
        <div className="w-full h-8 bg-gray-100 rounded-lg overflow-hidden mt-2">
          <div
            className={`h-full ${progresoColor} rounded-lg flex items-center justify-center text-white text-sm font-semibold transition-all`}
            style={{ width: `${Math.min(100, progreso)}%` }}
          >
            {progreso}%
          </div>
        </div>
        <div className="mt-2 text-sm text-gray-600">
          {formatNumber(orden.real)} / {formatNumber(orden.plan)} kg
          {orden.real < orden.plan && (
            <span className="ml-2 text-[#14B8A6]">
              (Faltan {formatNumber(orden.plan - orden.real)} kg)
            </span>
          )}
        </div>
      </div>

      {/* Formulario directo - sin redundancias */}
      <div className="card mb-8">
        {/* Tabs simples solo para cambiar entre Producción y Parada */}
        <div className="flex gap-2 mb-6 border-b-2 border-gray-200">
          <button
            onClick={() => {
              setActiveTab('produccion')
              router.replace(`/operario/maquina/${maquinaId}/orden/${ordenId}?accion=produccion`)
            }}
            className={`tab ${activeTab === 'produccion' ? 'active' : ''}`}
          >
            📊 Producción
          </button>
          <button
            onClick={() => {
              setActiveTab('parada')
              router.replace(`/operario/maquina/${maquinaId}/orden/${ordenId}?accion=parada`)
            }}
            className={`tab ${activeTab === 'parada' ? 'active' : ''}`}
          >
            ⏸️ Parada
          </button>
        </div>

        {/* Formulario de Producción */}
        <div className={activeTab === 'produccion' ? 'block' : 'hidden'}>
          <form onSubmit={handleProduccionSubmit}>
            <div className="mb-6">
              <label htmlFor="kg-produccion" className="block mb-2 font-semibold">
                Producción realizada (kg) *
              </label>
              <input
                type="number"
                id="kg-produccion"
                value={kg}
                onChange={(e) => setKg(e.target.value)}
                min="0"
                max={orden.plan - orden.real}
                step="0.1"
                required
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-[#14B8A6] focus:outline-none"
                placeholder={`Máximo: ${formatNumber(orden.plan - orden.real)} kg`}
              />
              <p className="text-sm text-gray-500 mt-1">
                Disponible: {formatNumber(orden.plan - orden.real)} kg
              </p>
            </div>
            <div className="mb-6">
              <label className="block mb-2 font-semibold">Estado</label>
              <div className="flex gap-6 flex-wrap">
                <label className="flex items-center gap-2">
                  <input
                    type="radio"
                    name="estado"
                    value="Produciendo"
                    checked={estado === 'Produciendo'}
                    onChange={(e) => setEstado(e.target.value)}
                  />
                  Produciendo
                </label>
                <label className="flex items-center gap-2">
                  <input
                    type="radio"
                    name="estado"
                    value="Pausa"
                    checked={estado === 'Pausa'}
                    onChange={(e) => setEstado(e.target.value)}
                  />
                  Pausa
                </label>
                <label className="flex items-center gap-2">
                  <input
                    type="radio"
                    name="estado"
                    value="Fin de lote"
                    checked={estado === 'Fin de lote'}
                    onChange={(e) => setEstado(e.target.value)}
                  />
                  Fin de lote
                </label>
              </div>
            </div>
            <div className="mb-6">
              <label htmlFor="observaciones" className="block mb-2 font-semibold">
                Observaciones
              </label>
              <textarea
                id="observaciones"
                value={observaciones}
                onChange={(e) => setObservaciones(e.target.value)}
                rows={3}
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-[#14B8A6] focus:outline-none resize-y"
                placeholder="Comentarios opcionales..."
              />
            </div>
            <button type="submit" className="btn btn-primary btn-large">
              Guardar Producción
            </button>
          </form>
        </div>

        {/* Formulario de Parada */}
        <div className={activeTab === 'parada' ? 'block' : 'hidden'}>
          <form onSubmit={handleParadaSubmit}>
            <div className="mb-6">
              <label htmlFor="motivo" className="block mb-2 font-semibold">
                Motivo *
              </label>
              <select
                id="motivo"
                value={motivo}
                onChange={(e) => setMotivo(e.target.value)}
                required
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-[#14B8A6] focus:outline-none"
              >
                <option value="">Seleccionar...</option>
                <option value="Mantenimiento">Mantenimiento</option>
                <option value="Falta de insumos">Falta de insumos</option>
                <option value="Limpieza">Limpieza</option>
                <option value="Cambio de formato">Cambio de formato</option>
                <option value="Calidad (bloqueo)">Calidad (bloqueo)</option>
                <option value="Otro">Otro</option>
              </select>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              <div>
                <label htmlFor="hora-inicio" className="block mb-2 font-semibold">
                  Hora inicio *
                </label>
                <input
                  type="time"
                  id="hora-inicio"
                  value={horaInicio}
                  onChange={(e) => setHoraInicio(e.target.value)}
                  required
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-[#14B8A6] focus:outline-none"
                />
              </div>
              <div>
                <label htmlFor="hora-fin" className="block mb-2 font-semibold">
                  Hora fin *
                </label>
                <input
                  type="time"
                  id="hora-fin"
                  value={horaFin}
                  onChange={(e) => setHoraFin(e.target.value)}
                  required
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-[#14B8A6] focus:outline-none"
                />
              </div>
            </div>
            <div className="mb-6">
              <label htmlFor="comentarios-parada" className="block mb-2 font-semibold">
                Comentarios
              </label>
              <textarea
                id="comentarios-parada"
                value={comentariosParada}
                onChange={(e) => setComentariosParada(e.target.value)}
                rows={3}
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-[#14B8A6] focus:outline-none resize-y"
                placeholder="Comentarios opcionales..."
              />
            </div>
            {error && (
              <div className="mb-6 text-red-500">{error}</div>
            )}
            <button type="submit" className="btn btn-primary btn-large">
              Guardar Parada
            </button>
          </form>
        </div>
      </div>

      {/* Historial reciente */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="card">
          <h3 className="text-xl font-semibold mb-4">Últimas Producciones</h3>
          <div className="space-y-3">
            {orden.registrosProduccion.slice(-5).reverse().map((reg, index) => (
              <div key={index} className="p-3 bg-gray-50 rounded-lg">
                <div className="flex justify-between items-center">
                  <span className="font-semibold text-[#14B8A6]">{reg.hora}</span>
                  <span className="font-bold">+{formatNumber(reg.kg)} kg</span>
                </div>
                {reg.comentarios && (
                  <p className="text-sm text-gray-600 mt-1">{reg.comentarios}</p>
                )}
              </div>
            ))}
            {orden.registrosProduccion.length === 0 && (
              <p className="text-gray-500 text-center py-4">No hay registros de producción</p>
            )}
          </div>
        </div>

        <div className="card">
          <h3 className="text-xl font-semibold mb-4">Últimas Paradas</h3>
          <div className="space-y-3">
            {orden.registrosParadas.slice(-5).reverse().map((parada, index) => (
              <div key={index} className="p-3 bg-gray-50 rounded-lg">
                <div className="flex justify-between items-center mb-1">
                  <span className="font-semibold text-[#14B8A6]">{parada.inicio} - {parada.fin}</span>
                  <span className="text-sm text-gray-600">{parada.duracion} min</span>
                </div>
                <div className="font-semibold">{parada.motivo}</div>
                {parada.comentarios && (
                  <p className="text-sm text-gray-600 mt-1">{parada.comentarios}</p>
                )}
              </div>
            ))}
            {orden.registrosParadas.length === 0 && (
              <p className="text-gray-500 text-center py-4">No hay registros de paradas</p>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
