# IBM Bob GitHub SDLC Lab — Resumen Completo

> Generado por IBM Bob · Repositorio: [github.com/eagelves/EAG-finance-dashboard](https://github.com/eagelves/EAG-finance-dashboard)

---

## ¿Qué es este lab?

Demostración completa de cómo **IBM Bob** puede actuar como un ingeniero de software dentro de un flujo SDLC real usando **GitHub**. El escenario es una aplicación de finanzas en React que rastrea IBM y sus principales competidores con datos de Yahoo Finance.

---

## Parte 1 — Construir la aplicación

### Step B — Estructura del proyecto React

Se creó la base completa de la aplicación:

| Archivo | Descripción |
|---|---|
| `package.json` | Vite + React 18 + Recharts v3 + Vitest v5 + ESLint v9 |
| `vite.config.js` | Configuración de Vite con proxy `/api` al servidor Express |
| `index.html` | Entry point HTML |
| `eslint.config.js` | Flat config ESLint con plugins `react` y `react-hooks` |
| `src/main.jsx` | Punto de entrada React |
| `src/App.jsx` | Shell de la aplicación (header, footer) |
| `src/index.css` | Reset global y estilos base |
| `src/setupTests.js` | Configuración de Testing Library |

**Estructura de carpetas:**

```
src/
├── components/       # Componentes reutilizables
├── pages/            # Páginas de la aplicación
├── services/         # Capa de datos
└── tests/            # Tests unitarios y de render
```

---

### Step C — Integración Yahoo Finance

Se implementó una arquitectura de **proxy + servicio + fallback mock**:

**`server/index.js`** — Proxy Express en `http://127.0.0.1:3001`
- `GET /api/quotes` — cotizaciones actuales de todas las empresas
- `GET /api/history/weekly` — historial 7 días
- `GET /api/history/quarterly` — historial ~63 días (un trimestre)
- `GET /api/history/custom?ticker=AAPL&days=30` — historial para cualquier ticker (Issue #1)
- `GET /api/health` — healthcheck
- Binds solo a `127.0.0.1` (nunca `0.0.0.0`)
- Allowlist de tickers para los endpoints fijos
- Validación regex en el endpoint custom
- `yahoo-finance2 v4` (última versión estable, 0 CVEs)

**`src/services/financeService.js`** — Capa de datos del frontend
- `fetchCurrentQuotes()` — cotizaciones del día
- `fetchWeeklyHistory()` — historial 7 días
- `fetchQuarterlyHistory()` — historial trimestral
- `fetchCompanyChart(ticker, days)` — gráfica para empresa seleccionada por el usuario
- `normaliseForComparison()` — normaliza series a índice 100 para comparación
- **Fallback automático a datos mock** si el proxy no está disponible
- Los tests siempre pasan aunque no haya conexión a internet

**Empresas rastreadas:**

| Ticker | Empresa | Color |
|---|---|---|
| IBM | IBM | `#0f62fe` |
| MSFT | Microsoft | `#107c41` |
| ORCL | Oracle | `#c74634` |
| SAP | SAP | `#0070f3` |
| CRM | Salesforce | `#00a1e0` |

---

### Step D — Dashboards

**Tres vistas con navegación por pestañas:**

#### Current Day — Día actual
- 5 `SummaryCard` con precio, cambio absoluto, % cambio y volumen
- `RankingCard` — lista ordenada por % de cambio del día

#### Last 7 Days — Últimos 7 días
- `AreaChartCard` — gráfica de área con gradiente, series indexadas a 100

#### Last Quarter — Último trimestre
- `ChartCard` — precio absoluto en USD (líneas)
- `AreaChartCard` — rendimiento relativo indexado a 100
- Lado a lado en pantallas anchas (≥900px)

**Componentes creados:**

| Componente | Descripción |
|---|---|
| `SummaryCard` | Tarjeta compacta con precio y cambio del día |
| `ChartCard` | Gráfica de líneas multi-empresa (Recharts) |
| `AreaChartCard` | Gráfica de área con gradiente (variante de ChartCard) |
| `RankingCard` | Lista clasificada por rendimiento diario |
| `CompanySearch` | Input de ticker + gráfica personalizada (Issue #1) |

---

### Step E — Validación y Tests

**6 archivos de tests — 41 tests en total:**

| Archivo | Tests | Qué cubre |
|---|---|---|
| `financeService.test.js` | 12 | Shapes de datos, determinismo, normalización |
| `ChartCard.test.jsx` | 6 | Render, loading, error, accesibilidad |
| `AreaChartCard.test.jsx` | 4 | Render, loading, error |
| `RankingCard.test.jsx` | 6 | Render, orden, signos +/-, accesibilidad |
| `Dashboard.test.jsx` | 5 | Tabs, navegación, botón Refresh |
| `CompanySearch.test.jsx` | 8 | Validación, fetch, estados, errores |

**Resultado final de CI:**
```
npm run lint   ✓  0 errores, 0 advertencias
npm test       ✓  41/41 tests pasaron (6 archivos)
npm run build  ✓  Build de producción exitoso
```

---

### Step F — Artefactos de entrega

Commit preparado con mensaje estructurado referenciando todos los cambios. Artefactos en `docs/DELIVERY-ARTIFACTS.md`.

---

## Parte 2 — GitHub SDLC Automation

### Step A — Estado del repositorio

- Repositorio limpio en `main`
- Rama `feature/user-selected-company-chart` creada y subida a GitHub

### Step B — Issue #1 en GitHub

**[#1 — Add a graph for a user-selected company](https://github.com/eagelves/EAG-finance-dashboard/issues/1)**

```
Título: Add a graph for a user-selected company

Business Request:
  El dashboard existente compara IBM con un conjunto fijo de competidores.
  Queremos que los usuarios puedan indicar un símbolo y ver una gráfica
  adicional sin eliminar las vistas existentes.

Acceptance Criteria:
  - Soporte para cualquier ticker válido ingresado por el usuario
  - Estado de carga mientras se obtienen los datos
  - Estado de error para símbolos inválidos o no disponibles
  - Dashboards originales intactos
  - Tests que cubran el nuevo comportamiento
```

### Step C — Análisis del Issue

**Áreas de código identificadas para cambiar:**
1. `financeService.js` → agregar `fetchCompanyChart(ticker, days)`
2. `server/index.js` → agregar endpoint `/api/history/custom`
3. Nuevo componente `CompanySearch.jsx`
4. `Dashboard.jsx` → integrar `CompanySearch` debajo de las pestañas

**Plan de implementación:**
- Reutilizar la infraestructura del proxy existente
- Validación client-side + server-side del ticker
- Fallback mock para el nuevo endpoint también
- Los dashboards IBM/competidores permanecen intactos

### Step D — Implementación del Feature

**`src/components/CompanySearch.jsx`**
- Input de ticker con `autocapitalize` automático
- Validación: campo vacío → error, caracteres inválidos → error
- Estado loading durante la petición
- Muestra `AreaChartCard` con los datos obtenidos
- El error se limpia al empezar a escribir de nuevo

**`src/services/financeService.js`** — nueva función:
```js
export async function fetchCompanyChart(ticker, days = 30)
```
- Llama a `/api/history/custom?ticker=SYMBOL&days=N`
- Fallback a mock si el proxy no responde

**`server/index.js`** — nuevo endpoint:
```
GET /api/history/custom?ticker=AAPL&days=30
```
- Validación regex: `/^[A-Z0-9.]{1,10}$/`
- Acepta cualquier ticker (no solo los 5 fijos)
- Máximo 365 días

**`src/pages/Dashboard.jsx`**
- `<CompanySearch />` añadido debajo de todas las pestañas
- Separador visual punteado entre el dashboard y la sección custom
- Los tabs existentes no se modificaron

### Step E — Validación del Feature

```
npm run lint   ✓  0 errores
npm test       ✓  41/41 tests (incluye 8 nuevos de CompanySearch)
npm run build  ✓  Build exitoso
```

### Step F — Commit y Push

```
feat(dashboard): add user-selected company chart — closes #1

- src/components/CompanySearch.jsx  — nuevo componente
- src/services/financeService.js    — fetchCompanyChart()
- server/index.js                   — /api/history/custom
- src/pages/Dashboard.jsx           — integración de CompanySearch
- src/tests/CompanySearch.test.jsx  — 8 tests nuevos

Co-authored-by: IBM Bob <bob@ibm.com>
```

### Step G — Pull Request #2 y Merge

**[PR #2 — feat(dashboard): add user-selected company chart](https://github.com/eagelves/EAG-finance-dashboard/pull/2)**

- PR creado con descripción completa, tabla de cambios y checklist de acceptance criteria
- Mergeado directamente por IBM Bob
- Issue #1 cerrado automáticamente por el `closes #1` en el commit
- Rama `main` local sincronizada con `git pull`

---

## Cómo correr el proyecto

### Requisitos
- Node.js 20+
- Conexión a internet (para datos reales) o sin ella (datos mock)

### Iniciar

```bash
# Terminal 1 — Proxy Yahoo Finance (puerto 3001)
cd server
npm install
node index.js

# Terminal 2 — App React (puerto 5173)
npm install
npm run dev
```

Abrir: **http://localhost:5173**

### Comandos disponibles

```bash
npm run dev      # Servidor de desarrollo con HMR
npm run build    # Build de producción en dist/
npm run preview  # Preview del build de producción
npm run lint     # ESLint (0 warnings tolerados)
npm test         # Vitest — todos los tests
```

---

## Flujo SDLC completo demostrado

```
GitHub Issue creado
        ↓
Bob analiza el request (scope, acceptance criteria, impacto)
        ↓
Bob implementa el feature (código + tests)
        ↓
Bob valida: lint ✓ · tests ✓ · build ✓
        ↓
Bob hace commit con mensaje estructurado
        ↓
Bob hace push a la rama feature
        ↓
Bob crea el Pull Request en GitHub
        ↓
GitHub Actions CI/CD valida automáticamente
        ↓
Bob hace merge del PR
        ↓
Issue cerrado automáticamente
        ↓
main local sincronizado
        ↓
✅ Feature en producción
```

---

## Repositorio GitHub

**URL:** https://github.com/eagelves/EAG-finance-dashboard

| Elemento | Estado |
|---|---|
| Rama `main` | ✅ Con feature completo |
| Issue #1 | ✅ CLOSED |
| PR #2 | ✅ MERGED |
| GitHub Actions | ✅ Activo en cada push/PR |

---

*Generado con IBM Bob — IBM SDLC Automation Lab*
