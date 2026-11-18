# Guion de demo: MediCore (5 a 7 minutos)

Guion para presentar el prototipo en la negociación. Demo en línea: https://juandiazpro.github.io/MediCore/

## Antes de empezar (1 minuto antes)

- Abre el demo en Chrome o Edge, de preferencia en **ventana nueva** para que los datos sean los de ejemplo.
- Si ya lo usaste antes, entra con cualquier rol y presiona **Reiniciar demo** (arriba a la derecha).
- Ten abierta una segunda pestaña en el celular o tableta para mostrar que es responsivo.
- Recuerda: **todo es ficticio**. La franja azul de arriba lo dice en todas las pantallas.

## 1. El problema (30 s) · Pantalla de bienvenida

> "Las clínicas privadas pierden dinero por pacientes que no llegan a su cita y que no regresan a su control. Además llevan agenda, expediente y caja en herramientas separadas."

- Muestra la bienvenida y la tabla de ejemplo con los estados de cita (confirmada, pendiente, asistió, no asistió).
- Clic en **Entrar al demo**.

## 2. Un sistema, tres roles (30 s) · Inicio de sesión

> "Cada persona de la clínica ve solo lo que necesita."

- Señala los tres accesos rápidos: Administración, Médico y Recepción.
- Entra como **Recepción**.

## 3. Recepción: la operación del día (1 min 30 s)

1. **Tablero de recepción**: citas de hoy, por confirmar, por cobrar y recordatorios de mañana.
2. **Agenda**: muestra la vista de semana con el color de cada médico. Arrastra una cita a otro horario.
   - Intenta moverla fuera del horario del médico o encima de otra cita: el sistema **no lo permite** y la regresa.
3. Clic en una cita → panel lateral → **Confirmar** y **Enviar recordatorio** (aparece el aviso de WhatsApp simulado).
4. **Seguimiento → Citas de mañana → Recordar a todos**.
   > "Esto es lo que hoy hacen a mano por teléfono, una llamada a la vez."

## 4. Médico: la consulta completa (1 min 30 s)

- Cierra sesión (ícono de salida) y entra como **Médico**.

1. En su tablero, sección **Por atender hoy**, clic en **Atender**.
2. Llena rápido: temperatura, nota SOAP (una línea en cada campo), busca **"faringitis"** en CIE-10 y agrega un medicamento.
3. **Cerrar consulta** → la cita pasa a "Asistió".
4. **Descargar receta PDF**: muestra la marca de agua "DEMO, sin validez".
5. **Crear plan de seguimiento** para dentro de un mes.
   > "El médico no solo atiende: deja programado el regreso del paciente."
6. Abre **Ver expediente**: línea de tiempo con consultas, pagos y planes, y la bitácora de quién hizo cada cambio.

## 5. Recepción cobra (45 s)

- Entra como **Recepción** → **Caja**.

1. En **Por cobrar** aparece el paciente que acaba de atender el médico → **Cobrar**.
2. Elige **Tarjeta** → **Cobrar y descargar recibo** (PDF con folio y marca DEMO).
3. Muestra el **corte de caja** por método de pago.

## 6. Administración: el valor de negocio (1 min 30 s)

- Entra como **Administración**.

1. **Tablero**: señala la franja azul.
   > "Desde que la clínica activó los recordatorios, la inasistencia bajó de alrededor de 22 % a 9 %."
2. Gráfica **Inasistencias por mes** con la marca "Recordatorios activados": la caída es visible.
3. **Ingresos mensuales** y **Pacientes nuevos y recurrentes**.
4. **Reportes**: ingresos por médico y por servicio; exporta el PDF.
   > "Con estos números se calcula el retorno de inversión de cada clínica: cuántas citas recupera al mes y cuánto vale eso."

## 7. Cierre (30 s)

> "Es un prototipo 100 % simulado y gratuito, publicado en GitHub Pages. La arquitectura ya separa las pantallas de los datos: para el producto real solo se conecta el servidor, sin rehacer la interfaz."

- Muestra el demo en el celular o la tableta.
- Abre **Acerca de**: aviso de demo y enlace al repositorio.

## Preguntas frecuentes

| Pregunta                       | Respuesta corta                                                                                          |
| ------------------------------ | -------------------------------------------------------------------------------------------------------- |
| ¿Los datos son reales?         | No. Son ficticios, generados con una semilla fija; nada sale del navegador.                              |
| ¿Se envían WhatsApp de verdad? | No, el envío es simulado. El producto real usaría la API de WhatsApp Business.                           |
| ¿Cumple la NOM-004/NOM-024?    | El prototipo solo imita la estructura del expediente; el cumplimiento formal es parte del producto real. |
| ¿Factura CFDI?                 | No en el prototipo; el recibo lo aclara. El producto real se integraría con un PAC.                      |
| ¿Qué pasa si recargo?          | Los cambios se guardan en el navegador. "Reiniciar demo" regresa a los datos de ejemplo.                 |

## Si algo sale mal

- Pantalla rara o datos inconsistentes: **Reiniciar demo**.
- Sin internet: corre `npm run dev` en la computadora y presenta desde `http://localhost:5173/MediCore/`.
