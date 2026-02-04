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

export default function PendingApprovals({ email }: { email?: string }) {
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

      <div style={{ position: 'fixed', inset: 0, background: '#EDF4FF', overflow: 'auto' }}>
        <div style={{ width: 951, height: 539, margin: '48px auto', position: 'relative' }}>
          <div style={{ width: 951, height: 525, left: 0, top: 1, position: "absolute", background: "#EDF4FF", border: "none", boxSizing: 'border-box' }} />
          <div style={{ width: 553, height: 69, left: 70, top: 36, position: "absolute", color: "black", fontSize: 35, fontFamily: "Sarabun", fontWeight: "500", wordWrap: "break-word" }}>Admin: Pending Club Approvals</div>
          <div style={{ left: 69, top: 86, position: "absolute", color: "black", fontSize: 13, fontFamily: "Sarabun", fontWeight: "400", wordWrap: "break-word" }}>Logged in as: {email ?? ""}</div>
          <div style={{ left: 69, top: 106, position: 'absolute', width: 770, height: 2, background: 'rgba(0,0,0,0.25)' }} />
          <div style={{ width: 79, height: 30, left: 861, top: 11, position: 'absolute', background: '#FDF0A6', boxShadow: '0px 4px 4px rgba(0, 0, 0, 0.25)', borderRadius: 25, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Link href='/' style={{ color: 'black', fontFamily: 'Sarabun', fontWeight: 400 }}>Home</Link>
          </div>
          <div style={{ width: 41, height: 41, left: 762, top: 144, position: "absolute", opacity: 0.75, background: "linear-gradient(0deg, #D0E2FF 0%, #D0E2FF 100%), #D9D9D9", borderRadius: 9999 }} />
          <div style={{ width: 41, height: 41, left: 616, top: 485, position: "absolute", opacity: 0.75, background: "linear-gradient(0deg, #D0E2FF 0%, #D0E2FF 100%), #D9D9D9", borderRadius: 9999 }} />
          <div style={{ width: 41, height: 41, left: 542, top: 0, position: "absolute", opacity: 0.75, background: "linear-gradient(0deg, #D0E2FF 0%, #D0E2FF 100%), #D9D9D9", borderRadius: 9999 }} />
          <div style={{ width: 22, height: 17, left: 729, top: 277, position: "absolute", opacity: 0.75, background: "linear-gradient(0deg, #D0E2FF 0%, #D0E2FF 100%), #D9D9D9", borderRadius: 9999 }} />
          <div style={{ width: 100, height: 100, left: 838, top: 426, position: "absolute", opacity: 0.75, background: "linear-gradient(0deg, #D0E2FF 0%, #D0E2FF 100%), #D9D9D9", borderRadius: 9999 }} />
          <div style={{ width: 39, height: 27, left: 651, top: 373, position: "absolute", opacity: 0.75, background: "linear-gradient(0deg, #FDF0A6 0%, #FDF0A6 100%), #D9D9D9", borderRadius: 9999 }} />
          <div style={{ width: 17, height: 17, left: 913, top: 426, position: "absolute", opacity: 0.75, background: "linear-gradient(0deg, #FDF0A6 0%, #FDF0A6 100%), #D9D9D9", borderRadius: 9999 }} />
          <div style={{ width: 26, height: 26, left: 883, top: 316, position: "absolute", opacity: 0.75, background: "linear-gradient(0deg, #FDF0A6 0%, #FDF0A6 100%), #D9D9D9", borderRadius: 9999 }} />
          <div style={{ width: 100, height: 100, left: 551, top: 214, position: "absolute", opacity: 0.75, background: "linear-gradient(0deg, #D0E2FF 0%, #D0E2FF 100%), #D9D9D9", borderRadius: 9999 }} />
          <div style={{ width: 17, height: 20, left: 657, top: 413, position: "absolute", opacity: 0.75, background: "linear-gradient(0deg, #D0E2FF 0%, #D0E2FF 100%), #D9D9D9", borderRadius: 9999 }} />
          <div style={{ width: 17, height: 20, left: 583, top: 26, position: "absolute", opacity: 0.75, background: "linear-gradient(0deg, #FDF0A6 0%, #FDF0A6 100%), #D9D9D9", borderRadius: 9999 }} />
          <div style={{ width: 75, height: 75, left: 828, top: 214, position: "absolute", opacity: 0.75, background: "linear-gradient(0deg, #D0E2FF 0%, #D0E2FF 100%), #D9D9D9", borderRadius: 9999 }} />
          <div style={{ width: 41, height: 41, left: 504, top: 443, position: "absolute", opacity: 0.75, background: "linear-gradient(0deg, #D0E2FF 0%, #D0E2FF 100%), #D9D9D9", borderRadius: 9999 }} />
          <div style={{ position: 'absolute', left: '50%', transform: 'translateX(-50%)', bottom: 12, fontSize: 15, fontFamily: 'Sarabun', color: 'black' }}>
            Made with ❤️ from the <a href="#" style={{ color: '#69A1FF', textDecoration: 'underline' }}>Community RAG Team</a>
          </div>

          {clubs.length === 0 ? (
            <>
              <div style={{ width: 770, height: 59, left: 83, top: 132, position: "absolute", opacity: 0.75, background: "#FAFAFA", boxShadow: "0px 4px 4px rgba(0, 0, 0, 0.25)", borderRadius: 15 }} />
              <div style={{ width: 600, height: 25, left: 93, top: 140, position: "absolute", color: "black", fontSize: 16, fontFamily: "Sarabun", fontWeight: "400", whiteSpace: 'nowrap' }}>No pending clubs!</div>
            </>
          ) : (
            clubs.map((c, i) => {
              const top = 132 + i * 77;
              const bg = i % 2 === 0 ? "#FAFAFA" : "#ECECEC";
              return (
                <div key={c.recordId}>
                  <div style={{ width: 770, height: 59, left: 83, top: top, position: "absolute", opacity: 0.75, background: bg, boxShadow: "0px 4px 4px rgba(0, 0, 0, 0.25)", borderRadius: 15 }} />
                  <div style={{ width: 96, height: 25, left: 93, top: top + 8, position: "absolute", color: "black", fontSize: 16, fontFamily: "Sarabun", fontWeight: "400", wordWrap: "break-word" }}>{c.name ?? "Untitled club"}</div>
                  <div style={{ left: 106, top: top + 33, position: "absolute", color: "black", fontSize: 12, fontFamily: "Sarabun", fontWeight: "400", wordWrap: "break-word" }}>{c.description ?? "Club description..."}</div>

                  <div style={{ width: 68, height: 24, left: 716, top: top + 12, position: "absolute", opacity: 0.75, background: "#FDF0A6", boxShadow: "0px 4px 4px rgba(0, 0, 0, 0.25)", borderRadius: 15, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: busy[c.recordId] ? 'not-allowed' : 'pointer' }} onClick={() => !busy[c.recordId] && act(c.recordId, 'approve')}>
                    <div style={{ color: 'black', fontSize: 15, fontFamily: 'Sarabun' }}>{busy[c.recordId] ? 'Working...' : 'Approve'}</div>
                  </div>

                  <div style={{ width: 52, height: 24, left: 792, top: top + 12, position: "absolute", opacity: 0.75, background: "#D9D9D9", boxShadow: "0px 4px 4px rgba(0, 0, 0, 0.25)", borderRadius: 15, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: busy[c.recordId] ? 'not-allowed' : 'pointer' }} onClick={() => !busy[c.recordId] && act(c.recordId, 'reject')}>
                    <div style={{ color: 'black', fontSize: 15, fontFamily: 'Sarabun' }}>{busy[c.recordId] ? 'Working...' : 'Reject'}</div>
                  </div>

                  <span className="small" style={{ left: 380, top: top + 33, position: 'absolute', opacity: 0.7 }}>{c.submittedAt ? new Date(c.submittedAt).toLocaleString() : ''}</span>
                </div>
              );
            })
          )}

        </div>
      </div>
    </>
  );
}
