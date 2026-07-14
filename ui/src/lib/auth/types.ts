// Auth domain types. Kept intentionally close to what a real backend
// (e.g. better-auth) would return, so consumers don't change on migration.

export type AuthUser = {
  id: string;
  email: string;
  name: string;
  image?: string | null;
};

export type Session = {
  user: AuthUser;
  /**
   * Only used by the temporary client-only implementation. Once a backend
   * is added, the session is driven by an httpOnly cookie and this field
   * disappears — consumers never read it, so nothing breaks.
   */
  accessToken?: string;
  /** Epoch ms when the client-only session should be treated as expired. */
  expiresAt?: number;
};

export type Provider = "google";
