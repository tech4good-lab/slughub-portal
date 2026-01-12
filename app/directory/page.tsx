import Link from "next/link";
import type { Club } from "@/lib/types";

export default async function DirectoryPage() {
  const res = await fetch(`${process.env.NEXTAUTH_URL}/api/clubs`, { cache: "no-store" });
  const data = await res.json();
  const clubs = (data.clubs ?? []) as Club[];

  return (
    <main className="container">
      <div className="row" style={{ justifyContent: "space-between" }}>
        <h1>Club Directory</h1>
        <Link className="btn" href="/leader/dashboard">Dashboard</Link>
      </div>

      <div className="grid" style={{ marginTop: 18 }}>
        {clubs.map((c: any) => (
          <div key={c.recordId ?? c.clubId} className="card">
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
