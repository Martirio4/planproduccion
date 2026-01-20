# Plan Semanal de Producción - AGRANA Fruit

Aplicación web para gestión de plan semanal de producción desarrollada con Next.js 14, TypeScript y Tailwind CSS.

## 🚀 Inicio Rápido

### Instalación

```bash
npm install
```

### Desarrollo

```bash
npm run dev
```

Abre [http://localhost:3000](http://localhost:3000) en tu navegador.

### Build para Producción

```bash
npm run build
npm start
```

## 📁 Estructura del Proyecto

```
├── app/                    # App Router de Next.js
│   ├── admin/             # Vistas de administración
│   │   ├── dashboard/     # Dashboard principal
│   │   ├── linea/         # Detalle de línea
│   │   └── orden/         # Detalle de orden
│   ├── maquina/           # Vistas de operario
│   │   └── [maquinaId]/   # Menú y reportes por máquina
│   ├── layout.tsx         # Layout principal
│   ├── page.tsx           # Página de inicio (redirige a dashboard)
│   └── globals.css        # Estilos globales
├── components/            # Componentes reutilizables
│   ├── Breadcrumb.tsx     # Navegación breadcrumb
│   └── Toast.tsx          # Sistema de notificaciones
├── context/               # Context API de React
│   └── AppContext.tsx     # Estado global de la aplicación
└── public/                # Archivos estáticos
```

## 🎯 Características

- ✅ Dashboard con KPIs y Gantt semanal
- ✅ Gestión de líneas de producción
- ✅ Seguimiento de órdenes y lotes
- ✅ Registro de producción desde máquinas
- ✅ Registro de paradas
- ✅ Sistema de alertas
- ✅ Diseño responsive (mobile/tablet/desktop)
- ✅ Modo light con estilo industrial moderno

## 🛠️ Tecnologías

- **Next.js 14** - Framework React con App Router
- **TypeScript** - Tipado estático
- **Tailwind CSS** - Estilos utility-first
- **React Context** - Gestión de estado global

## 📱 Rutas Disponibles

- `/admin/dashboard` - Dashboard principal
- `/admin/linea/[lineaId]` - Detalle de línea
- `/admin/orden/[ordenId]` - Detalle de orden
- `/maquina/[maquinaId]` - Menú de operario
- `/maquina/[maquinaId]/produccion` - Reportar producción
- `/maquina/[maquinaId]/parada` - Reportar parada

## 🚢 Deploy en Vercel

1. Conecta tu repositorio a Vercel
2. Vercel detectará automáticamente Next.js
3. El deploy se realizará automáticamente

O usando CLI:

```bash
npm i -g vercel
vercel
```

## 📝 Notas

- Los datos son simulados y se mantienen en memoria (estado React)
- Para producción, conectar con backend real
- Diseño optimizado para tablets y pantallas grandes
