"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
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

function StatusPill({ status }: { status?: string }) {
  const s = (status || "").toLowerCase();

  let label = "Draft";
  if (s === "pending") label = "Pending approval";
  if (s === "approved") label = "Approved (Live)";
  if (s === "rejected") label = "Rejected";

  const border =
    s === "approved"
      ? "2px solid rgba(34,197,94,0.45)"
      : s === "pending"
      ? "2px solid rgba(234,179,8,0.45)"
      : s === "rejected"
      ? "2px solid rgba(239,68,68,0.45)"
      : "2px solid rgba(148,163,184,0.35)";

  const dot =
    s === "approved"
      ? "rgb(34,197,94)"
      : s === "pending"
      ? "rgb(234,179,8)"
      : s === "rejected"
      ? "rgb(239,68,68)"
      : "rgb(148,163,184)";

  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 8,
        padding: "8px 12px",
        borderRadius: 999,
        border,
        background: "rgba(255,255,255,0.04)",
        fontSize: 13,
        fontWeight: 700,
      }}
      title={`Status: ${label}`}
    >
      <span
        style={{
          width: 8,
          height: 8,
          borderRadius: 999,
          background: dot,
        }}
      />
      {label}
    </span>
  );
}

async function safeJson(res: Response) {
  const text = await res.text();
  if (!text) return null;
  try {
    return JSON.parse(text);
  } catch {
    return { error: text };
  }
}

export default function EditClubPage() {
  const [draft, setDraft] = useState<ClubDraft>(emptyDraft);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [err, setErr] = useState<string | null>(null);
  const [msg, setMsg] = useState<string | null>(null);

  const [status, setStatus] = useState<string>("");
  const [reviewNotes, setReviewNotes] = useState<string>("");

  useEffect(() => {
    (async () => {
      setLoading(true);
      setErr(null);
      setMsg(null);

      const res = await fetch("/api/leader/club", { cache: "no-store" });

      if (res.status === 401) {
        window.location.href = "/login";
        return;
      }

      if (res.status === 403) {
        window.location.href = "/forbidden";
        return;
      }

      const data = await safeJson(res);
      const club = (data?.club ?? null) as Club | null;

      if (club) {
        setDraft({
          name: club.name ?? "",
          description: club.description ?? "",
          contactName: club.contactName ?? "",
          contactEmail: club.contactEmail ?? "",
          calendarUrl: club.calendarUrl ?? "",
          discordUrl: club.discordUrl ?? "",
          websiteUrl: club.websiteUrl ?? "",
          instagramUrl: club.instagramUrl ?? "",
          linkedinUrl: club.linkedinUrl ?? "",
        });

        setStatus(String((club as any).status ?? ""));
        setReviewNotes(String((club as any).reviewNotes ?? ""));
      } else {
        setStatus("");
        setReviewNotes("");
      }

      setLoading(false);
    })();
  }, []);

  const set = (k: keyof ClubDraft, v: string) => setDraft((d) => ({ ...d, [k]: v }));

  const onSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setErr(null);
    setMsg(null);
    setSaving(true);

    const res = await fetch("/api/leader/club", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(draft),
    });

    const data = await safeJson(res);

    if (!res.ok) {
      setErr(data?.error ?? "Save failed.");
      setSaving(false);
      return;
    }

    const updated = data?.club as any;
    const nextStatus = String(updated?.status ?? "pending");
    setStatus(nextStatus);
    setReviewNotes(String(updated?.reviewNotes ?? ""));

    if (nextStatus === "pending") {
      setMsg(
        "Saved! Your changes were submitted for admin approval. They won't appear in the public community directory until approved."
      );
    } else if (nextStatus === "approved") {
      setMsg("Saved! Your club profile is live in the public directory.");
    } else if (nextStatus === "rejected") {
      setMsg("Saved, but your club is currently rejected. Please review admin notes and resubmit.");
    } else {
      setMsg("Saved!");
    }

    setSaving(false);
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
      <div className="row" style={{ justifyContent: "space-between", alignItems: "center" }}>
        <div className="row" style={{ gap: 12, alignItems: "center" }}>
          <h1 style={{ margin: 0 }}>Edit Club Profile</h1>
          <StatusPill status={status} />
        </div>

        <div className="row">
          <Link className="btn" href="/leader/dashboard">
            Dashboard
          </Link>
          <Link className="btn" href="/">
            Home
          </Link>
        </div>
      </div>

      {(err || msg || (status?.toLowerCase() === "rejected" && reviewNotes)) && (
        <div
          className="card"
          style={{
            marginTop: 14,
            border:
              err
                ? "1px solid rgba(239,68,68,0.35)"
                : status?.toLowerCase() === "pending"
                ? "1px solid rgba(234,179,8,0.25)"
                : "1px solid rgba(147,197,253,0.20)",
            background: "rgba(255,255,255,0.03)",
          }}
        >
          {err && <p className="small" style={{ margin: 0 }}>{err}</p>}
          {msg && <p className="small" style={{ margin: err ? "10px 0 0 0" : 0 }}>{msg}</p>}

          {status?.toLowerCase() === "rejected" && reviewNotes && (
            <p className="small" style={{ marginTop: 10, opacity: 0.9 }}>
              <strong>Admin notes:</strong> {reviewNotes}
            </p>
          )}
        </div>
      )}

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

        <div className="row" style={{ marginTop: 12 }}>
          <button className="btn btnPrimary" type="submit" disabled={saving}>
            {saving ? "Saving..." : status?.toLowerCase() === "pending" ? "Submit for approval" : "Save"}
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