"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import type { Club } from "@/lib/types";

type Props = {
  clubs: Club[];
  session: any;
};

const CATEGORY_OPTIONS = ["Club", "Org", "Unofficial", "Athletic"] as const;

function normalizeCategory(c: any) {
  return String(c ?? "").trim();
}

export default function DirectoryClient({ clubs, session }: Props) {
  const [selected, setSelected] = useState<string[]>([]);
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return clubs.filter((c: any) => {
      const catOk = selected.length === 0 || selected.includes(normalizeCategory((c as any).category));
      if (!catOk) return false;
      if (!q) return true;
      return String(c.name ?? "").toLowerCase().includes(q);
    });
  }, [clubs, selected, query]);

  const toggle = (cat: string) => {
    setSelected((prev) =>
      prev.includes(cat) ? prev.filter((v) => v !== cat) : [...prev, cat]
    );
  };

  return (
    <>
      <div style={{ marginTop: 6 }}>
        <p className="directorySubtitle" style={{ fontWeight: 700, fontSize: 16 }}>Search for a club by name</p>
        <input
          className="input"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search clubs..."
          aria-label="Search clubs by name"
          style={{ maxWidth: 520, background: "#ffffff", fontWeight: 700, color: "#000" }}
        />
        <hr />
      </div>

      <div className="directoryLayout">
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
          <div className="card" style={{ textAlign: "center", padding: 60 }}>
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
            Made with â¤ï¸ from the{" "}
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

      <aside className="filtersPanel">
        <div className="filtersHeader">
          <h3>Filters</h3>
          <button aria-label="clear filters" className="btn" style={{ padding: "6px 8px" }} onClick={() => setSelected([])}>
            Clear
          </button>
        </div>

        <div className="filtersList">
          {CATEGORY_OPTIONS.map((cat) => (
            <label key={cat} className="filterItem">
              <input
                type="checkbox"
                checked={selected.includes(cat)}
                onChange={() => toggle(cat)}
              />
              {cat}
            </label>
          ))}
        </div>
      </aside>
      </div>
    </>
  );
}
