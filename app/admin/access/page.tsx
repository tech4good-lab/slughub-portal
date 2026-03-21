import Link from "next/link";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import AccessRequestsList from "./requests-list";
import DecorativeBubbles from "@/app/components/DecorativeBubbles";

export default async function AdminAccessPage() {
  const session = await getServerSession(authOptions);
  const role = (session as any)?.role;

  if (!session) redirect("/login");
  if (role !== "admin") redirect("/forbidden");

  return (
    <main className="container adminAccess" style={{ position: "relative", zIndex: 1 }}>
      <DecorativeBubbles />
      <div
        style={{
          width: "100%",
          background: "white",
          borderRadius: 25,
          boxShadow: "0 4px 12px rgba(0, 0, 0, 0.1)",
          padding: "clamp(16px, 4vw, 32px)",
          position: "relative",
          zIndex: 2,
        }}
      >
        <div className="row" style={{ justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
          <h1>Admin: Leader Access Requests</h1>
          <div className="row">
            <Link style={{ color: "black" }} className="btn" href="/admin/review">Community Approvals</Link>
            <Link style={{ color: "black" }} className="btn" href="/">↤ Home</Link>
          </div>
        </div>
        <div style={{ width: "100%", height: 0.5, background: "#333333", marginBottom: 6 }} />

        <AccessRequestsList />
      </div>
    </main>
  );
}
