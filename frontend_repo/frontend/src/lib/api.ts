// Thin typed client for the Jingle Engine backend (see backend/app/api/v1/*).
// Base URL comes from VITE_API_BASE_URL (see .env.example) so it can point at
// a different backend in prod without code changes.

const API_BASE = import.meta.env.VITE_API_BASE_URL || "http://localhost:8100";
const API_V1 = `${API_BASE}/api/v1`;

const ACCESS_TOKEN_KEY = "jingle_access_token";
const REFRESH_TOKEN_KEY = "jingle_refresh_token";

export function getAccessToken(): string | null {
  return localStorage.getItem(ACCESS_TOKEN_KEY);
}

export function getRefreshToken(): string | null {
  return localStorage.getItem(REFRESH_TOKEN_KEY);
}

export function setTokens(accessToken: string, refreshToken: string): void {
  localStorage.setItem(ACCESS_TOKEN_KEY, accessToken);
  localStorage.setItem(REFRESH_TOKEN_KEY, refreshToken);
}

export function clearTokens(): void {
  localStorage.removeItem(ACCESS_TOKEN_KEY);
  localStorage.removeItem(REFRESH_TOKEN_KEY);
}

export class ApiError extends Error {
  status: number;
  detail: unknown;
  constructor(status: number, message: string, detail: unknown) {
    super(message);
    this.status = status;
    this.detail = detail;
  }
}

/** Human-readable message extracted from FastAPI's error shapes
 * ({"detail": "..."} or {"detail": [{"field": "...", "message": "..."}]}). */
function extractErrorMessage(detail: unknown, fallback: string): string {
  if (typeof detail === "string") return detail;
  if (Array.isArray(detail)) {
    return detail
      .map((d) => (d && typeof d === "object" && "message" in d ? String((d as { message: unknown }).message) : JSON.stringify(d)))
      .join(", ");
  }
  return fallback;
}

interface RequestOptions {
  method?: string;
  body?: unknown;
  auth?: boolean; // attach Authorization header (default true)
}

let refreshPromise: Promise<void> | null = null;

async function doRefresh(): Promise<void> {
  const refreshToken = getRefreshToken();
  if (!refreshToken) throw new ApiError(401, "not authenticated", null);
  const res = await fetch(`${API_V1}/auth/refresh`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ refresh_token: refreshToken }),
  });
  if (!res.ok) {
    clearTokens();
    throw new ApiError(res.status, "session expired", null);
  }
  const data = await res.json();
  setTokens(data.access_token, data.refresh_token);
}

/** Core request helper: JSON in/out, auto Bearer auth, auto single-retry
 * on 401 via refresh token (access tokens expire after 15 min — see
 * ACCESS_TOKEN_EXPIRE_MINUTES in the backend config). */
async function request<T>(path: string, options: RequestOptions = {}, _isRetry = false): Promise<T> {
  const { method = "GET", body, auth = true } = options;
  const headers: Record<string, string> = {};
  if (body !== undefined) headers["Content-Type"] = "application/json";
  if (auth) {
    const token = getAccessToken();
    if (token) headers["Authorization"] = `Bearer ${token}`;
  }

  const res = await fetch(`${API_V1}${path}`, {
    method,
    headers,
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });

  if (res.status === 401 && auth && !_isRetry && getRefreshToken()) {
    // Coalesce concurrent refreshes into a single request.
    refreshPromise ??= doRefresh().finally(() => {
      refreshPromise = null;
    });
    try {
      await refreshPromise;
      return request<T>(path, options, true);
    } catch {
      clearTokens();
      throw new ApiError(401, "session expired", null);
    }
  }

  if (res.status === 204) return undefined as T;

  const isJson = res.headers.get("content-type")?.includes("application/json");
  const payload = isJson ? await res.json().catch(() => null) : null;

  if (!res.ok) {
    const message = extractErrorMessage(payload?.detail, `request failed (${res.status})`);
    throw new ApiError(res.status, message, payload?.detail);
  }

  return payload as T;
}

// ---------------------------------------------------------------------------
// Types (mirroring app/schemas/*.py — kept minimal to what the UI uses)
// ---------------------------------------------------------------------------

export interface UserOut {
  id: string;
  name: string;
  email: string;
  role: string;
  is_active: boolean;
  created_at: string;
}

export interface TokenPair {
  access_token: string;
  refresh_token: string;
  token_type: string;
}

export type TargetAgeRange = "13-24" | "25-40" | "41+";
// Mirrors VOICE_GENDER_MAP in backend/app/integrations/ai/voice_engine.py —
// the prebuilt Gemini TTS voices the pipeline can pick from, tagged by
// perceived gender so the UI can filter the picker by voice_gender.
export const GEMINI_VOICES: { name: string; gender: "male" | "female" }[] = [
  { name: "Zephyr", gender: "female" }, { name: "Puck", gender: "male" },
  { name: "Charon", gender: "male" }, { name: "Kore", gender: "female" },
  { name: "Fenrir", gender: "male" }, { name: "Leda", gender: "female" },
  { name: "Orus", gender: "male" }, { name: "Aoede", gender: "female" },
  { name: "Callirrhoe", gender: "female" }, { name: "Autonoe", gender: "female" },
  { name: "Enceladus", gender: "male" }, { name: "Iapetus", gender: "male" },
  { name: "Umbriel", gender: "male" }, { name: "Algieba", gender: "male" },
  { name: "Despina", gender: "female" }, { name: "Erinome", gender: "female" },
  { name: "Algenib", gender: "male" }, { name: "Rasalgethi", gender: "male" },
  { name: "Laomedeia", gender: "female" }, { name: "Achernar", gender: "female" },
  { name: "Alnilam", gender: "male" }, { name: "Schedar", gender: "male" },
  { name: "Gacrux", gender: "female" }, { name: "Pulcherrima", gender: "female" },
  { name: "Achird", gender: "male" }, { name: "Zubenelgenubi", gender: "male" },
  { name: "Vindemiatrix", gender: "female" }, { name: "Sadachbia", gender: "male" },
  { name: "Sadaltager", gender: "male" }, { name: "Sulafat", gender: "female" },
];

export type Language = "ar-darija" | "fr" | "en";
export const LANGUAGE_OPTIONS: { value: Language; label: string }[] = [
  { value: "ar-darija", label: "Arabe (Algérien)" },
  { value: "fr", label: "Français" },
  { value: "en", label: "English" },
];

export type Platform = "tiktok" | "instagram_reels" | "spotify_ads" | "youtube" | "classic_radio" | "in_store";
export type JingleStatus = "draft" | "in_review" | "approved";

export interface JingleOut {
  id: string;
  user_id: string;
  current_step: number;
  status: JingleStatus;
  brand_name: string;
  brand_tone: string;
  brand_description: string | null;
  target_age_range: TargetAgeRange | null;
  mood_context: string | null;
  platform: Platform | null;
  sound_description: string | null;
  voice_enabled: boolean;
  voice_gender: "male" | "female" | null;
  voice_name: string | null;
  language: Language | null;
  is_archived: boolean;
  feedback_score: number | null;
  created_at: string;
  updated_at: string;
}

export interface PaginatedJingles {
  items: JingleOut[];
  total: number;
  page: number;
  page_size: number;
}

export interface GeneratedVariantOut {
  id: string;
  audio_url: string;
  lyrics: string | null;
  duration_seconds: number | null;
  provider: string;
  generation_time_ms: number | null;
  status: string;
  created_at: string;
}

export interface GenerationRequestOut {
  id: string;
  jingle_id: string;
  status: "pending" | "processing" | "completed" | "failed" | "cancelled";
  provider: string | null;
  error_message: string | null;
  progress_percent: number;
  stage_message: string | null;
  started_at: string | null;
  completed_at: string | null;
  created_at: string;
  variants: GeneratedVariantOut[];
}

export interface DashboardSummary {
  total_projects: number;
  total_generated_jingles: number;
  draft_count: number;
  in_review_count: number;
  approved_count: number;
  pending_requests: number;
  completed_requests: number;
  failed_requests: number;
  jingle_quota: number;
  jingles_used: number;
  top_platforms: { platform: string; count: number }[];
  recent_activity: GenerationRequestOut[];
}

// ---------------------------------------------------------------------------
// Auth
// ---------------------------------------------------------------------------

export async function register(name: string, email: string, password: string, confirmPassword: string) {
  return request<UserOut>("/auth/register", {
    method: "POST",
    auth: false,
    body: { name, email, password, confirm_password: confirmPassword },
  });
}

export async function login(email: string, password: string) {
  const tokens = await request<TokenPair>("/auth/login", {
    method: "POST",
    auth: false,
    body: { email, password },
  });
  setTokens(tokens.access_token, tokens.refresh_token);
  return tokens;
}

export async function logout() {
  const refreshToken = getRefreshToken();
  try {
    if (refreshToken) {
      await request("/auth/logout", { method: "POST", body: { refresh_token: refreshToken } });
    }
  } finally {
    clearTokens();
  }
}

export async function me() {
  return request<UserOut>("/auth/me");
}

export async function forgotPassword(email: string) {
  return request<{ message: string }>("/auth/forgot-password", {
    method: "POST",
    auth: false,
    body: { email },
  });
}

export async function resetPassword(email: string, token: string, newPassword: string) {
  return request<{ message: string }>("/auth/reset-password", {
    method: "POST",
    auth: false,
    body: { email, token, new_password: newPassword },
  });
}

// ---------------------------------------------------------------------------
// Jingles wizard
// ---------------------------------------------------------------------------

export async function createJingle(payload: { brand_name: string; brand_tone: string; brand_description?: string }) {
  return request<JingleOut>("/jingles", { method: "POST", body: payload });
}

export async function patchAudience(
  jingleId: string,
  payload: { target_age_range?: TargetAgeRange; mood_context?: string }
) {
  return request<JingleOut>(`/jingles/${jingleId}/audience`, { method: "PATCH", body: payload });
}

export async function patchPlatform(jingleId: string, platform: Platform) {
  return request<JingleOut>(`/jingles/${jingleId}/platform`, { method: "PATCH", body: { platform } });
}

export async function patchCreativeDirection(
  jingleId: string,
  payload: {
    sound_description?: string | null;
    voice_enabled: boolean;
    voice_gender?: "male" | "female" | null;
    voice_name?: string | null;
    language?: Language | null;
  }
) {
  return request<JingleOut>(`/jingles/${jingleId}/creative-direction`, { method: "PATCH", body: payload });
}

/** Kicks off AI generation. This call is genuinely slow (MusicGen on CPU,
 * ~1-3 minutes) — it's a blocking HTTP request on the backend, not a job you
 * poll. Callers should show a loading state for the duration of the await. */
export async function generateJingle(jingleId: string) {
  return request<GenerationRequestOut>(`/jingles/${jingleId}/generate`, { method: "POST" });
}

export async function listGenerations(jingleId: string) {
  return request<GenerationRequestOut[]>(`/jingles/${jingleId}/generations`);
}

export async function getGeneration(jingleId: string, requestId: string) {
  return request<GenerationRequestOut>(`/jingles/${jingleId}/generations/${requestId}`);
}

export async function cancelGeneration(jingleId: string, requestId: string) {
  return request<GenerationRequestOut>(`/jingles/${jingleId}/generations/${requestId}/cancel`, { method: "POST" });
}

export async function approveJingle(jingleId: string) {
  return request<JingleOut>(`/jingles/${jingleId}/approve`, { method: "POST" });
}

export interface JingleListFilters {
  search?: string;
  platform?: Platform;
  status?: JingleStatus;
  is_archived?: boolean;
  favorites_only?: boolean;
  date_from?: string;
  date_to?: string;
  min_feedback_score?: number;
  sort_by?: "created_at" | "updated_at" | "brand_name";
  sort_dir?: "asc" | "desc";
}

export async function listJingles(page = 1, pageSize = 20, filters: JingleListFilters = {}) {
  const params = new URLSearchParams({ page: String(page), page_size: String(pageSize) });
  for (const [key, value] of Object.entries(filters)) {
    if (value !== undefined && value !== null && value !== "") params.set(key, String(value));
  }
  return request<PaginatedJingles>(`/jingles?${params.toString()}`);
}

export async function getJingle(jingleId: string) {
  return request<JingleOut>(`/jingles/${jingleId}`);
}

export async function deleteJingle(jingleId: string) {
  return request<void>(`/jingles/${jingleId}`, { method: "DELETE" });
}

export async function duplicateJingle(jingleId: string) {
  return request<JingleOut>(`/jingles/${jingleId}/duplicate`, { method: "POST" });
}

export async function toggleFavorite(jingleId: string) {
  return request<{ jingle_id: string; is_favorite: boolean }>(`/jingles/${jingleId}/favorite`, { method: "POST" });
}

export async function toggleArchive(jingleId: string) {
  return request<{ jingle_id: string; is_archived: boolean }>(`/jingles/${jingleId}/archive`, { method: "POST" });
}

// ---------------------------------------------------------------------------
// Feedback
// ---------------------------------------------------------------------------

export async function createFeedback(jingleId: string, variantId: string, rating: number, comment?: string) {
  return request(`/jingles/${jingleId}/variants/${variantId}/feedback`, {
    method: "POST",
    body: { rating, comment },
  });
}

// ---------------------------------------------------------------------------
// History & dashboard
// ---------------------------------------------------------------------------

export async function historyGenerations() {
  return request<GenerationRequestOut[]>("/history/generations");
}

export async function recentActivity() {
  return request<GenerationRequestOut[]>("/history/recent-activity");
}

export async function favoriteJingles() {
  return request<JingleOut[]>("/history/favorites");
}

export async function archivedJingles() {
  return request<JingleOut[]>("/history/archived");
}

export async function dashboardSummary() {
  return request<DashboardSummary>("/dashboard/summary");
}
