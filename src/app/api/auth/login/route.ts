import { NextResponse } from "next/server";
import { generatePKCE, getAuthorizationUrl } from "@/lib/auth";
import crypto from "crypto";
import { cookies } from "next/headers";

export async function GET() {
  const { verifier, challenge } = generatePKCE();
  const state = crypto.randomBytes(16).toString("hex");

  const cookieStore = await cookies();
  cookieStore.set("pkce_verifier", verifier, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 600,
  });
  cookieStore.set("oauth_state", state, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 600,
  });

  return NextResponse.redirect(getAuthorizationUrl(state, challenge));
}
