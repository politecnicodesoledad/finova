# FINOVA · Finanzas Inteligentes para Colegios

Plataforma educativa gamificada (React + TypeScript + Tailwind, TanStack Start) migrada desde el prototipo HTML, con el mismo diseño, textos, sonidos, animaciones y juegos.

## Estructura

```
src/
  components/
    brand/        Logo oficial (hexágono y logo completo), cerdito, avatares, manito, íconos del menú
    login/        Pantalla de ingreso (estudiante / docente / registro con código)
    student/      Panel mensual, Villa FINOVA, pendientes, podio, Caza-Monedas, Mercadito,
                  minicursos (Une las Parejas, Detective de Gastos, Los 3 Frascos), premios, control del dinero
    teacher/      Panel docente: cursos, meses, estudiantes, preguntas, podio y premios
    ui-finova/    Notificaciones y ventana emergente
  games/arcade    Motor del Caza-Monedas (Canvas)
  games/market    Motor de El Mercadito de la Alcancía
  services/       sound (Web Audio), rules (reglas de negocio), storage (localStorage), finovaRemote (RPC Supabase)
  store/          Estado global (zustand) y acciones
  data/           Meses, preguntas, minicursos, dificultades y datos demo
  lib/supabase.ts Cliente Supabase con modo demo automático
database/finova_schema.sql   Tablas, RLS, funciones seguras y datos demo para Supabase
```

## Modo demo

Sin variables de entorno, todo funciona de inmediato guardando los datos en el navegador.
El botón “Restaurar datos iniciales de demostración” (pantalla de ingreso) reinicia todo.

## Pruebas

```
bunx vitest run
```

## Conectar Supabase (pasos manuales)

1. Crea un proyecto en supabase.com.
2. Abre **SQL Editor**, pega el contenido de `database/finova_schema.sql` y ejecútalo.
3. En **Authentication → Providers** deja activo **Email**.
4. Copia **Project URL** y **anon public key** (Settings → API).
5. Configura `VITE_SUPABASE_URL` y `VITE_SUPABASE_ANON_KEY` (ver `.env.example`).

## Desplegar en Vercel

1. Importa el repositorio de GitHub en Vercel.
2. Agrega las dos variables de entorno anteriores.
3. Despliega. Nota: la compilación está configurada por defecto para el hosting de Lovable (Cloudflare); para Vercel puede ser necesario cambiar el destino de compilación de Nitro a `vercel`. No se ha probado aún un despliegue en Vercel.
