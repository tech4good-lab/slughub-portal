"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { getSession } from "next-auth/react";

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

export default function NewClubPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [contactName, setContactName] = useState("");
  const [contactEmail, setContactEmail] = useState("");

  // Initialized with a safe Prisma Enum
  const [communityType, setCommunityType] = useState(
    "Campus_Department_Program",
  );
  const [clubIcebreakers, setClubIcebreakers] = useState("");

  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      const s = await getSession();
      const email = (s as any)?.user?.email;
      const userName = (s as any)?.user?.name;
      if (email) setContactEmail(email);
      if (userName) {
        setContactName(userName);
      } else if (email) {
        const local = String(email).split("@")[0] || "";
        const derived = local
          .replace(/[._\-+]/g, " ")
          .replace(/\b\w/g, (c) => c.toUpperCase());
        setContactName(derived);
      }
    })();
  }, []);

  const create = async (e: React.FormEvent) => {
    e.preventDefault();
    setErr(null);
    setSaving(true);

    try {
      // 1. Pack up the data into a draft
      const draft = {
        name,
        contactName,
        contactEmail,
        communityType,
        clubIcebreakers,
      };

      // 2. Save it locally (NO backend API call yet!)
      localStorage.setItem("clubDraft", JSON.stringify(draft));

      // 3. Redirect to the Edit page to finish the process
      router.push("/leader/clubs/draft/edit");
    } catch (error) {
      setErr("Failed to save draft locally.");
      setSaving(false);
    }
  };

  return (
    <main className="container clubCreate">
      <div className="row" style={{ justifyContent: "space-between" }}>
        <h1>Create New Community</h1>
        <div className="row">
          <Link className="btn" href="/leader/dashboard">
            Dashboard
          </Link>
          <Link className="btn" href="/directory">
            Directory
          </Link>
        </div>
      </div>

      <form className="card" style={{ marginTop: 14 }} onSubmit={create}>
        <label className="label">Community Name *</label>
        <input
          className="input"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
        />

        <div style={{ height: 10 }} />

        <label className="label">Point of Contact Name *</label>
        <input
          className="input"
          value={contactName}
          onChange={(e) => setContactName(e.target.value)}
          required
        />

        <div style={{ height: 10 }} />

        <label className="label">Point of Contact Email *</label>
        <input
          className="input"
          type="email"
          value={contactEmail}
          onChange={(e) => setContactEmail(e.target.value)}
          required
        />

        <div style={{ height: 10 }} />

        <label className="label">Community type</label>
        <select
          className="input"
          value={communityType}
          onChange={(e) => setCommunityType(e.target.value)}
          required
        >
          {COMMUNITY_TYPE_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>

        <div style={{ height: 10 }} />

        <label className="label">Community Icebreakers</label>
        <textarea
          className="input"
          value={clubIcebreakers}
          onChange={(e) => setClubIcebreakers(e.target.value)}
          placeholder={
            "what would you like to learn from students attending your event?"
          }
          style={{ minHeight: 120 }}
        />

        {err && (
          <p className="small" style={{ marginTop: 10, color: "red" }}>
            {err}
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
            {saving ? "Creating Draft..." : "Create"}
          </button>
          <Link
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
            className="btn btnPrimary"
            href="/leader/dashboard"
          >
            Cancel
          </Link>
        </div>
      </form>
    </main>
  );
}
