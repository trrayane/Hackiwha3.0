import { BrowserRouter, Routes, Route, useNavigate, Navigate } from "react-router-dom";
import Dashboard from "./pages/dashbooard";
import Login from "./pages/Login";
import Register from "./pages/Register";
import JingleLibrary from "./pages/JingleLibrary";
import NewJingleStep1 from "./pages/NewJingleStep1";
import NewJingleStep2 from "./pages/NewJingleStep2";
import NewJingleStep3 from "./pages/NewJingleStep3";
import NewJingleStep4 from "./pages/NewJingleStep4";
import GeneratedJingle from "./pages/GeneratedJingle";
import JingleChangeRequest from "./pages/JingleChangeRequest";
import Settings from "./pages/Settings";
import LandingPage from "./pages/LandingPage";
import ExamplesPage from "./pages/Exemple";
import { AuthProvider, useAuth } from "./lib/AuthContext";
import { JingleDraftProvider, useJingleDraft } from "./lib/JingleDraftContext";
import * as api from "./lib/api";

/** Redirects to /login if there's no authenticated user. Wrap any page that
 * needs a logged-in user (everything except landing/login/register). */
function RequireAuth({ children }: { children: React.ReactElement }) {
  const { isAuthenticated, isLoading } = useAuth();
  if (isLoading) return null;
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  return children;
}

function AppRoutes() {
  const navigate = useNavigate();
  const { login, register } = useAuth();
  const { draft, patchDraft, resetDraft, latestVariant } = useJingleDraft();

  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/examples" element={<ExamplesPage />} />

      <Route
        path="/dashboard"
        element={
          <RequireAuth>
            <Dashboard />
          </RequireAuth>
        }
      />
      <Route
        path="/Library"
        element={
          <RequireAuth>
            <JingleLibrary />
          </RequireAuth>
        }
      />
      <Route
        path="/Settings"
        element={
          <RequireAuth>
            <Settings />
          </RequireAuth>
        }
      />

      <Route
        path="/NewJingle1"
        element={
          <RequireAuth>
            <NewJingleStep1
              onNext={async (data) => {
                const jingle = await api.createJingle({
                  brand_name: data.brandName,
                  brand_tone: data.brandTone,
                  brand_description: data.brandDescription || undefined,
                });
                patchDraft({
                  jingleId: jingle.id,
                  brandName: data.brandName,
                  brandTone: data.brandTone,
                  brandDescription: data.brandDescription,
                });
                navigate("/NewJingle2");
              }}
            />
          </RequireAuth>
        }
      />
      <Route
        path="/NewJingle2"
        element={
          <RequireAuth>
            <NewJingleStep2
              onNext={async (data) => {
                if (!draft.jingleId) return navigate("/NewJingle1");
                await api.patchAudience(draft.jingleId, {
                  target_age_range: data.targetAgeRange,
                  mood_context: data.moodContext || undefined,
                });
                patchDraft({ targetAgeRange: data.targetAgeRange, moodContext: data.moodContext });
                navigate("/NewJingle3");
              }}
              onBack={() => navigate("/NewJingle1")}
            />
          </RequireAuth>
        }
      />
      <Route
        path="/NewJingle3"
        element={
          <RequireAuth>
            <NewJingleStep3
              onNext={async (platform) => {
                if (!draft.jingleId) return navigate("/NewJingle1");
                await api.patchPlatform(draft.jingleId, platform);
                patchDraft({ platform });
                navigate("/NewJingle4");
              }}
              onBack={() => navigate("/NewJingle2")}
            />
          </RequireAuth>
        }
      />
      <Route
        path="/NewJingle4"
        element={
          <RequireAuth>
            <NewJingleStep4
              onBack={() => navigate("/NewJingle3")}
              onSubmit={async (data) => {
                if (!draft.jingleId) throw new Error("no jingle in progress");
                await api.patchCreativeDirection(draft.jingleId, {
                  sound_description: data.soundDescription || null,
                  voice_enabled: data.voiceEnabled,
                  voice_gender: data.voiceGender,
                  voice_name: data.voiceName,
                  language: data.language,
                });
                patchDraft({ soundDescription: data.soundDescription, voiceEnabled: data.voiceEnabled });
                const generation = await api.generateJingle(draft.jingleId);
                if (generation.status === "failed") {
                  throw new Error(generation.error_message || "jingle generation failed");
                }
                patchDraft({ lastGeneration: generation });
              }}
              onComplete={() => navigate("/GeneratedJingle")}
            />
          </RequireAuth>
        }
      />

      <Route
        path="/GeneratedJingle"
        element={
          <RequireAuth>
            <GeneratedJingle
              jingleName={draft.brandName}
              platform={draft.platform}
              variant={latestVariant}
              onBack={() => navigate("/NewJingle4")}
              onRequestChanges={() => navigate("/changeRequest")}
              onApprove={async () => {
                if (draft.jingleId) await api.approveJingle(draft.jingleId);
                resetDraft();
                navigate("/dashboard");
              }}
              onRate={async (rating) => {
                patchDraft({ lastRating: rating });
                if (draft.jingleId && latestVariant) {
                  await api.createFeedback(draft.jingleId, latestVariant.id, rating);
                }
              }}
            />
          </RequireAuth>
        }
      />

      <Route
        path="/changeRequest"
        element={
          <RequireAuth>
            <JingleChangeRequest
              jingleName={draft.brandName}
              rating={draft.lastRating}
              onBack={() => navigate("/GeneratedJingle")}
              onCancel={() => navigate("/dashboard")}
              onRegenerate={async (feedback) => {
                if (draft.jingleId && latestVariant) {
                  await api.createFeedback(draft.jingleId, latestVariant.id, draft.lastRating ?? 3, feedback || undefined);
                }
                navigate("/NewJingle4");
              }}
            />
          </RequireAuth>
        }
      />

      <Route
        path="/login"
        element={
          <Login
            onSubmit={async (data) => {
              await login(data.email, data.password);
              navigate("/dashboard");
            }}
            onSwitchToRegister={() => navigate("/register")}
          />
        }
      />
      <Route
        path="/register"
        element={
          <Register
            onSubmit={async (data) => {
              await register(data.name, data.email, data.password, data.confirmPassword);
              navigate("/dashboard");
            }}
            onSwitchToLogin={() => navigate("/login")}
          />
        }
      />
    </Routes>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <JingleDraftProvider>
          <AppRoutes />
        </JingleDraftProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}
