import Link from "next/link";
import { Club } from "@prisma/client";
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

// Helper to make the Prisma Enum readable for the UI
function formatCommunityType(enumValue: string | undefined | null) {
  if (!enumValue) return null;
  const labels: Record<string, string> = {
    Academic: "Academic",
    Campus_Department_Program: "Campus Department/Program",
    Cultural_and_Identity: "Cultural and Identity",
    Greek_Letter: "Greek-letter",
    Media_and_Broadcasting: "Media and broadcasting",
    Other: "Other",
    Performing_and_Visual_Arts: "Performing and Visual Arts",
    Politics_and_Advocacy: "Politics and Advocacy",
    Professional_and_Career: "Professional and Career",
    Research: "Research",
    Sports_and_Recreation: "Sports and Recreation",
  };
  return labels[enumValue] || enumValue;
}

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
          <h2 style={{ marginBottom: 8 }}>Community not found</h2>
          <p className="small">
            This community may have been removed or doesn't exist.
          </p>
        </div>
      </main>
    );
  }

  const data = await res.json();
  const club = data.club as Club;

  const communityType = formatCommunityType((club as any).communityType);

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
              Links
            </div>
            <div
              style={{
                display: "flex",
                flexDirection: "row",
                gap: 14,
                marginTop: 8,
                flexWrap: "wrap",
                alignItems: "center",
              }}
            >
              {club.websiteUrl && (
                <a
                  className="linkIcon"
                  href={club.websiteUrl}
                  target="_blank"
                  rel="noreferrer"
                  title="Website"
                  aria-label="Website"
                >
                  <svg width="26" height="26" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
                    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.95-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.78L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z"/>
                  </svg>
                </a>
              )}
              {club.discordUrl && (
                <a
                  className="linkIcon linkIcon--discord"
                  href={club.discordUrl}
                  target="_blank"
                  rel="noreferrer"
                  title="Discord"
                  aria-label="Discord"
                >
                  <svg width="26" height="26" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
                    <path d="M20.317 4.492c-1.53-.69-3.17-1.2-4.885-1.49a.075.075 0 0 0-.079.036c-.21.369-.444.85-.608 1.23a18.566 18.566 0 0 0-5.487 0 12.36 12.36 0 0 0-.617-1.23A.077.077 0 0 0 8.562 3c-1.714.29-3.354.8-4.885 1.491a.07.07 0 0 0-.032.027C.533 9.093-.32 13.555.099 17.961a.08.08 0 0 0 .031.055 20.03 20.03 0 0 0 5.993 2.98.078.078 0 0 0 .084-.026c.462-.62.874-1.275 1.226-1.963.021-.04.001-.088-.041-.104a13.201 13.201 0 0 1-1.872-.878.075.075 0 0 1-.008-.125c.126-.093.252-.19.372-.287a.075.075 0 0 1 .078-.01c3.927 1.764 8.18 1.764 12.061 0a.075.075 0 0 1 .079.009c.12.098.245.195.372.288a.075.075 0 0 1-.006.125c-.598.344-1.22.635-1.873.877a.075.075 0 0 0-.041.105c.36.687.772 1.341 1.225 1.962a.077.077 0 0 0 .084.028 19.963 19.963 0 0 0 6.002-2.981.076.076 0 0 0 .032-.054c.5-5.094-.838-9.52-3.549-13.442a.06.06 0 0 0-.031-.028zM8.02 15.278c-1.182 0-2.157-1.069-2.157-2.38 0-1.312.956-2.38 2.157-2.38 1.21 0 2.176 1.077 2.157 2.38 0 1.312-.956 2.38-2.157 2.38zm7.975 0c-1.183 0-2.157-1.069-2.157-2.38 0-1.312.955-2.38 2.157-2.38 1.21 0 2.176 1.077 2.157 2.38 0 1.312-.946 2.38-2.157 2.38z"/>
                  </svg>
                </a>
              )}
              {club.instagramUrl && (
                <a
                  className="linkIcon linkIcon--instagram"
                  href={club.instagramUrl}
                  target="_blank"
                  rel="noreferrer"
                  title="Instagram"
                  aria-label="Instagram"
                >
                  <svg width="26" height="26" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
                    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                  </svg>
                </a>
              )}
              {club.linkedinUrl && (
                <a
                  className="linkIcon linkIcon--linkedin"
                  href={club.linkedinUrl}
                  target="_blank"
                  rel="noreferrer"
                  title="LinkedIn"
                  aria-label="LinkedIn"
                >
                  <svg width="26" height="26" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
                    <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                  </svg>
                </a>
              )}
              {!club.discordUrl && !club.websiteUrl && !club.instagramUrl && !club.linkedinUrl && (
                <span className="small">No links available</span>
              )}
            </div>
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
