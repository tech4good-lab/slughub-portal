"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

async function safeJson(res: Response) {
  const text = await res.text();
  if (!text) return null;
  try {
    return JSON.parse(text);
  } catch {
    return { error: text };
  }
}

const accessBtnStyle = {
  padding: "8px 16px",
  background: "#FDF0A6",
  border: "1px solid #FDF0A6",
  borderRadius: 20,
  color: "#000",
  fontFamily: "Sarabun",
  fontSize: 14,
  fontWeight: 600,
  lineHeight: "1",
  textDecoration: "none",
  boxShadow: "0 6px 14px rgba(251,191,36,0.14)",
};

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

    try {
      const cached = sessionStorage.getItem("accessRequestsMine");
      if (cached) {
        setInfo(JSON.parse(cached));
      }
    } catch {
      /* ignore */
    }

    try {
      const res = await fetch("/api/access-requests", {
        cache: "no-store",
        headers: { Pragma: "no-cache" },
      });

      const data = await safeJson(res);

      if (res.status === 401) {
        setInfo({ unauth: true });
      } else if (!res.ok) {
        setErr(data?.error ?? "Failed to load access status.");
      } else {
        setInfo(data);
        sessionStorage.setItem("accessRequestsMine", JSON.stringify(data));
      }
    } catch (e) {
      setErr("Network error loading status.");
    } finally {
      setLoading(false);
      setLoaded(true);
    }
  };
  useEffect(() => {
    setLoaded(false);
    setInfo(null);
    load();
  }, [clubId]);

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
    if (data?.request?.clubId) {
      const next = {
        ...(info ?? {}),
        byClubId: {
          ...((info ?? {}) as any).byClubId,
          [data.request.clubId]: data.request,
        },
      };
      setInfo(next);
      try {
        sessionStorage.setItem("accessRequestsMine", JSON.stringify(next));
      } catch {
        // ignore cache errors
      }
    } else {
      await load();
    }
  };

  if (loading) {
    return (
      <div className="card" style={{ marginTop: 14 }}>
        <p className="small">Loading access status...</p>
      </div>
    );
  }

  if (!loaded) {
    return (
      <div className="card" style={{ marginTop: 14 }}>
        <p className="small">Loading access status...</p>
      </div>
    );
  }

  const request = info?.byClubId?.[clubId];
  const status = String(request?.status ?? "").toLowerCase();

  if (status === "approved") {
    return (
      <div
        className="card"
        style={{ marginTop: 14, border: "1px solid rgba(34,197,94,0.25)" }}
      >
        <h3 style={{ marginTop: 0 }}>You have leader access</h3>
        <p className="small" style={{ marginTop: 8 }}>
          This community should appear in your dashboard.
        </p>
        <div className="row" style={{ marginTop: 12 }}>
          <Link
            className="btn btnPrimary"
            href="/leader/dashboard"
            style={accessBtnStyle}
          >
            Go to Dashboard
          </Link>
        </div>
      </div>
    );
  }

  if (status === "pending") {
    return (
      <div
        className="card"
        style={{ marginTop: 14, border: "1px solid rgba(251,191,36,0.25)" }}
      >
        <h3 style={{ marginTop: 0 }}>Leader access request: Pending</h3>
        <p className="small" style={{ marginTop: 8 }}>
          Your request is awaiting admin review.
        </p>
      </div>
    );
  }

  if (status === "rejected") {
    return (
      <div
        className="card"
        style={{ marginTop: 14, border: "1px solid rgba(239,68,68,0.25)" }}
      >
        <h3 style={{ marginTop: 0 }}>Leader access request: Rejected</h3>
        <p className="small" style={{ marginTop: 8 }}>
          {request?.reviewNotes
            ? `Admin note: ${request.reviewNotes}`
            : "You can submit another request with more info."}
        </p>

        <label className="label" style={{ marginTop: 12 }}>
          Message (optional)
        </label>
        <textarea
          className="input"
          rows={3}
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Add context (e.g., proof you're an officer, role, email, etc.)"
        />

        {err && (
          <p className="small" style={{ marginTop: 10 }}>
            {err}
          </p>
        )}
        {msg && (
          <p className="small" style={{ marginTop: 10 }}>
            {msg}
          </p>
        )}

        <div className="row" style={{ marginTop: 12 }}>
          <button
            className="btn btnPrimary"
            onClick={submit}
            disabled={busy}
            style={accessBtnStyle}
          >
            {busy ? "Submitting..." : "Request again"}
          </button>
        </div>
      </div>
    );
  }

  const unauth = !!info?.unauth;

  return (
    <div className="card" style={{ marginTop: 14 }}>
      <h3 style={{ marginTop: 0 }}>Request leader access</h3>
      <p className="small" style={{ marginTop: 8 }}>
        If you are a community leader, request editing access to this community profile.
      </p>
      {unauth && (
        <p className="small" style={{ marginTop: 8 }}>
          Sign in to request leader access.
        </p>
      )}

      <label className="label">Message (optional)</label>
      <textarea
        className="input"
        rows={3}
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        placeholder="e.g., I'm the treasurer for this community - please grant me leader access."
      />

      {err && (
        <p className="small" style={{ marginTop: 10 }}>
          {err}
        </p>
      )}
      {msg && (
        <p className="small" style={{ marginTop: 10 }}>
          {msg}
        </p>
      )}

      <div className="row" style={{ marginTop: 12 }}>
        <button
          className="btn btnPrimary"
          onClick={submit}
          disabled={busy || unauth}
          style={accessBtnStyle}
        >
          {busy ? "Submitting..." : "Request access"}
        </button>
      </div>
    </div>
  );
}
