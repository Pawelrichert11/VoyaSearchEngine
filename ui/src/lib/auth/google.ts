// Google Identity Services (GIS) helper — the CLIENT-ONLY sign-in mechanism.
//
// This is the piece that goes away when a backend lands. With better-auth,
// sign-in becomes a server redirect and this file is deleted; only the
// internals of auth-client.ts change, not its public API.

const GIS_SRC = "https://accounts.google.com/gsi/client";

export const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID as string | undefined;

export type GoogleProfile = {
  sub: string;
  email: string;
  name: string;
  picture?: string;
};

type TokenResponse = {
  access_token: string;
  expires_in: number;
  error?: string;
};

type TokenClient = { requestAccessToken: () => void };

declare global {
  interface Window {
    google?: {
      accounts: {
        oauth2: {
          initTokenClient: (config: {
            client_id: string;
            scope: string;
            callback: (resp: TokenResponse) => void;
            error_callback?: (err: { type?: string; message?: string }) => void;
          }) => TokenClient;
        };
      };
    };
  }
}

let gisPromise: Promise<void> | undefined;

function loadGis(): Promise<void> {
  if (typeof window === "undefined") {
    return Promise.reject(new Error("Google Identity Services can only load in the browser"));
  }
  if (window.google?.accounts?.oauth2) return Promise.resolve();
  if (!gisPromise) {
    gisPromise = new Promise<void>((resolve, reject) => {
      const existing = document.querySelector<HTMLScriptElement>(`script[src="${GIS_SRC}"]`);
      const onError = () => reject(new Error("Nie udało się załadować Google Identity Services"));
      if (existing) {
        existing.addEventListener("load", () => resolve());
        existing.addEventListener("error", onError);
        return;
      }
      const script = document.createElement("script");
      script.src = GIS_SRC;
      script.async = true;
      script.defer = true;
      script.onload = () => resolve();
      script.onerror = onError;
      document.head.appendChild(script);
    });
  }
  return gisPromise;
}

/**
 * Opens the Google account picker and resolves with the user's profile.
 * Uses the OAuth2 implicit (token) flow so it works with a custom-styled
 * button and no backend.
 */
export async function requestGoogleProfile(): Promise<{
  profile: GoogleProfile;
  accessToken: string;
  expiresIn: number;
}> {
  if (!GOOGLE_CLIENT_ID) {
    throw new Error(
      "Brak VITE_GOOGLE_CLIENT_ID. Dodaj Client ID z Google Cloud Console do pliku ui/.env i zrestartuj serwer dev.",
    );
  }
  await loadGis();

  const token = await new Promise<TokenResponse>((resolve, reject) => {
    const client = window.google!.accounts.oauth2.initTokenClient({
      client_id: GOOGLE_CLIENT_ID,
      scope: "openid email profile",
      callback: (resp) => {
        if (resp.error) reject(new Error(resp.error));
        else resolve(resp);
      },
      error_callback: (err) =>
        reject(new Error(err?.message ?? "Logowanie przez Google zostało przerwane")),
    });
    client.requestAccessToken();
  });

  const res = await fetch("https://www.googleapis.com/oauth2/v3/userinfo", {
    headers: { Authorization: `Bearer ${token.access_token}` },
  });
  if (!res.ok) throw new Error("Nie udało się pobrać profilu z Google");

  const profile = (await res.json()) as GoogleProfile;
  return { profile, accessToken: token.access_token, expiresIn: token.expires_in };
}
