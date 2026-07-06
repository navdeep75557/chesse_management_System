# Chess Tournament Management System

A full-stack app for managing chess players and tournaments: enroll players, generate
randomized round pairings, simulate match results, and view live win/loss standings.

## Tech Stack

- **Frontend + Backend:** SvelteKit (TypeScript), server routes under `src/routes/api`
- **Database:** PostgreSQL
- **ORM:** Prisma
- **Styling:** Tailwind CSS v4

## Features

- **Players** — CRUD with validation (name, email format, positive integer rating)
- **Tournaments** — CRUD with validation (date range, `maxPlayers >= 2`)
- **Enrollment** — many-to-many player/tournament assignment, capacity-limited, duplicate-safe
- **Match generation** — random pairing per round, automatic "bye" for odd player counts,
  blocked from re-generating a round that isn't finished yet
- **Match results** — randomly simulated winner, one result per match
- **Match history** — per tournament and per player
- **Rankings** — top 3 standings by wins (games played as tiebreaker)

## Getting Started

### Prerequisites

- Node.js 20+
- PostgreSQL 14+ (running locally, or use Docker — see below)

### 1. Install dependencies

```bash
npm install
```

### 2. Configure environment variables

Copy the example file and adjust if your Postgres credentials differ:

```bash
cp .env.example .env
```

```env
DATABASE_URL="postgresql://chess_app:chess_app_password@localhost:5432/chess_tournaments?schema=public"
```

The database and role in that URL must exist before running migrations, e.g.:

```sql
CREATE ROLE chess_app LOGIN PASSWORD 'chess_app_password' CREATEDB;
CREATE DATABASE chess_tournaments OWNER chess_app;
```

(`CREATEDB` is only needed so Prisma Migrate can create its shadow database during `migrate dev`.)

### 3. Run migrations

```bash
npm run db:migrate
```

This applies `prisma/migrations` and regenerates the Prisma Client.

### 4. Seed sample data

```bash
npm run db:seed
```

Creates 10 sample players and one "Spring Grandmaster Invitational" tournament (all 10
players enrolled, no matches yet — use the UI/API to generate round 1).

### 5. Run the dev server

```bash
npm run dev
```

Visit `http://localhost:5173`.

### Other useful scripts

| Script              | Purpose                                     |
| ------------------- | -------------------------------------------- |
| `npm run build`     | Production build (Node adapter)              |
| `npm run preview`   | Preview the production build locally         |
| `npm run check`     | Type-check the whole project (svelte-check)  |
| `npm run db:studio` | Open Prisma Studio to browse/edit data       |

## Running with Docker

This spins up Postgres and the app together; the app container runs pending migrations
on boot before starting the server.

```bash
docker-compose up --build
```

The app will be available at `http://localhost:3000`. To seed sample data into the
containerized database:

```bash
docker-compose exec app npx prisma db seed
```

## Folder Structure

```
src/
  lib/
    server/
      db.ts                 # Prisma client singleton (reused across HMR reloads in dev)
      errors.ts             # HttpError hierarchy + withErrorHandling() wrapper for API routes
      validation.ts         # Input validation/normalization for players, tournaments, id params
      services/
        playerService.ts      # Player CRUD + per-player match history
        tournamentService.ts  # Tournament CRUD + enrollment (capacity/duplicate checks)
        matchService.ts        # Random pairing generation, bye handling, result recording
        rankingService.ts      # Standings computation (wins desc, games played tiebreaker)
    components/             # PlayerForm, TournamentForm, Podium, ToastContainer
    stores/
      toast.svelte.ts        # Runes-based toast notification store
    types/
      index.ts               # Shared TS interfaces used by both client and server code
  routes/
    api/                     # REST endpoints, grouped by resource (see below)
    players/                 # Players list, new, edit, and per-player match history pages
    tournaments/             # Tournaments list, new, edit, and detail (bracket) pages
prisma/
  schema.prisma              # Player, Tournament, TournamentPlayer, Match models
  seed.ts                    # Sample data for local development/demo
  migrations/                # Generated SQL migrations
```

## API Reference

All endpoints return JSON. Errors always use the shape:

```json
{ "error": "Human readable message", "details": { "field": "reason" } }
```

with status `400` (validation), `404` (not found), `409` (conflict), or `500` (server error).

### Players

**`GET /api/players`** — list all players

```json
[{ "id": 1, "name": "Magnus Carlsen", "email": "magnus@example.com", "rating": 2830, "createdAt": "2026-07-06T08:40:45.486Z" }]
```

**`POST /api/players`** — create a player

```json
// Request
{ "name": "Judit Polgar", "email": "judit@example.com", "rating": 2735 }

// 201 Response
{ "id": 11, "name": "Judit Polgar", "email": "judit@example.com", "rating": 2735, "createdAt": "..." }
```

**`GET /api/players/:id`** / **`PUT /api/players/:id`** / **`DELETE /api/players/:id`**
— fetch, update, or delete a single player (`DELETE` returns `204`)

**`GET /api/players/:id/matches`** — full match history for a player across all tournaments

### Tournaments

**`GET /api/tournaments`** — list all tournaments (includes `playerCount`)

**`POST /api/tournaments`** — create a tournament

```json
// Request
{ "name": "Summer Open", "startDate": "2026-09-01", "endDate": "2026-09-05", "maxPlayers": 8 }

// 201 Response
{ "id": 2, "name": "Summer Open", "startDate": "...", "endDate": "...", "status": "upcoming", "maxPlayers": 8, "createdAt": "..." }
```

**`GET /api/tournaments/:id`** / **`PUT /api/tournaments/:id`** / **`DELETE /api/tournaments/:id`**
— fetch, update, or delete a tournament

### Enrollment

**`GET /api/tournaments/:id/players`** — list enrolled players

**`POST /api/tournaments/:id/players`** — enroll a player

```json
// Request
{ "playerId": 3 }
```

Rejects with `409` if the tournament is full or the player is already enrolled.

**`DELETE /api/tournaments/:id/players`** — remove an enrolled player (same `{ "playerId": 3 }` body)

### Matches

**`POST /api/tournaments/:id/generate-matches`** — randomly pair enrolled players into the
next round. An odd player count produces one automatically-won "bye" match. Rejects with
`409` if the current round still has unplayed matches.

**`POST /api/matches/:id/result`** — randomly simulate a match outcome and record it.
Rejects with `409` if the match already has a result.

**`GET /api/tournaments/:id/matches`** — full match log for a tournament, all rounds,
with player names

### Rankings

**`GET /api/tournaments/:id/rankings`** — top 3 standings

```json
[
  { "rank": 1, "player": { "id": 3, "name": "Magnus Carlsen", "...": "..." }, "wins": 4, "losses": 0, "gamesPlayed": 4 },
  { "rank": 2, "player": { "id": 1, "name": "Fabiano Caruana", "...": "..." }, "wins": 3, "losses": 1, "gamesPlayed": 4 },
  { "rank": 3, "player": { "id": 4, "name": "Hikaru Nakamura", "...": "..." }, "wins": 3, "losses": 1, "gamesPlayed": 4 }
]
```
