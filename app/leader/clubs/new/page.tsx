"use client";

import { useState } from "react";
import Link from "next/link";

export default function NewClubPage() {
  const [name, setName] = useState("");
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  const create = async (e: React.FormEvent) => {
    e.preventDefault();
    setErr(null);
    setSaving(true);

    const res = await fetch("/api/leader/clubs", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name }),
    });

    const data = await res.json().catch(() => ({}));

    if (!res.ok) {
      setErr(data?.error ?? "Failed to create club.");
      setSaving(false);
      return;
    }

    const clubId = data?.club?.clubId;
    if (!clubId) {
      setErr("Created club, but missing clubId.");
      setSaving(false);
      return;
    }

    window.location.href = `/leader/clubs/${clubId}/edit`;
  };

  return (
    <main className="container">
      <div className="row" style={{ justifyContent: "space-between" }}>
        <h1>Create New Club</h1>
        <div className="row">
          <Link className="btn" href="/leader/dashboard">Dashboard</Link>
          <Link className="btn" href="/directory">Directory</Link>
        </div>
      </div>

      <form className="card" style={{ marginTop: 14 }} onSubmit={create}>
        <label className="label">Club Name *</label>
        <input className="input" value={name} onChange={(e) => setName(e.target.value)} />

        {err && <p className="small" style={{ marginTop: 10 }}>{err}</p>}

        <div className="row" style={{ marginTop: 12 }}>
          <button className="btn btnPrimary" type="submit" disabled={saving}>
            {saving ? "Creating..." : "Create"}
          </button>
          <Link className="btn" href="/leader/dashboard">Cancel</Link>
        </div>
      </form>
    </main>
  );
}
