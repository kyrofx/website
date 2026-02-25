import { NextResponse } from "next/server";
import { getAuthServerUrl, getApiKey } from "@/lib/auth";
import { cookies } from "next/headers";

export async function GET() {
  const cookieStore = await cookies();
  const accessToken = cookieStore.get("access_token")?.value;

  if (!accessToken) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const res = await fetch(`${getAuthServerUrl()}/api/v1/clients`, {
      headers: {
        Authorization: `Bearer ${getApiKey()}`,
      },
    });

    if (!res.ok) {
      return NextResponse.json({ error: "Failed to fetch apps" }, { status: res.status });
    }

    const data = await res.json();
    const clients = Array.isArray(data) ? data : data.clients || [];

    const apps = clients
      .filter((c: { is_disabled: boolean }) => !c.is_disabled)
      .map((c: { client_id: string; name: string; description: string | null; logo_uri: string | null; redirect_uris: string[] }) => ({
        client_id: c.client_id,
        name: c.name,
        description: c.description,
        logo_uri: c.logo_uri,
        url: c.redirect_uris?.[0]?.replace(/\/callback$/, "") || null,
      }));

    return NextResponse.json({ apps });
  } catch {
    return NextResponse.json({ error: "Failed to fetch apps" }, { status: 500 });
  }
}
