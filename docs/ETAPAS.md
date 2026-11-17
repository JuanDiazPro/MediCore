# Etapas de construcción: prototipo MediCore

Plan de trabajo para construir el prototipo demostrativo de MediCore. Se basa en el *Documento Técnico del Prototipo* (`docs/`).
Cada etapa termina con un PR integrado a `main` y el demo publicado en GitHub Pages.

**Estados:** ⬜ Pendiente · 🟨 En progreso · ✅ Terminada

## Resumen

| # | Etapa | Estado | PR | Fecha |
|---|-------|--------|----|-------|
| 1 | Base del proyecto y despliegue | ⬜ | | |
| 2 | Fundamentos: layout, roles, datos simulados y servicios | ⬜ | | |
| 3 | Pacientes | ⬜ | | |
| 4 | Agenda de citas | ⬜ | | |
| 5 | Expediente clínico y consulta | ⬜ | | |
| 6 | Seguimiento activo y recordatorios | ⬜ | | |
| 7 | Caja y cobros | ⬜ | | |
| 8 | Tablero y reportes | ⬜ | | |
| 9 | Configuración, pulido y guion de demo | ⬜ | | |

---

## Etapa 1: Base del proyecto y despliegue

**Objetivo:** tener el proyecto creado, con calidad automatizada y publicado en GitHub Pages desde el primer día.

**Requisito previo:** GitHub Pages en repositorio privado requiere GitHub Pro (gratis con GitHub Student Developer Pack); si no, hacer público el repositorio. En *Settings → Pages* elegir **Source: GitHub Actions**.

**Tareas**
- [ ] Crear proyecto con Vite (plantilla `react-ts`) en la raíz del repositorio.
- [ ] Configurar `base: '/MediCore/'` en `vite.config.ts` y alias `@/` → `src/`.
- [ ] Instalar y configurar Tailwind CSS con la paleta de MediCore (`#0B6E79` primario, `#14A3A3` acento).
- [ ] Inicializar shadcn/ui (botón, tarjeta e input como primeros componentes) e instalar Lucide.
- [ ] Configurar ESLint y Prettier, con scripts `lint` y `format`.
- [ ] Configurar Vitest y Testing Library, con una prueba de ejemplo que pase.
- [ ] Instalar React Router con **HashRouter** y crear rutas `/` (bienvenida) y `*` (no encontrado).
- [ ] Pantalla de bienvenida con logo/nombre MediCore, la **franja "Versión demostrativa: datos ficticios"** y texto explicativo del demo.
- [ ] Crear la estructura de carpetas de `src/` según `CLAUDE.md`.
- [ ] `.github/workflows/deploy.yml`: `npm ci` → lint → test → build → publicar `dist/` en GitHub Pages.
- [ ] Actualizar `README.md`: qué es, aviso de demo, enlace al sitio y cómo correrlo.

**Criterios de aceptación**
- `npm run lint`, `npm run test -- --run` y `npm run build` pasan en local y en CI.
- `https://juandiazpro.github.io/MediCore/` muestra la pantalla de bienvenida con la franja de demo.
- Recargar el navegador en cualquier ruta no da error 404.

---

## Etapa 2: Fundamentos: layout, roles, datos simulados y servicios

**Objetivo:** el esqueleto navegable con inicio de sesión simulado, datos ficticios y la capa de servicios en la que se apoyan todos los módulos.

**Tareas**
- [ ] Tipos del modelo de datos en `src/types/`: Clinica, Usuario, Medico, Paciente, Cita, Consulta, Receta, PlanSeguimiento, Pago y Servicio.
- [ ] Generador de datos semilla con Faker `es_MX` y **semilla fija**: 1 clínica, 6 médicos, unos 250 pacientes, 6 meses de citas, consultas y pagos, y catálogos de servicios y CIE-10 de ejemplo.
- [ ] Utilidad de almacenamiento (`lib/storage`) sobre `localStorage`, con versión de esquema e inicialización con la semilla.
- [ ] Capa de servicios: contrato (`*.service.ts`) e implementación simulada (`*.mock.ts`) con latencia de 300 a 800 ms, para cada entidad.
- [ ] Configurar TanStack Query (QueryClientProvider) y hooks base.
- [ ] Store de sesión con Zustand: usuario, rol activo, iniciar y cerrar sesión.
- [ ] Inicio de sesión simulado con los 3 usuarios demo (`admin@`, `medico@` y `recepcion@demo.medicore`, contraseña `demo123`) y botones de acceso rápido por rol.
- [ ] Layout principal: barra lateral con menú según el rol, encabezado con usuario y rol, franja de demo y diseño responsivo.
- [ ] Rutas protegidas y páginas vacías ("Próximamente") para cada módulo.
- [ ] Botón **"Reiniciar demo"** que borra `localStorage` y regenera los datos semilla.
- [ ] Pantalla "Acerca de" con el aviso de demo y el enlace al repositorio.
- [ ] Pruebas: generador determinista (misma semilla, mismos datos), servicios mock y permisos de menú por rol.

**Criterios de aceptación**
- Se puede entrar con cada rol y el menú cambia según el rol.
- Los datos son los mismos en cualquier navegador nuevo y persisten al recargar.
- "Reiniciar demo" regresa al estado inicial.

---

## Etapa 3: Pacientes

**Objetivo:** gestionar el padrón de pacientes.

**Tareas**
- [ ] Lista de pacientes con búsqueda (nombre o teléfono), filtros (médico tratante, último contacto) y paginación.
- [ ] Alta y edición de paciente con React Hook Form + Zod (validación de teléfono, correo y fecha de nacimiento).
- [ ] Ficha del paciente: datos generales, alergias, tipo de sangre, próximas citas y pestañas reservadas para expediente, pagos y seguimiento.
- [ ] Estados de carga, vacío y error en todas las vistas.
- [ ] Pruebas del formulario y de la búsqueda.

**Criterios de aceptación:** recepción y administración pueden crear, buscar y editar pacientes; el médico ve solo a sus pacientes.

---

## Etapa 4: Agenda de citas

**Objetivo:** la agenda inteligente, el corazón operativo del demo.

**Tareas**
- [ ] Integrar FullCalendar en español con vistas de día, semana y mes y color por médico.
- [ ] Filtro por médico (el médico ve solo su agenda por defecto).
- [ ] Crear cita (paciente, médico, servicio, fecha y hora) validando empalmes y horario del médico.
- [ ] Mover cita arrastrando y soltando; reprogramar y cancelar.
- [ ] Estados de cita: pendiente, confirmada, asistió y no asistió, con colores e iconos.
- [ ] Panel lateral con el detalle de la cita y acciones rápidas (confirmar, marcar asistencia, ir al expediente).
- [ ] Indicador "recordatorio enviado" (simulado).
- [ ] Pruebas de la lógica de empalmes y cambios de estado.

**Criterios de aceptación:** se puede agendar, mover, cancelar y cambiar el estado de citas, y los cambios persisten.

---

## Etapa 5: Expediente clínico y consulta

**Objetivo:** mostrar el expediente clínico electrónico y el flujo de consulta.

**Tareas**
- [ ] Historia clínica: antecedentes heredofamiliares, personales patológicos y no patológicos y alergias.
- [ ] Línea de tiempo del paciente: consultas, citas, pagos y seguimientos.
- [ ] Flujo de consulta desde una cita: signos vitales y nota SOAP (subjetivo, objetivo, análisis y plan).
- [ ] Diagnósticos con buscador del catálogo CIE-10 de ejemplo.
- [ ] Receta: lista de medicamentos (nombre, dosis, frecuencia, duración) e indicaciones.
- [ ] Generar **receta en PDF** con jsPDF, con marca de agua "DEMO, sin validez".
- [ ] Al cerrar la consulta, la cita pasa a "asistió" y se puede crear un plan de seguimiento.
- [ ] Bitácora simple de cambios (quién y cuándo) mostrada en el expediente.
- [ ] Pruebas del esquema SOAP y de la generación de la receta.

**Criterios de aceptación:** el médico atiende una cita de principio a fin y descarga la receta con marca DEMO.

---

## Etapa 6: Seguimiento activo y recordatorios

**Objetivo:** el diferenciador de MediCore: que los pacientes lleguen y regresen.

**Tareas**
- [ ] Vista de pacientes con control pendiente o vencido (planes de seguimiento).
- [ ] Crear, editar y cerrar planes de tratamiento o seguimiento.
- [ ] "Enviar recordatorio" simulado por WhatsApp, SMS o correo: vista previa del mensaje y notificación tipo toast.
- [ ] Recordatorio masivo simulado para las citas de mañana.
- [ ] Campañas simuladas (por ejemplo, "revisión anual") con segmentación básica.
- [ ] Bandeja de mensajes enviados (historial simulado).
- [ ] Pruebas de la lógica de vencimientos.

**Criterios de aceptación:** se identifican pacientes pendientes y se les "envía" un recordatorio que queda registrado.

---

## Etapa 7: Caja y cobros

**Objetivo:** cobro ordenado y trazable.

**Tareas**
- [ ] Registrar cobro ligado a una cita o un servicio, con método (efectivo, tarjeta o transferencia).
- [ ] Recibo simulado en PDF con folio y marca DEMO.
- [ ] Corte de caja diario por método de pago.
- [ ] Historial de pagos por paciente (pestaña en la ficha).
- [ ] Pruebas de los cálculos del corte.

**Criterios de aceptación:** recepción cobra una consulta, descarga el recibo y el corte del día cuadra.

---

## Etapa 8: Tablero y reportes

**Objetivo:** mostrar el valor de negocio con números (apoya el cálculo de ROI en la negociación).

**Tareas**
- [ ] Tablero: citas de hoy, ocupación, tasa de inasistencia, ingresos del mes y pacientes nuevos contra recurrentes.
- [ ] Gráficas con Recharts: ingresos mensuales, inasistencias por mes y citas por médico.
- [ ] Reportes con filtros de fechas: ingresos por médico o servicio y evolución de inasistencias.
- [ ] Escenario de demo en los datos semilla: las inasistencias bajan después de activar los recordatorios.
- [ ] Tablero según el rol: completo para administración, personal para el médico y operativo para recepción.
- [ ] Pruebas de las funciones de métricas.

**Criterios de aceptación:** el tablero cuenta la historia "MediCore reduce inasistencias e incrementa ingresos".

---

## Etapa 9: Configuración, pulido y guion de demo

**Objetivo:** dejar el prototipo listo para presentar y negociar.

**Tareas**
- [ ] Configuración: datos de la clínica, médicos y horarios, y servicios y precios.
- [ ] Revisión responsiva (tableta y celular) y de accesibilidad básica.
- [ ] Modo oscuro (opcional).
- [ ] Carga diferida por módulo y revisión de rendimiento.
- [ ] Pruebas e2e con Playwright del flujo "agendar → atender → cobrar" (opcional, en CI).
- [ ] `docs/GUION-DEMO.md`: guion de 5 a 7 minutos para presentar MediCore en la negociación.
- [ ] README final con capturas de pantalla.

**Criterios de aceptación:** demo estable en GitHub Pages, sin errores en consola y con guion de presentación listo.

---

## Bitácora de cambios del plan

- 2026-11-17: Plan inicial creado (9 etapas).
