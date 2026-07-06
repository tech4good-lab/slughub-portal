"use client";

import { useMemo, useState } from "react";
import DeleteClubButton from "./delete-club-button";
import Link from "next/link";

function StatusPill({ status }: { status?: any }) {
  const s = String(status ?? "").toLowerCase();
  const label = s || "unknown";

  const style: React.CSSProperties =
    s === "approved"
      ? {
          border: "1px solid rgba(34,197,94,0.35)",
          color: "rgba(34,197,94,0.95)",
        }
      : s === "pending"
        ? {
            border: "1px solid rgba(251,191,36,0.35)",
            color: "rgba(251,191,36,0.95)",
          }
        : s === "rejected"
          ? {
              border: "1px solid rgba(239,68,68,0.35)",
              color: "rgba(239,68,68,0.95)",
            }
          : {
              border: "1px solid rgba(255,255,255,0.2)",
              color: "rgba(255,255,255,0.75)",
            };

  return (
    <span
      className="small"
      style={{
        padding: "4px 10px",
        borderRadius: 999,
        textTransform: "capitalize",
        ...style,
      }}
    >
      {label}
    </span>
  );
}

const UPCOMING_THRESHOLD = 4;

function fuzzyScore(query: string, target: string): number | null {
  const q = query.trim().toLowerCase();
  const t = target.trim().toLowerCase();
  
  if (!q) return 0; // Empty query matches everything

  let runningScore = 0;
  let streakCounter = 0;
  let i = 0;
  let j = 0;

  while (i < t.length && j < q.length) {
    if (t[i] === q[j]) {
      streakCounter++;
      runningScore += streakCounter; // Increase score for consecutive matches
      j++;
    } else {
      streakCounter = 0;
    }
    i++;
  }

  return j === q.length ? runningScore : null; // Return null if not all query characters were matched
}

export default function ClubsSearchList({ 
    clubs, 
    eventsByClub,
    now,
    oneMonthOut,
}: { 
    clubs: any[];
    eventsByClub: Record<string, any[]>;
    now: Date;
    oneMonthOut: Date;
}) {
    const [query, setQuery] = useState("");

    const filteredClubs = useMemo(() => {
    if (!query.trim()) return clubs;
    return clubs
      .map((club) => {
        const score = fuzzyScore(query, club.name ?? "");
        return score !== null ? { club, score } : null;
      })
      .filter((item) => item !== null)
      .sort((a, b) => (b!.score - a!.score))
      .map((item) => item!.club);
    }, [query, clubs]);

      return (
    <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
      <div
        className="dashBoardSearchWrap"
        style={{ maxWidth: 400 }}
      >
        <input
          className="input"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search communities by name..."
          style={{ background: "#ffffff", border: "1px solid #bcb9b9",fontWeight: 700, color: "#000", zIndex: 1, position: "relative"}}
        />
      </div>

      {filteredClubs.length === 0 ? (
        <p style={{ color: "#666", fontSize: 14, fontFamily: "Sarabun", textAlign: "center", padding: "40px 20px" }}>
          {clubs.length === 0
            ? "You don't have any community access yet."
            : `No communities match "${query}".`}
        </p>
      ) : (
        filteredClubs.map((club: any) => {
          const cid = club.id;
          const events = eventsByClub[cid] ?? [];

          const upcoming = events.filter((e: any) => {
            const d = new Date(e.eventDate ?? "");
            if (Number.isNaN(d.getTime())) return true;
            return d >= now;
          });
          const past = events
            .filter((e: any) => new Date(e.eventDate) < now)
            .sort((a: any, b: any) => new Date(b.eventDate).getTime() - new Date(a.eventDate).getTime());

          const upcomingInNextMonth = upcoming.filter((e: any) => {
            const d = new Date(e.eventDate ?? "");
            return d <= oneMonthOut;
          });
          const hasManyUpcoming = upcomingInNextMonth.length >= UPCOMING_THRESHOLD;

          return (
            <div
              key={cid}
              style={{
                padding: "16px 20px",
                background: "#FAFAFA",
                borderRadius: 12,
                display: "flex",
                alignItems: "flex-start",
                justifyContent: "space-between",
                gap: 20,
                flexWrap: "wrap",
              }}
            >
              <div style={{ flex: "1 1 260px", minWidth: 0 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 6 }}>
                  <h3 style={{ fontSize: 16, fontFamily: "Sarabun", fontWeight: 600, margin: 0, color: "black" }}>
                    {club.name ?? "Untitled Community"}
                  </h3>
                  <StatusPill status={club.status} />
                </div>
                <p style={{ color: "#666", fontSize: 13, fontFamily: "Sarabun", margin: 0 }}>
                  {(club.description ?? "").slice(0, 140) || "Community description..."}
                  {(club.description ?? "").length > 140 ? "..." : ""}
                </p>
                <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginTop: 10 }}>
                  <Link
                    href={`/leader/clubs/${cid}/edit`}
                    style={{
                      padding: "8px 16px",
                      background: "#FDF0A6",
                      border: "1px solid #FDF0A6",
                      borderRadius: 20,
                      color: "#000",
                      fontSize: 14,
                      fontFamily: "Sarabun",
                      fontWeight: 600,
                      textDecoration: "none",
                      cursor: "pointer",
                      boxShadow: "0 6px 14px rgba(251,191,36,0.14)",
                      whiteSpace: "nowrap",
                    }}
                  >
                    Edit
                  </Link>
                  <Link
                    href={`/clubs/${club.id}`}
                    style={{
                      padding: "8px 16px",
                      background: "#FDF0A6",
                      border: "1px solid #FDF0A6",
                      borderRadius: 20,
                      color: "#000",
                      fontSize: 14,
                      fontFamily: "Sarabun",
                      fontWeight: 600,
                      textDecoration: "none",
                      cursor: "pointer",
                      boxShadow: "0 6px 14px rgba(251,191,36,0.14)",
                      whiteSpace: "nowrap",
                    }}
                  >
                    View Public
                  </Link>
                  <div style={{ flexShrink: 0 }}>
                    <DeleteClubButton clubId={cid} clubName={club.name} />
                  </div>
                </div>
              </div>

              <div style={{ flex: "1 1 25%",marginTop: 10, display: "flex", minWidth: 260, flexDirection: "column", gap: 6 }}>
                    <div style={{ fontSize: 12, fontWeight: 700, marginBottom: 6, color: "#111" }}>
                        Upcoming Events
                    </div>
                    {upcoming.length === 0 ? (
                        <div style={{ fontSize: 12, color: "#666" }}>No upcoming events</div>
                    ) : (
                        <>
                          {upcomingInNextMonth.slice(0, 4).map((e: any) => (
                            <div key={e.id} style={{ fontSize: 12, color: "#111", marginBottom: 6 }}>
                            <div
                                style={{
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "space-between",
                                gap: 8,
                                }}
                            >
                                <div style={{ fontWeight: 600 }}>
                                {e.eventTitle ?? e.name ?? "Untitled Event"}
                                </div>
                                <Link
                                href={`/leader/events/${e.id}/edit`}
                                style={{
                                    fontSize: 11,
                                    padding: "4px 8px",
                                    borderRadius: 999,
                                    background: "#E5E7EB",
                                    color: "#000",
                                    textDecoration: "none",
                                    whiteSpace: "nowrap",
                                }}
                                >
                                Edit
                                </Link>
                            </div>
                            <div style={{ color: "#666" }}>
                                {e.eventDate ? new Date(e.eventDate).toLocaleString() : "Date TBD"}
                            </div>
                            </div>
                        ))}
                        {upcomingInNextMonth.length > 4 && (
                            <div style={{ fontSize: 11, color: "#ebc325", cursor: "pointer" }}>
                                {upcomingInNextMonth.length - 4} more events later this month
                            </div>
                        )}
                      </>
                    )}
                    </div>
                </div>
            );
        })
      )}
    </div>
  );
}
    

    