"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { signIn, getSession } from "next-auth/react";
import Navbar from "@/app/components/Navbar";
import DecorativeBubbles from "@/app/components/DecorativeBubbles";
import Footer from "@/app/components/Footer";

export default function LoginPage() {
  const [session, setSession] = useState<any>(null);

  useEffect(() => {
    (async () => {
      const s = await getSession();
      setSession(s);
    })();
  }, []);

  const onLogin = async () => {
    await signIn("google", { callbackUrl: "/leader/dashboard" });
  };

  const onSimulateLogin = async (role: "admin" | "leader") => {
    if (process.env.NODE_ENV !== "development") return;
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
        flexDirection: "column",
        alignItems: "center",
        padding: "clamp(12px, 3vw, 20px)",
        boxSizing: "border-box",
        overflowX: "hidden",
        position: "relative",
      }}
    >
      <DecorativeBubbles />
      <Navbar session={session} />

      <div
        style={{
          width: "100%",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          flex: 1,
          margin: "30px 0 40px",
          zIndex: 10,
        }}
      >
        <div
          style={{
            width: "100%",
            maxWidth: 600,
            background: "white",
            borderRadius: 25,
            boxShadow: "0 4px 12px rgba(0, 0, 0, 0.1)",
            padding: "clamp(16px, 4vw, 40px)",
            position: "relative",
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
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
                gap: 12,
                padding: "11px 28px",
                background: "#ffffff",
                border: "1px solid #747775",
                borderRadius: 24,
                color: "#1f1f1f",
                fontSize: 15,
                fontFamily: "'Roboto', 'Google Sans', 'Sarabun', sans-serif",
                fontWeight: 600,
                cursor: "pointer",
                boxShadow: "0 2px 6px rgba(0, 0, 0, 0.08)",
                transition: "all 0.15s ease",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = "#f8fafd";
                e.currentTarget.style.borderColor = "#444746";
                e.currentTarget.style.boxShadow = "0 3px 8px rgba(0, 0, 0, 0.12)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = "#ffffff";
                e.currentTarget.style.borderColor = "#747775";
                e.currentTarget.style.boxShadow = "0 2px 6px rgba(0, 0, 0, 0.08)";
              }}
            >
              <svg width="20" height="20" viewBox="0 0 24 24" style={{ display: "block" }}>
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                />
              </svg>
              <span>Sign in</span>
            </button>

            {/* Dev Mode Simulated Login Options: Only in development */}
            {process.env.NODE_ENV === "development" && (
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
            )}
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}
