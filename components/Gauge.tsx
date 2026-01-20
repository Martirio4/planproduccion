'use client'

interface GaugeProps {
  porcentaje: number
  color: string
  size?: number
}

export function Gauge({ porcentaje, color, size = 120 }: GaugeProps) {
  const porcentajeClamp = Math.min(100, Math.max(0, porcentaje))
  const radius = size / 2 - 10
  const circumference = 2 * Math.PI * radius
  const offset = circumference - (porcentajeClamp / 100) * circumference

  const getColor = () => {
    if (porcentajeClamp >= 80) return '#10B981' // verde
    if (porcentajeClamp >= 60) return '#F59E0B' // amarillo
    return '#EF4444' // rojo
  }

  return (
    <div className="relative inline-block" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="transform -rotate-90">
        {/* Fondo del círculo */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="#e5e7eb"
          strokeWidth="12"
        />
        {/* Arco de progreso */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={getColor()}
          strokeWidth="12"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          className="transition-all duration-500"
        />
      </svg>
      {/* Texto en el centro */}
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <div className="text-2xl font-bold" style={{ color: getColor() }}>
          {Math.round(porcentajeClamp)}%
        </div>
      </div>
    </div>
  )
}
