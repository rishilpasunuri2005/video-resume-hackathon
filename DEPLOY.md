# 🚀 Deploy VidHire to Vercel

This project is configured for one-click deployment to Vercel as a single full-stack app — frontend served as static files, backend running as serverless functions in `/api`.

## Option 1: Deploy from GitHub (recommended)

1. Go to [vercel.com/new](https://vercel.com/new)
2. Click **"Import Git Repository"**
3. Select `rishilpasunuri2005/video-resume-hackathon`
4. Vercel auto-detects the project — leave all settings as default
5. Click **Deploy**

That's it. Your live URL will be something like:
`https://video-resume-hackathon-rishilpasunuri2005.vercel.app`

## Option 2: Deploy from CLI

```bash
# One-time install
npm install -g vercel

# From the project folder
vercel

# Follow the prompts:
# - Set up and deploy? Y
# - Link to existing project? N
# - Project name? video-resume-hackathon
# - Directory? ./
# - Override settings? N

# For production deploy:
vercel --prod
```

## Project Structure for Vercel

```
video-resume-hackathon/
├── index.html              ← Static frontend (served at /)
├── styles.css              ← Static asset
├── app.js                  ← Static asset (frontend JS)
├── vercel.json             ← Vercel config
├── api/                    ← Serverless functions
│   ├── _lib.js             ← Shared helpers (in-memory state)
│   ├── health.js           → GET  /api/health
│   ├── state.js            → GET/PUT /api/state
│   ├── reset.js            → POST /api/reset
│   ├── candidates.js       → POST /api/candidates
│   ├── jobs.js             → POST /api/jobs
│   ├── interviews.js       → POST /api/interviews
│   ├── parse-skills.js     → POST /api/parse-skills
│   └── candidates/
│       └── [id]/
│           └── stage.js    → PATCH /api/candidates/:id/stage
└── server.js               ← Local dev server (Vercel ignores this)
```

## Important — Persistence on Vercel

Vercel serverless functions are **stateless across cold starts**. Each cold start resets the in-memory data to seed values. This is intentional for the hackathon demo:

- The frontend uses `localStorage` as the source of truth for the demo session
- Each user gets a fresh seed on first load
- Profile changes, applications, and messages persist in the user's browser

For **real production**, swap the in-memory state in `api/_lib.js` for:
- **Vercel KV** (Redis) — easiest, official Vercel offering
- **Vercel Postgres** — full SQL
- **Supabase / Neon / PlanetScale** — external managed databases

## Local Development Still Works

```bash
npm start
# → http://localhost:5174
```

The local `server.js` mimics the same API surface, so you can develop locally and deploy without changes.

## Custom Domain

After deploying:
1. Go to your project in the Vercel dashboard
2. Settings → Domains
3. Add your custom domain
4. Follow DNS instructions

## Environment Variables

None required for the demo. For future production with real APIs:
- `KV_URL` — for Vercel KV
- `OPENAI_API_KEY` — if you replace the AI matching with GPT
- `CLOUDINARY_URL` — if you add real video storage
