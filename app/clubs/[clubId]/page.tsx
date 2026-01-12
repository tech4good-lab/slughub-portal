import Link from "next/link";
import type { Club } from "@/lib/types";

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
        <Link className="btn" href="/" style={{ marginBottom: 24, display: "inline-flex" }}>
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
      <Link className="btn" href="/" style={{ marginBottom: 24, display: "inline-flex" }}>
        ← Back to Directory
      </Link>

      {/* Hero section */}
      <div className="card" style={{ 
        marginTop: 20,
        background: "linear-gradient(135deg, rgba(251,191,36,0.08), rgba(59,130,246,0.08))",
        borderColor: "rgba(251,191,36,0.2)"
      }}>
        <h1 style={{ marginBottom: 12 }}>{club.name}</h1>
        <p style={{ 
          fontSize: 16,
          lineHeight: 1.7,
          color: "rgba(255,255,255,0.85)",
          margin: 0
        }}>
          {club.description || "No description provided."}
        </p>
      </div>

      {/* Contact & Links */}
      <div className="grid" style={{ marginTop: 24 }}>
        <InfoCard 
          title="Point of Contact"
          content={
            <>
              <div style={{ fontWeight: 600, marginBottom: 4 }}>
                {club.contactName || "—"}
              </div>
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
            </>
          }
        />

        <InfoCard
          title="Calendar"
          content={
            club.calendarUrl ? (
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
            )
          }
        />

        <InfoCard
          title="Discord"
          content={
            club.discordUrl ? (
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
            )
          }
        />

        <InfoCard
          title="Links"
          content={
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
                <span className="small">No social links available</span>
              )}
            </div>
          }
        />
      </div>

      <p className="small" style={{ marginTop: 32, textAlign: "center", opacity: 0.5 }}>
        Last updated: {club.updatedAt ? new Date(club.updatedAt).toLocaleDateString() : "—"}
      </p>
    </main>
  );
}

function InfoCard({ title, content }: { 
  title: string; 
  content: React.ReactNode 
}) {
  return (
    <div className="card" style={{ 
      display: "flex", 
      flexDirection: "column",
      minHeight: 160
    }}>
      <div className="small" style={{ 
        fontWeight: 700, 
        textTransform: "uppercase",
        letterSpacing: "0.05em",
        marginBottom: 8,
        color: "rgba(251,191,36,0.8)"
      }}>
        {title}
      </div>
      <div style={{ marginTop: "auto" }}>
        {content}
      </div>
    </div>
  );
}