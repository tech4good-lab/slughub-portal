import Link from "next/link";
import type { Club } from "@/lib/types";
import RequestAccess from "./request-access";

export default async function ClubDetailPage({
  params
}: {
  params: Promise<{ clubId: string }>
}) {
  const { clubId } = await params;

  const res = await fetch(`${process.env.NEXTAUTH_URL}/api/clubs/${clubId}`, {
    cache: "no-store"
  });

  if (!res.ok) {
    return (
      <main className="container">
        <Link className="btn" href="/directory" style={{ marginBottom: 24, display: "inline-flex" }}>
          ← Back to Directory
        </Link>
        <div className="card" style={{ marginTop: 20, textAlign: "center", padding: 60 }}>
          <h2 style={{ marginBottom: 8 }}>Club not found</h2>
          <p className="small">This club may have been removed or doesn't exist.</p>
        </div>
      </main>
    );
  }

  const data = await res.json();
  const club = data.club as Club;

  return (
    <main className="container">
      <Link className="btn" href="/directory" style={{ marginBottom: 24, display: "inline-flex" }}>
        ← Back to Directory
      </Link>

      {/* Hero section - cleaner layout */}
      <div className="card" style={{ marginTop: 20 }}>
        <h1 style={{ marginBottom: 16, fontSize: 36 }}>{club.name}</h1>
        <p
          style={{
            fontSize: 16,
            lineHeight: 1.7,
            color: "rgba(255,255,255,0.85)",
            marginBottom: 24,
            paddingBottom: 24,
            borderBottom: "1px solid rgba(255,255,255,0.1)"
          }}
        >
          {club.description || "No description provided."}
        </p>

        {/* Contact & Links - all in one card */}
        <div className="grid" style={{ marginTop: 0 }}>
          <div>
            <div
              className="small"
              style={{
                fontWeight: 700,
                textTransform: "uppercase",
                letterSpacing: "0.05em",
                marginBottom: 8,
                color: "rgba(251,191,36,0.8)"
              }}
            >
              Point of Contact
            </div>
            <div style={{ fontWeight: 600, marginBottom: 4 }}>{club.contactName || "—"}</div>
            <a
              href={club.contactEmail ? `mailto:${club.contactEmail}` : "#"}
              style={{
                fontSize: 14,
                color: "rgba(251,191,36,0.9)",
                textDecoration: "none"
              }}
            >
              {club.contactEmail || "—"}
            </a>
          </div>

          <div>
            <div
              className="small"
              style={{
                fontWeight: 700,
                textTransform: "uppercase",
                letterSpacing: "0.05em",
                marginBottom: 8,
                color: "rgba(251,191,36,0.8)"
              }}
            >
              Calendar
            </div>
            {club.calendarUrl ? (
              <a
                className="btn btnPrimary"
                href={club.calendarUrl}
                target="_blank"
                rel="noreferrer"
                style={{ marginTop: 8, display: "inline-flex" }}
              >
                View Calendar
              </a>
            ) : (
              <span className="small">No calendar available</span>
            )}
          </div>

          <div>
            <div
              className="small"
              style={{
                fontWeight: 700,
                textTransform: "uppercase",
                letterSpacing: "0.05em",
                marginBottom: 8,
                color: "rgba(251,191,36,0.8)"
              }}
            >
              Discord
            </div>
            {club.discordUrl ? (
              <a
                className="btn btnPrimary"
                href={club.discordUrl}
                target="_blank"
                rel="noreferrer"
                style={{ marginTop: 8, display: "inline-flex" }}
              >
                Join Server
              </a>
            ) : (
              <span className="small">No Discord server</span>
            )}
          </div>

          <div>
            <div
              className="small"
              style={{
                fontWeight: 700,
                textTransform: "uppercase",
                letterSpacing: "0.05em",
                marginBottom: 8,
                color: "rgba(251,191,36,0.8)"
              }}
            >
              Links
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 8, marginTop: 8 }}>
              {club.websiteUrl && (
                <a className="btn" href={club.websiteUrl} target="_blank" rel="noreferrer">
                  Website
                </a>
              )}
              {club.instagramUrl && (
                <a className="btn" href={club.instagramUrl} target="_blank" rel="noreferrer">
                  Instagram
                </a>
              )}
              {club.linkedinUrl && (
                <a className="btn" href={club.linkedinUrl} target="_blank" rel="noreferrer">
                  LinkedIn
                </a>
              )}
              {!club.websiteUrl && !club.instagramUrl && !club.linkedinUrl && (
                <span className="small">No social links</span>
              )}
            </div>
          </div>
        </div>

        <p className="small" style={{ marginTop: 24, textAlign: "center", opacity: 0.5 }}>
          Last updated: {club.updatedAt ? new Date(club.updatedAt).toLocaleDateString() : "—"}
        </p>
      </div>

      {/* ✅ Request leader access (new) */}
      <RequestAccess clubId={clubId} />
    </main>
  );
}
