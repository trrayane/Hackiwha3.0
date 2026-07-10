# Jingle Engine

Backend for AI-powered contextual jingle generation. FastAPI + async SQLAlchemy 2.0 + PostgreSQL (Neon) + Alembic + JWT + Argon2.

This backend does NOT generate AI content. It manages users, jingle projects, generation requests/history and calls out to an `AIProviderService` interface — a separate developer plugs in the real provider (ElevenLabs, Suno, OpenAI, ...) later.

## Tech Stack

FastAPI, SQLAlchemy 2.0 (async, asyncpg), Alembic (async), Pydantic v2, JWT (access+refresh), Argon2, Redis (optional hook, not wired), clean architecture with Repository Pattern.

## Setup

1. Copy env file, fill in real values
```
cp .env.example .env
```
- `DATABASE_URL` — Neon connection string, `postgresql+asyncpg://user:pass@host/db` (no query string; SSL is forced in code for asyncpg).
- `SECRET_KEY` — random string for JWT signing.
- `SMTP_*` — real SMTP creds needed to send the password-reset email.
- `UPLOAD_DIR` / `PUBLIC_BASE_URL` / `MAX_UPLOAD_SIZE_MB` / `ALLOWED_AUDIO_EXTENSIONS` — reference-audio upload settings (local disk storage by default).

2. Install deps
```
python -m venv venv
venv\Scripts\activate
pip install -r requirements.txt
```

3. Run migration
```
alembic upgrade head
```

4. Run server
```
uvicorn app.main:app --reload
```

Docs: http://127.0.0.1:8000/docs

## Tests

```
pip install -r requirements-dev.txt
pytest
```

Tests run against the real `DATABASE_URL` (Neon) but every test is wrapped in a transaction that's rolled back afterward, so nothing persists. AI-provider calls in tests use a fake in-memory provider (`tests/conftest.py::FakeAIProviderService`), never the real `NotImplementedAIProviderService`.

## Folder Structure

```
app/
  api/v1/          route handlers (auth, jingles, feedback, history, dashboard)
  services/        business logic (one class per domain)
  repositories/     DB access, one class per model, generic BaseRepository
  models/          SQLAlchemy ORM models (UUID pk, timestamps, soft delete)
  schemas/         Pydantic v2 request/response models
  core/            config, jwt, argon2 security, reset-token helpers, app exceptions
  middleware/       exception handlers, CORS wiring
  dependencies/     DI: current-user, role guard, service factories
  database/         async engine + session
  utils/            pagination/query-param helpers
  integrations/
    ai_provider.py  AIProviderService interface + NotImplementedAIProviderService
    storage.py      StorageService interface + LocalStorageService (reference audio uploads)
  migrations/       Alembic (async) migrations
  main.py
tests/
  unit/            security, jwt, reset-token helpers, storage validation
  integration/      auth flow, jingle wizard/drafts, reference audio, feedback,
                    history/dashboard, generation progress/cancel, real-Neon smoke checks
```

## Auth

`POST /api/v1/auth/register` — name, email, password, confirm_password (strong password: upper+lower+digit+special, min 8).
`POST /api/v1/auth/login` — email, password → access + refresh token.
`POST /api/v1/auth/refresh` — rotates refresh token (old one revoked, new one issued).
`POST /api/v1/auth/logout` — revokes the given refresh token.
`POST /api/v1/auth/forgot-password` / `POST /api/v1/auth/reset-password` — token-based reset, 30 min expiry, sent by email.
`GET /api/v1/auth/me`

Roles: `admin`, `user` (see `require_role` dependency for gating admin-only routes later).

## Jingle Wizard

Matches the 4-step Figma flow: Brand Basics → Audience & Context → Platform
Selection → Creative Direction. Each step auto-saves immediately (there is no
separate "save draft" call — the PATCH/POST for each step *is* the save).
`current_step` tracks the furthest step reached so far (it never regresses,
even if the user goes back and edits an earlier step). `status` starts at
`draft`, flips to `in_review` once `/generate` succeeds, and to `approved`
via `/approve`. To resume an unfinished draft, `GET /api/v1/jingles/{id}`
returns everything saved so far; to list drafts/in-review/approved jingles,
`GET /api/v1/jingles?status=draft|in_review|approved`.

1. `POST /api/v1/jingles` — brand_name, brand_tone, brand_description (optional) → returns draft (current_step=1, status=draft).
2. `PATCH /api/v1/jingles/{id}/audience` — target_age_range (`13-24`/`25-40`/`41+`), mood_context.
3. `PATCH /api/v1/jingles/{id}/platform` — platform (`tiktok`/`instagram_reels`/`spotify_ads`/`youtube`/`classic_radio`/`in_store`).
4. `PATCH /api/v1/jingles/{id}/creative-direction` — sound_description (optional), voice_enabled, plus the reference-audio upload endpoints below. Bumps `current_step` to 4 but does **not** change status — status only moves on actual generation.
5. `POST /api/v1/jingles/{id}/generate` — validates brand_name/brand_tone/target_age_range/mood_context/platform are present, creates a `GenerationRequest` (with `progress_percent`/`stage_message` for the UI's live progress bar), calls `AIProviderService.generate_jingle()`, saves a `GeneratedVariant` on success and flips the jingle to `in_review`.
6. `POST /api/v1/jingles/{id}/approve` — moves an `in_review` jingle to `approved` (409 if not currently in review).

Jingle creation is capped by `User.jingle_quota` (default 5, matching the
Figma "3 of 5 jingles" usage widget) — `POST /api/v1/jingles` returns 409 once
the quota is reached.

## Generation progress & cancellation

- `GET /api/v1/jingles/{id}/generations` — all generation requests for a jingle.
- `GET /api/v1/jingles/{id}/generations/{request_id}` — poll a single request (status, progress_percent, stage_message) — for the Figma "Analyzing brand tone... / Composing jingle... 26%" progress screen.
- `POST /api/v1/jingles/{id}/generations/{request_id}/cancel` — cancels a request that's still `pending`/`processing` (409 if it already finished). Matches the Figma "Cancel generation" button; today's synchronous `NotImplementedAIProviderService` resolves before a client could ever call this, but the field/endpoint is in place for a real async provider.

## Jingle Management

`GET /api/v1/jingles` — pagination, search by brand name, filter by platform/archived/favorites/status/date range/min feedback score (all facets from the Figma Library screen's filter panel), sort. Plus `GET/{id}`, `PATCH/{id}`, `DELETE/{id}` (soft delete), `POST /{id}/duplicate`, `POST /{id}/favorite`, `POST /{id}/archive`, `POST /{id}/approve`.

## Reference Audio Upload

Part of step 4 (Creative Direction). One reference audio file per jingle.

- `POST /api/v1/jingles/{id}/reference-audio` (multipart/form-data, field `file`) — upload; 409 if one already exists (use replace).
- `PUT /api/v1/jingles/{id}/reference-audio` — replace the existing file (old one is deleted from storage after the new one is saved).
- `GET /api/v1/jingles/{id}/reference-audio` — metadata + URL.
- `DELETE /api/v1/jingles/{id}/reference-audio` — removes the DB row and the stored file.

Validation: extension must be one of `ALLOWED_AUDIO_EXTENSIONS` (415 if not), size capped at `MAX_UPLOAD_SIZE_MB` enforced while streaming to disk so an oversized upload never fully lands on disk (413 if exceeded). All four endpoints are scoped to the jingle's owner (404 for anyone else, matching how jingles themselves are protected).

Storage is behind a `StorageService` interface (`app/integrations/storage.py`) with a real `LocalStorageService` (disk + `/media` static mount) as the default. Swap in an S3/Cloudinary/Supabase-backed implementation later by implementing the same interface and changing `app/dependencies/services.py::get_storage_service()` — no business logic changes needed.

## Feedback & History

`POST` / `GET /api/v1/jingles/{id}/variants/{variant_id}/feedback` — a single `rating` (1-5) + optional `comment`, matching the Figma feedback screen ("Your rating 4/5" + "What needs to change?"). The average rating across a jingle's variants is exposed as `feedback_score` on `JingleOut` and is filterable via `?min_feedback_score=`.
`GET /api/v1/history/generations`, `/recent-activity`, `/favorites`, `/archived`.

## Dashboard

`GET /api/v1/dashboard/summary` — total projects, total generated variants, draft/in_review/approved counts, pending/completed/failed generation counts, `jingle_quota`/`jingles_used` (usage widget), `top_platforms` (platform + count, ranked), recent activity.

## Security notes

- Argon2 password hashing (no bcrypt 72-byte cutoff issue).
- Login runs the password check even for unknown emails (dummy hash) — response time doesn't leak which emails exist.
- Password-reset tokens are stored as sha256 hashes, never plain text.
- Refresh tokens are stored (hashed) with a `jti`, rotated on every refresh, and revocable on logout.
- Forgot-password never reveals whether an email is registered.
- Reference-audio upload/replace/delete/get are all ownership-scoped (404, not 403, for someone else's jingle — consistent with the rest of the API).
- Upload size is enforced while streaming to disk (not after fully buffering), so a huge file can't exhaust memory or disk before being rejected.

## Integrating a real AI provider

Implement `AIProviderService` (see `app/integrations/ai_provider.py`) with a real `generate_jingle()` and swap it in `app/dependencies/services.py::get_ai_provider()`. Nothing else in the codebase needs to change. Until then, `NotImplementedAIProviderService` raises, and every `/generate` call is saved as a `GenerationRequest` with `status=failed` — the rest of the API is fully usable without it.

`JingleGenerationInput` (the payload passed to `generate_jingle()`) carries everything a
real provider needs: `brand_name`, `brand_tone`, `brand_description`, `target_age_range`,
`mood_context`, `platform`, `sound_description`, `voice_enabled`, and
`reference_audio_url` (the uploaded reference-audio file's public URL, if one was
attached — resolved through the same `StorageService` used for uploads). `GenerationRequest`
already tracks `progress_percent`/`stage_message` for streaming a live progress bar, and
`GeneratedVariant` stores the resulting `audio_url`/`lyrics`/`duration_seconds`/`provider`
metadata — a real provider only needs to populate `JingleGenerationResult`, everything
else (persistence, status transitions, cancellation) is already wired.
