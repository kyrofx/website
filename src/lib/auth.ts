import crypto from "crypto";

const AUTH_SERVER = process.env.AUTH_SERVER_URL!;
const CLIENT_ID = process.env.CLIENT_ID!;
const CLIENT_SECRET = process.env.CLIENT_SECRET!;
const REDIRECT_URI = process.env.REDIRECT_URI!;

export function generatePKCE() {
  const verifier = crypto.randomBytes(32).toString("base64url");
  const challenge = crypto
    .createHash("sha256")
    .update(verifier)
    .digest("base64url");
  return { verifier, challenge };
}

export function getAuthorizationUrl(state: string, codeChallenge: string) {
  const params = new URLSearchParams({
    response_type: "code",
    client_id: CLIENT_ID,
    redirect_uri: REDIRECT_URI,
    scope: "openid profile email",
    state,
    code_challenge: codeChallenge,
    code_challenge_method: "S256",
  });
  return `${AUTH_SERVER}/auth?${params}`;
}

export async function exchangeCode(code: string, codeVerifier: string) {
  const res = await fetch(`${AUTH_SERVER}/token`, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      Authorization: `Basic ${Buffer.from(`${CLIENT_ID}:${CLIENT_SECRET}`).toString("base64")}`,
    },
    body: new URLSearchParams({
      grant_type: "authorization_code",
      code,
      redirect_uri: REDIRECT_URI,
      code_verifier: codeVerifier,
    }),
  });
  return res.json();
}

export async function getUserInfo(accessToken: string) {
  const res = await fetch(`${AUTH_SERVER}/userinfo`, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  return res.json();
}

export function getLogoutUrl(idToken: string) {
  const params = new URLSearchParams({
    id_token_hint: idToken,
    post_logout_redirect_uri: process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3007",
  });
  return `${AUTH_SERVER}/session/end?${params}`;
}

export function getAuthServerUrl() {
  return AUTH_SERVER;
}

export function getApiKey() {
  return process.env.AEGIS_API_KEY!;
}
