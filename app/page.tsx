'use client'

import Link from 'next/link'

export default function Home() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-[#f5f7fb]">
      <div className="max-w-4xl w-full px-4">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-800 mb-4">Plan Semanal de Producción</h1>
          <p className="text-xl text-gray-600">AGRANA Fruit</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <Link
            href="/admin/dashboard"
            className="card cursor-pointer hover:border-[#14B8A6] hover:shadow-lg hover:-translate-y-1 transition-all text-center p-12"
          >
            <div className="text-7xl mb-6">👔</div>
            <h2 className="text-3xl font-bold mb-4">Vista Administrador</h2>
            <p className="text-gray-600 text-lg">
              Dashboard, KPIs, Gantt semanal, detalle de líneas y órdenes
            </p>
          </Link>

          <Link
            href="/operario"
            className="card cursor-pointer hover:border-[#14B8A6] hover:shadow-lg hover:-translate-y-1 transition-all text-center p-12"
          >
            <div className="text-7xl mb-6">🔧</div>
            <h2 className="text-3xl font-bold mb-4">Vista Operario</h2>
            <p className="text-gray-600 text-lg">
              Listado de máquinas, órdenes y registro de producción y paradas
            </p>
          </Link>
        </div>
      </div>
    </div>
  )
}
