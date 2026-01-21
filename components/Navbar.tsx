'use client'

import { useApp } from '@/context/AppContext'
import { useToast } from '@/components/Toast'
import { useTheme } from '@/context/ThemeContext'
import { usePathname } from 'next/navigation'
import Link from 'next/link'
import { useState } from 'react'
import CargarPlanModal from '@/components/CargarPlanModal'
import { ThemeSwitch } from '@/components/ThemeSwitch'

export function Navbar() {
  const { state, updateState } = useApp()
  const { showToast } = useToast()
  const { theme } = useTheme()
  const pathname = usePathname()
  const [isModalOpen, setIsModalOpen] = useState(false)
  
  // Verificar si estamos en modo admin
  const isAdminMode = pathname?.startsWith('/admin')

  const handleSimularCarga = () => {
    updateState((prev) => {
      const ahora = new Date()
      const hora = ahora.getHours().toString().padStart(2, '0') + ':' + ahora.getMinutes().toString().padStart(2, '0')
      
      let totalIncremento = 0
      const nuevasMaquinas: Record<string, any> = {}
      const nuevasOrdenes: Record<string, any> = {}
      const nuevasLineas: Record<string, any> = {}
      const ordenesPorLinea: Record<string, string[]> = {}

      // Agrupar órdenes por línea
      Object.values(prev.ordenes).forEach((orden) => {
        if (!ordenesPorLinea[orden.lineaId]) {
          ordenesPorLinea[orden.lineaId] = []
        }
        ordenesPorLinea[orden.lineaId].push(orden.id)
      })

      // Actualizar TODAS las líneas
      Object.keys(prev.lineas).forEach((lineaId) => {
        const linea = prev.lineas[lineaId]
        const ordenesLinea = ordenesPorLinea[lineaId] || []
        
        // Calcular cuánto falta para alcanzar el 100%
        const maxReal = linea.plan
        const realActual = linea.real
        const disponible = Math.max(0, maxReal - realActual)
        
        if (disponible <= 0) {
          return
        }

        const incrementoLinea = Math.min(Math.random() * 1.5 + 0.5, disponible)
        totalIncremento += incrementoLinea

        const nuevaLinea = { ...linea }
        nuevaLinea.real += incrementoLinea
        nuevaLinea.cumplimiento = Math.round((nuevaLinea.real / nuevaLinea.plan) * 100)
        nuevasLineas[lineaId] = nuevaLinea

        const ordenesEnProceso = ordenesLinea.filter(id => {
          const orden = prev.ordenes[id]
          return orden && (orden.estado === 'En proceso' || orden.estado === 'Planificado')
        })

        if (ordenesEnProceso.length > 0) {
          const incrementoPorOrden = (incrementoLinea * 1000) / ordenesEnProceso.length

          ordenesEnProceso.forEach((ordenId) => {
            const orden = prev.ordenes[ordenId]
            if (!nuevasOrdenes[ordenId]) {
              nuevasOrdenes[ordenId] = { ...orden }
            }
            
            const maxRealOrden = orden.plan
            const realActualOrden = nuevasOrdenes[ordenId].real
            const disponibleOrden = Math.max(0, maxRealOrden - realActualOrden)
            
            if (disponibleOrden <= 0) {
              return
            }
            
            const incrementoKg = Math.min(
              Math.round(incrementoPorOrden + (Math.random() * 200 - 100)),
              disponibleOrden
            )
            
            nuevasOrdenes[ordenId].real += incrementoKg
            nuevasOrdenes[ordenId].registrosProduccion.push({
              hora: hora,
              kg: incrementoKg,
              operador: `Simulación ${lineaId}`,
              comentarios: 'Carga simulada desde dashboard'
            })
          })
        }
      })

      Object.keys(prev.maquinas).forEach((maquinaId) => {
        const maquina = prev.maquinas[maquinaId]
        const orden = prev.ordenes[maquina.ordenId]
        
        if (orden && nuevasOrdenes[orden.id]) {
          const ordenOriginal = prev.ordenes[orden.id]
          const incrementoOrden = nuevasOrdenes[orden.id].real - ordenOriginal.real
          
          if (incrementoOrden > 0) {
            const nuevaMaquina = { ...maquina }
            nuevaMaquina.producidoActual += Math.round(incrementoOrden * 0.8)
            nuevasMaquinas[maquinaId] = nuevaMaquina
          }
        }
      })

      const maxRealGlobal = prev.kpis.planSemanal
      const realActualGlobal = prev.kpis.realAcumulado
      const disponibleGlobal = Math.max(0, maxRealGlobal - realActualGlobal)
      const incrementoRealGlobal = Math.min(totalIncremento, disponibleGlobal)
      
      const newReal = prev.kpis.realAcumulado + incrementoRealGlobal
      const newCumplimiento = Math.min(100, Math.round((newReal / prev.kpis.planSemanal) * 100))

      return {
        ...prev,
        kpis: {
          ...prev.kpis,
          realAcumulado: newReal,
          cumplimiento: newCumplimiento,
          retrasos: prev.kpis.retrasos > 0 && Math.random() > 0.5 ? prev.kpis.retrasos - 1 : prev.kpis.retrasos
        },
        maquinas: {
          ...prev.maquinas,
          ...nuevasMaquinas
        },
        ordenes: {
          ...prev.ordenes,
          ...nuevasOrdenes
        },
        lineas: {
          ...prev.lineas,
          ...nuevasLineas
        },
        ultimaActualizacion: new Date()
      }
    })
    showToast('Actualizado por carga de máquinas en todas las líneas', 'success')
  }

  const handleReset = () => {
    if (!confirm('¿Está seguro de que desea resetear todos los datos a los valores iniciales?')) {
      return
    }
    
    updateState(() => {
      const { initialState } = require('@/context/AppContext')
      return {
        ...initialState,
        ultimaActualizacion: new Date(),
        kpis: { ...initialState.kpis },
        lineas: JSON.parse(JSON.stringify(initialState.lineas)),
        ordenes: JSON.parse(JSON.stringify(initialState.ordenes)),
        alertas: JSON.parse(JSON.stringify(initialState.alertas)),
        maquinas: JSON.parse(JSON.stringify(initialState.maquinas))
      }
    })
    showToast('Datos reseteados a valores iniciales', 'info')
  }

  return (
    <>
      <header 
        className="border-b-2 sticky top-0 z-50 shadow-sm"
        style={{
          backgroundColor: theme === 'dark' ? '#1f2937' : '#ffffff',
          borderColor: theme === 'dark' ? '#374151' : '#e5e7eb'
        }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center flex-wrap gap-4">
            <h1 
              className="text-2xl font-bold"
              style={{ color: theme === 'dark' ? '#f9fafb' : '#111827' }}
            >
              Plan Semanal de Producción
            </h1>
            <div className="flex gap-3 items-center">
              {/* Botón para volver a selección - siempre visible */}
              <Link 
                href="/"
                className="btn btn-secondary"
                style={{
                  backgroundColor: theme === 'dark' ? '#374151' : '#ffffff',
                  color: theme === 'dark' ? '#f9fafb' : '#2c3e50',
                  borderColor: theme === 'dark' ? '#4b5563' : '#e0e4e8'
                }}
              >
                Inicio
              </Link>
              
              {/* Toggle Dark Mode */}
              <ThemeSwitch />
              
              {/* Botones solo en modo admin */}
              {isAdminMode && (
                <>
                  <button 
                    onClick={handleSimularCarga}
                    className="btn btn-secondary"
                  >
                    Simular carga
                  </button>
                  <button 
                    onClick={handleReset}
                    className="btn btn-secondary"
                  >
                    Reset
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      </header>
      <CargarPlanModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
    </>
  )
}
