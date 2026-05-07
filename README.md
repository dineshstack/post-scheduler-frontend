<div align="center">

# PostSync — Social Media Scheduler Frontend

**The open-source Next.js dashboard for multi-platform social posting.**
Schedule, publish, and track posts across Twitter/X, LinkedIn, Instagram, Facebook, TikTok, and your own blog — all from one clean interface.

[![Next.js](https://img.shields.io/badge/Next.js-15-black?logo=next.js)](https://nextjs.org)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?logo=typescript)](https://typescriptlang.org)
[![License](https://img.shields.io/badge/license-MIT-green)](LICENSE)
[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen)](CONTRIBUTING.md)

</div>

---

## What is PostSync?

PostSync is a production-ready social media scheduling platform split into two repositories:

- **This repo (`post-scheduler-frontend`)** — The Next.js frontend dashboard. Free, open-source, MIT licensed.
- **[`post-scheduler-backend`](#-get-the-backend)** — The Laravel API that powers everything. Available as a premium package.

The frontend is fully open so you can inspect the code, contribute improvements, and understand exactly what you're building on. The backend is the engine — it handles OAuth token management, queue-based publishing jobs, analytics fetching, media storage, and the AI caption generator.

---

## Features (Frontend)

| Module            | What's included                                                                                    |
| ----------------- | -------------------------------------------------------------------------------------------------- |
| **Compose**       | Rich CKEditor post body, per-platform overrides, character counters, media picker, schedule picker |
| **Calendar**      | Month view showing all scheduled and published posts by platform                                   |
| **Posts**         | Paginated list with status filters (draft / scheduled / published / failed) and inline editing     |
| **Analytics**     | Overview stats, platform breakdown, engagement rate, top posts table, time-series chart            |
| **Connections**   | OAuth connect/disconnect flow for Twitter, LinkedIn, Instagram, Facebook, TikTok                   |
| **Media Library** | Folder tree, drag-upload, gallery grid, trash/restore                                              |
| **Settings**      | Profile, timezone, avatar                                                                          |

---

## Tech Stack

- **Next.js 16** (App Router)
- **TypeScript**
- **Tailwind CSS** with CSS variables for theming
- **React Hook Form + Zod** for type-safe forms
- **CKEditor 5** for rich-text post bodies
- **SWR** for data fetching and cache invalidation
- **Lucide React** for icons

---

## Getting Started

### Prerequisites

- Node.js 20+
- A running instance of the PostSync backend (see below)

### Installation

```bash
git clone https://github.com/your-username/post-scheduler-frontend.git
cd post-scheduler-frontend
npm install
```

### Environment

Copy the example and fill in your backend URL:

```bash
cp .env.example .env.local
```

```env
NEXT_PUBLIC_API_URL=http://localhost:8000
```

### Run

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

---

## Project Structure

```
ps_front/
├── app/
│   ├── auth/            # Login & register pages
│   ├── dashboard/       # Main app pages (compose, posts, calendar, analytics)
│   └── settings/        # Profile & connections
├── components/
│   ├── ai/              # AI caption generator
│   ├── editor/          # CKEditor integration
│   ├── layout/          # AppLayout, Sidebar
│   ├── media/           # Media library modal
│   └── ui/              # Design system (Button, Input, Modal, Badge…)
└── lib/
    ├── hooks/           # SWR data hooks
    └── types/           # Shared TypeScript types mirroring the API
```

---

## API Shape

All TypeScript types live in `lib/types/index.ts` and mirror the Laravel API responses exactly. The backend exposes:

- `POST /auth/login` · `POST /auth/register` · `POST /auth/logout`
- `GET/POST/PUT/DELETE /posts`
- `GET /calendar`
- `GET /analytics/overview` · `GET /analytics/time-series`
- `GET/POST/DELETE /platform-accounts`
- `GET/POST/DELETE /gallery` · `GET/POST/DELETE /gallery/folders`
- `POST /ai/caption`

---

## Contributing

Pull requests are welcome. For large changes, please open an issue first to discuss what you'd like to change.

```bash
# Run lint
npm run lint

# Type check
npm run type-check
```

---

---

## 🚀 Get the Backend

> **PostSync is production-ready today — but only if you have the API.**

The frontend you're looking at is the shell. The backend is where everything real happens:

### What's inside `post-scheduler-backend`

| Feature                       | Details                                                                                                 |
| ----------------------------- | ------------------------------------------------------------------------------------------------------- |
| **Multi-platform OAuth**      | Twitter OAuth 2.0 PKCE, LinkedIn, Facebook, TikTok — token refresh handled automatically                |
| **Queue-based publishing**    | Laravel Horizon + Redis. Posts go through a job queue with retry logic and per-platform failure logging |
| **AI caption generator**      | Anthropic Claude integration — generates platform-aware captions from your post content                 |
| **Analytics sync**            | Scheduled jobs pull impressions, likes, comments, shares from each platform API                         |
| **Media management**          | S3-compatible storage, folder trees, soft-delete trash                                                  |
| **Role-based access control** | Spatie Permissions — admin and member roles out of the box                                              |
| **Audit logging**             | Every create/update/delete action is timestamped and stored                                             |
| **First-comment scheduling**  | Post a first comment (e.g. hashtag stack) automatically after publish on supported platforms            |
| **Blog publishing**           | Direct integration with a self-hosted blog API endpoint                                                 |
| **Full migrations + seeders** | One `php artisan migrate --seed` and you're live                                                        |

### Stack

Laravel 13 · Laravel Passport (OAuth server) · Laravel Horizon · Spatie Media Library · Spatie Permissions · MySQL · Redis

### Pricing

|                      |                                                                         |
| -------------------- | ----------------------------------------------------------------------- |
| **Single license**   | **$15** one-time — personal or client project                           |
| **Extended license** | **$40** one-time — SaaS / multiple deployments                          |
| Includes             | Full source code, `.env.example`, setup docs, 6 months of email support |

**No subscription. No seat fees. You own the code.**

### 👉 [Buy post-scheduler-backend — $15](https://your-store-link.gumroad.com/l/postsync-backend)

> Questions before buying? Open a GitHub Discussion or email `info@orions360.com` and I'll reply within 24 hours.

---

## License

This frontend (`post-scheduler-frontend`) is MIT licensed — use it however you like.

The backend (`post-scheduler-backend`) is a commercial package sold separately.
