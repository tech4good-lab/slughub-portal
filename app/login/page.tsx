"use client";

import Link from "next/link";
import { signIn } from "next-auth/react";
import DecorativeBubbles from "@/app/components/DecorativeBubbles";
export default function LoginPage() {
  const onLogin = async () => {
    await signIn("google", { callbackUrl: "/leader/dashboard" });
  };

  const onSimulateLogin = async (role: "admin" | "leader") => {
    await signIn("dev-login", {
      role,
      email: role === "admin" ? "superkaush@gmail.com" : "leader@ucsc.edu",
      callbackUrl: "/",
    });
  };

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
          maxWidth: 600, // Kept at 600px since it's a login card, but with identical styles
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
            <img
              src="/dashboard-icon.png"
              alt="Slug Path Icon"
              style={{ width: 50, height: 50 }}
            />
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
                Community Lead Login
              </div>
              <div
                style={{
                  color: "#666",
                  fontSize: 14,
                  fontFamily: "Sarabun",
                  fontWeight: "400",
                  margin: "4px 0 0 0",
                }}
              >
                Sign in with your UCSC Google account.
              </div>
            </div>
          </div>
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
            Portal
          </Link>
        </div>

        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            paddingTop: "20px",
            paddingBottom: "10px",
            gap: 16,
          }}
        >
          <button
            type="button"
            onClick={onLogin}
            style={{
              padding: "10px 32px",
              background: "#FDF0A6",
              border: "1px solid #FDF0A6",
              borderRadius: 25,
              color: "#000",
              fontSize: 16,
              fontFamily: "Sarabun",
              fontWeight: "600",
              cursor: "pointer",
              boxShadow: "0 6px 14px rgba(251,191,36,0.14)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            Continue with Google
          </button>

          {/* Dev Mode Simulated Login Options */}
          <div
            style={{
              width: "100%",
              marginTop: 12,
              paddingTop: 18,
              borderTop: "1px dashed rgba(16,24,40,0.15)",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: 12,
            }}
          >
            <div
              style={{
                fontSize: 12,
                fontWeight: 700,
                color: "#4b5563",
                textTransform: "uppercase",
                letterSpacing: "0.06em",
              }}
            >
              🛠️ Simulated Dev Logins (Bypass OAuth)
            </div>

            <div
              style={{
                display: "flex",
                gap: 10,
                flexWrap: "wrap",
                justifyContent: "center",
              }}
            >
              <button
                type="button"
                onClick={() => onSimulateLogin("admin")}
                style={{
                  padding: "9px 18px",
                  background: "#dbeafe",
                  border: "1px solid #bfdbfe",
                  borderRadius: 20,
                  color: "#1e40af",
                  fontSize: 13.5,
                  fontFamily: "Sarabun",
                  fontWeight: "600",
                  cursor: "pointer",
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 6,
                  boxShadow: "0 2px 6px rgba(59,130,246,0.12)",
                }}
              >
                ⚡ Simulate Admin Login
              </button>

              <button
                type="button"
                onClick={() => onSimulateLogin("leader")}
                style={{
                  padding: "9px 18px",
                  background: "#fef3c7",
                  border: "1px solid #fde68a",
                  borderRadius: 20,
                  color: "#92400e",
                  fontSize: 13.5,
                  fontFamily: "Sarabun",
                  fontWeight: "600",
                  cursor: "pointer",
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 6,
                  boxShadow: "0 2px 6px rgba(245,158,11,0.12)",
                }}
              >
                ⚡ Simulate Leader Login
              </button>
            </div>
            <p
              style={{
                fontSize: 12,
                color: "#6b7280",
                textAlign: "center",
                margin: 0,
                maxWidth: 400,
              }}
            >
              Signs you in as an Admin (or Leader) with a real session cookie to
              test approvals, access requests, and dashboard navigation.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
