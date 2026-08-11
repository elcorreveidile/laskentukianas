# Crónicas Kentukianas

Blog editorial de *Crónicas Kentukianas*: «De Menorca a Kentucky, las crónicas de Jorge, un profe de español lanzado a la aventura (y a la batería)». Migrado desde WordPress a un stack propio en **Next.js 14 (App Router)** con base de datos PostgreSQL.

## Stack

- **Framework:** Next.js 14 (App Router, Server Actions, RSC) + TypeScript
- **Estilos:** Tailwind CSS (fuentes Anton, Inter, Crimson Text y Caveat vía `next/font`)
- **Base de datos:** PostgreSQL (Neon) con Prisma ORM
- **Auth:** NextAuth v5 (Auth.js) — credenciales, Google OAuth y enlace mágico
- **Imágenes:** Vercel Blob
- **Email:** Brevo (newsletter y correos transaccionales)
- **Editor:** TipTap (rich text) con saneado de HTML vía `sanitize-html`
- **Despliegue:** Vercel

## Funcionalidades

- **Contenido editorial** organizado en series (`CRONICAS`, `KENTUKIANA`, `PAGINA`) con artículos, autores, categorías, etiquetas, media y comentarios.
- **Panel de administración** (`/admin`) para crear/editar artículos, moderar comentarios y gestionar la newsletter.
- **Newsletter** integrada con Brevo, con importación de contactos y envío de anuncios.
- **Comentarios** con filtrado de spam.
- **Autenticación** por contraseña, Google o enlace mágico de un solo uso; roles `USER`, `EDITOR`, `ADMIN`.
- **Secciones especiales:** mapa del viaje, quiz/reto, easter egg de batería, overlay de intro.
- SEO integrado (`sitemap.ts`, `robots.ts`, Open Graph, metadatos).

## Estructura

```
src/
  app/            Rutas (App Router): páginas públicas, /admin, /api
  components/     UI: layout, admin, content, auth y componentes especiales
  lib/            Lógica: auth, db, brevo, spam, server actions
prisma/           schema.prisma + seed
scripts/          Importación desde WordPress, gestión de Brevo, utilidades
wp-export/        Export original de WordPress
```

## Puesta en marcha

Requisitos: Node.js 20+, una base de datos PostgreSQL y las credenciales de servicios externos.

```bash
npm install
cp .env.example .env   # y rellena las variables
npm run db:push        # aplica el esquema a la base de datos
npm run dev            # http://localhost:3000
```

### Variables de entorno

Ver [`.env.example`](.env.example) para el listado completo. En resumen:

| Variable | Descripción |
| --- | --- |
| `DATABASE_URL` | Cadena de conexión de Postgres (Neon) |
| `AUTH_SECRET` / `NEXTAUTH_SECRET` | Secreto de NextAuth (`openssl rand -base64 32`) |
| `NEXTAUTH_URL` / `NEXT_PUBLIC_APP_URL` | URL de la app |
| `BLOB_READ_WRITE_TOKEN` | Token de Vercel Blob para subir imágenes |
| `BREVO_API_KEY`, `BREVO_LIST_ID`, `BREVO_SENDER_*` | Newsletter y emails transaccionales |
| `GOOGLE_CLIENT_ID` / `GOOGLE_CLIENT_SECRET` | Login con Google (opcional) |

## Scripts

| Comando | Acción |
| --- | --- |
| `npm run dev` | Servidor de desarrollo |
| `npm run build` | `prisma generate` + build de Next.js |
| `npm run start` | Servidor de producción |
| `npm run db:push` | Sincroniza el esquema con la base de datos |
| `npm run db:studio` | Prisma Studio |
| `npm run db:seed` | Datos de ejemplo |
| `npm run wp:import` | Importa contenido desde el export de WordPress |

En [`scripts/`](scripts) hay utilidades adicionales: descarga de media de WordPress, moderación de spam, limpieza de comentarios y contactos, e importación/gestión de contactos en Brevo.
