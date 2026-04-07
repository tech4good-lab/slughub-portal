import Link from "next/link";
import Image from "next/image";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import type { Club } from "@/lib/types";
import PendingBadge from "@/app/components/PendingBadge";
import DirectoryClient from "@/app/components/DirectoryClient";
import DecorativeBubbles from "@/app/components/DecorativeBubbles";

export default async function HomePage() {
  const session = await getServerSession(authOptions);
  const isAdmin = (session as any)?.role === "admin";

  const res = await fetch(`${process.env.NEXTAUTH_URL}/api/clubs`, {
    cache: "no-store",
  });

  if (!res.ok) {
    return (
      <main className="container" style={{ position: "relative", zIndex: 1 }}>
        <DecorativeBubbles />
        <Header session={session} isAdmin={isAdmin} />
        <div className="card">
          <p className="small">Failed to load clubs.</p>
        </div>
      </main>
    );
  }

  const data = await res.json();
  const raw = (data.clubs ?? []) as Club[];
  const clubs = raw.filter((c) => c.recordId && c.name);

  return (
    <main className="container directoryHome" style={{ zIndex: 1 }}>
      <DecorativeBubbles />
      <Header session={session} isAdmin={isAdmin} />

      <DirectoryClient clubs={clubs} session={session} />
    </main>
  );
}

function Header({ session, isAdmin }: { session: any; isAdmin: boolean }) {
  return (
    <header
      style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: 32,
        marginTop: 16,
        flexWrap: "wrap",
        gap: 16,
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
        <Link
          className="btn"
          href="https://chat.slughub.cc/"
          target="_blank"
          rel="noopener noreferrer"
          title="Navigate to SlugHub."
          style={{
            display: "flex",
            alignItems: "center",
            gap: "2px",
            backgroundColor: "#b0dbf6",
            height: "45px",
            padding: "8px",
            borderRadius: "16px",
            overflow: "hidden",
          }}
        >
          <Image
            src="/dashboard-icon.png"
            alt="SlugPath Logo"
            width={38}
            height={38}
            style={{ objectFit: "contain" }}
          />
          <span
            style={{
              marginLeft: "4px",
              fontSize: "1.1rem",
              fontWeight: "600",
            }}
          >
            SlugHub
          </span>
        </Link>

        <h1
          style={{
            margin: 0,
            color: "black",
            fontSize: "clamp(28px, 5vw, 40px)",
          }}
        >
          Community Directory
        </h1>
      </div>

      <nav className="row">
        {session ? (
          <>
            {isAdmin && (
              <div
                className="tooltip-container"
                style={{
                  position: "relative",
                  display: "flex",
                  alignItems: "center",
                }}
              >
                <Link
                  className="btn"
                  href="/admin/review"
                  style={{ position: "relative" }}
                >
                  Community Approvals
                  <PendingBadge />
                </Link>
                <Link className="btn" href="/admin/access">
                  Access Requests
                </Link>
              </div>
            )}
          </>
        ) : (
          <>
            <Link className="btn" href="/login">
              Club Lead Login
            </Link>
          </>
        )}
      </nav>
    </header>
  );
}
