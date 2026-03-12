"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import type { Club } from "@/lib/types";

type Props = {
  clubs: Club[];
  session: any;
};

const COMMUNITY_TYPE_OPTIONS = [
  "Campus Department/Program",
  "Professional and Career",
  "Performing and Visual Arts",
  "Cultural and Identity",
  "Greek-letter",
  "Academic",
  "Sports and Recreation",
  "Media and broadcasting",
  "Politics and Advocacy",
  "Research",
] as const;

const STATUS_OPTIONS = ["Verified", "Unofficial"] as const;

function normalizeValue(v: any) {
  return String(v ?? "").trim();
}

function normalizeList(input: any): string[] {
  if (Array.isArray(input)) {
    return input.map((v) => normalizeValue(v)).filter(Boolean);
  }
  const single = normalizeValue(input);
  return single ? [single] : [];
}



export default function DirectoryClient({ clubs, session }: Props) {
  const [typeSelected, setTypeSelected] = useState<string[]>([]);
  const [statusSelected, setStatusSelected] = useState<string[]>(["verified"]);
  const [query, setQuery] = useState("");
  const typeDropdownRef = useRef<HTMLDetailsElement | null>(null);
  const statusDropdownRef = useRef<HTMLDetailsElement | null>(null);

  useEffect(() => {
    function onDocClick(e: MouseEvent) {
      const target = e.target as Node;
      const typeEl = typeDropdownRef.current;
      const statusEl = statusDropdownRef.current;
      if (typeEl && typeEl.open && !typeEl.contains(target)) {
        typeEl.open = false;
      }
      if (statusEl && statusEl.open && !statusEl.contains(target)) {
        statusEl.open = false;
      }
    }

    document.addEventListener("mousedown", onDocClick);
    return () => document.removeEventListener("mousedown", onDocClick);
  }, []);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return clubs
    .filter((c: any) => {
      const fields = (c ?? {}) as Record<string, unknown>;
      const statusEntry = Object.entries(fields).find(([key]) => {
        const k = key.trim().toLowerCase().replace(/\s+/g, "");
        return k === "communitystatus";
      });
      const typeEntry = Object.entries(fields).find(([key]) => {
        const k = key.trim().toLowerCase().replace(/\s+/g, "");
        return k === "communitytype";
      });
      let statusValues = normalizeList(statusEntry?.[1]).map((v) => v.toLowerCase());
      const typeValues = normalizeList(typeEntry?.[1]).map((v) => v.toLowerCase());
      const typeSelectedNormalized = typeSelected.map((v) => v.toLowerCase());

      if (statusValues.length === 0) {
        const verificationEntry = Object.entries(fields).find(([key]) => {
          const k = key.trim().toLowerCase();
          return k === "verification" || k === "verified";
        });
        const verificationValue = String(verificationEntry?.[1] ?? "").trim().toLowerCase();
        const clubIdValue = String(fields.clubId ?? fields.ClubId ?? "").trim();
        const isVerified = verificationValue === "verified" || clubIdValue.length > 0;
        statusValues = [isVerified ? "Verified" : "Unofficial"];
      }

      const statusOk =
        statusSelected.length === 0 ||
        statusValues.some((v) => statusSelected.includes(v));
      if (!statusOk) return false;

      const typeOk =
        typeSelected.length === 0 ||
        typeValues.some((v) => typeSelectedNormalized.includes(v));
      if (!typeOk) return false;

      if (!q) return true;
      return String(c.name ?? "").toLowerCase().includes(q);
    })
    .sort((a,b) =>
    String(a.name ?? "").localeCompare(String(b.name ?? ""))
    );
  }, [clubs, typeSelected, statusSelected, query]);

  const toggleType = (value: string) => {
    setTypeSelected((prev) =>
      prev.includes(value) ? prev.filter((v) => v !== value) : [...prev, value]
    );
  };

  const toggleStatus = (value: string) => {
    setStatusSelected((prev) =>
      prev.includes(value) ? prev.filter((v) => v !== value) : [...prev, value]
    );
  };

  return (
    <>


      <div className="directoryToolbar">
        <div className="directorySearchWrap">
          <input
            className="input"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search clubs by name..."
            style={{ background: "#ffffff", fontWeight: 700, color: "#000" }}
          />
        </div>
        <details className="directoryDropdown" ref={typeDropdownRef}>
          <summary className="directoryDropdownSummary">
            <span>Community type</span>
          </summary>
          <div className="directoryDropdownMenu">
            <button
              className="directoryDropdownClear"
              type="button"
              onClick={(e) => {
                e.preventDefault();
                setTypeSelected([]);
              }}
            >
              Clear
            </button>
            {COMMUNITY_TYPE_OPTIONS.map((cat) => (
              <label key={cat} className="directoryDropdownItem">
                <input
                  type="checkbox"
                  checked={typeSelected.includes(cat)}
                  onChange={() => toggleType(cat)}
                />
                {cat}
              </label>
            ))}
          </div>
        </details>
        <details className="directoryDropdown" ref={statusDropdownRef}>
          <summary className="directoryDropdownSummary">
            <span>Status</span>
          </summary>
          <div className="directoryDropdownMenu">
            <button
              className="directoryDropdownClear"
              type="button"
              onClick={(e) => {
                e.preventDefault();
                setStatusSelected([]);
              }}
            >
              Clear
            </button>
            {STATUS_OPTIONS.map((status) => (
              <label key={status} className="directoryDropdownItem">
                <input
                  type="checkbox"
                  checked={statusSelected.includes(status)}
                  onChange={() => toggleStatus(status)}
                />
                {status}
              </label>
            ))}
          </div>
        </details>
      </div>

      <div style={{width:"100%"}}>
      <section>
        <div className="directoryGrid">
          {filtered.map((c) => (
            <Link
              key={c.recordId}
              href={`/clubs/${(c as any).clubId ?? c.recordId}`}
              className="card"
            >
              <div>
                <h2 className="directoryCardTitle">{c.name}</h2>
                <p className="small" style={{ margin: 0, lineHeight: 1.6, color: "rgba(0,0,0,0.6)" }}>
                  {(c.description ?? "").slice(0, 140) || "No description yet."}
                  {(c.description ?? "").length > 140 ? "..." : ""}
                </p>
              </div>

              <div className="directoryCardLearn">Learn more ...</div>
            </Link>
          ))}
        </div>

        {filtered.length === 0 && (
          <div className="card" style={{ textAlign: "center", padding: "clamp(20px, 6vw, 60px)" }}>
            <h2 style={{ marginBottom: 8 }}>No clubs yet</h2>
            <p className="small" style={{ margin: 0 }}>
              Be the first to register your club and start building community.
            </p>
            {!session && (
              <Link href="/signup" className="btn btnPrimary" style={{ marginTop: 20, display: "inline-flex" }}>
                Register Your Club
              </Link>
            )}
          </div>
        )}

        {/* Credit */}
        <div style={{ marginTop: 36, textAlign: "center" }}>
          <p style={{ fontSize: 16, fontWeight: 500, color: "rgba(0,0,0,0.6)" }}>
            Made with ❤️ from the{" "}
            <a
              href="https://tech4good.soe.ucsc.edu/"
              target="_blank"
              rel="noreferrer"
              style={{ color: "rgba(251,191,36,0.9)", textDecoration: "none", fontWeight: 600 }}
            >
              CommunityRAG Team
            </a>
          </p>
        </div>
      </section>
      </div>
    </>
  );
}
