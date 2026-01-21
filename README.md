# Plan Semanal de Producción - AGRANA Fruit

Aplicación web para gestión de plan semanal de producción desarrollada con Next.js 16, TypeScript y Tailwind CSS v4.

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
│   │   ├── dashboard/     # Dashboard principal con Gantt semanal
│   │   ├── linea/         # Detalle de línea con KPIs y órdenes
│   │   └── orden/         # Detalle de orden con registros
│   ├── operario/          # Vistas de operario
│   │   ├── page.tsx       # Selección de máquina
│   │   └── maquina/       # Gestión por máquina
│   │       └── [maquinaId]/
│   │           ├── page.tsx           # Listado de órdenes
│   │           └── orden/[ordenId]/    # Registro de producción/paradas
│   ├── layout.tsx         # Layout principal con providers
│   ├── page.tsx           # Página de inicio (selección Admin/Operario)
│   └── globals.css        # Estilos globales y componentes
├── components/            # Componentes reutilizables
│   ├── Navbar.tsx         # Barra de navegación con acciones globales
│   ├── CargarPlanModal.tsx # Modal para cargar plan de producción
│   ├── Gauge.tsx          # Componente de indicador tipo velocímetro
│   ├── Toast.tsx          # Sistema de notificaciones
│   └── Breadcrumb.tsx     # Navegación breadcrumb (deprecado)
├── context/               # Context API de React
│   ├── AppContext.tsx     # Estado global de la aplicación
│   └── ThemeContext.tsx   # Gestión de tema (light/dark)
└── public/                # Archivos estáticos
```

## 🎯 Características Implementadas

### Vista Administrador

- ✅ **Dashboard Principal**
  - KPIs globales: Plan semanal, Real acumulado, % Cumplimiento, Retrasos
  - Gantt semanal por línea con barras de progreso visuales
  - Vista toggle entre barras Gantt e indicadores tipo gauge (velocímetro)
  - Navegación por semanas con chevrons y selector
  - Indicador de semana actual con fechas inicio/fin
  - Colores distintivos por línea (púrpura, azul, ámbar)
  - Panel de alertas en tiempo real
  - Botones de acción: "Cargar Plan", "Simular carga", "Reset"

- ✅ **Carga de Plan de Producción**
  - Modal para agregar nuevas órdenes de producción
  - Selección de semana (semanas reales del año con fechas)
  - Selección de línea con productos dependientes
  - Campos: semana, línea, producto, cantidad (kg), fecha compromiso
  - Validación y persistencia en estado global

- ✅ **Detalle de Línea** (`/admin/linea/[lineaId]`)
  - KPIs de línea: Plan, Real, % Cumplimiento (con gauge)
  - Tabla de órdenes ordenable por fecha compromiso y progreso
  - Indicadores visuales de completación por orden
  - Columna de semana para cada orden
  - Timeline de eventos con filtros por tipo y fecha
  - Navegación a detalle de orden

- ✅ **Detalle de Orden** (`/admin/orden/[ordenId]`)
  - KPIs: Producto, Línea, Estado, Objetivo, Real Acumulado, % Progreso
  - Layout con cards apiladas y gauge de progreso
  - Tabs para registros de producción y paradas
  - Exportación simulada (mock)

### Vista Operario

- ✅ **Selección de Máquina** (`/operario`)
  - Listado de todas las máquinas disponibles
  - Acceso directo a órdenes por máquina

- ✅ **Órdenes por Máquina** (`/operario/maquina/[maquinaId]`)
  - Listado de órdenes activas para la máquina
  - Selector de semana con chevrons y dropdown
  - Columna de semana en la tabla
  - Acciones directas: "Registrar Producción" y "Registrar Parada"

- ✅ **Registro de Producción/Paradas** (`/operario/maquina/[maquinaId]/orden/[ordenId]`)
  - Tabs directos para producción o parada (según query param)
  - Formulario de producción: cantidad (kg), estado, observaciones
  - Formulario de parada: motivo, hora inicio/fin, comentarios
  - Validaciones y actualización en tiempo real del estado global
  - Impacto inmediato en KPIs del dashboard

### Funcionalidades Generales

- ✅ **Sistema de Simulación**
  - Simulación de carga desde máquinas que actualiza todas las líneas
  - Límite de 100% de cumplimiento (no excede objetivos)
  - Actualización de máquinas, órdenes, líneas y KPIs globales
  - Botón Reset para restaurar valores iniciales

- ✅ **Dark Mode**
  - Toggle en navbar con iconos de sol/luna
  - Persistencia en localStorage
  - Detección de preferencia del sistema
  - Estilos completos para todos los componentes

- ✅ **Navegación y UX**
  - Página de inicio con selección Admin/Operario
  - Navegación fluida entre vistas
  - Breadcrumbs (opcional, removido del layout principal)
  - Sistema de toasts para notificaciones

- ✅ **Diseño y Estilo**
  - Modo light y dark
  - Color de acento turquesa profesional con gradientes
  - Diseño responsive (mobile/tablet/desktop)
  - Componentes grandes optimizados para tablets
  - Estilo industrial moderno y limpio

## 🛠️ Tecnologías

- **Next.js 16** - Framework React con App Router
- **React 19** - Biblioteca UI
- **TypeScript** - Tipado estático
- **Tailwind CSS v4** - Estilos utility-first
- **React Context API** - Gestión de estado global
- **Next.js Dynamic Routes** - Rutas dinámicas `[lineaId]`, `[ordenId]`, `[maquinaId]`

## 📱 Rutas Disponibles

### Administrador
- `/` - Página de inicio (selección de vista)
- `/admin/dashboard` - Dashboard principal con Gantt semanal
- `/admin/linea/[lineaId]` - Detalle de línea con órdenes
- `/admin/orden/[ordenId]` - Detalle de orden con registros

### Operario
- `/operario` - Selección de máquina
- `/operario/maquina/[maquinaId]` - Órdenes de la máquina
- `/operario/maquina/[maquinaId]/orden/[ordenId]` - Registro de producción/paradas

## 🎨 Sistema de Colores

### Modo Light
- Fondo: `#f5f7fb`
- Acento: Turquesa `#14B8A6` → `#0D9488` (gradiente)
- Texto: `#2c3e50`

### Modo Dark
- Fondo: `#1f2937`
- Cards: `#374151`
- Bordes: `#4b5563`
- Texto: `#f9fafb`

### Colores de Líneas (Gantt)
- Línea A: Púrpura `#8B5CF6` → `#7C3AED`
- Línea B: Azul `#3B82F6` → `#2563EB`
- Línea C: Ámbar `#F59E0B` → `#D97706`

## 🚢 Deploy en Vercel

1. Conecta tu repositorio a Vercel
2. Vercel detectará automáticamente Next.js
3. El deploy se realizará automáticamente

O usando CLI:

```bash
npm i -g vercel
vercel
```

## 📝 Notas Técnicas

- **Estado Global**: Los datos son simulados y se mantienen en memoria usando React Context
- **Semanas**: Sistema de semanas ISO 8601 con cálculo automático de fechas inicio/fin
- **Persistencia**: El tema (light/dark) se guarda en localStorage
- **Next.js 15+**: Uso de `React.use()` para unwrap de `params` en rutas dinámicas
- **Responsive**: Diseño optimizado para tablets y pantallas grandes
- **Backend**: Para producción, conectar con backend real (API REST o similar)

## 🔄 Próximos Pasos Sugeridos

- [ ] Integración con backend real (API REST)
- [ ] Autenticación y autorización
- [ ] Exportación real de datos (CSV/Excel)
- [ ] Notificaciones push
- [ ] Historial de cambios
- [ ] Reportes avanzados
- [ ] Integración con sistemas ERP existentes
