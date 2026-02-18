import Link from "next/link";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import type { Club } from "@/lib/types";
import PendingBadge from "@/app/components/PendingBadge";
import DirectoryClient from "@/app/components/DirectoryClient";

export default async function HomePage() {
  const session = await getServerSession(authOptions);
  const isAdmin = (session as any)?.role === "admin";

  const res = await fetch(`${process.env.NEXTAUTH_URL}/api/clubs`);

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
    <main className="container directoryHome">
      <Header session={session} isAdmin={isAdmin} />

      <DirectoryClient clubs={clubs} session={session} />
    </main>
  );
}

function Header({ session, isAdmin }: { session: any; isAdmin: boolean }) {
  return (
    <header
      style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: 32,
        flexWrap: "wrap",
        gap: 16,
      }}
    >
      <div>
        <h1
          style={{
            margin: 0,
            color: "black",
          }}
        >
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
            <Link className="btn" href="/signup">Club Lead Sign Up</Link>
          </>
        )}
      </nav>
    </header>
  );
}
