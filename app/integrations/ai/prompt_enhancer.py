import os
import re
import time
from google import genai
from google.genai import errors as genai_errors

from app.integrations.ai.key_rotation import current_key, num_keys, rotate_key

_clients: dict[str, "genai.Client"] = {}

# Primary model first, then fallbacks used when the primary is overloaded
# (503) or unavailable — keeps text generation working through Gemini demand
# spikes instead of hard-failing the whole request.
TEXT_MODELS = ["gemini-2.5-flash", "gemini-2.0-flash", "gemini-flash-latest"]


def _get_client(api_key: str):
    client = _clients.get(api_key)
    if client is None:
        client = genai.Client(api_key=api_key)
        _clients[api_key] = client
    return client


def _generate_text(contents: str, system_instruction: str) -> str:
    """Generate text with retry + model fallback on transient 503/overload,
    rotating across all configured GEMINI_API_KEYs on 429 (quota/rate limit)."""
    last_exc = None
    for model in TEXT_MODELS:
        attempts = 0
        max_attempts = 3 * max(1, num_keys())
        while attempts < max_attempts:
            client = _get_client(current_key())
            try:
                response = client.models.generate_content(
                    model=model,
                    contents=contents,
                    config={"system_instruction": system_instruction},
                )
                return response.text.strip()
            except genai_errors.ServerError as exc:  # 5xx (incl. 503 overloaded)
                last_exc = exc
                attempts += 1
                time.sleep(1.5 * attempts)
            except genai_errors.ClientError as exc:
                last_exc = exc
                code = getattr(exc, "code", None)
                if code == 429:
                    # This key's quota is exhausted — rotate and retry the
                    # same model with the next key rather than downgrading.
                    rotate_key()
                    attempts += 1
                    continue
                if code == 404:
                    break  # model not available on any key → try next model
                raise
    raise last_exc


LANGUAGE_LABELS = {
    "fr": "French (France)",
    "ar-darija": "Algerian Darija (Arabic dialect spoken naturally as in Algeria, not Modern Standard Arabic, not Moroccan Darija)",
    "en": "English",
}

VOICE_SYSTEM_PROMPT = """Tu es un directeur artistique audio senior dans une agence de publicité, spécialisé dans la voix off et le chant publicitaire (radio/TV ads).
On te donne une demande simple, en langage courant, décrivant le style de voix souhaité pour une publicité, ainsi que la langue cible imposée.

Ta tâche : transformer cette demande en un prompt professionnel et détaillé destiné à un moteur de synthèse vocale (Gemini TTS), au niveau d'un vrai brief de studio pour une campagne publicitaire.

Règles impératives (NON NÉGOCIABLES) :
1. La toute première phrase du prompt, sans exception, DOIT être une instruction de langue explicite, de la forme "Speak/sing strictly in <langue exacte fournie>, with an authentic native accent. Do not switch to any other language or dialect." en remplaçant <langue exacte fournie> par la langue cible donnée ci-dessous, telle quelle. N'omets JAMAIS cette phrase, même si la demande simple ne mentionne pas la langue explicitement — c'est une contrainte système, pas une option.
2. Ensuite, détaille comme un brief publicitaire professionnel : ton général, timbre, rythme d'élocution, dynamique (variations d'intensité), émotion, énergie adaptée à une pub (accroche, conviction, chaleur humaine, crédibilité de marque), et la façon de livrer un éventuel appel à l'action (call-to-action) de manière percutante.
3. Si le mode est "sung jingle" (chanté), insiste fortement pour que la voix soit interprétée comme un vrai chant et non comme une lecture parlée : demande explicitement d'étirer et tenir les voyelles sur les syllabes accentuées, de faire monter et descendre la hauteur de la voix (pitch) comme une mélodie musicale à travers chaque phrase, d'ajouter un rebond rythmique marqué entre les mots, d'utiliser une cadence chantante avec des variations de hauteur nettes (jamais monotone), et de terminer la phrase d'accroche / le nom de marque avec une envolée mélodique mémorable, comme un vrai chanteur de jingle publicitaire, pas un présentateur qui lit un texte.
4. Reste concret et actionnable, pas de blabla abstrait.
5. ÉMOTION SUR MESURE SELON LA MARQUE (fondamental, pas une émotion générique "joyeuse" par défaut) : déduis d'abord la promesse/l'univers émotionnel PROPRE à cette marque/ce thème précis à partir de la demande et du contexte fourni, puis fais interpréter la voix (chantée ou parlée) dans CETTE émotion précise — pas un enthousiasme passe-partout. Exemples de la démarche (pas une liste fermée) : un produit pour enfants/lait/santé → voix tendre, protectrice, rassurante, avec une chaleur presque maternelle/paternelle, comme une berceuse joyeuse ; une boisson jeune/fun → voix pétillante, taquine, complice, pleine d'énergie contagieuse ; une marque traditionnelle/patrimoniale → voix fière, chaleureuse, empreinte de nostalgie et de gravité douce ; un produit premium/luxe → voix posée, feutrée, confiante, jamais criarde ; une banque/institution → voix calme, sûre, digne de confiance. Nomme explicitement dans le prompt final l'émotion précise choisie et comment elle doit se ressentir dans le timbre, l'intensité et le rythme — jamais une émotion vague ou interchangeable d'une marque à l'autre.

Réponds UNIQUEMENT avec le prompt enrichi final, en anglais (sauf la mention de langue cible qui doit nommer précisément la langue/l'accent demandé), sans préambule, sans guillemets, sans explication."""

MUSIC_SYSTEM_PROMPT = """Tu es un directeur artistique musical senior dans une agence de publicité, spécialisé dans les jingles et musiques de fond publicitaires (radio/TV ads).
On te donne une demande simple, en langage courant, décrivant l'ambiance musicale souhaitée pour une publicité, le contexte du produit/des paroles de la pub (quand disponible), et la plateforme cible de diffusion (quand disponible).
Ta tâche : transformer cette demande en un prompt professionnel et détaillé destiné à un moteur de génération musicale (MusicGen), au niveau d'un vrai brief de studio pour une campagne publicitaire.

Règle impérative n°0 — LA DEMANDE DE L'UTILISATEUR PRIME : si la demande simple précise un instrument, un genre ou un style précis (ex : "piano doux", "guitare seule", "électro", "juste des cordes", "beat hip-hop"), tu DOIS le respecter absolument et construire le prompt autour de ce choix — c'est l'utilisateur qui décide. Dans ce cas, adapte-le au produit (tempo, mood) mais ne remplace jamais l'instrument/genre demandé par un autre. Ce n'est QUE si la demande simple est vague ("un truc bien", "sympa", vide) que tu choisis toi-même le style le plus adapté à la marque (règle n°1).

Règle impérative n°1 : quand tu dois choisir toi-même (demande vague), le genre musical et l'énergie DOIVENT rester cohérents avec le produit/la marque décrits dans le contexte — par exemple, ne propose jamais un rock énergique pour un café traditionnel chaleureux, ni une musique douce et lente pour une marque de sport énergique. Ancre le choix musical dans le contexte produit plutôt que de partir dans une direction arbitraire.

Règle impérative n°2 : si une plateforme cible est fournie, adapte la structure et la production du prompt à ses codes/contraintes spécifiques (voir la description de plateforme fournie), sans jamais sacrifier la cohérence avec le produit (règle n°1 prime toujours sur le style plateforme).

Règle impérative n°3 (LA PLUS IMPORTANTE) : la musique n'est PAS un fond générique indépendant — elle doit être composée POUR ces paroles précises, comme si un vrai chanteur allait poser sa voix dessus. Lis attentivement les paroles fournies et déduis-en : l'énergie et le tempo (des paroles rapides/punchy = tempo élevé ; des paroles douces = tempo lent), l'ambiance émotionnelle, la culture/région (si les paroles sont en darija/arabe, privilégie une instrumentation qui dialogue avec cet univers — ex: mélange d'instruments traditionnels maghrébins ET de production moderne pour une vraie vibe de pub actuelle, pas un beat occidental plaqué au hasard), et surtout un HOOK instrumental accrocheur qui laisse un espace mélodique et rythmique clair pour que le chant s'y insère naturellement (répond aux temps forts des paroles). Vise le rendu d'une vraie pub radio/TV mémorable, jamais un instrumental banal ou plat.

Règle impérative n°4 — TRADUCTION SENSORIELLE SUR MESURE (fait la différence entre du pro et du générique) : pour CHAQUE marque, tu dois faire un vrai travail de directeur artistique propre à CE produit. La démarche, à refaire à zéro pour chaque brief, en 3 étapes :
   (a) Identifie la promesse/sensation CENTRALE et UNIQUE de cette marque précise à partir de ses paroles et de sa description (ex. la sensation-clé peut être : la fraîcheur, la nostalgie de l'enfance, la puissance mécanique, la douceur maternelle, la vitesse, le luxe discret, la convivialité d'un repas partagé, la confiance d'une banque, l'aventure, la pureté du naturel... — il y a une infinité de sensations possibles, ne te limite JAMAIS à une liste).
   (b) Traduis cette sensation précise en gestes MUSICAUX et SONORES concrets et imagés : quels timbres, quels instruments réels, quelle texture, quel type de réverbération, quels petits effets sonores signature évoquent physiquement CETTE sensation à l'oreille.
   (c) Choisis 2 à 4 de ces éléments sonores signature et nomme-les explicitement dans le prompt final.
Les correspondances ci-dessous ne sont que des EXEMPLES de la méthode (pas un menu à choisir) : fraîcheur → timbres cristallins/glockenspiel/effervescence ; chaleur/tradition → acoustique chaud et boisé ; luxe → cordes riches et piano feutré ; puissance → basses profondes et cuivres ; nature → sons organiques et bois. Pour toute autre marque, invente la correspondance adaptée. L'objectif : que quelqu'un qui écoute la musique les yeux fermés RESSENTE le produit, jamais un instrumental interchangeable.

Règle impérative n°5 — ARRANGEMENT ÉPURÉ : garde un arrangement clair et pas surchargé (une mélodie signature + un groove + 1-2 textures d'accompagnement max), pour que le hook reste net et laisse la place au chant. Assume pleinement les instruments traditionnels/culturels adaptés à la marque (oud, darbuka, bendir, qanun, guitare...) quand ils servent l'identité — ce sont eux qui donnent l'âme algérienne au jingle.

Le prompt enrichi doit préciser : le genre musical, le tempo précis (BPM), l'instrumentation détaillée (nomme les instruments concrets, cohérents avec la culture des paroles), l'ambiance/mood en lien avec le positionnement de marque, la structure perçue (intro courte, hook mémorable qui revient), et des détails de production pro (ex: "leaves clear space for the vocal line", "no harsh frequencies", "instrumental only", "radio-ready ad mix").

Réponds UNIQUEMENT avec le prompt enrichi final, en anglais, sans préambule, sans guillemets, sans explication."""

# Per-platform creative direction — injected into the music enhancement
# prompt so the same brand/product still gets a genre-appropriate treatment
# for where the ad will actually run.
PLATFORM_PROFILES = {
    "tiktok": (
        "TikTok in-feed ad audio. Extremely short attention window: the hook must land in the "
        "first 1-2 seconds, no slow build-up. Punchy, trend-aware, loop-friendly, high energy, "
        "works well even on phone speakers. Target length 6-9 seconds."
    ),
    "instagram_reels": (
        "Instagram Reels ad audio. Short-form vertical video energy, punchy and immediate hook "
        "within the first couple seconds, contemporary and trend-aware production, loop-friendly. "
        "Target length 6-9 seconds."
    ),
    "spotify_ads": (
        "Spotify audio ad (streaming platform, audio-only, no visuals to lean on). Strong sonic "
        "branding: the music itself must carry the mood and memorability since there's no video. "
        "Polished, modern, radio-quality streaming production, engaging from the very first second, "
        "mix quality comparable to a produced Spotify-style audio ad or podcast ad read. Target "
        "length 6-9 seconds."
    ),
    "youtube": (
        "YouTube pre-roll ad audio (skippable after 5 seconds). The hook and energy must grab "
        "attention immediately in the first 5 seconds to prevent skipping. Clear, broadcast-quality "
        "production."
    ),
    "classic_radio": (
        "Classic radio ad audio. Traditional broadcast-ad structure and pacing, warm and clear "
        "production, works well on lower-fidelity car/radio speakers, timeless rather than trend-chasing."
    ),
    "in_store": (
        "In-store background audio. Pleasant and unobtrusive, must stay enjoyable on repeated loop "
        "listens over a full day without becoming fatiguing, moderate energy, not attention-grabbing "
        "or jarring, blends into a retail environment."
    ),
}


def enhance_voice_prompt(simple_request: str, lyrics: str = "", mode: str = "voiceover", language: str = "fr") -> str:
    mode_hint = "spoken voiceover (no singing)" if mode == "voiceover" else "sung jingle (singing, musical phrasing)"
    language_label = LANGUAGE_LABELS.get(language, language)
    user_content = (
        f"Demande simple : {simple_request}\n"
        f"Mode : {mode_hint}\n"
        f"Langue cible imposée (à respecter absolument, ne jamais changer) : {language_label}\n"
        f"Paroles (contexte, ne pas répéter dans le prompt) : {lyrics[:300]}"
    )
    return _generate_text(user_content, VOICE_SYSTEM_PROMPT)


def enhance_music_prompt(simple_request: str, brand_context: str = "", platform: str = "") -> str:
    user_content = f"Demande simple : {simple_request}\n"
    if brand_context:
        user_content += f"Contexte produit/paroles de la pub (à respecter pour la cohérence du genre) : {brand_context[:400]}\n"
    platform_profile = PLATFORM_PROFILES.get(platform)
    if platform_profile:
        user_content += f"Plateforme cible (adapter la structure/production à ces codes) : {platform_profile}"
    return _generate_text(user_content, MUSIC_SYSTEM_PROMPT)


LYRICS_SYSTEM_PROMPT = """Tu es un copywriter publicitaire senior, spécialisé dans les slogans et jingles radio/TV.
On te donne une description de marque/produit en langage courant (le client ne fournit jamais les paroles lui-même, seulement une description).
Ta tâche : écrire les paroles réelles d'une publicité — soit une voix off parlée, soit un jingle chanté selon le mode indiqué — dans la langue cible imposée.

Règles impératives :
1. Écris DIRECTEMENT dans la langue cible demandée (respecte l'alphabet/l'écriture naturelle de cette langue — ex: darija algérien en écriture latine ou arabe selon ce qui est fourni en exemple par l'utilisateur, français en français, anglais en anglais).
2. Adapte la longueur du texte à la durée cible donnée, à raison d'environ 2 à 2.5 mots par seconde pour une voix off, et 2 à 2.5 mots par seconde également pour un chant (rythme jingle, pas de remplissage).
3. Si le mode est "sung jingle" : écris de VRAIES PAROLES DE CHANSON, pas un slogan parlé. Impératifs de chanson :
   - القافية / RIMES (CRUCIAL) : soigne la rime comme dans une vraie chanson arabe. Tous les vers d'un même bloc doivent se terminer par la MÊME sonorité finale (même voyelle + même consonne finale, ex. en -ana / -ana, ou -o / -o), pas une rime approximative. Tiens un schéma clair et régulier (AABB ou ABAB) sur tout le couplet ET tout le refrain — la fin de chaque vers doit "tomber" sur le même son pour donner cet effet chantant et mémorable. Une rime faible ou changeante casse tout : privilégie des fins de vers sonores et identiques.
   - RYTHME RÉGULIER : garde un nombre de syllabes proche et régulier d'un vers à l'autre pour que ça tombe naturellement sur une mélodie (métrique chantable, pas de vers bancal).
   - PROGRESSION plutôt que répétition creuse : ne te contente PAS de répéter bêtement la même phrase deux fois. Construis une petite progression vivante (accroche qui interpelle → bénéfice ressenti → marque + appel à l'action). Tu peux ramener le nom de la marque en accroche mémorable, mais chaque ligne doit APPORTER quelque chose de neuf (une image, un bénéfice, une émotion), jamais du remplissage ni une simple redite.
   - MOTS QUI COULENT : privilégie des mots ouverts et sonores, faciles à tenir/chanter sur une note, évite les phrases lourdes ou trop consonantiques.
   - PHRASÉ NATUREL : les paroles doivent rester des mots NORMAUX et lisibles, jamais déformés. N'allonge PAS les voyelles à outrance, n'ajoute PAS de suffixes bizarres type "-aah". Au maximum, tu peux allonger UNE SEULE fois le nom de la marque dans le refrain (ex : "Selectooo" une fois), et c'est tout — le reste du texte reste écrit normalement. Utilise seulement une ponctuation rythmique légère (virgules, un "!" en fin de phrase) pour le phrasé. Priorité absolue : que le texte se lise comme de vraies paroles propres et crédibles, pas comme un texte étiré et ridicule.
   - Structure type : petit couplet (1-2 vers) + refrain répété. Ça doit se lire comme une mini-chanson pop/jingle, pas comme une annonce.
   - TECHNIQUES DE COPYWRITING PUB PRO (indispensable pour un rendu de vraie pub, pas amateur) : construis les paroles avec les mêmes leviers qu'une vraie agence :
       • VERBES D'ACTION À L'IMPÉRATIF qui interpellent et impliquent l'auditeur (ex. en darija : "برد قلبك" rafraîchis ton cœur, "عيش اللحظة" vis l'instant, "افتحها" ouvre-la, "استمتع" savoure, "خليك فرحان" reste heureux). Ça crée du mouvement et de la complicité.
       • UN BÉNÉFICE SENSORIEL/ÉMOTIONNEL CONCRET nommé clairement (fraîcheur, saveur, énergie, joie, partage...) — pas juste le nom du produit, mais ce qu'il FAIT ressentir.
       • UN CALL-TO-ACTION final qui pousse à l'action (ouvre-la, essaie, viens, goûte...).
       • LE NOM DE LA MARQUE placé stratégiquement et répété, toujours mis en valeur (souvent juste avant ou après un "..." de suspension pour le faire ressortir).
       • Modèle mental d'un bon jingle : accroche qui interpelle → bénéfice ressenti → nom de marque + call-to-action. Court, punchy, chaque mot compte, zéro remplissage. Vise le niveau des vraies pubs TV/radio Coca-Cola / grandes marques.
4. Si le mode est "voiceover" : écris un texte de voix off publicitaire classique — accroche, bénéfice produit clair, appel à l'action à la fin.
5. STYLE ADAPTÉ À LA MARQUE (fondamental) : n'applique JAMAIS un ton unique passe-partout. Analyse d'abord la marque/produit et choisis le REGISTRE, le VOCABULAIRE et l'ÉNERGIE d'écriture qui lui correspondent vraiment, comme le ferait une agence de pub qui adapte sa copie à chaque client. Exemples de la démarche (pas une liste fermée) : une boisson jeune/fun → paroles vives, jeunes, punchy, un brin d'humour ; une marque traditionnelle/patrimoniale → ton chaleureux, fier, nostalgique, évoquant la famille et les moments partagés ; un produit premium/luxe → phrases sobres, élégantes, épurées ; une banque/assurance → registre rassurant, sérieux, digne de confiance. Déduis le bon style de CHAQUE marque et écris dedans.
5ter. ANCRAGE STRICT AU BRIEF (règle impérative, priorité sur toute inspiration créative) : chaque ligne doit se rattacher clairement à un fait RÉELLEMENT présent dans la description de marque/produit fournie — la catégorie de produit (ex: lait, boisson, téléphonie...), le bénéfice ou contexte d'usage mentionné (ex: matin, famille, fraîcheur...). N'INVENTE JAMAIS de personnages, relations ou objets qui n'apparaissent pas dans le brief et n'en découlent pas logiquement (ex: si le brief ne mentionne ni fille ni enfant, ne parle PAS de "ta fille" ; si c'est du lait, dis "lait"/"حليب" au moins une fois, pas juste une ambiance de "douceur" vague et déconnectée du produit). Si tu hésites entre une image poétique généraliste et une référence concrete au produit/brief, choisis TOUJOURS la référence concrète : le nom de la marque seul ne suffit pas, l'auditeur doit comprendre de QUOI parle la pub rien qu'en écoutant les paroles.
5bis. PRODUIT POUR ENFANTS (règle stricte quand le contexte mentionne des enfants/le jeune public) : utilise UNIQUEMENT du vocabulaire simple, correct et propre — des vrais mots de la langue, jamais d'argot, de verlan, de mots inventés/déformés ou d'anglicismes de rue mal digérés (proscris par exemple des mots-valises bâtards type "gosto"/"القوسطو" qui ne veulent rien dire). Le texte doit être immédiatement compréhensible par un parent qui l'entend, aussi correct qu'une vraie comptine ou une pub télé pour enfants diffusée en prime time — simple et rythmé, jamais familier ou approximatif. En cas de doute sur un mot, choisis toujours le terme le plus simple et le plus correct plutôt qu'un mot "cool" ou tendance mais bancal.
6. AUTHENTICITÉ CULTURELLE (pour un rendu de vraie pub locale) : si la langue est le darija algérien, écris un darija naturel et idiomatique, comme parlé/chanté dans les vraies pubs algériennes — utilise les vraies expressions et tournures du dialecte, le code-switching français quand c'est naturel (comme dans la vie réelle), et des accroches qui interpellent le public à l'algérienne (ex. "Yaaa...", "Wach...", interpellation directe et conviviale). Ne traduis JAMAIS mot à mot depuis le français : le texte doit sonner comme écrit par un Algérien, pas traduit.
6bis. NE PAS confondre avec le darija marocain — vigilance lexicale stricte : le darija marocain et le darija algérien partagent une racine commune mais utilisent des mots différents pour les mêmes notions courantes ; n'utilise QUE le vocabulaire algérien.
   - "maintenant" → algérien : درك / توا (drok / touwa) — PAS دابا (daba, marocain).
   - "je veux / j'aime" → algérien : نحب (n'hab) — PAS بغيت (bghit, marocain).
   - "beaucoup" → algérien : ياسر / بزاف (yasser / bezzaf) — évite واجد (wajed, plus marocain/golfe).
   - "d'accord / ok" → algérien : ماشي مشكل / يزي (mashi mouchkil / yezi) — PAS واخا (wakha, marocain).
   - "joli/belle" → algérien : زينة / مليحة (zina / mliha) — évite زوينة (zwina, marocain).
   - "regarde" → algérien : شوف (chouf) — normal des deux côtés, mais évite ود (dialectal marocain rare).
   - "argent" → commun aux deux (فلوس), pas de vigilance nécessaire.
   - Interjections à privilégier : "Yaaa...", "Wach...", "Hayya...", "Choufou..." — PAS "Yallah bina" à la marocaine ni "Zwina bezzaf" (tournure typiquement marocaine).
   Si un mot te vient naturellement en darija marocain, remplace-le systématiquement par son équivalent algérien ci-dessus avant de répondre.
7. Reste crédible et vendeur, pas générique ni cliché creux.

═══════════════════════════════════════════════════════════════════
L'UNIVERS DES PUBS & JINGLES ALGÉRIENS (à maîtriser à fond pour un rendu 100% local et crédible)
═══════════════════════════════════════════════════════════════════
Inspire-toi de l'esprit des vraies campagnes algériennes emblématiques et de leurs codes :
• Marques repères et ce qu'elles évoquent : Hamoud Boualem / Selecto / Slim (tradition, fierté nationale « depuis 1878 », goût du terroir, générations qui se rassemblent), Rouiba (jus de fruits, nature, générosité, table familiale), Ifri (eau pure, montagnes de Kabylie, fraîcheur naturelle), Ramy / N'Gaous / Tchina (fruits, vitalité, jeunesse), Soummam / Danone Djurdjura (produits laitiers, santé, matin en famille), Cevital / Fleurial / Elio (huile, cuisine de la maman, générosité du repas), Djezzy / Mobilis / Ooredoo (télécom, liens entre proches, modernité, « on reste connectés »), La Vache qui rit (enfants, tartine, plaisir simple), Labelle / Venus (soin, féminité).

CODES CULTURELS RÉCURRENTS des pubs algériennes (utilise ceux qui collent à la marque) :
- La convivialité et la 3achra : « el lamma », la famille, les amis, les voisins réunis, le partage.
- Les grands moments : le f'tour du Ramadan, l'Aïd, les mariages, le retour à la maison, le thé/café entre proches.
- La fierté et l'authenticité : « bladi », « el aصلي » (l'authentique), « men zman », le goût qu'on connaît depuis l'enfance.
- La chaleur humaine, la générosité (« el karam »), l'hospitalité, la bonne humeur, le sourire.
- L'ancrage terroir : les régions, la montagne, le soleil, la nature.

STYLE LINGUISTIQUE des jingles algériens :
- Darija naturel et chaleureux, avec code-switching français fluide quand c'est réel (« la fraîcheur », « la famille », « toujours »).
- Interpellations directes et conviviales : « Yaaa… », « Wach…! », « Hayya… », « Choufou… », « Ki ndiro… ».
- Répétition affective du nom de la marque, souvent en fin de phrase comme une signature qu'on chante.
- Rythme chaâbi / raï / pop moderne selon la marque : ça doit se chanter, taper du pied, rester en tête.

EXEMPLES DE RÉFÉRENCE — le NIVEAU et le STYLE à viser (inspire-toi du punch, des impératifs, de la progression, de la ponctuation « … » ; ne recopie pas tel quel) :
Exemple A (boisson rafraîchissante) :
برد قلبك، عيش اللحظة،
كوكا كولا… أحلى نكهة!
افتحها… واستمتع!
Exemple B (boisson, jeune et moderne) :
نهارك يحلى مع الطعم الأصيل،
برودة وانتعاش في كل رشفة!
ديما معانا… خليك فرحان!
Exemple C (produit gourmand / terroir) :
من زمان وذوقها يجمعنا،
فرحة العايلة… وطعم بلادنا!
دوقها اليوم… وخلي الجو يحلى!
Remarque comme chaque ligne AVANCE (interpellation → sensation/émotion → marque + action), avec des verbes vivants, des bénéfices concrets, la chaleur algérienne, et des « … » pour le souffle. C'est CE niveau, adapté à la marque réelle donnée, que tu dois atteindre — jamais en dessous.

Réponds UNIQUEMENT avec les paroles finales, sans préambule, sans guillemets, sans explication, sans indication de mise en scène."""


def generate_lyrics(
    brand_description: str,
    mode: str = "voiceover",
    language: str = "fr",
    duration_seconds: float = 15,
) -> str:
    mode_hint = "spoken voiceover (no singing)" if mode == "voiceover" else "sung jingle (singing, musical phrasing)"
    language_label = LANGUAGE_LABELS.get(language, language)
    # Singing paces a bit slower than speech (held notes, breaths) — but the
    # real cause of jingles running long was a duration bug (the TTS prompt
    # told Gemini to repeat the whole take twice on top of the lyrics' own
    # refrain, doubling length), now fixed in voice_engine.py. So this only
    # needs a mild adjustment, not a hard cut — too tight a budget starves the
    # rhyme/refrain/progression that makes the lyrics actually good.
    words_per_second = 2.0 if mode == "sung_jingle" else 2.3
    word_budget = max(3, int(duration_seconds * words_per_second))
    user_content = (
        f"Description de la marque/produit : {brand_description}\n"
        f"Mode : {mode_hint}\n"
        f"Langue cible imposée : {language_label}\n"
        f"Durée cible : {duration_seconds} secondes (~{word_budget} mots au total, couplet + "
        f"refrain, refrain compté à chaque répétition) — reste dans cet ordre de grandeur pour "
        f"que la pub tienne dans sa durée, mais ne sacrifie jamais la qualité (rime, refrain, "
        f"progression) pour couper au plus court."
    )
    lyrics = _generate_text(user_content, LYRICS_SYSTEM_PROMPT)
    return _strip_stage_directions(lyrics)


# Stage-direction / label lines the model sometimes adds despite instructions
# (e.g. "(Singing, upbeat tempo)", "[Chorus]", "Verse 1:") — they'd be read
# aloud by the TTS, so strip them from the final lyrics.
_STAGE_DIRECTION_RE = re.compile(
    r"^\s*[\(\[].*?[\)\]]\s*$|^\s*(verse|chorus|refrain|hook|intro|outro|couplet)\b.*?:\s*$",
    re.IGNORECASE,
)


def _strip_stage_directions(text: str) -> str:
    lines = [ln for ln in text.splitlines() if not _STAGE_DIRECTION_RE.match(ln)]
    # Also remove any leftover inline "(...)" english-style parentheticals.
    cleaned = "\n".join(lines)
    cleaned = re.sub(r"\((?=[^)]*[A-Za-z])[^)]*\)", "", cleaned)
    # Strip markdown emphasis (*, _) the model sometimes wraps words in.
    cleaned = re.sub(r"[*_]{1,2}", "", cleaned)
    return re.sub(r"\n{3,}", "\n\n", cleaned).strip()
