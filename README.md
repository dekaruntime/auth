# `@deka/auth`

Session helper for `deka serve`. Call it inside the handler with the request.
There is no locals bag and no middleware.

The default cookie name is `deka_sid` — the same name the framework binds as
island AAD. `signIn` writes that cookie; `auth` / `requireUser` / `requireRole`
read it.

```ds
import { auth, requireUser, requireRole, signIn, signOut } from "auth"

export fn GET(request) {
  return match (requireUser(request, secret)) {
    Err(_) => { status: 401, body: "unauthenticated" },
    Ok(session) => { status: 200, body: session.sub }
  }
}

export fn admin(request) {
  return match (requireRole(request, secret, "admin")) {
    Err(e) => { status: 403, body: e },
    Ok(session) => { status: 200, body: session.sub }
  }
}
```

`auth(request, secret)` is `None` when the cookie is missing, invalid, or expired.
`requireUser` is the same check as a `Result` (`Err("unauthenticated")`).
`requireRole` is `Err("unauthorized")` when a session exists but the role does not.

`secret` is bytes, **at least 32 bytes of uniform entropy** — not a passphrase.
Shorter values are rejected. The AES-GCM key is HKDF-Extract
(`HMAC-SHA256(salt="deka.auth.session.v1", ikm=secret)`). Claims are not
readable from the cookie value. Parse and Set-Cookie come from `@deka/cookies`.

`signIn` emits `SameSite=Lax`. Lax does **not** stop CSRF on GET: the cookie is
sent on top-level GET navigations, so a state-changing GET handler is CSRF-able
from a link. Mutating routes should be POST (or use `SameSite=Strict`).

v1 is the sealed session cookie. Password verify, OAuth, and PKCE are not in
this package yet.
