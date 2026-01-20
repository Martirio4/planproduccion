'use client'

import { useApp } from '@/context/AppContext'
import { useRouter } from 'next/navigation'
import { useToast } from '@/components/Toast'
import { useState, use } from 'react'

export default function ProduccionPage({ params }: { params: Promise<{ maquinaId: string }> }) {
  const { state, updateState } = useApp()
  const router = useRouter()
  const { showToast } = useToast()
  const [kg, setKg] = useState('')
  const [estado, setEstado] = useState('Produciendo')
  const [observaciones, setObservaciones] = useState('')

  const { maquinaId } = use(params)

  let maquina = state.maquinas[maquinaId]
  if (!maquina) {
    router.push(`/maquina/${maquinaId}`)
    return null
  }

  const orden = state.ordenes[maquina.ordenId]

  const formatNumber = (num: number) => {
    return new Intl.NumberFormat('es-AR').format(num)
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const kgNum = parseFloat(kg)

    if (kgNum <= 0) {
      showToast('La producción debe ser mayor a 0', 'danger')
      return
    }

    updateState((prev) => {
      const nuevaMaquina = { ...prev.maquinas[maquinaId] }
      nuevaMaquina.producidoActual += kgNum

      const nuevaOrden = { ...prev.ordenes[maquina.ordenId] }
      nuevaOrden.real += kgNum
      const ahora = new Date()
      const hora = ahora.getHours().toString().padStart(2, '0') + ':' + ahora.getMinutes().toString().padStart(2, '0')
      nuevaOrden.registrosProduccion.push({
        hora: hora,
        kg: kgNum,
        operador: maquinaId,
        comentarios: observaciones
      })

      const nuevaLinea = { ...prev.lineas[maquina.lineaId] }
      nuevaLinea.real += kgNum / 1000
      nuevaLinea.cumplimiento = Math.round((nuevaLinea.real / nuevaLinea.plan) * 100)

      const nuevoReal = prev.kpis.realAcumulado + kgNum / 1000
      const nuevoCumplimiento = Math.round((nuevoReal / prev.kpis.planSemanal) * 100)

      return {
        ...prev,
        kpis: {
          ...prev.kpis,
          realAcumulado: nuevoReal,
          cumplimiento: nuevoCumplimiento
        },
        maquinas: {
          ...prev.maquinas,
          [maquinaId]: nuevaMaquina
        },
        ordenes: {
          ...prev.ordenes,
          [maquina.ordenId]: nuevaOrden
        },
        lineas: {
          ...prev.lineas,
          [maquina.lineaId]: nuevaLinea
        },
        ultimaActualizacion: new Date()
      }
    })

    showToast(`Guardado: +${formatNumber(kgNum)} kg`, 'success')
    setKg('')
    setObservaciones('')
  }

  return (
    <div>
      <div className="mb-8">
        <h2 className="text-3xl font-bold mb-4">Reportar Producción</h2>
        <button
          onClick={() => router.push(`/maquina/${maquinaId}`)}
          className="btn btn-secondary"
        >
          Volver
        </button>
      </div>

      <div className="card mb-8">
        <h3 className="text-xl font-semibold mb-4">Contexto</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          <div className="p-3 bg-gray-50 rounded-lg">
            <label className="text-xs text-gray-500 block mb-1">Máquina</label>
            <div className="text-lg font-semibold">{maquinaId}</div>
          </div>
          <div className="p-3 bg-gray-50 rounded-lg">
            <label className="text-xs text-gray-500 block mb-1">Lote</label>
            <div className="text-lg font-semibold">{maquina.ordenId}</div>
          </div>
          <div className="p-3 bg-gray-50 rounded-lg">
            <label className="text-xs text-gray-500 block mb-1">Producto</label>
            <div className="text-lg font-semibold">{orden ? orden.producto : maquina.producto}</div>
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

      <div className="card">
        <form onSubmit={handleSubmit}>
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
              step="0.1"
              required
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-[#14B8A6] focus:outline-none"
            />
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
            />
          </div>
          <div className="flex gap-4">
            <button type="submit" className="btn btn-primary btn-large">
              Guardar
            </button>
            <button
              type="button"
              onClick={() => router.push(`/maquina/${maquinaId}`)}
              className="btn btn-secondary btn-large"
            >
              Volver
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
