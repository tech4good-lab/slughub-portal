"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import type { Club } from "@/lib/types";

type ClubDraft = {
  name: string;
  description: string;
  contactName: string;
  contactEmail: string;
  calendarUrl: string;
  discordUrl: string;
  websiteUrl: string;
  instagramUrl: string;
  linkedinUrl: string;
};

const emptyDraft: ClubDraft = {
  name: "",
  description: "",
  contactName: "",
  contactEmail: "",
  calendarUrl: "",
  discordUrl: "",
  websiteUrl: "",
  instagramUrl: "",
  linkedinUrl: "",
};

export default function EditClubPage() {
  const params = useParams<{ clubId: string }>();
  const router = useRouter();

  const clubId = params?.clubId;

  const [draft, setDraft] = useState<ClubDraft>(emptyDraft);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [msg, setMsg] = useState<string | null>(null);

  useEffect(() => {
    if (!clubId) return;

    (async () => {
      setLoading(true);
      setErr(null);

      const res = await fetch(`/api/leader/clubs/${clubId}`, { cache: "no-store" });

      if (res.status === 401) {
        router.push("/login");
        return;
      }
      if (res.status === 403) {
        setErr("Forbidden: you don’t have access to edit this club.");
        setLoading(false);
        return;
      }

      let data: any = null;
      try {
        data = await res.json();
      } catch {
        // ignore
      }

      if (!res.ok) {
        setErr(data?.error ?? "Failed to load club.");
        setLoading(false);
        return;
      }

      const club = data.club as Club | null;

      if (club) {
        setDraft({
          name: (club.name ?? "") as string,
          description: (club.description ?? "") as string,
          contactName: (club.contactName ?? "") as string,
          contactEmail: (club.contactEmail ?? "") as string,
          calendarUrl: (club.calendarUrl ?? "") as string,
          discordUrl: (club.discordUrl ?? "") as string,
          websiteUrl: (club.websiteUrl ?? "") as string,
          instagramUrl: (club.instagramUrl ?? "") as string,
          linkedinUrl: (club.linkedinUrl ?? "") as string,
        });
      }

      setLoading(false);
    })();
  }, [clubId, router]);

  const set = (k: keyof ClubDraft, v: string) => setDraft((d) => ({ ...d, [k]: v }));

  const onSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!clubId) return;

    setErr(null);
    setMsg(null);
    setSaving(true);

    const res = await fetch(`/api/leader/clubs/${clubId}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(draft),
    });

    let data: any = null;
    try {
      data = await res.json();
    } catch {
      // ignore
    }

    if (!res.ok) {
      setErr(data?.error ?? "Save failed.");
      setSaving(false);
      return;
    }

    // If you want the leader to clearly see "pending", show a sticky message instead of redirecting instantly:
    setMsg("Submitted! Your changes are pending admin approval.");
    setSaving(false);

    // Optional: redirect after a short delay
    setTimeout(() => router.push("/leader/dashboard"), 600);
  };

  if (loading) {
    return (
      <main className="container">
        <div className="card">
          <p className="small">Loading...</p>
        </div>
      </main>
    );
  }

  return (
    <main className="container">
      <div className="row" style={{ justifyContent: "space-between" }}>
        <h1>Edit Club Profile</h1>
        <div className="row">
          <Link className="btn" href="/leader/dashboard">
            Dashboard
          </Link>
          <Link className="btn" href="/">
            Directory
          </Link>
        </div>
      </div>

      <form className="card" style={{ marginTop: 14 }} onSubmit={onSave}>
        <label className="label">Club Name *</label>
        <input className="input" value={draft.name} onChange={(e) => set("name", e.target.value)} />

        <div style={{ height: 10 }} />

        <label className="label">Description</label>
        <textarea
          className="input"
          rows={4}
          value={draft.description}
          onChange={(e) => set("description", e.target.value)}
        />

        <hr />

        <label className="label">Point of Contact Name</label>
        <input className="input" value={draft.contactName} onChange={(e) => set("contactName", e.target.value)} />

        <div style={{ height: 10 }} />

        <label className="label">Point of Contact Email</label>
        <input className="input" value={draft.contactEmail} onChange={(e) => set("contactEmail", e.target.value)} />

        <hr />

        <label className="label">Calendar URL</label>
        <input
          className="input"
          value={draft.calendarUrl}
          onChange={(e) => set("calendarUrl", e.target.value)}
          placeholder="https://..."
        />

        <div style={{ height: 10 }} />

        <label className="label">Discord URL</label>
        <input
          className="input"
          value={draft.discordUrl}
          onChange={(e) => set("discordUrl", e.target.value)}
          placeholder="https://..."
        />

        <div style={{ height: 10 }} />

        <label className="label">Website URL</label>
        <input
          className="input"
          value={draft.websiteUrl}
          onChange={(e) => set("websiteUrl", e.target.value)}
          placeholder="https://..."
        />

        <div style={{ height: 10 }} />

        <label className="label">Instagram URL</label>
        <input
          className="input"
          value={draft.instagramUrl}
          onChange={(e) => set("instagramUrl", e.target.value)}
          placeholder="https://..."
        />

        <div style={{ height: 10 }} />

        <label className="label">LinkedIn URL</label>
        <input
          className="input"
          value={draft.linkedinUrl}
          onChange={(e) => set("linkedinUrl", e.target.value)}
          placeholder="https://..."
        />

        {err && <p className="small" style={{ marginTop: 10 }}>{err}</p>}
        {msg && <p className="small" style={{ marginTop: 10 }}>{msg}</p>}

        <div className="row" style={{ marginTop: 12 }}>
          <button className="btn btnPrimary" type="submit" disabled={saving}>
            {saving ? "Submitting..." : "Submit for Approval"}
          </button>
          <Link className="btn" href="/leader/dashboard">
            Cancel
          </Link>
        </div>

        <p className="small" style={{ marginTop: 10 }}>
          Tip: include full URLs with https://
        </p>
      </form>
    </main>
  );
}
