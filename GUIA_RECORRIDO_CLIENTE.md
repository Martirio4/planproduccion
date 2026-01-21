# Guía de Recorrido - Plan Semanal de Producción AGRANA Fruit

Esta guía te ayudará a explorar todas las funcionalidades de la aplicación y asegurarte de ver cada pantalla y característica implementada.

## 🎯 Flujo Recomendado de Exploración

### 1. Página de Inicio
**Ruta:** `http://localhost:3000/`

**Qué verás:**
- Título: "Plan Semanal de Producción - AGRANA Fruit"
- Dos opciones de acceso:
  - **Vista Administrador** (icono de pluma/fuente)
  - **Vista Operario** (icono de llave inglesa)

**Acción:** Haz clic en "Vista Administrador" para comenzar el recorrido.

---

### 2. Dashboard Administrador
**Ruta:** `/admin/dashboard`

**Qué verás:**
- **Header con Navbar:**
  - Título de la aplicación
  - Botones: "Cargar Plan", "Simular carga", "Reset"
  - Toggle de modo oscuro/claro (sol/luna)
  
- **Indicador de Semana:**
  - Semana actual con fechas de inicio y fin
  - Selector de semana (dropdown arriba a la derecha)

- **KPIs Globales (4 tarjetas):**
  - Plan semanal (t)
  - Real acumulado (t)
  - % Cumplimiento
  - Retrasos

- **Programación Semanal por Línea:**
  - Indicador de semana con chevrons (◀ ▶) para navegar
  - Botón "Cargar Plan" al lado del indicador
  - Lista de líneas (A, B, C) con:
    - Nombre de línea y producto
    - Barra de progreso visual
    - Porcentaje y tonelaje
    - Borde izquierdo de color distintivo

- **Panel de Alertas:**
  - Alertas en tiempo real (éxito, advertencia, peligro)

**Acciones a probar:**
1. ✅ Cambiar de semana usando los chevrons (◀ ▶)
2. ✅ Cambiar de semana usando el selector superior
3. ✅ Hacer clic en una línea para ver su detalle
4. ✅ Hacer clic en "Simular carga" y observar cómo cambian los KPIs
5. ✅ Hacer clic en "Reset" para restaurar valores iniciales
6. ✅ Probar el toggle de modo oscuro/claro
7. ✅ Hacer clic en "Cargar Plan" para abrir el modal

---

### 3. Modal: Cargar Plan de Producción
**Cómo acceder:** Botón "Cargar Plan" en el navbar o en el dashboard

**Qué verás:**
- Formulario con campos:
  - **Semana:** Selector con semanas del año (actual + próximas 12)
  - **Línea:** Selector (Línea A, B, C)
  - **Producto:** Se filtra automáticamente según la línea seleccionada
  - **Cantidad (kg):** Input numérico
  - **Fecha Compromiso:** Input de fecha

**Acciones a probar:**
1. ✅ Seleccionar una línea y ver cómo cambian los productos disponibles
2. ✅ Seleccionar diferentes semanas
3. ✅ Completar el formulario y guardar
4. ✅ Verificar que la nueva orden aparece en el dashboard

---

### 4. Detalle de Línea
**Ruta:** `/admin/linea/[lineaId]` (ej: `/admin/linea/LINEA_A`)

**Cómo acceder:** Haz clic en cualquier línea del dashboard

**Qué verás:**
- **Header:**
  - Nombre de la línea
  - Botón "Volver al dashboard"

- **KPIs de Línea (3 tarjetas):**
  - **Plan Línea:** Número y barra azul al 100%
  - **Real Línea:** Número y barra de progreso (verde/amarillo/rojo según cumplimiento)
  - **% Cumplimiento:** Gauge tipo velocímetro

- **Filtro de Estado:**
  - Selector: Todos / En proceso / Atrasado / Terminado

- **Tabla de Órdenes:**
  - Columnas: Lote/Orden, Producto, Semana, Plan (kg), Real (kg), Progreso, Fecha Compromiso
  - **Progreso:** Badge de estado + porcentaje + barra visual
  - **Ordenable:** Haz clic en "Progreso" o "Fecha Compromiso" para ordenar
  - Cada fila es clickeable para ver el detalle de la orden

- **Timeline de Eventos:**
  - Filtros por tipo (Todos/Producción/Paradas) y fecha
  - Lista de eventos con fecha, hora y descripción
  - Colores distintos para producción (azul) y paradas (naranja)

**Acciones a probar:**
1. ✅ Filtrar órdenes por estado
2. ✅ Ordenar la tabla por progreso (ascendente/descendente)
3. ✅ Ordenar la tabla por fecha compromiso
4. ✅ Filtrar el timeline por tipo de evento
5. ✅ Filtrar el timeline por fecha
6. ✅ Hacer clic en una orden para ver su detalle
7. ✅ Probar el modo oscuro en esta vista

---

### 5. Detalle de Orden (Vista Admin)
**Ruta:** `/admin/orden/[ordenId]` (ej: `/admin/orden/FR-342`)

**Cómo acceder:** Haz clic en cualquier orden de la tabla en el detalle de línea

**Qué verás:**
- **Header:**
  - ID de la orden
  - Información de línea y máquina
  - Botón "Volver a detalle de línea"

- **KPIs Superiores (2 tarjetas):**
  - Producto
  - Estado (con badge)

- **KPIs Principales (3 tarjetas):**
  - **Objetivo:** Número y barra azul al 100%
  - **Real Acumulado:** Número y barra de progreso
  - **% Progreso:** Gauge tipo velocímetro

- **Tabs de Registros:**
  - **Tab Producción:** Lista de registros con hora, kg, operador, comentarios
  - **Tab Paradas:** Lista de paradas con motivo, inicio, fin, duración, comentarios

- **Botón "Exportar (mock)":**
  - Muestra un toast de simulación

**Acciones a probar:**
1. ✅ Cambiar entre tabs de Producción y Paradas
2. ✅ Hacer clic en "Exportar" y ver el toast
3. ✅ Revisar los registros históricos
4. ✅ Navegar de vuelta a la línea

---

### 6. Vista Operario - Selección de Máquina
**Ruta:** `/operario`

**Cómo acceder:** 
- Desde la página de inicio, haz clic en "Vista Operario"
- O navega directamente a `/operario`

**Qué verás:**
- Título: "Seleccionar Máquina"
- Lista de todas las máquinas disponibles
- Cada máquina muestra:
  - ID de la máquina
  - Línea asociada
  - Producto actual
  - Botón "Ver Órdenes"

**Acciones a probar:**
1. ✅ Hacer clic en "Ver Órdenes" de cualquier máquina

---

### 7. Órdenes por Máquina (Vista Operario)
**Ruta:** `/operario/maquina/[maquinaId]` (ej: `/operario/maquina/LINEA_A_03`)

**Cómo acceder:** Desde la lista de máquinas, haz clic en "Ver Órdenes"

**Qué verás:**
- **Header:**
  - ID de la máquina
  - Información de línea y producto actual
  - Botón "← Volver a máquinas"

- **Selector de Semana:**
  - Indicador de semana con chevrons (◀ ▶)
  - Dropdown para seleccionar semana específica

- **Tabla de Órdenes:**
  - Columnas: Lote/Orden, Producto, Semana, Plan (kg), Real (kg), Progreso, Acciones
  - **Progreso:** Badge de estado + porcentaje + barra visual
  - **Acciones:** Dos botones directos:
    - "Registrar Producción"
    - "Registrar Parada"

**Acciones a probar:**
1. ✅ Cambiar de semana usando los chevrons
2. ✅ Cambiar de semana usando el dropdown
3. ✅ Ver cómo se filtran las órdenes según la semana seleccionada
4. ✅ Hacer clic en "Registrar Producción" de una orden
5. ✅ Hacer clic en "Registrar Parada" de una orden

---

### 8. Registro de Producción/Parada (Vista Operario)
**Ruta:** `/operario/maquina/[maquinaId]/orden/[ordenId]?accion=produccion` o `?accion=parada`

**Cómo acceder:** Desde la tabla de órdenes, haz clic en "Registrar Producción" o "Registrar Parada"

**Qué verás:**
- **Header:**
  - ID de la orden
  - Información de máquina y línea
  - Botón "← Volver a órdenes"

- **KPIs Superiores (2 tarjetas):**
  - Producto
  - Estado

- **KPIs Principales (3 tarjetas):**
  - **Objetivo:** Número y barra azul
  - **Real Acumulado:** Número y barra de progreso
  - **% Progreso:** Gauge + cantidad restante

- **Tabs:**
  - **📊 Producción**
  - **⏸️ Parada**

- **Formulario según tab activo:**

  **Tab Producción:**
  - Producción realizada (kg) *
  - Estado (radio): Produciendo / Pausa / Fin de lote
  - Observaciones (textarea)
  - Botón "Guardar Producción"

  **Tab Parada:**
  - Motivo (select) *
  - Hora inicio *
  - Hora fin *
  - Comentarios (textarea)
  - Botón "Guardar Parada"

- **Historial:**
  - Últimas Producciones (últimos 5 registros)
  - Últimas Paradas (últimos 5 registros)

**Acciones a probar:**

**En Tab Producción:**
1. ✅ Ingresar una cantidad de kg
2. ✅ Seleccionar un estado
3. ✅ Agregar observaciones
4. ✅ Guardar y ver el toast de confirmación
5. ✅ Verificar que el KPI "Real Acumulado" se actualiza
6. ✅ Verificar que aparece en "Últimas Producciones"
7. ✅ Intentar cargar más del 100% y ver la validación

**En Tab Parada:**
1. ✅ Cambiar al tab Parada (no debe hacer scroll hacia arriba)
2. ✅ Seleccionar un motivo
3. ✅ Ingresar hora inicio y fin
4. ✅ Agregar comentarios
5. ✅ Guardar y ver el toast
6. ✅ Verificar que aparece en "Últimas Paradas"
7. ✅ Intentar guardar con hora fin menor a inicio y ver validación

**Navegación:**
1. ✅ Cambiar entre tabs sin que la página haga scroll
2. ✅ Volver a órdenes y verificar que los datos se actualizaron

---

## 🔄 Flujo Completo de Drill-Down Recomendado

### Flujo Administrador:
```
1. Página Inicio
   ↓
2. Dashboard Admin
   ↓ (click en línea)
3. Detalle de Línea
   ↓ (click en orden)
4. Detalle de Orden
   ↓ (volver)
5. Detalle de Línea
   ↓ (volver)
6. Dashboard Admin
```

### Flujo Operario:
```
1. Página Inicio
   ↓
2. Selección de Máquina
   ↓ (click en máquina)
3. Órdenes por Máquina
   ↓ (click en "Registrar Producción")
4. Registro de Producción
   ↓ (guardar y volver)
5. Órdenes por Máquina
   ↓ (click en "Registrar Parada")
6. Registro de Parada
   ↓ (guardar y volver)
7. Órdenes por Máquina
```

### Flujo Interconectado:
```
1. Dashboard Admin
   ↓ (Simular carga)
2. Dashboard Admin (actualizado)
   ↓
3. Vista Operario → Máquina → Registrar Producción
   ↓ (guardar)
4. Volver a Dashboard Admin
   ↓ (verificar que los KPIs se actualizaron)
```

---

## ✅ Checklist de Funcionalidades

### Dashboard Admin
- [ ] Ver KPIs globales
- [ ] Navegar entre semanas con chevrons
- [ ] Navegar entre semanas con selector
- [ ] Ver barras de progreso por línea
- [ ] Ver porcentajes y tonelajes
- [ ] Hacer clic en línea para ver detalle
- [ ] Simular carga y ver actualización
- [ ] Resetear datos
- [ ] Cargar nuevo plan
- [ ] Cambiar modo oscuro/claro

### Cargar Plan
- [ ] Seleccionar semana
- [ ] Seleccionar línea
- [ ] Ver productos filtrados por línea
- [ ] Completar y guardar plan
- [ ] Verificar que aparece en dashboard

### Detalle de Línea
- [ ] Ver KPIs con gauge
- [ ] Filtrar órdenes por estado
- [ ] Ordenar por progreso
- [ ] Ordenar por fecha compromiso
- [ ] Ver timeline de eventos
- [ ] Filtrar timeline por tipo
- [ ] Filtrar timeline por fecha
- [ ] Hacer clic en orden para ver detalle

### Detalle de Orden (Admin)
- [ ] Ver KPIs con gauge
- [ ] Cambiar entre tabs
- [ ] Ver registros de producción
- [ ] Ver registros de paradas
- [ ] Exportar (mock)

### Vista Operario
- [ ] Ver lista de máquinas
- [ ] Seleccionar máquina
- [ ] Ver órdenes por máquina
- [ ] Cambiar semana en vista operario
- [ ] Registrar producción
- [ ] Registrar parada
- [ ] Ver historial de registros

### Modo Oscuro
- [ ] Activar/desactivar en todas las vistas
- [ ] Verificar contraste de textos
- [ ] Verificar colores de fondos
- [ ] Verificar que persiste al recargar

---

## 🎨 Características Visuales a Verificar

- [ ] Colores distintivos por línea (púrpura, azul, ámbar)
- [ ] Bordes de color en las cards de líneas
- [ ] Barras de progreso con colores (verde/amarillo/rojo)
- [ ] Gauges tipo velocímetro funcionando
- [ ] Alertas con colores apropiados
- [ ] Iconos profesionales (pluma, llave inglesa)
- [ ] Transiciones suaves en hover
- [ ] Responsive en diferentes tamaños de pantalla

---

## 🐛 Cosas a Probar Específicamente

1. **Validaciones:**
   - Intentar cargar producción que exceda el 100%
   - Intentar guardar parada con hora fin < hora inicio
   - Intentar guardar formularios vacíos

2. **Navegación:**
   - Verificar que no hay scroll no deseado al cambiar tabs
   - Verificar que los breadcrumbs funcionan
   - Verificar que los botones "Volver" funcionan

3. **Sincronización:**
   - Registrar producción desde operario y verificar que aparece en admin
   - Simular carga desde admin y verificar que actualiza todo
   - Resetear y verificar que todo vuelve a valores iniciales

4. **Persistencia:**
   - Cambiar modo oscuro y recargar página
   - Verificar que el tema se mantiene

---

## 📝 Notas para el Cliente

- **Datos Simulados:** Todos los datos son simulados y se mantienen en memoria. Al recargar la página, los datos vuelven a los valores iniciales (excepto el tema).

- **Navegación:** Puedes usar los botones del navegador (atrás/adelante) sin problemas.

- **Modo Oscuro:** El toggle está en el navbar y persiste tu preferencia.

- **Semanas:** Las semanas se calculan automáticamente según la fecha actual. Puedes navegar entre semanas para ver/planificar diferentes períodos.

- **Responsive:** La aplicación está optimizada para tablets y pantallas grandes, pero también funciona en móviles.

---

## 🚀 Próximos Pasos Después de la Revisión

Una vez que hayas recorrido todas las pantallas, por favor comparte:
1. ¿Qué funcionalidades faltan o necesitan ajustes?
2. ¿Hay algún flujo que no sea intuitivo?
3. ¿Los colores y diseño son apropiados?
4. ¿Hay alguna pantalla que necesite más información o menos?
5. ¿Las validaciones son suficientes?

---

**¡Disfruta explorando la aplicación!** 🎉
