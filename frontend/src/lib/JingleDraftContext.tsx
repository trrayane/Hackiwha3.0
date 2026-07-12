import React, { createContext, useContext, useState } from "react";
import type { GeneratedVariantOut, GenerationRequestOut, Platform, TargetAgeRange } from "./api";

/** Accumulates the wizard's state across steps 1-4 (each step only knows its
 * own fields in the UI, but the backend needs the jingle_id created in step 1
 * threaded through every subsequent PATCH/generate call), plus the result of
 * the last generation so GeneratedJingle can render it without re-fetching. */
interface JingleDraft {
  jingleId: string | null;
  brandName: string;
  brandTone: string;
  brandDescription: string;
  targetAgeRange: TargetAgeRange | null;
  moodContext: string;
  platform: Platform | null;
  soundDescription: string;
  voiceEnabled: boolean;
  lastGeneration: GenerationRequestOut | null;
  lastRating: number | null;
}

const emptyDraft: JingleDraft = {
  jingleId: null,
  brandName: "",
  brandTone: "",
  brandDescription: "",
  targetAgeRange: null,
  moodContext: "",
  platform: null,
  soundDescription: "",
  voiceEnabled: true,
  lastGeneration: null,
  lastRating: null,
};

interface JingleDraftContextValue {
  draft: JingleDraft;
  patchDraft: (patch: Partial<JingleDraft>) => void;
  resetDraft: () => void;
  latestVariant: GeneratedVariantOut | null;
}

const JingleDraftContext = createContext<JingleDraftContextValue | undefined>(undefined);

export function JingleDraftProvider({ children }: { children: React.ReactNode }) {
  const [draft, setDraft] = useState<JingleDraft>(emptyDraft);

  const patchDraft = (patch: Partial<JingleDraft>) => setDraft((prev) => ({ ...prev, ...patch }));
  const resetDraft = () => setDraft(emptyDraft);

  const latestVariant = draft.lastGeneration?.variants?.[0] ?? null;

  return (
    <JingleDraftContext.Provider value={{ draft, patchDraft, resetDraft, latestVariant }}>
      {children}
    </JingleDraftContext.Provider>
  );
}

export function useJingleDraft(): JingleDraftContextValue {
  const ctx = useContext(JingleDraftContext);
  if (!ctx) throw new Error("useJingleDraft must be used within a JingleDraftProvider");
  return ctx;
}
