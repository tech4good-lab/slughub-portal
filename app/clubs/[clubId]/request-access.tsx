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

const cardStyle: React.CSSProperties = {
  background: "white",
  borderRadius: 25,
  boxShadow: "0 4px 12px rgba(0, 0, 0, 0.08)",
  padding: "clamp(20px, 4vw, 32px)",
  color: "#111827",
  fontFamily: "Sarabun",
};

const textareaStyle: React.CSSProperties = {
  width: "100%",
  padding: "12px 14px",
  borderRadius: 12,
  border: "1px solid rgba(16, 24, 40, 0.18)",
  fontSize: 14,
  fontFamily: "Sarabun",
  boxSizing: "border-box",
  background: "#f9fafb",
  color: "#111827",
  outline: "none",
  resize: "vertical",
  marginTop: 10,
};

const buttonStyle: React.CSSProperties = {
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  height: 38,
  padding: "0 22px",
  background: "#FDF0A6",
  borderRadius: 20,
  color: "#000",
  fontFamily: "Sarabun",
  fontSize: 14,
  fontWeight: 600,
  border: "none",
  cursor: "pointer",
  boxShadow: "0 2px 6px rgba(251, 191, 36, 0.2)",
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
    } catch {
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
    if (!message.trim()) {
      setErr("Please provide some context or evidence.");
      return;
    }
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

  if (loading || !loaded) {
    return (
      <div style={{ ...cardStyle, textAlign: "center", color: "#6b7280", fontSize: 14 }}>
        Loading access status...
      </div>
    );
  }

  const request = info?.byClubId?.[clubId];
  const status = String(request?.status ?? "").toLowerCase();

  if (status === "approved") {
    return (
      <div
        style={{
          ...cardStyle,
          border: "1px solid #bbf7d0",
          background: "#f0fdf4",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 6 }}>
          <span style={{ fontSize: 18 }}>✅</span>
          <h3 style={{ margin: 0, fontSize: 18, fontWeight: 700, color: "#166534" }}>
            You have leader access
          </h3>
        </div>
        <p style={{ margin: "4px 0 16px 0", color: "#15803d", fontSize: 14 }}>
          This community is linked to your account and appears in your dashboard.
        </p>
        <Link
          href="/leader/dashboard"
          style={{
            ...buttonStyle,
            textDecoration: "none",
          }}
        >
          Go to Dashboard
        </Link>
      </div>
    );
  }

  if (status === "pending") {
    return (
      <div
        style={{
          ...cardStyle,
          border: "1px solid #fde68a",
          background: "#fffbeb",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 6 }}>
          <span style={{ fontSize: 18 }}>⏳</span>
          <h3 style={{ margin: 0, fontSize: 18, fontWeight: 700, color: "#92400e" }}>
            Leader access request: Pending
          </h3>
        </div>
        <p style={{ margin: "4px 0 0 0", color: "#78350f", fontSize: 14 }}>
          Your request has been submitted and is awaiting administrator review.
        </p>
      </div>
    );
  }

  if (status === "rejected") {
    return (
      <div
        style={{
          ...cardStyle,
          border: "1px solid #fecaca",
          background: "white",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8 }}>
          <span style={{ fontSize: 18 }}>⚠️</span>
          <h3 style={{ margin: 0, fontSize: 18, fontWeight: 700, color: "#b91c1c" }}>
            Leader access request: Needs Review
          </h3>
        </div>
        <p style={{ margin: "4px 0 14px 0", color: "#6b7280", fontSize: 14 }}>
          {request?.reviewNotes
            ? `Admin note: ${request.reviewNotes}`
            : "You can submit another request with additional details or evidence."}
        </p>

        <label style={{ display: "block", fontSize: 13, fontWeight: 600, color: "#374151" }}>
          Message / Evidence
        </label>
        <textarea
          style={textareaStyle}
          rows={3}
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Add context (e.g. proof you are an officer, role, official UCSC email, etc.)"
        />

        {err && (
          <div
            style={{
              marginTop: 10,
              padding: "8px 12px",
              background: "#fef2f2",
              borderRadius: 8,
              color: "#b91c1c",
              fontSize: 13,
            }}
          >
            {err}
          </div>
        )}
        {msg && (
          <div
            style={{
              marginTop: 10,
              padding: "8px 12px",
              background: "#f0fdf4",
              borderRadius: 8,
              color: "#166534",
              fontSize: 13,
            }}
          >
            {msg}
          </div>
        )}

        <div style={{ marginTop: 14 }}>
          <button
            onClick={submit}
            disabled={busy}
            style={{
              ...buttonStyle,
              opacity: busy ? 0.7 : 1,
              cursor: busy ? "not-allowed" : "pointer",
            }}
          >
            {busy ? "Submitting..." : "Request again"}
          </button>
        </div>
      </div>
    );
  }

  const unauth = !!info?.unauth;

  return (
    <div style={cardStyle}>
      <h3
        style={{
          margin: 0,
          fontSize: 18,
          fontWeight: 700,
          color: "#111827",
          lineHeight: 1.4,
        }}
      >
        Are you a leader in this community?
      </h3>
      <p
        style={{
          margin: "6px 0 14px 0",
          color: "#4b5563",
          fontSize: 14,
          lineHeight: 1.5,
        }}
      >
        Provide proof or context regarding your role to request dashboard management access.
      </p>

      {unauth ? (
        <div
          style={{
            padding: "14px 18px",
            background: "#eff6ff",
            border: "1px solid #bfdbfe",
            borderRadius: 14,
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            flexWrap: "wrap",
            gap: 12,
          }}
        >
          <span style={{ fontSize: 14, color: "#1e40af", fontWeight: 500 }}>
            Please sign in with your UCSC account to request leader access.
          </span>
          <Link
            href="/login"
            style={{
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              height: 34,
              padding: "0 18px",
              background: "#FDF0A6",
              borderRadius: 18,
              color: "#000",
              fontSize: 13,
              fontWeight: 600,
              textDecoration: "none",
            }}
          >
            Sign in
          </Link>
        </div>
      ) : (
        <>
          <textarea
            style={textareaStyle}
            rows={3}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Examples of evidence include your name being on an official webpage, email references, or a link to your community's Discord / social accounts."
          />

          {err && (
            <div
              style={{
                marginTop: 10,
                padding: "8px 12px",
                background: "#fef2f2",
                borderRadius: 8,
                color: "#b91c1c",
                fontSize: 13,
              }}
            >
              {err}
            </div>
          )}
          {msg && (
            <div
              style={{
                marginTop: 10,
                padding: "8px 12px",
                background: "#f0fdf4",
                borderRadius: 8,
                color: "#166534",
                fontSize: 13,
              }}
            >
              {msg}
            </div>
          )}

          <div style={{ marginTop: 14 }}>
            <button
              onClick={submit}
              disabled={busy}
              style={{
                ...buttonStyle,
                opacity: busy ? 0.7 : 1,
                cursor: busy ? "not-allowed" : "pointer",
              }}
            >
              {busy ? "Submitting..." : "Request access"}
            </button>
          </div>
        </>
      )}
    </div>
  );
}
