"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { getSession } from "next-auth/react";
import Fuse from "fuse.js";

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

type ClubOption = { id: string; name: string; status: string };

export default function NewClubPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [contactName, setContactName] = useState("");
  const [contactEmail, setContactEmail] = useState("");
  const [communityType, setCommunityType] = useState("Campus_Department_Program");
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [allClubs, setAllClubs] = useState<ClubOption[]>([]);
  const [fuzzyMatches, setFuzzyMatches] = useState<ClubOption[]>([]);
  // const [fuzzyMatches, setFuzzyMatches] = useState<(ClubOption & { score: number })[]>([]);
  const popupRef = useRef<HTMLDivElement>(null);
  const [warningShown, setWarningShown] = useState(false);

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
        const derived = local.replace(/[._\-+]/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
        setContactName(derived);
      }
    })();

    // Pre-fetch all clubs for fuzzy matching
    fetch("/api/leader/clubs/check-duplicate")
      .then((r) => r.json())
      .then((data) => { if (data.clubs) setAllClubs(data.clubs); })
      .catch(() => {});
  }, []);

  const create = async (e: React.FormEvent) => {
    e.preventDefault();
    setErr(null);

    const trimmedName = name.trim();
    if (!trimmedName) { setErr("Community name is required."); return; }

    // If warning was already shown, proceed regardless
    if (warningShown) {
      proceedToCreate(trimmedName);
      return;
    }

    setSaving(true);

    const fuse = new Fuse(allClubs, { keys: ["name"], threshold:0.5, minMatchCharLength:2});
    const results = fuse.search(trimmedName).slice(0, 3).map((r) => r.item);

    // const results = fuse.search(trimmedName)
    // .filter((r) => (1 - (r.score ?? 0)) < 0.85) // drop anything scoring 85%+ unless it's a real match
    // .slice(0, 3)
    // .map((r) => ({ ...r.item, score: Math.round((1 - (r.score ?? 0)) * 100) }))
    // // .sort((a, b) => a.name.localeCompare(b.name));

    if (results.length > 0) {
      setSaving(false);
      setFuzzyMatches(results);
      setWarningShown(true);
      setTimeout(() => popupRef.current?.scrollIntoView({ behavior: "smooth", block: "nearest" }), 50);
      return;
    }

    proceedToCreate(trimmedName);
  };  

  const proceedToCreate = (trimmedName = name.trim()) => {
    setSaving(true);
    setFuzzyMatches([]);
    const draft = { name: trimmedName, contactName, contactEmail, communityType };
    localStorage.setItem("clubDraft", JSON.stringify(draft));
    router.push("/leader/clubs/draft/edit");
  };

  return (
    <main className="container clubCreate">
      <div className="row" style={{ justifyContent: "space-between" }}>
        <h1>Create New Community</h1>
        <div className="row">
          <Link className="btn" href="/leader/dashboard">Dashboard</Link>
          <Link className="btn" href="/directory">Directory</Link>
        </div>
      </div>

      <form className="card" style={{ marginTop: 14 }} onSubmit={create}>
        <label className="label">Community Name *</label>
        <input
          className="input"
          value={name}
          onChange={(e) => { setName(e.target.value); setFuzzyMatches([]); setWarningShown(false); }}
          required
        />

        {/* Fuzzy match popup */}
        {fuzzyMatches.length > 0 && (
          <div
            ref={popupRef}
            style={{
              marginTop: 10,
              padding: "14px 18px",
              background: "#FFFBEB",
              border: "1.5px solid rgba(251,191,36,0.5)",
              borderRadius: 14,
              boxShadow: "0 4px 16px rgba(251,191,36,0.13)",
              animation: "fadeSlideIn 0.18s ease-out",
            }}
          >
            <style>{`
              @keyframes fadeSlideIn {
                from { opacity: 0; transform: translateY(-6px); }
                to   { opacity: 1; transform: translateY(0); }
              }
            `}</style>
            <p style={{ margin: "0 0 0vh 0", fontSize: 14, fontFamily: "Sarabun", fontWeight: 600, color: "#92400E" }}>
              Were you looking for...
            </p>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 0 }}>
              {fuzzyMatches.map((club) => (
                <Link
                  key={club.id}
                  href={`/clubs/${club.id}`}
                  style={{
                    fontFamily: "Sarabun",
                    fontSize: 14,
                    fontWeight: 600,
                    color: "#2563EB",
                    textDecoration: "underline",
                    textUnderlineOffset: 2,
                    whiteSpace: "nowrap",
                  }}
                >
                  {club.name}
                  {/* <span style={{ marginLeft: 6, fontSize: 12, fontWeight: 400, color: "#92400E" }}>
                    {club.score}% match
                  </span> */}
                </Link>
              ))}
            </div>
          </div>
        )}

        <div style={{ height: 10 }} />

        <label className="label">Point of Contact Name *</label>
        <input className="input" value={contactName} onChange={(e) => setContactName(e.target.value)} required />

        <div style={{ height: 10 }} />

        <label className="label">Point of Contact Email *</label>
        <input className="input" type="email" value={contactEmail} onChange={(e) => setContactEmail(e.target.value)} required />

        <div style={{ height: 10 }} />

        <label className="label">Community type</label>
        <select className="input" value={communityType} onChange={(e) => setCommunityType(e.target.value)} required>
          {COMMUNITY_TYPE_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>{opt.label}</option>
          ))}
        </select>

        {err && <p className="small" style={{ marginTop: 10, color: "red" }}>{err}</p>}

        <div className="row" style={{ marginTop: 12 }}>
          <button
            className="btn btnPrimary"
            type="submit"
            disabled={saving}
            style={{ padding: "8px 16px", background: "#FDF0A6", border: "1px solid #FDF0A6", borderRadius: 20, color: "#000", fontFamily: "Sarabun", fontSize: 14, fontWeight: 600, lineHeight: "1", boxShadow: "0 6px 14px rgba(251,191,36,0.14)" }}
          >
            {saving ? "Checking..." : "Create"}
          </button>
          <Link
            className="btn btnPrimary"
            href="/leader/dashboard"
            style={{ padding: "8px 16px", background: "#FDF0A6", border: "1px solid #FDF0A6", borderRadius: 20, color: "#000", fontFamily: "Sarabun", fontSize: 14, fontWeight: 600, lineHeight: "1", textDecoration: "none", boxShadow: "0 6px 14px rgba(251,191,36,0.14)" }}
          >
            Cancel
          </Link>
        </div>
      </form>
    </main>
  );
}