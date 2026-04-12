"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { Club } from "@prisma/client";

type ClubDraft = {
  name: string;
  description: string;
  clubIcebreakers: string;
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
  clubIcebreakers: "",
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
        setErr("Forbidden: you don’t have access to edit this community.");
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
          clubIcebreakers: club.clubIcebreakers ?? "",
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

    const endpoint =
      clubId === "draft" ? "/api/leader/clubs" : `/api/leader/clubs/${clubId}`;

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

    if (clubId === "draft") {
      try {
        localStorage.removeItem("clubDraft");
      } catch {
        // ignore
      }
      setMsg("Submitted! Your new community is pending admin approval.");
    } else {
      setMsg("Submitted! Your changes are pending admin approval.");
    }

    setSaving(false);

    router.push("/leader/dashboard");
    router.refresh();
  };

  if (loading) {
    return (
      <main className="container clubEdit">
        <div className="card">
          <p className="small">Loading...</p>
        </div>
      </main>
    );
  }

  return (
    <main className="container clubEdit">
      <div className="row" style={{ justifyContent: "space-between" }}>
        <h1>Edit Community Profile</h1>
        <div className="row">
          <Link className="btn" href="/leader/dashboard">
            Dashboard
          </Link>
          <Link className="btn" href="/">
            Directory
          </Link>
        </div>
      </div>

      <form className="card" style={{ marginTop: 14 }} onSubmit={onSave}>
        <label className="label">Community Name *</label>
        <input
          className="input"
          value={draft.name}
          onChange={(e) => set("name", e.target.value)}
        />

        <div style={{ height: 10 }} />

        <label className="label">Description *</label>
        <textarea
          required
          className="input"
          rows={4}
          value={draft.description}
          onChange={(e) => set("description", e.target.value)}
        />

        <div style={{ height: 10 }} />

        <label className="label">Community Icebreakers</label>
        <textarea
          className="input"
          value={draft.clubIcebreakers}
          onChange={(e) => set("clubIcebreakers", e.target.value)}
          placeholder={
            "what would you like to learn from students attending your event?"
          }
          style={{ minHeight: 120 }}
        />

        <hr />

        <label className="label">Point of Contact Name *</label>
        <input
          className="input"
          value={draft.contactName}
          onChange={(e) => set("contactName", e.target.value)}
          required
        />

        <div style={{ height: 10 }} />

        <label className="label">Point of Contact Email *</label>
        <input
          className="input"
          value={draft.contactEmail}
          onChange={(e) => set("contactEmail", e.target.value)}
          required
        />

        <div style={{ height: 10 }} />

        <label className="label">Community type</label>
        <select
          className="input"
          value={draft.communityType}
          onChange={(e) => set("communityType", e.target.value)}
          required
        >
          {COMMUNITY_TYPE_OPTIONS.map((opt: any) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>

        <hr />

        <label className="label">Calendar URL</label>
        <input
          className="input"
          value={draft.calendarUrl}
          onChange={(e) => set("calendarUrl", e.target.value)}
          placeholder="https://..."
        />

        <div style={{ height: 10 }} />

        <label className="label">Discord URL</label>
        <input
          className="input"
          value={draft.discordUrl}
          onChange={(e) => set("discordUrl", e.target.value)}
          placeholder="https://..."
        />

        <div style={{ height: 10 }} />

        <label className="label">Website URL</label>
        <input
          className="input"
          value={draft.websiteUrl}
          onChange={(e) => set("websiteUrl", e.target.value)}
          placeholder="https://..."
        />

        <div style={{ height: 10 }} />

        <label className="label">Instagram URL</label>
        <input
          className="input"
          value={draft.instagramUrl}
          onChange={(e) => set("instagramUrl", e.target.value)}
          placeholder="https://..."
        />

        <div style={{ height: 10 }} />

        <label className="label">LinkedIn URL</label>
        <input
          className="input"
          value={draft.linkedinUrl}
          onChange={(e) => set("linkedinUrl", e.target.value)}
          placeholder="https://..."
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
            type="submit"
            disabled={saving}
            style={{
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
            }}
          >
            {saving ? "Submitting..." : "Submit for Approval"}
          </button>
          <Link
            role="button"
            className="btn btnPrimary"
            style={{
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
            }}
            href="/leader/dashboard"
          >
            Cancel
          </Link>
        </div>

        <p className="small" style={{ marginTop: 10 }}>
          Tip: include full URLs with https://
        </p>
      </form>
    </main>
  );
}
