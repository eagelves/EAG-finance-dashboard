# Guía de Labs — IBM Bob
## GitHub SDLC Automation with IBM Bob (Level 3)

**Usuario:** eagelves@co.ibm.com  
**Bob IDE:** v1.126.0+bob2.2.1  
**Fecha:** Octubre 2026

---

## Contexto previo — Lab Bob Demo-Builder

Antes de iniciar este lab, se completaron los siguientes pasos del lab **Bob Demo-Builder**:

### ✅ Completado
- **Paso iii:** CE Bob Marketplace extension `v0.19.0` instalada
- **Paso iv:** Solicitud de acceso a GitHub Enterprise enviada via IBM AccessHub (Request ID: `#161963893`, aprobada)
- **Paso iv (token):** GitHub PAT creado en `github.ibm.com` con scope `repo` y sin expiración
- **Paso v:** Token configurado en CE Bob Marketplace — todos los repositorios (WW/EMEA, APAC, Japan, Sales Engineering) autenticados correctamente

### ⏳ Pendiente (Lab Demo-Builder)
- **Paso vi:** Abrir carpeta `Bob Demo Builder` (`/Users/eagelves/Documents/IBM_Corporation/BOB/Bob Demo Builder`) en Bob IDE e instalar colección **IBM Pre-Sales Demo Builder** desde CE Marketplace
- **Paso vii:** Obtener Carbon Auth Code + TechZone API Key y configurar los MCP servers

---

## Lab Actual — GitHub SDLC Automation with IBM Bob

### Descripción
Lab de nivel 3 que demuestra cómo IBM Bob puede participar en el ciclo completo de desarrollo de software (SDLC) usando GitHub. Se construye un **React Finance Dashboard** que trackea IBM y competidores (Microsoft, Oracle, SAP, Salesforce) usando Yahoo Finance data.

### Estructura del Lab

| Parte | Foco | Descripción |
|-------|------|-------------|
| **Part 1: Build** | Scaffolding y desarrollo | Planificar, scaffoldear app React, integrar Yahoo Finance, construir dashboards, agregar tests, preparar commit |
| **Part 2: Evolve** | GitHub-driven evolution | Push a GitHub, abrir issue, implementar feature, PR merge-ready |

### Prerrequisitos
- ✅ IBM Bob IDE instalado y autenticado
- ✅ Node.js 20 LTS o newer
- ✅ Git 2.30+
- ✅ Cuenta en github.com
- ✅ Acceso a github.ibm.com (aprobado via AccessHub)

---

## Setup Completado

### Clonar el repositorio
```bash
git clone -b github-sdlc-automation https://github.ibm.com/kkamil-ibm/bobl3.git
```
- **Username:** eagelves@co.ibm.com
- **Password:** GitHub PAT (token ghp_...)

### Mover al workspace de Bob
```bash
mv ~/bobl3/"Github SDLC Automation" "/Users/eagelves/Documents/IBM_Corporation/BOB/"
```

Carpeta disponible en:  
`/Users/eagelves/Documents/IBM_Corporation/BOB/Github SDLC Automation`

---

## Parte 1 | Build — Pasos del Lab

### Paso 1 — Análisis y Planificación

Abrir la carpeta **`Github SDLC Automation`** como workspace activo en Bob IDE (**File → Open Folder → Open in New Window**).

Con **Agent mode** activo, pegar este prompt en el Agentic Sidebar:

```
Analyze this repository as the starting point for a new React-based finance analytics lab. Propose an implementation plan for a 
market dashboard application that tracks IBM and up to four competitors using Yahoo Finance data. The application should 
present three time-window views: current day, last 7 days, and last quarter. Recommend a practical architecture including 
source folders, React component boundaries, data service abstractions, charting approach, state management strategy, error 
handling, test strategy, and local validation steps. Also explain how the implementation should support later GitHub-driven 
feature evolution through issues and pull requests.
```

Bob generará un reporte HTML con el plan de implementación. Revisarlo antes de continuar.

### Paso 2 — Scaffolding de la aplicación

Pegar este prompt en el Agentic Sidebar:

```
Create a simple React application structure for this repository. Include a dashboard page, reusable chart card components, 
a finance data service layer, and a clean folder layout suitable for future enhancements.
```

Bob generará un **Todo List** con 11 sub-tareas. Aprobar cada una con `Yes`:

| Sub-Tarea | Objetivo |
|-----------|----------|
| Sub-Task 1 | Scaffold React app con Vite + TypeScript |
| Sub-Task 2 | Crear constants, types y mock data |
| Sub-Task 3 | Implementar data service layer |
| Sub-Task 4 | Implementar custom hooks |
| Sub-Task 5 | Build layout components |
| Sub-Task 6 | Build feedback components |
| Sub-Task 7 | Build card components |
| Sub-Task 8 | Build chart components |
| Sub-Task 9 | Build view components |
| Sub-Task 10 | Wire up App shell, tests y configuración |
| Sub-Task 11 | Run local validation (lint + test + build) |

---

## Parte 2 | Evolve — Pasos del Lab

### Paso 1 — Publishing to GitHub
- Revisar el diff de cambios no commiteados
- Generar commit message limpio
- Push de la app a un nuevo repositorio GitHub
- Habilitar Issues, Pull Requests y CI workflow

### Paso 2 — Implementing a Feature Request
- Fetch de un GitHub issue con nueva feature request
- Analizar el request y definir acceptance criteria
- Implementar user-selected company chart
- Correr validación en el branch actualizado

### Paso 3 — Preparing a Pull Request
- Generar PR description basada en el diff real
- Preparar el branch para merge o automated closure

---

## Notas importantes

- Bob es **no-determinístico** — los resultados pueden variar entre ejecuciones
- El objetivo es entender el workflow, no llegar al código exacto del lab
- Usar modo **Plan** para planificación y **Agent** para implementación
- Aprobar cada sub-tarea antes de que Bob proceda

---

## Próximos pasos

1. Abrir carpeta `Github SDLC Automation` en **nueva ventana** de Bob IDE (para no perder el chat)
2. Ejecutar el **Prompt de análisis** (Paso 1)
3. Revisar el plan HTML generado por Bob
4. Ejecutar el **Prompt de scaffolding** (Paso 2)
5. Aprobar las 11 sub-tareas una por una
