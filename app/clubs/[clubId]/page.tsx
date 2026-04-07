import Link from "next/link";
import type { Club } from "@/lib/types";
import RequestAccess from "./request-access";

export const linkPillStyle = {
  padding: "8px 16px",
  background: "#FDF0A6",
  border: "1px solid #FDF0A6",
  borderRadius: 20,
  color: "#000",
  fontFamily: "Sarabun",
  fontSize: 14,
  fontWeight: 600,
  lineHeight: "1",
  textDecoration: "none",
  boxShadow: "0 6px 14px rgba(251,191,36,0.14)",
  display: "inline-flex",
  alignSelf: "flex-start" as const,
};

export default async function ClubDetailPage({
  params,
}: {
  params: Promise<{ clubId: string }>;
}) {
  const { clubId } = await params;

  const res = await fetch(`${process.env.NEXTAUTH_URL}/api/clubs/${clubId}`, {
    cache: "no-store",
  });

  if (!res.ok) {
    return (
      <main className="container clubDetail">
        <Link
          className="btn"
          href="/directory"
          style={{ ...linkPillStyle, marginBottom: 24 }}
        >
          Back to Directory
        </Link>
        <div
          className="card"
          style={{ marginTop: 20, textAlign: "center", padding: 60 }}
        >
          <h2 style={{ marginBottom: 8 }}>Club not found</h2>
          <p className="small">
            This club may have been removed or doesn't exist.
          </p>
        </div>
      </main>
    );
  }

  const data = await res.json();
  const club = data.club as Club;
  const communityTypeRaw =
    (club as any).communityType ??
    (club as any)["community Type"] ??
    (club as any)["community type"] ??
    (club as any)["Community Type"];
  const communityType = Array.isArray(communityTypeRaw)
    ? communityTypeRaw[0]
    : communityTypeRaw;

  return (
    <main className="container clubDetail">
      <Link
        className="btn"
        href="/directory"
        style={{ ...linkPillStyle, marginBottom: 24 }}
      >
        Back to Directory
      </Link>

      <div className="card" style={{ marginTop: 20 }}>
        {communityType && (
          <div style={{ marginBottom: 12 }}>
            <span
              style={{
                display: "inline-block",
                padding: "6px 10px",
                borderRadius: 8,
                fontWeight: 700,
                fontSize: 12,
                textTransform: "uppercase",
                letterSpacing: "0.05em",
                background: "rgba(251,191,36,0.15)",
                color: "rgba(180,83,9,0.95)",
                border: "1px solid rgba(255,255,255,0.04)",
              }}
            >
              {communityType}
            </span>
          </div>
        )}

        <h1 style={{ marginBottom: 16, fontSize: 36 }}>{club.name}</h1>
        <p
          style={{
            fontSize: 16,
            lineHeight: 1.7,
            color: "rgba(0,0,0,0.75)",
            marginBottom: 24,
            paddingBottom: 24,
            borderBottom: "1px solid rgba(16,24,40,0.08)",
          }}
        >
          {club.description || "No description provided."}
        </p>

        <div className="grid" style={{ marginTop: 0 }}>
          <div>
            <div
              className="small"
              style={{
                fontWeight: 700,
                textTransform: "uppercase",
                letterSpacing: "0.05em",
                marginBottom: 8,
                color: "rgba(251,191,36,0.8)",
              }}
            >
              Point of Contact
            </div>
            <div style={{ fontWeight: 600, marginBottom: 4, color: "#000" }}>
              {club.contactName || "—"}
            </div>
            <a
              href={club.contactEmail ? `mailto:${club.contactEmail}` : "#"}
              style={{
                fontSize: 14,
                color: "#000",
                textDecoration: "none",
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
                color: "rgba(251,191,36,0.8)",
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
                style={{ ...linkPillStyle, marginTop: 8 }}
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
                color: "rgba(251,191,36,0.8)",
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
                style={{ ...linkPillStyle, marginTop: 8 }}
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
                color: "rgba(251,191,36,0.8)",
              }}
            >
              Links
            </div>
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: 8,
                marginTop: 8,
              }}
            >
              {club.websiteUrl && (
                <a
                  className="btn"
                  href={club.websiteUrl}
                  target="_blank"
                  rel="noreferrer"
                  style={linkPillStyle}
                >
                  Website
                </a>
              )}
              {club.instagramUrl && (
                <a
                  className="btn"
                  href={club.instagramUrl}
                  target="_blank"
                  rel="noreferrer"
                  style={linkPillStyle}
                >
                  Instagram
                </a>
              )}
              {club.linkedinUrl && (
                <a
                  className="btn"
                  href={club.linkedinUrl}
                  target="_blank"
                  rel="noreferrer"
                  style={linkPillStyle}
                >
                  LinkedIn
                </a>
              )}
              {!club.websiteUrl && !club.instagramUrl && !club.linkedinUrl && (
                <span className="small">No social links</span>
              )}
            </div>
          </div>
        </div>

        <p
          className="small"
          style={{ marginTop: 24, textAlign: "center", opacity: 0.5 }}
        >
          Last updated:{" "}
          {club.updatedAt ? new Date(club.updatedAt).toLocaleDateString() : "—"}
        </p>
      </div>

      <RequestAccess clubId={clubId} />
    </main>
  );
}
