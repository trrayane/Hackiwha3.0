# Jingle Engine — Vue d'ensemble du projet

Plateforme de génération de jingles publicitaires par IA : l'utilisateur décrit sa marque à travers un wizard en 4 étapes, et le backend génère automatiquement des paroles, une voix (chantée ou parlée) et une musique instrumentale, mixées en un jingle audio final prêt à l'emploi.

---

## 1. Stack technique

| Couche | Techno |
|---|---|
| API | Python 3.13, FastAPI |
| Base de données | PostgreSQL (Neon, serverless), SQLAlchemy 2.0 (async), Alembic (migrations) |
| Auth | JWT (access + refresh tokens), Argon2 (hash mots de passe) |
| Génération texte (paroles, prompts enrichis) | Google Gemini API (`gemini-2.5-flash`, avec repli sur `gemini-2.0-flash`/`gemini-flash-latest`) |
| Génération voix | Google Gemini TTS (`gemini-2.5-flash-preview-tts`), 30 voix prédéfinies |
| Génération musique | Meta MusicGen (`facebook/musicgen-small`, via Hugging Face Transformers + PyTorch, inférence CPU) |
| Traitement audio | `librosa` (analyse de tonalité), `psola` (correction de pitch préservant les formants), `pydub` (mixage, nécessite `ffmpeg`) |
| Stockage fichiers | Local disk (`LocalStorageService`), abstraction prête pour S3/Cloudinary/Supabase |
| Email (optionnel) | SMTP (reset de mot de passe) |

---

## 2. Architecture générale

```
Client (frontend, non couvert ici)
        │
        ▼
FastAPI (app/main.py)
        │
        ├── app/api/v1/          → routers (auth, jingles, feedback, history, dashboard)
        ├── app/services/        → logique métier
        ├── app/repositories/    → accès DB (pattern repository)
        ├── app/models/          → modèles SQLAlchemy
        ├── app/schemas/         → schémas Pydantic (requêtes/réponses)
        ├── app/dependencies/    → injection de dépendances FastAPI
        ├── app/integrations/    → intégrations externes (IA, stockage)
        │       ├── ai_provider.py      → interface abstraite AIProviderService
        │       ├── storage.py          → interface abstraite StorageService
        │       └── ai/                 → implémentation IA réelle (détaillée section 4)
        └── app/migrations/      → migrations Alembic
```

**Principe clé** : le cœur métier (services, repositories, routers) ne dépend que d'**interfaces abstraites** (`AIProviderService`, `StorageService`). L'implémentation concrète est injectée via `app/dependencies/services.py`, ce qui permet de swapper le provider IA (ou le stockage) sans toucher au reste du code.

---

## 3. Le wizard de création de jingle (4 étapes)

Le modèle `Jingle` porte l'état du wizard via `current_step` (1 à 4) et `status` (`draft` → `in_review` → `approved`).

### Étape 1 — Brand Basics
- `brand_name` (obligatoire, max 150 car.)
- `brand_tone` (obligatoire, max 50 car.) — ex. "joueur et affectueux", "sérieux et rassurant"
- `brand_description` (optionnel, max 500 car.)

### Étape 2 — Audience & Context
- `target_age_range` : enum `13-24` / `25-40` / `41+`
- `mood_context` (optionnel, max 150 car.) — ambiance souhaitée

### Étape 3 — Platform Selection
- `platform` : enum `tiktok` / `instagram_reels` / `spotify_ads` / `youtube` / `classic_radio` / `in_store`
- Chaque plateforme a des contraintes de format propres (durée cible, codes créatifs — voir section 4.4)

### Étape 4 — Creative Direction
- `sound_description` (optionnel, max 1000 car.) — direction musicale libre (ex. "piano doux", "électro énergique")
- `voice_enabled` (bool, défaut `true`) — jingle chanté vs instrumental seul

Un jingle peut aussi recevoir un **fichier audio de référence** (`reference_audio`) à tout moment via `PUT /jingles/{id}/reference-audio` — actuellement accepté mais **pas encore exploité** par le pipeline IA (voir limites, section 6).

Une fois les 4 étapes complètes, `POST /jingles/{id}/generate` déclenche la génération IA.

---

## 4. Le pipeline IA (`app/integrations/ai/`)

C'est le cœur du système. Il transforme les données du wizard en un fichier MP3 final, en 8 étapes séquentielles.

### 4.1 Vue d'ensemble du flux

```
Brief marque (wizard)
   │
   ▼
[A] Génération des paroles (Gemini, texte)
   │
   ├──▶ [B1] Enrichissement du prompt vocal (Gemini, texte)
   └──▶ [B2] Enrichissement du prompt musical (Gemini, texte)
   │
   ▼
[C] Synthèse vocale (Gemini TTS)
   │
   ▼
[D] Détection de la tonalité de la voix (librosa)
   │
   ▼
[E] Autotune / correction de pitch (librosa + psola)
   │
   ▼
[F] Génération de la musique (MusicGen, dans la tonalité détectée)
   │
   ▼
[G] Alignement de la tonalité musique ↔ voix (librosa)
   │
   ▼
[H] Mixage final (pydub) → MP3
```

Si `voice_enabled=False`, seules les étapes F et le mixage instrumental s'exécutent (pas de voix, pas d'autotune).

### 4.2 [A] Génération des paroles — `prompt_enhancer.generate_lyrics()`

Un modèle Gemini texte joue le rôle d'un **copywriter publicitaire senior**. Le prompt système (`LYRICS_SYSTEM_PROMPT`) impose :
- Écriture **directement dans la langue cible** (respect de l'alphabet natif)
- Budget de mots calculé selon la durée cible (~2.0 mots/s en chanté, 2.3 en parlé)
- Pour un jingle **chanté** : rimes strictes et régulières, progression (pas de répétition creuse), refrain mémorable, techniques de copywriting pro (verbes d'action, bénéfice sensoriel, call-to-action, nom de marque mis en valeur)
- **Style adapté à la marque** : le registre (jeune/fun, traditionnel/fier, premium, rassurant...) est déduit de la description de marque, jamais un ton générique unique
- **Authenticité culturelle** : pour le darija algérien, vrai dialecte idiomatique avec code-switching français naturel, inspiré des codes des vraies pubs algériennes (marques repères, expressions, structure de jingle chaâbi/raï/pop)
- Un nettoyage automatique (`_strip_stage_directions`) retire les didascalies parasites (`(singing...)`, `[Chorus]`, markdown) que le modèle ajoute parfois malgré les instructions

### 4.3 [B1] Enrichissement du prompt vocal — `enhance_voice_prompt()`

Transforme une demande simple ("joueur et affectueux") en brief de studio complet pour Gemini TTS :
- Instruction de langue explicite et non négociable en première phrase
- Ton, timbre, rythme, dynamique, façon de livrer le call-to-action
- Pour le mode chanté : insistance sur l'interprétation *réellement chantée* (tenue de voyelles, montée/descente de pitch, jamais monotone)
- **Émotion sur mesure selon la marque** (pas un enthousiasme générique) : un produit enfant/lait → voix tendre et protectrice ; une boisson jeune → voix pétillante et complice ; une marque traditionnelle → voix fière et nostalgique ; etc.

### 4.4 [B2] Enrichissement du prompt musical — `enhance_music_prompt()`

Même principe côté musique, avec des règles impératives numérotées par priorité :
- **Règle n°0** : si l'utilisateur précise un style/instrument explicite, il prime absolument
- **Règle n°1** : sinon, le genre est déduit du produit/marque (jamais arbitraire)
- **Règle n°2** : adaptation aux codes de la plateforme cible (voir `PLATFORM_PROFILES` — contraintes de durée et de style propres à TikTok, Reels, Spotify Ads, YouTube, radio classique, in-store)
- **Règle n°3** : la musique est composée *pour ces paroles précises* (tempo/énergie déduits du rythme des paroles), pas un fond indépendant
- **Règle n°4 — traduction sensorielle sur mesure** : identifie la sensation centrale du produit (fraîcheur, nostalgie, puissance, luxe...) et la traduit en gestes sonores concrets (timbres, instruments, effets signature)
- **Règle n°5** : arrangement épuré (1 mélodie signature + 1 groove + 1-2 textures max), instruments traditionnels assumés quand ils servent l'identité de marque

### 4.5 [C] Synthèse vocale — `voice_engine.generate_voice()`

Appelle Gemini TTS (`gemini-2.5-flash-preview-tts`) avec le prompt enrichi + les paroles. Points clés :
- 30 voix prédéfinies disponibles (`AVAILABLE_VOICES`), sélection explicite par l'utilisateur ou choix par défaut selon le genre (homme/femme) et le mode (chanté = voix plus vives : Leda/Charon ; parlé = voix neutres : Aoede/Fenrir)
- Bloc **PERFORMANCE STYLE** technique (mécanique du chant : respiration, tenue de note, mouvement de pitch) volontairement **neutre en émotion** — l'émotion réelle vient du prompt enrichi (B1), pour ne jamais entrer en conflit avec une émotion sur-mesure (ex. tendresse) avec un style générique "joyeux/triomphant"
- Retry automatique (3 tentatives) si Gemini renvoie une réponse vide (filtre de sécurité, erreur transitoire)
- Sortie : fichier WAV (PCM 24kHz reconstruit manuellement à partir du flux audio brut retourné par l'API)

### 4.6 [D] Détection de tonalité — `key_matching.estimate_key()`

Analyse chroma (CQT) de la voix générée, corrélée aux profils de tonalité de Krumhansl-Kessler (majeur/mineur, 12 rotations chacun) pour déterminer la note tonique et le mode le plus probable.

### 4.7 [E] Autotune — `pitch_correct.autotune_to_melody()`

**Le problème résolu** : Gemini TTS est un moteur de *parole*, pas de *chant* — aucun prompt ne le fera suivre des notes précises. Cette étape corrige ça en post-traitement :
1. Génère une mélodie de jingle simple dans la tonalité détectée (contour mélodique type "montée vers un sommet puis résolution", inspiré des vraies structures de refrain)
2. Découpe la voix par détection d'attaques (onsets = syllabes)
3. Pour chaque segment, détecte la fréquence fondamentale réelle (`librosa.pyin`) et la force vers la note cible de la mélodie via **TD-PSOLA** (`psola.vocode`) — préserve les formants, donc pas d'effet robotique/métallique contrairement à un pitch-shift classique
4. **Mélange voix originale + voix tunée** (`strength=0.72` par défaut) : assez fort pour un effet chanté audible, assez faible pour garder les mots intelligibles

### 4.8 [F] Génération musicale — `music_engine.generate_music()`

MusicGen-small (le seul modèle qui tient dans la RAM disponible sans crash — voir section 6) génère l'instrumental à partir du prompt enrichi, avec un `guidance_scale` réglable (fidélité au prompt vs créativité).

### 4.9 [G] Alignement de tonalité — `key_matching.align_music_key_to_voice()`

Détecte la tonalité réelle de l'instrumental généré et le transpose (pitch-shift global) pour qu'il tombe exactement dans la même tonalité que la voix — garantit une cohérence harmonique même sans conditionnement mélodique natif.

### 4.10 [H] Mixage final — `pipeline._mix_voice_and_music()`

Via `pydub` :
- La musique est bouclée/coupée à la durée cible, avec fade in/out
- **Ducking** (-9 dB) si voix parlée, **mixage équilibré** (0 dB) si voix chantée
- La voix n'est **jamais coupée en plein mot** : si elle dépasse la durée cible, le mix s'allonge automatiquement (+ 700ms de marge pour le fade final)
- Normalisation finale anti-saturation
- La durée réellement retournée (`duration_seconds`) est **mesurée sur le fichier final**, pas la durée cible théorique — évite toute incohérence en base de données

---

## 5. Endpoints API (31 au total, tous testés fonctionnels)

### Auth (`/api/v1/auth`)
| Méthode | Route | Description |
|---|---|---|
| POST | `/register` | Création de compte |
| POST | `/login` | Connexion (access + refresh token) |
| POST | `/refresh` | Renouvellement de l'access token |
| POST | `/logout` | Invalidation du refresh token |
| POST | `/forgot-password` | Envoi d'un email de reset (si SMTP configuré) |
| POST | `/reset-password` | Réinitialisation via token |
| GET | `/me` | Profil de l'utilisateur connecté |

### Jingles (`/api/v1/jingles`)
| Méthode | Route | Description |
|---|---|---|
| POST | `` | Créer un jingle (étape 1) |
| PATCH | `/{id}/audience` | Étape 2 |
| PATCH | `/{id}/platform` | Étape 3 |
| PATCH | `/{id}/creative-direction` | Étape 4 |
| POST | `/{id}/generate` | **Déclenche la génération IA** (appel bloquant, 1-3 min) |
| GET | `/{id}/generations` | Historique des générations du jingle |
| GET | `/{id}/generations/{request_id}` | Détail d'une génération |
| POST | `/{id}/generations/{request_id}/cancel` | Annuler (si encore en cours) |
| POST | `/{id}/approve` | Marquer le jingle comme approuvé |
| GET | `` | Liste paginée des jingles de l'utilisateur |
| GET | `/{id}` | Détail d'un jingle |
| PATCH | `/{id}` | Modification libre |
| DELETE | `/{id}` | Suppression (soft delete) |
| POST | `/{id}/duplicate` | Dupliquer un jingle |
| POST | `/{id}/favorite` | Toggle favori |
| POST | `/{id}/archive` | Toggle archivage |
| PUT | `/{id}/reference-audio` | Upload d'un audio de référence |
| GET | `/{id}/reference-audio` | Récupérer l'audio de référence |
| DELETE | `/{id}/reference-audio` | Supprimer l'audio de référence |

### Feedback (`/api/v1/jingles/{jingle_id}/variants/{variant_id}/feedback`)
| Méthode | Route | Description |
|---|---|---|
| POST | `` | Noter une variante générée (1-5 étoiles + commentaire) |
| GET | `` | Lister les avis d'une variante |

### History (`/api/v1/history`)
| Méthode | Route | Description |
|---|---|---|
| GET | `/generations` | Historique global des générations |
| GET | `/recent-activity` | Activité récente |
| GET | `/favorites` | Jingles favoris |
| GET | `/archived` | Jingles archivés |

### Dashboard (`/api/v1/dashboard`)
| Méthode | Route | Description |
|---|---|---|
| GET | `/summary` | Résumé : quotas, compteurs par statut, top plateformes, activité récente |

---

## 6. Limites connues et dette technique assumée

- **Pas de champ langue dans le wizard** : le pipeline utilise une langue par défaut fixée en dur (`DEFAULT_LANGUAGE` dans `pipeline.py`, actuellement `ar-darija`). Pour exposer un vrai choix utilisateur, ajouter un champ `language` au modèle `Jingle` (migration Alembic) et le propager dans `JingleGenerationInput`.
- **Pas de champ genre de voix** : idem, `DEFAULT_VOICE_GENDER` fixé en dur (`femme`).
- **`reference_audio_url` accepté mais non utilisé** : Gemini TTS n'offre pas de clonage vocal à partir d'un échantillon — le champ existe dans l'interface mais n'a aucun effet sur la génération actuellement.
- **MusicGen-medium/large testés et abandonnés** : la machine de développement (RAM limitée) fait planter (`OOM`/segfault) tout modèle plus gros que `musicgen-small`, même en float16. `musicgen-small` reste donc le seul choix stable pour l'instant — un environnement avec plus de RAM (ou un provider cloud comme Replicate) permettrait un vrai gain de qualité sonore (instruments moins synthétiques).
- **Génération synchrone bloquante** : `POST /generate` bloque la requête HTTP 1 à 3 minutes (le temps réel de MusicGen sur CPU). `GenerationRequest` a bien des champs `progress_percent`/`stage_message` prévus pour un futur système de polling, mais ils ne sont pas mis à jour en temps réel actuellement — juste "Analyzing brand tone..." au départ puis "Completed" à la fin.
- **Quota Gemini gratuit très limité** : 10 requêtes/jour pour le modèle TTS en tier gratuit — largement insuffisant pour un usage réel, nécessite un compte payant en production.
- **Durée finale approximative** : le budget de mots pour les paroles est une estimation (mots/seconde), pas une garantie stricte — la durée réelle peut dévier de ±30% de la cible selon la richesse du texte généré.

---

## 7. Tests effectués

- ✅ Import complet de l'application (avec et sans `GEMINI_API_KEY`, bascule automatique vers le provider stub)
- ✅ Connexion réelle à la base Neon PostgreSQL + migrations Alembic appliquées
- ✅ **31 endpoints testés un par un via HTTP réel** (register → login → wizard 4 étapes → génération → historique → dashboard → feedback → favoris → archive → duplicate → delete → cancel → refresh → logout)
- ✅ Génération audio de bout en bout validée sur plusieurs marques réelles et fictives (Coca-Cola, Fizzo, Hamoud Boualem Selecto, Soummam, Candia Choco) en français, anglais et darija algérien
- ✅ Vérification de la cohérence prompt musique ↔ marque (ex. genre "rock" refusé pour une marque traditionnelle, instruments adaptés au contexte culturel)
- ✅ Vérification de la précision de durée après correction du bug de double-répétition (paroles + instruction TTS dupliquaient le contenu chanté)

---

## 8. Pour lancer le projet

```bash
# 1. Environnement
python -m venv .venv
.venv\Scripts\activate  # Windows
pip install -r requirements.txt

# 2. Configuration
cp .env.example .env
# Remplir DATABASE_URL (Postgres/Neon), SECRET_KEY, GEMINI_API_KEY

# 3. Migrations
python -m alembic upgrade head

# 4. Lancer le serveur
uvicorn app.main:app --reload
```

Prérequis système : `ffmpeg` doit être installé et dans le PATH (requis par `pydub` pour le mixage audio).
