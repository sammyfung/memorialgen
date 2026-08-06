# Memorial Board

A memorial wall web application built with Nuxt 3. Visitors can leave messages, upload photos, add custom fields, and optionally protect their messages with a password for future editing.

Supports full static export to GitHub Pages with a custom domain (CNAME), and multilingual display in English and Traditional Chinese (繁體中文).

---

## Features

- **Leave a message** — name, message body, optional photos, optional custom fields
- **Password protection** — set an optional password at submission time to edit or delete your own message later
- **Highlight / Featured** — admin can pin messages to a "Featured" section at the top of the wall
- **Active / Hidden** — admin can hide messages without deleting them (soft delete)
- **Multiple image uploads** — drag-and-drop or file picker; images stored locally under `public/uploads/`
- **Custom JSON fields** — define your own key-value fields (e.g. "Relationship: Friend", "Location: Hong Kong")
- **Multilingual** — English (default) and 繁體中文; auto-detected from browser, switchable in the header
- **Admin dashboard** — `/admin` panel with toggle controls for highlight and active status
- **Static GitHub Pages export** — `npm run generate` produces a fully static snapshot; form submissions go to a separately hosted API server

---

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | [Nuxt 3](https://nuxt.com) |
| Database ORM | [Drizzle ORM](https://orm.drizzle.team) |
| Database | SQLite (default) / PostgreSQL / MariaDB |
| Styling | [Tailwind CSS](https://tailwindcss.com) |
| i18n | [@nuxtjs/i18n](https://i18n.nuxtjs.org) |
| Session auth | [iron-session](https://github.com/vvo/iron-session) |
| Password hashing | bcrypt |

---

## Requirements

- Node.js 20+
- npm 9+

---

## Getting Started

### 1. Clone and install

```bash
git clone https://github.com/your-org/memorialgen.git
cd memorialgen
npm install
```

### 2. Configure environment

```bash
cp .env.example .env
```

Edit `.env` and set at minimum:

```env
NUXT_ADMIN_PASSWORD=your-secure-admin-password
NUXT_SESSION_SECRET=a-random-32-character-string-here
```

### 3. Start development server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

---

## Commands

| Command | Description |
|---|---|
| `npm run dev` | Start development server with hot reload |
| `npm run build` | Build production server (outputs to `.output/`) |
| `npm run generate` | Generate fully static site for GitHub Pages (outputs to `.output/public/`) |
| `npm run preview` | Preview the built production server locally |
| `npm run db:push` | Push schema changes directly to the database (dev only) |
| `npm run db:studio` | Open Drizzle Studio database browser |

---

## Environment Variables

Copy `.env.example` to `.env` and configure:

### Required

| Variable | Description |
|---|---|
| `NUXT_ADMIN_PASSWORD` | Password for the `/admin` panel |
| `NUXT_SESSION_SECRET` | Random string (32+ chars) for signing session cookies |

### Database

| Variable | Default | Description |
|---|---|---|
| `NUXT_DB_DIALECT` | `sqlite` | Database engine: `sqlite`, `postgres`, or `mariadb` |
| `NUXT_DB_URL` | `./data/memorial.db` | SQLite file path, or full connection string for pg/mariadb |

**PostgreSQL example:**
```env
NUXT_DB_DIALECT=postgres
NUXT_DB_URL=postgres://user:password@localhost:5432/memorial
```

**MariaDB / MySQL example:**
```env
NUXT_DB_DIALECT=mariadb
NUXT_DB_URL=mysql://user:password@localhost:3306/memorial
```

### Optional

| Variable | Default | Description |
|---|---|---|
| `NUXT_UPLOAD_MAX_SIZE_MB` | `5` | Maximum image upload size in MB |
| `NUXT_PUBLIC_API_BASE_URL` | _(empty)_ | External API server URL for static/GitHub Pages mode |
| `NUXT_PUBLIC_SITE_URL` | _(empty)_ | Canonical site URL used for meta tags |
| `NUXT_ALLOWED_ORIGIN` | `*` | CORS allowed origin when running as a separate API server |
| `DEFAULT_LOCALE` | `en` | Default language: `en` or `zh-TW`. **Build-time only** — must be set before `npm run build` |
| `NUXT_PUBLIC_SITE_TITLE` | _(empty)_ | Custom board title shown in the header, hero h1, and browser tab. When set, browser tab becomes `{title} \| Memorial Board` |
| `NUXT_PUBLIC_SITE_SUBTITLE` | _(empty)_ | Custom subtitle shown below the hero title on the home page |

---

## Deployment

### Option A — Full-stack server (VPS, Railway, Dokku, etc.)

```bash
npm run build
node .output/server/index.mjs
```

The server runs on port `3000` by default. Set `PORT` to override:

```bash
PORT=8080 node .output/server/index.mjs
```

Everything runs on a single process: the frontend, API, and database.

---

### Option B — Static site on GitHub Pages + separate API server

This is a two-part setup:

**Part 1 — API server**

Deploy the app as a full-stack server (Option A) on any host that supports Node.js. This instance handles all writes (new messages, image uploads, edits).

Set the CORS origin to match your GitHub Pages domain:
```env
NUXT_ALLOWED_ORIGIN=https://memorial.example.com
```

**Part 2 — Static frontend on GitHub Pages**

Add these secrets to your GitHub repository (`Settings → Secrets → Actions`):

| Secret | Value |
|---|---|
| `API_BASE_URL` | URL of your API server, e.g. `https://api.memorial.example.com` |
| `SITE_URL` | Your GitHub Pages URL, e.g. `https://memorial.example.com` |
| `SESSION_SECRET` | Same as your API server's `NUXT_SESSION_SECRET` |

Push to `main` — GitHub Actions will run `npm run generate` and deploy to GitHub Pages automatically.

**Custom domain (CNAME)**

Edit `public/CNAME` to contain your domain:
```
memorial.example.com
```

This file is copied into the static output automatically and configures GitHub Pages to use your custom domain.

---

## URL Structure

| URL | Description |
|---|---|
| `/` | Memorial wall — featured messages, then all messages |
| `/submit` | Submit a new message |
| `/message/:id` | View a single message; edit/delete if password was set |
| `/admin/login` | Admin login |
| `/admin` | Admin dashboard — toggle highlight and active |
| `/zh-TW` | Traditional Chinese version of the homepage |
| `/zh-TW/submit` | Traditional Chinese submit form |

---

## API Endpoints

### Public

| Method | Path | Description |
|---|---|---|
| `GET` | `/api/messages` | List active messages. Query: `page`, `limit`, `highlight` |
| `POST` | `/api/messages` | Create a message |
| `GET` | `/api/messages/:id` | Get a single message |
| `PUT` | `/api/messages/:id` | Edit a message (requires `password` in body if set) |
| `DELETE` | `/api/messages/:id` | Delete a message (soft-delete; requires `password` if set) |
| `POST` | `/api/uploads` | Upload images (multipart/form-data) → returns `{ paths }` |

### Admin (session-protected)

| Method | Path | Description |
|---|---|---|
| `POST` | `/api/admin/auth` | Log in with `NUXT_ADMIN_PASSWORD` |
| `DELETE` | `/api/admin/auth` | Log out |
| `GET` | `/api/admin/messages` | List all messages including hidden. Query: `page`, `limit`, `active` |
| `PATCH` | `/api/admin/messages/:id/highlight` | Toggle or set featured status |
| `PATCH` | `/api/admin/messages/:id/active` | Toggle or set visibility |

---

## Data Model

### `messages`

| Column | Type | Notes |
|---|---|---|
| `id` | integer | Primary key, autoincrement |
| `name` | text | Submitter display name |
| `message` | text | Main message body |
| `email` | text | Optional; never exposed publicly |
| `password_hash` | text | Optional bcrypt hash; enables self-service editing |
| `highlight` | boolean | Featured status |
| `active` | boolean | Visibility (default true) |
| `custom_fields` | text | JSON object: `{ "Field Name": "value" }` |
| `create_time` | integer | Unix timestamp (ms) |
| `update_time` | integer | Unix timestamp (ms) |

### `message_images`

| Column | Type | Notes |
|---|---|---|
| `id` | integer | Primary key |
| `message_id` | integer | Foreign key → messages.id (cascade delete) |
| `path` | text | Relative path, e.g. `/uploads/uuid.jpg` |
| `order` | integer | Display order |

---

## Project Structure

```
memorialgen/
├── app.vue                      # Root layout
├── nuxt.config.ts               # Nuxt + i18n + Nitro config
├── tailwind.config.ts
├── drizzle.config.ts            # DB dialect switch for drizzle-kit
├── .env.example
├── public/
│   ├── CNAME                    # GitHub Pages custom domain
│   └── uploads/                 # Runtime image storage (gitignored)
├── i18n/
│   ├── en.json
│   └── zh-TW.json
├── assets/css/main.css          # Tailwind base + component classes
├── pages/
│   ├── index.vue                # Memorial wall
│   ├── submit.vue               # New message form
│   ├── message/[id].vue         # Detail + edit
│   └── admin/
│       ├── login.vue
│       └── index.vue
├── components/
│   ├── AppHeader.vue
│   ├── LangSwitcher.vue
│   ├── MessageCard.vue
│   ├── MessageForm.vue          # Shared create/edit form
│   ├── ImageUploader.vue        # Drag-drop multi-image upload
│   ├── CustomFieldsEditor.vue   # Dynamic key-value field builder
│   ├── HighlightBadge.vue
│   ├── AdminMessageRow.vue
│   └── Pagination.vue
├── composables/
│   ├── useApi.ts                # $fetch wrapper with API_BASE_URL support
│   ├── useMessages.ts           # CRUD operations
│   └── useAdminAuth.ts
├── middleware/
│   └── admin.ts                 # Client-side guard for /admin/*
├── server/
│   ├── db/
│   │   ├── index.ts             # DB connection factory (SQLite/PG/MariaDB)
│   │   └── schema.ts            # Drizzle table definitions
│   ├── api/
│   │   ├── messages/            # Public message CRUD
│   │   ├── uploads/             # Image upload handler
│   │   └── admin/               # Admin auth + management routes
│   ├── middleware/
│   │   ├── cors.ts              # CORS headers for static+API mode
│   │   └── admin-auth.ts        # Session guard for /api/admin/*
│   └── utils/
│       ├── password.ts          # bcrypt helpers
│       └── session.ts           # iron-session helper
├── scripts/
│   └── copy-native-deps.mjs    # postbuild: copies better-sqlite3 to output
└── .github/
    └── workflows/
        └── deploy.yml           # GitHub Actions: generate + deploy to Pages
```

---

## Adding a Language

1. Create `i18n/<code>.json` following the same key structure as `i18n/en.json`
2. Add the locale to `nuxt.config.ts`:

```ts
i18n: {
  locales: [
    { code: 'en',    language: 'en-US', file: 'en.json',    name: 'English' },
    { code: 'zh-TW', language: 'zh-TW', file: 'zh-TW.json', name: '繁體中文' },
    { code: 'ja',    language: 'ja-JP', file: 'ja.json',    name: '日本語' }, // new
  ],
}
```

3. Update `LangSwitcher.vue` to display the new locale's label.

---

## License

MIT
