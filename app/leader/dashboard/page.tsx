import Link from "next/link";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import EventsCacheClient from "@/app/components/EventsCacheClient";
import ClubsCacheClient from "@/app/components/ClubsCacheClient";
import LogoutButton from "@/app/leader/edit/logout-button";
import DeleteClubButton from "./delete-club-button";

export const dynamic = "force-dynamic";

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

export default async function LeaderDashboard() {
  const session = await getServerSession(authOptions);
  const userId = (session as any)?.userId;
  const role = (session as any)?.role;

  if (!userId) redirect("/login");

  const isAdmin = role === "admin";

  let clubs: any[] = [];
  let eventsByClub: Record<string, any[]> = {};

  try {
    const userMemberships = await prisma.clubMember.findMany({
      where: { userId: userId },
      include: {
        club: {
          include: {
            events: {
              orderBy: { eventDate: "desc" },
            },
          },
        },
      },
    });

    for (const membership of userMemberships) {
      if (membership.club) {
        const club = membership.club;

        clubs.push(club);

        eventsByClub[club.id] = club.events.map((event: any) => ({
          ...event,
        }));
      }
    }

    clubs.sort((a, b) => b.updatedAt.getTime() - a.updatedAt.getTime());
  } catch (error) {
    console.error("Prisma Error loading Leader Dashboard:", error);
  }

  return (
    <div
      className="leaderDashboard"
      style={{
        minHeight: "100dvh",
        background: "rgb(237, 244, 255)",
        overflow: "auto",
        display: "flex",
        flexDirection: "column",
        padding: "clamp(12px, 3vw, 20px)",
      }}
    >
      <ClubsCacheClient clubs={clubs as any[]} />
      <EventsCacheClient events={Object.values(eventsByClub).flat() as any[]} />
      {/* Decorative bubbles */}
      <div
        style={{
          position: "absolute",
          width: 60,
          height: 60,
          left: "10%",
          top: "5%",
          opacity: 0.4,
          background: "#D0E2FF",
          borderRadius: "50%",
        }}
      />
      <div
        style={{
          position: "absolute",
          width: 30,
          height: 30,
          left: "65%",
          top: "3%",
          opacity: 0.5,
          background: "#FDF0A6",
          borderRadius: "50%",
        }}
      />
      <div
        style={{
          position: "absolute",
          width: 50,
          height: 50,
          left: "75%",
          top: "12%",
          opacity: 0.3,
          background: "#D0E2FF",
          borderRadius: "50%",
        }}
      />
      <div
        style={{
          position: "absolute",
          width: 70,
          height: 70,
          left: "80%",
          top: "55%",
          opacity: 0.4,
          background: "#D0E2FF",
          borderRadius: "50%",
        }}
      />
      <div
        style={{
          position: "absolute",
          width: 35,
          height: 35,
          left: "85%",
          top: "75%",
          opacity: 0.5,
          background: "#FDF0A6",
          borderRadius: "50%",
        }}
      />
      <div
        style={{
          position: "absolute",
          width: 25,
          height: 25,
          left: "15%",
          top: "80%",
          opacity: 0.4,
          background: "#D0E2FF",
          borderRadius: "50%",
        }}
      />

      {/* Main card container */}
      <div
        style={{
          flex: 1,
          display: "flex",
          justifyContent: "center",
          position: "relative",
          zIndex: 10,
          minHeight: 0,
        }}
      >
        <div
          style={{
            width: "100%",
            maxWidth: 900,
            background: "white",
            borderRadius: 25,
            boxShadow: "0 4px 12px rgba(0, 0, 0, 0.1)",
            padding: "clamp(16px, 4vw, 40px)",
            display: "flex",
            flexDirection: "column",
          }}
        >
          {/* Header */}
          <header
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: 10,
              flexWrap: "wrap",
              gap: 16,
            }}
          >
            <div>
              <h1
                style={{
                  margin: 0,
                  color: "black",
                  fontSize: "clamp(24px, 5vw, 32px)",
                }}
              >
                Leader Dashboard
              </h1>
            </div>

            {/* Nav requires scrolling on mobile/smaller devices */}
            <nav
              className="row"
              style={{
                display: "flex",
                alignItems: "center",
                gap: "12px",
                flexWrap: "nowrap",
                overflowX: "auto",
                paddingBottom: "4px",
              }}
            >
              {isAdmin && (
                <div
                  style={{ display: "flex", alignItems: "center", gap: "12px" }}
                >
                  <Link
                    className="btn"
                    href="/admin/review"
                    style={{ whiteSpace: "nowrap", flexShrink: 0 }}
                  >
                    Community Approvals
                  </Link>
                  <Link
                    className="btn"
                    href="/admin/access"
                    style={{ whiteSpace: "nowrap", flexShrink: 0 }}
                  >
                    Access Requests
                  </Link>
                </div>
              )}
              <Link
                className="btn"
                href="/directory"
                style={{ whiteSpace: "nowrap", flexShrink: 0 }}
              >
                Directory
              </Link>
              <div style={{ flexShrink: 0 }}>
                <LogoutButton />
              </div>
            </nav>
          </header>

          {/* Logged in info and divider */}
          <div style={{ marginBottom: 24 }}>
            <p
              style={{
                color: "black",
                fontSize: 14,
                fontFamily: "Sarabun",
                margin: "0 0 12px 0",
              }}
            >
              Logged in as: {session?.user?.email}
            </p>
            <div
              style={{ width: "100%", height: 0.5, background: "#333333" }}
            />
          </div>

          {/* Section header*/}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              marginBottom: 30,
              flexWrap: "wrap",
              gap: 12,
            }}
          >
            <h2
              style={{
                fontSize: 24,
                fontFamily: "Sarabun",
                fontWeight: 700,
                margin: 0,
                color: "black",
              }}
            >
              My Communities
            </h2>
            <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
              <Link
                href="/leader/events/new"
                style={{
                  padding: "8px 20px",
                  background: "#E5E7EB",
                  border: "none",
                  borderRadius: 20,
                  color: "black",
                  fontSize: 14,
                  fontFamily: "Sarabun",
                  fontWeight: 600,
                  textDecoration: "none",
                  cursor: "pointer",
                  whiteSpace: "nowrap",
                  flexShrink: 0,
                }}
              >
                Create Event
              </Link>
              <Link
                href="/leader/clubs/new"
                style={{
                  padding: "8px 20px",
                  background: "#FDF0A6",
                  border: "none",
                  borderRadius: 20,
                  color: "black",
                  fontSize: 14,
                  fontFamily: "Sarabun",
                  fontWeight: 600,
                  textDecoration: "none",
                  cursor: "pointer",
                  whiteSpace: "nowrap",
                  flexShrink: 0,
                }}
              >
                Create New Community
              </Link>
            </div>
          </div>

          {/* Clubs list */}
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: 12,
              flex: 1,
              overflow: "auto",
            }}
          >
            {clubs.length === 0 ? (
              <p
                style={{
                  color: "#666",
                  fontSize: 14,
                  fontFamily: "Sarabun",
                  textAlign: "center",
                  padding: "40px 20px",
                }}
              >
                You don't have any community access yet.
              </p>
            ) : (
              clubs.map((club: any) => {
                const cid = club.id;
                const events = eventsByClub[cid] ?? [];
                const now = new Date();
                const upcoming = events.filter((e: any) => {
                  const d = new Date(e.eventDate ?? "");
                  if (Number.isNaN(d.getTime())) return true;
                  return d >= now;
                });
                const past = events.filter((e: any) => {
                  const d = new Date(e.eventDate ?? "");
                  if (Number.isNaN(d.getTime())) return false;
                  return d < now;
                });
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
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: 12,
                          marginBottom: 6,
                        }}
                      >
                        <h3
                          style={{
                            fontSize: 16,
                            fontFamily: "Sarabun",
                            fontWeight: 600,
                            margin: 0,
                            color: "black",
                          }}
                        >
                          {club.name ?? "Untitled Community"}
                        </h3>
                        <StatusPill status={club.status} />
                      </div>
                      <p
                        style={{
                          color: "#666",
                          fontSize: 13,
                          fontFamily: "Sarabun",
                          margin: 0,
                        }}
                      >
                        {(club.description ?? "").slice(0, 140) ||
                          "Community description..."}
                        {(club.description ?? "").length > 140 ? "..." : ""}
                      </p>
                      <div
                        style={{
                          display: "flex",
                          gap: 10,
                          flexWrap: "wrap",
                          marginTop: 10,
                        }}
                      >
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

                    <details
                      style={{
                        flex: "1 1 220px",
                        minWidth: 0,
                        width: "100%",
                        maxWidth: 320,
                      }}
                    >
                      <summary
                        style={{
                          listStyle: "none",
                          cursor: "pointer",
                          padding: "6px 14px",
                          borderRadius: 999,
                          background: "#FDF0A6",
                          color: "#000",
                          fontSize: 13,
                          fontFamily: "Sarabun",
                          fontWeight: 600,
                          textAlign: "center",
                        }}
                      >
                        Events
                      </summary>
                      <div style={{ marginTop: 10 }}>
                        <div
                          style={{
                            fontSize: 12,
                            fontWeight: 700,
                            marginBottom: 6,
                            color: "#111",
                          }}
                        >
                          Upcoming
                        </div>
                        {upcoming.length === 0 ? (
                          <div style={{ fontSize: 12, color: "#666" }}>
                            No upcoming events
                          </div>
                        ) : (
                          upcoming.slice(0, 4).map((e: any) => (
                            <div
                              key={e.id}
                              style={{
                                fontSize: 12,
                                color: "#111",
                                marginBottom: 6,
                              }}
                            >
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
                                {e.eventDate
                                  ? new Date(e.eventDate).toLocaleString()
                                  : "Date TBD"}
                              </div>
                            </div>
                          ))
                        )}
                      </div>
                      <div style={{ marginTop: 10 }}>
                        <div
                          style={{
                            fontSize: 12,
                            fontWeight: 700,
                            marginBottom: 6,
                            color: "#111",
                          }}
                        >
                          Past
                        </div>
                        {past.length === 0 ? (
                          <div style={{ fontSize: 12, color: "#666" }}>
                            No past events
                          </div>
                        ) : (
                          past.slice(0, 4).map((e: any) => (
                            <div
                              key={e.recordId}
                              style={{
                                fontSize: 12,
                                color: "#111",
                                marginBottom: 6,
                              }}
                            >
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
                                {e.eventDate
                                  ? new Date(e.eventDate).toLocaleString()
                                  : "Date TBD"}
                              </div>
                            </div>
                          ))
                        )}
                      </div>
                    </details>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>

      {/* Footer */}
      <div
        style={{
          textAlign: "center",
          fontSize: 14,
          fontFamily: "Sarabun",
          color: "#333",
          marginTop: 20,
          position: "relative",
          zIndex: 10,
          WebkitTextStroke: "0.4px black",
        }}
      >
        A{" "}
        <a
          href="https://tech4good.soe.ucsc.edu/"
          target="_blank"
          rel="noreferrer"
          style={{
            color: "#FDF0A6",
            textDecoration: "underline",
            WebkitTextStroke: "0.4px black",
          }}
        >
          Tech4Good
        </a>{" "}
        project
      </div>
    </div>
  );
}
