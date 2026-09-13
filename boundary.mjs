export function now_seconds() {
  return Math.floor(Date.now() / 1000);
}

export function stringify_session(user, now, maxAge) {
  var session = Object.assign({}, user);
  if (session.sub == null || String(session.sub) === "") throw new Error("missing sub");
  if (session.roles == null) session.roles = [];
  session.iat = now;
  session.exp = now + maxAge;
  return JSON.stringify(session);
}

export function parse_session_json(json, now) {
  var session = JSON.parse(json);
  if (!session || typeof session !== "object" || Array.isArray(session)) throw new Error("missing sub");
  if (session.sub == null || String(session.sub) === "") throw new Error("missing sub");
  if (session.exp != null && Number(session.exp) < now) throw new Error("expired");
  return {
    sub: String(session.sub),
    roles: Array.isArray(session.roles) ? session.roles : undefined
  };
}
