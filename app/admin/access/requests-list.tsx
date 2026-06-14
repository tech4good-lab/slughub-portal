"use client";

import { useEffect, useState } from "react";

type Req = {
  recordId: string;
  clubId?: string;
  requesterUserId?: string;
  requesterEmail?: string;
  clubName?: string;
  message?: string;
  createdAt?: string;
  requesterName?: string;
};

async function safeJson(res: Response) {
  const text = await res.text();
  if (!text) return null;
  try { return JSON.parse(text); }
  catch { return { error: text }; }
}

export default function AccessRequestsList() {
  const [requests, setRequests] = useState<Req[]>([]);
  const [loading, setLoading]   = useState(true);
  const [err, setErr]           = useState<string | null>(null);
  const [notes, setNotes]       = useState<Record<string, string>>({});
  const [busy, setBusy]         = useState<Record<string, boolean>>({});

  const load = async () => {
    setLoading(true);
    setErr(null);
    const res  = await fetch("/api/admin/access-requests/pending", { cache: "no-store" });
    const data = await safeJson(res);
    if (!res.ok) { setErr(data?.error ?? "Failed to load."); setLoading(false); return; }
    setRequests(data?.requests ?? []);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const act = async (id: string, action: "approve" | "reject") => {
    setBusy((b) => ({ ...b, [id]: true }));
    setErr(null);
    const req = requests.find((r) => r.recordId === id);
    const res = await fetch(`/api/admin/access-requests/${id}/${action}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        reviewNotes:      notes[id] ?? "",
        clubId:           req?.clubId ?? "",
        requesterUserId:  req?.requesterUserId ?? "",
        requesterEmail:   req?.requesterEmail ?? "",
        clubName:         req?.clubName ?? "",
      }),
    });
    const data = await safeJson(res);
    if (!res.ok) { setErr(data?.error ?? `Failed to ${action}.`); setBusy((b) => ({ ...b, [id]: false })); return; }
    await load();
    setBusy((b) => ({ ...b, [id]: false }));
  };

  if (loading) return (
    <div style={{ padding: 20, color: "#000", fontFamily: "Sarabun", fontSize: 14 }}>
      Loading requests…
    </div>
  );

  if (requests.length === 0) return (
    <div style={{ padding: "40px 20px", textAlign: "center", color: "#999", fontSize: 16, fontFamily: "Sarabun" }}>
      No pending requests! 🎉
    </div>
  );

  return (
    <>
      {err && (
        <div style={{ marginBottom: 16, padding: "12px 16px", background: "#FEE2E2", border: "1px solid rgba(239,68,68,0.25)", borderRadius: 10, color: "#DC2626", fontSize: 14, fontFamily: "Sarabun" }}>
          {err}
        </div>
      )}

      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        {requests.map((r, i) => (
          <div
            key={r.recordId}
            style={{
              padding: "16px 20px",
              background: i % 2 === 0 ? "#FAFAFA" : "#F3F4F6",
              borderRadius: 12,
              display: "flex",
              alignItems: "flex-start",
              gap: 20,
              flexWrap: "wrap",
            }}
          >
            {/* ── Info ── */}
            <div style={{ flex: "2 1 280px", minWidth: 0 }}>
              <div style={{ fontSize: 16, fontFamily: "Sarabun", fontWeight: 600, color: "#000", marginBottom: 6 }}>
                {r.clubName ?? r.clubId ?? "Unknown Community"}
              </div>
              <div style={{ fontSize: 13, fontFamily: "Sarabun", color: "#555", marginBottom: 2 }}>
                <strong>Name:</strong> {r.requesterName || <em style={{ color: "#999" }}>No name provided</em>}
              </div>
              <div style={{ fontSize: 13, fontFamily: "Sarabun", color: "#555", marginBottom: 2 }}>
                <strong>Email:</strong> {r.requesterEmail || <em style={{ color: "#999" }}>No email provided</em>}
              </div>
              <div style={{ fontSize: 13, fontFamily: "Sarabun", color: "#555", marginBottom: 2 }}>
                <strong>Message:</strong> {r.message || <em style={{ color: "#999" }}>No message provided</em>}
              </div>
              <div style={{ fontSize: 12, fontFamily: "Sarabun", color: "#aaa", marginTop: 6 }}>
                {r.createdAt ? new Date(r.createdAt).toLocaleString() : ""}
              </div>
            </div>

            {/* ── Admin notes ── */}
            <div style={{ flex: "1 1 200px", minWidth: 160 }}>
              <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: "#555", fontFamily: "Sarabun", marginBottom: 4 }}>
                Admin note <span style={{ fontWeight: 400, color: "#aaa" }}>(sent if rejected)</span>
              </label>
              <textarea
                rows={3}
                value={notes[r.recordId] ?? ""}
                onChange={(e) => setNotes((n) => ({ ...n, [r.recordId]: e.target.value }))}
                placeholder="Reason"
                style={{
                  width: "100%",
                  padding: "8px 10px",
                  background: "#fff",
                  border: "1px solid #E5E7EB",
                  borderRadius: 8,
                  fontSize: 13,
                  fontFamily: "Sarabun",
                  resize: "vertical",
                  color: "#000",
                }}
              />
            </div>

            {/* ── Actions ── */}
            <div style={{ display: "flex", flexDirection: "column", gap: 8, flexShrink: 0, alignSelf: "center" }}>
              <button
                onClick={() => !busy[r.recordId] && act(r.recordId, "approve")}
                disabled={!!busy[r.recordId]}
                style={{
                  padding: "8px 20px", background: "#B8FFB8", border: "1px solid #0BDA51",
                  borderRadius: 20, color: "#000", fontSize: 14, fontFamily: "Sarabun",
                  fontWeight: 600, cursor: busy[r.recordId] ? "not-allowed" : "pointer",
                  opacity: busy[r.recordId] ? 0.6 : 1,
                  boxShadow: "0 6px 14px rgba(251,191,36,0.14)", whiteSpace: "nowrap",
                }}
              >
                {busy[r.recordId] ? "Working..." : "Approve"}
              </button>
              <button
                onClick={() => !busy[r.recordId] && act(r.recordId, "reject")}
                disabled={!!busy[r.recordId]}
                style={{
                  padding: "8px 20px", background: "#FEE2E2", border: "1px solid #FCA5A5",
                  borderRadius: 20, color: "#7F1D1D", fontSize: 14, fontFamily: "Sarabun",
                  fontWeight: 600, cursor: busy[r.recordId] ? "not-allowed" : "pointer",
                  opacity: busy[r.recordId] ? 0.6 : 1, whiteSpace: "nowrap",
                }}
              >
                {busy[r.recordId] ? "Working..." : "Reject"}
              </button>
            </div>
          </div>
        ))}
      </div>
    </>
  );
}