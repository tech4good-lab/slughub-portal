import Link from "next/link";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import AccessRequestsList from "./requests-list";

export default async function AdminAccessPage() {
  const session = await getServerSession(authOptions);
  const role = (session as any)?.role;

  if (!session) redirect("/login");
  if (role !== "admin") redirect("/forbidden");

  return (
    <main className="container">
      <div className="row" style={{ justifyContent: "space-between", alignItems: "center" }}>
        <h1>Admin: Leader Access Requests</h1>
        <div className="row">
          <Link className="btn" href="/admin/review">Club Approvals</Link>
          <Link className="btn" href="/directory">Directory</Link>
          <Link className="btn" href="/">Home</Link>
        </div>
      </div>

      <AccessRequestsList />
    </main>
  );
}
