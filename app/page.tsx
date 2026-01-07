import Link from "next/link";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export default async function Home() {
  const session = await getServerSession(authOptions);

  return (
    <main className="container">
      <div className="card">
        <h1>Club Portal</h1>
        <p className="small">
          Public club directory + leader dashboard to create/update club profiles.
        </p>

        <div className="row" style={{ marginTop: 12 }}>
          <Link className="btn btnPrimary" href="/directory">Browse Clubs</Link>

          {session ? (
            <Link className="btn" href="/leader/dashboard">Leader Dashboard</Link>
          ) : (
            <>
              <Link className="btn" href="/login">Login</Link>
              <Link className="btn" href="/signup">Sign up</Link>
            </>
          )}
        </div>
      </div>
    </main>
  );
}
