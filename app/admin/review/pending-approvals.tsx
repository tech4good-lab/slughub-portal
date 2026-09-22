"use client";

import { useEffect, useState } from "react";
import { linkPillStyle } from "../../clubs/[clubId]/page";
import Link from "next/link";
import Image from "next/image";
import DecorativeBubbles from "@/app/components/DecorativeBubbles";
import Navbar from "@/app/components/Navbar";

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

export default function PendingApprovals({ email, session }: { email?: string; session?: any }) {
  const [clubs, setClubs] = useState<PendingClub[]>([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);

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
      <div
        style={{
          minHeight: "100dvh",
          background: "#edf4ff",
          position: "relative",
          zIndex: 1,
          overflowX: "hidden",
          display: "flex",
          flexDirection: "column",
        }}
      >
        <DecorativeBubbles />
        <Navbar session={session} isAdmin={true} isLeader={false} />
        <div
          style={{
            flex: 1,
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            padding: "40px 20px",
          }}
        >
          <div
            style={{
              width: "100%",
              maxWidth: 900,
              background: "white",
              borderRadius: 25,
              boxShadow: "0 4px 12px rgba(0, 0, 0, 0.08)",
              padding: "40px",
              textAlign: "center",
              color: "#6b7280",
              fontFamily: "Sarabun, sans-serif",
            }}
          >
            Loading pending communities…
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      style={{
        minHeight: "100dvh",
        background: "#edf4ff",
        position: "relative",
        zIndex: 1,
        overflowX: "hidden",
        display: "flex",
        flexDirection: "column",
      }}
    >
      {/* Signature Floating Ambient Bubbles */}
      <DecorativeBubbles />

      {/* Floating Pill Navigation Bar */}
      <Navbar session={session} isAdmin={true} isLeader={false} />

      {/* Main card container */}
      <div
        style={{
          flex: 1,
          display: "flex",
          justifyContent: "center",
          position: "relative",
          zIndex: 10,
          minHeight: 0,
          padding: "clamp(16px, 3vw, 28px) clamp(12px, 3vw, 20px) 40px",
        }}
      >
        <div
          style={{
            width: "100%",
            maxWidth: 900,
            background: "white",
            borderRadius: 25,
            boxShadow: "0 4px 12px rgba(0, 0, 0, 0.08)",
            padding: "clamp(20px, 4vw, 40px)",
            position: "relative",
            zIndex: 10,
            display: "flex",
            flexDirection: "column",
          }}
        >
          {err && (
            <div
              style={{
                marginBottom: 20,
                padding: 15,
                background: "#FEE2E2",
                border: "1px solid rgba(239,68,68,0.25)",
                borderRadius: 10,
                color: "#DC2626",
                fontSize: 14,
                fontFamily: "Sarabun",
              }}
            >
              {err}
            </div>
          )}

          {/* Header */}
          <div style={{ marginBottom: 18 }}>
            <h1
              style={{
                margin: "0 0 6px 0",
                color: "black",
                fontSize: "clamp(24px, 5vw, 32px)",
                fontFamily: "Sarabun, sans-serif",
                fontWeight: 700,
              }}
            >
              Admin: Pending Community Approvals
            </h1>
            <p
              style={{
                color: "#6b7280",
                fontSize: 14,
                fontFamily: "Sarabun, sans-serif",
                margin: 0,
              }}
            >
              Logged in as: <strong style={{ color: "#111827" }}>{email}</strong> (admin)
            </p>
          </div>

          <div
            style={{
              width: "100%",
              height: 1,
              background: "rgba(16, 24, 40, 0.08)",
              marginBottom: 24,
            }}
          />

        <div>
          {clubs.length === 0 ? (
            <div
              style={{
                padding: "40px 20px",
                textAlign: "center",
                color: "#999",
                fontSize: 16,
                fontFamily: "Sarabun",
              }}
            >
              No pending communities! 🎉
            </div>
          ) : (
            clubs.map((c: any, i) => (
              <div
                key={c.recordId}
                style={{
                  marginBottom: 12,
                  padding: "16px 20px",
                  background: i % 2 === 0 ? "#FAFAFA" : "#F3F4F6",
                  borderRadius: 12,
                  display: "flex",
                  alignItems: "flex-start",
                  justifyContent: "space-between",
                  gap: 16,
                  flexWrap: "wrap",
                }}
              >
                <div style={{ flex: "1 1 200px", minWidth: 0 }}>
                  <div
                    style={{
                      color: "black",
                      fontSize: 16,
                      fontFamily: "Sarabun",
                      fontWeight: "600",
                      margin: 0,
                    }}
                  >
                    {c.name ?? "Untitled community"}
                  </div>
                  <div
                    style={{
                      color: "#666",
                      fontSize: 13,
                      fontFamily: "Sarabun",
                      fontWeight: "400",
                      margin: "4px 0 0 0",
                    }}
                  >
                    {c.description ?? "Community description..."}
                  </div>
                </div>

                <div
                  style={{
                    display: "flex",
                    gap: 10,
                    flexWrap: "wrap",
                    flexShrink: 0,
                  }}
                > 
                {/* helo */}
                  <button
                    onClick={() =>
                      !busy[c.recordId] && act(c.recordId, "approve")
                    }
                    disabled={busy[c.recordId]}
                    style={{
                      padding: "8px 16px",
                      background: "#B8FFB8",
                      border: "1px solid #0BDA51",
                      borderRadius: 20,
                      color: "#000",
                      fontSize: 14,
                      fontFamily: "Sarabun",
                      fontWeight: "600",
                      cursor: busy[c.recordId] ? "not-allowed" : "pointer",
                      opacity: busy[c.recordId] ? 0.6 : 1,
                      boxShadow: "0 6px 14px rgba(251,191,36,0.14)",
                      whiteSpace: "nowrap",
                    }}
                  >
                    {busy[c.recordId] ? "Working..." : "Approve"}
                  </button>
                  <button
                    onClick={() =>
                      !busy[c.recordId] && act(c.recordId, "reject")
                    }
                    disabled={busy[c.recordId]}
                    style={{
                      padding: "8px 16px",
                      background: "#FEE2E2",
                      border: "1px solid #FCA5A5",
                      borderRadius: 20,
                      color: "#7F1D1D",
                      fontSize: 14,
                      fontFamily: "Sarabun",
                      fontWeight: "600",
                      cursor: busy[c.recordId] ? "not-allowed" : "pointer",
                      opacity: busy[c.recordId] ? 0.6 : 1,
                      //boxShadow: "0 6px 14px rgba(251,191,36,0.14)",
                      whiteSpace: "nowrap",
                    }}
                  >
                    {busy[c.recordId] ? "Working..." : "Reject"}
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>

    {/* Footer */}
      <div
        style={{
          textAlign: "center",
          fontSize: 16,
          fontWeight: 500,
          color: "#4b5563",
          marginTop: "auto",
          padding: "16px 0 28px",
          position: "relative",
          zIndex: 10,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: 7,
          flexWrap: "wrap",
        }}
      >
        <span>A</span>
        <a
          href="https://tech4good.soe.ucsc.edu/"
          target="_blank"
          rel="noreferrer"
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 6,
            color: "#1e1e1e",
            textDecoration: "none",
            fontFamily: "'Nunito Sans', 'Helvetica Neue', sans-serif",
            fontWeight: 700,
            fontSize: 17,
            letterSpacing: "-0.04em",
          }}
        >
          <Image
            src="/tech4good-smile-small.png"
            alt="Tech4Good Smile"
            width={22}
            height={22}
          />
          <span>TECH4GOOD LAB</span>
        </a>
        <span>project</span>
      </div>
    </div>
  );
}
