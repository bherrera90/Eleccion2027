# Voto único · Encuesta privada

Aplicación web para una encuesta con un voto por persona mediante códigos de invitación de un solo uso. Cada opción tiene imagen, etiqueta y descripción; la imagen se puede abrir en grande y cerrar para volver a la encuesta. Los resultados se muestran solo después de votar.

## Stack

- Next.js 16 (App Router) + React 19 + TypeScript
- Tailwind CSS 4
- SQLite/libSQL con Drizzle ORM
- Zod, Vitest y ESLint

## Requisitos

- Node.js 22.13 o superior (recomendado; con 22.12 funciona pero npm muestra un aviso de engine)
- npm

## Puesta en marcha

```bash
npm install
cp .env.example .env.local
```

Edita `.env.local`:

```dotenv
DATABASE_URL=file:./data/survey.db
ADMIN_PASSWORD=una-contraseña-larga-y-propia
```

Crea la base de datos, aplica la migración y carga los datos iniciales:

```bash
npm run setup
npm run dev
```

Abre [http://localhost:3000](http://localhost:3000). El panel de administración está en [http://localhost:3000/admin](http://localhost:3000/admin) y usa la contraseña de `ADMIN_PASSWORD`.

> El proyecto incluye un `.env.local` local con `ADMIN_PASSWORD=admin-voto-2026`. Cámbialo antes de compartir la aplicación.

## Cómo funciona

1. La persona introduce un código de invitación en `/`.
2. El servidor valida el código y crea una sesión de votante (cookie `httpOnly`).
3. En `/votar` elige una opción. Puede abrir cada imagen en un diálogo y cerrarlo para seguir.
4. Al confirmar, el voto se guarda en una transacción. La base de datos impone un voto único por código.
5. `/resultados` muestra los resultados actuales y la opción elegida.
6. El panel `/admin` permite ver resultados, generar códigos, descargar el CSV de códigos y abrir o cerrar la encuesta.

El seed crea 100 códigos. Puedes verlos, copiarlos o descargarlos desde el panel.

## Cambiar el contenido

Edita `db/content.ts`:

- `title` y `description` de la encuesta.
- Cada opción con `title`, `tag`, `description` e `imagePath`.
- Mantén entre 4 y 6 opciones si quieres respetar el diseño previsto (la interfaz se adapta a otras cantidades).

Sustituye las imágenes de `public/images/` por las definitivas. Se recomienda una proporción 4:3 y al menos 1200 × 900 px. Después actualiza la base de datos sin borrar los votos existentes:

```bash
npm run db:content
```

Si añades opciones nuevas, `db:content` las inserta. Si eliminas opciones, no se borran automáticamente para no perder votos; el script avisa y puedes eliminarlas manualmente.

## Comandos

| Comando | Qué hace |
| --- | --- |
| `npm run dev` | Servidor de desarrollo |
| `npm run build` | Build de producción |
| `npm start` | Servir el build |
| `npm run lint` | ESLint |
| `npm run typecheck` | TypeScript sin emitir |
| `npm test` | Tests con Vitest |
| `npm run setup` | Migración + seed inicial |
| `npm run db:generate` | Generar una migración tras cambiar el esquema |
| `npm run db:migrate` | Aplicar migraciones |
| `npm run db:seed` | Cargar encuesta, opciones y 100 códigos |
| `npm run db:content` | Actualizar textos/imágenes sin borrar votos |
| `npm run db:reset` | Borrar la base local y volver a crear todo |

## Base de datos

- Esquema: `lib/db/schema.ts`
- Migraciones: `drizzle/`
- Base local: `data/survey.db` (ignorada por git)
- `lib/db/client.ts` acepta `DATABASE_URL` y `DATABASE_AUTH_TOKEN`, así que también puede conectarse a Turso.

## Tests

```bash
npm test
```

Cubren la validación y el consumo de códigos, la creación del voto y la garantía de un solo voto por código.

## Despliegue

Para Vercel, el sistema de archivos no es persistente: no uses `file:./data/survey.db` en producción. Opciones:

1. Crear una base en [Turso](https://turso.tech/).
2. Configurar `DATABASE_URL` y `DATABASE_AUTH_TOKEN` en el entorno de despliegue.
3. Aplicar las migraciones contra Turso. Para ello, cambia temporalmente `drizzle.config.ts` a `dialect: "turso"` y añade `authToken` a `dbCredentials`, o usa la CLI de Turso.
4. Configurar `ADMIN_PASSWORD` con una contraseña fuerte.

También puedes desplegar en un servidor con disco persistente y mantener SQLite local.

## Seguridad y alcance

- El código se consume una sola vez y la unicidad se refuerza con un índice único en la base de datos.
- Las cookies de sesión son `httpOnly`, `sameSite=lax` y `secure` en producción.
- El panel de administración está protegido por contraseña; no hay cuentas de usuario ni recuperación.
- El límite de intentos de código es básico y vive en memoria; para un uso público grande conviene añadir un rate limit compartido (por ejemplo, Redis) y HTTPS.
- No es un sistema de votación certificado: está pensado para encuestas privadas con invitación.
