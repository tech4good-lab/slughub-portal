"use client";

import Link from "next/link";
import { signIn } from "next-auth/react";
import DecorativeBubbles from "@/app/components/DecorativeBubbles";

export default function LoginPage() {
  const onLogin = async () => {
    await signIn("google", { callbackUrl: "/leader/dashboard" });
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
                Club Lead Login
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
            Directory
          </Link>
        </div>

        <div
          style={{
            display: "flex",
            justifyContent: "center",
            paddingTop: "20px",
            paddingBottom: "10px",
          }}
        >
          <button
            type="button"
            onClick={onLogin}
            style={{
              padding: "8px 32px",
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
        </div>
      </div>
    </div>
  );
}
