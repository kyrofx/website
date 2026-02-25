import { NextResponse } from "next/server";
import { getLogoutUrl } from "@/lib/auth";
import { cookies } from "next/headers";

export async function GET() {
  const cookieStore = await cookies();
  const idToken = cookieStore.get("id_token")?.value;

  const response = idToken
    ? NextResponse.redirect(getLogoutUrl(idToken))
    : NextResponse.redirect(process.env.NEXT_PUBLIC_BASE_URL || "/");

  response.cookies.delete("access_token");
  response.cookies.delete("id_token");
  response.cookies.delete("refresh_token");

  return response;
}
