"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { getSession } from "next-auth/react";
import Fuse from "fuse.js";
import Navbar from "@/app/components/Navbar";
import DecorativeBubbles from "@/app/components/DecorativeBubbles";

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

const STOPWORDS = /\b(club|org|organization|association|society|chapter|team|group|the|a|an|at|ucsc|uc)\b/g;

function normalize(s: string) {
  return s
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, "")
    .replace(STOPWORDS, "")
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .sort()
    .join(" ");
}

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
  const [isExactMatch, setIsExactMatch] = useState(false);
  const [session, setSession] = useState<any>(null);
  const popupRef = useRef<HTMLDivElement>(null);
  const [warningShown, setWarningShown] = useState(false);

  useEffect(() => {
    (async () => {
      const s = await getSession();
      setSession(s);
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

    const normalizedInput = normalize(trimmedName);

    // Stage 1: exact match on normalized names
    const exact = normalizedInput
      ? allClubs.filter((c) => normalize(c.name) === normalizedInput)
      : [];

    if (exact.length > 0) {
      setSaving(false);
      setFuzzyMatches(exact.slice(0, 3));
      setIsExactMatch(true);
      setWarningShown(true);
      setTimeout(() => popupRef.current?.scrollIntoView({ behavior: "smooth", block: "nearest" }), 50);
      return;
    }

    // Stage 2: fuzzy match on normalized names
    const normalizedClubs = allClubs.map((c) => ({ ...c, _normalized: normalize(c.name) }));
    const fuse = new Fuse(normalizedClubs, { keys: ["_normalized"], threshold: 0.35, minMatchCharLength: 2 });
    const fuzzy = fuse.search(normalizedInput).slice(0, 3).map((r) => r.item);

    if (fuzzy.length > 0) {
      setSaving(false);
      setFuzzyMatches(fuzzy);
      setIsExactMatch(false);
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

  const userRole = (session as any)?.role || (session as any)?.user?.role;
  const isAdmin = userRole === "admin";
  const isLeader = Boolean(session) && !isAdmin;

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
      <Navbar session={session} isAdmin={isAdmin} isLeader={isLeader} />

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
            maxWidth: 800,
            background: "white",
            borderRadius: 25,
            boxShadow: "0 4px 12px rgba(0, 0, 0, 0.08)",
            padding: "clamp(20px, 4vw, 40px)",
            display: "flex",
            flexDirection: "column",
          }}
        >
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
              Create New Community
            </h1>
            <p
              style={{
                color: "#6b7280",
                fontSize: 14,
                fontFamily: "Sarabun, sans-serif",
                margin: 0,
              }}
            >
              After creating, you will be redirected to edit the details.
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

          <form onSubmit={create}>
            <label className="label">Community Name *</label>
            <input
              className="input"
              value={name}
              onChange={(e) => {
                setName(e.target.value);
                setFuzzyMatches([]);
                setIsExactMatch(false);
                setWarningShown(false);
              }}
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
                <p
                  style={{
                    margin: "0 0 6px 0",
                    fontSize: 14,
                    fontFamily: "Sarabun",
                    fontWeight: 600,
                    color: "#92400E",
                  }}
                >
                  {isExactMatch
                    ? "This community already exists:"
                    : "Were you looking for..."}
                </p>
                <div
                  style={{
                    display: "flex",
                    flexWrap: "wrap",
                    gap: 8,
                    marginBottom: 0,
                  }}
                >
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
                    </Link>
                  ))}
                </div>
              </div>
            )}

            <div style={{ height: 16 }} />

            <label className="label">Point of Contact Name *</label>
            <input
              className="input"
              value={contactName}
              onChange={(e) => setContactName(e.target.value)}
              required
            />

            <div style={{ height: 16 }} />

            <label className="label">Point of Contact Email *</label>
            <input
              className="input"
              type="email"
              value={contactEmail}
              onChange={(e) => setContactEmail(e.target.value)}
              required
            />

            <div style={{ height: 16 }} />

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

            {err && (
              <p className="small" style={{ marginTop: 12, color: "#dc2626" }}>
                {err}
              </p>
            )}

            <div
              style={{
                display: "flex",
                gap: 12,
                alignItems: "center",
                marginTop: 26,
                flexWrap: "wrap",
              }}
            >
              <button
                type="submit"
                disabled={saving}
                style={{
                  padding: "9px 24px",
                  background: "#FDF0A6",
                  border: "1px solid #FDF0A6",
                  borderRadius: 20,
                  color: "#000",
                  fontFamily: "Sarabun",
                  fontSize: 14,
                  fontWeight: 600,
                  cursor: saving ? "not-allowed" : "pointer",
                  boxShadow: "0 4px 12px rgba(251,191,36,0.14)",
                  transition: "all 0.2s ease",
                }}
              >
                {saving ? "Checking..." : "Create"}
              </button>
              <Link
                href="/leader/dashboard"
                style={{
                  padding: "9px 24px",
                  background: "#E5E7EB",
                  border: "none",
                  borderRadius: 20,
                  color: "#000",
                  fontFamily: "Sarabun",
                  fontSize: 14,
                  fontWeight: 600,
                  textDecoration: "none",
                  cursor: "pointer",
                }}
              >
                Cancel
              </Link>
            </div>
          </form>
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