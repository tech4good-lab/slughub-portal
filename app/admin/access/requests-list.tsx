"use client";

import { useEffect, useState } from "react";

type Req = {
  recordId: string;
  clubId?: string;
  requesterUserId?: string;
  requesterEmail?: string;
  message?: string;
  createdAt?: string;
};

async function safeJson(res: Response) {
  const text = await res.text();
  if (!text) return null;
  try { return JSON.parse(text); } catch { return { error: text }; }
}

export default function AccessRequestsList() {
  const [requests, setRequests] = useState<Req[]>([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);
  const [notes, setNotes] = useState<Record<string, string>>({});
  const [busy, setBusy] = useState<Record<string, boolean>>({});

  const load = async () => {
    setLoading(true);
    setErr(null);
    const res = await fetch("/api/admin/access-requests/pending", { cache: "no-store" });
    const data = await safeJson(res);
    if (!res.ok) {
      setErr(data?.error ?? "Failed to load.");
      setLoading(false);
      return;
    }
    setRequests(data?.requests ?? []);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const act = async (id: string, action: "approve" | "reject") => {
    setBusy((b) => ({ ...b, [id]: true }));
    setErr(null);

    const res = await fetch(`/api/admin/access-requests/${id}/${action}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ reviewNotes: notes[id] ?? "" }),
    });

    const data = await safeJson(res);
    if (!res.ok) {
      setErr(data?.error ?? `Failed to ${action}.`);
      setBusy((b) => ({ ...b, [id]: false }));
      return;
    }

    await load();
    setBusy((b) => ({ ...b, [id]: false }));
  };

  if (loading) {
    return (
      <div className="card" style={{ marginTop: 14, background: "#fff", color: "#000" }}>
        <p className="small">Loading requests…</p>
      </div>
    );
  }

  if (requests.length === 0) {
    return (
      <div className="card" style={{ marginTop: 14, background: "#fff", color: "#000" }}>
        <p className="small" style={{ margin: 0 }}>No pending requests 🎉</p>
      </div>
    );
  }

  return (
    <>
      {err && (
        <div className="card" style={{ marginTop: 14, border: "1px solid rgba(239,68,68,0.25)", background: "#fff", color: "#000" }}>
          <p className="small" style={{ margin: 0 }}>{err}</p>
        </div>
      )}

      <div className="grid" style={{ marginTop: 14 }}>
        {requests.map((r) => (
          <div key={r.recordId} className="card" style={{ background: "#fff", color: "#000" }}>
            <div className="row" style={{ justifyContent: "space-between", alignItems: "center" }}>
              <h2 style={{ margin: 0 }}>Club: {r.clubId}</h2>
              <span className="small" style={{ opacity: 0.75 }}>
                {r.createdAt ? new Date(r.createdAt).toLocaleString() : ""}
              </span>
            </div>

            <p className="small" style={{ marginTop: 10 }}>
              <strong>User:</strong> {r.requesterEmail ?? "—"} ({r.requesterUserId ?? "—"})
            </p>

            <p className="small" style={{ marginTop: 10 }}>
              <strong>Message:</strong> {r.message ?? "—"}
            </p>

            <label className="label" style={{ marginTop: 12 }}>Admin notes (optional)</label>
            <textarea
              className="input"
              rows={3}
              value={notes[r.recordId] ?? ""}
              onChange={(e) => setNotes((n) => ({ ...n, [r.recordId]: e.target.value }))}
              placeholder="Reason / next steps"
            />

            <div className="row" style={{ marginTop: 12 }}>
              <button
                className="btn btnPrimary"
                onClick={() => act(r.recordId, "approve")}
                disabled={!!busy[r.recordId]}
              >
                {busy[r.recordId] ? "Working..." : "Approve"}
              </button>

              <button
                className="btn"
                onClick={() => act(r.recordId, "reject")}
                disabled={!!busy[r.recordId]}
              >
                {busy[r.recordId] ? "Working..." : "Reject"}
              </button>

              <span className="small" style={{ opacity: 0.7 }}>requestId: {r.recordId}</span>
            </div>
          </div>
        ))}
      </div>
    </>
  );
}

