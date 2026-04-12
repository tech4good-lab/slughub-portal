"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { Club } from "@prisma/client";

type Props = {
  clubs: Club[];
  session: any;
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

const STATUS_OPTIONS = [
  { label: "Unofficial", value: "unofficial" },
  { label: "Verified", value: "verified" },
] as const;

function normalizeValue(v: any) {
  return String(v ?? "").trim();
}

function normalizeList(input: any): string[] {
  if (Array.isArray(input)) {
    return input.map((v: any) => normalizeValue(v)).filter(Boolean);
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
        const statusValues = normalizeList(statusEntry?.[1]).map((v: any) =>
          v.toLowerCase(),
        );
        const typeValues = normalizeList(typeEntry?.[1]).map((v: any) =>
          v.toLowerCase(),
        );
        const typeSelectedNormalized = typeSelected.map((v: any) =>
          v.toLowerCase(),
        );

        const statusOk =
          statusSelected.length === 0 ||
          statusValues.some((v) => statusSelected.includes(v));
        if (!statusOk) return false;

        const typeOk =
          typeSelected.length === 0 ||
          typeValues.some((v) => typeSelectedNormalized.includes(v));
        if (!typeOk) return false;

        if (!q) return true;
        const name = String(c.name ?? "").toLowerCase();
        const description = String(c.description ?? "").toLowerCase();
        return name.includes(q) || description.includes(q);
      })
      .sort((a, b) => String(a.name ?? "").localeCompare(String(b.name ?? "")));
  }, [clubs, typeSelected, statusSelected, query]);

  const toggleType = (value: string) => {
    setTypeSelected((prev) =>
      prev.includes(value) ? prev.filter((v) => v !== value) : [...prev, value],
    );
  };

  const toggleStatus = (value: string) => {
    setStatusSelected((prev) =>
      prev.includes(value) ? prev.filter((v) => v !== value) : [...prev, value],
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
            placeholder="Search communities by name..."
            style={{ background: "#ffffff", fontWeight: 700, color: "#000" }}
          />
        </div>
        <details className="directoryDropdown" ref={typeDropdownRef}>
          <summary className="directoryDropdownSummary">
            <span>
              Community type
              {typeSelected.length > 0 && (
                <span style={{ fontWeight: 400, fontSize: "0.85em" }}> ({typeSelected.length})</span>
              )}
            </span>
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
            {COMMUNITY_TYPE_OPTIONS.map((cat: any) => (
              <label key={cat.value} className="directoryDropdownItem">
                <input
                  type="checkbox"
                  checked={typeSelected.includes(cat.value)}
                  onChange={() => toggleType(cat.value)}
                />
                {cat.label}
              </label>
            ))}
          </div>
        </details>
        <details className="directoryDropdown" ref={statusDropdownRef}>
          <summary className="directoryDropdownSummary">
            <span>
              Status
              {statusSelected.length > 0 && (
                <span style={{ fontWeight: 400, fontSize: "0.85em" }}> ({statusSelected.length})</span>
              )}
            </span>
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
            {STATUS_OPTIONS.map((status: any) => {
              const hint =
                status.value === "verified"
                  ? "A lead has taken ownership of this community and has curated the community's content"
                  : "This community is not registered with SOMeCA";
              return (
                <label key={status.value} className="directoryDropdownItem">
                  <input
                    type="checkbox"
                    checked={statusSelected.includes(status.value)}
                    onChange={() => toggleStatus(status.value)}
                    aria-label={`${status.label}. ${hint}`}
                  />
                  <span>{status.label}</span>
                  <span className="directoryDropdownHint">{hint}</span>
                </label>
              );
            })}
          </div>
        </details>
      </div>

      <div style={{ width: "100%" }}>
        <section>
          <div className="directoryGrid">
            {filtered.map((c: any) => (
              <Link
                key={c.id}
                href={`/clubs/${(c as any).clubId ?? c.id}`}
                className="card"
              >
                <div>
                  <h2 className="directoryCardTitle">{c.name}</h2>
                  <p
                    className="small"
                    style={{
                      margin: 0,
                      lineHeight: 1.6,
                      color: "rgba(0,0,0,0.6)",
                    }}
                  >
                    {(c.description ?? "").slice(0, 140) ||
                      "No description yet."}
                    {(c.description ?? "").length > 140 ? "..." : ""}
                  </p>
                </div>

                <div className="directoryCardLearn">Learn more ...</div>
              </Link>
            ))}
          </div>

          {filtered.length === 0 && (
            <div
              className="card"
              style={{ textAlign: "center", padding: "clamp(20px, 6vw, 60px)" }}
            >
              <h2 style={{ marginBottom: 8 }}>No communities yet</h2>
              <p className="small" style={{ margin: 0 }}>
                Be the first to register your community and start building connections.
              </p>
              {!session && (
                <Link
                  href="/login"
                  className="btn btnPrimary"
                  style={{ marginTop: 20, display: "inline-flex" }}
                >
                  Community Lead Login
                </Link>
              )}
            </div>
          )}

          {/* Credit */}
          <div style={{ marginTop: 36, textAlign: "center" }}>
            <p
              style={{
                fontSize: 16,
                fontWeight: 500,
                color: "rgba(0,0,0,0.6)",
                WebkitTextStroke: "0.4px black",
              }}
            >
              A project by the CommunityRAG team in the{" "}
              <a
                href="https://tech4good.soe.ucsc.edu/"
                target="_blank"
                rel="noreferrer"
                style={{
                  color: "#FDF0A6",
                  textDecoration: "none",
                  fontWeight: 600,
                  WebkitTextStroke: "0.4px black",
                }}
              >
                Tech4Good Lab
              </a>
            </p>
          </div>
        </section>
      </div>
    </>
  );
}
