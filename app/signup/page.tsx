"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function SignupPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [err, setErr] = useState<string | null>(null);

  const onSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setErr(null);

    const res = await fetch("/api/signup", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });

    const data = await res.json();
    if (!res.ok) {
      setErr(data?.error ?? "Signup failed.");
      return;
    }

    router.push("/login");
  };

  return (
    <main className="container authPage">
      <div className="row" style={{ justifyContent: "space-between" }}>
        <h1>Club Lead Sign Up</h1>
        <Link className="btn" href="/">← Home</Link>
      </div>

      <form className="card" style={{ marginTop: 14 }} onSubmit={onSignup}>
        <label className="label">Email</label>
        <input className="input" value={email} onChange={(e) => setEmail(e.target.value)} />

        <div style={{ height: 10 }} />

        <label className="label">Password (8+ chars)</label>
        <input className="input" type="password" value={password} onChange={(e) => setPassword(e.target.value)} />

        {err && <p className="small" style={{ marginTop: 10 }}>{err}</p>}

        <div className="row" style={{ marginTop: 12 }}>
          <button className="btn btnPrimary" type="submit" style={{ padding: "8px 16px", background: "#FDF0A6", border: "1px solid #FDF0A6", borderRadius: 20, color: "#000", fontFamily: "Sarabun", fontSize: 14, fontWeight: 600, lineHeight: "1", textDecoration: "none", boxShadow: "0 6px 14px rgba(251,191,36,0.14)" }}>Create account</button>
          <Link className="btn btnPrimary" style={{ padding: "8px 16px", background: "#FDF0A6", border: "1px solid #FDF0A6", borderRadius: 20, color: "#000", fontFamily: "Sarabun", fontSize: 14, fontWeight: 600, lineHeight: "1", textDecoration: "none", boxShadow: "0 6px 14px rgba(251,191,36,0.14)" }} href="/login">Login</Link>
        </div>
      </form>
    </main>
  );
}

