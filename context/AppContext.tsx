'use client'

import React, { createContext, useContext, useState, ReactNode } from 'react'

// Tipos
export interface Linea {
  id: string
  nombre: string
  plan: number
  real: number
  cumplimiento: number
}

export interface RegistroProduccion {
  hora: string
  kg: number
  operador: string
  comentarios: string
}

export interface RegistroParada {
  motivo: string
  inicio: string
  fin: string
  duracion: number
  comentarios: string
}

export interface Orden {
  id: string
  lineaId: string
  producto: string
  plan: number
  real: number
  estado: 'Planificado' | 'En proceso' | 'En espera calidad' | 'Terminado' | 'Atrasado'
  fechaCompromiso: string
  semana: number // Semana del año a la que pertenece esta orden
  registrosProduccion: RegistroProduccion[]
  registrosParadas: RegistroParada[]
}

export interface Alerta {
  tipo: 'warning' | 'danger' | 'info' | 'success'
  icono: string
  titulo: string
  descripcion: string
}

export interface Maquina {
  id: string
  lineaId: string
  ordenId: string
  producto: string
  turno: string
  objetivoTurno: number
  producidoActual: number
}

interface AppState {
  semana: number
  planta: string
  ultimaActualizacion: Date
  kpis: {
    planSemanal: number
    realAcumulado: number
    cumplimiento: number
    retrasos: number
  }
  lineas: Record<string, Linea>
  ordenes: Record<string, Orden>
  alertas: Alerta[]
  maquinas: Record<string, Maquina>
}

interface AppContextType {
  state: AppState
  updateState: (updater: (state: AppState) => AppState) => void
}

// Función para obtener el número de semana del año (ISO 8601)
function getWeekNumber(date: Date): number {
  const d = new Date(date)
  d.setHours(0, 0, 0, 0)
  d.setDate(d.getDate() + 3 - (d.getDay() + 6) % 7)
  const yearStart = new Date(d.getFullYear(), 0, 1)
  return Math.ceil((((d.getTime() - yearStart.getTime()) / 86400000) + 1) / 7)
}

export const initialState: AppState = {
  semana: getWeekNumber(new Date()),
  planta: 'Planta Norte',
  ultimaActualizacion: new Date(),
  kpis: {
    planSemanal: 120,
    realAcumulado: 94,
    cumplimiento: 78,
    retrasos: 3
  },
  lineas: {
    LINEA_A: {
      id: 'LINEA_A',
      nombre: 'Línea A · Pulpa',
      plan: 45,
      real: 38,
      cumplimiento: 84
    },
    LINEA_B: {
      id: 'LINEA_B',
      nombre: 'Línea B · Concentrado',
      plan: 50,
      real: 35,
      cumplimiento: 70
    },
    LINEA_C: {
      id: 'LINEA_C',
      nombre: 'Línea C · Envasado',
      plan: 25,
      real: 21,
      cumplimiento: 84
    }
  },
  ordenes: {
    'FR-342': {
      id: 'FR-342',
      lineaId: 'LINEA_A',
      producto: 'Pulpa Manzana',
      plan: 8500,
      real: 7200,
      estado: 'En proceso',
      fechaCompromiso: '2024-04-15',
      semana: getWeekNumber(new Date()),
      registrosProduccion: [
        { hora: '08:10', kg: 450, operador: 'Máquina 03', comentarios: 'Carga normal' },
        { hora: '09:30', kg: 520, operador: 'Máquina 03', comentarios: '' },
        { hora: '11:15', kg: 480, operador: 'Máquina 03', comentarios: 'Ajuste de temperatura' },
        { hora: '13:45', kg: 510, operador: 'Máquina 03', comentarios: '' },
        { hora: '15:20', kg: 490, operador: 'Máquina 03', comentarios: '' },
        { hora: '16:50', kg: 460, operador: 'Máquina 03', comentarios: '' }
      ],
      registrosParadas: [
        { motivo: 'Falta de insumos', inicio: '10:00', fin: '10:15', duracion: 15, comentarios: 'Esperando pulpa base' },
        { motivo: 'Limpieza', inicio: '12:00', fin: '12:30', duracion: 30, comentarios: 'Limpieza programada' },
        { motivo: 'Mantenimiento', inicio: '14:00', fin: '14:20', duracion: 20, comentarios: 'Revisión de válvulas' }
      ]
    },
    'FR-345': {
      id: 'FR-345',
      lineaId: 'LINEA_A',
      producto: 'Pulpa Pera',
      plan: 7200,
      real: 6800,
      estado: 'En proceso',
      fechaCompromiso: '2024-04-16',
      semana: getWeekNumber(new Date()),
      registrosProduccion: [
        { hora: '08:00', kg: 400, operador: 'Máquina 01', comentarios: '' },
        { hora: '10:30', kg: 420, operador: 'Máquina 01', comentarios: '' },
        { hora: '12:00', kg: 410, operador: 'Máquina 01', comentarios: '' }
      ],
      registrosParadas: [
        { motivo: 'Cambio de formato', inicio: '09:00', fin: '09:30', duracion: 30, comentarios: '' }
      ]
    },
    'FR-348': {
      id: 'FR-348',
      lineaId: 'LINEA_A',
      producto: 'Pulpa Durazno',
      plan: 6000,
      real: 6000,
      estado: 'Terminado',
      fechaCompromiso: '2024-04-14',
      semana: getWeekNumber(new Date()),
      registrosProduccion: [
        { hora: '08:00', kg: 500, operador: 'Máquina 02', comentarios: '' },
        { hora: '10:00', kg: 520, operador: 'Máquina 02', comentarios: '' }
      ],
      registrosParadas: []
    },
    'FR-350': {
      id: 'FR-350',
      lineaId: 'LINEA_B',
      producto: 'Concentrado Manzana',
      plan: 12000,
      real: 8500,
      estado: 'Atrasado',
      fechaCompromiso: '2024-04-15',
      semana: getWeekNumber(new Date()),
      registrosProduccion: [
        { hora: '08:00', kg: 800, operador: 'Máquina 05', comentarios: '' },
        { hora: '11:00', kg: 750, operador: 'Máquina 05', comentarios: '' }
      ],
      registrosParadas: [
        { motivo: 'Calidad (bloqueo)', inicio: '09:00', fin: '10:30', duracion: 90, comentarios: 'Esperando liberación de calidad' }
      ]
    },
    'FR-352': {
      id: 'FR-352',
      lineaId: 'LINEA_B',
      producto: 'Concentrado Pera',
      plan: 10000,
      real: 9200,
      estado: 'En proceso',
      fechaCompromiso: '2024-04-17',
      semana: getWeekNumber(new Date()),
      registrosProduccion: [
        { hora: '08:00', kg: 700, operador: 'Máquina 06', comentarios: '' },
        { hora: '10:00', kg: 720, operador: 'Máquina 06', comentarios: '' }
      ],
      registrosParadas: []
    },
    'FR-355': {
      id: 'FR-355',
      lineaId: 'LINEA_C',
      producto: 'Envasado Pulpa 1L',
      plan: 8000,
      real: 7500,
      estado: 'En proceso',
      fechaCompromiso: '2024-04-16',
      semana: getWeekNumber(new Date()),
      registrosProduccion: [
        { hora: '08:00', kg: 600, operador: 'Máquina 08', comentarios: '' },
        { hora: '10:00', kg: 580, operador: 'Máquina 08', comentarios: '' }
      ],
      registrosParadas: []
    },
    'FR-356': {
      id: 'FR-356',
      lineaId: 'LINEA_C',
      producto: 'Envasado Pulpa 500ml',
      plan: 5000,
      real: 4200,
      estado: 'Planificado',
      fechaCompromiso: '2024-04-18',
      semana: getWeekNumber(new Date()),
      registrosProduccion: [],
      registrosParadas: []
    }
  },
  alertas: [
    { tipo: 'warning', icono: '⚠️', titulo: 'Línea B con retraso', descripcion: 'Concentrado Manzana (FR-350) está 29% por debajo del plan' },
    { tipo: 'danger', icono: '🔴', titulo: 'Parada prolongada', descripcion: 'Línea A - Falta de insumos desde 10:00' },
    { tipo: 'info', icono: 'ℹ️', titulo: 'Cambio de turno', descripcion: 'Turno mañana finaliza a las 18:00' }
  ],
  maquinas: {
    'LINEA_A_03': {
      id: 'LINEA_A_03',
      lineaId: 'LINEA_A',
      ordenId: 'FR-342',
      producto: 'Pulpa Manzana',
      turno: 'Mañana',
      objetivoTurno: 2000,
      producidoActual: 7200
    }
  }
}

const AppContext = createContext<AppContextType | undefined>(undefined)

export function AppProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AppState>(initialState)

  const updateState = (updater: (state: AppState) => AppState) => {
    setState(updater)
  }

  return (
    <AppContext.Provider value={{ state, updateState }}>
      {children}
    </AppContext.Provider>
  )
}

export function useApp() {
  const context = useContext(AppContext)
  if (context === undefined) {
    throw new Error('useApp must be used within an AppProvider')
  }
  return context
}
