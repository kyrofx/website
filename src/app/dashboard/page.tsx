"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

interface User {
  sub: string;
  name?: string;
  preferred_username?: string;
  email?: string;
  picture?: string;
}

interface App {
  client_id: string;
  name: string;
  description: string | null;
  logo_uri: string | null;
  url: string | null;
}

export default function Dashboard() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [apps, setApps] = useState<App[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const meRes = await fetch("/api/auth/me");
        if (!meRes.ok) {
          router.push("/api/auth/login");
          return;
        }
        const meData = await meRes.json();
        setUser(meData.user);

        const appsRes = await fetch("/api/apps");
        if (appsRes.ok) {
          const appsData = await appsRes.json();
          setApps(appsData.apps || []);
        }
      } catch {
        router.push("/api/auth/login");
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [router]);

  if (loading) {
    return (
      <div className="min-h-screen bg-bg text-fg flex items-center justify-center">
        <p className="text-label text-muted">Loading...</p>
      </div>
    );
  }

  if (!user) return null;

  const authServer = process.env.NEXT_PUBLIC_AUTH_SERVER_URL || "https://auth.kyro.dog";

  return (
    <div className="min-h-screen bg-bg text-fg">
      <div className="noise" />

      {/* Nav */}
      <nav className="flex items-center justify-between px-6 py-4 md:px-12 border-b border-border">
        <Link href="/" className="text-label">
          Kyro
        </Link>
        <div className="flex items-center gap-8">
          <div className="flex items-center gap-3">
            {user.picture && (
              <img
                src={`${authServer}${user.picture}`}
                alt=""
                className="w-6 h-6 rounded-full"
                onError={(e) => {
                  (e.target as HTMLImageElement).style.display = "none";
                }}
              />
            )}
            <span className="text-label">
              {user.preferred_username || user.name || user.email}
            </span>
          </div>
          <a
            href="/api/auth/logout"
            className="text-label text-muted hover:text-fg transition-colors"
          >
            Logout
          </a>
        </div>
      </nav>

      {/* Content */}
      <div className="px-6 md:px-12 lg:px-24 py-20 md:py-32">
        <div className="mb-16 md:mb-24">
          <p className="text-label text-muted mb-4">KyroNet</p>
          <h1 className="text-display">Applications</h1>
        </div>

        {apps.length === 0 ? (
          <p className="text-body text-muted">No applications available.</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-px bg-border">
            {apps.map((app) => (
              <a
                key={app.client_id}
                href={app.url || "#"}
                target={app.url ? "_blank" : undefined}
                rel={app.url ? "noopener noreferrer" : undefined}
                className="group bg-bg p-10 md:p-12 hover:bg-accent/5 transition-colors"
              >
                <div className="flex items-start justify-between mb-8">
                  {app.logo_uri ? (
                    <img
                      src={app.logo_uri.startsWith("http") ? app.logo_uri : `${authServer}${app.logo_uri}`}
                      alt=""
                      className="w-10 h-10 rounded"
                    />
                  ) : (
                    <div className="w-10 h-10 border border-border rounded flex items-center justify-center">
                      <span className="text-label text-muted">
                        {app.name.charAt(0).toUpperCase()}
                      </span>
                    </div>
                  )}
                  {app.url && (
                    <span className="text-accent opacity-0 group-hover:opacity-100 transition-opacity">
                      &nearr;
                    </span>
                  )}
                </div>

                <h3 className="text-title mb-2 group-hover:text-accent transition-colors">
                  {app.name}
                </h3>
                {app.description && (
                  <p className="text-body text-muted">{app.description}</p>
                )}
              </a>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
