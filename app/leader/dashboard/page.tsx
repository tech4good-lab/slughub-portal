import Link from "next/link";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import type { Club } from "@/lib/types";
import { CLUBS_TABLE, EVENTS_TABLE, cachedAll } from "@/lib/airtable";
import EventsCacheClient from "@/app/components/EventsCacheClient";
import ClubsCacheClient from "@/app/components/ClubsCacheClient";
import LogoutButton from "@/app/leader/edit/logout-button";

export default async function LeaderDashboard() {
  const session = await getServerSession(authOptions);
  const userId = (session as any)?.userId;
  const role = (session as any)?.role;
  const cookieStore = await cookies();
  const recentWriteAt = Number(cookieStore.get(RECENT_WRITE_COOKIE)?.value ?? 0);
  const nowMs = Date.now();
  const hasRecentWrite =
    Number.isFinite(recentWriteAt) &&
    recentWriteAt > 0 &&
    nowMs >= recentWriteAt &&
    nowMs - recentWriteAt <= RECENT_WRITE_WINDOW_MS;
  const cacheKeyExtra = hasRecentWrite ? { recentWriteAt } : undefined;
  const membersTtl = hasRecentWrite ? 0 : 300;
  const clubsTtl = hasRecentWrite ? 0 : 600;
  const eventsTtl = hasRecentWrite ? 0 : 3600;

  if (!userId) redirect("/login");

  // If you're an admin, show admin links too
  const isAdmin = role === "admin";

  // 1) Find memberships for this user
  const memberRecords = await cachedAll(
    MEMBERS_TABLE,
    { filterByFormula: `{userId}="${userId}"` },
    membersTtl,
    cacheKeyExtra
  );

  const clubIds = (memberRecords || [])
    .map((r: any) => String((r.fields as any).clubId ?? ""))
    .filter(Boolean);

  // 2) Fetch clubs for those clubIds
  let clubs: Club[] = [];
  let eventsByClub: Record<string, any[]> = {};
  if (clubIds.length > 0) {
    const clubRecords = await cachedAll(
      CLUBS_TABLE,
      { filterByFormula: orFormulaForClubIds(clubIds), sort: [{ field: "updatedAt", direction: "desc" }] },
      clubsTtl,
      cacheKeyExtra
    );

    clubs = (clubRecords || []).map((r: any) => ({ recordId: r.id, ...(r.fields as any) })) as any;

    const eventRecords = await cachedAll(
      EVENTS_TABLE,
      { filterByFormula: orFormulaForClubIds(clubIds), sort: [{ field: "eventDate", direction: "desc" }] },
      eventsTtl,
      cacheKeyExtra
    );

    for (const r of eventRecords || []) {
      const f = (r.fields as any) ?? {};
      const cid = String(f.clubId ?? "");
      if (!cid) continue;
      if (!eventsByClub[cid]) eventsByClub[cid] = [];
      eventsByClub[cid].push({ recordId: r.id, ...f });
    }
  }

  return (
    <div className="leaderDashboard" style={{ minHeight: "100dvh", background: "rgb(237, 244, 255)", overflow: "auto", display: "flex", flexDirection: "column", padding: "clamp(12px, 3vw, 20px)" }}>
      <ClubsCacheClient clubs={clubs as any[]} />
      <EventsCacheClient
        events={Object.values(eventsByClub).flat() as any[]}
      />
      {/* Decorative bubbles */}
      <div style={{ position: 'absolute', width: 60, height: 60, left: '10%', top: '5%', opacity: 0.4, background: '#D0E2FF', borderRadius: '50%' }} />
      <div style={{ position: 'absolute', width: 30, height: 30, left: '65%', top: '3%', opacity: 0.5, background: '#FDF0A6', borderRadius: '50%' }} />
      <div style={{ position: 'absolute', width: 50, height: 50, left: '75%', top: '12%', opacity: 0.3, background: '#D0E2FF', borderRadius: '50%' }} />
      <div style={{ position: 'absolute', width: 70, height: 70, left: '80%', top: '55%', opacity: 0.4, background: '#D0E2FF', borderRadius: '50%' }} />
      <div style={{ position: 'absolute', width: 35, height: 35, left: '85%', top: '75%', opacity: 0.5, background: '#FDF0A6', borderRadius: '50%' }} />
      <div style={{ position: 'absolute', width: 25, height: 25, left: '15%', top: '80%', opacity: 0.4, background: '#D0E2FF', borderRadius: '50%' }} />

      {/* Main card container */}
      <div style={{ flex: 1, display: "flex", justifyContent: "center", position: "relative", zIndex: 10, minHeight: 0 }}>
        <div style={{ width: "100%", maxWidth: 900, background: "white", borderRadius: 25, boxShadow: "0 4px 12px rgba(0, 0, 0, 0.1)", padding: "clamp(16px, 4vw, 40px)", display: "flex", flexDirection: "column" }}>
          {/* Header */}
          <header
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: 10,
              flexWrap: "wrap",
              gap: 16,
            }}
          >
            <div>
              <h1 style={{ margin: 0, color: "black" }}>Leader Dashboard</h1>
            </div>
            <nav className="row">
              {isAdmin && (
                <>
                  <Link className="btn" href="/admin/review">
                    Club Approvals
                  </Link>
                  <Link className="btn" href="/admin/access">
                    Access Requests
                  </Link>
                </>
              )}
              <Link className="btn" href="/directory">
                Directory
              </Link>
              <Link className="btn" href="/login">
                Logout
              </Link>
            </nav>
          </header>

          {/* Logged in info and divider */}
          <div style={{ marginBottom: 24 }}>
            <p style={{ color: "black", fontSize: 14, fontFamily: "Sarabun", margin: "0 0 12px 0" }}>
              Logged in as: {session?.user?.email}
            </p>
            <div style={{ width: "100%", height: 0.5, background: "#333333" }} />
          </div>

          {/* Section header*/}
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 30, flexWrap: "wrap", gap: 12 }}>
            <h2 style={{ fontSize: 24, fontFamily: 'Sarabun', fontWeight: 700, margin: 0, color: 'black' }}>My Clubs</h2>
            <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
              <Link href="/leader/events/new" style={{ padding: '8px 20px', background: '#E5E7EB', border: 'none', borderRadius: 20, color: 'black', fontSize: 14, fontFamily: 'Sarabun', fontWeight: 600, textDecoration: 'none', cursor: 'pointer' }}>
                Create Event
              </Link>
              <Link href="/leader/clubs/new" style={{ padding: '8px 20px', background: '#FDF0A6', border: 'none', borderRadius: 20, color: 'black', fontSize: 14, fontFamily: 'Sarabun', fontWeight: 600, textDecoration: 'none', cursor: 'pointer' }}>
                Create New Club
              </Link>
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
    </div>
  );
}

