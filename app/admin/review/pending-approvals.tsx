"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

type PendingClub = {
  recordId: string;
  clubId?: string;
  ownerUserId?: string;
  name?: string;
  description?: string;
  contactName?: string;
  contactEmail?: string;
  calendarUrl?: string;
  discordUrl?: string;
  websiteUrl?: string;
  instagramUrl?: string;
  linkedinUrl?: string;
  submittedAt?: string;
  status?: string;
  reviewNotes?: string;
};

async function safeJson(res: Response) {
  const text = await res.text();
  if (!text) return null;
  try {
    return JSON.parse(text);
  } catch {
    return { error: text };
  }
}

export default function PendingApprovals() {
  const [clubs, setClubs] = useState<PendingClub[]>([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);

  // per-record notes + busy state
  const [notes, setNotes] = useState<Record<string, string>>({});
  const [busy, setBusy] = useState<Record<string, boolean>>({});

  const load = async () => {
    setLoading(true);
    setErr(null);

    const res = await fetch("/api/admin/clubs/pending", { cache: "no-store" });
    const data = await safeJson(res);

    if (!res.ok) {
      setErr(data?.error ?? "Failed to load pending clubs.");
      setLoading(false);
      return;
    }

    setClubs(data?.clubs ?? []);
    setLoading(false);
  };

  useEffect(() => {
    load();
  }, []);

  const act = async (recordId: string, action: "approve" | "reject") => {
    setBusy((b) => ({ ...b, [recordId]: true }));
    setErr(null);

    const res = await fetch(`/api/admin/clubs/${recordId}/${action}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ reviewNotes: notes[recordId] ?? "" }),
    });

    const data = await safeJson(res);
    if (!res.ok) {
      setErr(data?.error ?? `Failed to ${action}.`);
      setBusy((b) => ({ ...b, [recordId]: false }));
      return;
    }

    // refresh list
    await load();
    setBusy((b) => ({ ...b, [recordId]: false }));
  };

  if (loading) {
    return (
      <div className="card" style={{ marginTop: 14 }}>
        <p className="small">Loading pending clubs…</p>
      </div>
    );
  }

  return (
    <>
      {err && (
        <div className="card" style={{ marginTop: 14, border: "1px solid rgba(239,68,68,0.25)" }}>
          <p className="small" style={{ margin: 0 }}>{err}</p>
        </div>
      )}

      {clubs.length === 0 ? (
        <div className="card" style={{ marginTop: 14 }}>
          <p className="small" style={{ margin: 0 }}>No pending clubs 🎉</p>
        </div>
      ) : (
        <div className="grid" style={{ marginTop: 14 }}>
          {clubs.map((c) => (
            <div key={c.recordId} className="card">
              <div className="row" style={{ justifyContent: "space-between", alignItems: "center" }}>
                <h2 style={{ margin: 0 }}>{c.name ?? "Untitled club"}</h2>
                <span className="small" style={{ opacity: 0.75 }}>
                  {c.submittedAt ? new Date(c.submittedAt).toLocaleString() : ""}
                </span>
              </div>

              <p className="small" style={{ marginTop: 10 }}>
                {c.description ?? "No description."}
              </p>

              <div className="card" style={{ marginTop: 10, background: "rgba(255,255,255,0.02)" }}>
                <p className="small" style={{ margin: 0 }}>
                  <strong>Contact:</strong> {c.contactName ?? "—"} ({c.contactEmail ?? "—"})
                </p>
                <p className="small" style={{ marginTop: 8 }}>
                  <strong>Links:</strong>{" "}
                  {c.websiteUrl ? <Link href={c.websiteUrl} target="_blank">Website</Link> : "—"}
                  {" · "}
                  {c.discordUrl ? <Link href={c.discordUrl} target="_blank">Discord</Link> : "—"}
                  {" · "}
                  {c.calendarUrl ? <Link href={c.calendarUrl} target="_blank">Calendar</Link> : "—"}
                </p>
              </div>

              <label className="label" style={{ marginTop: 12 }}>
                Admin notes (optional)
              </label>
              <textarea
                className="input"
                rows={3}
                value={notes[c.recordId] ?? ""}
                onChange={(e) => setNotes((n) => ({ ...n, [c.recordId]: e.target.value }))}
                placeholder="Why approved/rejected? Give suggestions if rejected."
              />

              <div className="row" style={{ marginTop: 12 }}>
                <button
                  className="btn btnPrimary"
                  onClick={() => act(c.recordId, "approve")}
                  disabled={!!busy[c.recordId]}
                >
                  {busy[c.recordId] ? "Working..." : "Approve"}
                </button>

                <button
                  className="btn"
                  onClick={() => act(c.recordId, "reject")}
                  disabled={!!busy[c.recordId]}
                >
                  {busy[c.recordId] ? "Working..." : "Reject"}
                </button>

                <span className="small" style={{ opacity: 0.7 }}>
                  recordId: {c.recordId}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </>
  );
}
