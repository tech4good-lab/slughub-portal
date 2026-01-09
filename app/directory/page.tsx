import Link from "next/link";
import type { Club } from "@/lib/types";

export default async function DirectoryPage() {
  const res = await fetch(`${process.env.NEXTAUTH_URL}/api/clubs`, {
    cache: "no-store",
  });

  if (!res.ok) {
    return (
      <main className="container">
        <div className="row" style={{ justifyContent: "space-between" }}>
          <h1>Club Directory</h1>
          <Link className="btn" href="/">Home</Link>
        </div>
        <div className="card" style={{ marginTop: 14 }}>
          <p className="small">Failed to load clubs.</p>
        </div>
      </main>
    );
  }

  const data = await res.json();
  const raw = (data.clubs ?? []) as Club[];

  // ✅ Only show clubs that have a recordId and a name
  const clubs = raw.filter((c) => c.recordId && c.name);

  return (
    <main className="container">
      <div className="row" style={{ justifyContent: "space-between" }}>
        <h1>Club Directory</h1>
        <Link className="btn" href="/">Home</Link>
      </div>

      <div className="grid">
        {clubs.map((c) => (
          <Link key={c.recordId} href={`/clubs/${c.recordId}`} className="card">
            <h2 style={{ marginBottom: 6 }}>{c.name}</h2>
            <p className="small" style={{ margin: 0 }}>
              {(c.description ?? "").slice(0, 140) || "No description yet."}
            </p>
          </Link>
        ))}
      </div>

      {clubs.length === 0 && (
        <div className="card" style={{ marginTop: 14 }}>
          <p className="small" style={{ margin: 0 }}>No clubs yet.</p>
        </div>
      )}
    </main>
  );
}
