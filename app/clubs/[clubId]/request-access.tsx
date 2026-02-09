"use client";

import { useState } from "react";
import Link from "next/link";

async function safeJson(res: Response) {
  const text = await res.text();
  if (!text) return null;
  try { return JSON.parse(text); } catch { return { error: text }; }
}

export default function RequestAccess({ clubId }: { clubId: string }) {
  const [message, setMessage] = useState("");
  const [info, setInfo] = useState<any>(null);
  const [msg, setMsg] = useState<string | null>(null);
  const [err, setErr] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [loading, setLoading] = useState(false);
  const [loaded, setLoaded] = useState(false);

  const load = async () => {
    setLoading(true);
    setErr(null);
    const res = await fetch(`/api/access-requests?clubId=${encodeURIComponent(clubId)}`, { cache: "no-store" });
    const data = await safeJson(res);

    if (res.status === 401) {
      setInfo({ unauth: true });
      setLoading(false);
      setLoaded(true);
      return;
    }
    if (!res.ok) {
      setErr(data?.error ?? "Failed to load request status.");
      setLoading(false);
      setLoaded(true);
      return;
    }
    setInfo(data);
    setLoading(false);
    setLoaded(true);
  };

  const submit = async () => {
    setBusy(true);
    setErr(null);
    setMsg(null);

    const res = await fetch("/api/access-requests", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ clubId, message }),
    });

    const data = await safeJson(res);

    if (res.status === 401) {
      setErr("Please log in first to request leader access.");
      setBusy(false);
      return;
    }

    if (!res.ok) {
      setErr(data?.error ?? "Request failed.");
      setBusy(false);
      return;
    }

    setMsg("Request submitted! An admin will review it.");
    setBusy(false);
    await load();
  };

  if (loading) {
    return (
      <div className="card" style={{ marginTop: 14 }}>
        <p className="small">Loading access status…</p>
      </div>
    );
  }

  if (!loaded) {
    return (
      <div className="card" style={{ marginTop: 14 }}>
        <h3 style={{ marginTop: 0 }}>Leader access</h3>
        <p className="small" style={{ marginTop: 8 }}>
          Check whether you already have leader access for this club, or request it.
        </p>
        <div className="row" style={{ marginTop: 12 }}>
          <button className="btn btnPrimary" onClick={load}>
            Check access status
          </button>
          <Link className="btn" href="/login">Log in</Link>
          <Link className="btn" href="/signup">Sign up</Link>
        </div>
      </div>
    );
  }

  const alreadyMember = !!info?.alreadyMember;
  const request = info?.request;
  const status = String(request?.status ?? "").toLowerCase();

  // If you're already a leader, show a friendly message
  if (alreadyMember) {
    return (
      <div className="card" style={{ marginTop: 14, border: "1px solid rgba(34,197,94,0.25)" }}>
        <h3 style={{ marginTop: 0 }}>You have leader access ✅</h3>
        <p className="small" style={{ marginTop: 8 }}>
          This club should appear in your dashboard.
        </p>
        <div className="row" style={{ marginTop: 12 }}>
          <Link className="btn btnPrimary" href="/leader/dashboard">Go to Dashboard</Link>
        </div>
      </div>
    );
  }

  // Not logged in
  if (info?.unauth) {
    return (
      <div className="card" style={{ marginTop: 14 }}>
        <h3 style={{ marginTop: 0 }}>Request leader access</h3>
        <p className="small" style={{ marginTop: 8 }}>
          Log in to request editing access for this club.
        </p>
        <div className="row" style={{ marginTop: 12 }}>
          <Link className="btn btnPrimary" href="/login">Log in</Link>
          <Link className="btn" href="/signup">Sign up</Link>
        </div>
      </div>
    );
  }

  // If a request exists, show its status
  if (status === "pending") {
    return (
      <div className="card" style={{ marginTop: 14, border: "1px solid rgba(251,191,36,0.25)" }}>
        <h3 style={{ marginTop: 0 }}>Leader access request: Pending ⏳</h3>
        <p className="small" style={{ marginTop: 8 }}>
          Your request is awaiting admin review.
        </p>
      </div>
    );
  }

  if (status === "rejected") {
    return (
      <div className="card" style={{ marginTop: 14, border: "1px solid rgba(239,68,68,0.25)" }}>
        <h3 style={{ marginTop: 0 }}>Leader access request: Rejected</h3>
        <p className="small" style={{ marginTop: 8 }}>
          {request?.reviewNotes ? `Admin note: ${request.reviewNotes}` : "You can submit another request with more info."}
        </p>

        <label className="label" style={{ marginTop: 12 }}>Message (optional)</label>
        <textarea
          className="input"
          rows={3}
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Add context (e.g., proof you're an officer, role, email, etc.)"
        />

        {err && <p className="small" style={{ marginTop: 10 }}>{err}</p>}
        {msg && <p className="small" style={{ marginTop: 10 }}>{msg}</p>}

        <div className="row" style={{ marginTop: 12 }}>
          <button className="btn btnPrimary" onClick={submit} disabled={busy}>
            {busy ? "Submitting..." : "Request again"}
          </button>
        </div>
      </div>
    );
  }

  // Default: no request yet → show request form
  return (
    <div className="card" style={{ marginTop: 14 }}>
      <h3 style={{ marginTop: 0 }}>Request leader access</h3>
      <p className="small" style={{ marginTop: 8 }}>
        If you are a club leader, request editing access to this club profile.
      </p>

      <label className="label">Message (optional)</label>
      <textarea
        className="input"
        rows={3}
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        placeholder="e.g., I'm the treasurer for this club—please grant me leader access."
      />

      {err && <p className="small" style={{ marginTop: 10 }}>{err}</p>}
      {msg && <p className="small" style={{ marginTop: 10 }}>{msg}</p>}

      <div className="row" style={{ marginTop: 12 }}>
        <button className="btn btnPrimary" onClick={submit} disabled={busy}>
          {busy ? "Submitting..." : "Request access"}
        </button>
      </div>
    </div>
  );
}
