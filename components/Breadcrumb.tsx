'use client'

import { usePathname } from 'next/navigation'
import Link from 'next/link'

export function Breadcrumb() {
  const pathname = usePathname()
  const parts = pathname.split('/').filter(p => p)

  const breadcrumbs = [
    { label: 'Inicio', href: '/' }
  ]

  if (parts.length > 0 && parts[0] === 'admin') {
    breadcrumbs.push({ label: 'Admin', href: '/admin' })
    if (parts[1] === 'dashboard') {
      breadcrumbs.push({ label: 'Dashboard', href: '/admin/dashboard' })
    } else if (parts[1] === 'linea') {
      breadcrumbs.push({ label: 'Líneas', href: '/admin/linea' })
      if (parts[2]) {
        breadcrumbs.push({ label: parts[2], href: pathname })
      }
    } else if (parts[1] === 'orden') {
      breadcrumbs.push({ label: 'Órdenes', href: '/admin/orden' })
      if (parts[2]) {
        breadcrumbs.push({ label: parts[2], href: pathname })
      }
    }
  } else if (parts[0] === 'operario') {
    breadcrumbs.push({ label: 'Operario', href: '/operario' })
    if (parts[1] === 'maquina' && parts[2]) {
      breadcrumbs.push({ label: `Máquina ${parts[2]}`, href: `/operario/maquina/${parts[2]}` })
      if (parts[3] === 'orden' && parts[4]) {
        breadcrumbs.push({ label: `Orden ${parts[4]}`, href: pathname })
      }
    }
  } else if (parts[0] === 'maquina') {
    breadcrumbs.push({ label: 'Máquina', href: '/maquina' })
    if (parts[1]) {
      breadcrumbs.push({ label: parts[1], href: `/maquina/${parts[1]}` })
      if (parts[2]) {
        const label = parts[2] === 'produccion' ? 'Reportar Producción' : 'Reportar Parada'
        breadcrumbs.push({ label, href: pathname })
      }
    }
  }

  return (
    <nav className="text-sm text-gray-500 flex items-center gap-2">
      {breadcrumbs.map((crumb, index) => (
        <span key={crumb.href} className="flex items-center gap-2">
          {index > 0 && <span className="text-gray-400">›</span>}
          {index === breadcrumbs.length - 1 ? (
            <span className="text-[#14B8A6] font-semibold">{crumb.label}</span>
          ) : (
            <Link href={crumb.href} className="hover:text-[#14B8A6]">
              {crumb.label}
            </Link>
          )}
        </span>
      ))}
    </nav>
  )
}
