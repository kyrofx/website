import { NextRequest, NextResponse } from "next/server";
import { exchangeCode, getUserInfo } from "@/lib/auth";
import { cookies } from "next/headers";

export async function GET(req: NextRequest) {
  const code = req.nextUrl.searchParams.get("code");
  const state = req.nextUrl.searchParams.get("state");
  const error = req.nextUrl.searchParams.get("error");

  if (error) {
    const desc = req.nextUrl.searchParams.get("error_description") || error;
    return NextResponse.redirect(new URL(`/?auth_error=${encodeURIComponent(desc)}`, req.url));
  }

  if (!code || !state) {
    return NextResponse.redirect(new URL("/?auth_error=missing_params", req.url));
  }

  const cookieStore = await cookies();
  const savedState = cookieStore.get("oauth_state")?.value;
  const verifier = cookieStore.get("pkce_verifier")?.value;

  if (state !== savedState) {
    return NextResponse.redirect(new URL("/?auth_error=state_mismatch", req.url));
  }

  if (!verifier) {
    return NextResponse.redirect(new URL("/?auth_error=missing_verifier", req.url));
  }

  const tokens = await exchangeCode(code, verifier);

  if (tokens.error) {
    return NextResponse.redirect(new URL(`/?auth_error=${encodeURIComponent(tokens.error)}`, req.url));
  }

  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || new URL("/", req.url).toString();
  const response = NextResponse.redirect(new URL("/dashboard", baseUrl));

  response.cookies.set("access_token", tokens.access_token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 3600,
    path: "/",
  });

  if (tokens.id_token) {
    response.cookies.set("id_token", tokens.id_token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 3600,
      path: "/",
    });
  }

  if (tokens.refresh_token) {
    response.cookies.set("refresh_token", tokens.refresh_token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 14,
      path: "/",
    });
  }

  response.cookies.delete("pkce_verifier");
  response.cookies.delete("oauth_state");

  return response;
}
