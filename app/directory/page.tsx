import Link from "next/link";
import type { Club } from "@/lib/types";

export default async function DirectoryPage() {
  const res = await fetch(`${process.env.NEXTAUTH_URL}/api/clubs`, { cache: "no-store" });
  const data = await res.json();
  const clubs = (data.clubs ?? []) as Club[];

  return (
    <main className="container">
      <div className="row" style={{ justifyContent: "space-between" }}>
        <h1>Community Directory</h1>
        <Link className="btn" href="/leader/dashboard">Dashboard</Link>
      </div>

      <div className="grid" style={{ marginTop: 18 }}>
        {clubs.map((c: any) => (
          <div key={c.recordId ?? c.clubId} className="card">
            {c.category && (
              <div style={{ marginBottom: 8 }}>
                <span
                  style={{
                    display: "inline-block",
                    padding: "4px 8px",
                    borderRadius: 6,
                    fontWeight: 700,
                    fontSize: 12,
                    textTransform: "uppercase",
                    letterSpacing: "0.04em",
                    background: c.category === "Athletic" ? "rgba(59,130,246,0.08)" : c.category === "Unofficial" ? "rgba(168,85,247,0.06)" : "rgba(249,115,22,0.06)",
                    color: c.category === "Athletic" ? "rgba(59,130,246,0.95)" : c.category === "Unofficial" ? "rgba(168,85,247,0.95)" : "rgba(249,115,22,0.95)",
                    border: "1px solid rgba(255,255,255,0.04)"
                  }}
                >
                  {c.category}
                </span>
              </div>
            )}
            <h2 style={{ marginTop: 0 }}>{c.name}</h2>
            <p className="small">{c.description ?? "No description yet."}</p>

            <Link className="btn" href={`/clubs/${c.clubId ?? c.recordId}`}>
              Learn more →
            </Link>
          </div>
        ))}
      </div>
    </main>
  );
}
