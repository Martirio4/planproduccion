'use client'

import { useApp } from '@/context/AppContext'
import { useRouter } from 'next/navigation'
import { useToast } from '@/components/Toast'
import { useState, use } from 'react'

export default function ParadaPage({ params }: { params: Promise<{ maquinaId: string }> }) {
  const { state, updateState } = useApp()
  const router = useRouter()
  const { showToast } = useToast()
  const [motivo, setMotivo] = useState('')
  const [horaInicio, setHoraInicio] = useState('')
  const [horaFin, setHoraFin] = useState('')
  const [comentarios, setComentarios] = useState('')
  const [error, setError] = useState('')

  const { maquinaId } = use(params)

  let maquina = state.maquinas[maquinaId]
  if (!maquina) {
    router.push(`/maquina/${maquinaId}`)
    return null
  }

  const orden = state.ordenes[maquina.ordenId]

  const handleSubmit = (e: React.FormEvent) => {
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
      const nuevaOrden = { ...prev.ordenes[maquina.ordenId] }
      nuevaOrden.registrosParadas.push({
        motivo: motivo,
        inicio: horaInicio,
        fin: horaFin,
        duracion: duracion,
        comentarios: comentarios
      })

      const nuevasAlertas = [...prev.alertas]
      if (motivo === 'Falta de insumos' || motivo === 'Mantenimiento') {
        nuevasAlertas.unshift({
          tipo: motivo === 'Falta de insumos' ? 'danger' : 'warning',
          icono: motivo === 'Falta de insumos' ? '🔴' : '⚠️',
          titulo: `Parada: ${motivo}`,
          descripcion: `${maquinaId} - ${orden ? orden.producto : ''} desde ${horaInicio}`
        })
      }

      return {
        ...prev,
        ordenes: {
          ...prev.ordenes,
          [maquina.ordenId]: nuevaOrden
        },
        alertas: nuevasAlertas
      }
    })

    showToast('Parada registrada', 'success')
    setMotivo('')
    setHoraInicio('')
    setHoraFin('')
    setComentarios('')
  }

  return (
    <div>
      <div className="mb-8">
        <h2 className="text-3xl font-bold mb-4">Reportar Parada</h2>
        <button
          onClick={() => router.push(`/maquina/${maquinaId}`)}
          className="btn btn-secondary"
        >
          Volver
        </button>
      </div>

      <div className="card mb-8">
        <h3 className="text-xl font-semibold mb-4">Contexto</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
        </div>
      </div>

      <div className="card">
        <form onSubmit={handleSubmit}>
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
          <div className="mb-6">
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
          <div className="mb-6">
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
          <div className="mb-6">
            <label htmlFor="comentarios-parada" className="block mb-2 font-semibold">
              Comentarios
            </label>
            <textarea
              id="comentarios-parada"
              value={comentarios}
              onChange={(e) => setComentarios(e.target.value)}
              rows={3}
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-[#14B8A6] focus:outline-none resize-y"
            />
          </div>
          {error && (
            <div className="mb-6 text-red-500">{error}</div>
          )}
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
