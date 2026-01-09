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
        <Link className="btn" href="/directory">← Back</Link>
        <div className="card" style={{ marginTop: 14 }}>
          <p className="small">Club not found.</p>
        </div>
      </main>
    );
  }

  const data = await res.json();
  const club = data.club as Club;

  const linkBtn = (label: string, url?: string) =>
    url ? (
      <a className="btn" href={url} target="_blank" rel="noreferrer">{label}</a>
    ) : (
      <span className="small">—</span>
    );

  return (
    <main className="container">
      <div className="row" style={{ justifyContent: "space-between" }}>
        <Link className="btn" href="/directory">← Back</Link>
        <Link className="btn" href="/">Home</Link>
      </div>

      <div className="card" style={{ marginTop: 14 }}>
        <h1>{club.name}</h1>
        <p className="small">{club.description ?? ""}</p>

        <hr />

        <div className="grid">
          <div className="card">
            <div className="small">Point of Contact</div>
            <div style={{ marginTop: 6 }}>{club.contactName || "—"}</div>
            <div className="small" style={{ marginTop: 6 }}>{club.contactEmail || "—"}</div>
          </div>

          <div className="card">
            <div className="small">Calendar</div>
            <div style={{ marginTop: 10 }}>{linkBtn("Open", club.calendarUrl)}</div>
          </div>

          <div className="card">
            <div className="small">Discord</div>
            <div style={{ marginTop: 10 }}>{linkBtn("Join", club.discordUrl)}</div>
          </div>

          <div className="card">
            <div className="small">Social Links</div>
            <div className="row" style={{ marginTop: 10 }}>
              {club.websiteUrl && linkBtn("Website", club.websiteUrl)}
              {club.instagramUrl && linkBtn("Instagram", club.instagramUrl)}
              {club.linkedinUrl && linkBtn("LinkedIn", club.linkedinUrl)}
              {!club.websiteUrl && !club.instagramUrl && !club.linkedinUrl && (
                <span className="small">—</span>
              )}
            </div>
          </div>
        </div>

        <p className="small" style={{ marginTop: 14 }}>
          Updated: {club.updatedAt ? new Date(club.updatedAt).toLocaleString() : "—"}
        </p>
      </div>
    </main>
  );
}