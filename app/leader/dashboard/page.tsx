import Link from "next/link";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import type { Club } from "@/lib/types";
import { CLUBS_TABLE, cachedAll } from "@/lib/airtable";
import LogoutButton from "@/app/leader/edit/logout-button";

const MEMBERS_TABLE = process.env.AIRTABLE_MEMBERS_TABLE || "ClubMembers";

function orFormulaForClubIds(clubIds: string[]) {
  const parts = clubIds.map((id) => `{clubId}="${id}"`);
  return `OR(${parts.join(",")})`;
}

function StatusPill({ status }: { status?: any }) {
  const s = String(status ?? "").toLowerCase();
  const label = s || "unknown";

  const style: React.CSSProperties =
    s === "approved"
      ? { border: "1px solid rgba(34,197,94,0.35)", color: "rgba(34,197,94,0.95)" }
      : s === "pending"
      ? { border: "1px solid rgba(251,191,36,0.35)", color: "rgba(251,191,36,0.95)" }
      : s === "rejected"
      ? { border: "1px solid rgba(239,68,68,0.35)", color: "rgba(239,68,68,0.95)" }
      : { border: "1px solid rgba(255,255,255,0.2)", color: "rgba(255,255,255,0.75)" };

  return (
    <span
      className="small"
      style={{
        padding: "4px 10px",
        borderRadius: 999,
        textTransform: "capitalize",
        ...style,
      }}
    >
      {label}
    </span>
  );
}

export default async function LeaderDashboard() {
  const session = await getServerSession(authOptions);
  const userId = (session as any)?.userId;
  const role = (session as any)?.role;

  if (!userId) redirect("/login");

  // If you're an admin, show admin links too
  const isAdmin = role === "admin";

  // 1) Find memberships for this user
  const memberRecords = await cachedAll(MEMBERS_TABLE, { filterByFormula: `{userId}="${userId}"` }, 300);

  const clubIds = (memberRecords || [])
    .map((r: any) => String((r.fields as any).clubId ?? ""))
    .filter(Boolean);

  // 2) Fetch clubs for those clubIds
  let clubs: Club[] = [];
  if (clubIds.length > 0) {
    const clubRecords = await cachedAll(CLUBS_TABLE, { filterByFormula: orFormulaForClubIds(clubIds), sort: [{ field: "updatedAt", direction: "desc" }] }, 600);

    clubs = (clubRecords || []).map((r: any) => ({ recordId: r.id, ...(r.fields as any) })) as any;
  }

  return (
    <main className="container">
      <div className="row" style={{ justifyContent: "space-between", alignItems: "center" }}>
        <h1>Leader Dashboard</h1>
        <div className="row">
          {isAdmin && (
            <>
              <Link className="btn btnPrimary" href="/admin/review">Club Approvals</Link>
              <Link className="btn" href="/admin/access">Access Requests</Link>
            </>
          )}
          <Link className="btn" href="/directory">Directory</Link>
          <LogoutButton />
        </div>
      </div>

      <div className="card" style={{ marginTop: 14 }}>
        <p className="small" style={{ marginTop: 0 }}>
          Logged in as: {session?.user?.email}
        </p>

        <div className="row" style={{ marginTop: 12, justifyContent: "space-between" }}>
          <h2 style={{ margin: 0 }}>My Clubs</h2>
          <Link className="btn btnPrimary" href="/leader/clubs/new">
            + Create New Club
          </Link>
        </div>

        {clubs.length === 0 ? (
          <p className="small" style={{ marginTop: 12 }}>
            You don’t have any club access yet.
          </p>
        ) : (
          <div style={{ marginTop: 12, display: "flex", flexDirection: "column", gap: 12 }}>
            {clubs.map((club: any) => (
              <div
                key={club.clubId ?? club.recordId}
                className="card"
                style={{ background: "rgba(255,255,255,0.02)" }}
              >
                <div className="row" style={{ justifyContent: "space-between", alignItems: "center" }}>
                  <div>
                    <div className="row" style={{ alignItems: "center", gap: 10 }}>
                      <h3 style={{ margin: 0 }}>{club.name ?? "Untitled Club"}</h3>
                      <StatusPill status={club.status} />
                    </div>
                    <p className="small" style={{ marginTop: 6 }}>
                      {(club.description ?? "").slice(0, 140) || "No description yet."}
                      {(club.description ?? "").length > 140 ? "..." : ""}
                    </p>
                  </div>

                  <div className="row">
                    <Link className="btn btnPrimary" href={`/leader/clubs/${club.clubId}/edit`}>
                      Edit
                    </Link>
                    <Link className="btn" href={`/clubs/${club.clubId ?? club.recordId}`}>
                      View Public
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}

