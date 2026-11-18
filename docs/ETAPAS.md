# Etapas de construcción: prototipo MediCore

Plan de trabajo para construir el prototipo demostrativo de MediCore. Se basa en el _Documento Técnico del Prototipo_ (`docs/`).
Cada etapa se sube directo a `main` (sin ramas ni PR, por decisión del equipo) y el demo se publica en GitHub Pages.

**Estados:** ⬜ Pendiente · 🟨 En progreso · ✅ Terminada

## Resumen

| #   | Etapa                                                   | Estado | PR   | Fecha      |
| --- | ------------------------------------------------------- | ------ | ---- | ---------- |
| 1   | Base del proyecto y despliegue                          | ✅     | #1   | 2026-11-17 |
| 2   | Fundamentos: layout, roles, datos simulados y servicios | ✅     | main | 2026-11-17 |
| 3   | Pacientes                                               | ✅     | main | 2026-11-17 |
| 4   | Agenda de citas                                         | ✅     | main | 2026-11-17 |
| 5   | Expediente clínico y consulta                           | ✅     | main | 2026-11-17 |
| 6   | Seguimiento activo y recordatorios                      | ✅     | main | 2026-11-17 |
| 7   | Caja y cobros                                           | ✅     | main | 2026-11-17 |
| 8   | Tablero y reportes                                      | ✅     | main | 2026-11-17 |
| 9   | Configuración, pulido y guion de demo                   | ⬜     |      |            |

---

## Etapa 1: Base del proyecto y despliegue

**Objetivo:** tener el proyecto creado, con calidad automatizada y publicado en GitHub Pages desde el primer día.

**Requisito previo:** GitHub Pages en repositorio privado requiere GitHub Pro (gratis con GitHub Student Developer Pack); si no, hacer público el repositorio. En _Settings → Pages_ elegir **Source: GitHub Actions**.

**Tareas**

- [x] Crear proyecto con Vite (plantilla `react-ts`) en la raíz del repositorio.
- [x] Configurar `base: '/MediCore/'` en `vite.config.ts` y alias `@/` → `src/`.
- [x] Instalar y configurar Tailwind CSS con el sistema visual de MediCore (ver notas).
- [x] Inicializar shadcn/ui (botón, tarjeta e input como primeros componentes) e instalar Lucide.
- [x] Configurar ESLint y Prettier, con scripts `lint` y `format`.
- [x] Configurar Vitest y Testing Library, con una prueba de ejemplo que pase.
- [x] Instalar React Router con **HashRouter** y crear rutas `/` (bienvenida) y `*` (no encontrado).
- [x] Pantalla de bienvenida con logo/nombre MediCore, la **franja "Versión demostrativa: datos ficticios"** y texto explicativo del demo.
- [x] Crear la estructura de carpetas de `src/` según `CLAUDE.md`.
- [x] `.github/workflows/deploy.yml`: `npm ci` → lint → test → build → publicar `dist/` en GitHub Pages.
- [x] Actualizar `README.md`: qué es, aviso de demo, enlace al sitio y cómo correrlo.

**Criterios de aceptación**

- `npm run lint`, `npm run test -- --run` y `npm run build` pasan en local y en CI.
- `https://juandiazpro.github.io/MediCore/` muestra la pantalla de bienvenida con la franja de demo.
- Recargar el navegador en cualquier ruta no da error 404.

**Notas y desviaciones**

- Se adoptó el **sistema visual nuevo** pedido por el equipo (turquesa `#14B8A6`, verde azulado `#0D9488`, azul marino `#0F2A44`, fondo `#F1F5F9`, estados verde/amarillo/rojo, fuente Inter, tarjetas de 16 px). Reemplaza la paleta original (`#0B6E79` / `#14A3A3`); `CLAUDE.md` quedó actualizado.
- Tailwind CSS v4 (plugin `@tailwindcss/vite`, tokens en `src/index.css`). shadcn/ui se configuró a mano (`components.json` + componentes en `src/components/ui/`) porque el asistente `shadcn init` es interactivo.
- Además de botón, tarjeta e input se agregó **Badge** (píldoras de estado de cita), necesario para el sistema visual.
- Componentes de layout base: `DemoBanner`, `Logo`, `IconCircle` y `PageShell`. La barra lateral se construye en la Etapa 2.
- Fuente Inter cargada desde Google Fonts en `index.html` (sin dependencia extra).
- El workflow también corre `format:check` y valida los PR (sin desplegar).

---

## Etapa 2: Fundamentos: layout, roles, datos simulados y servicios

**Objetivo:** el esqueleto navegable con inicio de sesión simulado, datos ficticios y la capa de servicios en la que se apoyan todos los módulos.

**Tareas**

- [x] Tipos del modelo de datos en `src/types/`: Clinica, Usuario, Medico, Paciente, Cita, Consulta, Receta, PlanSeguimiento, Pago y Servicio.
- [x] Generador de datos semilla con Faker `es_MX` y **semilla fija**: 1 clínica, 6 médicos, unos 250 pacientes, 6 meses de citas, consultas y pagos, y catálogos de servicios y CIE-10 de ejemplo.
- [x] Utilidad de almacenamiento (`lib/storage`) sobre `localStorage`, con versión de esquema e inicialización con la semilla.
- [x] Capa de servicios: contrato (`*.service.ts`) e implementación simulada (`*.mock.ts`) con latencia de 300 a 800 ms, para cada entidad.
- [x] Configurar TanStack Query (QueryClientProvider) y hooks base.
- [x] Store de sesión con Zustand: usuario, rol activo, iniciar y cerrar sesión.
- [x] Inicio de sesión simulado con los 3 usuarios demo (`admin@`, `medico@` y `recepcion@demo.medicore`, contraseña `demo123`) y botones de acceso rápido por rol.
- [x] Layout principal: barra lateral con menú según el rol, encabezado con usuario y rol, franja de demo y diseño responsivo.
- [x] Rutas protegidas y páginas vacías ("Próximamente") para cada módulo.
- [x] Botón **"Reiniciar demo"** que borra `localStorage` y regenera los datos semilla.
- [x] Pantalla "Acerca de" con el aviso de demo y el enlace al repositorio.
- [x] Pruebas: generador determinista (misma semilla, mismos datos), servicios mock y permisos de menú por rol.

**Criterios de aceptación**

- Se puede entrar con cada rol y el menú cambia según el rol.
- Los datos son los mismos en cualquier navegador nuevo y persisten al recargar.
- "Reiniciar demo" regresa al estado inicial.

**Notas y desviaciones**

- Sin ramas ni PR por decisión del equipo: se trabaja directo sobre `main`.
- Datos semilla deterministas: misma semilla **y misma fecha de referencia** producen los mismos datos. La fecha de referencia es el día en que el navegador abre el demo por primera vez, para que siempre haya citas "de hoy" y "de mañana".
- Volumen: 6 médicos, 250 pacientes, ~3,400 citas, ~2,500 consultas y pagos (~3 MB en localStorage). Si el navegador no permite guardar, el demo funciona en memoria.
- El generador (Faker) se carga de forma diferida: solo se descarga la primera vez.
- Escenario de demo: los recordatorios se activaron hace 90 días; la inasistencia baja de ~22 % a ~8 %.
- Los servicios de todas las entidades (pacientes, citas, consultas, seguimiento, pagos y clínica) quedaron listos desde esta etapa; las reglas de empalme, horario, vencimientos y corte viven en `src/lib/`.
- Toasts propios (sin dependencia extra) y componentes Dialog, Tabs, Label, Select y Textarea al estilo shadcn/ui.
- Pruebas: en Node 22+ el `localStorage` nativo tapa al de jsdom; `src/test/setup.ts` usa uno en memoria.

---

## Etapa 3: Pacientes

**Objetivo:** gestionar el padrón de pacientes.

**Tareas**

- [x] Lista de pacientes con búsqueda (nombre o teléfono), filtros (médico tratante, último contacto) y paginación.
- [x] Alta y edición de paciente con React Hook Form + Zod (validación de teléfono, correo y fecha de nacimiento).
- [x] Ficha del paciente: datos generales, alergias, tipo de sangre, próximas citas y pestañas reservadas para expediente, pagos y seguimiento.
- [x] Estados de carga, vacío y error en todas las vistas.
- [x] Pruebas del formulario y de la búsqueda.

**Criterios de aceptación:** recepción y administración pueden crear, buscar y editar pacientes; el médico ve solo a sus pacientes.

**Notas y desviaciones**

- Lista con búsqueda por nombre o teléfono (con retraso de 300 ms), filtros por médico tratante y último contacto, y paginación de 12. Tabla en computadora y tarjetas en celular.
- Formulario de alta y edición con React Hook Form + Zod (`features/pacientes/schemas.ts`): teléfono de 10 dígitos, correo opcional, fecha no futura.
- Ficha con datos generales, alergias, tipo de sangre, próximas citas y pestañas de expediente, pagos y seguimiento (se llenan en las etapas 5 a 7).
- El médico solo ve a sus pacientes (lista filtrada y ficha protegida); solo administración y recepción dan de alta o editan.
- Los apellidos de Faker salían compuestos; ahora cada persona tiene dos apellidos simples. Se subió la versión del esquema a 2 para regenerar datos guardados.

---

## Etapa 4: Agenda de citas

**Objetivo:** la agenda inteligente, el corazón operativo del demo.

**Tareas**

- [x] Integrar FullCalendar en español con vistas de día, semana y mes y color por médico.
- [x] Filtro por médico (el médico ve solo su agenda por defecto).
- [x] Crear cita (paciente, médico, servicio, fecha y hora) validando empalmes y horario del médico.
- [x] Mover cita arrastrando y soltando; reprogramar y cancelar.
- [x] Estados de cita: pendiente, confirmada, asistió y no asistió, con colores e iconos.
- [x] Panel lateral con el detalle de la cita y acciones rápidas (confirmar, marcar asistencia, ir al expediente).
- [x] Indicador "recordatorio enviado" (simulado).
- [x] Pruebas de la lógica de empalmes y cambios de estado.

**Criterios de aceptación:** se puede agendar, mover, cancelar y cambiar el estado de citas, y los cambios persisten.

**Notas y desviaciones**

- FullCalendar **v6** (6.1.x): la v7 cambió su API y empaqueta los plugins de otra forma; se fijó la v6, estable y documentada.
- Vistas día, semana y mes en español; en celular abre en vista de día. Cada cita lleva el color del médico, un punto con el color de su estado y una campana si ya se envió el recordatorio.
- Con "Todos los médicos" las citas se acomodan lado a lado (máximo 2 por franja y "+N más") para que la semana sea legible.
- Crear cita desde el botón o seleccionando un horario libre; se valida empalme y horario del médico (también al arrastrar: si no es válido, la cita regresa a su lugar y se avisa).
- Panel lateral con detalle y acciones: confirmar, asistió, no asistió, reprogramar, cancelar o reactivar, enviar recordatorio (simulado), atender consulta e ir al expediente.
- Selector de pacientes con búsqueda (`PacienteSelector`), reutilizable en otros módulos. Desde la ficha del paciente, "Agendar" abre la agenda con el paciente ya elegido.

---

## Etapa 5: Expediente clínico y consulta

**Objetivo:** mostrar el expediente clínico electrónico y el flujo de consulta.

**Tareas**

- [x] Historia clínica: antecedentes heredofamiliares, personales patológicos y no patológicos y alergias.
- [x] Línea de tiempo del paciente: consultas, citas, pagos y seguimientos.
- [x] Flujo de consulta desde una cita: signos vitales y nota SOAP (subjetivo, objetivo, análisis y plan).
- [x] Diagnósticos con buscador del catálogo CIE-10 de ejemplo.
- [x] Receta: lista de medicamentos (nombre, dosis, frecuencia, duración) e indicaciones.
- [x] Generar **receta en PDF** con jsPDF, con marca de agua "DEMO, sin validez".
- [x] Al cerrar la consulta, la cita pasa a "asistió" y se puede crear un plan de seguimiento.
- [x] Bitácora simple de cambios (quién y cuándo) mostrada en el expediente.
- [x] Pruebas del esquema SOAP y de la generación de la receta.

**Criterios de aceptación:** el médico atiende una cita de principio a fin y descarga la receta con marca DEMO.

**Notas y desviaciones**

- Pestaña **Expediente** en la ficha del paciente: historia clínica editable (médico y administración), línea de tiempo con consultas, citas, pagos y planes de seguimiento (las notas SOAP se despliegan) y bitácora de cambios (quién y cuándo).
- Flujo de consulta en `/#/consulta/:citaId` (desde "Atender consulta" en la agenda): signos vitales con rangos validados, nota SOAP, diagnósticos con buscador CIE-10 de ejemplo y receta con medicamentos dinámicos. Muestra las alergias del paciente en rojo.
- Al cerrar la consulta, la cita pasa a "Asistió" y se ofrece descargar la receta y crear un plan de seguimiento.
- PDF con jsPDF (`src/lib/pdf.ts`), cargado bajo demanda; cada página lleva la marca de agua diagonal "DEMO, sin validez". El mismo módulo genera recibos y reportes para las etapas 7 y 8.
- La ficha recuerda la pestaña abierta en la URL (`?tab=expediente`).

---

## Etapa 6: Seguimiento activo y recordatorios

**Objetivo:** el diferenciador de MediCore: que los pacientes lleguen y regresen.

**Tareas**

- [x] Vista de pacientes con control pendiente o vencido (planes de seguimiento).
- [x] Crear, editar y cerrar planes de tratamiento o seguimiento.
- [x] "Enviar recordatorio" simulado por WhatsApp, SMS o correo: vista previa del mensaje y notificación tipo toast.
- [x] Recordatorio masivo simulado para las citas de mañana.
- [x] Campañas simuladas (por ejemplo, "revisión anual") con segmentación básica.
- [x] Bandeja de mensajes enviados (historial simulado).
- [x] Pruebas de la lógica de vencimientos.

**Criterios de aceptación:** se identifican pacientes pendientes y se les "envía" un recordatorio que queda registrado.

**Notas y desviaciones**

- Módulo **Seguimiento** con indicadores (controles vencidos, que vencen esta semana y al corriente) y cuatro pestañas: pacientes por contactar, citas de mañana, campañas y bandeja.
- Planes ordenados por prioridad (los más atrasados primero) con acciones: recordar, agendar, editar y cerrar. El médico solo ve los planes de sus pacientes.
- "Enviar recordatorio" simulado por WhatsApp, SMS o correo, con texto editable, vista previa tipo chat y aviso en pantalla. Todo queda en la bandeja.
- Recordatorio masivo para las citas de mañana (marca cada cita con "Recordatorio enviado").
- Campañas con segmentos: todos, sin visita en 6 meses, crónicos, pediátricos y mujeres; muestra cuántos pacientes las recibirán y personaliza `{nombre}`. Solo administración y recepción las envían.
- Pestaña "Seguimiento" en la ficha del paciente con sus planes y mensajes.
- Las pestañas se acomodan en varias líneas en celular para que la activa siempre se vea.

---

## Etapa 7: Caja y cobros

**Objetivo:** cobro ordenado y trazable.

**Tareas**

- [x] Registrar cobro ligado a una cita o un servicio, con método (efectivo, tarjeta o transferencia).
- [x] Recibo simulado en PDF con folio y marca DEMO.
- [x] Corte de caja diario por método de pago.
- [x] Historial de pagos por paciente (pestaña en la ficha).
- [x] Pruebas de los cálculos del corte.

**Criterios de aceptación:** recepción cobra una consulta, descarga el recibo y el corte del día cuadra.

**Notas y desviaciones**

- Módulo **Caja** por día: indicadores (total, número de cobros, efectivo, tarjeta y transferencia), lista "Por cobrar" (pacientes que asistieron y no han pagado), corte de caja por método y tabla de cobros.
- Registro de cobro ligado a la cita o libre (paciente, servicio, médico, monto con precio de lista y método). Valida que una cita no se cobre dos veces y asigna folio consecutivo (`MC-000123`).
- Al cobrar se descarga el **recibo en PDF** con folio y marca de agua DEMO (aclara que no es CFDI). El corte del día también se descarga en PDF.
- Pestaña "Pagos" en la ficha del paciente con su historial y total.
- Escenario de demo: algunas consultas de hoy quedan "por cobrar" en los datos semilla (esquema v3).
- Los totales se calculan en centavos para que el corte cuadre sin errores de redondeo.

---

## Etapa 8: Tablero y reportes

**Objetivo:** mostrar el valor de negocio con números (apoya el cálculo de ROI en la negociación).

**Tareas**

- [x] Tablero: citas de hoy, ocupación, tasa de inasistencia, ingresos del mes y pacientes nuevos contra recurrentes.
- [x] Gráficas con Recharts: ingresos mensuales, inasistencias por mes y citas por médico.
- [x] Reportes con filtros de fechas: ingresos por médico o servicio y evolución de inasistencias.
- [x] Escenario de demo en los datos semilla: las inasistencias bajan después de activar los recordatorios.
- [x] Tablero según el rol: completo para administración, personal para el médico y operativo para recepción.
- [x] Pruebas de las funciones de métricas.

**Criterios de aceptación:** el tablero cuenta la historia "MediCore reduce inasistencias e incrementa ingresos".

**Notas y desviaciones**

- **Tablero según el rol:**
  - Administración: citas de hoy, ocupación de la semana, inasistencia de los últimos 30 días (contra la tasa antes de los recordatorios) e ingresos del mes; franja con el impacto de los recordatorios; gráficas de ingresos mensuales, inasistencias por mes (con la marca "Recordatorios activados"), citas por médico y pacientes nuevos contra recurrentes.
  - Médico: sus citas de hoy con botón "Atender", consultas del mes, su inasistencia, controles vencidos y sus citas por mes.
  - Recepción: citas de hoy, por confirmar, por cobrar, recordatorios pendientes de mañana y accesos rápidos.
- **Reportes** (administración) con rango de fechas y atajos (este mes, 3 y 6 meses): ingresos por médico y por servicio, evolución de inasistencias y exportación a PDF con marca DEMO.
- Métricas como funciones puras y probadas en `src/lib/metricas.ts`.
- Gráficas con Recharts siguiendo la guía de visualización: una sola serie en turquesa oscuro `#0D9488`; la gráfica de dos series usa `#0D9488` y `#7C6FD6`, pareja validada con el script de la guía (contraste y separación para daltonismo). Cada gráfica tiene tooltip y vista de tabla. Animaciones desactivadas.
- Escenario: las citas de mañana quedan sin recordatorio para poder mostrar el envío masivo (esquema v4).

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
- 2026-11-17: Etapa 1 terminada; se adopta el sistema visual nuevo (turquesa/azul marino, Inter).
