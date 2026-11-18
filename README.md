# MediCore

> ⚠️ **Prototipo demostrativo.** Todos los datos (pacientes, médicos, citas, expedientes y pagos) son **ficticios**. No se procesa ni almacena información médica real.

**MediCore** es una plataforma SaaS para la gestión integral de clínicas privadas: agenda de citas, expediente clínico electrónico, consultas, seguimiento activo de pacientes, caja y reportes. Es un proyecto de **Yocoyasoft**.

- 🌐 Demo: https://juandiazpro.github.io/MediCore/
- 📄 Documentación: [`docs/`](docs/)
- 🗺️ Plan de construcción: [`docs/ETAPAS.md`](docs/ETAPAS.md)

## Cómo correrlo

Requiere Node.js 22 o superior.

```bash
npm install          # instalar dependencias
npm run dev          # servidor local (http://localhost:5173/MediCore/)
npm run lint         # ESLint
npm run format       # Prettier
npm run test         # Vitest (modo watch); una sola vez: npm run test -- --run
npm run build        # build de producción en dist/
npm run preview      # previsualizar el build
```

Cada push a `main` corre lint, formato, pruebas y build en GitHub Actions y publica el demo en GitHub Pages.

## Stack

TypeScript · React · Vite · Tailwind CSS · shadcn/ui · Lucide · React Router (HashRouter) · Vitest + Testing Library · ESLint + Prettier · GitHub Actions → GitHub Pages.

## Equipo

- Chávez Martínez Adrián Uxue
- Márquez Bailón Elías Manuel
- Díaz Barroso Juan José
- Martínez Vázquez Leonardo
