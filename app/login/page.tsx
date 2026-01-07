"use client";

import { useState } from "react";
import Link from "next/link";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [err, setErr] = useState<string | null>(null);

  const onLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErr(null);

    const res = await signIn("credentials", {
      email,
      password,
      redirect: false,
    });

    if (res?.error) {
      setErr("Invalid email or password.");
      return;
    }

    router.push("/leader/dashboard");
    router.refresh();
  };

  return (
    <main className="container">
      <div className="row" style={{ justifyContent: "space-between" }}>
        <h1>Login</h1>
        <Link className="btn" href="/">Home</Link>
      </div>

      <form className="card" style={{ marginTop: 14 }} onSubmit={onLogin}>
        <label className="label">Email</label>
        <input className="input" value={email} onChange={(e) => setEmail(e.target.value)} />

        <div style={{ height: 10 }} />

        <label className="label">Password</label>
        <input className="input" type="password" value={password} onChange={(e) => setPassword(e.target.value)} />

        {err && <p className="small" style={{ marginTop: 10 }}>{err}</p>}

        <div className="row" style={{ marginTop: 12 }}>
          <button className="btn btnPrimary" type="submit">Login</button>
          <Link className="btn" href="/signup">Create account</Link>
        </div>
      </form>
    </main>
  );
}
