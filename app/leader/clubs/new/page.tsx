"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { getSession } from "next-auth/react";

export default function NewClubPage() {
  const [name, setName] = useState("");
  const [contactName, setContactName] = useState("");
  const [contactEmail, setContactEmail] = useState("");
  const [category, setCategory] = useState("Club");
  const [clubIcebreakers, setClubIcebreakers] = useState("");
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      const s = await getSession();
      const email = (s as any)?.user?.email;
      const userName = (s as any)?.user?.name;
      if (email) setContactEmail(email);
      if (userName) {
        setContactName(userName);
      } else if (email) {
        const local = String(email).split("@")[0] || "";
        const derived = local.replace(/[._\-+]/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
        setContactName(derived);
      }
    })();
  }, []);

  const create = async (e: React.FormEvent) => {
    e.preventDefault();
    setErr(null);
    setSaving(true);

    try {
      const draft = { name, contactName, contactEmail, category, clubIcebreakers };
      localStorage.setItem("clubDraft", JSON.stringify(draft));
      window.location.href = "/leader/clubs/draft/edit";
    } catch {
      setErr("Failed to save draft locally.");
      setSaving(false);
      return;
    }
  };

  return (
    <main className="container clubCreate">
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

        <div style={{ height: 10 }} />

        <label className="label">Point of Contact Name *</label>
        <input className="input" value={contactName} onChange={(e) => setContactName(e.target.value)} required />

        <div style={{ height: 10 }} />

        <label className="label">Point of Contact Email *</label>
        <input className="input" type="email" value={contactEmail} onChange={(e) => setContactEmail(e.target.value)} required />

        <div style={{ height: 10 }} />

        <label className="label">Category</label>
        <select className="input" value={category} onChange={(e) => setCategory(e.target.value)} required>
          <option>Club</option>
          <option>Org</option>
          <option>Athletic</option>
          <option>Unofficial</option>
        </select>

        <div style={{ height: 10 }} />

        <label className="label">Club Icebreakers</label>
        <textarea
          className="input"
          value={clubIcebreakers}
          onChange={(e) => setClubIcebreakers(e.target.value)}
          placeholder={"what would you like to learn from students attending your event?"}
          style={{ minHeight: 120 }}
        />

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

// (prefill handled inside the component)
