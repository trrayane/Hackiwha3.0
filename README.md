<div align="center">
  <img src="assets/logo.png" alt="Jingle AI logo" width="420" />

  <h3>AI-generated audio jingles for your brand — in seconds, not studio sessions.</h3>

  <p>
    <img alt="FastAPI" src="https://img.shields.io/badge/backend-FastAPI-009688?logo=fastapi&logoColor=white">
    <img alt="React" src="https://img.shields.io/badge/frontend-React%20%2B%20Vite-61DAFB?logo=react&logoColor=white">
    <img alt="Postgres" src="https://img.shields.io/badge/database-PostgreSQL-336791?logo=postgresql&logoColor=white">
    <img alt="Gemini" src="https://img.shields.io/badge/AI-Gemini%20TTS%20%2B%20MusicGen-4285F4?logo=googlegemini&logoColor=white">
  </p>
</div>

---

## What is Jingle AI

Jingle AI turns a short brand brief (name, tone, audience, platform, mood, sound direction) into a **fully produced audio jingle** — sung or spoken, in French, English, or Algerian Darija — ready to drop into a TikTok ad, a radio spot, or an in-store playlist.

You describe the brand. The pipeline writes the lyrics, performs the vocals, composes the instrumental, and mixes everything into a finished track.

## How it works

```
Brand brief  →  Lyrics + style prompt (Gemini)  →  Vocal performance (Gemini TTS)
                                                          │
                                                          ▼
                                        DSP autotune (librosa + psola)
                                                          │
             Instrumental (MusicGen)  →  Final mix (pydub)  →  Generated jingle
```

1. **Brand wizard** — a 4-step form collects brand identity, target audience, platform, and creative direction (sound description, voice, language).
2. **Lyrics & performance direction** — Gemini generates on-brand lyrics and a tailored vocal style prompt (emotion, energy, pacing).
3. **Vocal synthesis** — Gemini TTS performs the lyrics using one of 30 prebuilt voices, with a built-in **voice preview player** so you can audition a voice before picking it.
4. **Melody correction** — a pitch-correction (autotune) pass turns the spoken performance into an actual sung melody without garbling the lyrics.
5. **Instrumental** — MusicGen (`facebook/musicgen-small`) composes the backing track from the brand's sound direction.
6. **Mix & delivery** — vocals and instrumental are mixed into the final jingle, which you can rate, request changes on, or approve.

## Features

- 🎯 **Guided brand wizard** — brand identity → audience → platform → creative direction, saved as you go.
- 🗣️ **30 selectable voices**, filterable by gender, each with an instant audio preview.
- 🌍 **3 languages** — French, English, and Algerian Darija (with dialect-accurate prompting for Gemini TTS).
- 🎵 **Sung or spoken** delivery mode.
- 📎 **Reference audio upload** to steer the creative direction.
- ⭐ **Rating & feedback loop** — approve a jingle or request changes and regenerate.
- 📚 **Jingle library & dashboard** — track every generation request and its history.

## Tech stack

- **API**: FastAPI, Pydantic v2, JWT auth (Argon2 password hashing)
- **Data**: PostgreSQL (Neon, serverless), SQLAlchemy 2.0 (async), Alembic migrations
- **AI pipeline**: Google Gemini (lyrics + prompt enrichment + TTS), Meta MusicGen via Hugging Face Transformers/PyTorch (instrumental generation), librosa/psola (pitch correction), pydub (mixing)
- **Frontend**: React 19, Vite, TypeScript, Tailwind CSS
- **Architecture**: Clean Architecture, Repository Pattern, dependency injection — the AI provider and file storage are both defined as swappable interfaces, not hard-wired implementations

## Project structure

```
├── app/           # FastAPI backend (auth, jingle wizard, generation pipeline, dashboard)
├── frontend/       # React + Vite client
├── scripts/        # Maintenance & pre-generation scripts (e.g. voice previews)
└── tests/          # Backend test suite
```

## Getting started

### Backend

```bash
python -m venv venv && source venv/Scripts/activate   # Windows: venv\Scripts\activate
pip install -r requirements.txt
cp .env.example .env   # fill in DATABASE_URL, GEMINI_API_KEY, SECRET_KEY
alembic upgrade head
uvicorn app.main:app --host 0.0.0.0 --port 8100
```

### Frontend

```bash
cd frontend
npm install
cp .env.example .env   # set VITE_API_BASE_URL to your backend URL
npm run dev
```

The app is then available at `http://localhost:5173`, talking to the API at `http://localhost:8100`.

## License

Built for Hackiwha 3.0.
