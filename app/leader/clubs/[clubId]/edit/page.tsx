"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { getSession } from "next-auth/react";
import { Club } from "@prisma/client";
import Navbar from "@/app/components/Navbar";
import DecorativeBubbles from "@/app/components/DecorativeBubbles";
import Footer from "@/app/components/Footer";

type ClubDraft = {
  name: string;
  description: string;
  contactName: string;
  contactEmail: string;
  communityType: string;
  calendarUrl: string;
  discordUrl: string;
  websiteUrl: string;
  instagramUrl: string;
  linkedinUrl: string;
};

const COMMUNITY_TYPE_OPTIONS = [
  { label: "Academic", value: "Academic" },
  { label: "Campus Department/Program", value: "Campus_Department_Program" },
  { label: "Cultural and Identity", value: "Cultural_and_Identity" },
  { label: "Greek-letter", value: "Greek_letter" },
  { label: "Media and broadcasting", value: "Media_and_Broadcasting" },
  { label: "Performing and Visual Arts", value: "Performing_and_Visual_Arts" },
  { label: "Politics and Advocacy", value: "Politics_and_Advocacy" },
  { label: "Professional and Career", value: "Professional_and_Career" },
  { label: "Research", value: "Research" },
  { label: "Sports and Recreation", value: "Sports_and_Recreation" },
  { label: "Other", value: "Other" },
] as const;

const emptyDraft: ClubDraft = {
  name: "",
  description: "",
  contactName: "",
  contactEmail: "",
  communityType: "Campus_Department_Program",
  calendarUrl: "",
  discordUrl: "",
  websiteUrl: "",
  instagramUrl: "",
  linkedinUrl: "",
};

export default function EditClubPage() {
  const params = useParams<{ clubId: string }>();
  const router = useRouter();

  const clubId = params?.clubId;

  const [draft, setDraft] = useState<ClubDraft>(emptyDraft);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [msg, setMsg] = useState<string | null>(null);
  const [session, setSession] = useState<any>(null);

  useEffect(() => {
    (async () => {
      const s = await getSession();
      setSession(s);
    })();
  }, []);

  useEffect(() => {
    if (!clubId) return;

    if (clubId === "draft") {
      setLoading(true);
      setErr(null);
      try {
        const raw = localStorage.getItem("clubDraft");
        const saved = raw ? (JSON.parse(raw) as Partial<ClubDraft>) : null;
        if (saved) {
          setDraft((d) => ({ ...emptyDraft, ...saved }));
        }
      } catch {
        setErr("Failed to load draft.");
      }
      setLoading(false);
      return;
    }

    (async () => {
      setLoading(true);
      setErr(null);

      const res = await fetch(`/api/leader/clubs/${clubId}`, {
        cache: "no-store",
      });

      if (res.status === 401) {
        router.push("/login");
        return;
      }
      if (res.status === 403) {
        setErr("Forbidden: you do not have access to edit this community.");
        setLoading(false);
        return;
      }

      let data: any = null;
      try {
        data = await res.json();
      } catch {
        // ignore
      }

      if (!res.ok) {
        setErr(data?.error ?? "Failed to load community.");
        setLoading(false);
        return;
      }

      const club = data.club as Club | null;

      if (club) {
        setDraft({
          name: club.name ?? "",
          description: club.description ?? "",
          contactName: club.contactName ?? "",
          contactEmail: club.contactEmail ?? "",
          communityType: club.communityType ?? "Other",
          calendarUrl: club.calendarUrl ?? "",
          discordUrl: club.discordUrl ?? "",
          websiteUrl: club.websiteUrl ?? "",
          instagramUrl: club.instagramUrl ?? "",
          linkedinUrl: club.linkedinUrl ?? "",
        });
      }

      setLoading(false);
    })();
  }, [clubId, router]);

  const set = (k: keyof ClubDraft, v: string) =>
    setDraft((d) => ({ ...d, [k]: v }));

  const onSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!clubId) return;

    setErr(null);
    setMsg(null);
    setSaving(true);

    const isNewClub = clubId === "draft";
    const endpoint = isNewClub
      ? "/api/leader/clubs"
      : `/api/leader/clubs/${clubId}`;

    const res = await fetch(endpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(draft),
    });

    let data: any = null;
    try {
      data = await res.json();
    } catch {
      // ignore
    }

    if (!res.ok) {
      setErr(data?.error ?? "Save failed.");
      setSaving(false);
      return;
    }

    if (isNewClub) {
      try {
        localStorage.removeItem("clubDraft");
      } catch {
        // ignore
      }
      router.push("/leader/dashboard");
      router.refresh();
      return;
    }

    setMsg("Saved! Your community profile has been updated.");
    setSaving(false);
    router.refresh();
  };

  const inputStyle: React.CSSProperties = {
    width: "100%",
    padding: "10px 14px",
    borderRadius: 12,
    border: "1px solid rgba(16,24,40,0.18)",
    fontSize: 14,
    fontFamily: "Sarabun",
    boxSizing: "border-box",
    background: "#f9fafb",
    color: "#111827",
    outline: "none",
  };

  const labelStyle: React.CSSProperties = {
    display: "block",
    fontSize: 13,
    fontWeight: 600,
    color: "#374151",
    marginBottom: 6,
    fontFamily: "Sarabun",
  };

  if (loading) {
    return (
      <div
        style={{
          minHeight: "100dvh",
          background: "#EDF4FF",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          padding: "clamp(12px, 3vw, 20px)",
          boxSizing: "border-box",
          position: "relative",
        }}
      >
        <DecorativeBubbles />
        <Navbar session={session} />
        <div style={{ margin: "auto", zIndex: 10, textAlign: "center", color: "#4b5563" }}>
          Loading community details...
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div
      style={{
        minHeight: "100dvh",
        background: "#EDF4FF",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        padding: "clamp(12px, 3vw, 20px)",
        boxSizing: "border-box",
        overflowX: "hidden",
        position: "relative",
      }}
    >
      <DecorativeBubbles />
      <Navbar session={session} />

      <div
        style={{
          width: "100%",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          flex: 1,
          margin: "30px 0 40px",
          zIndex: 10,
        }}
      >
        <div
          style={{
            width: "100%",
            maxWidth: 700,
            background: "white",
            borderRadius: 25,
            boxShadow: "0 4px 12px rgba(0, 0, 0, 0.1)",
            padding: "clamp(16px, 4vw, 40px)",
            position: "relative",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              marginBottom: 20,
              paddingBottom: 20,
              borderBottom: "1px solid rgba(16,24,40,0.08)",
              gap: 16,
              flexWrap: "wrap",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 15 }}>
              <img
                src="/dashboard-icon.png"
                alt="Dashboard Icon"
                style={{ width: 44, height: 44 }}
              />
              <div>
                <h1
                  style={{
                    color: "black",
                    fontSize: "24px",
                    fontFamily: "Sarabun",
                    fontWeight: "700",
                    margin: 0,
                  }}
                >
                  Edit Community Profile
                </h1>
                <p
                  style={{
                    color: "#666",
                    fontSize: 14,
                    fontFamily: "Sarabun",
                    fontWeight: "400",
                    margin: "4px 0 0 0",
                  }}
                >
                  Update your community information, contact, and links.
                </p>
              </div>
            </div>

            <Link
              href="/leader/dashboard"
              style={{
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
                height: 34,
                padding: "0 16px",
                background: "#f3f4f6",
                borderRadius: 20,
                color: "#374151",
                fontSize: 13,
                fontFamily: "Sarabun",
                fontWeight: "600",
                textDecoration: "none",
              }}
            >
              Back to Dashboard
            </Link>
          </div>

          <form onSubmit={onSave} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            <div>
              <label style={labelStyle}>Community Name *</label>
              <input
                style={inputStyle}
                value={draft.name}
                onChange={(e) => set("name", e.target.value)}
                required
              />
            </div>

            <div>
              <label style={labelStyle}>Description *</label>
              <textarea
                required
                style={{ ...inputStyle, minHeight: 90, resize: "vertical" }}
                rows={4}
                value={draft.description}
                onChange={(e) => set("description", e.target.value)}
              />
            </div>

            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
                gap: 16,
              }}
            >
              <div>
                <label style={labelStyle}>Point of Contact Name *</label>
                <input
                  style={inputStyle}
                  value={draft.contactName}
                  onChange={(e) => set("contactName", e.target.value)}
                  required
                />
              </div>

              <div>
                <label style={labelStyle}>Point of Contact Email *</label>
                <input
                  type="email"
                  style={inputStyle}
                  value={draft.contactEmail}
                  onChange={(e) => set("contactEmail", e.target.value)}
                  required
                />
              </div>
            </div>

            <div>
              <label style={labelStyle}>Community Type</label>
              <select
                style={{ ...inputStyle, cursor: "pointer" }}
                value={draft.communityType}
                onChange={(e) => set("communityType", e.target.value)}
                required
              >
                {COMMUNITY_TYPE_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>

            <div style={{ borderTop: "1px solid rgba(16,24,40,0.08)", paddingTop: 14 }}>
              <div
                style={{
                  fontSize: 12,
                  fontWeight: 700,
                  textTransform: "uppercase",
                  letterSpacing: "0.05em",
                  color: "#6b7280",
                  marginBottom: 12,
                }}
              >
                Community Links (Optional)
              </div>

              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
                  gap: 14,
                }}
              >
                <div>
                  <label style={labelStyle}>Calendar URL</label>
                  <input
                    style={inputStyle}
                    value={draft.calendarUrl}
                    onChange={(e) => set("calendarUrl", e.target.value)}
                    placeholder="https://calendar.google.com/..."
                  />
                </div>

                <div>
                  <label style={labelStyle}>Discord URL</label>
                  <input
                    style={inputStyle}
                    value={draft.discordUrl}
                    onChange={(e) => set("discordUrl", e.target.value)}
                    placeholder="https://discord.gg/..."
                  />
                </div>

                <div>
                  <label style={labelStyle}>Website URL</label>
                  <input
                    style={inputStyle}
                    value={draft.websiteUrl}
                    onChange={(e) => set("websiteUrl", e.target.value)}
                    placeholder="https://..."
                  />
                </div>

                <div>
                  <label style={labelStyle}>Instagram URL</label>
                  <input
                    style={inputStyle}
                    value={draft.instagramUrl}
                    onChange={(e) => set("instagramUrl", e.target.value)}
                    placeholder="https://instagram.com/..."
                  />
                </div>

                <div>
                  <label style={labelStyle}>LinkedIn URL</label>
                  <input
                    style={inputStyle}
                    value={draft.linkedinUrl}
                    onChange={(e) => set("linkedinUrl", e.target.value)}
                    placeholder="https://linkedin.com/..."
                  />
                </div>
              </div>
            </div>

            {err && (
              <div
                style={{
                  padding: "10px 14px",
                  background: "#fef2f2",
                  border: "1px solid #fecaca",
                  borderRadius: 10,
                  color: "#b91c1c",
                  fontSize: 13,
                  fontFamily: "Sarabun",
                }}
              >
                {err}
              </div>
            )}

            {msg && (
              <div
                style={{
                  padding: "10px 14px",
                  background: "#f0fdf4",
                  border: "1px solid #bbf7d0",
                  borderRadius: 10,
                  color: "#166534",
                  fontSize: 13,
                  fontFamily: "Sarabun",
                }}
              >
                {msg}
              </div>
            )}

            <div
              style={{
                display: "flex",
                gap: 12,
                marginTop: 8,
                flexWrap: "wrap",
                alignItems: "center",
              }}
            >
              <button
                type="submit"
                disabled={saving}
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  justifyContent: "center",
                  height: 40,
                  padding: "0 24px",
                  background: "#FDF0A6",
                  boxShadow: "0 2px 4px rgba(0, 0, 0, 0.1)",
                  borderRadius: 20,
                  color: "#000",
                  fontSize: 14,
                  fontFamily: "Sarabun",
                  fontWeight: "600",
                  border: "none",
                  cursor: saving ? "not-allowed" : "pointer",
                  opacity: saving ? 0.7 : 1,
                }}
              >
                {saving
                  ? "Saving..."
                  : clubId === "draft"
                    ? "Submit for Approval"
                    : "Save Changes"}
              </button>

              <Link
                href="/leader/dashboard"
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  justifyContent: "center",
                  height: 40,
                  padding: "0 20px",
                  background: "#f3f4f6",
                  borderRadius: 20,
                  color: "#374151",
                  fontSize: 14,
                  fontFamily: "Sarabun",
                  fontWeight: "600",
                  textDecoration: "none",
                }}
              >
                Cancel
              </Link>
            </div>
          </form>
        </div>
      </div>

      <Footer />
    </div>
  );
}
