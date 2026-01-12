import Link from "next/link";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import type { Club } from "@/lib/types";
import { base, CLUBS_TABLE } from "@/lib/airtable";
import LogoutButton from "@/app/leader/edit/logout-button";
import StatusPill from "@/app/components/StatusPill";

export default async function LeaderDashboard() {
  const session = await getServerSession(authOptions);
  const userId = (session as any)?.userId;
  if (!userId) redirect("/login");

  const records = await base(CLUBS_TABLE)
    .select({ maxRecords: 1, filterByFormula: `{ownerUserId} = "${userId}"` })
    .firstPage();

  const club = (records[0]?.fields ?? null) as any as Club | null;

  const status = String((club as any)?.status ?? "").toLowerCase();
  const isLive = status === "approved";
  const reviewNotes = String((club as any)?.reviewNotes ?? "");

  return (
    <main className="container">
      <div className="row" style={{ justifyContent: "space-between", alignItems: "center" }}>
        <h1>Leader Dashboard</h1>

        <div className="row">
          {(session as any)?.role === "admin" && (
            <Link className="btn btnPrimary" href="/admin/review">
              Admin Review
            </Link>
          )}

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
            <div className="row" style={{ justifyContent: "space-between", alignItems: "center", marginTop: 10 }}>
              <h2 style={{ margin: 0 }}>{club.name}</h2>
              <StatusPill status={(club as any).status} />
            </div>

            <p className="small" style={{ marginTop: 10 }}>
              {club.description ?? ""}
            </p>

            {/* Helpful explanation so leaders know why it’s not visible */}
            {status === "pending" && (
              <div
                className="card"
                style={{
                  marginTop: 12,
                  border: "1px solid rgba(234,179,8,0.25)",
                  background: "rgba(255,255,255,0.03)",
                }}
              >
                <p className="small" style={{ margin: 0 }}>
                  Your club profile is pending admin approval. It won’t appear in the public directory until approved.
                </p>
              </div>
            )}

            {status === "rejected" && (
              <div
                className="card"
                style={{
                  marginTop: 12,
                  border: "1px solid rgba(239,68,68,0.25)",
                  background: "rgba(255,255,255,0.03)",
                }}
              >
                <p className="small" style={{ margin: 0 }}>
                  Your club profile was rejected. Please edit and resubmit.
                </p>
                {reviewNotes && (
                  <p className="small" style={{ marginTop: 10, opacity: 0.9 }}>
                    <strong>Admin notes:</strong> {reviewNotes}
                  </p>
                )}
              </div>
            )}

            <div className="row" style={{ marginTop: 12 }}>
              <Link className="btn btnPrimary" href="/leader/edit">Edit Club Profile</Link>

              {/* Only show public link when approved, so it’s not confusing */}
              {isLive ? (
                <Link className="btn" href={`/clubs/${club.clubId}`}>View Public Page</Link>
              ) : (
                <span className="small" style={{ alignSelf: "center", opacity: 0.8 }}>
                  Public page not live yet
                </span>
              )}
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
