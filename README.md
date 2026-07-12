# Jingle Engine

AI-powered contextual jingle generation platform. Brands answer a short 4-step
brief — brand basics, audience & context, platform, creative direction — and
get back a finished audio jingle tailored to where it'll run (TikTok,
Instagram Reels, Spotify Ads, YouTube, Classic Radio, In-Store).

## Repository structure

This repo is organized by branch:

- **`backend`** — the FastAPI backend: auth, the jingle wizard, generation
  pipeline, file uploads, history/dashboard APIs. See that branch's README
  for setup, environment variables, and full endpoint documentation.
- **`main`** — project overview (this file).

## Tech stack

- **API**: FastAPI, Pydantic v2, JWT auth (Argon2 password hashing)
- **Data**: PostgreSQL (Neon, serverless), SQLAlchemy 2.0 (async), Alembic migrations
- **AI pipeline**: Google Gemini (lyrics + prompt enrichment + TTS), Meta
  MusicGen via Hugging Face Transformers/PyTorch (instrumental generation),
  librosa (key detection/alignment), pydub (mixing)
- **Architecture**: Clean Architecture, Repository Pattern, dependency
  injection — the AI provider and file storage are both defined as swappable
  interfaces, not hard-wired implementations

## Getting started

Switch to the `backend` branch for setup instructions:

```
git checkout backend
```

## License

Built for Hackiwha 3.0.
