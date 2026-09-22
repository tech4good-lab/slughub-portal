import Image from "next/image";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import AccessRequestsList from "./requests-list";
import DecorativeBubbles from "@/app/components/DecorativeBubbles";
import Navbar from "@/app/components/Navbar";

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
        background: "#edf4ff",
        position: "relative",
        zIndex: 1,
        overflowX: "hidden",
        display: "flex",
        flexDirection: "column",
      }}
    >
      {/* Signature Floating Ambient Bubbles */}
      <DecorativeBubbles />

      {/* Floating Pill Navigation Bar */}
      <Navbar session={session} isAdmin={true} isLeader={false} />

      {/* Main card container */}
      <div
        style={{
          flex: 1,
          display: "flex",
          justifyContent: "center",
          position: "relative",
          zIndex: 10,
          minHeight: 0,
          padding: "clamp(16px, 3vw, 28px) clamp(12px, 3vw, 20px) 40px",
        }}
      >
        <div
          style={{
            width: "100%",
            maxWidth: 900,
            background: "white",
            borderRadius: 25,
            boxShadow: "0 4px 12px rgba(0, 0, 0, 0.08)",
            padding: "clamp(20px, 4vw, 40px)",
            display: "flex",
            flexDirection: "column",
          }}
        >
          {/* Header */}
          <div style={{ marginBottom: 18 }}>
            <h1
              style={{
                margin: "0 0 6px 0",
                color: "black",
                fontSize: "clamp(24px, 5vw, 32px)",
                fontFamily: "Sarabun, sans-serif",
                fontWeight: 700,
              }}
            >
              Admin: Access Requests
            </h1>
            <p
              style={{
                color: "#6b7280",
                fontSize: 14,
                fontFamily: "Sarabun, sans-serif",
                margin: 0,
              }}
            >
              Logged in as: <strong style={{ color: "#111827" }}>{email}</strong> (admin)
            </p>
          </div>

          <div
            style={{
              width: "100%",
              height: 1,
              background: "rgba(16, 24, 40, 0.08)",
              marginBottom: 24,
            }}
          />

          <div>
            <AccessRequestsList />
          </div>
        </div>
      </div>

      {/* Footer */}
      <div
        style={{
          textAlign: "center",
          fontSize: 16,
          fontWeight: 500,
          color: "#4b5563",
          marginTop: "auto",
          padding: "16px 0 28px",
          position: "relative",
          zIndex: 10,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: 7,
          flexWrap: "wrap",
        }}
      >
        <span>A</span>
        <a
          href="https://tech4good.soe.ucsc.edu/"
          target="_blank"
          rel="noreferrer"
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 6,
            color: "#1e1e1e",
            textDecoration: "none",
            fontFamily: "'Nunito Sans', 'Helvetica Neue', sans-serif",
            fontWeight: 700,
            fontSize: 17,
            letterSpacing: "-0.04em",
          }}
        >
          <Image
            src="/tech4good-smile-small.png"
            alt="Tech4Good Smile"
            width={22}
            height={22}
          />
          <span>TECH4GOOD LAB</span>
        </a>
        <span>project</span>
      </div>
    </div>
  );
}
