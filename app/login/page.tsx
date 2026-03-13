"use client";

import Link from "next/link";
import { signIn } from "next-auth/react";
import DecorativeBubbles from "@/app/components/DecorativeBubbles";

export default function LoginPage() {
  const onLogin = async () => {
    await signIn("google", { callbackUrl: "/leader/dashboard" });
  };

  return (
    <main className="container authPage" style={{ position: "relative", zIndex: 1 }}>
      <DecorativeBubbles />

      <div className="card" style={{ marginTop: 14 }}>
        <div style={{ marginBottom: 12, display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, flexWrap: "wrap" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <img src="/SlugPathIcon.png" alt="Slug Path Icon" style={{ width: 50, height: 50 }} />
            <h1 style={{ margin: 0 }}>Club Lead Login</h1>
          </div>
          <Link className="btn" href="/">View Community Directory</Link>
        </div>
        <div style={{ width: "100%", height: 0.5, background: "#333333", marginBottom: 16 }} />
        <p className="small" style={{ margin: 0 }}>
          Sign in with your UCSC Google account to access club leader tools.
        </p>
        <div className="row" style={{ marginTop: 12 }}>
          <button
            className="btn btnPrimary"
            type="button"
            onClick={onLogin}
            style={{ padding: "8px 16px", background: "#FDF0A6", border: "1px solid #FDF0A6", borderRadius: 20, color: "#000", fontFamily: "Sarabun", fontSize: 14, fontWeight: 600, lineHeight: "1", textDecoration: "none", boxShadow: "0 6px 14px rgba(251,191,36,0.14)" }}
          >
            Continue with Google
          </button>
        </div>
      </div>
    </main>
  );
}
