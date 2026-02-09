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
    <div style={{ position: 'fixed', inset: 0, background: '#EDF4FF', overflow: 'auto', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
      {/* Decorative bubbles */}
      <div style={{ position: 'absolute', width: 41, height: 41, left: '5%', top: '15%', opacity: 0.5, background: '#D0E2FF', borderRadius: '50%' }} />
      <div style={{ position: 'absolute', width: 100, height: 100, left: '75%', top: '10%', opacity: 0.4, background: '#D0E2FF', borderRadius: '50%' }} />
      <div style={{ position: 'absolute', width: 60, height: 60, left: '10%', top: '70%', opacity: 0.4, background: '#D0E2FF', borderRadius: '50%' }} />
      <div style={{ position: 'absolute', width: 39, height: 39, left: '80%', top: '75%', opacity: 0.5, background: '#FDF0A6', borderRadius: '50%' }} />
      <div style={{ position: 'absolute', width: 22, height: 22, left: '12%', top: '50%', opacity: 0.4, background: '#D0E2FF', borderRadius: '50%' }} />
      <div style={{ position: 'absolute', width: 75, height: 75, left: '85%', top: '45%', opacity: 0.3, background: '#D0E2FF', borderRadius: '50%' }} />
      <div style={{ position: 'absolute', width: 17, height: 17, left: '15%', top: '85%', opacity: 0.5, background: '#D0E2FF', borderRadius: '50%' }} />
      <div style={{ position: 'absolute', width: 26, height: 26, left: '82%', top: '65%', opacity: 0.4, background: '#FDF0A6', borderRadius: '50%' }} />
      
      <div style={{ width: '100%', maxWidth: 900, background: 'white', borderRadius: 25, boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)', padding: '40px', position: 'relative', zIndex: 10 }}>
        {err && (
          <div style={{ marginBottom: 20, padding: 15, background: '#FEE2E2', border: '1px solid rgba(239,68,68,0.25)', borderRadius: 10, color: '#DC2626', fontSize: 14, fontFamily: 'Sarabun' }}>
            {err}
          </div>
        )}

        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', marginBottom: 10, position: 'relative' }}>
          <img src="/SlugPathIcon.png" alt="Slug Path Icon" style={{ width: 50, height: 50, marginRight: 15 }} />
          <div>
            <div style={{ color: 'black', fontSize: 28, fontFamily: 'Sarabun', fontWeight: '700', margin: 0 }}>Admin: Pending Club Approvals</div>
            <div style={{ color: '#666', fontSize: 13, fontFamily: 'Sarabun', fontWeight: '400', margin: '4px 0 0 0' }}>Logged in as: {email ?? '<email>'}</div>
          </div>
          <div style={{ position: 'absolute', right: 0, top: 5, width: 80, height: 32, background: '#FDF0A6', boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)', borderRadius: 20, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
            <Link href='/' style={{ color: 'black', fontFamily: 'Sarabun', fontWeight: 500, fontSize: 14, textDecoration: 'none' }}>↤ Home</Link>
          </div>
        </div>

        {/* Divider */}
        <div style={{ width: '100%', height: 1, background: '#E5E7EB', margin: '20px 0 30px 0' }} />

        {/* Clubs List */}
        <div>
          {clubs.length === 0 ? (
            <div style={{ padding: '40px 20px', textAlign: 'center', color: '#999', fontSize: 16, fontFamily: 'Sarabun' }}>
              No pending clubs!
            </div>
          ) : (
            clubs.map((c, i) => (
              <div key={c.recordId} style={{ marginBottom: 12, padding: '16px 20px', background: i % 2 === 0 ? '#FAFAFA' : '#F3F4F6', borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div style={{ flex: 1 }}>
                  <div style={{ color: 'black', fontSize: 16, fontFamily: 'Sarabun', fontWeight: '600', margin: 0 }}>{c.name ?? 'Untitled club'}</div>
                  <div style={{ color: '#666', fontSize: 13, fontFamily: 'Sarabun', fontWeight: '400', margin: '4px 0 0 0' }}>{c.description ?? 'Club description...'}</div>
                </div>
                <div style={{ display: 'flex', gap: 10, marginLeft: 20 }}>
                  <button onClick={() => !busy[c.recordId] && act(c.recordId, 'approve')} disabled={busy[c.recordId]} style={{ padding: '8px 20px', background: '#FDF0A6', border: 'none', borderRadius: 8, color: 'black', fontSize: 14, fontFamily: 'Sarabun', fontWeight: '600', cursor: busy[c.recordId] ? 'not-allowed' : 'pointer', opacity: busy[c.recordId] ? 0.6 : 1, boxShadow: '0 2px 4px rgba(0, 0, 0, 0.05)' }}>
                    {busy[c.recordId] ? 'Working...' : 'Approve'}
                  </button>
                  <button onClick={() => !busy[c.recordId] && act(c.recordId, 'reject')} disabled={busy[c.recordId]} style={{ padding: '8px 20px', background: '#D9D9D9', border: 'none', borderRadius: 8, color: 'black', fontSize: 14, fontFamily: 'Sarabun', fontWeight: '600', cursor: busy[c.recordId] ? 'not-allowed' : 'pointer', opacity: busy[c.recordId] ? 0.6 : 1, boxShadow: '0 2px 4px rgba(0, 0, 0, 0.05)' }}>
                    {busy[c.recordId] ? 'Working...' : 'Reject'}
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        <div style={{ marginTop: 40, paddingTop: 20, borderTop: '1px solid #E5E7EB', textAlign: 'center', fontSize: 14, fontFamily: 'Sarabun', color: '#666' }}>
          Made with ❤️ from the <a href="#" style={{ color: '#69A1FF', textDecoration: 'underline' }}>Community RAG Team</a>
        </div>
      </div>
    </div>
  );
}
