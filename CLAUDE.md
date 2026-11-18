# CLAUDE.md — MediCore (Yocoyasoft)

Guía para Claude (y para el equipo) al trabajar en este repositorio. Léela completa antes de cualquier tarea.

## Qué es este proyecto

**MediCore** es una plataforma SaaS para la gestión integral de clínicas privadas (agenda, expediente clínico electrónico, consultas, seguimiento activo de pacientes, caja y reportes), desarrollada por **Yocoyasoft** como proyecto escolar (materia de Negociación + área de software).

Este repositorio contiene el **PROTOTIPO DEMOSTRATIVO**: un sitio estático publicado en **GitHub Pages**.

Documentos fuente (en `docs/`):

- `MediCore - Caso de Negocio y Estrategia de Negociacion.pdf`: el porqué del proyecto, modelo de negocio y negociación.
- `MediCore - Documento Tecnico del Prototipo.pdf`: alcance, arquitectura, stack y despliegue. **Fuente de verdad técnica.**
- `Naturaleza de Yocoyasoft.pdf`: giro, misión, visión e integrantes.
- `ETAPAS.md`: **plan de construcción por etapas y su estado.** Aquí se registra el avance.

## Reglas no negociables

1. **Todo es simulado.** No hay backend, base de datos real ni servicios externos. Los datos se generan con Faker (`es_MX`) y se guardan en `localStorage`.
2. **Nunca uses datos reales** de pacientes ni personas. Correos con dominio `@demo.medicore`; cédulas, CURP y teléfonos ficticios.
3. **Nunca subas secretos** (tokens, llaves o contraseñas reales). Los usuarios demo tienen la contraseña pública `demo123` a propósito.
4. Toda pantalla muestra la franja **"Versión demostrativa: datos ficticios"**. Recetas, recibos y reportes descargables llevan la marca de agua **DEMO**.
5. Las pantallas **nunca** acceden a datos directamente: siempre pasan por la **capa de servicios** (`src/services/<entidad>/<entidad>.service.ts` define el contrato y `<entidad>.mock.ts` lo implementa con latencia simulada). Así el backend real se podrá conectar después sin tocar la UI.

## Stack

TypeScript · React · Vite · Tailwind CSS · shadcn/ui (Radix) · Lucide · React Router (**HashRouter**) · TanStack Query · Zustand · React Hook Form + Zod · @faker-js/faker (es_MX) · FullCalendar · Recharts · date-fns (locale `es`) · jsPDF · Vitest + Testing Library · Playwright (opcional) · ESLint + Prettier · GitHub Actions → GitHub Pages.

Usa la versión estable vigente de cada paquete. No agregues dependencias fuera de esta lista sin justificarlo en el PR.

## Comandos (a partir de la Etapa 1)

```bash
npm install          # instalar dependencias
npm run dev          # servidor local
npm run lint         # ESLint
npm run test         # Vitest (modo watch); en CI: npm run test -- --run
npm run build        # build de producción en dist/
npm run preview      # previsualizar el build
```

## Despliegue

- Repositorio: `https://github.com/JuanDiazPro/MediCore`
- URL del demo: `https://juandiazpro.github.io/MediCore/`
- En `vite.config.ts`: `base: '/MediCore/'` (respeta mayúsculas: es el nombre del repositorio).
- Rutas con **HashRouter** (`/#/agenda`) para evitar errores 404 en GitHub Pages.
- `.github/workflows/deploy.yml` corre lint, tests y build y publica `dist/` en cada push a `main`.
- GitHub Pages en un repositorio **privado** requiere GitHub Pro (gratis con GitHub Student Developer Pack). Si no se tiene, el repositorio debe ser público.

## Estructura (objetivo)

```
src/
  app/          arranque, rutas, layout, providers
  components/   ui/ (shadcn), layout/, charts/
  features/     auth, dashboard, agenda, pacientes, expediente, consultas, seguimiento, caja, reportes, configuracion
  services/     contratos + implementación simulada (*.mock.ts)
  mocks/        generador de datos semilla (Faker con semilla fija) y catálogos (CIE-10 de ejemplo, servicios)
  types/        modelo de datos (Clinica, Usuario, Medico, Paciente, Cita, Consulta, Receta, PlanSeguimiento, Pago, Servicio)
  lib/          utilidades (fechas, moneda MXN, PDF, storage)
```

## Convenciones

- **Idioma:** la UI está en español (México). Los nombres de dominio también van en español (`Paciente`, `citasService`, `listarCitas`); los términos técnicos genéricos (`hooks`, `utils`, `props`) se quedan en inglés.
- Moneda en MXN con `Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN' })`.
- Componentes en PascalCase, un componente por archivo; hooks con prefijo `use`.
- Validación de formularios con esquemas Zod en `features/<modulo>/schemas.ts`.
- Diseño responsivo (tableta y celular) y accesibilidad básica (labels, foco, contraste).
- **Sistema visual** (definido en `src/index.css`; úsalo vía clases de Tailwind, no colores sueltos):
  - Turquesa `#14B8A6` (`brand`/`primary`: botones, íconos, enlaces activos) · verde azulado `#0D9488` (`brand-hover`: hover y acentos) · turquesa claro `#CCFBF1` (`brand-soft`).
  - Azul marino `#0F2A44` (`navy`: barra lateral, títulos, texto importante) · fondo `#F1F5F9` · tarjetas `#FFFFFF` · texto secundario `#64748B` (`muted-foreground`).
  - Estados: verde `#22C55E` (confirmada/asistió), amarillo `#F59E0B` (pendiente), rojo `#EF4444` (no asistió/cancelada), como badges tipo píldora (`<Badge variant="pendiente">`).
  - Fuente Inter; títulos en negrita y azul marino; texto de 14 a 16 px.
  - Tarjetas blancas con radio de 16 px (`rounded-2xl`) y sombra suave (`shadow-soft`); indicadores con ícono en círculo turquesa claro (`IconCircle`).
  - Botones tipo píldora: primario turquesa con texto blanco; secundario con borde turquesa y fondo blanco.
  - Tablas sin bordes fuertes (filas separadas con `divide-border`); íconos Lucide de trazo delgado (`strokeWidth={1.75}`).
  - Barra lateral fija azul marino con el logo arriba, íconos blancos y la opción activa en turquesa.
  - Mucho espacio en blanco, formas redondeadas y responsivo en computadora, tableta y celular.
- Commits con Conventional Commits: `feat:`, `fix:`, `docs:`, `style:`, `refactor:`, `test:`, `chore:`, `ci:`.

## Flujo de trabajo por etapas

El proyecto se construye por etapas definidas en **`docs/ETAPAS.md`**. Cuando el usuario diga **"haz la etapa N"**:

1. Lee `docs/ETAPAS.md` (la etapa N y el estado de las anteriores) y este archivo.
2. Crea la rama `etapa-N-<slug>` desde `main` actualizado.
3. Implementa **solo** el alcance de la etapa N. Si algo de una etapa futura bloquea el trabajo, hazlo mínimo y anótalo.
4. Verifica: `npm run lint`, `npm run test -- --run` y `npm run build` deben pasar. Revisa la app en el navegador cuando aplique.
5. Actualiza `docs/ETAPAS.md`: marca las casillas, cambia el estado en la tabla resumen y agrega notas o desviaciones.
6. Haz commit, push de la rama y abre un PR hacia `main` con un resumen de la etapa.
7. Si todo pasa, haz merge a `main` (eso publica el demo) y confirma que el workflow de despliegue terminó bien.
8. Informa al usuario qué se hizo, el enlace del PR y del demo, y cualquier pendiente.

No avances a la siguiente etapa sin que el usuario lo pida.
