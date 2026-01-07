import Link from "next/link";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import type { Club } from "@/lib/types";
import { base, CLUBS_TABLE } from "@/lib/airtable";
import LogoutButton from "@/app/leader/edit/logout-button";

export default async function LeaderDashboard() {
  const session = await getServerSession(authOptions);
  const userId = (session as any)?.userId;
  if (!userId) redirect("/login");

  const records = await base(CLUBS_TABLE)
    .select({ maxRecords: 1, filterByFormula: `{ownerUserId} = "${userId}"` })
    .firstPage();

  const club = (records[0]?.fields ?? null) as Club | null;

  return (
    <main className="container">
      <div className="row" style={{ justifyContent: "space-between" }}>
        <h1>Leader Dashboard</h1>
        <div className="row">
          <Link className="btn" href="/directory">Directory</Link>
          <LogoutButton />
        </div>
      </div>

      <div className="card" style={{ marginTop: 14 }}>
        <p className="small" style={{ marginTop: 0 }}>
          Logged in as: {session?.user?.email}
        </p>

        {club ? (
          <>
            <h2 style={{ marginTop: 10 }}>{club.name}</h2>
            <p className="small">{club.description ?? ""}</p>
            <div className="row" style={{ marginTop: 12 }}>
              <Link className="btn btnPrimary" href="/leader/edit">Edit Club Profile</Link>
              <Link className="btn" href={`/clubs/${club.clubId}`}>View Public Page</Link>
            </div>
          </>
        ) : (
          <>
            <p className="small">You don’t have a club profile yet.</p>
            <div className="row" style={{ marginTop: 12 }}>
              <Link className="btn btnPrimary" href="/leader/edit">Create Club Profile</Link>
            </div>
          </>
        )}
      </div>
    </main>
  );
}
