// The ONLY module the rest of the app imports for auth.
//
// Its public surface mirrors better-auth's React client on purpose:
//   authClient.useSession()          -> { data, isPending }
//   authClient.signIn.social({...})  -> Promise<{ data, error }>
//   authClient.signIn.email({...})   -> Promise<{ data, error }>
//   authClient.signOut()             -> Promise<{ data, error }>
//
// MIGRATION TO A BACKEND (better-auth):
//   1. npm i better-auth
//   2. Add the server handler (auth route) + createAuthClient() call.
//   3. Replace the body of this file with:
//        export const authClient = createAuthClient({ baseURL: ... });
//      Delete google.ts and the localStorage store below.
//   Every component keeps calling the same methods — no consumer changes.

import { useEffect, useState, useSyncExternalStore } from "react";
import { requestGoogleProfile } from "./google";
import type { Provider, Session } from "./types";

const STORAGE_KEY = "voya.session";

// --- module-level store (usable inside or outside React, like better-auth) ---

let session: Session | null = null;
let hydrated = false;
const listeners = new Set<() => void>();

function emit() {
  for (const l of listeners) l();
}

function persist() {
  if (typeof window === "undefined") return;
  if (session) window.localStorage.setItem(STORAGE_KEY, JSON.stringify(session));
  else window.localStorage.removeItem(STORAGE_KEY);
}

function setSession(next: Session | null) {
  session = next;
  persist();
  emit();
}

function hydrateOnce() {
  if (hydrated || typeof window === "undefined") return;
  hydrated = true;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const stored = JSON.parse(raw) as Session;
      if (!stored.expiresAt || stored.expiresAt > Date.now()) {
        session = stored;
      } else {
        window.localStorage.removeItem(STORAGE_KEY);
      }
    }
  } catch {
    // ignore corrupt storage
  }
  emit();
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

// --- React hook -------------------------------------------------------------

function useSession(): { data: Session | null; isPending: boolean } {
  // Server + first client render both return null -> no hydration mismatch.
  const data = useSyncExternalStore(
    subscribe,
    () => session,
    () => null,
  );
  const [isPending, setIsPending] = useState(!hydrated);
  useEffect(() => {
    hydrateOnce();
    setIsPending(false);
  }, []);
  return { data, isPending };
}

// --- public API -------------------------------------------------------------

type Result<T> = { data: T | null; error: { message: string } | null };

export const authClient = {
  useSession,
  getSession: () => session,

  signIn: {
    async social({ provider }: { provider: Provider }): Promise<Result<Session>> {
      if (provider !== "google") {
        return { data: null, error: { message: `Nieobsługiwany dostawca: ${provider}` } };
      }
      try {
        const { profile, accessToken, expiresIn } = await requestGoogleProfile();
        const next: Session = {
          user: {
            id: profile.sub,
            email: profile.email,
            name: profile.name,
            image: profile.picture ?? null,
          },
          accessToken,
          expiresAt: Date.now() + expiresIn * 1000,
        };
        setSession(next);
        return { data: next, error: null };
      } catch (err) {
        return { data: null, error: { message: (err as Error).message } };
      }
    },

    async email(): Promise<Result<Session>> {
      // Intentionally not supported until a backend exists.
      return {
        data: null,
        error: {
          message: "Logowanie e-mailem będzie dostępne po podłączeniu backendu. Użyj Google.",
        },
      };
    },
  },

  async signOut(): Promise<Result<{ success: true }>> {
    setSession(null);
    return { data: { success: true }, error: null };
  },
};

export type { Session, AuthUser } from "./types";
