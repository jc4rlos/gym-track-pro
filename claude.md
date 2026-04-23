# CLAUDE.md - Contexto del Proyecto

## Descripción General
Aplicación frontend construida con React, Vite y TypeScript, utilizando Supabase para autenticación y base de datos (PostgreSQL).

## Tech Stack
- **Frontend:** React 18+, Vite, TypeScript, TailwindCSS (opcional).
- **Backend/Database:** Supabase (@supabase/supabase-js).
- **State Management:** React Context o Supabase Realtime.

## Estructura de Directorios (src)
- `/components`: Componentes reutilizables UI.
- `/pages`: Vistas de la aplicación.
- `/lib`: Configuración de Supabase (`supabaseClient.ts`).
- `/types`: Definiciones de TypeScript (`database.types.ts`).
- `/hooks`: Custom hooks (ej. `useAuth.ts`).

## Reglas de Codificación y Estilo
- **TS Strict Mode:** Usar TypeScript estricto. Evitar `any`.
- **Componentes:** Usar componentes funcionales y arrow functions.
- **Hooks:** Usar custom hooks para lógica de Supabase.
- **Supabase:** Siempre usar la variable `VITE_SUPABASE_URL` y `VITE_SUPABASE_PUBLISHABLE_KEY` desde `.env.local`.

## Comandos Principales
- `npm run dev`: Iniciar entorno de desarrollo.
- `npm run build`: Compilar proyecto.
- `npm run lint`: Revisar linting.

## Gestión de Supabase (CRUD)
- Los componentes NO deben hacer consultas directas. Usar funciones en `/lib/supabaseClient.ts` o hooks especializados.
- Al crear tablas, asegurar la política Row Level Security (RLS) en Supabase.
- Usar la autenticación de Supabase (`supabase.auth`) para rutas protegidas.


