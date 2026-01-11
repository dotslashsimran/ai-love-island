# AI Love Island

A perpetual relationship simulator featuring six autonomous AI characters. The simulation never ends. Drama accumulates indefinitely.

## Overview

AI Love Island is a live, voyeuristic dashboard that observes AI-powered characters navigating relationships in a closed social environment. Users observe—they never interact.

**Characters:**
- **Ayla** — romantic, attachment-seeking, emotionally expressive
- **Miro** — analytical, guarded, conflict-avoidant
- **Sena** — charming, novelty-seeking, flirty
- **Ravi** — loyal, steady, commitment-oriented
- **Luna** — emotionally volatile, intuitive, dramatic
- **Tariq** — reserved, observant, slow-burn

## Tech Stack

- **Frontend:** Next.js 15 + React + Tailwind CSS
- **Backend:** Next.js API Routes
- **Database:** Supabase (PostgreSQL)
- **AI:** DeepSeek API for character cognition
- **Deployment:** Vercel

## Setup

### 1. Clone and Install

```bash
git clone <repo-url>
cd love-island
npm install
```

### 2. Configure Supabase

1. Create a new project at [supabase.com](https://supabase.com)
2. Run the schema in `supabase/schema.sql` via the SQL Editor
3. Copy your project URL and keys

### 3. Configure Environment

```bash
cp .env.example .env.local
```

Fill in your credentials:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
DEEPSEEK_API_KEY=your_deepseek_api_key
CRON_SECRET=your_random_secret_string
```

### 4. Run Locally

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

## Simulation

The simulation runs via a cron job that calls `/api/simulate` every 15-30 minutes.

### Manual Trigger (Development)

```bash
curl -X POST http://localhost:3000/api/simulate \
  -H "Authorization: Bearer your_cron_secret"
```

### Vercel Cron (Production)

The `vercel.json` configures automatic execution every 20 minutes.

## Architecture

```
src/
├── app/
│   ├── api/
│   │   ├── characters/   # GET character state
│   │   ├── timeline/     # GET timeline events
│   │   ├── confessionals/# GET confessionals
│   │   └── simulate/     # POST trigger simulation
│   └── page.tsx          # Dashboard UI
├── components/
│   ├── CharacterCard.tsx
│   ├── TimelineSidebar.tsx
│   └── ConfessionalPanel.tsx
├── lib/
│   ├── deepseek.ts       # AI character cognition
│   ├── simulation.ts     # Agent loop logic
│   ├── database.ts       # Supabase operations
│   └── supabase.ts       # Client config
├── data/
│   └── characters.ts     # Fixed character roster
└── types/
    └── index.ts          # TypeScript definitions
```

## Data Model

### Character State
- Personality traits (attachment, novelty, trustBias, volatility)
- Emotional state (attraction, trust, jealousy toward each other)
- Current partner
- Security level

### Interactions
Events with effects—not conversations. Most have no dialogue. Occasionally include leaked excerpts.

### Timeline Events
Categories: `shift`, `tension`, `coupling`, `drift`

Single-sentence commentary. Suggestive, never explicit. No emojis.

## Design Principles

- **Voyeuristic but restrained** — observe, don't interact
- **Emotionally legible** — feelings are visible through indicators
- **Slightly saucy, never goofy** — tone is serious
- **Addictive to check** — slow burn, accumulating drama

## License

Private. All rights reserved.
