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

  const email = (session as any)?.user?.email ?? "";

  return (
    <div
      style={{
        minHeight: "100dvh",
        background: "#EDF4FF",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "clamp(12px, 3vw, 20px)",
        overflow: "hidden",
        position: "relative",
      }}
    >
      <DecorativeBubbles />

      <div
        style={{
          width: "100%",
          maxWidth: 900,
          background: "white",
          borderRadius: 25,
          boxShadow: "0 4px 12px rgba(0, 0, 0, 0.1)",
          padding: "clamp(16px, 4vw, 40px)",
          position: "relative",
          zIndex: 10,
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            position: "relative",
            gap: 12,
            flexWrap: "wrap",
            marginBottom: 10,
            paddingBottom: 24,
            borderBottom: "1px solid rgba(16,24,40,0.08)",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 15 }}>
            <div>
              <div
                style={{
                  color: "black",
                  fontSize: "25px",
                  fontFamily: "Sarabun",
                  fontWeight: "700",
                  margin: 0,
                }}
              >
                Admin: Leader Access Requests
              </div>
              <div
                style={{
                  color: "#666",
                  fontSize: 13,
                  fontFamily: "Sarabun",
                  fontWeight: "400",
                  margin: "4px 0 0 0",
                }}
              >
                Logged in as: {email ?? "<email>"}
              </div>
            </div>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <Link
              href="/admin/review"
              style={{
                display: "flex",
                minWidth: 80,
                height: 32,
                padding: "0 16px",
                background: "#FDF0A6",
                boxShadow: "0 2px 4px rgba(0, 0, 0, 0.1)",
                borderRadius: 20,
                alignItems: "center",
                justifyContent: "center",
                cursor: "pointer",
                color: "#000",
                fontSize: 14,
                fontFamily: "Sarabun",
                fontWeight: "600",
                textDecoration: "none",
              }}
            >
              Community Approvals
            </Link>
            <Link
              href="/"
              style={{
                display: "flex",
                minWidth: 80,
                height: 32,
                padding: "0 16px",
                background: "#FDF0A6",
                boxShadow: "0 2px 4px rgba(0, 0, 0, 0.1)",
                borderRadius: 20,
                alignItems: "center",
                justifyContent: "center",
                cursor: "pointer",
                color: "#000",
                fontSize: 14,
                fontFamily: "Sarabun",
                fontWeight: "600",
                textDecoration: "none",
              }}
            >
              Back to Directory
            </Link>
          </div>
        </div>

        <div>
          <AccessRequestsList />
        </div>
      </div>
    </div>
  );
}
