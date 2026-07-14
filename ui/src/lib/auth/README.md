# Auth

A deliberately thin auth layer. The public API (`authClient`) is shaped like
[better-auth](https://www.better-auth.com/)'s React client so that adding a real
backend later is a swap of internals, **not** a rewrite of every screen.

## Files

| File             | Role                                                                    |
| ---------------- | ----------------------------------------------------------------------- |
| `auth-client.ts` | The only module the app imports. Public API + client-only session store. |
| `google.ts`      | Google Identity Services helper (the temporary, no-backend mechanism).  |
| `types.ts`       | `AuthUser`, `Session`, `Provider`.                                      |

## Public API (stable)

```ts
authClient.useSession();                       // { data: Session | null, isPending }
authClient.signIn.social({ provider: "google" }); // Promise<{ data, error }>
authClient.signIn.email();                     // stub until backend exists
authClient.signOut();                          // Promise<{ data, error }>
```

## How it works today (no backend)

`signIn.social` runs Google's OAuth2 token flow in the browser, fetches the
profile from Google's userinfo endpoint, and stores the session in
`localStorage`. This is enough to know **who** the user is, but the token is not
verified server-side — do not gate sensitive data on it. It's an MVP identity
layer.

## Setup

1. Create an OAuth Client ID (Web application) in the
   [Google Cloud Console](https://console.cloud.google.com/apis/credentials).
2. Add `http://localhost:3000` (and your prod origin) to **Authorized JavaScript
   origins**.
3. `cp .env.example .env` and set `VITE_GOOGLE_CLIENT_ID`.
4. Restart `npm run dev`.

## Migrating to a real backend (better-auth)

Because consumers only touch `authClient`, migration is contained:

1. `npm i better-auth`
2. Add the server handler (a TanStack Start server route mounting better-auth)
   and configure the Google provider with **Client ID + Client Secret** (secret
   stays server-side only).
3. Replace the body of `auth-client.ts` with:
   ```ts
   import { createAuthClient } from "better-auth/react";
   export const authClient = createAuthClient({ baseURL: "/api/auth" });
   ```
4. Delete `google.ts` and the `localStorage` store.

`useSession`, `signIn.social`, `signIn.email`, and `signOut` keep the same
signatures, so `login.tsx` and `TopBar.tsx` need no changes.
