/// <reference types="vite/client" />

interface ImportMetaEnv {
  /** Google OAuth Client ID used by the client-side sign-in flow. */
  readonly VITE_GOOGLE_CLIENT_ID?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
