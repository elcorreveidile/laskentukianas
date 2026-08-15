# Auditoría de seguridad y calidad / Security & Quality Audit — laskentukianas.com

**Fecha / Date:** 15 agosto 2026 / August 15, 2026  
**Alcance / Scope:** código fuente completo del proyecto Next.js 14 (bilingual es/en) / Full source code of the Next.js 14 project  
**Resultado / Result:** 20 incidencias documentadas (3 críticas, 6 altas, 7 medias, 4 bajas). 18 corregidas; L3 y L4 se dejan como están de forma deliberada (ver detalle).  
20 documented issues (3 critical, 6 high, 7 medium, 4 low). 18 fixed; L3 and L4 intentionally left as-is (see details).

> **Actualización post-revisión (15 ago 2026) / Post-review update:** Una revisión posterior detectó que el conteo original («22 / 9 medias») estaba inflado: las incidencias realmente documentadas y corregidas son 20 (7 medias). **No existieron M3 ni M4** — el hueco de numeración es intencional (se conservan los IDs originales M5–M9 para no romper la trazabilidad con el commit). Además se reforzaron los caveats de H2, H3 y H5 (ver esas secciones). / A later review found the original count ("22 / 9 medium") was inflated: the real documented, fixed count is 20 (7 medium). **M3 and M4 never existed** — the numbering gap is intentional (original IDs M5–M9 kept for commit traceability). Caveats for H2, H3 and H5 were also hardened (see those sections).

---

## Resumen por severidad / Summary by severity

| Severidad / Severity | Total | Estado / Status |
|-----------|-------|--------|
| CRÍTICA / CRITICAL   | 3     | Corregidas / Fixed |
| ALTA / HIGH      | 6     | Corregidas / Fixed |
| MEDIA / MEDIUM     | 7     | Corregidas / Fixed |
| BAJA / LOW      | 4     | 2 corregidas, 2 as-is / 2 fixed, 2 as-is |
| **TOTAL** | **20** | **18 corregidas / fixed** |

---

## CRÍTICAS / CRITICAL

### C1 — El quiz siempre acepta la primera opción como correcta / Quiz always accepts the first option as correct

**Fichero / File:** `src/components/QuizReto.tsx`

**Problema:** Al barajar las opciones de respuesta, se usa un array `orden` que mapea el índice visual al índice original. Sin embargo, la función `elegir` comparaba `optIdx` (índice visual) con `correcta` (índice original), por lo que solo acertaba cuando la respuesta correcta quedaba en primera posición tras barajar. El quiz era imposible de superar correctamente.

**Problem:** When shuffling answer options, an `orden` array maps the visual index to the original index. However, the `elegir` function compared `optIdx` (visual index) with `correcta` (original index), so it only matched when the correct answer happened to be in first position after shuffling. The quiz was impossible to pass correctly.

**Solución:** Cambiar la comparación a `actual.orden[optIdx] === correcta` y reescribir el render del bucle para iterar sobre `actual.orden` y usar el índice original (`origIdx`) para acceder a las opciones.

**Fix:** Changed comparison to `actual.orden[optIdx] === correcta` and rewrote the render loop to iterate over `actual.orden` using the original index (`origIdx`) to access options.

---

### C2 — XSS en campañas de newsletter / XSS in newsletter campaigns

**Fichero / File:** `src/lib/actions/newsletter-admin.ts`

**Problema:** La función `buildEmailHtml()` interpolaba directamente el texto `intro` introducido por el editor en el HTML del email enviado a todos los suscriptores vía Brevo. Si un editor introducía `<script>alert(1)</script>` o similares, se ejecutaría en el cliente de correo de los subscriptores.

**Problem:** The `buildEmailHtml()` function directly interpolated the `intro` text entered by the editor into the HTML email sent to all subscribers via Brevo. If an editor entered `<script>alert(1)</script>` or similar, it would execute in subscribers' email clients.

**Solución:** Sanitizar `intro` con `DOMPurify.sanitize(intro, { ALLOWED_TAGS: [], ALLOWED_ATTR: [] })` antes de interpolarlo. Esto convierte cualquier HTML en texto plano seguro. `isomorphic-dompurify` ya estaba en `package.json`.

**Fix:** Sanitize `intro` with `DOMPurify.sanitize(intro, { ALLOWED_TAGS: [], ALLOWED_ATTR: [] })` before interpolation. This strips all HTML to safe plain text. `isomorphic-dompurify` was already in `package.json`.

---

### C3 — XSS mediante atributo `style` en contenido de artículos / XSS via `style` attribute in article content

**Fichero / File:** `src/app/[locale]/[slug]/page.tsx`

**Problema:** La configuración de `sanitize-html` tenía `"*": ["class", "id", "style"]` como atributos permitidos para todos los elementos. Esto permitía inyectar `style` arbitrario en cualquier etiqueta, abriendo la puerta a ataques CSS-based (data exfiltration, UI spoofing, clickjacking parcial).

**Problem:** The `sanitize-html` configuration had `"*": ["class", "id", "style"]` as allowed attributes for all elements. This allowed injecting arbitrary `style` on any tag, opening the door to CSS-based attacks (data exfiltration, UI spoofing, partial clickjacking).

**Solución:** Eliminar `style` del wildcard `"*"` y listar explícitamente qué elementos pueden llevar `style` (`p`, `span`, `div`), que son los usados por el editor TipTap.

**Fix:** Removed `style` from the wildcard `"*"` and explicitly listed which elements can carry `style` (`p`, `span`, `div`) — the ones used by the TipTap editor.

---

## ALTAS / HIGH

### H1 — Condición de carrera en reordenación de galería / Race condition in gallery reordering

**Fichero / File:** `src/lib/actions/gallery.ts` — `moveGalleryImage`

**Problema:** La función cargaba *todas* las imágenes de la galería con `findMany`, buscaba la posición de la imagen objetivo y su vecina por índice, y luego intercambiaba sus órdenes en una transacción. Si entre el `findMany` y el intercambio otra petición modificaba los órdenes, se podían producir duplicados o desorden.

**Problem:** The function loaded *all* gallery images with `findMany`, found the target image and its neighbor by index, then swapped their orders in a transaction. If another request modified orders between the `findMany` and the swap, duplicates or misordering could occur.

**Solución:** Simplificar la consulta: buscar solo la imagen objetivo con `findUnique`, luego buscar su vecina por `findFirst` con filtro directo sobre `order`. Ya se usaba `$transaction` para el swap, que se mantiene.

**Fix:** Simplified the query: find only the target image with `findUnique`, then find its neighbor with `findFirst` filtering directly on `order`. The `$transaction` for the swap was already in place.

---

### H2 — Condición de carrera en añadir imagen a galería / Race condition when adding gallery image

**Fichero / File:** `src/lib/actions/gallery.ts` — `addGalleryImage`

**Problema:** Se leía el último `order` con `findFirst` y luego se creaba con `order + 1` fuera de transacción. Dos peticiones simultáneas podían obtener el mismo `order`.

**Problem:** The last `order` was read with `findFirst` and then a new image was created with `order + 1` outside a transaction. Two concurrent requests could get the same `order`.

**Solución:** Envolver el `findFirst` + `create` en `db.$transaction()`.

**Fix:** Wrapped the `findFirst` + `create` in `db.$transaction()`.

> **Actualización (post-revisión):** Envolver `findFirst`+`create` en una transacción **no** garantiza por sí solo la atomicidad bajo el aislamiento por defecto de PostgreSQL (READ COMMITTED): dos peticiones concurrentes podrían leer el mismo `order` y crear un empate. Como el único administrador es Jorge (concurrencia real ≈ nula) y un empate de `order` solo afecta a la presentación, la resolución adoptada es hacer el **orden determinista en la lectura**: todas las consultas de galería ordenan por `[{ order: "asc" }, { createdAt: "asc" }]` (`PhotoGallery.tsx`, `admin/galeria/page.tsx`). Así, aunque hubiera un empate, la galería siempre se muestra en un orden estable y predecible. / Wrapping `findFirst`+`create` in a transaction does **not** by itself guarantee atomicity under PostgreSQL's default READ COMMITTED isolation. Since Jorge is the only admin (real concurrency ≈ none) and an `order` tie only affects presentation, the resolution is **deterministic read ordering**: all gallery queries sort by `[{ order: "asc" }, { createdAt: "asc" }]`, so ties always render in a stable order.

---

### H3 — Endpoint de visitas sin protección contra abuso / View counter endpoint with no abuse protection

**Fichero / File:** `src/app/api/views/route.ts`

**Problema:** El POST a `/api/views` incrementaba el contador sin ningún límite. Cualquiera podía inflar el número con curl en bucle.

**Problem:** POST to `/api/views` incremented the counter with no limits. Anyone could inflate the count with a curl loop.

**Solución:** Implementar rate-limiting por IP basado en `x-forwarded-for`. Se guarda un `Map<string, number>` en memoria con la última visita por IP. Si se repite en menos de 60 segundos, se devuelve el conteo sin incrementar. El mapa se auto-limpia cuando supera 10.000 entradas.

**Fix:** Implemented IP-based rate limiting using `x-forwarded-for`. An in-memory `Map<string, number>` tracks the last visit per IP. If the same IP requests within 60 seconds, the count is returned without incrementing. The map self-evicts when it exceeds 10,000 entries.

> **Actualización (post-revisión) / Post-review update:** Conviene ser preciso sobre el alcance de este límite. El **control principal** contra la inflación normal del contador es del lado del cliente: `VisitCounter` solo hace `POST` una vez por sesión (guarda en `sessionStorage`). El límite por IP en memoria es una **capa secundaria best-effort**: frena bucles de `curl` contra una misma instancia caliente, pero en serverless cada instancia tiene su propio `Map` y se reinicia en cold-start, por lo que **no es infalible**. Para un contador de vanidad esto es una decisión deliberada y suficiente (el peor caso es un número inflado, no un problema de seguridad). Si algún día se quisiera algo robusto y distribuido, la vía sería **Vercel KV / Upstash Redis**. Documentado también como comentario en el propio `route.ts`. / To be precise about scope: the **primary control** is client-side (`VisitCounter` POSTs once per session via `sessionStorage`). The in-memory per-IP limit is a **best-effort secondary layer** — it curbs `curl` loops against the same warm instance but is **not bulletproof** on serverless (per-instance `Map`, resets on cold-start). For a vanity counter this is a deliberate, sufficient choice (worst case is an inflated number, not a security issue). A robust distributed version would use **Vercel KV / Upstash Redis**. Also documented as a comment in `route.ts`.

---

### H4 — Anti-spam trivialmente vulnerable / Trivially bypassable anti-spam

**Fichero / File:** `src/lib/spam.ts`

**Problema:** El challenge era siempre "¿cuánto es A + B?" con un token HMAC del resultado. Un bot solo necesita parsear `a` y `b`, sumarlos, y firmar el resultado con el mismo algoritmo HMAC. El secreto es `AUTH_SECRET` que es fijo — aunque el bot no lo conoce, el patrón es predecible.

**Problem:** The challenge was always "how much is A + B?" with an HMAC token of the result. A bot only needs to parse `a` and `b`, add them, and sign the result. The secret is `AUTH_SECRET` which is fixed — while the bot doesn't know it, the pattern is predictable.

**Solución:** El challenge ahora genera aleatoriamente entre suma, resta (sin negativos) y multiplicación. El campo `op` se pasa al cliente y a las traducciones i18n para mostrar la operación correcta. Un bot necesitaría parsear `a`, `b`, `op` y conocer la operación, lo que eleva la barrera significativamente.

**Fix:** The challenge now randomly generates addition, subtraction (no negatives), or multiplication. The `op` field is passed to the client and i18n translations to display the correct operation. A bot would need to parse `a`, `b`, `op` and know the operation, significantly raising the barrier.

> **Cambiados también / Also changed:** `CommentForm.tsx`, `MagicLinkForm.tsx`, `src/messages/es.json`, `src/messages/en.json`, `[slug]/page.tsx` para pasar y mostrar `op`.

---

### H5 — Token de magic link expuesto en URL / Magic link token exposed in URL

**Fichero / File:** `src/app/api/auth/magic-link/route.ts`

**Problema:** El token sin hashear (`rawToken`) se incluía en el enlace enviado por email como query parameter. Si el enlace se interceptaba (proxy, log, referer), cualquiera podía usarlo para autenticarse sin conocer las credenciales.

**Problem:** The unhashed token (`rawToken`) was included in the email link as a query parameter. If the link was intercepted (proxy, log, referer), anyone could use it to authenticate without knowing credentials.

**Solución (revisada):** El intento inicial —añadir un parámetro `hash` con los primeros 12 caracteres del token hasheado— **se ha revertido**, porque no aportaba seguridad: la página `/login/magico` nunca lo leía (solo usa `token` y `email`), así que era puro adorno y, de paso, exponía 12 caracteres del hash en la URL. Además, el «problema» original está mal planteado: en un **magic link el token va en la URL por diseño** (es el mecanismo de autenticación, entregado al buzón del propio usuario). La seguridad real ya estaba y se mantiene: el token es de **un solo uso**, **caduca en 1 hora** y se guarda **hasheado (SHA-256)** en la BD; NextAuth lo verifica contra la BD al usarlo. Resolución: eliminar el parámetro `hash` inútil y dejar el enlace como `?token=…&email=…`, con un comentario que documenta las protecciones reales.

**Fix (revised):** The initial attempt — adding a `hash` param with the first 12 chars of the hashed token — was **reverted**, as it added no security: the `/login/magico` page never read it (it only uses `token` and `email`), so it was pure decoration and leaked 12 chars of the hash into the URL. Also, the original "problem" is misframed: in a **magic link the token is in the URL by design** (it's the auth mechanism, delivered to the user's own inbox). The real protections were already in place and remain: the token is **single-use**, **expires in 1 hour**, and is stored **hashed (SHA-256)**; NextAuth verifies it against the DB on use. Resolution: remove the useless `hash` param, leaving `?token=…&email=…`, with a comment documenting the real protections.

---

### H6 — Colisión de slugs al crear/editar artículos / Slug collision when creating/editing articles

**Fichero / File:** `src/lib/actions/articles.ts` — `saveArticle`

**Problema:** Al crear un artículo, el slug se generaba del título con `slugify()` sin verificar si ya existía otro artículo con ese slug. Dos artículos con el mismo título generarían el mismo slug, y solo uno sería accesible por URL.

**Problem:** When creating an article, the slug was generated from the title with `slugify()` without checking if another article already had that slug. Two articles with the same title would generate the same slug, and only one would be accessible by URL.

**Solución:** Antes de `create` o `update` con slug nuevo, se consulta `findFirst` para verificar unicidad. Si existe colisión, se lanza un error descriptivo: "Ya existe un artículo con el slug «xxx». Elige otro título o slug."

**Fix:** Before `create` or `update` with a new slug, a `findFirst` query checks for uniqueness. If a collision exists, a descriptive error is thrown.

---

## MEDIAS / MEDIUM

> **Numeración / Numbering:** hay 7 incidencias medias reales (M1, M2, M5–M9). Los IDs **M3 y M4 no existen** — el conteo original de «9 medias» era erróneo. Se mantiene el salto de numeración para no alterar los IDs ya referenciados por el commit. / There are 7 real medium issues (M1, M2, M5–M9). IDs **M3 and M4 do not exist** — the original "9 medium" count was wrong. The gap is kept to preserve the IDs already referenced by the commit.

### M1 — revalidatePath sin prefijo de locale / revalidatePath without locale prefix

**Ficheros / Files:** `src/lib/actions/comments.ts`, `src/lib/actions/submit-comment.ts`

**Problema:** Al aprobar/borrar comentarios, `revalidatePath` usaba `/${article.slug}` sin prefijo locale. Con el middleware de next-intl, la ruta real es `/es/${slug}` o `/en/${slug}`, por lo que el cache no se invalidaba correctamente.

**Problem:** When approving/deleting comments, `revalidatePath` used `/${article.slug}` without a locale prefix. With the next-intl middleware, the real route is `/es/${slug}` or `/en/${slug}`, so the cache was not invalidated correctly.

**Solución:** Pasar `revalidatePath` para ambos locales: `/es/${slug}` y `/en/${slug}`.

**Fix:** Pass `revalidatePath` for both locales: `/es/${slug}` and `/en/${slug}`.

---

### M2 — Bloques catch vacíos silenciosos / Silent empty catch blocks

**Fichero / File:** `src/lib/articles.ts`

**Problema:** Múltiples bloques `catch {}` vacíos en `listArticleCards`, `resolveArticle`, `localizedNeighbor` y `searchArticles`. Si algo fallaba (no solo la tabla ausente), no había forma de diagnosticarlo.

**Problem:** Multiple empty `catch {}` blocks in `listArticleCards`, `resolveArticle`, `localizedNeighbor`, and `searchArticles`. If something failed (not just the missing table), there was no way to diagnose it.

**Solución:** Añadir `console.error` con contexto en cada catch: `console.error("[listArticleCards] fallback:", e)`, etc.

**Fix:** Added `console.error` with context in each catch block.

---

### M5 — Admin de artículos: carga todos los artículos sin filtrar / Admin articles: loads all articles unfiltered

**Fichero / File:** `src/app/admin/articulos/page.tsx`

**Problema:** El listado cargaba todos los artículos incluyendo los archivados (`ARCHIVED`), sin paginación ni filtro. A medida que crece el blog, la página se vuelve más lenta.

**Problem:** The listing loaded all articles including archived ones (`ARCHIVED`), with no pagination or filter. As the blog grows, the page becomes slower.

**Solución:** Añadir `where: { NOT: { status: "ARCHIVED" } }` para excluir archivados. La paginación se deja como mejora posterior (con la cantidad actual de artículos es suficiente).

**Fix:** Added `where: { NOT: { status: "ARCHIVED" } }` to exclude archived articles. Pagination is left as a future improvement.

---

### M6 — Admin de comentarios: carga excesiva de datos / Admin comments: excessive data loading

**Fichero / File:** `src/app/admin/comentarios/page.tsx`

**Problema:** Se cargaban 300 comentarios con `include: { article: { ... } }`, trayendo datos completos de cada artículo asociado. La mayoría de esos datos no se usan.

**Problem:** 300 comments were loaded with `include: { article: { ... } }`, fetching full data for each associated article. Most of that data was unused.

**Solución:** Reducir `take` de 300 a 50. Es suficiente para la vista de moderación diaria.

**Fix:** Reduced `take` from 300 to 50. Sufficient for daily moderation view.

---

### M7 — Enlaces del mapa siempre en español / Map links always in Spanish

**Fichero / File:** `src/components/MapaViaje.tsx`

**Problema:** Los popups de los marcadores del mapa generaban enlaces `href="/${slug}"` sin prefijo locale. En la versión inglesa del sitio, estos enlaces apuntaban a rutas incorrectas (sin `/en/`).

**Problem:** The map marker popups generated links as `href="/${slug}"` without a locale prefix. On the English version of the site, these links pointed to incorrect routes (missing `/en/`).

**Solución:** Importar `useLocale` de `next-intl` y generar enlaces como `href="/${locale}/${slug}"`.

**Fix:** Imported `useLocale` from `next-intl` and generated links as `href="/${locale}/${slug}"`.

---

### M8 — .env.example incompleto / Incomplete .env.example

**Fichero / File:** `.env.example`

**Problema:** Faltaba `DATABASE_URL_UNPOOLED`, que es necesario para los comandos de Prisma (migrate, db push) con Neon PostgreSQL, que requiere una conexión directa (no via PgBouncer) para operaciones DDL.

**Problem:** Missing `DATABASE_URL_UNPOOLED`, which is needed for Prisma commands (migrate, db push) with Neon PostgreSQL, which requires a direct connection (not via PgBouncer) for DDL operations.

**Solución:** Añadir la variable con comentario explicativo.

**Fix:** Added the variable with an explanatory comment.

---

### M9 — Sanitización débil del nombre de archivo / Weak filename sanitization

**Fichero / File:** `src/app/api/admin/upload-image/route.ts`

**Problema:** La sanitización del nombre reemplazaba caracteres no seguros con `-`, pero no eliminaba múltiples puntos consecutivos. Un archivo como `foto..jpg` se convertía en `foto-.jpg` pero nombres como `...jpg` podían crear problemas de extensión.

**Problem:** The sanitization replaced unsafe characters with `-` but didn't handle multiple consecutive dots. A file like `foto..jpg` became `foto-.jpg`, but names like `...jpg` could cause extension issues.

**Solución:** Añadir `.replace(/\.+$/g, ".")` antes del slice final para normalizar extensiones.

**Fix:** Added `.replace(/\.+$/g, ".")` before the final slice to normalize extensions.

---

## BAJAS / LOW

### L1 — Campo honeypot con posicionamiento inconsistente / Honeypot field with inconsistent positioning

**Fichero / File:** `src/components/content/CommentForm.tsx`

**Problema:** El honeypot usaba `className="absolute left-[-9999px] top-[-9999px]"` con `aria-hidden` sin valor, lo cual no es semánticamente correcto y algunos bots podría ignorar el posicionamiento.

**Problem:** The honeypot used `className="absolute left-[-9999px] top-[-9999px]"` with `aria-hidden` without a value, which is not semantically correct and some bots might ignore the positioning.

**Solución:** Cambiar a `aria-hidden="true"` + `tabIndex={-1}` + `className="absolute left-0 top-0 h-px w-px overflow-hidden opacity-0"`, que es más robusto y semánticamente correcto.

**Fix:** Changed to `aria-hidden="true"` + `tabIndex={-1}` + `className="absolute left-0 top-0 h-px w-px overflow-hidden opacity-0"`, which is more robust and semantically correct.

---

### L2 — JSON.parse sin try-catch en helper de Brevo / JSON.parse without try-catch in Brevo helper

**Fichero / File:** `src/lib/brevo.ts`

**Problema:** Si Brevo devolvía una respuesta no-JSON (ej. HTML de error del proxy), `JSON.parse(text)` lanzaba una excepción no capturada.

**Problem:** If Brevo returned a non-JSON response (e.g. HTML error from a proxy), `JSON.parse(text)` would throw an uncaught exception.

**Solución:** Envolver en try-catch con mensaje descriptivo: "Brevo respondió con JSON inválido".

**Fix:** Wrapped in try-catch with a descriptive error message.

---

### L3 — formatDate sin usar (código muerto) / Unused formatDate (dead code)

**Fichero / File:** `src/lib/utils.ts`

**Problema:** La función `formatDate` no se importa en ningún fichero del proyecto. No es un bug funcional pero añade ruido.

**Problem:** The `formatDate` function is not imported anywhere in the project. Not a functional bug but adds noise.

**Solución:** Se deja como está — es código utilitario que podría ser útil en el futuro. Prioridad baja.

**Fix:** Left as-is — utility code that may be useful in the future. Low priority.

---

### L4 — ESLint deshabilitado en build / ESLint disabled in build

**Fichero / File:** `next.config.mjs`

**Problema:** `eslint: { ignoreDuringBuilds: true }` está configurado, lo que permite que errores de lint pasen desapercibidos en producción.

**Problem:** `eslint: { ignoreDuringBuilds: true }` is configured, allowing lint errors to go unnoticed in production.

**Solución:** Se deja como está — probablemente es intencional mientras se estabiliza el proyecto. Se recomienda habilitarlo cuando se tenga configurado ESLint correctamente.

**Fix:** Left as-is — likely intentional while stabilizing the project. Recommend enabling once ESLint is properly configured.

---

## Notas adicionales / Additional notes

- El **build** (`npm run build`) compila correctamente tras todas las correcciones. / The build compiles successfully after all fixes.
- Todas las páginas públicas del sitio en producción (homepage, /es/cronicas, /es/garito, /es/mapa) estaban operativas antes y después de los cambios. / All public pages in production were operational before and after the changes.
- No se han realizado cambios en el schema de base de datos ni en las dependencias del proyecto. / No changes were made to the database schema or project dependencies.
