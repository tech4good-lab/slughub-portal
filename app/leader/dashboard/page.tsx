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
    <div style={{ position: 'fixed', inset: 0, background: '#EDF4FF', overflow: 'auto', display: 'flex', flexDirection: 'column', padding: '20px' }}>
      {/* Decorative bubbles */}
      <div style={{ position: 'absolute', width: 60, height: 60, left: '10%', top: '5%', opacity: 0.4, background: '#D0E2FF', borderRadius: '50%' }} />
      <div style={{ position: 'absolute', width: 30, height: 30, left: '65%', top: '3%', opacity: 0.5, background: '#FDF0A6', borderRadius: '50%' }} />
      <div style={{ position: 'absolute', width: 50, height: 50, left: '75%', top: '12%', opacity: 0.3, background: '#D0E2FF', borderRadius: '50%' }} />
      <div style={{ position: 'absolute', width: 70, height: 70, left: '80%', top: '55%', opacity: 0.4, background: '#D0E2FF', borderRadius: '50%' }} />
      <div style={{ position: 'absolute', width: 35, height: 35, left: '85%', top: '75%', opacity: 0.5, background: '#FDF0A6', borderRadius: '50%' }} />
      <div style={{ position: 'absolute', width: 25, height: 25, left: '15%', top: '80%', opacity: 0.4, background: '#D0E2FF', borderRadius: '50%' }} />

      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 30, position: 'relative', zIndex: 10 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 15 }}>
          <img src="/SlugPathIcon.png" alt="Slug Path Icon" style={{ width: 50, height: 50 }} />
          <h1 style={{ fontSize: 36, fontFamily: 'Sarabun', fontWeight: 700, margin: 0, color: 'black' }}>Leader Dashboard</h1>
        </div>
        <div style={{ display: 'flex', gap: 10 }}>
          {isAdmin && (
            <>
              <Link href="/admin/review" style={{ padding: '8px 16px', background: '#FDF0A6', border: 'none', borderRadius: 20, color: 'black', fontSize: 14, fontFamily: 'Sarabun', fontWeight: 600, textDecoration: 'none', cursor: 'pointer' }}>
                Club Approvals
              </Link>
              <Link href="/admin/access" style={{ padding: '8px 16px', background: '#E5E7EB', border: 'none', borderRadius: 20, color: 'black', fontSize: 14, fontFamily: 'Sarabun', fontWeight: 600, textDecoration: 'none', cursor: 'pointer' }}>
                Access Requests
              </Link>
            </>
          )}
          <Link href="/directory" style={{ padding: '8px 16px', background: '#FDF0A6', border: 'none', borderRadius: 20, color: 'black', fontSize: 14, fontFamily: 'Sarabun', fontWeight: 600, textDecoration: 'none', cursor: 'pointer' }}>
            Directory
          </Link>
          <LogoutButton />
        </div>
      </div>

      {/* Logged in info and divider */}
      <div style={{ position: 'relative', zIndex: 10, marginBottom: 20 }}>
        <p style={{ color: 'black', fontSize: 14, fontFamily: 'Sarabun', margin: '0 0 15px 0' }}>
          Logged in as: {session?.user?.email}
        </p>
        <div style={{ width: '100%', height: 1, background: '#333' }} />
      </div>

      {/* Main card container */}
      <div style={{ flex: 1, display: 'flex', justifyContent: 'center', position: 'relative', zIndex: 10, minHeight: 0 }}>
        <div style={{ width: '100%', maxWidth: 900, background: 'white', borderRadius: 25, boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)', padding: '40px', display: 'flex', flexDirection: 'column' }}>
          {/* Section header*/}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 30 }}>
            <h2 style={{ fontSize: 24, fontFamily: 'Sarabun', fontWeight: 700, margin: 0, color: 'black' }}>My Clubs</h2>
            <Link href="/leader/clubs/new" style={{ padding: '8px 20px', background: '#FDF0A6', border: 'none', borderRadius: 20, color: 'black', fontSize: 14, fontFamily: 'Sarabun', fontWeight: 600, textDecoration: 'none', cursor: 'pointer' }}>
              Create New Club
            </Link>
          </div>

          {/* Clubs list */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12, flex: 1, overflow: 'auto' }}>
            {clubs.length === 0 ? (
              <p style={{ color: '#666', fontSize: 14, fontFamily: 'Sarabun', textAlign: 'center', padding: '40px 20px' }}>
                You don't have any club access yet.
              </p>
            ) : (
              clubs.map((club: any) => {
                return (
              <div
                key={club.clubId ?? club.recordId}
                style={{
                  padding: '16px 20px',
                  background: '#FAFAFA',
                  borderRadius: 12,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: 20
                }}
              >
                <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 6 }}>
                      <h3 style={{ fontSize: 16, fontFamily: 'Sarabun', fontWeight: 600, margin: 0, color: 'black' }}>{club.name ?? 'Untitled Club'}</h3>
                      <StatusPill status={club.status} />
                    </div>
                    <p style={{ color: '#666', fontSize: 13, fontFamily: 'Sarabun', margin: 0 }}>
                      {(club.description ?? "").slice(0, 140) || "Club description..."}
                      {(club.description ?? "").length > 140 ? "..." : ""}
                    </p>
                  <div style={{ display: 'flex', gap: 10 }}>
                    <Link href={`/leader/clubs/${club.clubId}/edit`} style={{ padding: '8px 16px', background: '#FDF0A6', border: 'none', borderRadius: 8, color: 'black', fontSize: 14, fontFamily: 'Sarabun', fontWeight: 600, textDecoration: 'none', cursor: 'pointer' }}>
                      Edit
                    </Link>
                    <Link href={`/clubs/${club.clubId ?? club.recordId}`} style={{ padding: '8px 16px', background: '#E5E7EB', border: 'none', borderRadius: 8, color: 'black', fontSize: 14, fontFamily: 'Sarabun', fontWeight: 600, textDecoration: 'none', cursor: 'pointer' }}>
                      View Public
                    </Link>
                  </div>
                </div>
              </div>
                );
              })
            )}
          </div>
        </div>
      </div>

      {/* Footer */}
      <div style={{ textAlign: 'center', fontSize: 14, fontFamily: 'Sarabun', color: '#333', marginTop: 20, position: 'relative', zIndex: 10 }}>
        Made with ❤️ from the <a href="#" style={{ color: '#69A1FF', textDecoration: 'underline' }}>Community RAG Team</a>
      </div>
    </div>
  );
}

