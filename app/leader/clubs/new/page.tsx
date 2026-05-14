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

type DuplicateInfo = {
  id: string;
  name: string;
  status: string;
};

export default function NewClubPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [contactName, setContactName] = useState("");
  const [contactEmail, setContactEmail] = useState("");

  const [communityType, setCommunityType] = useState(
    "Campus_Department_Program",
  );
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  // Duplicate-check state
  const [duplicate, setDuplicate] = useState<DuplicateInfo | null>(null);
  const [checking, setChecking] = useState(false);

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

  // Clear duplicate warning whenever the name field changes
  useEffect(() => {
    setDuplicate(null);
    setErr(null);
  }, [name]);

  /**
   * Checks whether a club with this name already exists.
   * Returns the duplicate info if found, or null if the name is free.
   */
  async function checkDuplicate(clubName: string): Promise<DuplicateInfo | null> {
    const res = await fetch(
      `/api/leader/clubs/check-duplicate?name=${encodeURIComponent(clubName)}`,
    );
    if (!res.ok) return null; // treat check failure as non-blocking
    const data = await res.json();
    return data.duplicate ? (data.club as DuplicateInfo) : null;
  }

  const create = async (e: React.FormEvent) => {
    e.preventDefault();
    setErr(null);
    setDuplicate(null);

    const trimmedName = name.trim();
    if (!trimmedName) {
      setErr("Community name is required.");
      return;
    }

    setSaving(true);
    setChecking(true);

    try {
      const found = await checkDuplicate(trimmedName);
      setChecking(false);

      if (found) {
        // Surface the duplicate warning and stop here — do NOT write the draft
        setDuplicate(found);
        setSaving(false);
        return;
      }

      // Name is unique — save draft locally and continue to the full edit form
      const draft = {
        name: trimmedName,
        contactName,
        contactEmail,
        communityType,
      };

      localStorage.setItem("clubDraft", JSON.stringify(draft));
      router.push("/leader/clubs/draft/edit");
    } catch {
      setChecking(false);
      setSaving(false);
      setErr("Failed to check for duplicates. Please try again.");
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

        {/* ── Duplicate warning ── */}
        {duplicate && (
          <div
            style={{
              marginTop: 12,
              padding: "14px 16px",
              background: "#FEF3C7",
              border: "1px solid #FCD34D",
              borderRadius: 12,
              display: "flex",
              flexDirection: "column",
              gap: 8,
            }}
          >
            <p
              style={{
                margin: 0,
                fontSize: 14,
                fontFamily: "Sarabun",
                fontWeight: 600,
                color: "#92400E",
              }}
            >
              A community named &ldquo;{duplicate.name}&rdquo; already exists
              {duplicate.status === "approved"
                ? " and is live in the directory"
                : duplicate.status === "pending"
                  ? " and is pending approval"
                  : ""}.
            </p>
            <p
              style={{
                margin: 0,
                fontSize: 13,
                fontFamily: "Sarabun",
                color: "#78350F",
              }}
            >
              If you are a leader of this community, you can request edit
              access instead of creating a duplicate.
            </p>
            <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginTop: 4 }}>
              <Link
                href={`/clubs/${duplicate.id}`}
                style={{
                  padding: "7px 16px",
                  background: "#FDF0A6",
                  border: "1px solid #FCD34D",
                  borderRadius: 20,
                  color: "#000",
                  fontSize: 13,
                  fontFamily: "Sarabun",
                  fontWeight: 600,
                  textDecoration: "none",
                  boxShadow: "0 4px 10px rgba(251,191,36,0.18)",
                  whiteSpace: "nowrap",
                }}
              >
                View community &amp; request access →
              </Link>
              <button
                type="button"
                onClick={() => {
                  setDuplicate(null);
                  setName("");
                }}
                style={{
                  padding: "7px 16px",
                  background: "transparent",
                  border: "1px solid rgba(146,64,14,0.3)",
                  borderRadius: 20,
                  color: "#92400E",
                  fontSize: 13,
                  fontFamily: "Sarabun",
                  fontWeight: 600,
                  cursor: "pointer",
                  whiteSpace: "nowrap",
                }}
              >
                Use a different name
              </button>
            </div>
          </div>
        )}

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
          {COMMUNITY_TYPE_OPTIONS.map((opt: any) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>

        <div style={{ height: 10 }} />

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
            {checking ? "Checking..." : saving ? "Creating Draft..." : "Create"}
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