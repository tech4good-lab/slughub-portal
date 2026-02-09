import Link from "next/link";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import type { Club } from "@/lib/types";
import PendingBadge from "@/app/components/PendingBadge";

export default async function HomePage() {
  const session = await getServerSession(authOptions);
  const isAdmin = (session as any)?.role === "admin";
  
  const res = await fetch(`${process.env.NEXTAUTH_URL}/api/clubs`, {
    cache: "no-store",
  });

  if (!res.ok) {
    return (
      <main className="container">
        <Header session={session} isAdmin={isAdmin} />
        <div className="card">
          <p className="small">Failed to load clubs.</p>
        </div>
      </main>
    );
  }

  const data = await res.json();
  const raw = (data.clubs ?? []) as Club[];
  const clubs = raw.filter((c) => c.recordId && c.name);

  return (
    <main className="container">
      <Header session={session} isAdmin={isAdmin} />
      
      {/* Credit line */}
      <div style={{ 
        marginBottom: 40,
        paddingBottom: 32,
        borderBottom: "1px solid rgba(255,255,255,0.1)"
      }}>
        <p style={{ 
          fontSize: 16,
          fontWeight: 500,
          color: "rgba(255,255,255,0.6)",
          marginTop: 12,
          textAlign: "center"
        }}>
          Made with ❤️ from the{" "}
          <a 
            href="https://tech4good.soe.ucsc.edu/" 
            target="_blank" 
            rel="noreferrer"
            style={{
              color: "rgba(251,191,36,0.9)",
              textDecoration: "none",
              fontWeight: 600
            }}
          >
            CommunityRAG Team
          </a>
        </p>
      </div>

      {/* Club cards */}
      <div className="grid">
        {clubs.map((c) => (
          <Link
            key={c.recordId}
            href={`/clubs/${(c as any).clubId ?? c.recordId}`}
            className="card"
          >

            <h2 style={{ marginBottom: 8 }}>{c.name}</h2>
            <p className="small" style={{ margin: 0, lineHeight: 1.6 }}>
              {(c.description ?? "").slice(0, 140) || "No description yet."}
              {(c.description ?? "").length > 140 ? "..." : ""}
            </p>
            
            <div style={{
              marginTop: 16,
              paddingTop: 12,
              borderTop: "1px solid rgba(255,255,255,0.08)",
              fontSize: 13,
              color: "rgba(251,191,36,0.8)",
              fontWeight: 600
            }}>
              Learn more →
            </div>
          </Link>
        ))}
      </div>

      {clubs.length === 0 && (
        <div className="card" style={{ 
          textAlign: "center", 
          padding: 60,
          background: "linear-gradient(135deg, rgba(251,191,36,0.03), rgba(59,130,246,0.03))"
        }}>
          <h2 style={{ marginBottom: 8 }}>No clubs yet</h2>
          <p className="small" style={{ margin: 0 }}>
            Be the first to register your club and start building community.
          </p>
          {!session && (
            <Link 
              href="/signup" 
              className="btn btnPrimary" 
              style={{ marginTop: 20, display: "inline-flex" }}
            >
              Register Your Club
            </Link>
          )}
        </div>
      )}
    </main>
  );
}

function Header({ session, isAdmin }: { session: any; isAdmin: boolean }) {
  return (
    <header style={{ 
      display: "flex", 
      justifyContent: "space-between", 
      alignItems: "center",
      marginBottom: 32,
      flexWrap: "wrap",
      gap: 16
    }}>
      <div>
        <h1 style={{ 
          margin: 0,
          background: "linear-gradient(135deg, #fbbf24, #f59e0b)",
          WebkitBackgroundClip: "text",
          WebkitTextFillColor: "transparent",
          backgroundClip: "text"
        }}>
          Community Directory
        </h1>
      </div>
      
      <nav className="row">
        {session ? (
          <>
          {isAdmin && (
            <>
              <Link className="btn" href="/admin/review" style={{ position: "relative" }}>
                Club Approvals
                <PendingBadge />
              </Link>
              <Link className="btn" href="/admin/access">
                Access Requests
              </Link>
            </>
          )}

            <Link className="btn" href="/leader/dashboard">Dashboard</Link>
          </>
        ) : (
          <>
            <Link className="btn" href="/login">Club Lead Login</Link>
            <Link className="btn btnPrimary" href="/signup">Club Lead Sign Up</Link>
          </>
        )}
      </nav>
    </header>
  );
}